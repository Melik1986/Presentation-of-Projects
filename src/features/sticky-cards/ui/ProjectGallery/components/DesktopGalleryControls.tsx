import styles from '../ProjectGallery.module.css';

import type { DesktopGalleryControlsProps } from '../types/projectGallery.types';

export function DesktopGalleryControls({ goPrev, goNext, disabled }: DesktopGalleryControlsProps) {
  return (
    <div className={styles.navigation} aria-label="Gallery navigation">
      <button type="button" onClick={goPrev} aria-label="Previous image" disabled={disabled}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M19 12H5m7 7-7-7 7-7" />
        </svg>
      </button>
      <button type="button" onClick={goNext} aria-label="Next image" disabled={disabled}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M5 12h14m-7-7 7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}
