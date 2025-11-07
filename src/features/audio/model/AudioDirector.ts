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
import { clearSoundCloudCache, resolveSoundCloudTrack } from '../services/soundcloud';

import type {
  AudioConfig,
  CatalogConfig,
  DirectorSettings,
  DirectorStateSnapshot,
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
    clearSoundCloudCache();
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

  private async prepareTrack(id: string, trackUrl: string | null): Promise<TrackBundle | null> {
    if (!this.isBrowser || !trackUrl) {
      return null;
    }

    const existing = this.tracks.get(id);
    if (existing) {
      return existing;
    }

    const context = this.ensureContext();
    if (!context) {
      return null;
    }

    try {
      const resolved = await resolveSoundCloudTrack(trackUrl);
      const audioElement = new Audio();
      audioElement.loop = true;
      audioElement.crossOrigin = 'anonymous';
      audioElement.preload = 'auto';
      audioElement.src = resolved.streamUrl;

      audioElement.addEventListener('error', (event) => {
        console.warn(`AudioDirector: audio element error for track ${id}`, event);
      });

      const mediaSource = context.createMediaElementSource(audioElement);
      const gainNode = context.createGain();
      gainNode.gain.value = 0;
      mediaSource.connect(gainNode);
      gainNode.connect(this.masterGain!);

      const bundle: TrackBundle = {
        id,
        ...resolved,
        audioElement,
        mediaSource,
        gainNode,
      };

      this.tracks.set(id, bundle);
      return bundle;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`AudioDirector: failed to prepare track ${trackUrl}`, errorMessage);

      if (errorMessage.includes('CORS')) {
        console.warn(`AudioDirector: CORS error for ${trackUrl}, track will be skipped`);
      }

      return null;
    }
  }

  private detachTrack(track: TrackBundle): void {
    try {
      track.audioElement.pause();
      track.audioElement.src = '';
      track.mediaSource.disconnect();
      track.gainNode.disconnect();
    } catch (error) {
      console.warn('AudioDirector: detachTrack error', error);
    }
  }

  private playTrack(track: TrackBundle | null): void {
    if (!track) {
      return;
    }

    void track.audioElement.play().catch((error: Error) => {
      if (error.name !== 'AbortError') {
        console.warn('AudioDirector: play rejected', error);
      }
    });
  }

  private fadeTrack(track: TrackBundle | null, targetVolume: number): void {
    if (!track) {
      return;
    }

    gsap.killTweensOf(track.gainNode.gain);
    gsap.to(track.gainNode.gain, {
      value: targetVolume,
      duration: CROSSFADE_SECONDS,
      ease: 'sine.inOut',
      onStart: () => {
        if (targetVolume > 0) {
          this.playTrack(track);
        }
      },
      onComplete: () => {
        if (targetVolume <= 0.001) {
          track.audioElement.pause();
        }
      },
    });
  }

  async setHome(): Promise<void> {
    await this.resumeContext();
    const homeTrack = await this.prepareTrack('home', this.config.homeTrack);
    if (!homeTrack) {
      return;
    }

    this.fadeTrack(homeTrack, LEVELS.home);
    this.tracks.forEach((track) => {
      if (track.id !== 'home') {
        this.fadeTrack(track, 0);
      }
    });
    this.currentCatalogId = null;
    this.previewCatalogId = null;
  }

  async previewCatalog(catalogId: string | null): Promise<void> {
    if (!catalogId || catalogId === this.currentCatalogId) {
      return;
    }

    await this.resumeContext();
    const catalog = this.config.catalogs.find((item) => item.id === catalogId);
    if (!catalog) {
      return;
    }

    const track = await this.prepareTrack(catalog.id, catalog.track);
    const homeTrack = this.tracks.get('home') ?? null;
    if (!track || !homeTrack) {
      return;
    }

    this.previewCatalogId = catalogId;
    this.fadeTrack(homeTrack, LEVELS.homeHover);
    this.fadeTrack(track, LEVELS.preview);
  }

  async enterCatalog(catalogId: string | null): Promise<void> {
    if (!catalogId) {
      return;
    }

    await this.resumeContext();
    const catalog = this.config.catalogs.find((item) => item.id === catalogId);
    if (!catalog) {
      return;
    }

    const track = await this.prepareTrack(catalog.id, catalog.track);
    const homeTrack = this.tracks.get('home') ?? null;
    if (!track || !homeTrack) {
      return;
    }

    this.currentCatalogId = catalogId;
    this.previewCatalogId = null;
    this.fadeTrack(homeTrack, 0);
    this.fadeTrack(track, LEVELS.active);
  }

  async leaveCatalog(): Promise<void> {
    await this.resumeContext();
    const homeTrack = await this.prepareTrack('home', this.config.homeTrack);
    if (homeTrack) {
      this.fadeTrack(homeTrack, LEVELS.home);
    }

    if (this.currentCatalogId) {
      this.fadeTrack(this.tracks.get(this.currentCatalogId) ?? null, 0);
    }

    if (this.previewCatalogId) {
      this.fadeTrack(this.tracks.get(this.previewCatalogId) ?? null, 0);
    }

    this.currentCatalogId = null;
    this.previewCatalogId = null;
  }

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

    this.persistSettings();
  }

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
    this.persistSettings();
  }

  getSettings(): DirectorSettings {
    return { ...this.settings };
  }

  getCurrentState(): DirectorStateSnapshot {
    return {
      activeCatalogId: this.currentCatalogId,
      previewCatalogId: this.previewCatalogId,
      isMuted: this.settings.muted,
      volume: this.settings.volume,
    };
  }

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
