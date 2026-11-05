import { Github } from 'lucide-react';

import styles from '../StickyCards.module.css';

import type { StickyCardLinksProps } from '../types/stickyCard.types';

export function StickyCardLinks({ cardData }: StickyCardLinksProps) {
  return (
    <div className={styles.projectLinks}>
      <a
        href={cardData.link}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.viewLiveLink}
      >
        View Live →
      </a>
      {cardData.repository && (
        <a
          href={cardData.repository}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.viewLiveLink}
          aria-label={`View ${cardData.title} repository on GitHub`}
        >
          <Github size={16} aria-hidden="true" />
          View Repository
        </a>
      )}
    </div>
  );
}
