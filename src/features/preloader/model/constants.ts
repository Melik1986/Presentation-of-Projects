import type { CompanyIcon } from './types';

/**
 * Preloader constants
 */

export const SCROLL_LOCK_CLASS = 'preload-lock';
export const READY_CLASS = 'preloader-ready';
export const PRELOADER_COMPLETE_EVENT = 'preloader:complete';
export const FALLBACK_TIMEOUT = 9000;

export const SPRITE_PATH = '/preloader-icons/sprite-preloader.svg';
export const DEFAULT_SPRITE = '/preloader-icons/sprite-preloader.svg';

export const COMPANY_ICONS: readonly CompanyIcon[] = Object.freeze([
  { name: 'icon-alcon', width: 96, height: 140 },
  { name: 'icon-sminex', width: 163, height: 38 },
  { name: 'icon-aeon', width: 94, height: 100 },
  { name: 'icon-coldy', width: 168, height: 28 },
  { name: 'icon-cutu', width: 156, height: 100 },
  { name: 'icon-etalon', width: 143, height: 26 },
  { name: 'icon-wafi', width: 232, height: 32 },
  { name: 'icon-forma', width: 138, height: 40 },
  { name: 'icon-galc', width: 132, height: 40 },
  { name: 'icon-veren', width: 155, height: 54 },
  { name: 'icon-ingrad', width: 149, height: 74 },
  { name: 'icon-snegiri', width: 189, height: 48 },
]);
