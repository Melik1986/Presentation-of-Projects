'use client';

import { gsap } from 'gsap';

import {
  ANALYSER_FFT_SIZE,
  ANALYSER_RESOLUTION,
  ANALYSER_SMOOTHING,
  CROSSFADE_SECONDS,
  DEFAULT_SETTINGS,
  LEVELS,
  SETTINGS_STORAGE_KEY,
} from './constants';
import { detectPlatform } from '../services/platform-detector';
import { SoundCloudAdapter } from '../services/soundcloud-widget-adapter';
import { YouTubeAdapter } from '../services/youtube-adapter';

import type {
  AudioConfig,
  CatalogConfig,
  DirectorSettings,
  DirectorStateSnapshot,
  Platform,
  PlatformAdapter,
  TrackBundle,
} from './types';

const EMPTY_BYTE_ARRAY = new Uint8Array(0);

class AudioDirector {
  private readonly isBrowser: boolean;
  private context: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  private eqData: Uint8Array<ArrayBuffer> = new Uint8Array(new ArrayBuffer(ANALYSER_RESOLUTION));
  private tracks = new Map<string, TrackBundle>();
  private config: AudioConfig = { homeTrack: null, catalogs: [] };
  private currentCatalogId: string | null = null;
  private previewCatalogId: string | null = null;
  private settings: DirectorSettings = { ...DEFAULT_SETTINGS };

  constructor() {
    this.isBrowser = typeof window !== 'undefined';

    if (this.isBrowser) {
      this.loadSettings();
      document.addEventListener('visibilitychange', this.handleVisibilityChange, false);
    }
  }

  /**
   * Disposes all audio resources and cleans up
   */
  dispose(): void {
    if (!this.isBrowser) {
      return;
    }

    document.removeEventListener('visibilitychange', this.handleVisibilityChange, false);

    this.tracks.forEach((track) => {
      this.detachTrack(track);
    });
    this.tracks.clear();

    void this.context?.close?.();
    this.context = null;
    this.masterGain = null;
    this.analyser = null;
  }

  private ensureContext(): AudioContext | null {
    if (!this.isBrowser) {
      return null;
    }

    if (!this.context) {
      const extendedWindow = window as typeof window & {
        webkitAudioContext?: typeof AudioContext;
      };
      const AudioContextCtor = window.AudioContext ?? extendedWindow.webkitAudioContext;
      if (!AudioContextCtor) {
        console.warn('AudioDirector: AudioContext is not supported in this environment');
        return null;
      }
      this.context = new AudioContextCtor();
      this.masterGain = this.context.createGain();
      this.masterGain.gain.value = this.settings.muted ? 0 : this.settings.volume;

      this.analyser = this.context.createAnalyser();
      this.analyser.fftSize = ANALYSER_FFT_SIZE;
      this.analyser.smoothingTimeConstant = ANALYSER_SMOOTHING;

      this.masterGain.connect(this.analyser);
      this.analyser.connect(this.context.destination);
    }

    return this.context;
  }

  async resumeContext(): Promise<void> {
    const ctx = this.ensureContext();
    if (!ctx) {
      return;
    }

    if (ctx.state === 'suspended') {
      try {
        await ctx.resume();
      } catch (error) {
        console.warn('AudioDirector: failed to resume AudioContext', error);
      }
    }
  }

  async resumeContextOnUserGesture(): Promise<void> {
    if (!this.isBrowser) {
      return;
    }

    const ctx = this.ensureContext();
    if (!ctx) {
      return;
    }

    if (ctx.state === 'suspended') {
      try {
        await ctx.resume();
      } catch (error) {
        console.warn('AudioDirector: failed to resume AudioContext on user gesture', error);
      }
    }
  }

  private handleVisibilityChange = (): void => {
    if (!this.context) {
      return;
    }

    if (document.visibilityState === 'visible' && this.context.state === 'suspended') {
      void this.context.resume();
    }
  };

