'use client';

import React, { useRef } from 'react';

import { useSpiralAnimation } from './hooks/useSpiralAnimation';
import { TECH_ICONS, DEFAULT_SPIRAL_CONFIG } from './spiral.config';
import styles from './SpiralAnimation.module.css';

/**
 * Spiral animation component for technology icons
 * Displays two spirals with rotating technology icons
 */
export function SpiralAnimation() {
  const spiral1Ref = useRef<HTMLDivElement>(null);
  const spiral2Ref = useRef<HTMLDivElement>(null);

  // Create array of icons to render
  const icons = Array.from({ length: DEFAULT_SPIRAL_CONFIG.numIcons }, (_, i) => {
    const iconData = TECH_ICONS[i % TECH_ICONS.length]!;
    const IconComponent = iconData.icon;

    return {
      id: i,
      name: iconData.name,
      color: iconData.color,
      Icon: IconComponent,
    };
  });

  // Start animation for each spiral
  useSpiralAnimation(spiral1Ref);
  useSpiralAnimation(spiral2Ref);

  return (
    <div className={styles.spiralContainer}>
      <div ref={spiral1Ref} className={styles.spiral} data-spiral="1">
        {icons.map((icon) => (
          <div
            key={`spiral1-${icon.id}`}
            className={`spiral-icon spiral-icon--${icon.name}`}
            data-name={icon.name}
          >
            <span className="icon-wrapper">
              <icon.Icon size={24} />
            </span>
          </div>
        ))}
      </div>
      <div ref={spiral2Ref} className={styles.spiral} data-spiral="2">
        {icons.map((icon) => (
          <div
            key={`spiral2-${icon.id}`}
            className={`spiral-icon spiral-icon--${icon.name}`}
            data-name={icon.name}
          >
            <span className="icon-wrapper">
              <icon.Icon size={24} />
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
