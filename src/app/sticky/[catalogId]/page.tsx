'use client';

import { ReactLenis } from 'lenis/react';
import { use, useCallback, useLayoutEffect } from 'react';

import { AudioUIPanel, useAudioDirector } from '@/features/audio';
import { StickyCards } from '@/features/sticky-cards';

interface StickyPageProps {
  params: Promise<{ catalogId: string }>;
}

export default function StickyPage({ params }: StickyPageProps) {
  const unwrappedParams = use(params);
  const catalogId = unwrappedParams.catalogId;

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
      <section className="intro flex h-screen items-center justify-center">
        <h1>The Foundations</h1>
      </section>

      <StickyCards />

      <section className="outro flex h-screen items-center justify-center">
        <h1>Ends in Form</h1>
      </section>

      <AudioUIPanel className="audio-panel-fixed" />
    </>
  );
}

