'use client';

import { useDesktopProjectGallery } from '../hooks/useDesktopProjectGallery';
import styles from '../ProjectGallery.module.css';
import { DesktopGalleryControls } from './DesktopGalleryControls';
import { DesktopGalleryText } from './DesktopGalleryText';
import { ProjectGalleryFrame } from './ProjectGalleryFrame';

import type { DesktopProjectGalleryProps } from '../types/projectGallery.types';

export function DesktopProjectGallery({ title, description, slides }: Readonly<DesktopProjectGalleryProps>) {
  const gallery = useDesktopProjectGallery(slides.length);
  const currentSlide = slides[gallery.currentIndex];
  if (!currentSlide) {
    return null;
  }

  const imageLabel = `Image ${String(gallery.currentIndex + 1).padStart(2, '0')} / ${slides.length}`;

  return (
    <section
      className={styles.desktopCarousel}
      aria-label={`${currentSlide.title || title} image gallery`}
      aria-roledescription="carousel"
      data-project-gallery-desktop
      onMouseEnter={() => gallery.setIsPaused(true)}
      onMouseLeave={() => gallery.setIsPaused(false)}
      onFocusCapture={() => gallery.setIsPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          gallery.setIsPaused(false);
        }
      }}
      onPointerDown={gallery.pointerHandlers.handlePointerDown}
      onPointerUp={gallery.pointerHandlers.handlePointerUp}
      onPointerCancel={gallery.pointerHandlers.handlePointerCancel}
    >
      <div className={styles.desktopText}>
        <DesktopGalleryText
          title={currentSlide.title || title}
          description={currentSlide.description || description}
          slideId={currentSlide.id}
          currentIndex={gallery.currentIndex}
          slideCount={slides.length}
          reduceMotion={gallery.reduceMotion}
          onEntranceComplete={gallery.completeEntrance}
        />
        <DesktopGalleryControls
          goPrev={gallery.goPrev}
          goNext={gallery.goNext}
          disabled={gallery.isTransitioning}
        />
      </div>

      <ProjectGalleryFrame
        slide={currentSlide}
        label={imageLabel}
        sizes="(max-width: 1024px) 90vw, 45vw"
        animated
        reduceMotion={gallery.reduceMotion}
        onEntranceComplete={gallery.completeEntrance}
      />

      <progress
        className={styles.progressTrack}
        max={100}
        value={gallery.progress}
        aria-label="Time until next gallery image"
        data-gallery-autoplay-progress
      />
    </section>
  );
}
