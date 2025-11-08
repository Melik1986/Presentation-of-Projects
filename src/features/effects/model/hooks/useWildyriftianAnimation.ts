import { useEffect } from 'react';

import { setupWildyriftianAnimation } from '../animations';

import type { RefObject } from 'react';

/**
 * Hook for setting up Wildyriftian animation system
 * @param containerRef - Reference to container element
 */
export function useWildyriftianAnimation(containerRef: RefObject<HTMLDivElement | null>): void {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return undefined;
    }
    return setupWildyriftianAnimation(container);
  }, [containerRef]);
}
