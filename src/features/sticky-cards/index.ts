/**
 * Sticky Cards Feature
 * Public API exports
 */

export { StickyCards } from './ui/StickyCards';
export { DeviceGallery } from '../../shared/ui/DeviceGallery/DeviceGallery';
export { AIPhotoGallery } from '../../shared/ui/AIPhotoGallery/AIPhotoGallery';
export { useStickyCardsAnimation } from './model/hooks/useStickyCardsAnimation';
export { useCatalogTitleAnimation } from './model/hooks/useCatalogTitleAnimation';
export { useFirstCardAnimation } from './model/hooks/useFirstCardAnimation';
export { useDeviceGalleryAnimation } from './model/hooks/useDeviceGalleryAnimation';
export { useAIPhotoGalleryAnimation } from './model/hooks/useAIPhotoGalleryAnimation';
export { useFigmaImageAnimation } from './model/hooks/useFigmaImageAnimation';
export type { StickyCardData, StickyCardsProps } from './model/types';
export { defaultStickyCardsData } from './model/data';
