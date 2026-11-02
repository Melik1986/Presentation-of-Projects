'use client';

import { gsap } from 'gsap';

import { createLogger } from '@/shared/lib';

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

const logger = createLogger().child({ module: 'AudioDirector' });

const EMPTY_BYTE_ARRAY = new Uint8Array(0);

type TrackSetup = {
  id: string;
  url: string;
  platform: Platform;
  adapter: PlatformAdapter;
  context: AudioContext;
  generation: number;
};

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
  private visibilityAbortController: AbortController | null = null;
  private createdContainers = new Set<HTMLElement>();
  private pendingContainers = new Set<HTMLElement>();
  private pendingTracks = new Map<string, Promise<TrackBundle | null>>();
  private initializationGeneration = 0;
  private containerSequence = 0;

  constructor() {
    this.isBrowser = typeof window !== 'undefined';

    if (this.isBrowser) {
      this.loadSettings();

      // Использование AbortController для управления слушателем
      this.visibilityAbortController = new AbortController();
      document.addEventListener('visibilitychange', this.handleVisibilityChange, {
        signal: this.visibilityAbortController.signal,
      });
    }
  }

  /**
   * Disposes all audio resources and cleans up
   */
  dispose(): void {
    if (!this.isBrowser) {
      return;
    }

    this.initializationGeneration += 1;
    this.pendingTracks.clear();

    // Автоматическое удаление слушателя через AbortController
    if (this.visibilityAbortController) {
      this.visibilityAbortController.abort();
      this.visibilityAbortController = null;
    }

    // Удаление всех созданных контейнеров
    this.createdContainers.forEach((container) => {
      if (this.pendingContainers.has(container)) {
        return;
      }

      try {
        container.remove();
      } catch (error) {
        logger.warn('Failed to remove container:', error);
      } finally {
        this.createdContainers.delete(container);
      }
    });

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

    // Check if context is closed or needs recreation
    const needsRecreation = !this.context || this.context.state === 'closed';

    if (needsRecreation) {
      const extendedWindow = window as typeof window & {
        webkitAudioContext?: typeof AudioContext;
      };
      const AudioContextCtor = window.AudioContext ?? extendedWindow.webkitAudioContext;
      if (!AudioContextCtor) {
        logger.warn('AudioContext is not supported in this environment');
        return null;
      }

      // Clean up old context if it exists
      if (this.context && this.context.state !== 'closed') {
        try {
          void this.context.close();
        } catch {
          // Ignore close errors
        }
      }

      // Create new context and audio graph
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

  private isCurrentInitialization(
    context: AudioContext,
    masterGain: GainNode,
    generation: number
  ): boolean {
    return (
      generation === this.initializationGeneration &&
      this.context === context &&
      this.masterGain === masterGain
    );
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
        logger.warn('Failed to resume AudioContext:', error);
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
        logger.warn('Failed to resume AudioContext on user gesture:', error);
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
      logger.warn('Could not load settings:', error);
      this.settings = { ...DEFAULT_SETTINGS };
    }
  }

  private persistSettings(): void {
    try {
      window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(this.settings));
    } catch (error) {
      logger.warn('Could not persist settings:', error);
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

    const generation = ++this.initializationGeneration;
    this.pendingTracks.clear();
    this.config = {
      homeTrack: config.homeTrack ?? null,
      catalogs: Array.isArray(config.catalogs) ? config.catalogs : [],
    };

    if (this.config.homeTrack) {
      await this.prepareTrack('home', this.config.homeTrack, generation);
    }

    if (generation !== this.initializationGeneration) {
      return;
    }

    await Promise.all(
      this.config.catalogs.map(async (catalog) => {
        if (catalog?.id && catalog.track) {
          await this.prepareTrack(catalog.id, catalog.track, generation);
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
    const containerId = `audio-player-${id}-${++this.containerSequence}`;
    const container = document.createElement('div');
    container.id = containerId;
    container.style.cssText =
      'position:fixed;top:-9999px;left:-9999px;width:0;height:0;opacity:0;pointer-events:none;overflow:hidden;';
    document.body.appendChild(container);
    this.createdContainers.add(container);

    return containerId;
  }

  /**
   * Prepares track with platform adapter
   * @param id - Track ID
   * @param trackUrl - Track URL
   * @returns Track bundle or null
   */
  private async prepareTrack(
    id: string,
    trackUrl: string | null,
    generation = this.initializationGeneration
  ): Promise<TrackBundle | null> {
    if (!this.isBrowser || !trackUrl) {
      return null;
    }

    if (generation !== this.initializationGeneration) {
      return null;
    }

    const existing = this.tracks.get(id);
    if (existing) {
      return existing;
    }

    const pending = this.pendingTracks.get(id);
    if (pending) {
      return await pending;
    }

    const initialization = this.initializeTrack(id, trackUrl, generation);
    this.pendingTracks.set(id, initialization);
    try {
      return await initialization;
    } finally {
      if (this.pendingTracks.get(id) === initialization) {
        this.pendingTracks.delete(id);
      }
    }
  }

  /**
   * Initializes track with platform adapter
   * @param id - Track ID
   * @param trackUrl - Track URL
   */
  private async initializeTrack(
    id: string,
    trackUrl: string,
    generation: number
  ): Promise<TrackBundle | null> {
    const context = this.ensureContext();
    if (!context || generation !== this.initializationGeneration) {
      return null;
    }

    const platform = detectPlatform(trackUrl);
    const adapter = this.createAdapter(platform);

    if (!adapter) {
      logger.error({ trackUrl }, 'Unsupported platform');
      return null;
    }

    return await this.setupTrackBundle({
      id,
      url: trackUrl,
      platform,
      adapter,
      context,
      generation,
    });
  }

  /**
   * Sets up track bundle with adapter
   */
  private async setupTrackBundle(setup: TrackSetup): Promise<TrackBundle | null> {
    let container: HTMLElement | null = null;

    try {
      const masterGain = this.getTrackMasterGain(setup.context);

      const containerId = this.createHiddenContainer(setup.id);
      container = document.getElementById(containerId);
      if (!container) {
        throw new Error('Audio player container was not created');
      }
      this.pendingContainers.add(container);

      await setup.adapter.initialize(containerId, setup.url);

      if (!this.isCurrentInitialization(setup.context, masterGain, setup.generation)) {
        setup.adapter.destroy();
        return null;
      }

      return this.registerTrackBundle(setup, masterGain);
    } catch (error) {
      this.handleTrackError(setup.id, setup.url, error);
      setup.adapter.destroy();
      return null;
    } finally {
      this.cleanupTrackContainer(setup, container);
    }
  }

  private getTrackMasterGain(context: AudioContext): GainNode {
    const masterGain = this.masterGain;
    if (!masterGain || masterGain.context !== context) {
      throw new Error('Audio graph context mismatch');
    }

    return masterGain;
  }

  private registerTrackBundle(setup: TrackSetup, masterGain: GainNode): TrackBundle {
    const gain = setup.context.createGain();
    gain.gain.value = 0;
    gain.connect(masterGain);

    const bundle: TrackBundle = {
      id: setup.id,
      url: setup.url,
      platform: setup.platform,
      adapter: setup.adapter,
      element: setup.adapter.getElement(),
      source: null,
      gain,
      level: 0,
    };

    this.tracks.set(setup.id, bundle);
    return bundle;
  }

  private cleanupTrackContainer(setup: TrackSetup, container: HTMLElement | null): void {
    if (!container) {
      return;
    }

    this.pendingContainers.delete(container);
    if (this.tracks.get(setup.id)?.adapter !== setup.adapter) {
      container.remove();
      this.createdContainers.delete(container);
    }
  }

  /**
   * Handles track loading error
   */
  private handleTrackError(id: string, url: string, error: unknown): void {
    const errorMsg = error instanceof Error ? error.message : String(error);

    // Silent fail for SoundCloud timeout in dev (CORS/localhost issues)
    if (errorMsg.includes('SoundCloud') && errorMsg.includes('timeout')) {
      logger.warn('SoundCloud track skipped (timeout - normal in localhost):', { trackId: id });
      return;
    }

    logger.error('Failed to prepare track:', { trackId: id, url }, error);
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
      logger.warn('Detach track error:', { trackId: track.id }, error);
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
        logger.error('playTrack rejected:', { trackId: track.id, error: err.message });
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
      logger.warn('Pause error:', { trackId: track.id }, error);
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

    // Skip if already on this catalog
    if (this.currentCatalogId === catalogId) {
      return;
    }

    await this.resumeContext();

    // Force resume if still suspended
    if (this.context?.state === 'suspended') {
      try {
        await this.context.resume();
      } catch (error) {
        logger.error('Failed to force-resume AudioContext', error);
      }
    }

    this.stopAllExcept(catalogId);

    const catalog = this.config.catalogs.find((item) => item.id === catalogId);
    if (!catalog) {
      logger.error('enterCatalog: catalog not found', { catalogId });
      return;
    }

    const track = await this.prepareTrack(catalog.id, catalog.track);
    if (!track) {
      logger.error('enterCatalog: track preparation failed', { catalogId, url: catalog.track });
      return;
    }

    this.currentCatalogId = catalogId;
    this.previewCatalogId = null;
    this.fadeTrack(track, LEVELS.active);
  }

  /**
   * Leaves current catalog (stops catalog tracks, does NOT start home)
   */
  async leaveCatalog(): Promise<void> {
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
