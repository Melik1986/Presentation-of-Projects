'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

import type { RefObject } from 'react';

export function useAIPhotoGalleryAnimation(
  galleryRef: RefObject<HTMLDivElement | null>
): void {
  useGSAP(
    () => {
      const gallery = galleryRef.current;
      if (!gallery) return;

      const columns = gsap.utils.toArray<HTMLElement>('[data-column]');

      columns.forEach((column, columnIndex) => {
        const photos = column.querySelectorAll('[data-photo]');
        if (photos.length === 0) return;

        const firstPhoto = photos[0] as HTMLElement;
        if (!firstPhoto) return;

        const photoHeight = firstPhoto.getBoundingClientRect().height;
        const gap = 20;

        // Calculate height of 4 original photos (half of the total 8)
        const halfHeight = photoHeight * 4 + gap * 3;

        // Create infinite loop animation
        // Column 2 has slight delay for visual variety
        gsap.fromTo(
          column,
          { y: 0 },
          {
            y: -halfHeight,
            duration: 18,
            ease: 'none',
            repeat: -1,
            delay: columnIndex * 1,
            modifiers: {
              y: gsap.utils.unitize((y) => parseFloat(y) % halfHeight),
            },
          }
        );
      });
    },
    { scope: galleryRef }
  );
}

