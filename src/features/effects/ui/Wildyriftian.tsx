'use client';

import { useRef } from 'react';

import { useAudioDirector } from '@/features/audio';
import { getHomepageContent } from '@/shared/lib/catalog-loader';

import { DesktopFolders } from './DesktopFolders';
import { MobileGlassFolders } from './MobileGlassFolders/MobileGlassFolders';
import styles from './Wildyriftian.module.css';
import { generateFolderRows } from '../model/data';
import {
  useFolderInteraction,
  useHeroTextAnimation,
  useMobilePreviewSync,
  useMobileTouchHandlers,
  useOutsideClick,
  useWildyriftianAnimation,
  useWildyriftianTheme,
} from '../model/hooks';

import type { WildyriftianProps } from '../model/types';

export function Wildyriftian({ className }: Readonly<WildyriftianProps>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const {
    actions: { previewCatalog, setHome },
  } = useAudioDirector();

  const folderRows = generateFolderRows();
  const homepage = getHomepageContent();

  useWildyriftianTheme(containerRef, homepage.backgroundGradient);

  const {
    activeFolderId,
    setActiveFolderId,
    handleFolderHover,
    handleFolderLeave,
    handleFolderClick,
    resetActiveFolder,
  } = useFolderInteraction({ previewCatalog, setHome });

  const { handleActivate, handleReset } = useMobilePreviewSync({
    activeFolderId,
    setActiveFolderId,
    previewCatalog,
    resetActiveFolder,
  });

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

      <DesktopFolders
        folderRows={folderRows}
        activeFolderId={activeFolderId}
        onFolderClick={handleFolderClick}
        onFolderHover={handleFolderHover}
        onFolderLeave={handleFolderLeave}
      />

      <div className={styles.mobileFolders}>
        <MobileGlassFolders previewCatalog={previewCatalog} setHome={setHome} />
      </div>
    </div>
  );
}
