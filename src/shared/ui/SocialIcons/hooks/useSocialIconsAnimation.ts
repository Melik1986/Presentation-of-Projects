'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

import type { RefObject } from 'react';

type IconTimelines = {
  reveal: gsap.core.Timeline;
  collapse: gsap.core.Timeline;
};

/**
 * Hover is trustworthy only when the primary input can hover.
 */
function canHoverUi(): boolean {
  return window.matchMedia('(hover: hover) and (pointer: fine)').matches;
}

function isTouchPointer(event: PointerEvent): boolean {
  return event.pointerType === 'touch' || event.pointerType === 'pen';
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
 * Desktop mouse: hover expands / leave collapses.
 * Touch/pen: first tap on the lead icon expands (no navigation); second tap follows the link.
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
      if (!(firstLink instanceof HTMLAnchorElement)) return;

      firstLink.setAttribute('aria-expanded', 'false');

      let expanded = false;
      /** Blocks the click that follows a touch expand gesture (synthetic mouseenter race). */
      let blockNextNavigation = false;

      const open = () => {
        collapse.pause();
        reveal.restart();
        expanded = true;
        container.dataset.expanded = 'true';
        firstLink.setAttribute('aria-expanded', 'true');
      };

      const close = () => {
        reveal.pause();
        collapse.restart();
        expanded = false;
        delete container.dataset.expanded;
        firstLink.setAttribute('aria-expanded', 'false');
        blockNextNavigation = false;
      };

      const onMouseEnter = () => {
        open();
      };

      const onMouseLeave = () => {
        close();
      };

      const onFirstPointerDown = (event: PointerEvent) => {
        if (!isTouchPointer(event)) return;
        if (expanded) return;
        // Expand on touchstart; suppress the forthcoming click navigation.
        blockNextNavigation = true;
        open();
      };

      const onFirstClick = (event: MouseEvent) => {
        if (!blockNextNavigation) return;
        event.preventDefault();
        blockNextNavigation = false;
      };

      const onDocumentPointer = (event: PointerEvent) => {
        if (!expanded) return;
        if (!(event.target instanceof Node) || container.contains(event.target)) return;
        // Outside tap/click collapses (touch + mouse).
        close();
      };

      firstLink.addEventListener('pointerdown', onFirstPointerDown);
      firstLink.addEventListener('click', onFirstClick);
      document.addEventListener('pointerdown', onDocumentPointer);

      const hoverOk = canHoverUi();
      if (hoverOk) {
        container.addEventListener('mouseenter', onMouseEnter);
        container.addEventListener('mouseleave', onMouseLeave);
      }

      return () => {
        firstLink.removeEventListener('pointerdown', onFirstPointerDown);
        firstLink.removeEventListener('click', onFirstClick);
        document.removeEventListener('pointerdown', onDocumentPointer);
        if (hoverOk) {
          container.removeEventListener('mouseenter', onMouseEnter);
          container.removeEventListener('mouseleave', onMouseLeave);
        }
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
