'use client';

import { useEffect, useRef } from 'react';

import styles from './SmileyLoader.module.css';

import type { SmileyLoaderProps } from './types';

/**
 * Animated smiley loader component
 * @param size - Size in pixels (default: 128)
 * @param color1 - Primary color (default: hsl(193,90%,50%))
 * @param color2 - Secondary color (default: hsl(223,90%,50%))
 * @param className - Additional CSS classes
 */
export function SmileyLoader({
  size = 128,
  color1 = 'hsl(193,90%,50%)',
  color2 = 'hsl(223,90%,50%)',
  className = '',
}: SmileyLoaderProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) {
      return;
    }

    wrapper.style.setProperty('--color-1', color1);
    wrapper.style.setProperty('--color-2', color2);
  }, [color1, color2]);

  return (
    <div ref={wrapperRef} className={`${styles.wrapper} ${className}`}>
      <svg
        role="img"
        aria-label="Loading..."
        className={styles.smiley}
        viewBox="0 0 128 128"
        width={size}
        height={size}
      >
      <defs>
        {/* Eyes clip path */}
        <clipPath id="smiley-eyes">
          <circle
            className={styles.smileyEye1}
            cx="64"
            cy="64"
            r="8"
            transform="rotate(-40,64,64) translate(0,-56)"
          />
          <circle
            className={styles.smileyEye2}
            cx="64"
            cy="64"
            r="8"
            transform="rotate(40,64,64) translate(0,-56)"
          />
        </clipPath>

        {/* Gradient for mask */}
        <linearGradient id="smiley-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#000" />
          <stop offset="100%" stopColor="#fff" />
        </linearGradient>

        {/* Mask for color split effect */}
        <mask id="smiley-mask">
          <rect x="0" y="0" width="128" height="128" fill="url(#smiley-grad)" />
        </mask>
      </defs>

      {/* Top half (color 1) */}
      <g strokeLinecap="round" strokeWidth="12" strokeDasharray="175.93 351.86">
        <g>
          {/* Eyes filled with color 1 */}
          <rect fill="var(--color-1)" width="128" height="64" clipPath="url(#smiley-eyes)" />
          
          {/* Mouth strokes */}
          <g fill="none" stroke="var(--color-1)">
            <circle
              className={styles.smileyMouth1}
              cx="64"
              cy="64"
              r="56"
              transform="rotate(180,64,64)"
            />
            <circle
              className={styles.smileyMouth2}
              cx="64"
              cy="64"
              r="56"
              transform="rotate(0,64,64)"
            />
          </g>
        </g>

        {/* Bottom half (color 2) with mask */}
        <g mask="url(#smiley-mask)">
          <rect fill="var(--color-2)" width="128" height="64" clipPath="url(#smiley-eyes)" />
          <g fill="none" stroke="var(--color-2)">
            <circle
              className={styles.smileyMouth1}
              cx="64"
              cy="64"
              r="56"
              transform="rotate(180,64,64)"
            />
            <circle
              className={styles.smileyMouth2}
              cx="64"
              cy="64"
              r="56"
              transform="rotate(0,64,64)"
            />
          </g>
        </g>
      </g>
    </svg>
    </div>
  );
}

