/**
 * Preloader types
 */

export type CompanyIcon = {
  name: string;
  width: number;
  height: number;
};

export type PreloaderConfig = {
  progressBarSelector?: string;
};

export type LoaderAnimationResult = {
  isHidden: boolean;
  containerProps: {
    role: string;
    'aria-live': 'polite';
    'data-preloader-root': string;
  };
};

export type SpriteIconProps = {
  id?: string;
  name?: string;
  sprite?: string;
  className?: string;
  width?: number;
  height?: number;
  'aria-hidden'?: boolean;
};

export type LoaderProps = {
  className?: string;
};

