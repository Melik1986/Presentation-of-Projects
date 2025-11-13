import { getBaseChartStyles, getTooltipStyle } from './chartStyles';
import { COLOR_PALETTE, RESPONSIVE_BREAKPOINTS, SKILLS_DATA } from './skillsCharts.config';

import type { CallbackDataParams, EChartsOption } from 'echarts/types/dist/shared';

/**
 * Utility function to read CSS variables (fallback implementation)
 */
const readCssVar = (varName: string, fallback: string): string => {
  if (typeof window === 'undefined') return fallback;

  const value = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  return value || fallback;
};

/**
 * Creates configuration for infrastructure skills pie chart
 * @param designWidth - chart container width
 * @param designHeight - chart container height
 * @returns ECharts configuration object for pie chart
 */
export const getDesignChartOptions = (designWidth: number, designHeight: number): EChartsOption => {
  /** Adaptive radius calculation */
  const minDimension = Math.min(designWidth, designHeight);
  const viewportWidth = typeof window === 'undefined' ? designWidth : window.innerWidth;
  const isSmallTablet = viewportWidth < 800;
  const isTablet = viewportWidth < RESPONSIVE_BREAKPOINTS.tablet;
  const radius = isSmallTablet
    ? Math.max(80, minDimension * 0.26)
    : isTablet
      ? Math.max(90, minDimension * 0.28)
      : Math.max(100, minDimension * 0.33);
  /** Adaptive legend font size based on screen width */
  const legendFontSize = viewportWidth < RESPONSIVE_BREAKPOINTS.mobile ? 9 : isTablet ? 10 : 12;

  const legendTextColor = readCssVar('--charts-text-color', '#333333');

  return {
    ...getBaseChartStyles(),
    /** Legend configuration: enabled only on screens >= 480px */
    legend:
      viewportWidth >= RESPONSIVE_BREAKPOINTS.mobile
        ? {
            orient: 'horizontal',
            bottom: '0%',
            left: 'center',
            textStyle: { color: legendTextColor, fontSize: legendFontSize },
            data: SKILLS_DATA.infrastructure.map((item) => item.name),
          }
        : { show: false },
    /** Series data configuration for pie chart */
    series: [
      {
        name: 'Infrastructure Skills',
        type: 'pie',
        radius: [0, radius],
        center: ['50%', isTablet ? (isSmallTablet ? '40%' : '38%') : '35%'],
        roseType: 'area',
        itemStyle: { borderRadius: 8 },
        label: { show: false },
        labelLine: { show: false },
        data: SKILLS_DATA.infrastructure.map((item, index) => ({
          value: 0,
          name: item.name,
          itemStyle: {
            color: index % 2 === 0 ? COLOR_PALETTE.primary : COLOR_PALETTE.secondary,
          },
        })),
        color: [
          COLOR_PALETTE.primary,
          COLOR_PALETTE.secondary,
          '#065f46',
          COLOR_PALETTE.primary,
          '#10b981',
          COLOR_PALETTE.secondary,
        ],
        animationType: 'expansion',
        animationDuration: 1200,
        animationDelay: (idx: number) => idx * 150,
      },
    ],
    /** Tooltip configuration */
    tooltip: {
      trigger: 'item',
      ...getTooltipStyle(),
      formatter: (params: CallbackDataParams) => {
        return `<strong>${params.name}</strong><br/>Level: ${params.value}%`;
      },
    },
  } as EChartsOption;
};

/**
 * Memoized version of getDesignChartOptions for performance optimization
 */
let cachedDesignOptions: EChartsOption | null = null;
let cachedDesignWidth: number | null = null;
let cachedDesignHeight: number | null = null;

export const getMemoizedDesignChartOptions = (
  designWidth: number,
  designHeight: number
): EChartsOption => {
  if (
    cachedDesignOptions &&
    cachedDesignWidth === designWidth &&
    cachedDesignHeight === designHeight
  ) {
    return cachedDesignOptions;
  }

  cachedDesignOptions = getDesignChartOptions(designWidth, designHeight);
  cachedDesignWidth = designWidth;
  cachedDesignHeight = designHeight;
  return cachedDesignOptions;
};

/**
 * Clears design chart options cache
 */
export const clearDesignChartOptionsCache = (): void => {
  cachedDesignOptions = null;
  cachedDesignWidth = null;
  cachedDesignHeight = null;
};
