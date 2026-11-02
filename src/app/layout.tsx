import { SpeedInsights } from '@vercel/speed-insights/next';

import { GlobalPreloader } from '@/features/preloader';

import { Providers } from './providers';

import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import './globals.css';

export const metadata: Metadata = {
  title: {
    template: '%s | Starlight',
    default: 'Starlight - Portfolio',
  },
  description: 'Modern portfolio website with stunning animations and interactions',
  keywords: ['portfolio', 'web design', 'animations', 'Next.js', 'React'],
  authors: [{ name: 'Starlight' }],
  creator: 'Starlight',
  metadataBase: new URL('https://starlight.dev'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://starlight.dev',
    title: 'Starlight - Portfolio',
    description: 'Modern portfolio website with stunning animations and interactions',
    siteName: 'Starlight',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Starlight - Portfolio',
    description: 'Modern portfolio website with stunning animations and interactions',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Placeholder для верификации (заполнить при необходимости)
  },
  other: {
    'X-UA-Compatible': 'IE=edge',
  },
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <noscript>
          <div className="noscript-message">
            <div className="noscript-content">
              <h1>JavaScript is required</h1>
              <p>Please enable JavaScript in your browser to view this website.</p>
            </div>
          </div>
        </noscript>
        <Providers>
          <GlobalPreloader />
          {children}
        </Providers>
        <SpeedInsights />
      </body>
    </html>
  );
}
