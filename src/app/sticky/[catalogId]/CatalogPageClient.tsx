'use client';

import { ReactLenis } from 'lenis/react';
import { useLayoutEffect, useRef } from 'react';

import { AudioUIPanel, useAudioDirector } from '@/features/audio';
import { StickyCards, useCatalogTitleAnimation } from '@/features/sticky-cards';

import styles from './CatalogPageClient.module.css';

import type { ExtendedCatalog } from '@/shared/types/catalog';

interface CatalogPageClientProps {
  catalog: ExtendedCatalog;
  catalogId: string;
}

export function shouldEnterCatalog(isReady: boolean, catalogId: string): boolean {
  return isReady && Boolean(catalogId);
}

export function CatalogPageClient({ catalog, catalogId }: Readonly<CatalogPageClientProps>) {
  const catalogPageRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const {
    actions: { enterCatalog },
    isReady,
  } = useAudioDirector();

  // Apply theme CSS variables
  useLayoutEffect(() => {
    const element = catalogPageRef.current;
    if (element) {
      element.style.setProperty('--page-bg', catalog.theme.backgroundColor);
      element.style.setProperty('--card-bg', catalog.theme.cardBackground);
      element.style.setProperty('--text-color', catalog.theme.textColor);
      element.style.setProperty('--accent-color', catalog.theme.accentColor);
      element.style.setProperty('--title-gradient', catalog.theme.titleGradient);

      if (catalog.theme.pageBackground) {
        element.style.setProperty('--page-bg-gradient', catalog.theme.pageBackground);
      }
    }
  }, [catalog.theme]);

  // Manage audio scene (only depend on catalogId to avoid infinite loop)
  useLayoutEffect(() => {
    if (!shouldEnterCatalog(isReady, catalogId)) {
      return;
    }

    void enterCatalog(catalogId);
  }, [catalogId, enterCatalog, isReady]);

  useCatalogTitleAnimation(titleRef, catalogPageRef);

  return (
    <>
      <ReactLenis root />
      <div ref={catalogPageRef} className={styles.catalogPage}>
        <section className={styles.intro}>
          <h1 className={`${styles.introTitle} catalog-title`} ref={titleRef}>
            {catalog.content.introTitle}
          </h1>
        </section>

        <StickyCards cards={catalog.content.cards} catalogId={catalog.id} />
      </div>

      <AudioUIPanel className="audio-panel-fixed" />
    </>
  );
}
