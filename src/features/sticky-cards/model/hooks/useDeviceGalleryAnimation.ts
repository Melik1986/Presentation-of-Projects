'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { Draggable } from 'gsap/Draggable';
import { Flip } from 'gsap/Flip';

import type { RefObject } from 'react';

gsap.registerPlugin(Flip, Draggable);

export function useDeviceGalleryAnimation(
  galleryRef: RefObject<HTMLDivElement | null>
): void {
  useGSAP(
    () => {
      const gallery = galleryRef.current;
      if (!gallery) return;

      const devices = gsap.utils.toArray<HTMLElement>('[data-device]');

      // Set initial scattered state (corners with rotation)
      const rotations = [-5, 5, 5, -5];
      gsap.set(devices, {
        rotation: (i) => rotations[i] ?? 0,
        filter: 'grayscale(1)',
      });

      let isGathered = false;

      // Hover: gather in center with Flip
      const handleMouseEnter = () => {
        if (isGathered) return;
        isGathered = true;

        const state = Flip.getState(devices);
        gallery.classList.add('gathered');

        Flip.from(state, {
          duration: 0.6,
          ease: 'power2.out',
          absolute: false,
          onUpdate: function () {
            // Gradually remove rotation and grayscale during animation
            const progress = this.progress();
            devices.forEach((device, i) => {
              gsap.set(device, {
                rotation: gsap.utils.interpolate(rotations[i] ?? 0, 0, progress),
                filter: `grayscale(${1 - progress})`,
              });
            });
          },
        });
      };

      // Mouse leave: scatter back to corners
      const handleMouseLeave = () => {
        if (!isGathered) return;
        isGathered = false;

        const state = Flip.getState(devices);
        gallery.classList.remove('gathered');

        Flip.from(state, {
          duration: 0.6,
          ease: 'power2.inOut',
          absolute: false,
          onUpdate: function () {
            const progress = this.progress();
            devices.forEach((device, i) => {
              gsap.set(device, {
                rotation: gsap.utils.interpolate(0, rotations[i] ?? 0, progress),
                filter: `grayscale(${progress})`,
              });
            });
          },
        });
      };

      gallery.addEventListener('mouseenter', handleMouseEnter);
      gallery.addEventListener('mouseleave', handleMouseLeave);

      // Initialize Draggable for each device
      devices.forEach((device) => {
        Draggable.create(device, {
          type: 'x,y',
          bounds: gallery,
          inertia: true,
          onClick: function () {
            // Optional: click handler
          },
        });
      });

      // Cleanup
      return () => {
        gallery.removeEventListener('mouseenter', handleMouseEnter);
        gallery.removeEventListener('mouseleave', handleMouseLeave);
      };
    },
    { scope: galleryRef }
  );
}

