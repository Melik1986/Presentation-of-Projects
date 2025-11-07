'use client';

import type { ReactElement } from 'react';
import { useCallback, useLayoutEffect } from 'react';

import { useAudioDirector } from '../model/useStarlightAudio';

type PreloaderTrackProps = {
  catalogId?: string;
};

const DEFAULT_CATALOG_ID = 'home';

export function PreloaderTrack({
  catalogId = DEFAULT_CATALOG_ID,
}: PreloaderTrackProps): ReactElement | null {
  const {
    actions: { setHome, enterCatalog, leaveCatalog, resume },
  } = useAudioDirector();

  const manageTrack = useCallback(() => {
    if (catalogId === 'home') {
      void resume().then(() => setHome());
      return () => {
        void leaveCatalog();
      };
    }

    void resume().then(() => enterCatalog(catalogId));
    return () => {
      void leaveCatalog().then(() => setHome());
    };
  }, [catalogId, resume, setHome, enterCatalog, leaveCatalog]);

  useLayoutEffect(() => manageTrack(), [manageTrack]);

  return null;
}
