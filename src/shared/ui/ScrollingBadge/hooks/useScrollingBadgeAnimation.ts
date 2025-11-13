'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

import type { RefObject } from 'react';

export function useScrollingBadgeAnimation(
  containerRef: RefObject<HTMLDivElement | null>,
  direction: 'horizontal' | 'vertical',
  speed: number
): void {
  useGSAP(
    () => {
      const container = containerRef.current;
      if (!container) return;

      const track = container.querySelector('[data-track]') as HTMLElement;
      if (!track) return;

      const texts = track.querySelectorAll('[data-text]');
      if (texts.length === 0) return;

      let animation: gsap.core.Tween | null = null;

      const initAnimation = () => {
        if (animation) {
          animation.kill();
          animation = null;
        }

        const trackStyle = window.getComputedStyle(track);
        const actualIsVertical = trackStyle.flexDirection === 'column';
        const actualAnimationProp = actualIsVertical ? 'y' : 'x';
        const actualOppositeProp = actualIsVertical ? 'x' : 'y';

        const firstText = texts[0] as HTMLElement;
        const textSize = actualIsVertical
          ? firstText.getBoundingClientRect().height
          : firstText.getBoundingClientRect().width;
        const gap = 32;

        const itemCount = texts.length / 2;
        const halfSize = textSize * itemCount + gap * (itemCount - 1);

        gsap.set(track, {
          [actualOppositeProp]: 0,
          [actualAnimationProp]: 0,
        });

        animation = gsap.fromTo(
          track,
          { [actualAnimationProp]: 0 },
          {
            [actualAnimationProp]: -halfSize,
            duration: speed,
            ease: 'none',
            repeat: -1,
            modifiers: {
              [actualAnimationProp]: gsap.utils.unitize((value) => parseFloat(value) % halfSize),
            },
          }
        );
      };

      requestAnimationFrame(initAnimation);

      return () => {
        if (animation) {
          animation.kill();
          animation = null;
        }
      };
    },
    { scope: containerRef, dependencies: [direction, speed] }
  );
}
