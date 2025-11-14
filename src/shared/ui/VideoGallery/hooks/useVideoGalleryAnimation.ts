'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

import type { RefObject } from 'react';

interface AnimationConfig {
  layout?: 'vertical' | 'horizontal';
  animationDirection?: 'vertical' | 'horizontal';
  columns?: number;
}

function waitForVideoMetadata(video: HTMLVideoElement): Promise<void> {
  if (video.readyState >= 1) {
    return Promise.resolve();
  }

  if (video.dataset.src && !video.src) {
    video.src = video.dataset.src;
    video.load();
  }

  return new Promise<void>((resolve) => {
    const timeout = setTimeout(() => {
      resolve();
    }, 5000);

    const checkReady = () => {
      if (video.readyState >= 1) {
        clearTimeout(timeout);
        resolve();
      }
    };

    video.addEventListener('loadedmetadata', checkReady, { once: true });
    video.addEventListener('loadeddata', checkReady, { once: true });
    checkReady();
  });
}

async function waitForAllVideosInTrack(track: HTMLElement): Promise<void> {
  const videos = track.querySelectorAll<HTMLVideoElement>('video');
  await Promise.all(Array.from(videos).map((video) => waitForVideoMetadata(video)));
}

export function useVideoGalleryAnimation(
  containerRef: RefObject<HTMLDivElement | null>,
  config: AnimationConfig = {}
): void {
  const { layout = 'vertical', animationDirection = 'horizontal', columns = 2 } = config;

  useGSAP(
    () => {
      const container = containerRef.current;
      if (!container) return;

      const animations: gsap.core.Tween[] = [];

      const initAnimation = async () => {
        animations.forEach((anim) => anim.kill());
        animations.length = 0;

        const tracks = container.querySelectorAll<HTMLElement>('[data-track]');
        if (tracks.length === 0) return;

        await Promise.all(Array.from(tracks).map((track) => waitForAllVideosInTrack(track)));

        const gap = 20;

        tracks.forEach((track, trackIndex) => {
          const videoItems = track.querySelectorAll<HTMLElement>('[data-video-item]');
          if (videoItems.length === 0) return;

          const trackStyle = window.getComputedStyle(track);
          const actualIsVertical = trackStyle.flexDirection === 'column';
          const actualAnimationProp = actualIsVertical ? 'y' : 'x';
          const actualOppositeProp = actualIsVertical ? 'x' : 'y';

          const firstItem = videoItems[0] as HTMLElement;
          if (!firstItem) return;

          const itemSize = actualIsVertical
            ? firstItem.getBoundingClientRect().height
            : firstItem.getBoundingClientRect().width;

          const itemCount = videoItems.length / 2;
          const halfSize = itemSize * itemCount + gap * (itemCount - 1);

          gsap.set(track, {
            [actualOppositeProp]: 0,
            [actualAnimationProp]: 0,
          });

          const animation = gsap.fromTo(
            track,
            { [actualAnimationProp]: 0 },
            {
              [actualAnimationProp]: -halfSize,
              duration: 30,
              ease: 'none',
              repeat: -1,
              delay: trackIndex * 1,
              modifiers: {
                [actualAnimationProp]: gsap.utils.unitize((value) => parseFloat(value) % halfSize),
              },
            }
          );

          animations.push(animation);
        });
      };

      requestAnimationFrame(() => {
        initAnimation();
      });

      return () => {
        animations.forEach((anim) => anim.kill());
        animations.length = 0;
      };
    },
    { scope: containerRef, dependencies: [layout, animationDirection, columns] }
  );
}
