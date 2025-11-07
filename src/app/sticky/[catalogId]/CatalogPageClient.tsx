'use client';

import { ReactLenis } from 'lenis/react';
import { useCallback, useLayoutEffect, useRef } from 'react';

import { AudioUIPanel, useAudioDirector } from '@/features/audio';
import { StickyCards } from '@/features/sticky-cards';

import styles from './CatalogPageClient.module.css';

import type { ExtendedCatalog } from '@/shared/types/catalog';

interface CatalogPageClientProps {
  catalog: ExtendedCatalog;
  catalogId: string;
}

export function CatalogPageClient({ catalog, catalogId }: CatalogPageClientProps) {
  const catalogPageRef = useRef<HTMLDivElement>(null);
  const {
    actions: { enterCatalog, leaveCatalog, setHome, resume },
  } = useAudioDirector();

  const manageScene = useCallback(() => {
    void resume().then(() => enterCatalog(catalogId));

    return () => {
      void leaveCatalog().then(() => setHome());
    };
  }, [resume, enterCatalog, leaveCatalog, setHome, catalogId]);

  useLayoutEffect(() => {
    const element = catalogPageRef.current;
    if (element) {
      element.style.setProperty('--page-bg', catalog.theme.backgroundColor);
      element.style.setProperty('--card-bg', catalog.theme.cardBackground);
      element.style.setProperty('--text-color', catalog.theme.textColor);
      element.style.setProperty('--accent-color', catalog.theme.accentColor);
    }
  }, [catalog.theme]);

  useLayoutEffect(() => manageScene(), [manageScene]);

  return (
    <>
      <ReactLenis root />
      <div ref={catalogPageRef} className={styles.catalogPage}>
        <section className="intro flex h-screen items-center justify-center" />

        <StickyCards cards={catalog.content.cards} />

        <section className="outro flex h-screen items-center justify-center" />
      </div>

      <AudioUIPanel className="audio-panel-fixed" />
    </>
  );
}
