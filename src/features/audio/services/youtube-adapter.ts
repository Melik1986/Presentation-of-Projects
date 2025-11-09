/**
 * YouTube IFrame API Adapter (Audio Only)
 * Manages YouTube player for background audio playback
 */

import { createLogger } from '@/shared/lib';

import { extractYouTubeVideoId } from './platform-detector';

import type { Platform } from './platform-detector';

const logger = createLogger().child({ adapter: 'YouTubeAdapter' });

// YouTube IFrame API types
declare global {
  interface Window {
    YT: typeof YT;
    onYouTubeIframeAPIReady?: () => void;
  }
}

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

export class YouTubeAdapter implements PlatformAdapter {
  public readonly platform: Platform = 'youtube';
  private player: YT.Player | null = null;
  private videoId: string = '';
  private endedCallback: (() => void) | null = null;
  private isReady: boolean = false;
  private readyPromise: Promise<void> | null = null;

  /**
   * Loads YouTube IFrame API script
   */
  private static loadYouTubeAPI(): Promise<void> {
    if (typeof window === 'undefined') {
      return Promise.reject(new Error('YouTube API requires browser environment'));
    }

    // Already loaded
    if (window.YT && window.YT.Player) {
      return Promise.resolve();
    }

    // Already loading
    if ((window as Window & { YT_LOADING?: boolean }).YT_LOADING) {
      return new Promise((resolve) => {
        const checkInterval = setInterval(() => {
          if (window.YT && window.YT.Player) {
            clearInterval(checkInterval);
            resolve();
          }
        }, 100);
      });
    }

    // Start loading
    (window as Window & { YT_LOADING?: boolean }).YT_LOADING = true;

    return new Promise((resolve, reject) => {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      tag.async = true;

      tag.onerror = () => {
        logger.error('Failed to load YouTube IFrame API');
        reject(new Error('Failed to load YouTube IFrame API'));
      };

      window.onYouTubeIframeAPIReady = () => {
        (window as Window & { YT_LOADING?: boolean }).YT_LOADING = false;
        resolve();
      };

      const firstScriptTag = document.getElementsByTagName('script')[0];
      if (firstScriptTag?.parentNode) {
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      } else {
        document.head.appendChild(tag);
      }
    });
  }

  async initialize(containerId: string, url: string): Promise<void> {
    this.videoId = extractYouTubeVideoId(url) ?? '';

    if (!this.videoId) {
      throw new Error(`Invalid YouTube URL: ${url}`);
    }

    // Load YouTube API
    await YouTubeAdapter.loadYouTubeAPI();

    // Create player
    this.readyPromise = new Promise((resolve, reject) => {
      try {
        this.player = new YT.Player(containerId, {
          videoId: this.videoId,
          width: 0,
          height: 0,
          playerVars: {
            controls: 0,
            modestbranding: 1,
            fs: 0,
            iv_load_policy: 3,
            rel: 0,
            showinfo: 0,
            playsinline: 1,
            enablejsapi: 1,
          },
          events: {
            onReady: () => {
              this.isReady = true;
              // Hide player completely
              if (this.player) {
                const iframe = this.player.getIframe();
                if (iframe) {
                  iframe.style.position = 'absolute';
                  iframe.style.width = '0';
                  iframe.style.height = '0';
                  iframe.style.opacity = '0';
                  iframe.style.pointerEvents = 'none';
                }
              }
              resolve();
            },
            onStateChange: (event: YT.OnStateChangeEvent) => {
              // YT.PlayerState.ENDED = 0
              if (event.data === 0 && this.endedCallback) {
                this.endedCallback();
              }
            },
            onError: (event: YT.OnErrorEvent) => {
              logger.error('YouTube player error:', {
                errorCode: event.data,
                videoId: this.videoId,
              });
              reject(new Error(`YouTube player error: ${event.data}`));
            },
          },
        });
      } catch (error) {
        reject(error);
      }
    });

    await this.readyPromise;
  }

  async play(): Promise<void> {
    if (!this.player || !this.isReady) {
      throw new Error('YouTube player not ready');
    }

    return new Promise((resolve) => {
      this.player?.playVideo();
      // Small delay to ensure playback started
      setTimeout(resolve, 100);
    });
  }

  async pause(): Promise<void> {
    if (!this.player || !this.isReady) {
      throw new Error('YouTube player not ready');
    }

    return new Promise((resolve) => {
      this.player?.pauseVideo();
      setTimeout(resolve, 50);
    });
  }

  async setVolume(volume: number): Promise<void> {
    if (!this.player || !this.isReady) {
      throw new Error('YouTube player not ready');
    }

    // YouTube volume is 0-100
    const ytVolume = Math.max(0, Math.min(100, volume * 100));
    this.player.setVolume(ytVolume);

    return Promise.resolve();
  }

  getCurrentTime(): number {
    if (!this.player || !this.isReady) {
      return 0;
    }

    try {
      return this.player.getCurrentTime() ?? 0;
    } catch {
      return 0;
    }
  }

  getDuration(): number {
    if (!this.player || !this.isReady) {
      return 0;
    }

    try {
      return this.player.getDuration() ?? 0;
    } catch {
      return 0;
    }
  }

  async seekTo(seconds: number): Promise<void> {
    if (!this.player || !this.isReady) {
      throw new Error('YouTube player not ready');
    }

    this.player.seekTo(seconds, true);
    return Promise.resolve();
  }

  destroy(): void {
    if (this.player) {
      try {
        this.player.destroy();
      } catch (error) {
        logger.error('Error destroying YouTube player:', { videoId: this.videoId }, error);
      }
      this.player = null;
    }

    this.isReady = false;
    this.endedCallback = null;
  }

  onEnded(callback: () => void): void {
    this.endedCallback = callback;
  }

  getElement(): HTMLElement | null {
    if (!this.player) {
      return null;
    }

    try {
      const iframe = this.player.getIframe();
      return iframe instanceof HTMLElement ? iframe : null;
    } catch {
      return null;
    }
  }
}
