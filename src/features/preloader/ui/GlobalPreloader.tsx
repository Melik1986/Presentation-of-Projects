'use client';

import { useEffect, useState } from 'react';

import { Loader } from './Loader';
import {
  FALLBACK_TIMEOUT,
  PRELOADER_COMPLETE_EVENT,
  READY_CLASS,
  SCROLL_LOCK_CLASS,
} from '../model/constants';

const PRELOADER_SHOWN_KEY = 'starlight:preloader:shown';

export function GlobalPreloader() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (typeof document === 'undefined') {
      return undefined;
    }

    // Check if already shown this session (production only)
    if (process.env.NODE_ENV === 'production') {
      const wasShown = window.sessionStorage.getItem(PRELOADER_SHOWN_KEY);
      if (wasShown) {
        setIsVisible(false);
        // Dispatch complete event immediately for animations
        setTimeout(() => {
          try {
            document.dispatchEvent(new CustomEvent(PRELOADER_COMPLETE_EVENT));
          } catch {
            // ignore
          }
        }, 0);
        return undefined;
      }
    }

    const { documentElement, body } = document;
    let isCompleted = false;

    const lockScroll = () => {
      try {
        documentElement.classList.add(SCROLL_LOCK_CLASS);
        body.classList.add(SCROLL_LOCK_CLASS);
        body.classList.add('preloader-active');
      } catch {
        // ignore
      }
    };

    const unlockScroll = () => {
      try {
        documentElement.classList.remove(SCROLL_LOCK_CLASS);
        body.classList.remove(SCROLL_LOCK_CLASS);
        body.classList.remove('preloader-active');
        documentElement.classList.add(READY_CLASS);
      } catch {
        // ignore
      }
    };

    lockScroll();

    const handleComplete = () => {
      if (isCompleted) {
        return;
      }

      isCompleted = true;

      // Mark as shown for this session (production only)
      if (process.env.NODE_ENV === 'production') {
        try {
          window.sessionStorage.setItem(PRELOADER_SHOWN_KEY, 'true');
        } catch {
          // ignore
        }
      }

      setIsVisible(false);
      unlockScroll();

      if (typeof requestAnimationFrame === 'function') {
        requestAnimationFrame(() => {
          import('gsap/ScrollTrigger')
            .then(({ ScrollTrigger }) => {
              if (ScrollTrigger && typeof ScrollTrigger.refresh === 'function') {
                ScrollTrigger.refresh();
                setTimeout(() => {
                  ScrollTrigger.refresh();
                }, 120);
              }
            })
            .catch(() => {
              // ignore dynamic import failures
            });
        });
      }
    };

    const cleanupCompleteListener = () => {
      document.removeEventListener(PRELOADER_COMPLETE_EVENT, handleComplete);
    };

    document.addEventListener(PRELOADER_COMPLETE_EVENT, handleComplete, {
      once: true,
    });

    const fallbackTimer = setTimeout(handleComplete, FALLBACK_TIMEOUT);

    return () => {
      cleanupCompleteListener();
      clearTimeout(fallbackTimer);
    };
  }, []);

  if (!isVisible) {
    return null;
  }

  return <Loader />;
}
