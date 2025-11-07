/**
 * Sticky Cards types
 */

export type StickyCardData = {
  index: string;
  title: string;
  image: string;
  description: string;
};

export type StickyCardsProps = {
  cards?: StickyCardData[];
  className?: string;
};
