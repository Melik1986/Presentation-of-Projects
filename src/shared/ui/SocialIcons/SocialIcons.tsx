'use client';

import { useRef } from 'react';

import { useSocialIconsAnimation } from './hooks/useSocialIconsAnimation';
import styles from './SocialIcons.module.css';

import type { ReactNode } from 'react';

export interface SocialIconItem {
  name: string;
  url: string;
  icon: ReactNode;
}

export interface SocialIconsProps {
  items: SocialIconItem[];
  className?: string;
}

export function SocialIcons({ items, className }: SocialIconsProps) {
  const containerRef = useRef<HTMLUListElement>(null);

  useSocialIconsAnimation(containerRef);

  return (
    <ul ref={containerRef} className={`${styles.socialIcons} ${className || ''}`} data-social-icons>
      {items.map((item, index) => (
        <li key={item.name} data-social-icon-item={index > 0 ? '' : undefined}>
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Visit ${item.name}`}
          >
            <span className={styles.icon}>{item.icon}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}
