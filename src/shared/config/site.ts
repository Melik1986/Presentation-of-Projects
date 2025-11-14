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
  social: {
    gumroad:
      'https://melikmusinian.gumroad.com/?_gl=1*1g9q4j7*_ga*NTUwNTc3Mzg0LjE3NjI3ODE1NjE.*_ga_6LJN6D94N6*czE3NjMxNDQ4OTkkbzE0JGcwJHQxNzYzMTQ0ODk5JGo2MCRsMCRoMA..',
    behance: 'https://www.behance.net/melikmusiniandev',
    linkedin: 'https://www.linkedin.com/in/melik-musinian/',
    codepen: 'https://codepen.io/Melik-Musinian',
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
  preloader: true,
  effects: true,
  stickyCards: true,
} as const;
