import { gsap } from 'gsap';

import { CROSSFADE_SECONDS } from './constants';

import type { DirectorSettings, TrackBundle } from './types';

type FadeCallbacks = {
  playTrack: (track: TrackBundle) => Promise<void>;
  pauseTrack: (track: TrackBundle) => Promise<void>;
};

function effectiveMasterVolume(settings: DirectorSettings): number {
  return settings.muted ? 0 : settings.volume;
}

function applyAdapterVolume(track: TrackBundle, volume: number): void {
  if (!track.adapter) {
    return;
  }
  void track.adapter.setVolume(volume).catch(() => {
    // Ignore volume errors
  });
}

/**
 * Crossfades a track's logical level and mirrors it to the platform adapter.
 */
export function fadeTrackLevel(
  track: TrackBundle | null,
  targetVolume: number,
  settings: DirectorSettings,
  callbacks: FadeCallbacks
): void {
  if (!track?.adapter) {
    return;
  }

  gsap.killTweensOf(track);
  gsap.to(track, {
    level: targetVolume,
    duration: CROSSFADE_SECONDS,
    ease: 'sine.inOut',
    onUpdate: () => {
      applyAdapterVolume(track, track.level * effectiveMasterVolume(settings));
    },
    onStart: () => {
      if (targetVolume > 0) {
        void callbacks.playTrack(track);
      }
    },
    onComplete: () => {
      if (targetVolume <= 0.001) {
        void callbacks.pauseTrack(track);
      }
    },
  });
}

/**
 * Soft-stops every track except the one to keep.
 */
export function stopAllTracksExcept(
  tracks: Map<string, TrackBundle>,
  keepTrackId: string | null,
  pauseTrack: (track: TrackBundle) => Promise<void>
): void {
  tracks.forEach((track) => {
    if (track.id === keepTrackId) {
      return;
    }
    gsap.killTweensOf(track);
    track.level = 0;
    if (!track.adapter) {
      return;
    }
    void pauseTrack(track);
    applyAdapterVolume(track, 0);
  });
}

/**
 * Pushes master volume into all currently audible tracks.
 */
export function syncActiveTracksVolume(
  tracks: Map<string, TrackBundle>,
  settings: DirectorSettings
): void {
  const master = effectiveMasterVolume(settings);
  tracks.forEach((track) => {
    if (!track.adapter || track.level <= 0) {
      return;
    }
    applyAdapterVolume(track, track.level * master);
  });
}
