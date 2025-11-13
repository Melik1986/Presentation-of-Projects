'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

import { useSkillsCharts } from './useSkillsCharts';

function useVisibilityObserver(
  containerRef: React.RefObject<HTMLDivElement | null>,
  chartsInitializedRef: { current: boolean },
  onHide: () => void
) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    const observer = new window.IntersectionObserver(
      ([entry]) => {
        if (!entry) return;

        if (entry.isIntersecting && !chartsInitializedRef.current) {
          setVisible(true);
        } else if (!entry.isIntersecting && chartsInitializedRef.current) {
          setVisible(false);
          chartsInitializedRef.current = false;
          requestAnimationFrame(onHide);
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [containerRef, chartsInitializedRef, onHide]);

  return visible;
}

function useStartChartsOnVisible(
  visible: boolean,
  chartsInitializedRef: { current: boolean },
  onStart: () => void
) {
  useEffect(() => {
    if (!visible || chartsInitializedRef.current) return;
    const START_DELAY_MS = 900;
    const id = window.setTimeout(onStart, START_DELAY_MS);
    return () => window.clearTimeout(id);
  }, [visible, chartsInitializedRef, onStart]);
}

export function useChartsVisibility() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { initializeCharts, playAnimation, resetAnimation, resizeCharts } = useSkillsCharts();
  const chartsInitializedRef = useRef(false);

  const handleHideCharts = useCallback(() => {
    // resetAnimation calls hideCharts with animation and disposes after delay
    resetAnimation();
  }, [resetAnimation]);

  const handleStartCharts = useCallback(() => {
    initializeCharts();
    chartsInitializedRef.current = true;
    requestAnimationFrame(() => {
      resizeCharts();
      requestAnimationFrame(() => {
        playAnimation();
      });
    });
  }, [initializeCharts, resizeCharts, playAnimation]);

  const visible = useVisibilityObserver(containerRef, chartsInitializedRef, handleHideCharts);
  useStartChartsOnVisible(visible, chartsInitializedRef, handleStartCharts);

  const chartWrapperProps = {
    'data-animation': 'slide-right',
    'data-duration': '0.8',
    'data-ease': 'power2.out',
    'data-delay': '0.3',
  };

  return {
    visible,
    containerRef,
    chartWrapperProps,
  };
}
