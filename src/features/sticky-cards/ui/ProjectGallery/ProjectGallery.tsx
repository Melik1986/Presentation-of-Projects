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
import {
  isMobileDescriptionExpanded,
  toggleMobileDescription,
} from '../../model/mobileGalleryDescription';
import { createProjectGallerySlides } from '../../model/projectGallery';

import type { ProjectGalleryProps } from './types/projectGallery.types';
import type { ProjectGallerySlide } from '../../model/projectGallery';

function MobileProjectGallery({
  title,
  description,
  slides,
}: Omit<ProjectGalleryProps, 'images' | 'slidesData'> & { slides: ProjectGallerySlide[] }) {
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [expandedSlideIndex, setExpandedSlideIndex] = useState<number | null>(null);

  const handleSlideChange = (nextSlideIndex: number) => {
    setActiveSlideIndex(nextSlideIndex);
    setExpandedSlideIndex(null);
  };

  return (
    <SwipeCarousel
      className={styles.mobileCarousel}
      aria-label={`${title} image gallery`}
      data-project-gallery-mobile
      onSlideChange={handleSlideChange}
    >
      <SwipeCarouselContainer className={styles.mobileViewport}>
        <SwipeCarouselTrack className={styles.mobileTrack}>
          {slides.map((slide, index) => {
            const imageLabel = `Image ${String(index + 1).padStart(2, '0')} / ${slides.length}`;
            const isActive = index === activeSlideIndex;
            const isExpanded = isMobileDescriptionExpanded(expandedSlideIndex, index);
            const descriptionId = `${slide.id}-description`;

            return (
              <ProjectGalleryReveal
                className={styles.mobileSlide}
                key={slide.id}
                isActive={isActive}
              >
                <ProjectGalleryRevealMain className={styles.mobileImage}>
                  <ProjectGalleryFrame slide={slide} label={imageLabel} sizes="70vw" />
                </ProjectGalleryRevealMain>
                <ProjectGalleryRevealContent className={styles.mobileSlideContent}>
                  <span>{imageLabel}</span>
                  <h3>{slide.title || title}</h3>
                  <button
                    type="button"
                    className={styles.mobileDescriptionToggle}
                    aria-expanded={isExpanded}
                    aria-controls={descriptionId}
                    onPointerDown={(event) => event.stopPropagation()}
                    onClick={(event) => {
                      event.stopPropagation();
                      setExpandedSlideIndex((currentIndex) =>
                        toggleMobileDescription(currentIndex, index)
                      );
                    }}
                  >
                    {isExpanded ? 'Collapse' : 'Next'}
                  </button>
                  <p id={descriptionId} hidden={!isExpanded}>
                    {slide.description || description}
                  </p>
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

export function ProjectGallery({ title, description, images, slidesData }: ProjectGalleryProps) {
  const [isMobile, setIsMobile] = useState(false);
  const slides = createProjectGallerySlides(title, images, description, slidesData);

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
