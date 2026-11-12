'use client';

import type * as React from 'react';

const MENU_KEY_DELTA: Record<string, number | 'home' | 'end'> = {
  ArrowDown: 1,
  ArrowUp: -1,
  Home: 'home',
  End: 'end',
};

export function focusMenuItemByDelta(
  e: React.KeyboardEvent,
  menuRef: React.RefObject<HTMLDivElement | null>,
  delta: number | 'home' | 'end'
) {
  const items = Array.from(menuRef.current?.querySelectorAll<HTMLElement>('[role=menuitem]') ?? []);
  if (!items.length) return;
  const at = items.indexOf(document.activeElement as HTMLElement);
  e.preventDefault();
  if (delta === 'home') {
    items[0]?.focus();
    return;
  }
  if (delta === 'end') {
    items.at(-1)?.focus();
    return;
  }
  items[(at + delta + items.length) % items.length]?.focus();
}

export function handleMenuKeyNav(
  e: React.KeyboardEvent<HTMLDivElement>,
  menuRef: React.RefObject<HTMLDivElement | null>,
  setMenuOpen: React.Dispatch<React.SetStateAction<boolean>>
) {
  if (e.key === 'Tab') {
    setMenuOpen(false);
    return;
  }
  const delta = MENU_KEY_DELTA[e.key];
  if (delta !== undefined) focusMenuItemByDelta(e, menuRef, delta);
}
