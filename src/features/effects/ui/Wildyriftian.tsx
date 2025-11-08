'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useRef } from 'react';

import { useAudioDirector } from '@/features/audio';
import { getHomepageContent } from '@/shared/lib/catalog-loader';

import styles from './Wildyriftian.module.css';
import { generateFolderRows } from '../model/data';
import {
  useFolderInteraction,
  useMobileGsapAnimation,
  useMobileTouchHandlers,
  useOutsideClick,
  useWildyriftianAnimation,
} from '../model/hooks';

import type { WildyriftianProps } from '../model/types';

export function Wildyriftian({ className }: WildyriftianProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const {
    actions: { previewCatalog, setHome },
  } = useAudioDirector();

  const folderRows = generateFolderRows();
  const homepage = getHomepageContent();

  const {
    activeFolderId,
    setActiveFolderId,
    handleFolderHover,
    handleFolderLeave,
    handleFolderClick,
    resetActiveFolder,
  } = useFolderInteraction({ previewCatalog, setHome });

  // Mobile GSAP animations (triggered by React state)
  const { animatePreviewShow, animatePreviewHide } = useMobileGsapAnimation();

  // Native touch handlers with passive: false (fixes preventDefault error)
  const handleActivate = useCallback(
    (catalogId: string) => {
      setActiveFolderId(catalogId);
      void previewCatalog(catalogId);
      // Trigger GSAP animation for mobile
      animatePreviewShow(catalogId);
    },
    [setActiveFolderId, previewCatalog, animatePreviewShow]
  );

  const handleReset = useCallback(() => {
    if (activeFolderId) {
      animatePreviewHide(activeFolderId);
    }
    resetActiveFolder();
  }, [activeFolderId, animatePreviewHide, resetActiveFolder]);

  // Trigger GSAP animation when active folder changes
  useEffect(() => {
    if (activeFolderId) {
      animatePreviewShow(activeFolderId);
    }
  }, [activeFolderId, animatePreviewShow]);

  useMobileTouchHandlers({
    containerRef,
    activeFolderId,
    onActivate: handleActivate,
  });

  useWildyriftianAnimation(containerRef);

  useOutsideClick({
    containerRef,
    isActive: !!activeFolderId,
    onOutsideClick: handleReset,
  });

  return (
    <div className={`${styles.wildyriftian} ${className || ''}`} ref={containerRef}>
      <div className={styles.hero}>
        <h1 className={styles.heroTitle}>{homepage.title}</h1>
        <p className={styles.heroDescription}>{homepage.description}</p>
      </div>

      <div className={styles.folders}>
        {folderRows.map((row, rowIndex) => (
          <div className={`row ${styles.row}`} key={rowIndex}>
            {row.map((folder) => (
              <Link
                href={`/sticky/${folder.catalogId}`}
                className={`folder ${styles.folder} ${
                  styles[folder.variant.replace('-', '') as 'variant1' | 'variant2' | 'variant3']
                } ${activeFolderId === folder.catalogId ? 'active' : ''}`}
                key={folder.index}
                onClick={(e) => handleFolderClick(e, folder.catalogId)}
                onMouseEnter={() => handleFolderHover(folder.catalogId)}
                onMouseLeave={handleFolderLeave}
              >
                <div className={`folder-preview ${styles.folderPreview}`}>
                  {folder.images.map((image) => (
                    <div className={`folder-preview-img ${styles.folderPreviewImg}`} key={image}>
                      <Image
                        src={image}
                        alt={folder.name}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
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
