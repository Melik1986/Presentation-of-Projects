'use client';

import { useReducedMotion } from 'motion/react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { SLIDE_DURATION } from '../constants';

import type {
  DesktopGalleryPointerHandlers,
  DesktopProjectGalleryController,
} from '../types/projectGallery.types';
import type { Dispatch, SetStateAction } from 'react';

interface DesktopGalleryNavigationState {
  currentIndex: number;
  isTransitioning: boolean;
  completeEntrance: () => void;
  goNext: () => void;
  goPrev: () => void;
}

function useDesktopGalleryNavigation(
  slideCount: number,
  reduceMotion: boolean,
  progressRef: { current: number },
  resetProgress: () => void
): DesktopGalleryNavigationState {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const completedEntrancesRef = useRef(0);

  const completeEntrance = useCallback(() => {
    completedEntrancesRef.current = Math.min(completedEntrancesRef.current + 1, 2);
    if (completedEntrancesRef.current === 2) {
      resetProgress();
      setIsTransitioning(false);
    }
  }, [resetProgress]);

  const goToSlide = useCallback(
    (index: number) => {
      if (isTransitioning || index === currentIndex) {
        return;
      }

      completedEntrancesRef.current = 0;
      if (reduceMotion || progressRef.current < 100) {
        resetProgress();
      }
      setIsTransitioning(!reduceMotion);
      setCurrentIndex(index);
    },
    [currentIndex, isTransitioning, progressRef, reduceMotion, resetProgress]
  );

  const goNext = useCallback(() => {
    goToSlide((currentIndex + 1) % slideCount);
  }, [currentIndex, goToSlide, slideCount]);

  const goPrev = useCallback(() => {
    goToSlide((currentIndex - 1 + slideCount) % slideCount);
  }, [currentIndex, goToSlide, slideCount]);

  return { currentIndex, isTransitioning, completeEntrance, goNext, goPrev };
}

interface DesktopGalleryAutoplayOptions {
  isPaused: boolean;
  isTransitioning: boolean;
  progressRef: { current: number };
  setProgress: Dispatch<SetStateAction<number>>;
  goNext: () => void;
}

function useDesktopGalleryAutoplay({
  isPaused,
  isTransitioning,
  progressRef,
  setProgress,
  goNext,
}: DesktopGalleryAutoplayOptions) {
  useEffect(() => {
    if (isPaused || isTransitioning) {
      return;
    }

    const startProgress = progressRef.current;
    const remainingDuration = Math.max(SLIDE_DURATION * (1 - startProgress / 100), 1);
    const startedAt = Date.now();
    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startedAt;
      const progressDelta = (elapsed / remainingDuration) * (100 - startProgress);
      const nextProgress = Math.min(startProgress + progressDelta, 100);
      progressRef.current = nextProgress;
      setProgress(nextProgress);
    }, 32);
    const advanceTimeout = setTimeout(() => {
      progressRef.current = 100;
      setProgress(100);
      goNext();
    }, remainingDuration);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(advanceTimeout);
    };
  }, [goNext, isPaused, isTransitioning, progressRef, setProgress]);
}

interface GalleryPointerStart {
  x: number;
  y: number;
  pointerId: number;
}

function getGalleryPointerStart(
  event: React.PointerEvent<HTMLElement>
): GalleryPointerStart | null {
  if (!event.isPrimary) {
    return null;
  }
  if (event.pointerType === 'mouse' && event.button !== 0) {
    return null;
  }

  const target = event.target;
  if (!(target instanceof Element)) {
    return null;
  }
  if (!target.closest('[data-project-gallery-frame]')) {
    return null;
  }

  return { x: event.clientX, y: event.clientY, pointerId: event.pointerId };
}

function getGallerySwipeDirection(
  start: GalleryPointerStart,
  event: React.PointerEvent<HTMLElement>
): 'next' | 'previous' | null {
  if (start.pointerId !== event.pointerId) {
    return null;
  }

  const deltaX = event.clientX - start.x;
  const deltaY = event.clientY - start.y;
  if (Math.abs(deltaX) <= 60) {
    return null;
  }
  if (Math.abs(deltaX) <= Math.abs(deltaY)) {
    return null;
  }

  return deltaX < 0 ? 'next' : 'previous';
}

function useDesktopGalleryPointerNavigation(goNext: () => void, goPrev: () => void) {
  const pointerStartRef = useRef<GalleryPointerStart | null>(null);

  const handlePointerDown = useCallback((event: React.PointerEvent<HTMLElement>) => {
    const start = getGalleryPointerStart(event);
    if (!start) {
      return;
    }

    if (event.pointerType === 'mouse') {
      event.preventDefault();
    }
    pointerStartRef.current = start;
    event.currentTarget.setPointerCapture(event.pointerId);
  }, []);

  const handlePointerUp = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      const start = pointerStartRef.current;
      pointerStartRef.current = null;
      if (!start) {
        return;
      }
      const direction = getGallerySwipeDirection(start, event);
      if (direction === 'next') {
        goNext();
      } else if (direction === 'previous') {
        goPrev();
      }
    },
    [goNext, goPrev]
  );

  const handlePointerCancel = useCallback(() => {
    pointerStartRef.current = null;
  }, []);

  return { handlePointerDown, handlePointerUp, handlePointerCancel };
}

export function useDesktopProjectGallery(slideCount: number): DesktopProjectGalleryController {
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const progressRef = useRef(0);
  const reduceMotion = useReducedMotion() ?? false;

  const resetProgress = useCallback(() => {
    progressRef.current = 0;
    setProgress(0);
  }, []);
  const navigation = useDesktopGalleryNavigation(
    slideCount,
    reduceMotion,
    progressRef,
    resetProgress
  );
  const pointerHandlers: DesktopGalleryPointerHandlers = useDesktopGalleryPointerNavigation(
    navigation.goNext,
    navigation.goPrev
  );

  useDesktopGalleryAutoplay({
    isPaused,
    isTransitioning: navigation.isTransitioning,
    progressRef,
    setProgress,
    goNext: navigation.goNext,
  });

  return {
    ...navigation,
    isPaused,
    setIsPaused,
    progress,
    reduceMotion,
    pointerHandlers,
  };
}
