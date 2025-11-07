import { getAllCatalogs } from '@/shared/lib/catalog-loader';

import type { FolderRow } from './types';

/**
 * Generate folder rows dynamically from catalogs
 * @returns Array of folder rows (2 folders per row)
 */
export function generateFolderRows(): FolderRow[] {
  const catalogs = getAllCatalogs();
  const rows: FolderRow[] = [];

  // Group catalogs into rows of 2
  for (let i = 0; i < catalogs.length; i += 2) {
    const row: FolderRow = [];

    for (let j = 0; j < 2 && i + j < catalogs.length; j++) {
      const catalog = catalogs[i + j];
      if (catalog) {
        row.push({
          variant: catalog.folder.variant,
          index: String(i + j + 1).padStart(2, '0'),
          name: catalog.folder.displayName,
          images: catalog.folder.previewImages,
          catalogId: catalog.id,
        });
      }
    }

    rows.push(row);
  }

  return rows;
}

/**
 * Mobile breakpoint for responsive behavior
 */
export const MOBILE_BREAKPOINT = 1000;
