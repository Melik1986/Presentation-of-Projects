/**
 * SoundCloud Widget API Adapter (Audio Only)
 * Manages SoundCloud widget for background audio playback
 */

import { createLogger } from '@/shared/lib';

import { extractSoundCloudTrackUrl } from './platform-detector';

import type { Platform } from './platform-detector';
import type { PlatformAdapter } from './youtube-adapter';

const logger = createLogger().child({ adapter: 'SoundCloudAdapter' });

// SoundCloud Widget API types
declare global {
  interface Window {
    SC: {
      Widget: {
        new (iframeElement: HTMLIFrameElement | string): SCWidget;
        Events: {
          READY: string;
          PLAY: string;
          PAUSE: string;
          FINISH: string;
          ERROR: string;
        };
      };
    };
    SC_LOADING?: boolean;
  }
}

interface SCWidget {
  bind(eventName: string, callback: () => void): void;
  unbind(eventName: string): void;
  load(url: string, options?: { auto_play?: boolean }): void;
  play(): void;
  pause(): void;
  toggle(): void;
  seekTo(milliseconds: number): void;
  setVolume(volume: number): void;
  getVolume(callback: (volume: number) => void): void;
  getDuration(callback: (duration: number) => void): void;
  getPosition(callback: (position: number) => void): void;
  getCurrentSound(callback: (sound: unknown) => void): void;
}

export class SoundCloudAdapter implements PlatformAdapter {
  public readonly platform: Platform = 'soundcloud';
  private widget: SCWidget | null = null;
  private iframe: HTMLIFrameElement | null = null;
  private trackUrl: string = '';
  private endedCallback: (() => void) | null = null;
  private isReady: boolean = false;
  private readyPromise: Promise<void> | null = null;

  /**
   * Loads SoundCloud Widget API script
   */
  private static loadSoundCloudAPI(): Promise<void> {
    if (typeof window === 'undefined') {
      return Promise.reject(new Error('SoundCloud API requires browser environment'));
    }

    // Already loaded
    if (window.SC && window.SC.Widget) {
      return Promise.resolve();
    }

    // Already loading
    if (window.SC_LOADING) {
      return new Promise((resolve) => {
        const checkInterval = setInterval(() => {
          if (window.SC && window.SC.Widget) {
            clearInterval(checkInterval);
            resolve();
          }
        }, 100);
      });
    }

    // Start loading
    window.SC_LOADING = true;

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://w.soundcloud.com/player/api.js';
      script.async = true;

      script.onload = () => {
        window.SC_LOADING = false;
        resolve();
      };

      script.onerror = () => {
        window.SC_LOADING = false;
        reject(new Error('Failed to load SoundCloud Widget API'));
      };

      document.head.appendChild(script);
    });
  }

  async initialize(containerId: string, url: string): Promise<void> {
    this.trackUrl = extractSoundCloudTrackUrl(url) ?? '';

    if (!this.trackUrl) {
      throw new Error(`Invalid SoundCloud URL: ${url}`);
    }

    // Load SoundCloud API
    await SoundCloudAdapter.loadSoundCloudAPI();

    // Create iframe container
    const container = document.getElementById(containerId);
    if (!container) {
      throw new Error(`Container not found: ${containerId}`);
    }

    // Create hidden iframe
    this.iframe = document.createElement('iframe');
    this.iframe.id = `${containerId}-iframe`;
    this.iframe.src = `https://w.soundcloud.com/player/?url=${encodeURIComponent(
      this.trackUrl
    )}&auto_play=false&hide_related=true&show_comments=false&show_user=false&show_reposts=false&show_teaser=false&visual=false`;
    this.iframe.width = '0';
    this.iframe.height = '0';
    this.iframe.style.position = 'absolute';
    this.iframe.style.opacity = '0';
    this.iframe.style.pointerEvents = 'none';
    this.iframe.allow = 'autoplay';

    container.appendChild(this.iframe);

    // Initialize widget
    this.readyPromise = new Promise((resolve, reject) => {
      try {
        if (!this.iframe) {
          reject(new Error('Iframe not created'));
          return;
        }

        this.widget = new window.SC.Widget(this.iframe);

        this.widget.bind(window.SC.Widget.Events.READY, () => {
          this.isReady = true;
          resolve();
        });

        this.widget.bind(window.SC.Widget.Events.FINISH, () => {
          if (this.endedCallback) {
            this.endedCallback();
          }
        });

        this.widget.bind(window.SC.Widget.Events.ERROR, () => {
          reject(new Error('SoundCloud widget error'));
        });

        // Timeout fallback
        setTimeout(() => {
          if (!this.isReady) {
            reject(new Error('SoundCloud widget initialization timeout'));
          }
        }, 10000);
      } catch (error) {
        reject(error);
      }
    });

    await this.readyPromise;
  }

  async play(): Promise<void> {
    if (!this.widget || !this.isReady) {
      throw new Error('SoundCloud widget not ready');
    }

    return new Promise((resolve) => {
      this.widget?.play();
      setTimeout(resolve, 100);
    });
  }

  async pause(): Promise<void> {
    if (!this.widget || !this.isReady) {
      throw new Error('SoundCloud widget not ready');
    }

    return new Promise((resolve) => {
      this.widget?.pause();
      setTimeout(resolve, 50);
    });
  }

  async setVolume(volume: number): Promise<void> {
    if (!this.widget || !this.isReady) {
      throw new Error('SoundCloud widget not ready');
    }

    // SoundCloud volume is 0-100
    const scVolume = Math.max(0, Math.min(100, volume * 100));
    this.widget.setVolume(scVolume);

    return Promise.resolve();
  }

  getCurrentTime(): number {
    if (!this.widget || !this.isReady) {
      return 0;
    }

    let currentTime = 0;
    this.widget.getPosition((position) => {
      currentTime = position / 1000; // Convert ms to seconds
    });

    return currentTime;
  }

  getDuration(): number {
    if (!this.widget || !this.isReady) {
      return 0;
    }

    let duration = 0;
    this.widget.getDuration((dur) => {
      duration = dur / 1000; // Convert ms to seconds
    });

    return duration;
  }

  async seekTo(seconds: number): Promise<void> {
    if (!this.widget || !this.isReady) {
      throw new Error('SoundCloud widget not ready');
    }

    this.widget.seekTo(seconds * 1000); // Convert seconds to ms
    return Promise.resolve();
  }

  destroy(): void {
    if (this.widget) {
      try {
        this.widget.unbind(window.SC.Widget.Events.READY);
        this.widget.unbind(window.SC.Widget.Events.FINISH);
        this.widget.unbind(window.SC.Widget.Events.ERROR);
      } catch (error) {
        logger.error(error instanceof Error ? error : { error }, 'Error unbinding SoundCloud widget', { trackUrl: this.trackUrl });
      }
      this.widget = null;
    }

    if (this.iframe) {
      this.iframe.remove();
      this.iframe = null;
    }

    this.isReady = false;
    this.endedCallback = null;
  }

  onEnded(callback: () => void): void {
    this.endedCallback = callback;
  }

  getElement(): HTMLElement | null {
    return this.iframe;
  }
}
