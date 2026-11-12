'use client';

import * as React from 'react';

import type { FolderFile } from './glass-folder-types';

export { useFolderDismiss } from './glass-folder-dismiss';
export { usePointerParallax } from './glass-folder-parallax';

const MAX_VISIBLE = 4;

export const SAMPLE_FILES: FolderFile[] = [
  { name: 'Cover — final', meta: 'PNG · 4.8 MB', art: 'ember' },
  { name: 'Moodboard', meta: '24 images', art: 'dusk' },
  { name: 'Brief.pdf', meta: 'PDF · 1.2 MB' },
];

export function useControlledOpen(
  openProp: boolean | undefined,
  defaultOpen: boolean,
  onOpenChange?: (open: boolean) => void
) {
  const [openState, setOpenState] = React.useState(defaultOpen);
  const open = openProp ?? openState;
  const setOpen = React.useCallback(
    (next: boolean) => {
      if (openProp === undefined) setOpenState(next);
      onOpenChange?.(next);
    },
    [openProp, onOpenChange]
  );
  return { open, setOpen };
}

function watchIntersection(
  el: HTMLDivElement,
  appearDelay: number,
  setEntered: (v: boolean) => void
) {
  let t = 0;
  const io = new IntersectionObserver(
    (entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      io.disconnect();
      t = window.setTimeout(() => setEntered(true), appearDelay);
    },
    { threshold: 0.25 }
  );
  io.observe(el);
  return () => {
    io.disconnect();
    window.clearTimeout(t);
  };
}

export function useAppearOnView(
  rootRef: React.RefObject<HTMLDivElement | null>,
  appear: boolean,
  appearDelay: number
) {
  const [entered, setEntered] = React.useState(!appear);
  React.useEffect(() => {
    if (!appear) return;
    const el = rootRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setEntered(true);
      return;
    }
    return watchIntersection(el, appearDelay, setEntered);
  }, [appear, appearDelay, rootRef]);
  return entered;
}

export function useFolderFiles(
  initialFiles: FolderFile[],
  onAdd?: (files: FolderFile[]) => FolderFile | void,
  onFilesChange?: (files: FolderFile[]) => void
) {
  const [files, setFiles] = React.useState<FolderFile[]>(initialFiles);
  const ids = React.useRef<number[]>(initialFiles.map((_, i) => i));
  const nextId = React.useRef(initialFiles.length);
  const [dropped, setDropped] = React.useState<number | null>(null);
  const [bump, setBump] = React.useState(0);

  const addFile = () => {
    const made = onAdd?.(files);
    const file: FolderFile = made ?? { name: 'Untitled ' + (files.length + 1), meta: 'Just now' };
    const next = [...files, file];
    const id = nextId.current++;
    ids.current = [...ids.current, id];
    setFiles(next);
    setDropped(id);
    setBump((b) => b + 1);
    onFilesChange?.(next);
  };

  const start = Math.max(0, files.length - MAX_VISIBLE);
  return {
    files,
    ids,
    dropped,
    setDropped,
    bump,
    addFile,
    start,
    visible: files.slice(start),
    count: files.length,
  };
}
