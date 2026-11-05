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
  titleGradient: string;
  folderGradient?: string;
  folderTextColor?: string;
  pageBackground?: string;
}

export interface CatalogCard {
  index: string;
  title: string;
  image: string;
  description: string;
  link: string;
  repository?: string;
}

export interface CatalogContent {
  introTitle: string;
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
  backgroundGradient?: string;
  preloaderGradient?: string;
}

export interface ExtendedAudioConfig {
  homeTrack: string;
  homepage: HomepageContent;
  catalogs: ExtendedCatalog[];
}
