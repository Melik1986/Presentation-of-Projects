'use client';

import Image from 'next/image';
import { useRef } from 'react';

import { useAIPhotoGalleryAnimation } from '../model/hooks/useAIPhotoGalleryAnimation';
import styles from './AIPhotoGallery.module.css';

interface AIPhotoGalleryProps {
  images: string[]; // 8 images total
}

export function AIPhotoGallery({ images }: AIPhotoGalleryProps) {
  const galleryRef = useRef<HTMLDivElement>(null);

  useAIPhotoGalleryAnimation(galleryRef);

  // Split images into 2 columns (4 images each)
  const column1 = images.slice(0, 4);
  const column2 = images.slice(4, 8);

  return (
    <div ref={galleryRef} className={styles.aiPhotoGallery} data-ai-gallery>
      {/* Blur overlay top */}
      <div className={styles.blurOverlayTop} />

      <div className={styles.columnsWrapper}>
        {/* Column 1 */}
        <div className={styles.column} data-column="1">
          {/* Render images twice for infinite scroll */}
          {[...column1, ...column1].map((src, idx) => (
            <a
              key={idx}
              href={src}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.photoWrapper}
              data-photo
            >
              <Image
                src={src}
                alt={`AI Photo ${idx + 1}`}
                fill
                sizes="(max-width: 768px) 50vw, 300px"
                className={styles.photo}
              />
            </a>
          ))}
        </div>

        {/* Column 2 */}
        <div className={styles.column} data-column="2">
          {/* Render images twice for infinite scroll */}
          {[...column2, ...column2].map((src, idx) => (
            <a
              key={idx}
              href={src}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.photoWrapper}
              data-photo
            >
              <Image
                src={src}
                alt={`AI Photo ${idx + 5}`}
                fill
                sizes="(max-width: 768px) 50vw, 300px"
                className={styles.photo}
              />
            </a>
          ))}
        </div>
      </div>

      {/* Blur overlay bottom */}
      <div className={styles.blurOverlayBottom} />
    </div>
  );
}

