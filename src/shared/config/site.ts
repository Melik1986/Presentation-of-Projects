/**
 * Site configuration
 */

export const siteConfig = {
  name: 'Starlight',
  description: 'Modern portfolio website with stunning animations and interactions',
  url: 'https://starlight.dev',
  ogImage: 'https://starlight.dev/og.jpg',
  links: {
    github: 'https://github.com',
    twitter: 'https://twitter.com',
  },
} as const;

/**
 * Navigation configuration
 */
export const navConfig = {
  mainNav: [
    {
      title: 'Home',
      href: '/',
    },
    {
      title: 'Sticky Cards',
      href: '/sticky',
    },
  ],
} as const;

/**
 * Feature flags
 */
export const features = {
  audio: true,
  effects: true,
  stickyCards: true,
} as const;
