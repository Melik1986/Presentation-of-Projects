'use client';

import { useEffect, useRef, useState } from 'react';

import styles from './OptimizedVideo.module.css';

interface OptimizedVideoProps {
  src: string;
  poster?: string;
  className?: string;
  muted?: boolean;
  loop?: boolean;
  playsInline?: boolean;
  autoPlayOnVisible?: boolean;
  preload?: 'none' | 'metadata' | 'auto';
}

export function OptimizedVideo({
  src,
  poster,
  className = '',
  muted = true,
  loop = true,
  playsInline = true,
  autoPlayOnVisible = true,
  preload = 'metadata',
}: OptimizedVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (!isLoaded && video.dataset.src) {
              video.src = video.dataset.src;
              video.load();
              setIsLoaded(true);
            }

            if (autoPlayOnVisible && isLoaded) {
              video.play().catch(() => {
                // Ignore autoplay errors
              });
            }
          } else {
            if (autoPlayOnVisible) {
              video.pause();
            }
          }
        });
      },
      {
        rootMargin: '200px',
        threshold: 0.1,
      }
    );

    observer.observe(video);

    return () => {
      observer.disconnect();
    };
  }, [isLoaded, autoPlayOnVisible]);

  return (
    <video
      ref={videoRef}
      data-src={src}
      poster={poster}
      className={`${styles.optimizedVideo} ${className}`}
      muted={muted}
      loop={loop}
      playsInline={playsInline}
      preload={preload}
    />
  );
}
