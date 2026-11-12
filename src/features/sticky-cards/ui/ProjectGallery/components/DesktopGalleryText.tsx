import { AnimatePresence, motion } from 'motion/react';

import { PREMIUM_EASE } from '../constants';
import styles from '../ProjectGallery.module.css';

import type { DesktopGalleryTextProps } from '../types/projectGallery.types';
import type { Variants } from 'motion/react';

function getSlideVariants(reduceMotion: boolean): Variants {
  return {
    hidden: { opacity: 0, y: reduceMotion ? 0 : 4 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: reduceMotion ? 0 : 0.52,
        ease: PREMIUM_EASE,
        staggerChildren: reduceMotion ? 0 : 0.1,
        delayChildren: reduceMotion ? 0 : 0.04,
      },
    },
    exit: {
      opacity: 0,
      y: reduceMotion ? 0 : -2,
      transition: { duration: reduceMotion ? 0 : 0.18, ease: 'easeIn' },
    },
  };
}

function getCounterVariants(reduceMotion: boolean) {
  return {
    hidden: { opacity: 0, y: reduceMotion ? 0 : -6 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: reduceMotion ? 0 : 0.46, ease: PREMIUM_EASE },
    },
  };
}

function getTextVariants(reduceMotion: boolean) {
  return {
    hidden: { opacity: 0, y: reduceMotion ? 0 : 5 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: reduceMotion ? 0 : 0.52, ease: PREMIUM_EASE },
    },
  };
}

export function DesktopGalleryText({
  title,
  description,
  slideId,
  currentIndex,
  slideCount,
  reduceMotion,
  onEntranceComplete,
}: DesktopGalleryTextProps) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        className={styles.slideText}
        key={`${slideId}-text`}
        aria-live="polite"
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={getSlideVariants(reduceMotion)}
      >
        <motion.span className={styles.slideCounter} variants={getCounterVariants(reduceMotion)}>
          {String(currentIndex + 1).padStart(2, '0')} / {String(slideCount).padStart(2, '0')}
        </motion.span>
        <motion.h2 variants={getTextVariants(reduceMotion)}>{title}</motion.h2>
        <motion.p
          onAnimationComplete={(definition) => {
            if (definition === 'visible') {
              onEntranceComplete();
            }
          }}
          variants={getTextVariants(reduceMotion)}
        >
          {description}
        </motion.p>
      </motion.div>
    </AnimatePresence>
  );
}
