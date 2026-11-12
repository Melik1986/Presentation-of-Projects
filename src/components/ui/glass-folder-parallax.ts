'use client';

import * as React from 'react';

function scheduleWrite(el: HTMLDivElement, state: { raf: number; px: number; py: number }) {
  if (state.raf) return;
  state.raf = requestAnimationFrame(() => {
    state.raf = 0;
    el.style.setProperty('--gf-px', state.px.toFixed(3));
    el.style.setProperty('--gf-py', state.py.toFixed(3));
  });
}

function attachPointerParallax(el: HTMLDivElement) {
  const state = { raf: 0, px: 0, py: 0 };
  const move = (e: PointerEvent) => {
    if (e.pointerType === 'touch') return;
    const r = el.getBoundingClientRect();
    state.px = ((e.clientX - r.left) / r.width) * 2 - 1;
    state.py = ((e.clientY - r.top) / r.height) * 2 - 1;
    scheduleWrite(el, state);
  };
  const leave = () => {
    state.px = 0;
    state.py = 0;
    scheduleWrite(el, state);
  };
  el.addEventListener('pointermove', move);
  el.addEventListener('pointerleave', leave);
  return () => {
    el.removeEventListener('pointermove', move);
    el.removeEventListener('pointerleave', leave);
    cancelAnimationFrame(state.raf);
  };
}

export function usePointerParallax(rootRef: React.RefObject<HTMLDivElement | null>) {
  React.useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    return attachPointerParallax(el);
  }, [rootRef]);
}
