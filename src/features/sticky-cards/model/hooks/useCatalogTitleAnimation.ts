'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

import type { RefObject } from 'react';

gsap.registerPlugin(ScrollTrigger, SplitText);

/**
 * Catalog title animation + parallax effect
 * - SplitText: lines from bottom (CodePen QwwRqLx)
 * - Parallax: title moves slower than scroll
 */
export function useCatalogTitleAnimation(
  titleRef: RefObject<HTMLHeadingElement | null>,
  containerRef: RefObject<HTMLDivElement | null>
): void {
  useGSAP(
    () => {
      if (!titleRef.current) return;

      const title = titleRef.current;

      // Split text into lines
      const splitTitle = new SplitText(title, {
        type: 'lines',
        linesClass: 'line',
      });

      // Initial reveal: lines fade and slide up
      gsap.from(splitTitle.lines, {
        duration: 1.2,
        y: 30,
        opacity: 0,
        stagger: 0.15,
        ease: 'power2.out',
        delay: 0.4,
      });

      // Parallax: title moves slower on scroll (goes under cards)
      // Start when first card reaches 20% from top (ensures it's not triggered on load)
      const firstCard = containerRef.current?.querySelector('.sticky-card');

      if (firstCard) {
        gsap.to(title, {
          y: 200,
          opacity: 0.3,
          scale: 0.95,
          ease: 'none',
          scrollTrigger: {
            trigger: firstCard,
            start: 'top 20%',
            end: 'top top',
            scrub: 1.5,
          },
        });
      }

      // Cleanup
      return () => {
        splitTitle.revert();
        ScrollTrigger.getAll().forEach((trigger) => {
          if (trigger.vars.trigger === title) {
            trigger.kill();
          }
        });
      };
    },
    {
      scope: containerRef,
      dependencies: [],
    }
  );
}
