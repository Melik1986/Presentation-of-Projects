export function isMobileDescriptionExpanded(
  expandedSlideIndex: number | null,
  slideIndex: number
): boolean {
  return expandedSlideIndex === slideIndex;
}

export function toggleMobileDescription(
  expandedSlideIndex: number | null,
  slideIndex: number
): number | null {
  return isMobileDescriptionExpanded(expandedSlideIndex, slideIndex) ? null : slideIndex;
}
