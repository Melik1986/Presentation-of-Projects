'use client';

import React from 'react';

import styles from './ChartIcons.module.css';
import { BACKEND_ICONS, INFRASTRUCTURE_ICONS, SKILLS_DATA } from './skillsCharts.config';

interface ChartIconsProps {
  type: 'backend' | 'infrastructure';
}

/**
 * Component for rendering icons overlay for charts
 * Displays technology icons below bar chart or alongside pie chart legend
 */
export function ChartIcons({ type }: ChartIconsProps) {
  if (type === 'backend') {
    return (
      <div className={styles.backendIcons}>
        {SKILLS_DATA.backend.map((item) => {
          const IconComponent = BACKEND_ICONS[item.skill];
          if (!IconComponent) return null;

          return (
            <div key={item.skill} className={styles.iconWrapper} title={item.skill}>
              <IconComponent className={styles.icon} />
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className={styles.infrastructureIcons}>
      {SKILLS_DATA.infrastructure.map((item) => {
        const IconComponent = INFRASTRUCTURE_ICONS[item.name];
        if (!IconComponent) return null;

        return (
          <div key={item.name} className={styles.legendItem} title={item.name}>
            <IconComponent className={styles.icon} />
            <span className={styles.legendText}>{item.name}</span>
          </div>
        );
      })}
    </div>
  );
}

