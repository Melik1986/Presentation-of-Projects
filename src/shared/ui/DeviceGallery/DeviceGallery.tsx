'use client';

import Image from 'next/image';
import { useRef } from 'react';

import styles from './DeviceGallery.module.css';
import { useDeviceGalleryAnimation } from '../../../features/sticky-cards/model/hooks/useDeviceGalleryAnimation';

interface DeviceGalleryProps {
  images: [string, string, string, string];
}

export function DeviceGallery({ images }: DeviceGalleryProps) {
  const galleryRef = useRef<HTMLDivElement>(null);

  useDeviceGalleryAnimation(galleryRef);

  return (
    <div ref={galleryRef} className={styles.deviceGallery} data-gallery>
      {images.map((src, idx) => (
        <div key={idx} className={styles.deviceItem} data-device={idx}>
          <Image
            src={src}
            alt={`Device ${idx + 1}`}
            fill
            sizes="(max-width: 768px) 50vw, 300px"
            className={styles.deviceImage}
          />
        </div>
      ))}
    </div>
  );
}
