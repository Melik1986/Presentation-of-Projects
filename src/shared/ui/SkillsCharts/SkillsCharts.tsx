'use client';

import { ChartIcons } from './ChartIcons';
import { useChartsVisibility } from './hooks/useChartsVisibility';
import styles from './SkillsCharts.module.css';

interface SkillsChartsProps {
  className?: string;
}

/**
 * Skills charts component for advanced-tech catalog
 * Displays bar chart (Backend skills) and pie chart (Infrastructure skills)
 * with corresponding technology icons
 */
export function SkillsCharts({ className }: SkillsChartsProps) {
  const { containerRef, chartWrapperProps } = useChartsVisibility();

  return (
    <div ref={containerRef} className={`${styles.skillsCharts} ${className || ''}`}>
      <div className={styles.chartsContainer}>
        <div className={styles.chartWrapper} {...chartWrapperProps}>
          <div id="backend-skills-chart" className={styles.backendChart} />
          <ChartIcons type="backend" />
        </div>
        <div className={styles.chartWrapper} {...chartWrapperProps}>
          <div id="infrastructure-skills-chart" className={styles.infrastructureChart} />
          <ChartIcons type="infrastructure" />
        </div>
      </div>
    </div>
  );
}
