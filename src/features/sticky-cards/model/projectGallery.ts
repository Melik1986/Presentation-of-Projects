export interface ProjectGallerySlide {
  id: string;
  title: string;
  image: string | null;
}

const PROJECT_GALLERY_SLIDE_COUNT = 4;

export function shouldShowCardCopyDescription(catalogId: string | undefined): boolean {
  return catalogId !== 'web-apps';
}

export function createProjectGallerySlides(
  title: string,
  images: string[] = []
): ProjectGallerySlide[] {
  return Array.from({ length: PROJECT_GALLERY_SLIDE_COUNT }, (_, index) => {
    const image = images[index]?.trim() || null;

    return {
      id: `project-gallery-slide-${index + 1}`,
      title,
      image,
    };
  });
}
