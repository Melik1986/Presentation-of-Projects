import { describe, expect, it } from 'bun:test';

import {
  isMobileDescriptionExpanded,
  toggleMobileDescription,
} from '../src/features/sticky-cards/model/mobileGalleryDescription.ts';

describe('Mobile project gallery description state', () => {
  it('starts collapsed and expands the selected slide', () => {
    expect(isMobileDescriptionExpanded(null, 0)).toBe(false);
    expect(toggleMobileDescription(null, 0)).toBe(0);
  });

  it('collapses the selected slide when toggled again', () => {
    expect(toggleMobileDescription(0, 0)).toBe(null);
  });

  it('moves expansion to a different slide', () => {
    expect(toggleMobileDescription(0, 1)).toBe(1);
    expect(isMobileDescriptionExpanded(1, 0)).toBe(false);
    expect(isMobileDescriptionExpanded(1, 1)).toBe(true);
  });
});
