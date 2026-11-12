'use client';

import Image from 'next/image';
import Link from 'next/link';

import styles from './Wildyriftian.module.css';

import type { FolderData, FolderRow, FolderVariant } from '../model/types';

type DesktopFoldersProps = {
  folderRows: FolderRow[];
  activeFolderId: string | null;
  onFolderClick: (e: React.MouseEvent<HTMLAnchorElement>, catalogId: string) => void;
  onFolderHover: (catalogId: string) => void;
  onFolderLeave: () => void;
};

/**
 * Desktop Wildyriftian drawer folders (>1000px).
 */
export function DesktopFolders({
  folderRows,
  activeFolderId,
  onFolderClick,
  onFolderHover,
  onFolderLeave,
}: Readonly<DesktopFoldersProps>) {
  return (
    <div className={`${styles.folders} ${styles.desktopFolders}`}>
      {folderRows.map((row) => (
        <FolderRowView
          key={row.map((folder) => folder.catalogId).join('|')}
          row={row}
          activeFolderId={activeFolderId}
          onFolderClick={onFolderClick}
          onFolderHover={onFolderHover}
          onFolderLeave={onFolderLeave}
        />
      ))}
    </div>
  );
}

type FolderRowViewProps = {
  row: FolderRow;
  activeFolderId: string | null;
  onFolderClick: DesktopFoldersProps['onFolderClick'];
  onFolderHover: DesktopFoldersProps['onFolderHover'];
  onFolderLeave: DesktopFoldersProps['onFolderLeave'];
};

function FolderRowView({
  row,
  activeFolderId,
  onFolderClick,
  onFolderHover,
  onFolderLeave,
}: Readonly<FolderRowViewProps>) {
  return (
    <div className={`row ${styles.row}`}>
      {row.map((folder) => (
        <FolderLink
          key={folder.index}
          folder={folder}
          isActive={activeFolderId === folder.catalogId}
          onFolderClick={onFolderClick}
          onFolderHover={onFolderHover}
          onFolderLeave={onFolderLeave}
        />
      ))}
    </div>
  );
}

type FolderLinkProps = {
  folder: FolderData;
  isActive: boolean;
  onFolderClick: DesktopFoldersProps['onFolderClick'];
  onFolderHover: DesktopFoldersProps['onFolderHover'];
  onFolderLeave: DesktopFoldersProps['onFolderLeave'];
};

function FolderLink({
  folder,
  isActive,
  onFolderClick,
  onFolderHover,
  onFolderLeave,
}: Readonly<FolderLinkProps>) {
  return (
    <Link
      href={`/sticky/${folder.catalogId}`}
      data-catalog={folder.catalogId}
      className={buildFolderClassName(folder.variant, isActive)}
      onClick={(e) => onFolderClick(e, folder.catalogId)}
      onMouseEnter={() => onFolderHover(folder.catalogId)}
      onMouseLeave={onFolderLeave}
    >
      <FolderPreview folder={folder} />
      <FolderMeta folder={folder} />
    </Link>
  );
}

function FolderPreview({ folder }: Readonly<{ folder: FolderData }>) {
  return (
    <div className={`folder-preview ${styles.folderPreview}`}>
      {folder.images.map((image) => (
        <div className={`folder-preview-img ${styles.folderPreviewImg}`} key={image}>
          <Image src={image} alt={folder.name} fill sizes="(max-width: 768px) 100vw, 33vw" />
        </div>
      ))}
    </div>
  );
}

function FolderMeta({ folder }: Readonly<{ folder: FolderData }>) {
  return (
    <div className={`folder-wrapper ${styles.folderWrapper}`}>
      <div className={styles.folderIndex}>
        <p>{folder.index}</p>
      </div>
      <div className={styles.folderName}>
        <h1>{folder.name}</h1>
      </div>
    </div>
  );
}

function buildFolderClassName(variant: FolderVariant, isActive: boolean): string {
  const variantKey = variant.replace('-', '') as 'variant1' | 'variant2' | 'variant3';
  const activeClass = isActive ? 'active' : '';
  return `folder ${styles.folder} ${styles[variantKey]} ${activeClass}`;
}
