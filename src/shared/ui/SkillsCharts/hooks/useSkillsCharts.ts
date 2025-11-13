'use client';

import { BarChart, PieChart } from 'echarts/charts';
import {
  GridComponent,
  LegendComponent,
  TitleComponent,
  TooltipComponent,
} from 'echarts/components';
import * as echarts from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { useCallback, useEffect, useRef } from 'react';

import { getDesignChartOptions } from '../designChartOptions';
import { getDevChartOptions } from '../devChartOptions';
import { SELECTORS, SKILLS_DATA } from '../skillsCharts.config';

// Flag for tracking ECharts component registration
let echartsRegistered = false;

/**
 * Registers ECharts components only on first use
 */
const registerEChartsComponents = () => {
  if (!echartsRegistered) {
    echarts.use([
      BarChart,
      PieChart,
      TitleComponent,
      TooltipComponent,
      GridComponent,
      LegendComponent,
      CanvasRenderer,
    ]);
    echartsRegistered = true;
  }
};

/**
 * Validates presence and dimensions of DOM elements
 */
const validateChartElements = () => {
  const devChartElement = document.querySelector(SELECTORS.BACKEND_CHART) as HTMLElement | null;
  const designChartElement = document.querySelector(
    SELECTORS.INFRASTRUCTURE_CHART
  ) as HTMLElement | null;

  if (!devChartElement || !designChartElement) {
    // Chart elements not found
    return null;
  }

  if (devChartElement.offsetHeight === 0 || designChartElement.offsetHeight === 0) {
    // Chart containers have zero height
    return null;
  }

  return { devChartElement, designChartElement };
};

/**
 * Creates chart instances
 */
const createChartInstances = (
  devChartRef: { current: echarts.ECharts | null },
  designChartRef: { current: echarts.ECharts | null },
  devChartElement: HTMLElement,
  designChartElement: HTMLElement
) => {
  // Register ECharts components only on first use
  registerEChartsComponents();

  // Check if charts are already initialized
  if (devChartRef.current) {
    devChartRef.current.dispose();
  }
  if (designChartRef.current) {
    designChartRef.current.dispose();
  }

  // Background color is now controlled by .chart-wrapper via CSS variables
  // Don't set background on element/canvas - leave canvas transparent
  devChartRef.current = echarts.init(devChartElement, null, {
    renderer: 'canvas',
    useDirtyRect: false,
    useCoarsePointer: false,
    ssr: false,
    width: 'auto',
    height: 'auto',
  });

  designChartRef.current = echarts.init(designChartElement, null, {
    renderer: 'canvas',
    useDirtyRect: false,
    useCoarsePointer: false,
    ssr: false,
    width: 'auto',
    height: 'auto',
  });

  // Disable wheel events to prevent passive listener warnings
  if (devChartRef.current) {
    const zr = devChartRef.current.getZr();
    zr.off('mousewheel');
    zr.off('wheel');
    const dom = devChartRef.current.getDom();
    if (dom) {
      (dom as HTMLElement).style.touchAction = 'pan-y';
    }
  }

  if (designChartRef.current) {
    const zr = designChartRef.current.getZr();
    zr.off('mousewheel');
    zr.off('wheel');
    const dom = designChartRef.current.getDom();
    if (dom) {
      (dom as HTMLElement).style.touchAction = 'pan-y';
    }
  }
};

/**
 * Configures chart options
 */
const configureChartOptions = (
  devChartRef: { current: echarts.ECharts | null },
  designChartRef: { current: echarts.ECharts | null },
  devChartElement: HTMLElement,
  designChartElement: HTMLElement
) => {
  const containerWidth = devChartElement.offsetWidth;
  devChartRef.current?.setOption(getDevChartOptions(containerWidth), { notMerge: true });

  const designWidth = designChartElement.offsetWidth;
  const designHeight = designChartElement.offsetHeight;
  designChartRef.current?.setOption(getDesignChartOptions(designWidth, designHeight), {
    notMerge: true,
  });
};

/**
 * Plays chart animations
 */
