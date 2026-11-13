'use client';

import { useEffect, useLayoutEffect, useState } from 'react';

import { getHomepageContent } from '@/shared/lib/catalog-loader';

import { Loader } from './Loader';
import {
  FALLBACK_TIMEOUT,
  PRELOADER_COMPLETE_EVENT,
  READY_CLASS,
  SCROLL_LOCK_CLASS,
} from '../model/constants';

const PRELOADER_SHOWN_KEY = 'starlight:preloader:shown';
const SCROLL_TRIGGER_REFRESH_DELAY_MS = 120;

type ScrollTriggerApi = {
  refresh: () => void;
};

/**
 * Immediate refresh plus a delayed follow-up after layout settles.
 */
function refreshScrollTriggerTwice(scrollTrigger: ScrollTriggerApi): void {
  scrollTrigger.refresh();
  window.setTimeout(() => {
    scrollTrigger.refresh();
  }, SCROLL_TRIGGER_REFRESH_DELAY_MS);
}

/**
 * Dynamically loads GSAP ScrollTrigger and refreshes it twice.
 */
function loadAndRefreshScrollTrigger(): void {
  import('gsap/ScrollTrigger')
    .then(({ ScrollTrigger }) => {
      if (ScrollTrigger && typeof ScrollTrigger.refresh === 'function') {
        refreshScrollTriggerTwice(ScrollTrigger);
      }
    })
    .catch(() => {
      // ignore dynamic import failures
    });
}

/**
 * Schedules ScrollTrigger refresh on the next animation frame.
 */
function scheduleScrollTriggerRefresh(): void {
  if (typeof requestAnimationFrame !== 'function') {
    return;
  }
  requestAnimationFrame(loadAndRefreshScrollTrigger);
}

function lockPreloaderScroll(documentElement: HTMLElement, body: HTMLElement): void {
  try {
    documentElement.classList.add(SCROLL_LOCK_CLASS);
    body.classList.add(SCROLL_LOCK_CLASS, 'preloader-active');
  } catch {
    // ignore
  }
}

function unlockPreloaderScroll(documentElement: HTMLElement, body: HTMLElement): void {
  try {
    documentElement.classList.remove(SCROLL_LOCK_CLASS);
    body.classList.remove(SCROLL_LOCK_CLASS, 'preloader-active');
    documentElement.classList.add(READY_CLASS);
  } catch {
    // ignore
  }
}

function markPreloaderShown(): void {
  if (process.env.NODE_ENV !== 'production') {
    return;
  }
  try {
    window.sessionStorage.setItem(PRELOADER_SHOWN_KEY, 'true');
  } catch {
    // ignore
  }
}

function dispatchPreloaderCompleteSoon(): void {
  window.setTimeout(() => {
    try {
      document.dispatchEvent(new CustomEvent(PRELOADER_COMPLETE_EVENT));
    } catch {
      // ignore
    }
  }, 0);
}

function wasPreloaderShownThisSession(): boolean {
  if (process.env.NODE_ENV !== 'production') {
    return false;
  }
  return Boolean(window.sessionStorage.getItem(PRELOADER_SHOWN_KEY));
}

function applyPreloaderGradient(gradient: string | undefined): void {
  if (!gradient || typeof document === 'undefined') {
    return;
  }
  document.documentElement.style.setProperty('--preloader-gradient', gradient);
}

function createPreloaderCompleteHandler(
  documentElement: HTMLElement,
  body: HTMLElement,
  setIsVisible: (visible: boolean) => void
): () => void {
  let isCompleted = false;
  return () => {
    if (isCompleted) {
      return;
    }
    isCompleted = true;
    markPreloaderShown();
    setIsVisible(false);
    unlockPreloaderScroll(documentElement, body);
    scheduleScrollTriggerRefresh();
  };
}

function setupPreloaderLifecycle(setIsVisible: (visible: boolean) => void): (() => void) | undefined {
  if (typeof document === 'undefined') {
    return undefined;
  }
  if (wasPreloaderShownThisSession()) {
    setIsVisible(false);
    dispatchPreloaderCompleteSoon();
    return undefined;
  }

  const { documentElement, body } = document;
  lockPreloaderScroll(documentElement, body);
  const handleComplete = createPreloaderCompleteHandler(documentElement, body, setIsVisible);
  const abortController = new AbortController();
  document.addEventListener(PRELOADER_COMPLETE_EVENT, handleComplete, {
    once: true,
    signal: abortController.signal,
  });
  const fallbackTimer = setTimeout(handleComplete, FALLBACK_TIMEOUT);

  return () => {
    abortController.abort();
    clearTimeout(fallbackTimer);
  };
}

export function GlobalPreloader() {
  const [isVisible, setIsVisible] = useState(true);
  const homepage = getHomepageContent();

  useLayoutEffect(() => {
    applyPreloaderGradient(homepage.preloaderGradient);
  }, [homepage.preloaderGradient]);

  useEffect(() => setupPreloaderLifecycle(setIsVisible), []);

  if (!isVisible) {
    return null;
  }

  return <Loader />;
}
