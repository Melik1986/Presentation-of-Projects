'use client';

import { useCallback, useEffect, useRef, type RefObject } from 'react';

import { useMobileGsapAnimation } from './useMobileGsapAnimation';

type UseMobilePreviewSyncProps = {
  activeFolderId: string | null;
  setActiveFolderId: (id: string | null) => void;
  previewCatalog: (catalogId: string) => void;
  resetActiveFolder: () => void;
};

type UseMobilePreviewSyncReturn = {
  handleActivate: (catalogId: string) => void;
  handleReset: () => void;
};

/**
 * Syncs mobile GSAP preview show/hide with active folder state.
 */
export function useMobilePreviewSync({
  activeFolderId,
  setActiveFolderId,
  previewCatalog,
  resetActiveFolder,
}: UseMobilePreviewSyncProps): UseMobilePreviewSyncReturn {
  const { animatePreviewShow, animatePreviewHide } = useMobileGsapAnimation();
  const previousActiveFolderRef = useRef<string | null>(null);
  const animatePreviewShowRef = useRef(animatePreviewShow);
  const animatePreviewHideRef = useRef(animatePreviewHide);

  useEffect(() => {
    animatePreviewShowRef.current = animatePreviewShow;
  }, [animatePreviewShow]);

  useEffect(() => {
    animatePreviewHideRef.current = animatePreviewHide;
  }, [animatePreviewHide]);

  useEffect(() => {
    syncMobilePreview(
      activeFolderId,
      previousActiveFolderRef,
      animatePreviewShowRef,
      animatePreviewHideRef
    );
  }, [activeFolderId]);

  const handleActivate = useCallback(
    (catalogId: string) => {
      setActiveFolderId(catalogId);
      previewCatalog(catalogId);
    },
    [setActiveFolderId, previewCatalog]
  );

  const handleReset = useCallback(() => {
    hideActivePreviewIfTouch(activeFolderId, animatePreviewHide, previousActiveFolderRef);
    resetActiveFolder();
  }, [activeFolderId, animatePreviewHide, resetActiveFolder]);

  return { handleActivate, handleReset };
}

function isCoarsePointer(): boolean {
  return window.matchMedia('(pointer: coarse)').matches;
}

function syncMobilePreview(
  activeFolderId: string | null,
  previousRef: RefObject<string | null>,
  showRef: RefObject<(id: string) => void>,
  hideRef: RefObject<(id: string) => void>
): void {
  if (!isCoarsePointer()) {
    return;
  }
  hidePreviousIfChanged(activeFolderId, previousRef, hideRef);
  showOrClearActive(activeFolderId, previousRef, showRef);
}

function hidePreviousIfChanged(
  activeFolderId: string | null,
  previousRef: RefObject<string | null>,
  hideRef: RefObject<(id: string) => void>
): void {
  if (!previousRef.current || previousRef.current === activeFolderId) {
    return;
  }
  hideRef.current(previousRef.current);
}

function showOrClearActive(
  activeFolderId: string | null,
  previousRef: RefObject<string | null>,
  showRef: RefObject<(id: string) => void>
): void {
  if (activeFolderId) {
    showRef.current(activeFolderId);
    previousRef.current = activeFolderId;
    return;
  }
  previousRef.current = null;
}

function hideActivePreviewIfTouch(
  activeFolderId: string | null,
  animatePreviewHide: (id: string) => void,
  previousRef: RefObject<string | null>
): void {
  if (!isCoarsePointer() || !activeFolderId) {
    return;
  }
  animatePreviewHide(activeFolderId);
  previousRef.current = null;
}
