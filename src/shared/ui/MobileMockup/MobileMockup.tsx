'use client';

import Image from 'next/image';
import { useRef } from 'react';

import styles from './MobileMockup.module.css';
import { useMobileMockupAnimation } from './useMobileMockupAnimation';

interface MobileMockupProps {
  src: string;
  alt: string;
  catalogId?: string;
  cardIndex?: string;
  enableAnimation?: boolean;
}

export function MobileMockup({
  src,
  alt,
  catalogId,
  cardIndex,
  enableAnimation = true,
}: MobileMockupProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Animation hook (always called, but conditionally applies animation)
  useMobileMockupAnimation(containerRef, enableAnimation, catalogId, cardIndex);

  return (
    <div ref={containerRef} className={styles.mobileMockupContainer} data-mobile-mockup>
      <a href={src} target="_blank" rel="noopener noreferrer">
        <div className={styles.imageWrapper}>
          <Image
            src={src}
            alt={alt}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className={styles.image}
            data-mobile-image
          />
          {/* Dynamic blur overlay (only during animation) */}
          <div className={styles.blurOverlay} data-blur-overlay />
        </div>
      </a>
    </div>
  );
}

