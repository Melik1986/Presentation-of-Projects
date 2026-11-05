'use client';

import { useRef } from 'react';

import { StickyCard } from './components/StickyCard';
import { useIsMobile } from './hooks/useIsMobile';
import styles from './StickyCards.module.css';
import { defaultStickyCardsData } from '../../model/data';
import { useFigmaImageAnimation } from '../../model/hooks/useFigmaImageAnimation';
import { useFirstCardAnimation } from '../../model/hooks/useFirstCardAnimation';
import { useStickyCardsAnimation } from '../../model/hooks/useStickyCardsAnimation';

import type { StickyCardsProps } from '../../model/types';

export function StickyCards({
  cards = defaultStickyCardsData,
  className,
  catalogId,
}: StickyCardsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  useStickyCardsAnimation(containerRef);
  useFirstCardAnimation(containerRef);
  useFigmaImageAnimation(containerRef, catalogId, 2);

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
