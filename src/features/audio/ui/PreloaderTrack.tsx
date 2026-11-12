'use client';

import { useCallback, useLayoutEffect } from 'react';

import { useAudioDirector } from '../model/hooks/useStarlightAudio';

import type { ReactElement } from 'react';

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
        leaveCatalog();
      };
    }

    void resume().then(() => enterCatalog(catalogId));
    return () => {
      leaveCatalog();
      void setHome();
    };
  }, [catalogId, resume, setHome, enterCatalog, leaveCatalog]);

  useLayoutEffect(() => manageTrack(), [manageTrack]);

  return null;
}
