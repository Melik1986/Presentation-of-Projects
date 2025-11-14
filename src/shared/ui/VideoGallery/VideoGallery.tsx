'use client';

import { useRef } from 'react';

import { OptimizedVideo } from '@/shared/ui';

import { useVideoGalleryAnimation } from './hooks/useVideoGalleryAnimation';
import styles from './VideoGallery.module.css';

interface VideoGalleryProps {
  items: string[];
  layout?: 'vertical' | 'horizontal';
  aspectRatio?: 'portrait' | 'landscape';
  animationDirection?: 'vertical' | 'horizontal';
  columns?: number;
}

export function VideoGallery({
  items,
  layout = 'vertical',
  aspectRatio = 'landscape',
  animationDirection = 'horizontal',
  columns = 2,
}: VideoGalleryProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useVideoGalleryAnimation(containerRef, {
    layout,
    animationDirection,
    columns,
  });

  const itemsPerColumn = Math.ceil(items.length / columns);
  const columnsArray = Array.from({ length: columns }, (_, i) => {
    const start = i * itemsPerColumn;
    const end = start + itemsPerColumn;
    return items.slice(start, end);
  });

  return (
    <div
      ref={containerRef}
      className={`${styles.videoGallery} ${layout === 'horizontal' ? styles.horizontal : ''} ${aspectRatio === 'landscape' ? styles.landscape : ''}`}
    >
      <div className={styles.fadeTop} />
      <div className={styles.columnsContainer}>
        {columnsArray.map((columnItems, columnIndex) => (
          <div key={columnIndex} className={styles.column} data-column={columnIndex}>
            <div className={styles.track} data-track>
              {[...columnItems, ...columnItems].map((src, idx) => (
                <div key={idx} className={styles.videoItem} data-video-item>
                  <a
                    href={src}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.videoLink}
                    title={`View video ${(idx % columnItems.length) + 1} in full size`}
                    aria-label={`View video ${(idx % columnItems.length) + 1} in full size`}
                  >
                    <span className="sr-only">
                      View video {(idx % columnItems.length) + 1} in full size
                    </span>
                    <OptimizedVideo src={src} className={styles.video} autoPlayOnVisible={true} />
                  </a>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className={styles.fadeBottom} />
    </div>
  );
}
