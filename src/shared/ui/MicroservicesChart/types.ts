import type { IconType } from 'react-icons';

/**
 * Microservice node status types
 */
export type ServiceStatus = 'healthy' | 'error' | 'warning';

/**
 * Node position in the chart
 */
export type NodePosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';

/**
 * Animation direction for the line paths
 */
export type AnimationDirection = 'forward' | 'backward' | 'off';

/**
 * Microservice node interface
 */
export interface MicroserviceNode {
  id: string;
  name: string;
  icon: IconType;
  status: ServiceStatus;
  requests: number;
  position: NodePosition;
  color: string;
  bgColor: string;
  lineColor: string;
}

/**
 * Animation configuration for each node
 */
export interface NodeAnimation {
  direction: AnimationDirection;
  duration: number;
  ease: string;
}

/**
 * Chart responsive configuration
 */
export interface ResponsiveViewBox {
  mobile: { width: number; height: number; viewBox: string };
  tablet: { width: number; height: number; viewBox: string };
  desktop: { width: number; height: number; viewBox: string };
}
