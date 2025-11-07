
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import type { RefObject } from 'react';

gsap.registerPlugin(ScrollTrigger);

/**
 * Hook for managing sticky cards scroll animation
 * @param containerRef - Reference to the container element
 */
export function useStickyCardsAnimation(containerRef: RefObject<HTMLDivElement | null>) {
  useGSAP(
    () => {
      const stickyCards = gsap.utils.toArray<HTMLElement>('.sticky-card');

      stickyCards.forEach((card, index) => {
        const isLastCard = index === stickyCards.length - 1;

        if (!isLastCard) {
          ScrollTrigger.create({
            trigger: card,
            start: 'top top',
            endTrigger: stickyCards[stickyCards.length - 1],
            end: 'top top',
            pin: true,
            pinSpacing: false,
          });

          ScrollTrigger.create({
            trigger: stickyCards[index + 1],
            start: 'top bottom',
            end: 'top top',
            onUpdate: (self) => {
              const progress = self.progress;
              const scale = 1 - progress * 0.25;
              const rotation = (index % 2 === 0 ? 5 : -5) * progress;
              const afterOpacity = progress;

              gsap.set(card, {
                scale,
                rotation,
                '--after-opacity': afterOpacity,
              });
            },
          });
        }
      });
    },
    { scope: containerRef }
  );
}
