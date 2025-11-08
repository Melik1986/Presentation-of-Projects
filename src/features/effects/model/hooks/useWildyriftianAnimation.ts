'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

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
      // Proper touch detection (Web standards)
      // https://developer.mozilla.org/en-US/docs/Web/CSS/@media/hover
      const hasHoverSupport = supportsHover();
      const isPointerCoarse = window.matchMedia('(pointer: coarse)').matches;
      
      // Only setup hover animations if device supports hover and NOT touch
      if (!hasHoverSupport || isPointerCoarse) {
        return;
      }

      const folders = gsap.utils.toArray<HTMLElement>('.folder');
      const wrappers = gsap.utils.toArray<HTMLElement>('.folder-wrapper');

      // Set initial state for desktop
      gsap.set(wrappers, { y: 25 });

      folders.forEach((folder, index) => {
        const wrapper = wrappers[index];
        const previewImages = gsap.utils.toArray<HTMLElement>(
          folder.querySelectorAll('.folder-preview-img')
        );

        if (!wrapper) return;

        // Create timeline (paused) for this folder
        const tl = gsap.timeline({ paused: true });

        // Animate wrapper
        tl.to(
          wrapper,
          {
            y: 0,
            duration: 0.25,
            ease: 'back.out(1.7)',
          },
          0
        );

        // Animate preview images with stagger
        previewImages.forEach((img, i) => {
          const rotation = getPreviewRotation(i);

          tl.to(
            img,
            {
              y: '-100%',
              rotation: rotation,
              duration: 0.25,
              ease: 'back.out(1.7)',
            },
            i * 0.025 // stagger
          );
        });

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

        // Desktop: mouse events
        folder.addEventListener('mouseenter', handleEnter);
        folder.addEventListener('mouseleave', handleLeave);
      });
    },
    { 
      scope: containerRef,
      dependencies: [] // Explicitly prevent re-runs (Point #2 fix)
    }
  );
}
