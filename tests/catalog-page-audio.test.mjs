import { describe, expect, it } from 'bun:test';

import { shouldEnterCatalog } from '../src/app/sticky/[catalogId]/CatalogPageClient.tsx';

describe('catalog page audio initialization', () => {
  it('waits for the audio provider before entering a catalog', () => {
    expect(shouldEnterCatalog(false, 'web-apps')).toBe(false);
    expect(shouldEnterCatalog(true, 'web-apps')).toBe(true);
  });
});
