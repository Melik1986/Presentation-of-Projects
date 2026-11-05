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
};

export type StickyCardsProps = {
  cards?: StickyCardData[];
  className?: string;
  catalogId?: string;
};
