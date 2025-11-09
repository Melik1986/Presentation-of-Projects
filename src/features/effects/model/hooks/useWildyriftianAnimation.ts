'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

import { PRELOADER_COMPLETE_EVENT } from '@/features/preloader';

import { getPreviewRotation, supportsHover } from '../utils';

import type { RefObject } from 'react';

/**
 * Hook for setting up Wildyriftian hover animations (DESKTOP ONLY)
 * Mobile uses React state + manual GSAP.to() calls
 * Pattern from official GSAP docs: Timeline + play/reverse for hover
 */
export function useWildyriftianAnimation(containerRef: RefObject<HTMLDivElement | null>): void {
  useGSAP(
    () => {
      const container = containerRef.current;
      if (!container) return;

      const folders = gsap.utils.toArray<HTMLElement>('.folder');
      const wrappers = gsap.utils.toArray<HTMLElement>('.folder-wrapper');

      // Initial reveal: folders slide up from bottom (drawer effect)
      // Triggered after preloader completes
      const revealFolders = () => {
        gsap.from(folders, {
          y: 100,
          opacity: 0,
          duration: 0.6,
          ease: 'power2.out',
          stagger: 0.15,
          delay: 1.5,
        });
      };

      document.addEventListener(PRELOADER_COMPLETE_EVENT, revealFolders, { once: true });

      // Proper touch detection (Web standards)
      // https://developer.mozilla.org/en-US/docs/Web/CSS/@media/hover
      const hasHoverSupport = supportsHover();
      const isPointerCoarse = window.matchMedia('(pointer: coarse)').matches;

      // Only setup hover animations if device supports hover and NOT touch
      if (!hasHoverSupport || isPointerCoarse) {
        // Mobile: only cleanup event listener (useGSAP сам управляет cleanup)
        return () => {
          document.removeEventListener(PRELOADER_COMPLETE_EVENT, revealFolders);
        };
      }

      // Set initial state for desktop
      gsap.set(wrappers, { y: 25 });

      // WeakMap для хранения таймлайнов (автоматическая очистка при удалении из DOM)
      const folderTimelines = new WeakMap<HTMLElement, gsap.core.Timeline>();

      // Массив обработчиков для cleanup
      const handlers: Array<{ folder: HTMLElement; enter: () => void; leave: () => void }> = [];

      folders.forEach((folder, index) => {
        const wrapper = wrappers[index];
        const previewImages = gsap.utils.toArray<HTMLElement>(
          folder.querySelectorAll('.folder-preview-img')
        );

        if (!wrapper) return;

        // Create timeline (paused) for this folder
        const tl = gsap.timeline({ paused: true });

        // Animate wrapper (15% higher than before)
        tl.to(
          wrapper,
          {
            y: -3.75,
            duration: 0.4,
            ease: 'back.out(1.5)',
          },
          0
        );

        // Animate preview images with premium wave stagger (higher + bigger)
        tl.to(
          previewImages,
          {
            y: '-125%',
            scale: 1.18,
            rotation: (i) => getPreviewRotation(i),
            duration: 0.55,
            ease: 'back.out(1.7)',
            stagger: {
              amount: -0.2,
              from: 'center',
              ease: 'power2.inOut',
            },
          },
          0.1
        );

        // Disable sibling folders on hover
        const handleEnter = () => {
          folders.forEach((f) => {
            if (f !== folder) {
              f.classList.add('disabled');
            }
          });
          tl.play();
        };

        const handleLeave = () => {
          folders.forEach((f) => f.classList.remove('disabled'));
          tl.reverse();
        };

        // Сохраняем в WeakMap для автоматической очистки таймлайнов
        folderTimelines.set(folder, tl);
        handlers.push({ folder, enter: handleEnter, leave: handleLeave });

        // Desktop: mouse events (useGSAP сам управляет cleanup через возвращаемую функцию)
        folder.addEventListener('mouseenter', handleEnter);
        folder.addEventListener('mouseleave', handleLeave);
      });

      // Desktop: cleanup (useGSAP сам вызовет эту функцию при размонтировании)
      return () => {
        document.removeEventListener(PRELOADER_COMPLETE_EVENT, revealFolders);
        handlers.forEach(({ folder, enter, leave }) => {
          folder.removeEventListener('mouseenter', enter);
          folder.removeEventListener('mouseleave', leave);
        });
      };
    },
    {
      scope: containerRef,
      dependencies: [], // Explicitly prevent re-runs (Point #2 fix)
    }
  );
}
