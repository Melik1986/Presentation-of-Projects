'use client';

import React, { useRef } from 'react';

import { useMicroservicesAnimation } from './hooks/useMicroservicesAnimation';
import { MICROSERVICES } from './microservices.config';
import styles from './MicroservicesChart.module.css';
import { AnimatedPath, PATH_DATA, SvgFilters } from './MicroservicesSvg';

/**
 * Microservice Node Component
 */
interface NodeProps {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  status: 'healthy' | 'error' | 'warning';
  requests: number;
  position: string;
  isCenter?: boolean;
}

function MicroserviceNode({
  name,
  icon: IconComponent,
  status,
  requests,
  position,
  isCenter,
}: NodeProps) {
  return (
    <div className={styles.node} data-position={position}>
      <div className={styles.nodeContent}>
        <figure className={styles.nodeIcon}>
          <IconComponent className={styles.iconSvg} />
          {isCenter && (
            <>
              <span className={styles.pulseRing} />
              <span className={styles.pulseRing} />
              <span className={styles.pulseRing} />
            </>
          )}
        </figure>
        <div className={styles.nodeText}>
          <div className={styles.nodeLabel}>{name}</div>
        </div>
      </div>
      <div className={styles.nodeMetrics}>
        <span className={`${styles.statusDot} ${styles[`status-${status}`]}`} />
        <span className={styles.requestCount}>{requests}/s</span>
      </div>
    </div>
  );
}

/**
 * MicroservicesChart Component
 * Displays animated architecture diagram with API Gateway and 4 microservices
 */
export function MicroservicesChart() {
  const containerRef = useRef<HTMLDivElement>(null);

  const centerNode = MICROSERVICES.find((node) => node.position === 'center');
  const cornerNodes = MICROSERVICES.filter((node) => node.position !== 'center');

  const authNode = cornerNodes.find((n) => n.id === 'auth-service');
  const usersNode = cornerNodes.find((n) => n.id === 'users-service');
  const ordersNode = cornerNodes.find((n) => n.id === 'orders-service');
  const paymentsNode = cornerNodes.find((n) => n.id === 'payments-service');

  useMicroservicesAnimation(containerRef, authNode?.id || '');
  useMicroservicesAnimation(containerRef, usersNode?.id || '');
  useMicroservicesAnimation(containerRef, ordersNode?.id || '');
  useMicroservicesAnimation(containerRef, paymentsNode?.id || '');

  return (
    <div ref={containerRef} className={styles.microservicesChart}>
      <SvgFilters />

      <div className={styles.wrapper}>
        {/* SVG Background Paths */}
        <svg
          className={styles.svgPathsMobile}
          width="320"
          height="240"
          viewBox="0 0 320 240"
          xmlns="http://www.w3.org/2000/svg"
        />
        <svg
          className={styles.svgPathsTablet}
          width="512"
          height="260"
          viewBox="0 0 512 260"
          xmlns="http://www.w3.org/2000/svg"
        />
        <svg
          className={styles.svgPathsDesktop}
          width="536"
          height="280"
          viewBox="0 0 536 280"
          xmlns="http://www.w3.org/2000/svg"
        />

        {/* Corner Nodes with Animated Paths */}
        {cornerNodes.map((node) => (
          <div key={node.id} className={styles.nodeItem} data-node-id={node.id} data-status={node.status}>
            <MicroserviceNode
              name={node.name}
              icon={node.icon}
              status={node.status}
              requests={node.requests}
              position={node.position}
            />
            <AnimatedPath
              nodeId={node.id}
              pathData={PATH_DATA[node.id as keyof typeof PATH_DATA]}
              lineColor={node.lineColor}
            />
          </div>
        ))}

        {/* Center Node - API Gateway */}
        {centerNode && (
          <div className={styles.nodeItem} data-node-id={centerNode.id} data-status={centerNode.status}>
            <MicroserviceNode
              name={centerNode.name}
              icon={centerNode.icon}
              status={centerNode.status}
              requests={centerNode.requests}
              position={centerNode.position}
              isCenter
            />
          </div>
        )}
      </div>
    </div>
  );
}
