import { AnimatePresence, motion } from 'motion/react';
import Image from 'next/image';

import { PREMIUM_EASE } from '../constants';
import styles from '../ProjectGallery.module.css';

import type { ProjectGalleryFrameProps } from '../types/projectGallery.types';

function ProjectGalleryMedia({
  slide,
  label,
  sizes,
}: Pick<ProjectGalleryFrameProps, 'slide' | 'label' | 'sizes'>) {
  return slide.image ? (
    <picture className={styles.galleryPicture}>
      {slide.mobileImage && (
        <source media="(max-width: 1000px)" srcSet={slide.mobileImageSrcSet || slide.mobileImage} />
      )}
      {slide.imageSrcSet && <source media="(min-width: 1001px)" srcSet={slide.imageSrcSet} />}
      <Image
        src={slide.image}
        alt={`${slide.title} — ${label}`}
        fill
        sizes={sizes}
        className={styles.galleryImage}
      />
    </picture>
  ) : (
    <div className={styles.imagePlaceholder} role="img" aria-label={`${slide.title}, ${label}`}>
      <span>{label}</span>
    </div>
  );
}

export function ProjectGalleryFrame({
  slide,
  label,
  sizes,
  animated = false,
  reduceMotion = false,
  onEntranceComplete,
}: Readonly<ProjectGalleryFrameProps>) {
  return (
    <div className={styles.galleryFrame} data-project-gallery-frame>
      {animated ? (
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            className={styles.imageEntrance}
            key={slide.id}
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={{
              hidden: { opacity: 0, scale: reduceMotion ? 1 : 0.96 },
              visible: {
                opacity: 1,
                scale: 1,
                transition: { duration: reduceMotion ? 0 : 0.72, ease: PREMIUM_EASE },
              },
              exit: {
                opacity: 0,
                scale: reduceMotion ? 1 : 0.985,
                transition: { duration: reduceMotion ? 0 : 0.18, ease: 'easeIn' },
              },
            }}
            onAnimationComplete={(definition) => {
              if (definition === 'visible') {
                onEntranceComplete?.();
              }
            }}
          >
            <ProjectGalleryMedia slide={slide} label={label} sizes={sizes} />
          </motion.div>
        </AnimatePresence>
      ) : (
        <div className={styles.imageEntrance}>
          <ProjectGalleryMedia slide={slide} label={label} sizes={sizes} />
        </div>
      )}
    </div>
  );
}
