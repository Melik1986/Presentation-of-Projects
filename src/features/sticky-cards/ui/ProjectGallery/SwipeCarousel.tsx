'use client';

import { animate, motion, useMotionValue } from 'motion/react';
import * as React from 'react';

import { cn } from '@/shared/lib/utils';

import type { HTMLMotionProps, MotionValue } from 'motion/react';

interface SwipeCarouselContextValue {
  x: MotionValue<number>;
  progress: MotionValue<number>;
  trackRef: React.RefObject<HTMLDivElement | null>;
  onPointerDown: (event: React.PointerEvent<HTMLDivElement>) => void;
  onPointerMove: (event: React.PointerEvent<HTMLDivElement>) => void;
  onPointerUp: (event: React.PointerEvent<HTMLDivElement>) => void;
  onPointerCancel: () => void;
}

const SwipeCarouselContext = React.createContext<SwipeCarouselContextValue | null>(null);

function useSwipeCarouselContext() {
  const context = React.useContext(SwipeCarouselContext);
  if (!context) {
    throw new Error('useSwipeCarouselContext must be used within a SwipeCarousel');
  }

  return context;
}

export interface SwipeCarouselProps extends React.HTMLAttributes<HTMLDivElement> {
  onSlideChange?: (index: number) => void;
}

export function SwipeCarousel({
  children,
  className,
  onSlideChange,
  ...props
}: SwipeCarouselProps) {
  const x = useMotionValue(0);
  const progress = useMotionValue(0);
  const trackRef = React.useRef<HTMLDivElement>(null);
  const currentIndexRef = React.useRef(0);
  const pointerStartRef = React.useRef<{
    x: number;
    y: number;
    offset: number;
    pointerId: number;
  } | null>(null);
  const gestureDirectionRef = React.useRef<'horizontal' | 'vertical' | null>(null);

  const getSlideOffset = (index: number) => {
    const track = trackRef.current;
    const firstSlide = track?.children[0] as HTMLElement | undefined;
    const slide = track?.children[index] as HTMLElement | undefined;
    if (!firstSlide) {
      return 0;
    }
    if (!slide) {
      return 0;
    }
    return firstSlide.getBoundingClientRect().left - slide.getBoundingClientRect().left;
  };

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!event.isPrimary) {
      return;
    }

    if (event.pointerType === 'mouse') {
      if (event.button !== 0) {
        return;
      }

      event.preventDefault();
    }

    pointerStartRef.current = {
      x: event.clientX,
      y: event.clientY,
      offset: x.get(),
      pointerId: event.pointerId,
    };
    gestureDirectionRef.current = null;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const start = pointerStartRef.current;
    const track = trackRef.current;
    if (!start) {
      return;
    }
    if (start.pointerId !== event.pointerId) {
      return;
    }
    if (!track) {
      return;
    }

    const deltaX = event.clientX - start.x;
    const deltaY = event.clientY - start.y;
    if (gestureDirectionRef.current === null) {
      const hasMoved = Math.max(Math.abs(deltaX), Math.abs(deltaY)) > 8;
      if (!hasMoved) {
        return;
      }

      gestureDirectionRef.current = Math.abs(deltaX) > Math.abs(deltaY) ? 'horizontal' : 'vertical';
    }
    if (gestureDirectionRef.current !== 'horizontal') {
      return;
    }

    event.preventDefault();
    const nextIndex = Math.max(
      0,
      Math.min(currentIndexRef.current + (deltaX < 0 ? 1 : -1), track.children.length - 1)
    );
    const currentOffset = getSlideOffset(currentIndexRef.current);
    const adjacentOffset = getSlideOffset(nextIndex);
    const minOffset = Math.min(currentOffset, adjacentOffset);
    const maxOffset = Math.max(currentOffset, adjacentOffset);
    x.set(Math.max(minOffset, Math.min(start.offset + deltaX, maxOffset)));
  };

  const onPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    const start = pointerStartRef.current;
    const track = trackRef.current;
    pointerStartRef.current = null;

    if (!start) {
      gestureDirectionRef.current = null;
      return;
    }
    if (start.pointerId !== event.pointerId) {
      gestureDirectionRef.current = null;
      return;
    }
    if (!track) {
      gestureDirectionRef.current = null;
      return;
    }

    const deltaX = event.clientX - start.x;
    const prevIndex = currentIndexRef.current;
    let nextIndex = prevIndex;
    if (gestureDirectionRef.current === 'horizontal') {
      if (Math.abs(deltaX) > 48) {
        const direction = deltaX < 0 ? 1 : -1;
        nextIndex = Math.max(
          0,
          Math.min(currentIndexRef.current + direction, track.children.length - 1)
        );
      }
    }

    currentIndexRef.current = nextIndex;
    if (nextIndex !== prevIndex) {
      onSlideChange?.(nextIndex);
    }
    progress.set(track.children.length > 1 ? nextIndex / (track.children.length - 1) : 0);
    animate(x, getSlideOffset(nextIndex), {
      duration: 0.36,
      ease: [0.22, 1, 0.36, 1],
    });
    gestureDirectionRef.current = null;
  };

  const onPointerCancel = () => {
    pointerStartRef.current = null;
    gestureDirectionRef.current = null;
    const currentIndex = currentIndexRef.current;
    animate(x, getSlideOffset(currentIndex), {
      duration: 0.36,
      ease: [0.22, 1, 0.36, 1],
    });
  };

  return (
    <SwipeCarouselContext.Provider
      value={{ x, progress, trackRef, onPointerDown, onPointerMove, onPointerUp, onPointerCancel }}
    >
      <div className={cn('relative w-screen max-w-full', className)} {...props}>
        {children}
      </div>
    </SwipeCarouselContext.Provider>
  );
}

export function SwipeCarouselContainer({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const { onPointerDown, onPointerMove, onPointerUp, onPointerCancel } = useSwipeCarouselContext();

  return (
    <div
      className={cn('sticky left-0 top-0 w-full overflow-hidden', className)}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      {...props}
    />
  );
}

export function SwipeCarouselTrack({ className, style, ...props }: HTMLMotionProps<'div'>) {
  const { x, trackRef } = useSwipeCarouselContext();

  return (
    <motion.div
      ref={trackRef}
      className={cn('w-fit', className)}
      style={{ x, ...style }}
      {...props}
    />
  );
}

export function SwipeCarouselProgress({
  className,
  style,
  progressStyle,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { progressStyle?: string }) {
  const { progress } = useSwipeCarouselContext();

  return (
    <div className={cn('max-w-screen overflow-hidden', className)} {...props}>
      <motion.div
        className={cn('origin-left', progressStyle)}
        style={{ scaleX: progress, ...style }}
      />
    </div>
  );
}
