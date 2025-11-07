'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';

import { setupWildyriftianAnimation } from '../model/animations';
import { defaultFolderRows } from '../model/data';
import type { WildyriftianProps } from '../model/types';

import styles from './Wildyriftian.module.css';

export function Wildyriftian({ className }: WildyriftianProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return undefined;
    }

    return setupWildyriftianAnimation(container);
  }, []);

  return (
    <div className={`${styles.wildyriftian} ${className || ''}`} ref={containerRef}>
      <nav className={styles.nav}>
        <p>Design Ledger</p>
        <p>Experiment 0492</p>
      </nav>

      <div className={styles.folders}>
        {defaultFolderRows.map((row, rowIndex) => (
          <div className={`row ${styles.row}`} key={rowIndex}>
            {row.map((folder) => (
              <Link
                href="/sticky"
                className={`folder ${styles.folder} ${
                  styles[folder.variant.replace('-', '') as 'variant1' | 'variant2' | 'variant3']
                }`}
                key={folder.index}
              >
                <div className={`folder-preview ${styles.folderPreview}`}>
                  {folder.images.map((image) => (
                    <div className={`folder-preview-img ${styles.folderPreviewImg}`} key={image}>
                      <img src={image} alt={folder.name} />
                    </div>
                  ))}
                </div>

                <div className={`folder-wrapper ${styles.folderWrapper}`}>
                  <div className={styles.folderIndex}>
                    <p>{folder.index}</p>
                  </div>
                  <div className={styles.folderName}>
                    <h1>{folder.name}</h1>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
