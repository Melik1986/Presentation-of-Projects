'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

import type { RefObject } from 'react';

type IconTimelines = {
  reveal: gsap.core.Timeline;
  collapse: gsap.core.Timeline;
};

/**
 * True when primary input has no reliable hover (phones/tablets).
 */
function isTouchUi(): boolean {
  return window.matchMedia('(hover: none), (pointer: coarse)').matches;
}

/**
 * Stack secondary icons behind the first one; returns Y offsets used to collapse later.
 */
function stackIconsBehindFirst(
  container: HTMLUListElement,
  items: HTMLElement[]
): number[] {
  const firstItem = container.querySelector('li:first-child');
  if (!(firstItem instanceof HTMLElement)) {
    return items.map(() => 0);
  }

  const containerTop = container.getBoundingClientRect().top;
  const firstTop = firstItem.getBoundingClientRect().top - containerTop;

  return items.map((item) => {
    const offsetY = item.getBoundingClientRect().top - containerTop - firstTop;
    gsap.set(item, {
      opacity: 0,
      y: -offsetY,
      filter: 'blur(10px)',
    });
    return offsetY;
  });
}

function buildTimelines(items: HTMLElement[], offsets: number[]): IconTimelines {
  const reveal = gsap.timeline({ paused: true }).to(items, {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    duration: 0.6,
    ease: 'power2.out',
    stagger: 0.1,
  });

  const collapse = gsap.timeline({ paused: true }).to(items, {
    opacity: 0,
    y: (index: number) => -offsets[index]!,
    filter: 'blur(10px)',
    duration: 0.4,
    ease: 'power2.in',
    stagger: { amount: 0.15, from: 'end' },
  });

  return { reveal, collapse };
}

/**
 * GSAP animation for social icons reveal.
 * Desktop: hover expands / leave collapses.
 * Touch: first tap on the lead icon expands (no navigation); second tap follows the link.
 */
export function useSocialIconsAnimation(containerRef: RefObject<HTMLUListElement | null>): void {
  useGSAP(
    () => {
      const container = containerRef.current;
      if (!container) return;

      const items = gsap.utils.toArray<HTMLElement>(
        container.querySelectorAll('[data-social-icon-item]')
      );
      if (items.length === 0) return;

      const offsets = stackIconsBehindFirst(container, items);
      const { reveal, collapse } = buildTimelines(items, offsets);
      const firstLink = container.querySelector('li:first-child a');

      let expanded = false;

      const open = () => {
        collapse.pause();
        reveal.restart();
        expanded = true;
        container.dataset.expanded = 'true';
        firstLink?.setAttribute('aria-expanded', 'true');
      };

      const close = () => {
        reveal.pause();
        collapse.restart();
        expanded = false;
        delete container.dataset.expanded;
        firstLink?.setAttribute('aria-expanded', 'false');
      };

      const onMouseEnter = () => {
        open();
      };

      const onMouseLeave = () => {
        close();
      };

      const onFirstClick = (event: Event) => {
        if (!isTouchUi()) return;
        if (expanded) return;
        event.preventDefault();
        open();
      };

      const onDocumentPointer = (event: Event) => {
        if (!expanded || !isTouchUi()) return;
        const target = event.target;
        if (!(target instanceof Node) || container.contains(target)) return;
        close();
      };

      container.addEventListener('mouseenter', onMouseEnter);
      container.addEventListener('mouseleave', onMouseLeave);
      firstLink?.addEventListener('click', onFirstClick);
      document.addEventListener('pointerdown', onDocumentPointer);

      return () => {
        container.removeEventListener('mouseenter', onMouseEnter);
        container.removeEventListener('mouseleave', onMouseLeave);
        firstLink?.removeEventListener('click', onFirstClick);
        document.removeEventListener('pointerdown', onDocumentPointer);
        reveal.kill();
        collapse.kill();
      };
    },
    {
      scope: containerRef,
      dependencies: [],
    }
  );
}
