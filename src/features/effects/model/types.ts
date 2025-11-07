/**
 * Effects types
 */

export type FolderVariant = 'variant-1' | 'variant-2' | 'variant-3';

export type FolderData = {
  variant: FolderVariant;
  index: string;
  name: string;
  images: string[];
};

export type FolderRow = FolderData[];

export type AnimationPhase = 'enter' | 'leave';

export type MobileState = {
  current: boolean;
};

export type WildyriftianProps = {
  className?: string;
};
