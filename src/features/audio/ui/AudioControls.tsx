'use client';

import type { ChangeEvent, ReactElement } from 'react';
import { useCallback, useMemo } from 'react';

import { useAudioDirector } from '../model/useStarlightAudio';

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

  const icon = useMemo(() => (muted || volume <= 0.001 ? MUTE_ICON : VOLUME_ICON), [muted, volume]);
  const percent = useMemo(() => (muted ? 0 : formatVolume(volume)), [muted, volume]);

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
        aria-label={muted ? 'Unmute sound' : 'Mute sound'}
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

