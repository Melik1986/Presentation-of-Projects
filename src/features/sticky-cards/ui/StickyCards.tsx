'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Image from 'next/image';
import { useRef } from 'react';

import styles from './StickyCards.module.css';
import { defaultStickyCardsData } from '../model/data';

import type { StickyCardsProps } from '../model/types';


gsap.registerPlugin(ScrollTrigger);

export function StickyCards({ cards = defaultStickyCardsData, className }: StickyCardsProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const stickyCards = gsap.utils.toArray<HTMLElement>('.sticky-card');

      stickyCards.forEach((card, index) => {
        const isLastCard = index === stickyCards.length - 1;

        if (!isLastCard) {
          ScrollTrigger.create({
            trigger: card,
            start: 'top top',
            endTrigger: stickyCards[stickyCards.length - 1],
            end: 'top top',
            pin: true,
            pinSpacing: false,
          });

          ScrollTrigger.create({
            trigger: stickyCards[index + 1],
            start: 'top bottom',
            end: 'top top',
            onUpdate: (self) => {
              const progress = self.progress;
              const scale = 1 - progress * 0.25;
              const rotation = (index % 2 === 0 ? 5 : -5) * progress;
              const afterOpacity = progress;

              gsap.set(card, {
                scale,
                rotation,
                '--after-opacity': afterOpacity,
              });
            },
          });
        }
      });
    },
    { scope: containerRef }
  );

  return (
    <div className={`${styles.stickyCards} ${className || ''}`} ref={containerRef}>
      {cards.map((cardData) => (
        <div className={`sticky-card ${styles.stickyCard}`} key={cardData.index}>
          <div className={styles.stickyCardIndex}>
            <h1>{cardData.index}</h1>
          </div>

          <div className={styles.stickyCardContent}>
            <div className={styles.stickyCardContentWrapper}>
              <h1 className={styles.stickyCardHeader}>{cardData.title}</h1>

              <div className={styles.stickyCardImg}>
                <Image src={cardData.image} alt={cardData.title} fill sizes="(max-width: 768px) 100vw, 50vw" />
              </div>

              <div className={styles.stickyCardCopy}>
                <div className={styles.stickyCardCopyTitle}>
                  <p>(About the state)</p>
                </div>
                <div className={styles.stickyCardCopyDescription}>
                  <p>{cardData.description}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
