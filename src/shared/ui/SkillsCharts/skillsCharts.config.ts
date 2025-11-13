import { FaDocker, FaServer } from 'react-icons/fa';
import { MdApi } from 'react-icons/md';
import {
  SiAmazon,
  SiAuth0,
  SiGithubactions,
  SiGraphql,
  SiMongodb,
  SiPostgresql,
  SiPrometheus,
  SiRedis,
  SiSupabase,
  SiVercel,
} from 'react-icons/si';
import { TbWebhook } from 'react-icons/tb';

import type { IconType } from 'react-icons';

/**
 * CSS selectors for skills charts
 * Used for finding chart DOM elements
 */
export const SELECTORS = {
  BACKEND_CHART: '#backend-skills-chart',
  INFRASTRUCTURE_CHART: '#infrastructure-skills-chart',
};

/**
 * Color palette for charts
 * Defines main colors for data visualization (advanced-tech theme)
 */
export const COLOR_PALETTE = {
  primary: '#10b981', // Green accent
  secondary: '#059669', // Darker green
};

/**
 * Icon mapping for backend skills
 */
export const BACKEND_ICONS: Record<string, IconType> = {
  GraphQL: SiGraphql,
  Microservices: FaServer,
  'Docker/K8s': FaDocker,
  PostgreSQL: SiPostgresql,
  MongoDB: SiMongodb,
  'REST API': MdApi,
  WebSockets: TbWebhook,
  Redis: SiRedis,
};

/**
 * Icon mapping for infrastructure skills
 */
export const INFRASTRUCTURE_ICONS: Record<string, IconType> = {
  Vercel: SiVercel,
  Supabase: SiSupabase,
  AWS: SiAmazon,
  'CI/CD': SiGithubactions,
  Monitoring: SiPrometheus,
  Security: SiAuth0,
};

/**
 * Skills data for chart display
 * Contains backend and infrastructure skills information with scores
 */
export const SKILLS_DATA = {
  /** Backend skills with scores in percentage */
  backend: [
    { skill: 'GraphQL', score: 90 },
    { skill: 'Microservices', score: 85 },
    { skill: 'Docker/K8s', score: 80 },
    { skill: 'PostgreSQL', score: 85 },
    { skill: 'MongoDB', score: 75 },
    { skill: 'REST API', score: 95 },
    { skill: 'WebSockets', score: 70 },
    { skill: 'Redis', score: 65 },
  ],
  /** Infrastructure skills with scores in percentage */
  infrastructure: [
    { name: 'Vercel', value: 90 },
    { name: 'Supabase', value: 85 },
    { name: 'AWS', value: 75 },
    { name: 'CI/CD', value: 80 },
    { name: 'Monitoring', value: 70 },
    { name: 'Security', value: 85 },
  ],
};

/**
 * Responsive breakpoints for adaptive design
 * Defines screen sizes for various devices
 */
export const RESPONSIVE_BREAKPOINTS = {
  mobile: 480,
  tablet: 768,
  desktop: 1024,
  large: 1440,
};
