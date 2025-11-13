import {
  SiThreedotjs,
  SiVercel,
  SiSupabase,
  SiNextdotjs,
  SiTypescript,
  SiTailwindcss,
  SiOpengl,
  SiGit,
} from 'react-icons/si';

import type { SpiralConfig, IconData } from './types';

/**
 * Default configuration for spiral animation
 * Defines parameters for icon movement and display
 */
export const DEFAULT_SPIRAL_CONFIG: SpiralConfig = {
  numIcons: 30,
  radiusX: 150,
  radiusY: 40,
  speed: 0.01,
  animationDuration: 4000,
  elementSpacing: 30,
} as const;

/**
 * Array of technology icons for spiral animation
 * Contains information about advanced-tech technologies with colors and icons
 */
export const TECH_ICONS: IconData[] = [
  { name: 'threejs', icon: SiThreedotjs, color: '#000000' },
  { name: 'vercel', icon: SiVercel, color: '#000000' },
  { name: 'supabase', icon: SiSupabase, color: '#3ECF8E' },
  { name: 'nextjs', icon: SiNextdotjs, color: '#000000' },
  { name: 'typescript', icon: SiTypescript, color: '#3178C6' },
  { name: 'tailwindcss', icon: SiTailwindcss, color: '#06B6D4' },
  { name: 'webgl', icon: SiOpengl, color: '#5586A4' },
  { name: 'git', icon: SiGit, color: '#F05032' },
];
