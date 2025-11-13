import { FaCreditCard, FaShoppingCart, FaUsers } from 'react-icons/fa';
import { SiAuth0 } from 'react-icons/si';
import { TbApi } from 'react-icons/tb';

import type { MicroserviceNode, NodeAnimation, ResponsiveViewBox } from './types';

/**
 * Status colors for microservices
 */
export const STATUS_COLORS = {
  healthy: {
    icon: '#10b981',
    bg: 'rgba(16, 185, 129, 0.15)',
    line: '#10b981',
  },
  error: {
    icon: '#ef4444',
    bg: 'rgba(239, 68, 68, 0.15)',
    line: '#ef4444',
  },
  warning: {
    icon: '#eab308',
    bg: 'rgba(234, 179, 8, 0.15)',
    line: '#eab308',
  },
} as const;

/**
 * Microservices nodes configuration
 */
export const MICROSERVICES: MicroserviceNode[] = [
  {
    id: 'api-gateway',
    name: 'API Gateway',
    icon: TbApi,
    status: 'healthy',
    requests: 1247,
    position: 'center',
    color: STATUS_COLORS.healthy.icon,
    bgColor: STATUS_COLORS.healthy.bg,
    lineColor: STATUS_COLORS.healthy.line,
  },
  {
    id: 'auth-service',
    name: 'Auth',
    icon: SiAuth0,
    status: 'healthy',
    requests: 342,
    position: 'top-left',
    color: STATUS_COLORS.healthy.icon,
    bgColor: STATUS_COLORS.healthy.bg,
    lineColor: STATUS_COLORS.healthy.line,
  },
  {
    id: 'users-service',
    name: 'Users',
    icon: FaUsers,
    status: 'warning',
    requests: 189,
    position: 'top-right',
    color: STATUS_COLORS.warning.icon,
    bgColor: STATUS_COLORS.warning.bg,
    lineColor: STATUS_COLORS.warning.line,
  },
  {
    id: 'orders-service',
    name: 'Orders',
    icon: FaShoppingCart,
    status: 'healthy',
    requests: 521,
    position: 'bottom-left',
    color: STATUS_COLORS.healthy.icon,
    bgColor: STATUS_COLORS.healthy.bg,
    lineColor: STATUS_COLORS.healthy.line,
  },
  {
    id: 'payments-service',
    name: 'Payments',
    icon: FaCreditCard,
    status: 'error',
    requests: 67,
    position: 'bottom-right',
    color: STATUS_COLORS.error.icon,
    bgColor: STATUS_COLORS.error.bg,
    lineColor: STATUS_COLORS.error.line,
  },
];

/**
 * Animation configuration for each node
 */
export const NODE_ANIMATIONS: Record<string, NodeAnimation> = {
  'auth-service': { direction: 'backward', duration: 4, ease: 'power1.inOut' },
  'users-service': { direction: 'backward', duration: 4, ease: 'power1.inOut' },
  'orders-service': { direction: 'backward', duration: 4, ease: 'power1.inOut' },
  'payments-service': { direction: 'backward', duration: 4, ease: 'power1.inOut' },
};

/**
 * Responsive viewBox configurations
 */
export const RESPONSIVE_CONFIG: ResponsiveViewBox = {
  mobile: {
    width: 320,
    height: 240,
    viewBox: '0 0 320 240',
  },
  tablet: {
    width: 512,
    height: 260,
    viewBox: '0 0 512 260',
  },
  desktop: {
    width: 536,
    height: 280,
    viewBox: '0 0 536 280',
  },
};

/**
 * SVG filter IDs
 */
export const FILTER_IDS = {
  DOT_GLOW: 'microservices-filter-dot',
  LINE_GLOW: 'microservices-filter-line',
  BLUR_GLOW: 'microservices-filter-blur',
} as const;
