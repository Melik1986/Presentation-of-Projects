export interface ProjectGalleryImage {
  src: string;
  srcSet?: string;
  mobileSrc?: string;
  mobileSrcSet?: string;
}

export type ProjectGalleryImageSource = string | ProjectGalleryImage;

export interface ProjectGallerySlide {
  id: string;
  title: string;
  description?: string;
  image: string | null;
  imageSrcSet?: string;
  mobileImage?: string | null;
  mobileImageSrcSet?: string;
}

export interface ProjectGalleryCustomSlide {
  title: string;
  description?: string;
  image?: string;
  srcSet?: string;
  mobileImage?: string | null;
  mobileImageSrcSet?: string;
}

const PROJECT_GALLERY_SLIDE_COUNT = 4;
const FULL_GALLERY_CATALOGS = new Set<string | undefined>([
  'web-apps',
  'figma-design',
  'advanced-tech',
]);

export function isProjectGalleryCard(catalogId: string | undefined, cardIndex?: string): boolean {
  return FULL_GALLERY_CATALOGS.has(catalogId) || (catalogId === 'ai-tools' && cardIndex === '03');
}

export function shouldKeepIndexColumn(catalogId: string | undefined, cardIndex?: string): boolean {
  return catalogId === 'advanced-tech' && cardIndex === '01';
}

export function shouldShowCardCopyDescription(
  catalogId: string | undefined,
  cardIndex?: string
): boolean {
  return !isProjectGalleryCard(catalogId, cardIndex);
}

function toNullableSrc(value?: string | null): string | null {
  return value?.trim() || null;
}

export function createProjectGallerySlides(
  title: string,
  _images: ProjectGalleryImageSource[] = [],
  description?: string,
  slidesData: ProjectGalleryCustomSlide[] = []
): ProjectGallerySlide[] {
  const length = slidesData.length || PROJECT_GALLERY_SLIDE_COUNT;

  return Array.from({ length }, (_, index) => {
    const raw = { title, description, ...slidesData[index] };

    return {
      id: `project-gallery-slide-${index + 1}`,
      title: raw.title,
      description: raw.description,
      image: toNullableSrc(raw.image),
      imageSrcSet: raw.srcSet,
      mobileImage: toNullableSrc(raw.mobileImage),
      mobileImageSrcSet: raw.mobileImageSrcSet,
    };
  });
}
