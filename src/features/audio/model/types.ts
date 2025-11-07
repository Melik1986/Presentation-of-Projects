export interface CatalogConfig {
  id: string;
  name?: string;
  track: string;
}

export interface AudioConfig {
  homeTrack: string | null;
  catalogs: CatalogConfig[];
}

export interface DirectorSettings {
  volume: number;
  muted: boolean;
}

export interface DirectorStateSnapshot {
  activeCatalogId: string | null;
  previewCatalogId: string | null;
  isMuted: boolean;
  volume: number;
}

/**
 * Platform types for audio adapters
 */
export type Platform = 'youtube' | 'soundcloud' | 'unknown';

/**
 * Platform adapter interface for managing audio playback
 */
export interface PlatformAdapter {
  platform: Platform;
  initialize(containerId: string, url: string): Promise<void>;
  play(): Promise<void>;
  pause(): Promise<void>;
  setVolume(volume: number): Promise<void>;
  getCurrentTime(): number;
  getDuration(): number;
  seekTo(seconds: number): Promise<void>;
  destroy(): void;
  onEnded(callback: () => void): void;
  getElement(): HTMLElement | null;
}

/**
 * Track bundle for managing audio tracks with platform adapters
 */
export interface TrackBundle {
  id: string;
  url: string;
  platform: Platform;
  adapter: PlatformAdapter | null;
  element: HTMLElement | null;
  source: MediaElementAudioSourceNode | null;
  gain: GainNode | null;
  level: number;
}

/**
 * @deprecated Legacy SoundCloud API types - kept for backward compatibility
 * These will be removed in future versions
 */
export interface SoundCloudFormat {
  protocol?: string | null;
  mime_type?: string | null;
}

export interface SoundCloudTranscoding {
  url: string;
  preset?: string | null;
  duration?: number | null;
  quality?: string | null;
  format?: SoundCloudFormat | null;
}

export interface SoundCloudMedia {
  transcodings?: SoundCloudTranscoding[] | null;
}

export interface SoundCloudUser {
  avatar_url?: string | null;
}

export interface SoundCloudTrack {
  media?: SoundCloudMedia | null;
  artwork_url?: string | null;
  title?: string | null;
  permalink_url?: string | null;
  user?: SoundCloudUser | null;
}

export interface SoundCloudStreamInfo {
  url: string;
}

export interface SoundCloudResolvedTrack {
  streamUrl: string;
  artworkUrl: string | null;
  title: string;
  permalinkUrl: string;
}

export interface AudioDirectorActions {
  setHome: () => Promise<void>;
  previewCatalog: (catalogId: string | null) => Promise<void>;
  enterCatalog: (catalogId: string | null) => Promise<void>;
  leaveCatalog: () => Promise<void>;
  toggleMute: (forcedValue?: boolean) => Promise<void>;
  setVolume: (value: number) => Promise<void>;
  resume: () => Promise<void>;
}

export interface AudioDirectorContextValue {
  isReady: boolean;
  config: AudioConfig;
  state: DirectorStateSnapshot;
  settings: DirectorSettings;
  actions: AudioDirectorActions;
  getAnalyserData: () => Uint8Array;
}
