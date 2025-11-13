import { useRef, useEffect, type RefObject } from 'react';

import { DEFAULT_SPIRAL_CONFIG } from './spiral.config';

/**
 * Hook for managing spiral animation of technology icons
 * @param containerRef - reference to container with spirals
 */
export const useSpiralAnimation = (containerRef: RefObject<HTMLDivElement | null>) => {
  const angleRef = useRef(0);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const animate = () => {
      angleRef.current += DEFAULT_SPIRAL_CONFIG.speed;

      const icons = containerRef.current?.querySelectorAll('.spiral-icon') as NodeListOf<HTMLElement>;

      icons.forEach((icon, i) => {
        const phase = i * ((Math.PI * 2) / DEFAULT_SPIRAL_CONFIG.numIcons);

        const x = DEFAULT_SPIRAL_CONFIG.radiusX * Math.sin(angleRef.current + phase);
        const y = DEFAULT_SPIRAL_CONFIG.radiusY * Math.sin((angleRef.current + phase) * 2);
        const scale = Math.cos(angleRef.current + phase) * 0.5 + 0.5;

        icon.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [containerRef]);

  return null;
};

