'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { useAudioDirector } from '../model/hooks/useStarlightAudio';

import type { ChangeEvent, ReactElement } from 'react';

const MUTE_ICON = '🔇';
const VOLUME_ICON = '🔊';

function formatVolume(value: number): number {
  return Math.round(value * 100);
}

export function AudioControls(): ReactElement {
  const {
    settings: { muted, volume },
    actions: { toggleMute, setVolume },
  } = useAudioDirector();

  // Prevent hydration mismatch by deferring client-specific rendering
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Server-safe defaults (always show unmuted state on server)
  const displayMuted = mounted ? muted : false;
  const displayVolume = mounted ? volume : 0.55;

  const icon = useMemo(
    () => (displayMuted || displayVolume <= 0.001 ? MUTE_ICON : VOLUME_ICON),
    [displayMuted, displayVolume]
  );
  const percent = useMemo(
    () => (displayMuted ? 0 : formatVolume(displayVolume)),
    [displayMuted, displayVolume]
  );

  const handleToggle = useCallback(() => {
    void toggleMute();
  }, [toggleMute]);

  const handleVolumeChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const rawValue = Number(event.target.value);
      if (Number.isFinite(rawValue)) {
        void setVolume(rawValue / 100);
      }
    },
    [setVolume]
  );

  return (
    <div className="audio-controls" role="group" aria-label="Audio settings">
      <button
        type="button"
        className="audio-controls__toggle"
        aria-label={displayMuted ? 'Unmute sound' : 'Mute sound'}
        onClick={handleToggle}
      >
        {icon}
      </button>

      <label className="audio-controls__slider" aria-label="Volume">
        <span className="sr-only">Volume</span>
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={percent}
          onChange={handleVolumeChange}
        />
      </label>
    </div>
  );
}
