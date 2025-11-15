'use client';

import { Component, lazy, Suspense, useRef, useEffect, type ReactNode } from 'react';

import { createLogger } from '@/shared/lib';

import styles from './SplineModel.module.css';

import type { Application } from '@splinetool/runtime';

const logger = createLogger().child({ module: 'SplineModel' });

// Lazy loading as per Spline documentation: https://github.com/splinetool/react-spline#lazy-loading
const Spline = lazy(() => import('@splinetool/react-spline'));

interface ErrorBoundaryState {
  hasError: boolean;
}

class SplineErrorBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: ReactNode; fallback: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    logger.error(error, 'Spline model loading failed', { errorInfo });
  }

  override render(): ReactNode {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

export interface SplineModelProps {
  scene: string;
  className?: string;
  zoom?: number;
}

export function SplineModel({ scene, className = '', zoom = 0.8 }: SplineModelProps) {
  const appRef = useRef<Application | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  const handleLoad = (application: Application): void => {
    appRef.current = application;
    application.setZoom(zoom);

    if (!containerRef.current) return;

    const container = containerRef.current;
    const { width, height } = container.getBoundingClientRect();
    application.setSize(width, height);

    if (resizeObserverRef.current) {
      resizeObserverRef.current.disconnect();
    }

    const resizeObserver = new ResizeObserver(() => {
      if (container && appRef.current) {
        const { width: newWidth, height: newHeight } = container.getBoundingClientRect();
        appRef.current.setSize(newWidth, newHeight);
      }
    });

    resizeObserver.observe(container);
    resizeObserverRef.current = resizeObserver;
  };

  useEffect(() => {
    return () => {
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
    };
  }, []);

  return (
    <div ref={containerRef} className={`${styles.splineContainer} ${className}`}>
      <SplineErrorBoundary fallback={<div className={styles.loadingPlaceholder}>Failed to load 3D model</div>}>
        <Suspense fallback={<div className={styles.loadingPlaceholder}>Loading 3D model...</div>}>
          <Spline scene={scene} className={styles.splineCanvas} onLoad={handleLoad} />
        </Suspense>
      </SplineErrorBoundary>
    </div>
  );
}

