'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

import type { RefObject } from 'react';

/**
 * GSAP Animations for Database CRUD Panel
 * - Table row stagger animation
 * - Modal scale animation
 * - Hover effects
 */
export const useCRUDAnimations = (containerRef: RefObject<HTMLDivElement | null>) => {
  useGSAP(
    () => {
      if (!containerRef.current) return;

      const rows = containerRef.current.querySelectorAll('[data-table-row]');
      const cards = containerRef.current.querySelectorAll('[data-mobile-card]');

      if (rows.length > 0) {
        gsap.fromTo(
          rows,
          {
            opacity: 0,
            y: 20,
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            stagger: 0.05,
            ease: 'power2.out',
          }
        );
      }

      if (cards.length > 0) {
        gsap.fromTo(
          cards,
          {
            opacity: 0,
            scale: 0.95,
          },
          {
            opacity: 1,
            scale: 1,
            duration: 0.4,
            stagger: 0.08,
            ease: 'back.out(1.2)',
          }
        );
      }
    },
    { scope: containerRef, dependencies: [] }
  );

  return null;
};
