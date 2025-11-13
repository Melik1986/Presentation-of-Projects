import type { IconType } from 'react-icons';

/**
 * Interface for spiral animation configuration
 * Defines parameters for icon movement and display
 */
export interface SpiralConfig {
  numIcons: number;
  radiusX: number;
  radiusY: number;
  speed: number;
  animationDuration: number;
  elementSpacing: number;
}

/**
 * Interface for icon data
 * Describes technology icon with identifier and color
 */
export interface IconData {
  name: string;
  icon: IconType;
  color: string;
}

/**
 * Interface for spiral icon
 * Describes icon element with position in spiral
 */
export interface SpiralIcon {
  element: HTMLElement;
  index: number;
  offset: number;
}

/**
 * Interface for spiral animation state
 * Describes current initialization and animation state
 */
export interface SpiralState {
  isInitialized: boolean;
  isAnimating: boolean;
  icons: SpiralIcon[];
}
