import * as echarts from 'echarts/core';

import { getAxisStyle, getBaseChartStyles, getTooltipStyle } from './chartStyles';
import { COLOR_PALETTE, RESPONSIVE_BREAKPOINTS, SKILLS_DATA } from './skillsCharts.config';

import type { EChartsCoreOption } from 'echarts/core';

export interface ResponsiveConfig {
  barWidth: number;
  fontSize: number;
  labelRotation: number;
  barGap: number;
}

/**
 * Creates adaptive configuration for bar chart
 * @param containerWidth - chart container width
 * @returns object with adaptive settings
 */
export const computeDevResponsiveConfig = (containerWidth: number): ResponsiveConfig => {
  // More aggressive compression for narrow screens to fit on 768px
  let barWidth: number;
  if (containerWidth < 420) {
    barWidth = Math.max(10, Math.min(16, containerWidth / 22));
  } else if (containerWidth < 800) {
    barWidth = Math.max(12, Math.min(20, containerWidth / 22));
  } else if (containerWidth < 1024) {
    barWidth = Math.max(16, Math.min(26, containerWidth / 18));
  } else {
    barWidth = Math.max(18, Math.min(34, containerWidth / 16));
  }

  const fontSize =
    containerWidth < RESPONSIVE_BREAKPOINTS.mobile
      ? 9
      : containerWidth < RESPONSIVE_BREAKPOINTS.tablet
        ? 10
        : containerWidth < 1024
          ? 11
          : 12;

  const labelRotation = containerWidth < RESPONSIVE_BREAKPOINTS.tablet ? 65 : 0;

  const barGap = containerWidth < RESPONSIVE_BREAKPOINTS.tablet ? 8 : 12;

  return { barWidth, fontSize, labelRotation, barGap };
};

/**
 * Creates tooltip configuration for bar chart
 * @returns tooltip configuration object
 */
const getTooltipConfig = () => ({
  trigger: 'axis',
  ...getTooltipStyle(),
  formatter: (params: { name: string; value: number }[]) => {
    const data = params[0];
    if (!data) return '';
    return `<strong>${data.name}</strong><br/>Level: ${data.value}%`;
  },
});

/**
 * Creates X axis configuration for bar chart
 * @returns X axis configuration object
 */
const getXAxisConfig = () => ({
  type: 'category',
  data: SKILLS_DATA.backend.map((item) => item.skill),
  ...getAxisStyle(),
  axisLabel: {
    show: false, // Hide text labels, icons will be displayed via React component
  },
});

/**
 * Creates Y axis configuration for bar chart
 * @returns Y axis configuration object
 */
const getYAxisConfig = () => ({
  type: 'value',
  max: 100,
  ...getAxisStyle(),
  axisLabel: {
    ...getAxisStyle().axisLabel,
    formatter: '{value}%',
  },
  splitLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.2)' } },
});

/**
 * Creates series data configuration for bar chart
 * @param barWidth - bar width
 * @returns array of series configurations
 */
const getSeriesConfig = (barWidth: number, barGap: number) => [
  {
    name: 'Backend Skills',
    type: 'bar',
    barWidth,
    barGap,
    data: SKILLS_DATA.backend.map(() => 0),
    itemStyle: {
      color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
        { offset: 0, color: COLOR_PALETTE.primary },
        { offset: 1, color: COLOR_PALETTE.secondary },
      ]),
      borderRadius: [4, 4, 0, 0],
    },
  },
];

/**
 * Creates full configuration for backend skills bar chart
 * @param containerWidth - chart container width
 * @returns ECharts configuration object for bar chart
 */
export const getDevChartOptions = (containerWidth: number) => {
  const config: ResponsiveConfig = computeDevResponsiveConfig(containerWidth);

  return {
    ...getBaseChartStyles(),
    tooltip: getTooltipConfig(),
    xAxis: getXAxisConfig(),
    yAxis: getYAxisConfig(),
    series: getSeriesConfig(config.barWidth, config.barGap),
  } as EChartsCoreOption;
};

/**
 * Memoized version of getDevChartOptions for performance optimization
 */
let cachedOptions: EChartsCoreOption | null = null;
let cachedWidth: number | null = null;

export const getMemoizedDevChartOptions = (containerWidth: number): EChartsCoreOption => {
  if (cachedOptions && cachedWidth === containerWidth) {
    return cachedOptions;
  }

  cachedOptions = getDevChartOptions(containerWidth);
  cachedWidth = containerWidth;
  return cachedOptions;
};

/**
 * Clears chart options cache
 */
export const clearDevChartOptionsCache = (): void => {
  cachedOptions = null;
  cachedWidth = null;
};
