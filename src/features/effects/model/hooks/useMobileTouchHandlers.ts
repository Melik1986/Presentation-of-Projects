'use client';

import { useEffect, useRef } from 'react';

import type { RefObject } from 'react';

type UseMobileTouchHandlersProps = {
  containerRef: RefObject<HTMLElement | null>;
  activeFolderId: string | null;
  onActivate: (catalogId: string) => void;
};

/**
 * Native touch handlers with { passive: false } to allow preventDefault
 * React synthetic events are passive by default - can't prevent navigation
 */
export function useMobileTouchHandlers({
  containerRef,
  activeFolderId,
  onActivate,
}: UseMobileTouchHandlersProps): void {
  const activeFolderRef = useRef(activeFolderId);
  
  useEffect(() => {
    activeFolderRef.current = activeFolderId;
  }, [activeFolderId]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    // Proper touch detection (Web standards)
    const supportsHover = window.matchMedia('(hover: hover)').matches;
    const isPointerCoarse = window.matchMedia('(pointer: coarse)').matches;
    
    // Only setup touch handlers on actual touch devices
    if (supportsHover && !isPointerCoarse) {
      return; // Desktop with hover, skip
    }

    const handleTouchStart = (e: TouchEvent) => {
      const target = e.target as HTMLElement;
      console.log('🔬 Touch detected on:', target.className || target.tagName);
      
      const folder = target.closest('.folder') as HTMLAnchorElement;
      
      if (!folder) {
        console.log('🔬 No folder found (bubbling issue?)');
        return;
      }

      console.log('🔬 Folder found:', folder.getAttribute('href'));

      const href = folder.getAttribute('href');
      if (!href) {
        console.log('🔬 No href attribute');
        return;
      }

      // Extract catalogId from href (/sticky/[catalogId])
      const catalogId = href.split('/').pop();
      if (!catalogId) {
        console.log('🔬 Could not extract catalogId from href');
        return;
      }

      console.log('🔬 CatalogId:', catalogId, '| Active:', activeFolderRef.current);

      // If already active, allow navigation
      if (activeFolderRef.current === catalogId) {
        console.log('🔬 Already active, allowing navigation');
        return;
      }

      // First touch: prevent navigation, activate folder
      console.log('🔬 Preventing navigation, activating folder');
      e.preventDefault();
      onActivate(catalogId);
    };

    // Add native listener with passive: false
    container.addEventListener('touchstart', handleTouchStart, { passive: false });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
    };
  }, [containerRef, onActivate]);
}
