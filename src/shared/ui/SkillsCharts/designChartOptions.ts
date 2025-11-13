import { getBaseChartStyles, getTooltipStyle } from './chartStyles';
import { COLOR_PALETTE, SKILLS_DATA } from './skillsCharts.config';

import type { CallbackDataParams, EChartsOption } from 'echarts/types/dist/shared';

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
  const isSmallMobile = viewportWidth < 480;
  const isMobile = viewportWidth < 768;
  const isTablet = viewportWidth < 1024;
  
  // Адаптивный радиус: меньше на мобильных для высоты 220px
  const radius = isSmallMobile
    ? Math.max(60, minDimension * 0.22)
    : isMobile
      ? Math.max(70, minDimension * 0.24)
      : isTablet
        ? Math.max(90, minDimension * 0.28)
        : Math.max(100, minDimension * 0.33);
  
  /** Center position - оптимизировано для компактных высот */
  const centerY = isSmallMobile ? '42%' : isMobile ? '44%' : isTablet ? '40%' : '38%';

  return {
    ...getBaseChartStyles(),
    /** Legend configuration: disabled, icons will be displayed via React component */
    legend: { show: false },
    /** Series data configuration for pie chart */
    series: [
      {
        name: 'Infrastructure Skills',
        type: 'pie',
        radius: [0, radius],
        center: ['50%', centerY],
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
