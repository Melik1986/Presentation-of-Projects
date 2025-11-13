'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import type { RefObject } from 'react';

gsap.registerPlugin(ScrollTrigger);

/**
 * Mobile mockup reveal animation
 * Clip-path reveal from top to bottom with dynamic blur overlay
 * Duration: 1.6s (slow, emphasizes details)
 */
export function useMobileMockupAnimation(
  containerRef: RefObject<HTMLDivElement | null>,
  enableAnimation: boolean = true,
  catalogId?: string,
  cardIndex?: string
): void {
  useGSAP(
    () => {
      // Only apply animation if conditions are met
      if (
        !enableAnimation ||
        catalogId !== 'figma-design' ||
        (cardIndex !== '02' && cardIndex !== '03')
      ) {
        return;
      }

      const container = containerRef.current;
      if (!container) return;

      const image = container.querySelector('[data-mobile-image]') as HTMLElement;
      const blurOverlay = container.querySelector('[data-blur-overlay]') as HTMLElement;

      if (!image) return;

      // Set initial state
      gsap.set(image, {
        clipPath: 'inset(0% 0% 100% 0%)', // Hidden from bottom
      });

      if (blurOverlay) {
        gsap.set(blurOverlay, {
          opacity: 0,
        });
      }

      // Create animation timeline
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          start: 'top 80%',
          once: true,
        },
      });

      // Clip-path reveal animation
      tl.to(
        image,
        {
          clipPath: 'inset(0% 0% 0% 0%)', // Fully visible
          duration: 1.6,
          ease: 'power2.inOut',
        },
        0
      );

      // Dynamic blur overlay animation
      if (blurOverlay) {
        tl.fromTo(
          blurOverlay,
          {
            opacity: 1, // Visible at start
          },
          {
            opacity: 0, // Fades out
            duration: 1.6,
            ease: 'power2.out',
          },
          0 // Start simultaneously with clip-path
        );
      }
    },
    { scope: containerRef, dependencies: [enableAnimation, catalogId, cardIndex] }
  );
}
