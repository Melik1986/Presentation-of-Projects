'use client';

import { FILTER_IDS } from './microservices.config';

const GLOW_MASK_PATH =
  'M120 0L120 240C53.7258 240 2.89694e-06 186.274 0 120C-2.89694e-06 53.7258 53.7258 2.89694e-06 120 0Z';
const GLOW_BLOB_PATH =
  'M120 75C144.853 75 165 95.1472 165 120C165 144.853 144.853 165 120 165C95.1472 165 75 144.853 75 120C75 95.1472 95.1472 75 120 75Z';

type PathBreakpoint = 'desktop' | 'tablet' | 'mobile';

/**
 * SVG Filters Component
 * Provides glow effects for dots and lines
 */
export function SvgFilters() {
  return (
    <svg
      className="microservices-svg-filters microservices-filters-hidden"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <filter
          id={FILTER_IDS.DOT_GLOW}
          x="-16"
          y="-16"
          width="36"
          height="36"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feGaussianBlur stdDeviation="7" result="effect1_foregroundBlur" />
        </filter>
        <filter
          id={FILTER_IDS.LINE_GLOW}
          x="-58"
          y="-18"
          width="76"
          height="40"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feGaussianBlur stdDeviation="8" result="effect1_foregroundBlur" />
        </filter>
        <filter
          id={FILTER_IDS.BLUR_GLOW}
          x="43"
          y="43"
          width="154"
          height="154"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feGaussianBlur stdDeviation="16" result="effect1_foregroundBlur" />
        </filter>
      </defs>
    </svg>
  );
}

interface PathSvgProps {
  nodeId: string;
  pathData: {
    desktop: string;
    tablet: string;
    mobile: string;
  };
  lineColor: string;
}

interface ConnectionPathSvgProps {
  nodeId: string;
  breakpoint: PathBreakpoint;
  className: string;
  width: number;
  height: number;
  viewBox: string;
  pathD: string;
  lineColor: string;
  strokeWidth?: number;
}

/**
 * Traveling glow accent clipped to a connection path.
 */
function PathGlowAccent({
  nodeId,
  breakpoint,
  lineColor,
}: Readonly<{
  nodeId: string;
  breakpoint: PathBreakpoint;
  lineColor: string;
}>) {
  const glowMaskId = `${nodeId}-glow-mask-${breakpoint}`;

  return (
    <g className="microservices-line-accent">
      <mask
        id={glowMaskId}
        className="microservices-mask-alpha"
        maskUnits="userSpaceOnUse"
        x="0"
        y="0"
        width="120"
        height="240"
      >
        <path d={GLOW_MASK_PATH} fill="white" />
      </mask>
      <g mask={`url(#${glowMaskId})`}>
        <g filter={`url(#${FILTER_IDS.BLUR_GLOW})`}>
          <path d={GLOW_BLOB_PATH} fill={lineColor} />
        </g>
      </g>
    </g>
  );
}

/**
 * Responsive connection path SVG for one breakpoint.
 */
function ConnectionPathSvg({
  nodeId,
  breakpoint,
  className,
  width,
  height,
  viewBox,
  pathD,
  lineColor,
  strokeWidth,
}: Readonly<ConnectionPathSvgProps>) {
  const pathMaskId = `${nodeId}-path-mask-${breakpoint}`;

  return (
    <svg
      className={className}
      width={width}
      height={height}
      viewBox={viewBox}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
    >
      <path d={pathD} stroke="#E8E8E8" strokeWidth={strokeWidth} fill="none" />
      <mask id={pathMaskId}>
        <path d={pathD} stroke={lineColor} strokeWidth={strokeWidth} fill="none" />
      </mask>
      <g mask={`url(#${pathMaskId})`}>
        <PathGlowAccent nodeId={nodeId} breakpoint={breakpoint} lineColor={lineColor} />
      </g>
    </svg>
  );
}

/**
 * Animated dot with glow trail along a connection.
 */
