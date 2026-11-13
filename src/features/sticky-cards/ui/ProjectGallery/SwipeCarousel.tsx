'use client';

import { motion } from 'motion/react';
import * as React from 'react';

import { cn } from '@/shared/lib/utils';

import { useSwipeCarouselGestures } from './hooks/useSwipeCarouselGestures';

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
}: Readonly<SwipeCarouselProps>) {
  const contextValue = useSwipeCarouselGestures(onSlideChange);

  return (
    <SwipeCarouselContext.Provider value={contextValue}>
      <div className={cn('relative w-screen max-w-full', className)} {...props}>
        {children}
      </div>
    </SwipeCarouselContext.Provider>
  );
}

export function SwipeCarouselContainer({
  className,
  ...props
}: Readonly<React.HTMLAttributes<HTMLDivElement>>) {
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