  private loadSettings(): void {
    try {
      const saved = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<DirectorSettings>;
        this.settings = {
          ...DEFAULT_SETTINGS,
          ...parsed,
        };
      }
    } catch (error) {
      console.warn('AudioDirector: could not load settings', error);
      this.settings = { ...DEFAULT_SETTINGS };
    }
  }

  private persistSettings(): void {
    try {
      window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(this.settings));
    } catch (error) {
      console.warn('AudioDirector: could not persist settings', error);
    }
  }

  /**
   * Sets audio configuration and prepares all tracks
   * @param config - Audio configuration with tracks
   */
  async setConfig(config: AudioConfig): Promise<void> {
    if (!this.isBrowser) {
      return;
    }

    this.config = {
      homeTrack: config.homeTrack ?? null,
      catalogs: Array.isArray(config.catalogs) ? config.catalogs : [],
    };

    if (this.config.homeTrack) {
      await this.prepareTrack('home', this.config.homeTrack);
    }

    await Promise.all(
      this.config.catalogs.map(async (catalog) => {
        if (catalog?.id && catalog.track) {
          await this.prepareTrack(catalog.id, catalog.track);
        }
      })
    );
  }

  /**
   * Creates platform adapter based on URL
   * @param platform - Platform type
   * @returns Platform adapter instance
   */
  private createAdapter(platform: Platform): PlatformAdapter | null {
    switch (platform) {
      case 'youtube':
        return new YouTubeAdapter();
      case 'soundcloud':
        return new SoundCloudAdapter();
      default:
        return null;
    }
  }

  /**
   * Creates hidden container for platform player
   * @param id - Track ID
   * @returns Container ID
   */
  private createHiddenContainer(id: string): string {
    const containerId = `audio-player-${id}`;
    let container = document.getElementById(containerId);

    if (!container) {
      container = document.createElement('div');
      container.id = containerId;
      container.style.cssText =
        'position:fixed;top:-9999px;left:-9999px;width:0;height:0;opacity:0;pointer-events:none;overflow:hidden;';
      document.body.appendChild(container);
    }

    return containerId;
  }

  /**
   * Prepares track with platform adapter
   * @param id - Track ID
   * @param trackUrl - Track URL
   * @returns Track bundle or null
   */
  private async prepareTrack(id: string, trackUrl: string | null): Promise<TrackBundle | null> {
    if (!this.isBrowser || !trackUrl) {
      return null;
    }

    const existing = this.tracks.get(id);
    if (existing) {
      return existing;
    }

    return await this.initializeTrack(id, trackUrl);
  }

  /**
   * Initializes track with platform adapter
   * @param id - Track ID
   * @param trackUrl - Track URL
   */
  private async initializeTrack(id: string, trackUrl: string): Promise<TrackBundle | null> {
    const context = this.ensureContext();
    if (!context) {
      return null;
    }

    const platform = detectPlatform(trackUrl);
    const adapter = this.createAdapter(platform);

    if (!adapter) {
      console.error(`AudioDirector: unsupported platform for ${trackUrl}`);
      return null;
    }

    return await this.setupTrackBundle(id, trackUrl, platform, adapter, context);
  }

  /**
   * Sets up track bundle with adapter
   */
  private async setupTrackBundle(
    id: string,
    url: string,
    platform: Platform,
    adapter: PlatformAdapter,
    context: AudioContext
  ): Promise<TrackBundle | null> {
    try {
      if (context.state === 'closed') {
        throw new Error('AudioContext is closed');
      }

      const containerId = this.createHiddenContainer(id);
      await adapter.initialize(containerId, url);

      const gain = context.createGain();
      gain.gain.value = 0;
      gain.connect(this.masterGain!);

      const bundle: TrackBundle = {
        id,
        url,
        platform,
        adapter,
        element: adapter.getElement(),
        source: null,
        gain,
        level: 0,
      };

      this.tracks.set(id, bundle);
      return bundle;
    } catch (error) {
      this.handleTrackError(id, url, error);
      adapter.destroy();
      return null;
    }
  }

  /**
   * Handles track loading error
   */
  private handleTrackError(id: string, url: string, error: unknown): void {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`AudioDirector: failed to prepare track ${id} from ${url}:`, message);
  }

  /**
   * Detaches and destroys track resources
   * @param track - Track bundle to detach
   */
  private detachTrack(track: TrackBundle): void {
    try {
      if (track.adapter) {
        track.adapter.destroy();
      }
      if (track.source) {
        track.source.disconnect();
      }
      if (track.gain) {
        track.gain.disconnect();
      }
    } catch (error) {
      console.warn('AudioDirector: detachTrack error', error);
    }
  }

  /**
   * Plays track using platform adapter
   * @param track - Track bundle to play
   */
  private async playTrack(track: TrackBundle | null): Promise<void> {
    if (!track?.adapter) {
      return;
    }

    try {
      await track.adapter.play();
    } catch (error) {
      const err = error as Error;
      if (err.name !== 'AbortError') {
        console.warn('AudioDirector: play rejected', error);
      }
    }
  }

  /**
   * Pauses track using platform adapter
   * @param track - Track bundle to pause
   */
  private async pauseTrack(track: TrackBundle | null): Promise<void> {
    if (!track?.adapter) {
      return;
    }

    try {
      await track.adapter.pause();
    } catch (error) {
      console.warn('AudioDirector: pause error', error);
    }
  }

  /**
   * Stops all tracks except specified one
   * @param keepTrackId - Track ID to keep playing
   */
  private stopAllExcept(keepTrackId: string | null): void {
    this.tracks.forEach((track) => {
      if (track.id !== keepTrackId) {
        gsap.killTweensOf(track);
        track.level = 0;

        if (track.adapter) {
          void this.pauseTrack(track);
          void track.adapter.setVolume(0).catch(() => {
            // Ignore volume errors
          });
        }
      }
    });
  }

  /**
   * Fades track volume with crossfade using GSAP
   * @param track - Track bundle to fade
   * @param targetVolume - Target volume (0-1)
   */
  private fadeTrack(track: TrackBundle | null, targetVolume: number): void {
    if (!track?.adapter) {
      return;
    }

    gsap.killTweensOf(track);

    gsap.to(track, {
      level: targetVolume,
      duration: CROSSFADE_SECONDS,
      ease: 'sine.inOut',
      onUpdate: () => {
        if (track.adapter) {
          const effectiveVolume = this.settings.muted ? 0 : this.settings.volume;
          const finalVolume = track.level * effectiveVolume;
          void track.adapter.setVolume(finalVolume).catch(() => {
            // Ignore volume errors
          });
        }
      },
      onStart: () => {
        if (targetVolume > 0) {
          void this.playTrack(track);
        }
      },
      onComplete: () => {
        if (targetVolume <= 0.001) {
          void this.pauseTrack(track);
        }
      },
    });
  }

  /**
   * Updates volume for all active tracks based on master volume
   */
  private updateAllTracksVolume(): void {
    const effectiveVolume = this.settings.muted ? 0 : this.settings.volume;

    this.tracks.forEach((track) => {
      if (track.adapter && track.level > 0) {
        const finalVolume = track.level * effectiveVolume;
        void track.adapter.setVolume(finalVolume).catch(() => {
          // Ignore volume errors
        });
      }
    });
  }

  /**
   * Sets home track as active
   */
  async setHome(): Promise<void> {
    await this.resumeContext();
    this.stopAllExcept('home');

    const homeTrack = await this.prepareTrack('home', this.config.homeTrack);
    if (!homeTrack) {
      return;
    }

    this.fadeTrack(homeTrack, LEVELS.home);
    this.currentCatalogId = null;
    this.previewCatalogId = null;
  }

  /**
   * Previews catalog track on hover
   * @param catalogId - Catalog ID to preview
   */
  async previewCatalog(catalogId: string | null): Promise<void> {
    if (!catalogId || catalogId === this.currentCatalogId) {
      return;
    }

    await this.resumeContext();
    const catalog = this.config.catalogs.find((item) => item.id === catalogId);
    if (!catalog) {
      return;
    }

    const homeTrack = this.tracks.get('home') ?? null;
    const track = await this.prepareTrack(catalog.id, catalog.track);

    if (!track || !homeTrack) {
      return;
    }

    this.tracks.forEach((t) => {
      if (t.id !== 'home' && t.id !== catalogId) {
        this.fadeTrack(t, 0);
      }
    });

    this.previewCatalogId = catalogId;
    this.fadeTrack(homeTrack, LEVELS.homeHover);
    this.fadeTrack(track, LEVELS.preview);
  }

  /**
   * Enters catalog and plays its track
   * @param catalogId - Catalog ID to enter
   */
  async enterCatalog(catalogId: string | null): Promise<void> {
    if (!catalogId) {
      return;
    }

    await this.resumeContext();
    this.stopAllExcept(catalogId);

    const catalog = this.config.catalogs.find((item) => item.id === catalogId);
    if (!catalog) {
      return;
    }

    const track = await this.prepareTrack(catalog.id, catalog.track);
    if (!track) {
      return;
    }

    this.currentCatalogId = catalogId;
    this.previewCatalogId = null;
    this.fadeTrack(track, LEVELS.active);
  }

  /**
   * Leaves current catalog and returns to home
   */
  async leaveCatalog(): Promise<void> {
    await this.resumeContext();
    this.stopAllExcept('home');

    const homeTrack = await this.prepareTrack('home', this.config.homeTrack);
    if (homeTrack) {
      this.fadeTrack(homeTrack, LEVELS.home);
    }

    this.currentCatalogId = null;
    this.previewCatalogId = null;
  }

  /**
   * Toggles mute state
   * @param forcedValue - Optional forced mute value
   */
  async toggleMute(forcedValue?: boolean): Promise<void> {
    await this.resumeContext();
    const muted = typeof forcedValue === 'boolean' ? forcedValue : !this.settings.muted;
    this.settings.muted = muted;

    if (this.masterGain) {
      gsap.killTweensOf(this.masterGain.gain);
      gsap.to(this.masterGain.gain, {
        value: muted ? 0 : this.settings.volume,
        duration: 0.6,
        ease: 'sine.inOut',
      });
    }

    this.updateAllTracksVolume();
    this.persistSettings();
  }

  /**
   * Sets master volume
   * @param value - Volume value (0-1)
   */
  async setVolume(value: number): Promise<void> {
    await this.resumeContext();
    const clamped = Math.min(Math.max(value, 0), 1);
    this.settings.volume = clamped;
    if (!this.settings.muted && this.masterGain) {
      gsap.killTweensOf(this.masterGain.gain);
      gsap.to(this.masterGain.gain, {
        value: clamped,
        duration: 0.5,
        ease: 'sine.inOut',
      });
    }
    this.updateAllTracksVolume();
    this.persistSettings();
  }

  /**
   * Gets current settings
   * @returns Director settings
   */
  getSettings(): DirectorSettings {
    return { ...this.settings };
  }

  /**
   * Gets current state snapshot
   * @returns State snapshot
   */
  getCurrentState(): DirectorStateSnapshot {
    return {
      activeCatalogId: this.currentCatalogId,
      previewCatalogId: this.previewCatalogId,
      isMuted: this.settings.muted,
      volume: this.settings.volume,
    };
  }

  /**
   * Gets analyser frequency data for visualization
   * @returns Frequency data array
   */
  getAnalyserFrequencies(): Uint8Array {
    if (!this.analyser) {
      return EMPTY_BYTE_ARRAY;
    }

    this.analyser.getByteFrequencyData(this.eqData);
    return this.eqData;
  }
}

const director = new AudioDirector();

export type { AudioConfig, CatalogConfig, DirectorSettings, DirectorStateSnapshot, TrackBundle };
export default director;
