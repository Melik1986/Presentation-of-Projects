'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

import { ScrollingBadge } from '@/shared/ui';

import { AIPhotoGallery } from './AIPhotoGallery';
import { DeviceGallery } from './DeviceGallery';
import styles from './StickyCards.module.css';
import { defaultStickyCardsData } from '../model/data';
import { useFirstCardAnimation } from '../model/hooks/useFirstCardAnimation';
import { useStickyCardsAnimation } from '../model/hooks/useStickyCardsAnimation';

import type { StickyCardsProps } from '../model/types';

/**
 * Hook to detect if screen width is below 1024px
 */
function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const mediaQuery = window.matchMedia('(max-width: 1024px)');
    setIsMobile(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  return isMobile;
}

export function StickyCards({
  cards = defaultStickyCardsData,
  className,
  catalogId,
}: StickyCardsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  useStickyCardsAnimation(containerRef);
  useFirstCardAnimation(containerRef);

  // AI Tools list for scrolling badges
  const aiTools = [
    'SORA AI',
    'Recraft',
    'KREA',
    'FLORA',
    'Weavy AI',
    'Midjourney',
    'DALL-E 3',
    'Stable Diffusion',
    'RunwayML',
    'Pika Labs',
  ];

  return (
    <div className={`${styles.stickyCards} ${className || ''}`} ref={containerRef}>
      {cards.map((cardData) => (
        <div className={`sticky-card ${styles.stickyCard}`} key={cardData.index}>
          <div className={styles.stickyCardIndex}>
            <h1>{cardData.index}</h1>

            {/* AI Tools badges for ai-tools catalog, card 01 */}
            {catalogId === 'ai-tools' && cardData.index === '01' && (
              <div className={styles.aiToolsBadges}>
                <ScrollingBadge
                  items={aiTools}
                  direction={isMobile ? 'horizontal' : 'vertical'}
                  speed={12}
                  className={styles.badge1}
                />
                <ScrollingBadge
                  items={aiTools}
                  direction={isMobile ? 'horizontal' : 'vertical'}
                  speed={14}
                  className={styles.badge2}
                />
              </div>
            )}

            {/* AI Tools badges for ai-tools catalog, card 02 */}
            {catalogId === 'ai-tools' && cardData.index === '02' && (
              <div className={styles.aiToolsBadges}>
                <ScrollingBadge
                  items={aiTools}
                  direction={isMobile ? 'horizontal' : 'vertical'}
                  speed={12}
                  className={styles.badge1}
                />
                <ScrollingBadge
                  items={aiTools}
                  direction={isMobile ? 'horizontal' : 'vertical'}
                  speed={14}
                  className={styles.badge2}
                />
              </div>
            )}
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
                    items={[
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
              ) : cardData.index === '02' && catalogId === 'ai-tools' ? (
                <AIPhotoGallery
                  items={[
                    '/img/catalog-2/video-1.mp4',
                    '/img/catalog-2/video-2.MP4',
                    '/img/catalog-2/video-3.mp4',
                    '/img/catalog-2/video-4.mp4',
                    '/img/catalog-2/video-5.MP4',
                    '/img/catalog-2/video-6.MP4',
                    '/img/catalog-2/video-7.MP4',
                    '/img/catalog-2/video-8.MP4',
                  ]}
                  layout="vertical"
                  aspectRatio="landscape"
                  animationDirection="horizontal"
                  columns={2}
                  itemType="video"
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
