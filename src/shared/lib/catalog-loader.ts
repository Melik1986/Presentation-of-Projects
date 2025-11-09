import catalogsData from '@/content/catalogs.json';

import type { ExtendedAudioConfig, ExtendedCatalog } from '@/shared/types/catalog';

const config = catalogsData as ExtendedAudioConfig;

/**
 * Validates catalog ID format
 * Allows only alphanumeric characters and hyphens
 * @param catalogId - Catalog identifier to validate
 * @returns true if valid
 */
function isValidCatalogId(catalogId: string): boolean {
  if (!catalogId || typeof catalogId !== 'string') {
    return false;
  }

  // Only allow alphanumeric and hyphens, length 1-50
  const validPattern = /^[a-zA-Z0-9-]{1,50}$/;
  return validPattern.test(catalogId);
}

/**
 * Sanitizes catalog ID by removing potentially dangerous characters
 * @param catalogId - Raw catalog identifier
 * @returns Sanitized catalog ID
 */
function sanitizeCatalogId(catalogId: string): string {
  return catalogId
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '');
}

/**
 * Get catalog by ID
 * @param catalogId - Catalog identifier
 * @returns Catalog data or null if not found
 */
export function getCatalogById(catalogId: string): ExtendedCatalog | null {
  // Validate and sanitize input
  if (!isValidCatalogId(catalogId)) {
    return null;
  }

  const sanitizedId = sanitizeCatalogId(catalogId);
  return config.catalogs.find((cat) => cat.id === sanitizedId) ?? null;
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

/**
 * Get homepage content (title and description)
 * @returns Homepage content
 */
export function getHomepageContent() {
  return config.homepage;
}
