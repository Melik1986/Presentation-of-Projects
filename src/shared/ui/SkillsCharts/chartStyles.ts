/**
 * Utility function to read CSS variables
 * Falls back to default value if variable is not defined
 */
const readCssVar = (varName: string, fallback: string): string => {
  if (typeof window === 'undefined') return fallback;

  const value = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  return value || fallback;
};

/**
 * Base styles for all charts
 * Defines padding and grid for correct display
 */
export const getBaseChartStyles = () => ({
  // Canvas background should be transparent; container (.chart-wrapper) provides the visible background
  backgroundColor: 'transparent',
  textStyle: { color: readCssVar('--charts-text-color', '#FFFFFF') },
  grid: {
    left: '10%',
    right: '10%',
    bottom: '15%',
    top: '10%',
  },
});

/**
 * Styles for chart tooltips
 * Ensures consistent appearance of tooltips
 */
export const getTooltipStyle = () => ({
  backgroundColor: '#FFFFFF',
  borderColor: 'transparent',
  textStyle: { color: '#000' },
  extraCssText: 'box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2); border-radius: 4px;',
});

/**
 * Styles for chart axes
 * Defines color and style of axes for better readability
 */
export const getAxisStyle = () => ({
  axisLabel: { color: readCssVar('--charts-text-color', '#333333') },
  axisLine: { lineStyle: { color: readCssVar('--charts-text-color', '#333333') } },
  axisTick: { lineStyle: { color: readCssVar('--charts-text-color', '#333333') } },
});
