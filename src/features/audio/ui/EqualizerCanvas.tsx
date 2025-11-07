'use client';

import type { ReactElement } from 'react';
import { useMemo } from 'react';

import { useAnalyserData } from '../model/useStarlightAudio';

type EqualizerCanvasProps = {
  width?: number;
  height?: number;
  barCount?: number;
  barGap?: number;
  barColor?: string;
  className?: string;
};

const DEFAULT_WIDTH = 280;
const DEFAULT_HEIGHT = 80;
const DEFAULT_BAR_COUNT = 32;
const DEFAULT_BAR_GAP = 2;
const DEFAULT_BAR_COLOR = 'currentColor';

export function EqualizerCanvas({
  width = DEFAULT_WIDTH,
  height = DEFAULT_HEIGHT,
  barCount = DEFAULT_BAR_COUNT,
  barGap = DEFAULT_BAR_GAP,
  barColor = DEFAULT_BAR_COLOR,
  className,
}: EqualizerCanvasProps): ReactElement {
  const { data, frame } = useAnalyserData();

  const bars = useMemo(() => {
    if (!data.length) {
      return [];
    }
    const effectiveBarCount = Math.min(barCount, data.length);
    const step = Math.floor(data.length / effectiveBarCount) || 1;
    const maxValue = 255;
    const barWidth = (width - (effectiveBarCount - 1) * barGap) / effectiveBarCount;

    return Array.from({ length: effectiveBarCount }).map((_, index) => {
      const value = data[index * step] ?? 0;
      const normalized = value / maxValue;
      const barHeight = Math.max(2, Math.round(normalized * height));
      const x = index * (barWidth + barGap);
      return { x, barHeight, barWidth };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, height, width, barCount, barGap, frame]);

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      role="img"
      aria-label="Audio equalizer visualization"
    >
      {bars.map(({ x, barHeight, barWidth }) => (
        <rect
          key={x}
          x={x}
          width={barWidth}
          y={height - barHeight}
          height={barHeight}
          fill={barColor}
          rx={2}
        />
      ))}
    </svg>
  );
}
