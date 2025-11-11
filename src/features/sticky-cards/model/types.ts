/**
 * Sticky Cards types
 */

export type StickyCardData = {
  index: string;
  title: string;
  image: string;
  liveLink: string;
};

export type StickyCardsProps = {
  cards?: StickyCardData[];
  className?: string;
};
