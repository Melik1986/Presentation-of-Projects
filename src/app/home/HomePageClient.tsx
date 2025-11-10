'use client';

import { useLayoutEffect, useState } from 'react';

import { AudioUIPanel, useAudioDirector } from '@/features/audio';
import { Wildyriftian } from '@/features/effects';
import { SmileyLoader } from '@/shared/ui';

export function HomePageClient() {
  const [isLoading, setIsLoading] = useState(true);
  const {
    actions: { setHome, resume },
  } = useAudioDirector();

  // Return to home audio scene when mounting
  useLayoutEffect(() => {
    void resume().then(() => setHome());

    // Hide smiley after 1 second
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {isLoading && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#ffffff',
            zIndex: 9999,
          }}
        >
          <SmileyLoader size={128} color1="hsl(193,90%,50%)" color2="hsl(223,90%,50%)" />
        </div>
      )}
      <Wildyriftian />
      <AudioUIPanel className="audio-panel-fixed" />
    </>
  );
}
