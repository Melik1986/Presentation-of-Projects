import type { FolderRow } from './types';

/**
 * Default folder rows data for Wildyriftian effect
 */
export const defaultFolderRows: FolderRow[] = [
  [
    {
      variant: 'variant-1',
      index: '01',
      name: 'figures',
      images: ['/img/img-1.jpg', '/img/img-2.jpg', '/img/img-3.jpg'],
    },
    {
      variant: 'variant-2',
      index: '02',
      name: 'persona',
      images: ['/img/img-4.jpg', '/img/img-5.jpg', '/img/img-6.jpg'],
    },
  ],
  [
    {
      variant: 'variant-2',
      index: '03',
      name: 'form',
      images: ['/img/img-7.jpg', '/img/img-8.jpg', '/img/img-9.jpg'],
    },
    {
      variant: 'variant-3',
      index: '04',
      name: 'chromatic',
      images: ['/img/img-10.jpg', '/img/img-11.jpg', '/img/img-12.jpg'],
    },
  ],
  [
    {
      variant: 'variant-1',
      index: '05',
      name: 'mythos',
      images: ['/img/img-13.jpg', '/img/img-14.jpg', '/img/img-15.jpg'],
    },
    {
      variant: 'variant-2',
      index: '06',
      name: 'kinetics',
      images: ['/img/img-16.jpg', '/img/img-17.jpg', '/img/img-18.jpg'],
    },
  ],
];

/**
 * Mobile breakpoint for responsive behavior
 */
export const MOBILE_BREAKPOINT = 1000;
