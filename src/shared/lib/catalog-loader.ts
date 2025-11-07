import catalogsData from '@/content/catalogs.json';

import type { ExtendedAudioConfig, ExtendedCatalog } from '@/shared/types/catalog';

const config = catalogsData as ExtendedAudioConfig;

/**
 * Get catalog by ID
 * @param catalogId - Catalog identifier
 * @returns Catalog data or null if not found
 */
export function getCatalogById(catalogId: string): ExtendedCatalog | null {
  return config.catalogs.find((cat) => cat.id === catalogId) ?? null;
}

/**
 * Get all catalogs
 * @returns Array of all catalogs
 */
export function getAllCatalogs(): ExtendedCatalog[] {
  return config.catalogs;
}

/**
 * Get total number of catalogs
 * @returns Number of catalogs
 */
export function getCatalogCount(): number {
  return config.catalogs.length;
}

/**
 * Get home track URL
 * @returns Home track URL
 */
export function getHomeTrack(): string {
  return config.homeTrack;
}
