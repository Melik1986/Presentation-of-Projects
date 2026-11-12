import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'bun:test';

const styles = readFileSync(
  new URL('../src/features/sticky-cards/ui/ProjectGallery/ProjectGallery.module.css', import.meta.url),
  'utf8'
);

describe('Project gallery mobile sizing', () => {
  it('gives the mobile image height rule precedence over the size-full utility', () => {
    expect(styles).toContain('.mobileSlide > .mobileImage {');
  });

  it('keeps a viewport-height fallback when svh is unavailable', () => {
    expect(styles).toContain('height: min(calc(70vw + 22vh), max(6rem, calc(100vh - 360px)));');
    expect(styles).toContain('@supports (height: 100svh)');
    expect(styles).toContain('height: min(calc(70vw + 22svh), max(6rem, calc(100svh - 360px)));');
  });
});
