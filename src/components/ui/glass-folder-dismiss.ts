'use client';

import * as React from 'react';

export type FolderDismissRefs = {
  rootRef: React.RefObject<HTMLDivElement | null>;
  hitRef: React.RefObject<HTMLButtonElement | null>;
  keyRef: React.RefObject<HTMLButtonElement | null>;
  menuRef: React.RefObject<HTMLDivElement | null>;
};

export type FolderDismissState = {
  open: boolean;
  menuOpen: boolean;
  setOpen: (next: boolean) => void;
  setMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  refs: FolderDismissRefs;
};

function dismissOnEscape(state: FolderDismissState) {
  if (state.menuOpen) {
    state.setMenuOpen(false);
    state.refs.keyRef.current?.focus();
    return;
  }
  state.setOpen(false);
  state.refs.hitRef.current?.focus();
}

function shouldCloseMenu(target: Node, state: FolderDismissState): boolean {
  if (!state.menuOpen) return false;
  if (state.refs.menuRef.current?.contains(target)) return false;
  if (state.refs.keyRef.current?.contains(target)) return false;
  return true;
}

function shouldCloseFolder(target: Node, state: FolderDismissState): boolean {
  if (!state.open || state.menuOpen) return false;
  return !state.refs.rootRef.current?.contains(target);
}

function dismissOnOutsidePointer(e: PointerEvent, state: FolderDismissState) {
  const target = e.target as Node;
  if (shouldCloseMenu(target, state)) state.setMenuOpen(false);
  if (shouldCloseFolder(target, state)) state.setOpen(false);
}

export function useFolderDismiss(state: FolderDismissState) {
  const { open, menuOpen, setOpen, setMenuOpen, refs } = state;
  React.useEffect(() => {
    if (!open && !menuOpen) return;
    const live: FolderDismissState = { open, menuOpen, setOpen, setMenuOpen, refs };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') dismissOnEscape(live);
    };
    const onDown = (e: PointerEvent) => dismissOnOutsidePointer(e, live);
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onDown);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onDown);
    };
  }, [open, menuOpen, setOpen, setMenuOpen, refs]);
}
