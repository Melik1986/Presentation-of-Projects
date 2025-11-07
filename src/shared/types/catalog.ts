/**
 * Catalog types for dynamic content management system
 */

export interface CatalogFolder {
  displayName: string;
  variant: 'variant-1' | 'variant-2' | 'variant-3';
  previewImages: string[];
}

export interface CatalogTheme {
  backgroundColor: string;
  cardBackground: string;
  textColor: string;
  accentColor: string;
}

export interface CatalogCard {
  index: string;
  title: string;
  image: string;
  description: string;
}

export interface CatalogContent {
  introTitle: string;
  outroTitle: string;
  cards: CatalogCard[];
}

export interface CatalogSEO {
  title: string;
  description: string;
  keywords: string;
}

export interface ExtendedCatalog {
  id: string;
  name: string;
  track: string;
  folder: CatalogFolder;
  theme: CatalogTheme;
  content: CatalogContent;
  seo: CatalogSEO;
}

export interface HomepageContent {
  title: string;
  description: string;
}

export interface ExtendedAudioConfig {
  homeTrack: string;
  homepage: HomepageContent;
  catalogs: ExtendedCatalog[];
}
