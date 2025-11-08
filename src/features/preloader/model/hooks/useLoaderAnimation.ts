'use client';

import { useEffect, useMemo, useState } from 'react';

import type { LoaderAnimationResult, PreloaderConfig } from '../types';

function isAutomationBrowser(): boolean {
  try {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
      return false;
    }

    const webdriverFlag = navigator.webdriver;
    return Boolean(webdriverFlag);
  } catch {
    return false;
  }
}

function triggerPreloaderComplete(target?: Document | EventTarget): void {
  try {
    (target ?? document).dispatchEvent(new CustomEvent('preloader:complete'));
  } catch {
    // ignore
  }
}

function toMilliseconds(value: string): number {
  const numberValue = parseFloat(value);
  if (Number.isNaN(numberValue)) {
    return 0;
  }

  return value.trim().endsWith('ms') ? numberValue : numberValue * 1000;
}

function setupProgressListeners(element: Element): (() => void) | undefined {
  let done = false;
  let timerId: number | null = null;

  const complete = () => {
    if (done) {
      return;
    }

    done = true;

    try {
      const target = (element as HTMLElement).ownerDocument ?? document;
      triggerPreloaderComplete(target);
    } catch {
      // ignore
    }
  };

  const handleAnimationEnd = () => {
    complete();
  };

  element.addEventListener('animationend', handleAnimationEnd, { once: true });

  if (typeof window !== 'undefined') {
    const computedStyle = window.getComputedStyle(element);
    const durations = computedStyle.animationDuration
      .split(',')
      .map((entry) => toMilliseconds(entry.trim()));
    const delays = computedStyle.animationDelay
      .split(',')
      .map((entry) => toMilliseconds(entry.trim()));

    const maxDuration = Math.max(0, ...durations);
    const maxDelay = Math.max(0, ...delays);
    const fallback = maxDuration + maxDelay + 200;

    timerId = window.setTimeout(complete, fallback);
  }

  return () => {
    element.removeEventListener('animationend', handleAnimationEnd);

    if (timerId && typeof window !== 'undefined') {
      window.clearTimeout(timerId);
    }
  };
}

export function useLoaderAnimation(config?: PreloaderConfig): LoaderAnimationResult {
  const [isHidden] = useState(false);
  const progressSelector = config?.progressBarSelector ?? '[data-preloader-progress]';

  useEffect(() => {
    if (isAutomationBrowser()) {
      setTimeout(() => {
        triggerPreloaderComplete();
      }, 0);
      return;
    }

    const element = document.querySelector(progressSelector);
    if (!element) {
      return undefined;
    }

    return setupProgressListeners(element);
  }, [progressSelector]);

  const containerProps = useMemo(
    () => ({
      role: 'status' as const,
      'aria-live': 'polite' as const,
      'data-preloader-root': 'true',
    }),
    []
  );

  return { isHidden, containerProps };
}
