'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';

import { useAudioDirector } from '@/features/audio';
import { getAllCatalogs, getHomepageContent } from '@/shared/lib/catalog-loader';

import styles from './Wildyriftian.module.css';
import { generateFolderRows } from '../model/data';
import {
  useFolderInteraction,
  useHeroTextAnimation,
  useMobileGsapAnimation,
  useMobileTouchHandlers,
  useOutsideClick,
  useWildyriftianAnimation,
} from '../model/hooks';

import type { WildyriftianProps } from '../model/types';

export function Wildyriftian({ className }: WildyriftianProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const {
    actions: { previewCatalog, setHome },
  } = useAudioDirector();

  const folderRows = generateFolderRows();
  const homepage = getHomepageContent();

  // Apply background gradient from config
  useLayoutEffect(() => {
    const container = containerRef.current;
    if (container && homepage.backgroundGradient) {
      container.style.setProperty('--home-bg-gradient', homepage.backgroundGradient);
    }
  }, [homepage.backgroundGradient]);

  // Apply folder gradients from catalogs
  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const catalogs = getAllCatalogs();
    catalogs.forEach((catalog) => {
      const folders = container.querySelectorAll(`[data-catalog="${catalog.id}"]`);
      folders.forEach((folder) => {
        if (catalog.theme.folderGradient) {
          (folder as HTMLElement).style.setProperty(
            '--folder-gradient',
            catalog.theme.folderGradient
          );
        }
      });
    });
  }, []);

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

  // Track previous active folder to hide it when switching
  const previousActiveFolderRef = useRef<string | null>(null);

  // Trigger GSAP animation when active folder changes (mobile only)
  useEffect(() => {
    // Check if touch device
    const isTouch = window.matchMedia('(pointer: coarse)').matches;

    if (!isTouch) {
      return;
    }

    // Hide previous folder if exists and different from current
    if (previousActiveFolderRef.current && previousActiveFolderRef.current !== activeFolderId) {
      animatePreviewHide(previousActiveFolderRef.current);
    }

    // Show new folder if exists
    if (activeFolderId) {
      animatePreviewShow(activeFolderId);
      previousActiveFolderRef.current = activeFolderId;
    } else {
      // Reset when no active folder
      previousActiveFolderRef.current = null;
    }
  }, [activeFolderId, animatePreviewShow, animatePreviewHide]);

  // Native touch handlers with passive: false (fixes preventDefault error)
  const handleActivate = useCallback(
    (catalogId: string) => {
      setActiveFolderId(catalogId);
      void previewCatalog(catalogId);
      // GSAP animation triggered by useEffect above
    },
    [setActiveFolderId, previewCatalog]
  );

  const handleReset = useCallback(() => {
    const isTouch = window.matchMedia('(pointer: coarse)').matches;

    // Hide current active folder before resetting state
    if (isTouch && activeFolderId) {
      animatePreviewHide(activeFolderId);
      previousActiveFolderRef.current = null;
    }

    resetActiveFolder();
  }, [activeFolderId, animatePreviewHide, resetActiveFolder]);

  useMobileTouchHandlers({
    containerRef,
    activeFolderId,
    onActivate: handleActivate,
  });

  useWildyriftianAnimation(containerRef);
  useHeroTextAnimation(heroRef);

  useOutsideClick({
    containerRef,
    isActive: !!activeFolderId,
    onOutsideClick: handleReset,
  });

  return (
    <div className={`${styles.wildyriftian} ${className || ''}`} ref={containerRef}>
      <div className={styles.hero} ref={heroRef}>
        <h1 className={`${styles.heroTitle} hero-title`}>{homepage.title}</h1>
        <p className={`${styles.heroDescription} hero-description`}>{homepage.description}</p>
      </div>

      <div className={styles.folders}>
        {folderRows.map((row, rowIndex) => (
          <div className={`row ${styles.row}`} key={rowIndex}>
            {row.map((folder) => (
              <Link
                href={`/sticky/${folder.catalogId}`}
                data-catalog={folder.catalogId}
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
