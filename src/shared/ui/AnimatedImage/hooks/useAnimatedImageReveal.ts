'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import type { RefObject } from 'react';

gsap.registerPlugin(ScrollTrigger);

type RevealDirection = 'left-to-right' | 'right-to-left' | 'top-to-bottom';

/**
 * Animated image reveal with clip-path and dynamic blur
 * @param containerRef - Reference to the container element
 * @param enableAnimation - Enable/disable animation
 * @param direction - Direction of reveal animation
 * @param duration - Animation duration in seconds
 * @param delay - Animation delay in seconds
 * @param catalogId - Catalog ID for conditional animation
 * @param cardIndex - Card index for conditional animation
 */
export function useAnimatedImageReveal(
  containerRef: RefObject<HTMLAnchorElement | null>,
  enableAnimation: boolean = true,
  direction: RevealDirection = 'right-to-left',
  duration: number = 1.2,
  delay: number = 0.5,
  catalogId?: string,
  cardIndex?: string
): void {
  useGSAP(
    () => {
      if (!enableAnimation) return;

      const container = containerRef.current;
      if (!container) return;

      const image = container.querySelector('[data-animated-image]') as HTMLElement;
      const blurOverlay = container.querySelector('[data-blur-overlay]') as HTMLElement;

      if (!image) return;

      // Determine clip-path based on direction
      const clipPaths = {
        'right-to-left': {
          from: 'inset(0% 0% 0% 100%)', // Hidden on right
          to: 'inset(0% 0% 0% 0%)', // Fully visible
        },
        'left-to-right': {
          from: 'inset(0% 100% 0% 0%)', // Hidden on left
          to: 'inset(0% 0% 0% 0%)', // Fully visible
        },
        'top-to-bottom': {
          from: 'inset(0% 0% 100% 0%)', // Hidden from bottom (reveals from top)
          to: 'inset(0% 0% 0% 0%)', // Fully visible
        },
      };

      const { from, to } = clipPaths[direction];

      // Set initial state
      gsap.set(image, {
        clipPath: from,
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
          clipPath: to,
          duration: duration,
          ease: 'power2.inOut',
          delay: delay,
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
            duration: duration,
            ease: 'power2.out',
            delay: delay,
          },
          0 // Start simultaneously with clip-path
        );
      }
    },
    {
      scope: containerRef,
      dependencies: [enableAnimation, direction, duration, delay, catalogId, cardIndex],
    }
  );
}
