'use client';

import gsap from 'gsap';
import { useCallback, useRef } from 'react';

/**
 * Mobile GSAP animations (triggered by React state)
 * Pattern: React handles logic, GSAP handles animations
 */
export function useMobileGsapAnimation() {
  const currentAnimationRef = useRef<gsap.core.Tween | null>(null);

  const animatePreviewShow = useCallback((folderId: string) => {
    // Kill previous animation
    if (currentAnimationRef.current) {
      currentAnimationRef.current.kill();
    }

    // Try multiple selectors to find folder
    let folder = document.querySelector(`[href="/sticky/${folderId}"]`);
    
    if (!folder) {
      // Fallback: try by data attribute or class
      folder = document.querySelector(`.folder[data-catalog="${folderId}"]`);
    }
    
    if (!folder) {
      console.warn(`useMobileGsapAnimation: folder not found for ${folderId}`);
      return;
    }

    const previewImages = gsap.utils.toArray<HTMLElement>(
      folder.querySelectorAll('.folder-preview-img')
    );
    
    if (previewImages.length === 0) {
      console.warn(`useMobileGsapAnimation: no preview images found in folder ${folderId}`);
      return;
    }

    // Animate preview images with stagger (same as desktop)
    previewImages.forEach((img, i) => {
      const rotation =
        i === 0
          ? gsap.utils.random(-20, -10)
          : i === 1
          ? gsap.utils.random(-10, 10)
          : gsap.utils.random(10, 20);

      const anim = gsap.to(img, {
        y: '-100%',
        rotation: rotation,
        duration: 0.3,
        ease: 'back.out(1.7)',
        delay: i * 0.05,
      });

      if (i === 0) {
        currentAnimationRef.current = anim;
      }
    });
  }, []);

  const animatePreviewHide = useCallback((folderId: string) => {
    // Kill previous animation
    if (currentAnimationRef.current) {
      currentAnimationRef.current.kill();
    }

    // Try multiple selectors to find folder
    let folder = document.querySelector(`[href="/sticky/${folderId}"]`);
    
    if (!folder) {
      folder = document.querySelector(`.folder[data-catalog="${folderId}"]`);
    }
    
    if (!folder) {
      console.warn(`useMobileGsapAnimation: folder not found for ${folderId}`);
      return;
    }

    const previewImages = gsap.utils.toArray<HTMLElement>(
      folder.querySelectorAll('.folder-preview-img')
    );
    
    if (previewImages.length === 0) {
      return;
    }

    // Reset to initial state
    previewImages.forEach((img, i) => {
      const anim = gsap.to(img, {
        y: '0%',
        rotation: 0,
        duration: 0.25,
        ease: 'power2.inOut',
        delay: i * 0.025,
      });

      if (i === 0) {
        currentAnimationRef.current = anim;
      }
    });
  }, []);

  return {
    animatePreviewShow,
    animatePreviewHide,
  };
}
