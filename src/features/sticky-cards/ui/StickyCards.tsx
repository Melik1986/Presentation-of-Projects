'use client';

import Image from 'next/image';
import { useRef } from 'react';

import styles from './StickyCards.module.css';
import { defaultStickyCardsData } from '../model/data';
import { useFirstCardAnimation } from '../model/hooks/useFirstCardAnimation';
import { useStickyCardsAnimation } from '../model/hooks/useStickyCardsAnimation';

import type { StickyCardsProps } from '../model/types';

export function StickyCards({ cards = defaultStickyCardsData, className }: StickyCardsProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useStickyCardsAnimation(containerRef);
  useFirstCardAnimation(containerRef);

  return (
    <div className={`${styles.stickyCards} ${className || ''}`} ref={containerRef}>
      {cards.map((cardData) => (
        <div className={`sticky-card ${styles.stickyCard}`} key={cardData.index}>
          <div className={styles.stickyCardIndex}>
            <h1>{cardData.index}</h1>
          </div>

          <div className={styles.stickyCardContent}>
            <div className={styles.stickyCardContentWrapper}>
              <h1 className={styles.stickyCardHeader}>{cardData.title}</h1>

              <div className={styles.stickyCardImg}>
                <Image
                  src={cardData.image}
                  alt={cardData.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>

              <div className={styles.stickyCardCopy}>
                <div className={styles.stickyCardCopyTitle}>
                  <p>(About the state)</p>
                </div>
                <div className={styles.stickyCardCopyDescription}>
                  <p>{cardData.description}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
