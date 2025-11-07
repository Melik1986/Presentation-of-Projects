'use client';

import { ReactLenis } from 'lenis/react';
import { useCallback, useLayoutEffect } from 'react';

import { AudioUIPanel, useAudioDirector } from '@/features/audio';
import { StickyCards } from '@/features/sticky-cards';

export default function StickyPage() {
  const {
    actions: { enterCatalog, leaveCatalog, setHome, resume },
  } = useAudioDirector();

  const manageScene = useCallback(() => {
    void resume().then(() => enterCatalog('nextjs'));

    return () => {
      void leaveCatalog().then(() => setHome());
    };
  }, [resume, enterCatalog, leaveCatalog, setHome]);

  useLayoutEffect(() => manageScene(), [manageScene]);

  return (
    <>
      <ReactLenis root />
      <section
        className="intro"
        style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <h1>The Foundations</h1>
      </section>

      <StickyCards />

      <section
        className="outro"
        style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <h1>Ends in Form</h1>
      </section>

      <AudioUIPanel className="audio-panel-fixed" />
    </>
  );
}
