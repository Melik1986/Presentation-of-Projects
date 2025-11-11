'use client';

import { useRef } from 'react';

import styles from './ScrollingBadge.module.css';
import { useScrollingBadgeAnimation } from './useScrollingBadgeAnimation';

export interface ScrollingBadgeProps {
  items: string[];
  direction?: 'horizontal' | 'vertical';
  speed?: number;
  className?: string;
}

export function ScrollingBadge({
  items,
  direction = 'horizontal',
  speed = 15,
  className,
}: ScrollingBadgeProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useScrollingBadgeAnimation(containerRef, direction, speed);

  return (
    <div
      ref={containerRef}
      className={`${styles.scrollingBadge} ${styles[direction]} ${className || ''}`}
    >
      <div className={styles.fadeTop} />
      <div className={styles.track} data-track>
        {[...items, ...items].map((item, idx) => (
          <span key={idx} className={styles.text} data-text>
            {item}
          </span>
        ))}
      </div>
      <div className={styles.fadeBottom} />
    </div>
  );
}
