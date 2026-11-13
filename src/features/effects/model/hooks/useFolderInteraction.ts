'use client';

import { useCallback, useState } from 'react';

import { isTouchDevice } from '../utils';

type UseFolderInteractionProps = {
  previewCatalog: (catalogId: string) => void;
  setHome: () => void;
};

type UseFolderInteractionReturn = {
  activeFolderId: string | null;
  setActiveFolderId: (id: string | null) => void;
  handleFolderHover: (catalogId: string) => void;
  handleFolderLeave: () => void;
  handleFolderClick: (e: React.MouseEvent<HTMLAnchorElement>, catalogId: string) => void;
  resetActiveFolder: () => void;
};

/**
 * Hook for managing folder interaction on both desktop and mobile
 * @param previewCatalog - Callback to preview catalog audio
 * @param setHome - Callback to reset to home audio
 */
export function useFolderInteraction({
  previewCatalog,
  setHome,
}: UseFolderInteractionProps): UseFolderInteractionReturn {
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);

  const handleFolderHover = useCallback(
    (catalogId: string) => {
      previewCatalog(catalogId);
    },
    [previewCatalog]
  );

  const handleFolderLeave = useCallback(() => {
    setHome();
  }, [setHome]);

  const handleFolderClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, catalogId: string) => {
      const isMobile = isTouchDevice();
      if (!isMobile) {
        return;
      }
      if (activeFolderId === catalogId) {
        return;
      }
      e.preventDefault();
      setActiveFolderId(catalogId);
      previewCatalog(catalogId);
    },
    [activeFolderId, previewCatalog]
  );

  const resetActiveFolder = useCallback(() => {
    setActiveFolderId(null);
    setHome();
  }, [setHome]);

  return {
    activeFolderId,
    setActiveFolderId,
    handleFolderHover,
    handleFolderLeave,
    handleFolderClick,
    resetActiveFolder,
  };
}
