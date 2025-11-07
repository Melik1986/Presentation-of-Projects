'use client';

import { ReactLenis } from 'lenis/react';
import { useCallback, useLayoutEffect } from 'react';

import { AudioUIPanel, useAudioDirector } from '@/features/audio';
import { StickyCards } from '@/features/sticky-cards';

import type { ExtendedCatalog } from '@/shared/types/catalog';

interface CatalogPageClientProps {
  catalog: ExtendedCatalog;
  catalogId: string;
}

export function CatalogPageClient({ catalog, catalogId }: CatalogPageClientProps) {
  const {
    actions: { enterCatalog, leaveCatalog, setHome, resume },
  } = useAudioDirector();

  const manageScene = useCallback(() => {
    void resume().then(() => enterCatalog(catalogId));

    return () => {
      void leaveCatalog().then(() => setHome());
    };
  }, [resume, enterCatalog, leaveCatalog, setHome, catalogId]);

  useLayoutEffect(() => manageScene(), [manageScene]);

  return (
    <>
      <ReactLenis root />
      <div
        className="catalog-page"
        style={
          {
            '--page-bg': catalog.theme.backgroundColor,
            '--card-bg': catalog.theme.cardBackground,
            '--text-color': catalog.theme.textColor,
            '--accent-color': catalog.theme.accentColor,
            backgroundColor: catalog.theme.backgroundColor,
            color: catalog.theme.textColor,
          } as React.CSSProperties
        }
      >
        <section className="intro flex h-screen items-center justify-center">
          <h1>{catalog.content.introTitle}</h1>
        </section>

        <StickyCards cards={catalog.content.cards} />

        <section className="outro flex h-screen items-center justify-center">
          <h1>{catalog.content.outroTitle}</h1>
        </section>
      </div>

      <AudioUIPanel className="audio-panel-fixed" />
    </>
  );
}
