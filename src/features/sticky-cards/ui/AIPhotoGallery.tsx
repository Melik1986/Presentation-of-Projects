'use client';

import Image from 'next/image';
import { useRef } from 'react';

import { OptimizedVideo } from '@/shared/ui';

import styles from './AIPhotoGallery.module.css';
import { useAIPhotoGalleryAnimation } from '../model/hooks/useAIPhotoGalleryAnimation';

interface AIPhotoGalleryProps {
  items: string[];
  layout?: 'vertical' | 'horizontal';
  aspectRatio?: 'portrait' | 'landscape';
  animationDirection?: 'vertical' | 'horizontal';
  columns?: number;
  itemType?: 'image' | 'video';
  images?: string[];
}

export function AIPhotoGallery({
  items,
  layout = 'vertical',
  aspectRatio = 'portrait',
  animationDirection = 'vertical',
  columns = 2,
  itemType = 'image',
  images,
}: AIPhotoGalleryProps) {
  const galleryRef = useRef<HTMLDivElement>(null);
  const itemsToUse = items || images || [];

  useAIPhotoGalleryAnimation(galleryRef, {
    layout,
    animationDirection,
    columns,
  });

  const isHorizontal = layout === 'horizontal';
  const isLandscape = aspectRatio === 'landscape';
  const isHorizontalAnimation = animationDirection === 'horizontal';

  let rowsArray: string[][];
  if (isHorizontalAnimation && isLandscape) {
    const itemsPerRow = Math.ceil(itemsToUse.length / columns);
    rowsArray = Array.from({ length: columns }, (_, i) => {
      const start = i * itemsPerRow;
      const end = start + itemsPerRow;
      return itemsToUse.slice(start, end);
    });
  } else {
    const itemsPerColumn = Math.ceil(itemsToUse.length / columns);
    rowsArray = Array.from({ length: columns }, (_, i) => {
      const start = i * itemsPerColumn;
      const end = start + itemsPerColumn;
      return itemsToUse.slice(start, end);
    });
  }

  return (
    <div
      ref={galleryRef}
      className={`${styles.aiPhotoGallery} ${isHorizontal ? styles.horizontal : ''} ${isLandscape ? styles.landscape : ''}`}
      data-ai-gallery
    >
      {/* Blur overlay top/left */}
      <div className={styles.blurOverlayTop} />

      <div className={styles.columnsWrapper}>
        {rowsArray.map((rowItems, rowIndex) => (
          <div key={rowIndex} className={styles.column} data-column={rowIndex + 1}>
            {(itemType === 'video' ? rowItems : [...rowItems, ...rowItems]).map((src, idx) => (
              <a
                key={idx}
                href={src}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.photoWrapper}
                data-photo
              >
                {itemType === 'video' ? (
                  <OptimizedVideo src={src} className={styles.photo} autoPlayOnVisible={true} />
                ) : (
                  <Image
                    src={src}
                    alt={`Gallery item ${idx + 1}`}
                    fill
                    sizes="(max-width: 768px) 50vw, 300px"
                    className={styles.photo}
                  />
                )}
              </a>
            ))}
          </div>
        ))}
      </div>

      {/* Blur overlay bottom/right */}
      <div className={styles.blurOverlayBottom} />
    </div>
  );
}
