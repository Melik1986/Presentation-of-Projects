import { createLogger } from '@/shared/lib';

import { LEVELS } from './constants';

import type { CatalogConfig, TrackBundle } from './types';

const logger = createLogger().child({ module: 'AudioCatalogTransitions' });

type CatalogDeps = {
  resumeContext: () => Promise<void>;
  prepareTrack: (id: string, url: string | null) => Promise<TrackBundle | null>;
  fadeTrack: (track: TrackBundle | null, level: number) => void;
  stopAllExcept: (keepId: string | null) => void;
  getTracks: () => Map<string, TrackBundle>;
  forceResumeContext: () => Promise<void>;
};

/**
 * Hover preview: duck home, raise catalog preview.
 */
export async function runPreviewCatalog(
  catalogId: string | null,
  currentCatalogId: string | null,
  catalogs: CatalogConfig[],
  deps: CatalogDeps
): Promise<string | null> {
  if (!catalogId || catalogId === currentCatalogId) {
    return null;
  }
  await deps.resumeContext();
  const catalog = catalogs.find((item) => item.id === catalogId);
  if (!catalog) {
    return null;
  }
  const homeTrack = deps.getTracks().get('home') ?? null;
  const track = await deps.prepareTrack(catalog.id, catalog.track);
  if (!track || !homeTrack) {
    return null;
  }
  deps.getTracks().forEach((t) => {
    if (t.id !== 'home' && t.id !== catalogId) {
      deps.fadeTrack(t, 0);
    }
  });
  deps.fadeTrack(homeTrack, LEVELS.homeHover);
  deps.fadeTrack(track, LEVELS.preview);
  return catalogId;
}

/**
 * Full enter: stop others, play catalog at active level.
 */
export async function runEnterCatalog(
  catalogId: string | null,
  currentCatalogId: string | null,
  catalogs: CatalogConfig[],
  deps: CatalogDeps
): Promise<string | null> {
  if (!catalogId || currentCatalogId === catalogId) {
    return currentCatalogId;
  }
  await deps.resumeContext();
  await deps.forceResumeContext();
  deps.stopAllExcept(catalogId);

  const catalog = catalogs.find((item) => item.id === catalogId);
  if (!catalog) {
    logger.error('enterCatalog: catalog not found', { catalogId });
    return currentCatalogId;
  }
  const track = await deps.prepareTrack(catalog.id, catalog.track);
  if (!track) {
    logger.error('enterCatalog: track preparation failed', { catalogId, url: catalog.track });
    return currentCatalogId;
  }
  deps.fadeTrack(track, LEVELS.active);
  return catalogId;
}
