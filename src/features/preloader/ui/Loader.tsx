'use client';

import { COMPANY_ICONS, SPRITE_PATH } from '../model/constants';
import { useLoaderAnimation } from '../model/useLoaderAnimation';

import styles from './Loader.module.css';
import { SpriteIcon } from './SpriteIcon';

function PreloaderContent() {
  return (
    <div className={styles.preloaderWrapper}>
      <div className={styles.preloaderContent}>
        <img
          src="/preloader-icons/logo.svg"
          alt="Brand logo"
          width={160}
          height={160}
          className={styles.preloaderLogo}
        />

        {COMPANY_ICONS.map(({ name, width, height }) => (
          <SpriteIcon
            key={name}
            className={styles.preloaderCompanyIcon}
            name={name}
            sprite={SPRITE_PATH}
            width={width}
            height={height}
            aria-hidden
          />
        ))}

        <div className={styles.preloaderProgress}>
          <div className={styles.preloaderProgressBar} data-preloader-progress />
        </div>

        <div className={styles.preloaderEqualizer}>
          {/* Placeholder for equalizer - will be populated by audio module */}
        </div>
      </div>
    </div>
  );
}

export function Loader() {
  const { isHidden, containerProps } = useLoaderAnimation();

  if (isHidden) {
    return null;
  }

  return (
    <div className={styles.preloader} {...containerProps}>
      <PreloaderContent />
    </div>
  );
}

