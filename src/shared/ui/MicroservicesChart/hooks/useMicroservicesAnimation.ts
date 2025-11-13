'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { MotionPathPlugin } from 'gsap/all';
import { useRef } from 'react';

import { NODE_ANIMATIONS } from '../microservices.config';

import type { RefObject } from 'react';

gsap.registerPlugin(MotionPathPlugin);

interface AnimationRefs {
  pathDesktop: SVGPathElement | null;
  pathTablet: SVGPathElement | null;
  pathMobile: SVGPathElement | null;
  accentLineDesktop: SVGGElement | null;
  accentLineTablet: SVGGElement | null;
  accentLineMobile: SVGGElement | null;
  dotGlow: SVGSVGElement | null;
}

/**
 * Hook for managing GSAP MotionPath animations for microservices connections
 * Animates dots along curved paths from center to corners
 */
export const useMicroservicesAnimation = (
  containerRef: RefObject<HTMLDivElement | null>,
  nodeId: string
) => {
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const resizeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const getAnimationRefs = (): AnimationRefs | null => {
    if (!containerRef.current) return null;

    const nodeElement = containerRef.current.querySelector(`[data-node-id="${nodeId}"]`);
    if (!nodeElement) return null;

    return {
      pathDesktop: nodeElement.querySelector('.microservices-path-desktop path') as SVGPathElement,
      pathTablet: nodeElement.querySelector('.microservices-path-tablet path') as SVGPathElement,
      pathMobile: nodeElement.querySelector('.microservices-path-mobile path') as SVGPathElement,
      accentLineDesktop: nodeElement.querySelector(
        '.microservices-path-desktop .microservices-line-accent'
      ) as SVGGElement,
      accentLineTablet: nodeElement.querySelector(
        '.microservices-path-tablet .microservices-line-accent'
      ) as SVGGElement,
      accentLineMobile: nodeElement.querySelector(
        '.microservices-path-mobile .microservices-line-accent'
      ) as SVGGElement,
      dotGlow: nodeElement.querySelector(`.microservices-dot-${nodeId}`) as SVGSVGElement,
    };
  };

  const createAnimation = () => {
    const refs = getAnimationRefs();
    if (!refs || !refs.dotGlow) return;

    const {
      pathDesktop,
      pathTablet,
      pathMobile,
      accentLineDesktop,
      accentLineTablet,
      accentLineMobile,
      dotGlow,
    } = refs;

    timelineRef.current?.revert();

    dotGlow.classList.remove('is-show');

    const animConfig = NODE_ANIMATIONS[nodeId];
    if (!animConfig || animConfig.direction === 'off') return;

    let activePath: SVGPathElement | null = null;
    let activeAccentLine: SVGGElement | null = null;

    if (pathMobile && getComputedStyle(pathMobile.parentElement!).display !== 'none') {
      activePath = pathMobile;
      activeAccentLine = accentLineMobile;
    }

    if (pathTablet && getComputedStyle(pathTablet.parentElement!).display !== 'none') {
      activePath = pathTablet;
      activeAccentLine = accentLineTablet;
    }

    if (pathDesktop && getComputedStyle(pathDesktop.parentElement!).display !== 'none') {
      activePath = pathDesktop;
      activeAccentLine = accentLineDesktop;
    }

    if (!activePath || !activeAccentLine) return;

    const timeline = gsap.timeline({
      repeat: -1,
      ease: 'none',
      paused: false,
      onStart: () => {
        dotGlow.classList.add('is-show');
      },
    });

    timelineRef.current = timeline;

    timeline.fromTo([dotGlow, activeAccentLine], { opacity: 0 }, { opacity: 1, duration: 0.2 }, 0);

    if (animConfig.direction === 'backward') {
      timeline.fromTo(
        [dotGlow, activeAccentLine],
        {
          motionPath: {
            path: activePath,
            align: activePath,
            autoRotate: true,
            alignOrigin: [0.5, 0.5],
            start: 0,
            end: 0,
          },
        },
        {
          force3D: true,
          duration: animConfig.duration,
          transformOrigin: '50% 50%',
          ease: animConfig.ease,
          motionPath: {
            path: activePath,
            align: activePath,
            autoRotate: true,
            alignOrigin: [0.5, 0.5],
            start: 0,
            end: 1,
          },
        },
        0.1
      );
    } else {
      timeline.fromTo(
        [dotGlow, activeAccentLine],
        {
          motionPath: {
            path: activePath,
            align: activePath,
            autoRotate: true,
            alignOrigin: [0.5, 0.5],
            start: 1,
            end: 1,
          },
        },
        {
          force3D: true,
          duration: animConfig.duration,
          transformOrigin: '50% 50%',
          ease: animConfig.ease,
          motionPath: {
            path: activePath,
            align: activePath,
            autoRotate: true,
            alignOrigin: [0.5, 0.5],
            start: 1,
            end: 0,
          },
        },
        0.1
      );
    }

    timeline.to([dotGlow, activeAccentLine], { opacity: 0, duration: 0.2 });
  };

  useGSAP(
    () => {
      const handleResize = () => {
        if (resizeTimeoutRef.current) {
          clearTimeout(resizeTimeoutRef.current);
        }
        resizeTimeoutRef.current = setTimeout(() => {
          createAnimation();
        }, 100);
      };

      const observer = new ResizeObserver(handleResize);
      if (containerRef.current) {
        observer.observe(containerRef.current);
      }

      createAnimation();

      return () => {
        observer.disconnect();
        if (resizeTimeoutRef.current) {
          clearTimeout(resizeTimeoutRef.current);
        }
      };
    },
    { scope: containerRef, dependencies: [nodeId] }
  );

  return null;
};
