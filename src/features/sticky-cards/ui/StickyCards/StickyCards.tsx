'use client';

import { useRef } from 'react';

import { StickyCard } from './components/StickyCard';
import { useIsMobile } from './hooks/useIsMobile';
import styles from './StickyCards.module.css';
import { defaultStickyCardsData } from '../../model/data';
import { useFirstCardAnimation } from '../../model/hooks/useFirstCardAnimation';
import { useStickyCardsAnimation } from '../../model/hooks/useStickyCardsAnimation';

import type { StickyCardsProps } from '../../model/types';

export function StickyCards({
  cards = defaultStickyCardsData,
  className,
  catalogId,
}: Readonly<StickyCardsProps>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  useStickyCardsAnimation(containerRef);
  useFirstCardAnimation(containerRef);

  return (
    <div className={`${styles.stickyCards} ${className || ''}`} ref={containerRef}>
      {cards.map((cardData) => (
        <StickyCard
          key={cardData.index}
          cardData={cardData}
          catalogId={catalogId}
          isMobile={isMobile}
        />
      ))}
    </div>
  );
}
