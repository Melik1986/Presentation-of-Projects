'use client';

import { animate, useMotionValue } from 'motion/react';
import * as React from 'react';

import type { MotionValue } from 'motion/react';

type GestureHandlers = {
  x: MotionValue<number>;
  progress: MotionValue<number>;
  trackRef: React.RefObject<HTMLDivElement | null>;
  onPointerDown: (event: React.PointerEvent<HTMLDivElement>) => void;
  onPointerMove: (event: React.PointerEvent<HTMLDivElement>) => void;
  onPointerUp: (event: React.PointerEvent<HTMLDivElement>) => void;
  onPointerCancel: () => void;
};

type PointerStart = {
  x: number;
  y: number;
  offset: number;
  pointerId: number;
};

type GestureAxis = 'horizontal' | 'vertical';
type GestureDirection = GestureAxis | null;

type SwipeRuntime = {
  x: MotionValue<number>;
  progress: MotionValue<number>;
  trackRef: React.RefObject<HTMLDivElement | null>;
  currentIndexRef: React.RefObject<number>;
  pointerStartRef: React.RefObject<PointerStart | null>;
  gestureDirectionRef: React.RefObject<GestureDirection>;
  onSlideChange?: (index: number) => void;
};

function isMatchingPointerSession(
  start: PointerStart | null,
  eventPointerId: number,
  track: HTMLElement | null
): boolean {
  return Boolean(start?.pointerId === eventPointerId && track);
}

function getSlideOffset(track: HTMLDivElement | null, index: number): number {
  const firstSlide = track?.children[0] as HTMLElement | undefined;
  const slide = track?.children[index] as HTMLElement | undefined;
  if (!firstSlide || !slide) {
    return 0;
  }
  return firstSlide.getBoundingClientRect().left - slide.getBoundingClientRect().left;
}

function calculateSwipeTargetIndex(
  deltaX: number,
  isDirectionHorizontal: boolean,
  currentIndex: number,
  totalSlides: number
): number {
  if (!isDirectionHorizontal || Math.abs(deltaX) <= 48) {
    return currentIndex;
  }
  const direction = deltaX < 0 ? 1 : -1;
  return Math.max(0, Math.min(currentIndex + direction, totalSlides - 1));
}

function calculateCarouselProgress(nextIndex: number, totalSlides: number): number {
  return totalSlides > 1 ? nextIndex / (totalSlides - 1) : 0;
}

function resolveGestureDirection(
  current: GestureDirection,
  deltaX: number,
  deltaY: number
): GestureDirection {
  if (current !== null) {
    return current;
  }
  if (Math.max(Math.abs(deltaX), Math.abs(deltaY)) <= 8) {
    return null;
  }
  return Math.abs(deltaX) > Math.abs(deltaY) ? 'horizontal' : 'vertical';
}

function handlePointerDown(event: React.PointerEvent<HTMLDivElement>, runtime: SwipeRuntime): void {
  if (!event.isPrimary) {
    return;
  }
  if (event.pointerType === 'mouse') {
    if (event.button !== 0) {
      return;
    }
    event.preventDefault();
  }
  runtime.pointerStartRef.current = {
    x: event.clientX,
    y: event.clientY,
    offset: runtime.x.get(),
    pointerId: event.pointerId,
  };
  runtime.gestureDirectionRef.current = null;
  event.currentTarget.setPointerCapture(event.pointerId);
}

function handlePointerMove(event: React.PointerEvent<HTMLDivElement>, runtime: SwipeRuntime): void {
  const start = runtime.pointerStartRef.current;
  const track = runtime.trackRef.current;
  if (!isMatchingPointerSession(start, event.pointerId, track)) {
    return;
  }
  const deltaX = event.clientX - start!.x;
  const deltaY = event.clientY - start!.y;
  runtime.gestureDirectionRef.current = resolveGestureDirection(
    runtime.gestureDirectionRef.current,
    deltaX,
    deltaY
  );
  if (runtime.gestureDirectionRef.current !== 'horizontal') {
    return;
  }
  event.preventDefault();
  const nextIndex = Math.max(
    0,
    Math.min(runtime.currentIndexRef.current + (deltaX < 0 ? 1 : -1), track!.children.length - 1)
  );
  const currentOffset = getSlideOffset(track, runtime.currentIndexRef.current);
  const adjacentOffset = getSlideOffset(track, nextIndex);
  const minOffset = Math.min(currentOffset, adjacentOffset);
  const maxOffset = Math.max(currentOffset, adjacentOffset);
  runtime.x.set(Math.max(minOffset, Math.min(start!.offset + deltaX, maxOffset)));
}

function handlePointerUp(event: React.PointerEvent<HTMLDivElement>, runtime: SwipeRuntime): void {
  const start = runtime.pointerStartRef.current;
  const track = runtime.trackRef.current;
  runtime.pointerStartRef.current = null;
  if (!isMatchingPointerSession(start, event.pointerId, track)) {
    runtime.gestureDirectionRef.current = null;
    return;
  }
  const prevIndex = runtime.currentIndexRef.current;
  const totalSlides = track!.children.length;
  const nextIndex = calculateSwipeTargetIndex(
    event.clientX - start!.x,
    runtime.gestureDirectionRef.current === 'horizontal',
    prevIndex,
    totalSlides
  );
  runtime.currentIndexRef.current = nextIndex;
  if (nextIndex !== prevIndex) {
    runtime.onSlideChange?.(nextIndex);
  }
  runtime.progress.set(calculateCarouselProgress(nextIndex, totalSlides));
  animate(runtime.x, getSlideOffset(track, nextIndex), {
    duration: 0.36,
    ease: [0.22, 1, 0.36, 1],
  });
  runtime.gestureDirectionRef.current = null;
}

function handlePointerCancel(runtime: SwipeRuntime): void {
  runtime.pointerStartRef.current = null;
  runtime.gestureDirectionRef.current = null;
  animate(runtime.x, getSlideOffset(runtime.trackRef.current, runtime.currentIndexRef.current), {
    duration: 0.36,
    ease: [0.22, 1, 0.36, 1],
  });
}

/**
 * Pointer swipe gestures + motion values for SwipeCarousel.
 */
export function useSwipeCarouselGestures(onSlideChange?: (index: number) => void): GestureHandlers {
  const x = useMotionValue(0);
  const progress = useMotionValue(0);
  const trackRef = React.useRef<HTMLDivElement>(null);
  const currentIndexRef = React.useRef(0);
  const pointerStartRef = React.useRef<PointerStart | null>(null);
  const gestureDirectionRef = React.useRef<GestureDirection>(null);
  const runtimeRef = React.useRef<SwipeRuntime | null>(null);

  runtimeRef.current = {
    x,
    progress,
    trackRef,
    currentIndexRef,
    pointerStartRef,
    gestureDirectionRef,
    onSlideChange,
  };

  const onPointerDown = React.useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    handlePointerDown(event, runtimeRef.current!);
  }, []);

  const onPointerMove = React.useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    handlePointerMove(event, runtimeRef.current!);
  }, []);

  const onPointerUp = React.useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    handlePointerUp(event, runtimeRef.current!);
  }, []);

  const onPointerCancel = React.useCallback(() => {
    handlePointerCancel(runtimeRef.current!);
  }, []);

  return React.useMemo(
    () => ({ x, progress, trackRef, onPointerDown, onPointerMove, onPointerUp, onPointerCancel }),
    [x, progress, onPointerDown, onPointerMove, onPointerUp, onPointerCancel]
  );
}
