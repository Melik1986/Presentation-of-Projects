'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

import type { RefObject } from 'react';

/**
 * Entrance animation for audio panel
 * First element in the animation sequence
 */
export function useAudioPanelAnimation(panelRef: RefObject<HTMLElement | null>): void {
  useGSAP(
    () => {
      const panel = panelRef.current;
      if (!panel) return;

      // Hide initially (NOT CSS, only GSAP)
      gsap.set(panel, {
        autoAlpha: 0,
        y: 20,
      });

      // Fade in after SmileyLoader hides (1s SmileyLoader + 0.1s pause)
      gsap.to(panel, {
        autoAlpha: 1,
        y: 0,
        duration: 0.6,
        ease: 'power2.out',
        delay: 1.1,
      });
    },
    { scope: panelRef }
  );
}

