'use client';

import { useLayoutEffect, type RefObject } from 'react';

import { getAllCatalogs } from '@/shared/lib/catalog-loader';

import type { ExtendedCatalog } from '@/shared/types/catalog';

/**
 * Applies homepage background and per-catalog folder CSS variables.
 */
export function useWildyriftianTheme(
  containerRef: RefObject<HTMLDivElement | null>,
  backgroundGradient?: string
): void {
  useLayoutEffect(() => {
    applyBackgroundGradient(containerRef.current, backgroundGradient);
  }, [containerRef, backgroundGradient]);

  useLayoutEffect(() => {
    applyFolderThemes(containerRef.current);
  }, [containerRef]);
}

function applyBackgroundGradient(
  container: HTMLDivElement | null,
  backgroundGradient?: string
): void {
  if (!container || !backgroundGradient) {
    return;
  }
  container.style.setProperty('--home-bg-gradient', backgroundGradient);
}

function applyFolderThemes(container: HTMLDivElement | null): void {
  if (!container) {
    return;
  }
  getAllCatalogs().forEach((catalog) => applyCatalogTheme(container, catalog));
}

function applyCatalogTheme(container: HTMLDivElement, catalog: ExtendedCatalog): void {
  const folders = container.querySelectorAll(`[data-catalog="${catalog.id}"]`);
  folders.forEach((folder) => setFolderThemeVars(folder as HTMLElement, catalog));
}

function setFolderThemeVars(folder: HTMLElement, catalog: ExtendedCatalog): void {
  if (catalog.theme.folderGradient) {
    folder.style.setProperty('--folder-gradient', catalog.theme.folderGradient);
  }
  if (catalog.theme.folderTextColor) {
    folder.style.setProperty('--folder-text-color', catalog.theme.folderTextColor);
  }
}
