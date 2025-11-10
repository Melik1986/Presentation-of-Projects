'use client';

import { useLayoutEffect } from 'react';

import { AudioUIPanel, useAudioDirector } from '@/features/audio';
import { Wildyriftian } from '@/features/effects';

export function HomePageClient() {
  const {
    actions: { setHome, resume },
  } = useAudioDirector();

  // Return to home audio scene when mounting
  useLayoutEffect(() => {
    void resume().then(() => setHome());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Wildyriftian />
      <AudioUIPanel className="audio-panel-fixed" />
    </>
  );
}
