import { describe, expect, it } from 'bun:test';
import {
  createProjectGallerySlides,
  shouldShowCardCopyDescription,
} from '../src/features/sticky-cards/model/projectGallery.ts';

describe('Project gallery slides', () => {
  it.each([
    'AutoService',
    '3D AI Produkt-Konfigurator',
    'Houzzy — Furniture E-Commerce',
    'Movie Explorer — Film Discovery',
  ])('creates four replaceable slides for %s', (title) => {
    expect(createProjectGallerySlides(title)).toEqual(
      Array.from({ length: 4 }, (_, index) => ({
        id: `project-gallery-slide-${index + 1}`,
        title,
        image: null,
      }))
    );
  });

  it('fills missing images with placeholders and ignores images beyond four slides', () => {
    expect(
      createProjectGallerySlides('AutoService', [
        '/projects/auto-service/home.png',
        ' ',
        '/projects/auto-service/booking.png',
        '/projects/auto-service/admin.png',
        '/projects/auto-service/extra.png',
      ])
    ).toEqual([
      {
        id: 'project-gallery-slide-1',
        title: 'AutoService',
        image: '/projects/auto-service/home.png',
      },
      { id: 'project-gallery-slide-2', title: 'AutoService', image: null },
      {
        id: 'project-gallery-slide-3',
        title: 'AutoService',
        image: '/projects/auto-service/booking.png',
      },
      {
        id: 'project-gallery-slide-4',
        title: 'AutoService',
        image: '/projects/auto-service/admin.png',
      },
    ]);
  });

  it('hides the duplicate card description only in the web-apps catalog', () => {
    expect(shouldShowCardCopyDescription('web-apps')).toBe(false);
    expect(shouldShowCardCopyDescription('ai-tools')).toBe(true);
  });
});
