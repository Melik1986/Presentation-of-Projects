'use client';

import gsap from 'gsap';
import { useCallback, useRef } from 'react';

import { createLogger } from '@/shared/lib';

import { getPreviewRotation } from '../utils';

const logger = createLogger().child({ hook: 'useMobileGsapAnimation' });

/**
 * Mobile GSAP animations (triggered by React state)
 * Pattern: React handles logic, GSAP handles animations
 */
export function useMobileGsapAnimation() {
  const currentAnimationRef = useRef<gsap.core.Tween | null>(null);
  const initializedRef = useRef(false);

  // Map для кэширования найденных элементов (с проверкой валидности через document.contains)
  const folderCacheRef = useRef(new Map<string, HTMLElement>());

  // Set initial state via GSAP (not CSS)
  const initializePreviewState = useCallback(() => {
    if (initializedRef.current) return;

    const allPreviews = gsap.utils.toArray<HTMLElement>('.folder-preview');
    const allPreviewImages = gsap.utils.toArray<HTMLElement>('.folder-preview-img');

    // Set initial opacity and transforms via GSAP
    gsap.set(allPreviews, { opacity: 0 });
    gsap.set(allPreviewImages, { y: '0%', rotation: 0, opacity: 0 });

    initializedRef.current = true;
  }, []);

  const findFolder = useCallback((folderId: string): HTMLElement | null => {
    const folderCache = folderCacheRef.current;

    // Проверяем кэш и валидность элемента
    const cached = folderCache.get(folderId);
    if (cached && document.contains(cached)) {
      return cached;
    }

    // Если элемент удален из DOM, удаляем из кэша
    if (cached) {
      folderCache.delete(folderId);
    }

    // Ищем элемент
    let folder = document.querySelector<HTMLElement>(`[href="/sticky/${folderId}"]`);

    if (!folder) {
      folder = document.querySelector<HTMLElement>(`.folder[data-catalog="${folderId}"]`);
    }

    // Сохраняем в кэш если нашли
    if (folder) {
      folderCache.set(folderId, folder);
    }

    return folder;
  }, []);

  const animatePreviewShow = useCallback(
    (folderId: string) => {
      initializePreviewState();

      // Kill previous animation
      if (currentAnimationRef.current) {
        currentAnimationRef.current.kill();
      }

      // Используем кэшированную функцию поиска
      const folder = findFolder(folderId);

      if (!folder) {
        logger.warn('Folder not found', { folderId });
        return;
      }

      const previewImages = gsap.utils.toArray<HTMLElement>(
        folder.querySelectorAll('.folder-preview-img')
      );

      if (previewImages.length === 0) {
        logger.warn('No preview images found in folder', { folderId });
        return;
      }

      // Get preview container
      const previewContainer = folder.querySelector('.folder-preview') as HTMLElement;

      // Show preview container (GSAP, not CSS)
      if (previewContainer) {
        gsap.to(previewContainer, {
          opacity: 1,
          duration: 0.35,
          ease: 'power2.out',
        });
      }

      // Animate preview images with premium wave stagger
      const anim = gsap.to(previewImages, {
        y: '-100%',
        rotation: (i) => getPreviewRotation(i),
        opacity: 1,
        duration: 0.55,
        ease: 'back.out(1.7)',
        stagger: {
          amount: -0.25,
          from: 'center',
          ease: 'power2.inOut',
        },
      });

      currentAnimationRef.current = anim;
    },
    [initializePreviewState, findFolder]
  );

  const animatePreviewHide = useCallback(
    (folderId: string) => {
      // Kill previous animation
      if (currentAnimationRef.current) {
        currentAnimationRef.current.kill();
      }

      // Используем кэшированную функцию поиска
      const folder = findFolder(folderId);

      if (!folder) {
        logger.warn('Folder not found for hide animation', { folderId });
        return;
      }

      const previewImages = gsap.utils.toArray<HTMLElement>(
        folder.querySelectorAll('.folder-preview-img')
      );

      if (previewImages.length === 0) {
        return;
      }

      // Get preview container
      const previewContainer = folder.querySelector('.folder-preview') as HTMLElement;

      // Hide preview container (GSAP, not CSS)
      if (previewContainer) {
        gsap.to(previewContainer, {
          opacity: 0,
          duration: 0.3,
          ease: 'power2.in',
        });
      }

      // Reset preview images with reverse wave stagger
      const anim = gsap.to(previewImages, {
        y: '0%',
        rotation: 0,
        opacity: 0,
        duration: 0.4,
        ease: 'power2.inOut',
        stagger: {
          amount: -0.15,
          from: 'edges',
          ease: 'power2.inOut',
        },
      });

      currentAnimationRef.current = anim;
    },
    [findFolder]
  );

  return {
    animatePreviewShow,
    animatePreviewHide,
  };
}
