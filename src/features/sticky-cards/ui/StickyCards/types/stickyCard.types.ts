import type { StickyCardData } from '../../../model/types';

export interface StickyCardComponentProps {
  cardData: StickyCardData;
  catalogId?: string;
  isMobile: boolean;
}

export interface StickyCardMediaProps {
  cardData: StickyCardData;
  catalogId?: string;
}

export interface StickyCardIndexProps {
  index: string;
  catalogId?: string;
  isMobile: boolean;
}

export interface StickyCardLinksProps {
  cardData: StickyCardData;
}
