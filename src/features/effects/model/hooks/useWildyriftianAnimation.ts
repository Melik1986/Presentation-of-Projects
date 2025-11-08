'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { MOBILE_BREAKPOINT } from '../data';

import type { RefObject } from 'react';

gsap.registerPlugin(ScrollTrigger);

/**
 * Hook for setting up Wildyriftian hover animations (DESKTOP ONLY)
 * Mobile uses React state + manual GSAP.to() calls
 * Pattern from official GSAP docs: Timeline + play/reverse for hover
 */
export function useWildyriftianAnimation(containerRef: RefObject<HTMLDivElement | null>): void {
  useGSAP(
    () => {
      // Check if desktop (official GSAP way)
      const isDesktop = ScrollTrigger.isTouch === 0;
      const isMobile = window.innerWidth < MOBILE_BREAKPOINT;

      // Only setup hover animations on desktop
      if (!isDesktop || isMobile) {
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
          const rotation = i === 0 ? gsap.utils.random(-20, -10) : i === 1 ? gsap.utils.random(-10, 10) : gsap.utils.random(10, 20);

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
    { scope: containerRef }
  );
}
