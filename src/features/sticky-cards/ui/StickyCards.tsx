'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

import { AnimatedImage, MobileMockup, ScrollingBadge, ThreeJsCanvas } from '@/shared/ui';

import { AIPhotoGallery } from './AIPhotoGallery';
import { DeviceGallery } from './DeviceGallery';
import styles from './StickyCards.module.css';
import { defaultStickyCardsData } from '../model/data';
import { useFigmaImageAnimation } from '../model/hooks/useFigmaImageAnimation';
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

  // Figma image animation for figma-design catalog (variant 2: Scale + Blur + Y-Movement)
  useFigmaImageAnimation(containerRef, catalogId, 2);

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
        <div
          className={`sticky-card ${styles.stickyCard}`}
          key={cardData.index}
          data-card-index={cardData.index}
        >
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

            {/* Mobile mockup for figma-design catalog, card 02 */}
            {catalogId === 'figma-design' && cardData.index === '02' && (
              <div className={styles.mobileMockupWrapper}>
                <MobileMockup
                  src={cardData.image}
                  alt={cardData.title}
                  catalogId={catalogId}
                  cardIndex={cardData.index}
                  enableAnimation={true}
                />
              </div>
            )}

            {/* Mobile mockup for figma-design catalog, card 03 */}
            {catalogId === 'figma-design' && cardData.index === '03' && (
              <div className={styles.mobileMockupWrapper}>
                <MobileMockup
                  src={cardData.image}
                  alt={cardData.title}
                  catalogId={catalogId}
                  cardIndex={cardData.index}
                  enableAnimation={true}
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
                ) : catalogId === 'figma-design' ? (
                  <div className={styles.stickyCardImg} data-figma-image-container>
                    <a href={cardData.image} target="_blank" rel="noopener noreferrer">
                      <Image
                        src={cardData.image}
                        alt={cardData.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        data-figma-image
                      />
                    </a>
                  </div>
                ) : catalogId === 'advanced-tech' ? (
                  <ThreeJsCanvas className={styles.stickyCardImg} />
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
              ) : cardData.index === '02' ? (
                catalogId === 'ai-tools' ? (
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
                ) : catalogId === 'figma-design' ? (
                  <AnimatedImage
                    src="/img/catalog-3/card-2.2.png"
                    alt={cardData.title}
                    direction="right-to-left"
                    duration={1.2}
                    delay={0.5}
                    catalogId={catalogId}
                    cardIndex={cardData.index}
                    enableAnimation={true}
                  />
                ) : (
                  <a
                    href={cardData.image}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.stickyCardImg}
                  >
                    <Image
                      src={cardData.image}
                      alt={cardData.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </a>
                )
              ) : cardData.index === '03' ? (
                catalogId === 'figma-design' ? (
                  <AnimatedImage
                    src="/img/catalog-3/card-3.2.png"
                    alt={cardData.title}
                    direction="right-to-left"
                    duration={1.2}
                    delay={0.5}
                    catalogId={catalogId}
                    cardIndex={cardData.index}
                    enableAnimation={true}
                  />
                ) : (
                  <a
                    href={cardData.image}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.stickyCardImg}
                  >
                    <Image
                      src={cardData.image}
                      alt={cardData.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </a>
                )
              ) : catalogId === 'figma-design' ? (
                <div className={styles.stickyCardImg} data-figma-image-container>
                  <a href={cardData.image} target="_blank" rel="noopener noreferrer">
                    <Image
                      src={cardData.image}
                      alt={cardData.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      data-figma-image
                    />
                  </a>
                </div>
              ) : (
                <a
                  href={cardData.image}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.stickyCardImg}
                >
                  <Image
                    src={cardData.image}
                    alt={cardData.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </a>
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
