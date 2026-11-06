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
  title?: string;
  description?: string;
  image?: ProjectGalleryImageSource;
  srcSet?: string;
  mobileImage?: string | null;
  mobileImageSrcSet?: string;
}

const PROJECT_GALLERY_SLIDE_COUNT = 4;

export function shouldShowCardCopyDescription(catalogId: string | undefined): boolean {
  return catalogId !== 'web-apps';
}

export function createProjectGallerySlides(
  title: string,
  images: ProjectGalleryImageSource[] = [],
  description?: string,
  slidesData?: ProjectGalleryCustomSlide[]
): ProjectGallerySlide[] {
  const slideCount =
    slidesData && slidesData.length > 0 ? slidesData.length : PROJECT_GALLERY_SLIDE_COUNT;
  return Array.from({ length: slideCount }, (_, index) => {
    const customSlide = slidesData?.[index];
    const source = customSlide?.image ?? images[index];
    const imageSource = typeof source === 'string' ? { src: source } : source;
    const image = imageSource?.src.trim() || null;

    return {
      id: `project-gallery-slide-${index + 1}`,
      title: customSlide?.title || title,
      description: customSlide?.description || description,
      image,
      imageSrcSet: customSlide?.srcSet || imageSource?.srcSet,
      mobileImage: customSlide?.mobileImage?.trim() || imageSource?.mobileSrc?.trim() || null,
      mobileImageSrcSet: customSlide?.mobileImageSrcSet || imageSource?.mobileSrcSet,
    };
  });
}
