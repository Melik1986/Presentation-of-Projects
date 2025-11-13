'use client';

import React from 'react';

import { FILTER_IDS } from './microservices.config';

/**
 * SVG Filters Component
 * Provides glow effects for dots and lines
 */
export function SvgFilters() {
  return (
    <svg className="microservices-svg-filters microservices-filters-hidden">
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

/**
 * Animated SVG Path for connection lines
 */
export function AnimatedPath({ nodeId, pathData, lineColor }: PathSvgProps) {
  return (
    <>
      {/* Desktop Path */}
      <svg
        className="microservices-path-desktop"
        width="536"
        height="280"
        viewBox="0 0 536 280"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d={pathData.desktop} stroke="#E8E8E8" strokeWidth="1.4" fill="none" />
        <mask id={`${nodeId}-path-mask-desktop`}>
          <path d={pathData.desktop} stroke={lineColor} strokeWidth="1.4" fill="none" />
        </mask>
        <g mask={`url(#${nodeId}-path-mask-desktop)`}>
          <g className="microservices-line-accent">
            <mask
              id={`${nodeId}-glow-mask-desktop`}
              className="microservices-mask-alpha"
              maskUnits="userSpaceOnUse"
              x="0"
              y="0"
              width="120"
              height="240"
            >
              <path
                d="M120 0L120 240C53.7258 240 2.89694e-06 186.274 0 120C-2.89694e-06 53.7258 53.7258 2.89694e-06 120 0Z"
                fill="white"
              />
            </mask>
            <g mask={`url(#${nodeId}-glow-mask-desktop)`}>
              <g filter={`url(#${FILTER_IDS.BLUR_GLOW})`}>
                <path
                  d="M120 75C144.853 75 165 95.1472 165 120C165 144.853 144.853 165 120 165C95.1472 165 75 144.853 75 120C75 95.1472 95.1472 75 120 75Z"
                  fill={lineColor}
                />
              </g>
            </g>
          </g>
        </g>
      </svg>

      {/* Tablet Path */}
      <svg
        className="microservices-path-tablet"
        width="512"
        height="260"
        viewBox="0 0 512 260"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d={pathData.tablet} stroke="#E8E8E8" fill="none" />
        <mask id={`${nodeId}-path-mask-tablet`}>
          <path d={pathData.tablet} stroke={lineColor} fill="none" />
        </mask>
        <g mask={`url(#${nodeId}-path-mask-tablet)`}>
          <g className="microservices-line-accent">
            <mask
              id={`${nodeId}-glow-mask-tablet`}
              className="microservices-mask-alpha"
              maskUnits="userSpaceOnUse"
              x="0"
              y="0"
              width="120"
              height="240"
            >
              <path
                d="M120 0L120 240C53.7258 240 2.89694e-06 186.274 0 120C-2.89694e-06 53.7258 53.7258 2.89694e-06 120 0Z"
                fill="white"
              />
            </mask>
            <g mask={`url(#${nodeId}-glow-mask-tablet)`}>
              <g filter={`url(#${FILTER_IDS.BLUR_GLOW})`}>
                <path
                  d="M120 75C144.853 75 165 95.1472 165 120C165 144.853 144.853 165 120 165C95.1472 165 75 144.853 75 120C75 95.1472 95.1472 75 120 75Z"
                  fill={lineColor}
                />
              </g>
            </g>
          </g>
        </g>
      </svg>

      {/* Mobile Path */}
      <svg
        className="microservices-path-mobile"
        width="320"
        height="240"
        viewBox="0 0 320 240"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d={pathData.mobile} stroke="#E8E8E8" fill="none" />
        <mask id={`${nodeId}-path-mask-mobile`}>
          <path d={pathData.mobile} stroke={lineColor} fill="none" />
        </mask>
        <g mask={`url(#${nodeId}-path-mask-mobile)`}>
          <g className="microservices-line-accent">
            <mask
              id={`${nodeId}-glow-mask-mobile`}
              className="microservices-mask-alpha"
              maskUnits="userSpaceOnUse"
              x="0"
              y="0"
              width="120"
              height="240"
            >
              <path
                d="M120 0L120 240C53.7258 240 2.89694e-06 186.274 0 120C-2.89694e-06 53.7258 53.7258 2.89694e-06 120 0Z"
                fill="white"
              />
            </mask>
            <g mask={`url(#${nodeId}-glow-mask-mobile)`}>
              <g filter={`url(#${FILTER_IDS.BLUR_GLOW})`}>
                <path
                  d="M120 75C144.853 75 165 95.1472 165 120C165 144.853 144.853 165 120 165C95.1472 165 75 144.853 75 120C75 95.1472 95.1472 75 120 75Z"
                  fill={lineColor}
                />
              </g>
            </g>
          </g>
        </g>
      </svg>

      {/* Animated Dot with Glow */}
      <svg
        className={`microservices-dot-glow microservices-dot-${nodeId}`}
        width="5"
        height="5"
        viewBox="0 0 5 5"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="2.5" cy="2.5" r="2.5" fill={lineColor} />
        <g filter={`url(#${FILTER_IDS.DOT_GLOW})`}>
          <circle cx="2.5" cy="2.5" r="2.5" fill={lineColor} />
        </g>
        <g filter={`url(#${FILTER_IDS.LINE_GLOW})`}>
          <rect x="-40" width="40" height="4" rx="2" fill={`url(#gradient-${nodeId})`} />
        </g>
        <linearGradient
          id={`gradient-${nodeId}`}
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
