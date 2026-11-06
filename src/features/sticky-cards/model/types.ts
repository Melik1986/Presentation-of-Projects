import type { CatalogCardSlide } from '@/shared/types/catalog';

/**
 * Sticky Cards types
 */

export type StickyCardData = {
  index: string;
  title: string;
  image: string;
  description: string;
  link: string;
  repository?: string;
  slides?: CatalogCardSlide[];
};

export type StickyCardsProps = {
  cards?: StickyCardData[];
  className?: string;
  catalogId?: string;
};
