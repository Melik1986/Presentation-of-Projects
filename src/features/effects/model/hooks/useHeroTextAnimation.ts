'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { SplitText } from 'gsap/SplitText';

import { PRELOADER_COMPLETE_EVENT } from '@/features/preloader';

import type { RefObject } from 'react';

// Register plugin
gsap.registerPlugin(SplitText);

/**
 * GSAP SplitText animations for hero section
 * Triggered after preloader completes
 * H1: chars from right (CodePen xbbNLvx)
 * P: chars with rotation (CodePen Jooqrod)
 */
export function useHeroTextAnimation(heroRef: RefObject<HTMLDivElement | null>): void {
  useGSAP(
    () => {
      if (!heroRef.current) return;

      const title = heroRef.current.querySelector('.hero-title') as HTMLElement;
      const description = heroRef.current.querySelector('.hero-description') as HTMLElement;

      if (!title || !description) return;

      // Split text into chars
      const splitTitle = new SplitText(title, {
        type: 'chars',
      });

      const splitDescription = new SplitText(description, {
        type: 'chars',
      });

      const startAnimations = () => {
        // Timeline for sequential animations
        const tl = gsap.timeline({ delay: 0.3 });

        // H1: Chars from right (CodePen xbbNLvx pattern)
        tl.from(
          splitTitle.chars,
          {
            x: 150,
            opacity: 0,
            duration: 0.7,
            ease: 'power4',
            stagger: 0.04,
          },
          0
        );

        // P: Chars with rotation (CodePen Jooqrod pattern)
        tl.from(
          splitDescription.chars,
          {
            duration: 1,
            scale: 4,
            autoAlpha: 0,
            rotationX: -180,
            transformOrigin: '100% 50%',
            ease: 'back',
            stagger: 0.02,
          },
          0.4
        );
      };

      // Wait for preloader to complete before starting
      document.addEventListener(PRELOADER_COMPLETE_EVENT, startAnimations, { once: true });

      // Cleanup on unmount
      return () => {
        document.removeEventListener(PRELOADER_COMPLETE_EVENT, startAnimations);
        splitTitle.revert();
        splitDescription.revert();
      };
    },
    {
      scope: heroRef,
      dependencies: [],
    }
  );
}
