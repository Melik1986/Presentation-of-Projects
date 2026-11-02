'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import fallbackConfig from '@/content/catalogs.json';
import { createLogger } from '@/shared/lib';
import { useMockAnalyser } from '@/shared/lib/mock-analyser';

import AudioDirector from '../AudioDirector';

import type {
  AudioConfig,
  AudioDirectorActions,
  AudioDirectorContextValue,
  CatalogConfig,
  DirectorSettings,
  DirectorStateSnapshot,
} from '../types';
import type { ReactElement, ReactNode } from 'react';

const logger = createLogger().child({ hook: 'useStarlightAudio' });

const StarlightAudioContext = createContext<AudioDirectorContextValue | null>(null);

function normalizeConfig(config: AudioConfig | null | undefined): AudioConfig {
  if (!config) {
    return { homeTrack: null, catalogs: [] };
  }

  const catalogs: CatalogConfig[] = Array.isArray(config.catalogs)
    ? config.catalogs.filter((item: unknown): item is CatalogConfig => {
        const candidate = item as Partial<CatalogConfig>;
        return Boolean(candidate?.id && candidate?.track);
      })
    : [];

  return {
    homeTrack: config.homeTrack ?? null,
    catalogs,
  };
}

type AudioProviderProps = {
  children: ReactNode;
  config?: AudioConfig | null;
};

function useAudioConfig(config?: AudioConfig | null): AudioConfig {
  const [audioConfig, setAudioConfig] = useState<AudioConfig>(() =>
    normalizeConfig(config ?? (fallbackConfig as AudioConfig))
  );

  useLayoutEffect(() => {
    setAudioConfig(normalizeConfig(config ?? (fallbackConfig as AudioConfig)));
  }, [config]);

  return audioConfig;
}

function useAudioSnapshots(): {
  state: DirectorStateSnapshot;
  settings: DirectorSettings;
  sync: () => void;
} {
  const [state, setState] = useState(AudioDirector.getCurrentState());
  const [settings, setSettings] = useState(AudioDirector.getSettings());

  const sync = useCallback(() => {
    setState(AudioDirector.getCurrentState());
    setSettings(AudioDirector.getSettings());
  }, []);

  return { state, settings, sync };
}

function useAudioInitialization(
  audioConfig: AudioConfig,
  syncSnapshots: () => void
): boolean {
  const [isReady, setIsReady] = useState(false);
  const mountedRef = useRef(true);

  useLayoutEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      AudioDirector.dispose();
    };
  }, []);

  useLayoutEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      try {
        await AudioDirector.setConfig(audioConfig);
        if (cancelled || !mountedRef.current) {
          return;
        }

        await AudioDirector.setHome();
        if (!cancelled && mountedRef.current) {
          syncSnapshots();
          setIsReady(true);
        }
      } catch (error) {
        logger.error('Failed to initialize AudioProvider:', error);
      }
    };

    setIsReady(false);
    void bootstrap();

    return () => {
      cancelled = true;
    };
  }, [audioConfig, syncSnapshots]);

  return isReady;
}

function useAudioUserGesture(isReady: boolean, syncSnapshots: () => void): void {
  useEffect(() => {
    if (!isReady) return undefined;
    let isResumed = false;
    const abortController = new AbortController();
    const { signal } = abortController;

    const handleUserGesture = async () => {
      if (isResumed || signal.aborted) {
        return;
      }

      isResumed = true;
      await AudioDirector.resumeContextOnUserGesture();
      syncSnapshots();
      abortController.abort();
    };

    document.addEventListener('click', handleUserGesture, {
      once: true,
      signal,
    });
    document.addEventListener('touchstart', handleUserGesture, {
      once: true,
      signal,
    });
    document.addEventListener('keydown', handleUserGesture, {
      once: true,
      signal,
    });

    return () => {
      abortController.abort();
    };
  }, [isReady, syncSnapshots]);
}

function useAudioActions(syncSnapshots: () => void): AudioDirectorActions {
  const setHome = useCallback(async () => {
    await AudioDirector.setHome();
    syncSnapshots();
  }, [syncSnapshots]);

  const previewCatalog = useCallback(
    async (catalogId: string | null) => {
      await AudioDirector.previewCatalog(catalogId);
      syncSnapshots();
    },
    [syncSnapshots]
  );

  const enterCatalog = useCallback(
    async (catalogId: string | null) => {
      await AudioDirector.enterCatalog(catalogId);
      syncSnapshots();
    },
    [syncSnapshots]
  );

  const leaveCatalog = useCallback(async () => {
    await AudioDirector.leaveCatalog();
    syncSnapshots();
  }, [syncSnapshots]);

  const toggleMute = useCallback(
    async (forcedValue?: boolean) => {
      await AudioDirector.toggleMute(forcedValue);
      syncSnapshots();
    },
    [syncSnapshots]
  );

  const setVolume = useCallback(
    async (value: number) => {
      await AudioDirector.setVolume(value);
      syncSnapshots();
    },
    [syncSnapshots]
  );

  const resume = useCallback(() => AudioDirector.resumeContext(), []);

  return useMemo(
    () => ({
      setHome,
      previewCatalog,
      enterCatalog,
      leaveCatalog,
      toggleMute,
      setVolume,
      resume,
    }),
    [setHome, previewCatalog, enterCatalog, leaveCatalog, toggleMute, setVolume, resume]
  );
}

function useAudioContextValue({
  isReady,
  config,
  state,
  settings,
  actions,
}: {
  isReady: boolean;
  config: AudioConfig;
  state: DirectorStateSnapshot;
  settings: DirectorSettings;
  actions: AudioDirectorActions;
}): AudioDirectorContextValue {
  const getAnalyserData = useCallback(() => AudioDirector.getAnalyserFrequencies(), []);

  return useMemo(
    () => ({ isReady, config, state, settings, actions, getAnalyserData }),
    [isReady, config, state, settings, actions, getAnalyserData]
  );
}

export function AudioProvider({ children, config }: AudioProviderProps): ReactElement {
  const audioConfig = useAudioConfig(config);
  const snapshots = useAudioSnapshots();
  const isReady = useAudioInitialization(audioConfig, snapshots.sync);
  useAudioUserGesture(isReady, snapshots.sync);

  const actions = useAudioActions(snapshots.sync);
  const value = useAudioContextValue({
    isReady,
    config: audioConfig,
    state: snapshots.state,
    settings: snapshots.settings,
    actions,
  });

  return <StarlightAudioContext.Provider value={value}>{children}</StarlightAudioContext.Provider>;
}

export function useAudioDirector(): AudioDirectorContextValue {
  const context = useContext(StarlightAudioContext);
  if (!context) {
    throw new Error('useAudioDirector must be used within AudioProvider');
  }
  return context;
}

interface UseAnalyserDataResult {
  data: Uint8Array;
  frame: number;
}

export function useAnalyserData(): UseAnalyserDataResult {
  const { settings } = useAudioDirector();

  return useMockAnalyser({
    isMuted: settings.muted,
    volume: settings.volume,
  });
}
