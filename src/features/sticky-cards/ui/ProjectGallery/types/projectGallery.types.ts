import type {
  ProjectGalleryCustomSlide,
  ProjectGalleryImageSource,
  ProjectGallerySlide,
} from '../../../model/projectGallery';
import type { Dispatch, PointerEventHandler, SetStateAction } from 'react';

export interface ProjectGalleryProps {
  title: string;
  description: string;
  images?: ProjectGalleryImageSource[];
  slidesData?: ProjectGalleryCustomSlide[];
}

export interface ProjectGalleryFrameProps {
  slide: ProjectGallerySlide;
  label: string;
  sizes: string;
  animated?: boolean;
  reduceMotion?: boolean;
  onEntranceComplete?: () => void;
}

export interface DesktopProjectGalleryProps {
  title: string;
  description: string;
  slides: ProjectGallerySlide[];
}

export interface DesktopGalleryTextProps {
  title: string;
  description: string;
  slideId: string;
  currentIndex: number;
  slideCount: number;
  reduceMotion: boolean;
  onEntranceComplete: () => void;
}

export interface DesktopGalleryControlsProps {
  goPrev: () => void;
  goNext: () => void;
  disabled: boolean;
}

export interface DesktopGalleryPointerHandlers {
  handlePointerDown: PointerEventHandler<HTMLElement>;
  handlePointerUp: PointerEventHandler<HTMLElement>;
  handlePointerCancel: PointerEventHandler<HTMLElement>;
}

export interface DesktopProjectGalleryController {
  currentIndex: number;
  isTransitioning: boolean;
  isPaused: boolean;
  setIsPaused: Dispatch<SetStateAction<boolean>>;
  progress: number;
  reduceMotion: boolean;
  completeEntrance: () => void;
  goNext: () => void;
  goPrev: () => void;
  pointerHandlers: DesktopGalleryPointerHandlers;
}
