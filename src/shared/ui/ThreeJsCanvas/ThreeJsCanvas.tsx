'use client';

import { useEffect, useRef } from 'react';

import { ParticleWaveController } from './core/ParticleWaveController';
import styles from './ThreeJsCanvas.module.css';

import type { AuroraConfig } from './types';

interface ThreeJsCanvasProps {
  className?: string;
}

/**
 * Three.js canvas component for particle wave animation
 * Used in Advanced Web Technologies catalog card 01
 */
export function ThreeJsCanvas({ className = '' }: ThreeJsCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<ParticleWaveController | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Configuration based on DEFAULT_AURORA_CONFIG from docs/core
    const config: AuroraConfig = {
      separation: 100,
      amountX: 100,
      amountY: 70,
      cameraFov: 75,
      cameraNear: 0.1,
      cameraFar: 1000,
      cameraZ: 1000,
      cameraEase: 0.08,
      cameraMaxOffset: 200,
      particles: {
        color: '#10b981', // Green for advanced-tech theme
        size: 2.5,
      },
      wave: {
        speed: 2.0,
        amplitude: 80,
        frequency: 0.005,
      },
    };

    const container = containerRef.current;
    const controller = new ParticleWaveController(container, config);

    // Initialize and start animation (async in original)
    controller.initialize().then(() => {
      controller.startAnimation();
      controller.enableMouseTracking();

      // Setup mouse tracking
      const handleMouseMove = (event: MouseEvent) => {
        const rect = container.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        controller.updateMousePosition(x, y);
      };

      container.addEventListener('mousemove', handleMouseMove);
      controllerRef.current = controller;

      // Setup resize observer
      if (typeof ResizeObserver !== 'undefined') {
        const resizeObserver = new ResizeObserver(() => {
          controller.handleResize();
        });
        resizeObserver.observe(container);

        // Store for cleanup
        (
          controller as unknown as {
            _resizeObserver: ResizeObserver;
            _mouseHandler: (e: MouseEvent) => void;
          }
        )._resizeObserver = resizeObserver;
        (
          controller as unknown as {
            _resizeObserver: ResizeObserver;
            _mouseHandler: (e: MouseEvent) => void;
          }
        )._mouseHandler = handleMouseMove;
      }
    });

    return () => {
      if (controllerRef.current) {
        const ctrl = controllerRef.current as unknown as {
          _mouseHandler?: (event: MouseEvent) => void;
          _resizeObserver?: ResizeObserver;
          dispose: () => void;
        };

        // Remove event listeners
        if (ctrl._mouseHandler) {
          container.removeEventListener('mousemove', ctrl._mouseHandler);
        }

        // Disconnect observer
        if (ctrl._resizeObserver) {
          ctrl._resizeObserver.disconnect();
        }

        // Dispose controller
        controllerRef.current.dispose();
        controllerRef.current = null;
      }
    };
  }, []);

  return <div ref={containerRef} className={`${styles.canvasContainer} ${className}`} />;
}
