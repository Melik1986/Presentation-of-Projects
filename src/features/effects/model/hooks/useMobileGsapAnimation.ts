'use client';

import gsap from 'gsap';
import { useCallback, useRef } from 'react';

/**
 * Mobile GSAP animations (triggered by React state)
 * Pattern: React handles logic, GSAP handles animations
 */
export function useMobileGsapAnimation() {
  const currentAnimationRef = useRef<gsap.core.Tween | null>(null);
  const initializedRef = useRef(false);

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

  const animatePreviewShow = useCallback((folderId: string) => {
    initializePreviewState();
    
    // Kill previous animation
    if (currentAnimationRef.current) {
      currentAnimationRef.current.kill();
    }

    // Try multiple selectors to find folder
    let folder = document.querySelector(`[href="/sticky/${folderId}"]`);
    
    if (!folder) {
      // Fallback: try by data attribute
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

    // Get preview container
    const previewContainer = folder.querySelector('.folder-preview') as HTMLElement;

    // Show preview container (GSAP, not CSS)
    if (previewContainer) {
      gsap.to(previewContainer, {
        opacity: 1,
        duration: 0.2,
        ease: 'power2.out',
      });
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
        opacity: 1, // GSAP opacity too
        duration: 0.3,
        ease: 'back.out(1.7)',
        delay: i * 0.05,
      });

      if (i === 0) {
        currentAnimationRef.current = anim;
      }
    });
  }, [initializePreviewState]);

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

    // Get preview container
    const previewContainer = folder.querySelector('.folder-preview') as HTMLElement;

    // Hide preview container (GSAP, not CSS)
    if (previewContainer) {
      gsap.to(previewContainer, {
        opacity: 0,
        duration: 0.2,
        ease: 'power2.in',
      });
    }

    // Reset preview images to initial state
    previewImages.forEach((img, i) => {
      const anim = gsap.to(img, {
        y: '0%',
        rotation: 0,
        opacity: 0, // GSAP opacity
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
