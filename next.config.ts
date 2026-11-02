import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // React strict mode for better error detection
  reactStrictMode: true,

  // Security
  poweredByHeader: false,

  // Performance
  compress: true,

  // Compiler options
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error', 'warn'] } : false,
  },

  // Experimental features (Next.js 15)
  experimental: {
    optimizePackageImports: ['gsap', '@gsap/react', 'lenis'],
  },

  // Turbopack configuration
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },

  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Optimize preloading
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },

  // TypeScript
  typescript: {
    ignoreBuildErrors: false,
  },

  // Webpack configuration
  webpack: (config) => {
    // Resolve Three.js to single instance to avoid duplicate imports
    config.resolve.alias = {
      ...config.resolve.alias,
      three: require.resolve('three'),
    };

    return config;
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.youtube.com https://w.soundcloud.com https://prod.spline.design https://vercel.live",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https: blob:",
              "font-src 'self' data:",
              "connect-src 'self' https://www.youtube.com https://api.soundcloud.com https://w.soundcloud.com https://my.spline.design https://spline.design https://prod.spline.design https://unpkg.com https://www.gstatic.com https://vercel.live wss://ws-us3.pusher.com",
              "frame-src 'self' https://www.youtube.com https://w.soundcloud.com https://my.spline.design https://prod.spline.design https://vercel.live",
              "worker-src 'self' blob: https://prod.spline.design",
              "media-src 'self' https: blob:",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'self'",
              'upgrade-insecure-requests',
            ].join('; '),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
