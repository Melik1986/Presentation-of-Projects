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

import AudioDirector from '../AudioDirector';

import type { AudioConfig, AudioDirectorContextValue, CatalogConfig } from '../types';
import type { ReactElement, ReactNode } from 'react';

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

export function AudioProvider({ children, config }: AudioProviderProps): ReactElement {
  const [audioConfig, setAudioConfig] = useState<AudioConfig>(() =>
    normalizeConfig(config ?? (fallbackConfig as AudioConfig))
  );
  const [isReady, setIsReady] = useState(false);
  const [stateSnapshot, setStateSnapshot] = useState(AudioDirector.getCurrentState());
  const [settingsSnapshot, setSettingsSnapshot] = useState(AudioDirector.getSettings());
  const mountedRef = useRef(true);

  const syncSnapshots = useCallback(() => {
    setStateSnapshot(AudioDirector.getCurrentState());
    setSettingsSnapshot(AudioDirector.getSettings());
  }, []);

  useLayoutEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      AudioDirector.dispose();
    };
  }, []);

  useLayoutEffect(() => {
    const nextConfig = normalizeConfig(config ?? (fallbackConfig as AudioConfig));
    setAudioConfig(nextConfig);
  }, [config]);

  useLayoutEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      try {
        await AudioDirector.setConfig(audioConfig);
        await AudioDirector.setHome();
        if (!cancelled && mountedRef.current) {
          syncSnapshots();
          setIsReady(true);
        }
      } catch (error) {
        console.error('AudioProvider: failed to initialize', error);
      }
    };

    setIsReady(false);
    void bootstrap();

    return () => {
      cancelled = true;
    };
  }, [audioConfig, syncSnapshots]);

  useEffect(() => {
    if (!isReady) {
      return undefined;
    }

    let isResumed = false;

    const handleUserGesture = async () => {
      if (isResumed) {
        return;
      }

      isResumed = true;
      await AudioDirector.resumeContextOnUserGesture();
      syncSnapshots();

      document.removeEventListener('click', handleUserGesture);
      document.removeEventListener('touchstart', handleUserGesture);
      document.removeEventListener('keydown', handleUserGesture);
    };

    document.addEventListener('click', handleUserGesture, { once: true });
    document.addEventListener('touchstart', handleUserGesture, { once: true });
    document.addEventListener('keydown', handleUserGesture, { once: true });

    return () => {
      document.removeEventListener('click', handleUserGesture);
      document.removeEventListener('touchstart', handleUserGesture);
      document.removeEventListener('keydown', handleUserGesture);
    };
  }, [isReady, syncSnapshots]);

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

  const getAnalyserData = useCallback(() => AudioDirector.getAnalyserFrequencies(), []);

  const value = useMemo<AudioDirectorContextValue>(
    () => ({
      isReady,
      config: audioConfig,
      state: stateSnapshot,
      settings: settingsSnapshot,
      actions: {
        setHome,
        previewCatalog,
        enterCatalog,
        leaveCatalog,
        toggleMute,
        setVolume,
        resume: () => AudioDirector.resumeContext(),
      },
      getAnalyserData,
    }),
    [
      isReady,
      audioConfig,
      stateSnapshot,
      settingsSnapshot,
      setHome,
      previewCatalog,
      enterCatalog,
      leaveCatalog,
      toggleMute,
      setVolume,
      getAnalyserData,
    ]
  );

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
  const { getAnalyserData } = useAudioDirector();
  const [frame, setFrame] = useState(0);
  const bufferRef = useRef<Uint8Array>(new Uint8Array(0));

  useLayoutEffect(() => {
    let animationFrame: number;

    const update = () => {
      const data = getAnalyserData();
      if (data.length) {
        bufferRef.current = new Uint8Array(data);
        setFrame((prev) => (prev + 1) % Number.MAX_SAFE_INTEGER);
      }
      animationFrame = requestAnimationFrame(update);
    };

    update();
    return () => cancelAnimationFrame(animationFrame);
  }, [getAnalyserData]);

  return useMemo(
    () => ({
      data: bufferRef.current,
      frame,
    }),
    [frame]
  );
}
