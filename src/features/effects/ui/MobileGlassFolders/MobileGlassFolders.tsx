'use client';

import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

import GlassFolder, { type FolderFile } from '@/components/ui/glass-folder-cards';
import { getAllCatalogs } from '@/shared/lib/catalog-loader';

import styles from './MobileGlassFolders.module.css';

import type { ExtendedCatalog } from '@/shared/types/catalog';

interface MobileGlassFoldersProps {
  previewCatalog: (catalogId: string) => void;
  setHome: () => void;
  className?: string;
}

const CATALOG_ART_PRESETS: Record<string, 'aurora' | 'ember' | 'dusk' | 'verdant'> = {
  'web-apps': 'aurora',
  'figma-design': 'dusk',
  'ai-tools': 'verdant',
  'advanced-tech': 'ember',
};

function buildFilesFromCatalog(catalog: ExtendedCatalog): FolderFile[] {
  return catalog.folder.previewImages.slice(0, 3).map((img, i) => ({
    name: `${catalog.name} preview ${i + 1}`,
    image: img,
    href: `/sticky/${catalog.id}`,
  }));
}

export function MobileGlassFolders({
  previewCatalog,
  setHome,
  className,
}: MobileGlassFoldersProps) {
  const router = useRouter();
  const catalogs = getAllCatalogs();

  const handleOpenChange = useCallback(
    (catalogId: string, isOpen: boolean) => {
      if (isOpen) {
        void previewCatalog(catalogId);
      } else {
        void setHome();
      }
    },
    [previewCatalog, setHome]
  );

  const handleFolderNavigate = useCallback(
    (catalogId: string) => {
      router.push(`/sticky/${catalogId}`);
    },
    [router]
  );

  return (
    <div className={`${styles.container} ${className || ''}`}>
      <div className={styles.grid}>
        {catalogs.map((catalog, index) => {
          const files = buildFilesFromCatalog(catalog);
          const art = CATALOG_ART_PRESETS[catalog.id] || 'aurora';

          return (
            <div
              key={catalog.id}
              className={styles.cardItem}
              onPointerEnter={() => void previewCatalog(catalog.id)}
              onPointerLeave={() => void setHome()}
            >
              <GlassFolder
                label={catalog.name}
                meta={`${String(index + 1).padStart(2, '0')} · Explore Catalog`}
                tone="light"
                art={art}
                seed={index * 7 + 3}
                files={files}
                filePresentation="photos"
                action="more"
                labelPlacement="bottom-left"
                width={380}
                appearDelay={index * 120}
                onOpenChange={(isOpen) => handleOpenChange(catalog.id, isOpen)}
                onFileSelect={() => handleFolderNavigate(catalog.id)}
                menu={[
                  {
                    label: `Open ${catalog.name} →`,
                    onSelect: () => handleFolderNavigate(catalog.id),
                  },
                ]}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
