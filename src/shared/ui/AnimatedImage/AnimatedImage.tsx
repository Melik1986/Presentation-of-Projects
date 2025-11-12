'use client';

import Image from 'next/image';
import { useRef } from 'react';

import styles from './AnimatedImage.module.css';
import { useAnimatedImageReveal } from './useAnimatedImageReveal';

interface AnimatedImageProps {
  src: string;
  alt: string;
  direction?: 'left-to-right' | 'right-to-left' | 'top-to-bottom';
  duration?: number;
  delay?: number;
  catalogId?: string;
  cardIndex?: string;
  enableAnimation?: boolean;
}

export function AnimatedImage({
  src,
  alt,
  direction = 'right-to-left',
  duration = 1.2,
  delay = 0.5,
  catalogId,
  cardIndex,
  enableAnimation = true,
}: AnimatedImageProps) {
  const containerRef = useRef<HTMLAnchorElement>(null);

  // Animation hook
  useAnimatedImageReveal(containerRef, enableAnimation, direction, duration, delay, catalogId, cardIndex);

  return (
    <a
      href={src}
      target="_blank"
      rel="noopener noreferrer"
      ref={containerRef}
      className={styles.animatedImageContainer}
      data-animated-image-container
    >
      <div className={styles.imageWrapper}>
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          className={styles.image}
          data-animated-image
        />
        {/* Dynamic blur overlay */}
        <div className={`${styles.blurOverlay} ${styles[direction]}`} data-blur-overlay />
      </div>
    </a>
  );
}