function AnimatedDot({
  nodeId,
  lineColor,
}: Readonly<{ nodeId: string; lineColor: string }>) {
  const gradientId = `gradient-${nodeId}`;

  return (
    <svg
      className={`microservices-dot-glow microservices-dot-${nodeId}`}
      width="5"
      height="5"
      viewBox="0 0 5 5"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="2.5" cy="2.5" r="2.5" fill={lineColor} />
      <g filter={`url(#${FILTER_IDS.DOT_GLOW})`}>
        <circle cx="2.5" cy="2.5" r="2.5" fill={lineColor} />
      </g>
      <g filter={`url(#${FILTER_IDS.LINE_GLOW})`}>
        <rect x="-40" width="40" height="4" rx="2" fill={`url(#${gradientId})`} />
      </g>
      <linearGradient
        id={gradientId}
        x1="-40"
        y1="2.5"
        x2="0"
        y2="2.5"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor={lineColor} stopOpacity="0" />
        <stop offset="1" stopColor={lineColor} stopOpacity="0.8" />
      </linearGradient>
    </svg>
  );
}

/**
 * Animated SVG Path for connection lines
 */
export function AnimatedPath({ nodeId, pathData, lineColor }: Readonly<PathSvgProps>) {
  return (
    <>
      <ConnectionPathSvg
        nodeId={nodeId}
        breakpoint="desktop"
        className="microservices-path-desktop"
        width={536}
        height={280}
        viewBox="0 0 536 280"
        pathD={pathData.desktop}
        lineColor={lineColor}
        strokeWidth={1.4}
      />
      <ConnectionPathSvg
        nodeId={nodeId}
        breakpoint="tablet"
        className="microservices-path-tablet"
        width={512}
        height={260}
        viewBox="0 0 512 260"
        pathD={pathData.tablet}
        lineColor={lineColor}
      />
      <ConnectionPathSvg
        nodeId={nodeId}
        breakpoint="mobile"
        className="microservices-path-mobile"
        width={320}
        height={240}
        viewBox="0 0 320 240"
        pathD={pathData.mobile}
        lineColor={lineColor}
      />
      <AnimatedDot nodeId={nodeId} lineColor={lineColor} />
    </>
  );
}

/**
 * SVG Paths Data - curved connections from center to corners
 */
export const PATH_DATA = {
  'auth-service': {
    desktop:
      'M268 140H153.773C147.145 140 141.773 134.627 141.773 128V77C141.773 70.373 136.4 65 129.773 65H3',
    tablet:
      'M256 130H153.773C147.145 130 141.773 124.627 141.773 118V72C141.773 65.373 136.4 60 129.773 60H62',
    mobile: 'M160 120H142C135.373 120 130 114.627 130 108V68C130 61.373 124.627 56 118 56H62',
  },
  'users-service': {
    desktop:
      'M268 140H382.227C388.855 140 394.227 134.627 394.227 128V77C394.227 70.373 399.6 65 406.227 65H533',
    tablet:
      'M256 130H360.47C367.097 130 372.47 124.627 372.47 118V72C372.47 65.373 377.842 60 384.47 60H452',
    mobile: 'M160 120H178C184.627 120 190 114.627 190 108V68C190 61.373 195.373 56 202 56H258',
  },
  'orders-service': {
    desktop:
      'M268 140H153.773C147.145 140 141.773 145.373 141.773 152V203C141.773 209.627 136.4 215 129.773 215H3',
    tablet:
      'M256 130H153.773C147.145 130 141.773 135.373 141.773 142V188C141.773 194.627 136.4 200 129.773 200H62',
    mobile: 'M160 120H142C135.373 120 130 125.373 130 132V172C130 178.627 124.627 184 118 184H62',
  },
  'payments-service': {
    desktop:
      'M268 140H382.227C388.855 140 394.227 145.373 394.227 152V203C394.227 209.627 399.6 215 406.227 215H533',
    tablet:
      'M256 130H360.47C367.097 130 372.47 135.373 372.47 142V188C372.47 194.627 377.842 200 384.47 200H452',
    mobile: 'M160 120H178C184.627 120 190 125.373 190 132V172C190 178.627 195.373 184 202 184H258',
  },
};
