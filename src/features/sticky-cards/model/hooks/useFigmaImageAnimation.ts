'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import type { RefObject } from 'react';

gsap.registerPlugin(ScrollTrigger);

/**
 * Animation variants for Figma image reveal
 * @param containerRef - Reference to the container element
 * @param catalogId - Catalog ID to check if animation should apply
 * @param variant - 1: Clip-Path Reveal, 2: Scale + Blur (default), 3: Perspective 3D
 */
export function useFigmaImageAnimation(
  containerRef: RefObject<HTMLDivElement | null>,
  catalogId: string | undefined,
  variant: 1 | 2 | 3 = 2
): void {
  useGSAP(
    () => {
      // Only apply animation for figma-design catalog
      if (catalogId !== 'figma-design') return;

      const container = containerRef.current;
      if (!container) return;

      // Find the figma image within the first card only
      const firstCard = container.querySelector('[data-card-index="01"]');
      if (!firstCard) return;

      const imageElement = firstCard.querySelector('[data-figma-image]') as HTMLElement;
      if (!imageElement) return;

      // Animation variants
      const animations = {
        // Variant 1: Clip-Path Reveal + Blur
        1: () => {
          gsap.set(imageElement, {
            clipPath: 'inset(0% 100% 0% 0%)',
            filter: 'blur(20px)',
            scale: 1.1,
          });

          ScrollTrigger.create({
            trigger: firstCard,
            start: 'top 80%',
            once: true,
            onEnter: () => {
              gsap.to(imageElement, {
                clipPath: 'inset(0% 0% 0% 0%)',
                filter: 'blur(0px)',
                scale: 1,
                duration: 1.2,
                ease: 'power3.out',
                delay: 0.5,
              });
            },
          });
        },

        // Variant 2: Scale + Blur + Y-Movement (Default)
        2: () => {
          gsap.set(imageElement, {
            scale: 0.85,
            y: 40,
            opacity: 0,
            filter: 'blur(15px)',
          });

          ScrollTrigger.create({
            trigger: firstCard,
            start: 'top 80%',
            once: true,
            onEnter: () => {
              gsap.to(imageElement, {
                scale: 1,
                y: 0,
                opacity: 1,
                filter: 'blur(0px)',
                duration: 1.1,
                ease: 'power2.out',
                delay: 0.5,
              });
            },
          });
        },

        // Variant 3: Perspective 3D + Blur
        3: () => {
          gsap.set(imageElement, {
            rotationX: -15,
            rotationY: 10,
            opacity: 0,
            filter: 'blur(12px)',
            transformOrigin: 'center center',
            transformPerspective: 1000,
          });

          ScrollTrigger.create({
            trigger: firstCard,
            start: 'top 80%',
            once: true,
            onEnter: () => {
              gsap.to(imageElement, {
                rotationX: 0,
                rotationY: 0,
                opacity: 1,
                filter: 'blur(0px)',
                duration: 1.0,
                ease: 'power3.inOut',
                delay: 0.5,
              });
            },
          });
        },
      };

      // Execute selected variant
      animations[variant]();
    },
    { scope: containerRef, dependencies: [catalogId, variant] }
  );
}

