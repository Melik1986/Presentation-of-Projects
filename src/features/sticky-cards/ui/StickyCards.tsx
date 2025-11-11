'use client';

import Image from 'next/image';
import { useRef } from 'react';

import { AIPhotoGallery } from './AIPhotoGallery';
import { DeviceGallery } from './DeviceGallery';
import styles from './StickyCards.module.css';
import { defaultStickyCardsData } from '../model/data';
import { useFirstCardAnimation } from '../model/hooks/useFirstCardAnimation';
import { useStickyCardsAnimation } from '../model/hooks/useStickyCardsAnimation';

import type { StickyCardsProps } from '../model/types';

export function StickyCards({
  cards = defaultStickyCardsData,
  className,
  catalogId,
}: StickyCardsProps) {
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

              {cardData.index === '01' ? (
                catalogId === 'web-apps' ? (
                  <DeviceGallery
                    images={[
                      '/img/catalog-1/card-1.png',
                      '/img/catalog-1/card-2.png',
                      '/img/catalog-1/card-3.png',
                      '/img/catalog-1/card-4.png',
                    ]}
                  />
                ) : catalogId === 'ai-tools' ? (
                  <AIPhotoGallery
                    images={[
                      '/img/catalog-2/ai-photo-1.webp',
                      '/img/catalog-2/ai-photo-2.webp',
                      '/img/catalog-2/ai-photo-3.webp',
                      '/img/catalog-2/ai-photo-4.webp',
                      '/img/catalog-2/ai-photo-5.webp',
                      '/img/catalog-2/ai-photo-6.webp',
                      '/img/catalog-2/ai-photo-7.webp',
                      '/img/catalog-2/ai-photo-8.webp',
                    ]}
                  />
                ) : (
                  <div className={styles.stickyCardImg}>
                    <Image
                      src={cardData.image}
                      alt={cardData.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                )
              ) : (
                <div className={styles.stickyCardImg}>
                  <Image
                    src={cardData.image}
                    alt={cardData.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
              )}

              <div className={styles.stickyCardCopy}>
                <div className={styles.stickyCardCopyTitle}>
                  <a
                    href={cardData.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.viewLiveLink}
                  >
                    View Live →
                  </a>
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
