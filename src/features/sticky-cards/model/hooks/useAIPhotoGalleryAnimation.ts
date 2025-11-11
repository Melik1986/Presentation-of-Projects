'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

import type { RefObject } from 'react';

interface AnimationConfig {
  layout?: 'vertical' | 'horizontal';
  animationDirection?: 'vertical' | 'horizontal';
  columns?: number;
}

export function useAIPhotoGalleryAnimation(
  galleryRef: RefObject<HTMLDivElement | null>,
  config: AnimationConfig = {}
): void {
  const { layout = 'vertical', animationDirection = 'vertical', columns = 2 } = config;

  useGSAP(
    () => {
      const gallery = galleryRef.current;
      if (!gallery) return;

      const columnsElements = gsap.utils.toArray<HTMLElement>('[data-column]');
      const isHorizontal = animationDirection === 'horizontal';
      const animationProp = isHorizontal ? 'x' : 'y';
      const oppositeProp = isHorizontal ? 'y' : 'x';
      const gap = 20;

      columnsElements.forEach((column, columnIndex) => {
        const photos = column.querySelectorAll('[data-photo]');
        if (photos.length === 0) return;

        const firstPhoto = photos[0] as HTMLElement;
        if (!firstPhoto) return;

        const photoSize = isHorizontal
          ? firstPhoto.getBoundingClientRect().width
          : firstPhoto.getBoundingClientRect().height;

        const totalItems = photos.length;
        const totalSize = photoSize * totalItems + gap * (totalItems - 1);

        gsap.set(column, {
          [oppositeProp]: 0,
          [animationProp]: 0,
        });

        gsap.to(column, {
          [animationProp]: -totalSize,
          duration: 30,
          ease: 'none',
          repeat: -1,
          delay: columnIndex * 1,
          modifiers: {
            [animationProp]: gsap.utils.unitize((value) => parseFloat(value) % totalSize),
          },
        });
      });
    },
    { scope: galleryRef, dependencies: [layout, animationDirection, columns] }
  );
}
