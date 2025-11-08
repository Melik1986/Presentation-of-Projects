'use client';

import { useEffect } from 'react';

import type { RefObject } from 'react';

type UseOutsideClickProps = {
  containerRef: RefObject<HTMLElement | null>;
  isActive: boolean;
  onOutsideClick: () => void;
};

/**
 * Hook for detecting clicks outside folders to reset active state
 * @param containerRef - Reference to container element
 * @param isActive - Whether any folder is active
 * @param onOutsideClick - Callback when click outside detected
 */
export function useOutsideClick({
  containerRef,
  isActive,
  onOutsideClick,
}: UseOutsideClickProps): void {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.folder') && isActive) {
        onOutsideClick();
      }
    };
    container.addEventListener('click', handleClick);
    return () => container.removeEventListener('click', handleClick);
  }, [containerRef, isActive, onOutsideClick]);
}
