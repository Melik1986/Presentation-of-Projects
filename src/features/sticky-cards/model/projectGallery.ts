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

export function shouldShowCardCopyDescription(catalogId: string | undefined): boolean {
  return catalogId !== 'web-apps';
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
