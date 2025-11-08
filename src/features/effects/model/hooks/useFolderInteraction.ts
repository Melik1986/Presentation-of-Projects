import { useCallback, useState } from 'react';

import { MOBILE_BREAKPOINT } from '../data';

type UseFolderInteractionProps = {
  previewCatalog: (catalogId: string) => void;
  setHome: () => void;
};

type UseFolderInteractionReturn = {
  activeFolderId: string | null;
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
      void previewCatalog(catalogId);
    },
    [previewCatalog]
  );

  const handleFolderLeave = useCallback(() => {
    void setHome();
  }, [setHome]);

  const handleFolderClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, catalogId: string) => {
      const isMobile = window.innerWidth < MOBILE_BREAKPOINT;
      if (!isMobile) {
        return;
      }
      if (activeFolderId === catalogId) {
        return;
      }
      e.preventDefault();
      setActiveFolderId(catalogId);
      void previewCatalog(catalogId);
    },
    [activeFolderId, previewCatalog]
  );

  const resetActiveFolder = useCallback(() => {
    setActiveFolderId(null);
    void setHome();
  }, [setHome]);

  return {
    activeFolderId,
    handleFolderHover,
    handleFolderLeave,
    handleFolderClick,
    resetActiveFolder,
  };
}
