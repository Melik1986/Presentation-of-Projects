'use client';

import { useEffect, useState } from 'react';

import { DesktopProjectGallery } from './components/DesktopProjectGallery';
import { ProjectGalleryFrame } from './components/ProjectGalleryFrame';
import { MOBILE_BREAKPOINT } from './constants';
import styles from './ProjectGallery.module.css';
import {
  ProjectGalleryReveal,
  ProjectGalleryRevealContent,
  ProjectGalleryRevealMain,
} from './ProjectGalleryReveal';
import {
  SwipeCarousel,
  SwipeCarouselContainer,
  SwipeCarouselProgress,
  SwipeCarouselTrack,
} from './SwipeCarousel';
import { createProjectGallerySlides } from '../../model/projectGallery';

import type { ProjectGalleryProps } from './types/projectGallery.types';
import type { ProjectGallerySlide } from '../../model/projectGallery';

function MobileProjectGallery({
  title,
  description,
  slides,
}: Omit<ProjectGalleryProps, 'images'> & { slides: ProjectGallerySlide[] }) {
  return (
    <SwipeCarousel
      className={styles.mobileCarousel}
      aria-label={`${title} image gallery`}
      data-project-gallery-mobile
    >
      <SwipeCarouselContainer className={styles.mobileViewport}>
        <SwipeCarouselTrack className={styles.mobileTrack}>
          {slides.map((slide, index) => {
            const imageLabel = `Image ${String(index + 1).padStart(2, '0')} / ${slides.length}`;

            return (
              <ProjectGalleryReveal className={styles.mobileSlide} key={slide.id}>
                <ProjectGalleryRevealMain className={styles.mobileImage}>
                  <ProjectGalleryFrame slide={slide} label={imageLabel} sizes="70vw" />
                </ProjectGalleryRevealMain>
                <ProjectGalleryRevealContent className={styles.mobileSlideContent}>
                  <span>{imageLabel}</span>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </ProjectGalleryRevealContent>
              </ProjectGalleryReveal>
            );
          })}
        </SwipeCarouselTrack>
        <SwipeCarouselProgress
          className={styles.mobileProgress}
          progressStyle={styles.mobileProgressFill}
          aria-hidden="true"
        />
      </SwipeCarouselContainer>
    </SwipeCarousel>
  );
}

export function ProjectGallery({ title, description, images }: ProjectGalleryProps) {
  const [isMobile, setIsMobile] = useState(false);
  const slides = createProjectGallerySlides(title, images);

  useEffect(() => {
    const mediaQuery = window.matchMedia(MOBILE_BREAKPOINT);
    const updateViewport = () => setIsMobile(mediaQuery.matches);

    updateViewport();
    mediaQuery.addEventListener('change', updateViewport);

    return () => mediaQuery.removeEventListener('change', updateViewport);
  }, []);

  return isMobile ? (
    <MobileProjectGallery title={title} description={description} slides={slides} />
  ) : (
    <DesktopProjectGallery title={title} description={description} slides={slides} />
  );
}
