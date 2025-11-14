'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

import type { RefObject } from 'react';

/**
 * GSAP animation hook for social icons reveal
 * - Initially only first icon is visible
 * - Other icons are hidden behind the first one (overlap)
 * - On hover: icons smoothly reveal downward with blur and stagger
 * - On leave: icons collapse back
 */
export function useSocialIconsAnimation(containerRef: RefObject<HTMLUListElement | null>): void {
  useGSAP(
    () => {
      const container = containerRef.current;
      if (!container) return;

      const allItems = gsap.utils.toArray<HTMLElement>(
        container.querySelectorAll('[data-social-icon-item]')
      );
      if (allItems.length === 0) return;

      // Calculate positions: items are naturally positioned by CSS gap
      // We need to shift them up to overlap behind the first icon
      const firstItem = container.querySelector('li:first-child') as HTMLElement;
      if (!firstItem) return;

      const firstItemRect = firstItem.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      const firstItemTop = firstItemRect.top - containerRect.top;

      // Set initial state: shift items up to overlap behind first icon
      allItems.forEach((item) => {
        const itemRect = item.getBoundingClientRect();
        const itemTop = itemRect.top - containerRect.top;
        const offsetY = itemTop - firstItemTop;

        gsap.set(item, {
          opacity: 0,
          y: -offsetY,
          filter: 'blur(10px)',
        });
      });

      // Create timeline for reveal animation (paused initially)
      const revealTimeline = gsap.timeline({ paused: true });

      revealTimeline.to(allItems, {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        duration: 0.6,
        ease: 'power2.out',
        stagger: 0.1,
      });

      // Create timeline for collapse animation (paused initially)
      const collapseTimeline = gsap.timeline({ paused: true });

      collapseTimeline.to(allItems, {
        opacity: 0,
        y: 0,
        filter: 'blur(10px)',
        duration: 0.4,
        ease: 'power2.in',
        stagger: {
          amount: 0.15,
          from: 'end',
        },
      });

      // Event handlers
      const handleEnter = () => {
        collapseTimeline.pause();
        revealTimeline.restart();
      };

      const handleLeave = () => {
        revealTimeline.pause();
        collapseTimeline.restart();
      };

      // Add event listeners to container
      container.addEventListener('mouseenter', handleEnter);
      container.addEventListener('mouseleave', handleLeave);

      // Cleanup
      return () => {
        container.removeEventListener('mouseenter', handleEnter);
        container.removeEventListener('mouseleave', handleLeave);
        revealTimeline.kill();
        collapseTimeline.kill();
      };
    },
    {
      scope: containerRef,
      dependencies: [],
    }
  );
}
