export { VideoGallery } from './VideoGallery';

export type VideoGalleryProps = {
  items: string[];
  layout?: 'vertical' | 'horizontal';
  aspectRatio?: 'portrait' | 'landscape';
  animationDirection?: 'vertical' | 'horizontal';
  columns?: number;
};