const playAnimation = (devChart: echarts.ECharts | null, designChart: echarts.ECharts | null) => {
  if (!devChart || !designChart) return;

  // Animate backend chart
  devChart.setOption({
    series: [
      {
        data: SKILLS_DATA.backend.map((item) => item.score),
        animationDuration: 1000,
        animationDelay: (idx: number) => idx * 100,
      },
    ],
  });

  // Animate infrastructure chart
  designChart.setOption({
    series: [
      {
        data: SKILLS_DATA.infrastructure.map((item) => ({
          value: item.value,
          name: item.name,
        })),
      },
    ],
  });
};

/**
 * Hides charts with animation
 */
const hideCharts = (devChart: echarts.ECharts | null, designChart: echarts.ECharts | null) => {
  if (!devChart || !designChart) return;

  devChart.setOption({
    series: [{ data: SKILLS_DATA.backend.map(() => 0) }],
  });

  designChart.setOption({
    series: [
      {
        data: SKILLS_DATA.infrastructure.map((item) => ({
          value: 0,
          name: item.name,
        })),
      },
    ],
  });
};

/**
 * Resets animation
 */
const resetAnimation = (
  devChartRef: { current: echarts.ECharts | null },
  designChartRef: { current: echarts.ECharts | null }
) => {
  hideCharts(devChartRef.current, designChartRef.current);

  setTimeout(() => {
    if (devChartRef.current) {
      devChartRef.current.dispose();
      devChartRef.current = null;
    }
    if (designChartRef.current) {
      designChartRef.current.dispose();
      designChartRef.current = null;
    }
  }, 500);
};

/**
 * Resizes charts
 */
const resizeCharts = (devChart: echarts.ECharts | null, designChart: echarts.ECharts | null) => {
  devChart?.resize();
  designChart?.resize();
};

/**
 * Hook for managing skills charts
 * Initializes and manages ECharts charts for displaying skills
 * @returns object with chart management methods
 */
export const useSkillsCharts = () => {
  const devChartRef = useRef<echarts.ECharts | null>(null);
  const designChartRef = useRef<echarts.ECharts | null>(null);
  const themeObserverRef = useRef<MutationObserver | null>(null);

  const setupCharts = useCallback(() => {
    const elements = validateChartElements();
    if (!elements) return;

    const { devChartElement, designChartElement } = elements;
    createChartInstances(devChartRef, designChartRef, devChartElement, designChartElement);
    configureChartOptions(devChartRef, designChartRef, devChartElement, designChartElement);
  }, []);

  const initializeCharts = useCallback(() => {
    setupCharts();
  }, [setupCharts]);

  /** Initialize charts and handle window resize */
  useEffect(() => {
    let rafId: number | null = null;
    const onResize = () => {
      if (rafId != null) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        resizeCharts(devChartRef.current, designChartRef.current);
        rafId = null;
      });
    };
    window.addEventListener('resize', onResize);

    // Observe theme changes to update background/text colors
    themeObserverRef.current = new MutationObserver(() => {
      const elements = validateChartElements();
      if (!elements) return;
      const { devChartElement, designChartElement } = elements;

      // Re-init to apply new backgroundColor
      createChartInstances(devChartRef, designChartRef, devChartElement, designChartElement);
      configureChartOptions(devChartRef, designChartRef, devChartElement, designChartElement);
      // Re-run animation after theme change
      playAnimation(devChartRef.current, designChartRef.current);
    });
    themeObserverRef.current.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });

    const currentDevChart = devChartRef.current;
    const currentDesignChart = designChartRef.current;

    return () => {
      window.removeEventListener('resize', onResize);
      if (rafId != null) cancelAnimationFrame(rafId);
      if (currentDevChart) currentDevChart.dispose();
      if (currentDesignChart) currentDesignChart.dispose();
      if (themeObserverRef.current) {
        themeObserverRef.current.disconnect();
        themeObserverRef.current = null;
      }
    };
  }, []);

  return {
    initializeCharts,
    playAnimation: () => playAnimation(devChartRef.current, designChartRef.current),
    hideCharts: () => hideCharts(devChartRef.current, designChartRef.current),
    resetAnimation: () => resetAnimation(devChartRef, designChartRef),
    resizeCharts: () => resizeCharts(devChartRef.current, designChartRef.current),
    getChartElements: () => ({
      leftContainer: document.querySelector('[class*="skills-charts__container"]'),
      chartWrappers: document.querySelectorAll('[class*="chart-wrapper"]'),
    }),
  };
};
