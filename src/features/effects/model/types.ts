/**
 * Effects types
 */

export type FolderVariant = 'variant-1' | 'variant-2' | 'variant-3';

export type FolderData = {
  variant: FolderVariant;
  index: string;
  name: string;
  images: string[];
  catalogId: string;
};

export type FolderRow = FolderData[];

export type WildyriftianProps = {
  className?: string;
};
