'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

import type { RefObject } from 'react';

/**
 * Анимация появления первой карточки
 * - Появление с opacity 0 -> 1
 * - Движение снизу вверх (y: 80 -> 0)
 * - Blur эффект (blur(10px) -> blur(0px))
 * - Задержка 0.6s для синхронизации с заголовком
 */
export function useFirstCardAnimation(
  containerRef: RefObject<HTMLDivElement | null>
): void {
  useGSAP(
    () => {
      const firstCard = containerRef.current?.querySelector('.sticky-card');

      if (!firstCard) {
        return;
      }

      // Устанавливаем начальное состояние
      gsap.set(firstCard, {
        opacity: 0,
        y: 80,
        filter: 'blur(10px)',
      });

      // Анимация появления
      gsap.to(firstCard, {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        duration: 1.2,
        delay: 0.6,
        ease: 'power2.out',
      });
    },
    {
      scope: containerRef,
      dependencies: [],
    }
  );
}

