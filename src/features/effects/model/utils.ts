/**
 * Effects utilities
 */

/**
 * Detects if device supports hover (desktop)
 * Uses matchMedia for reliable detection
 * @returns True if device supports hover interactions
 */
export function supportsHover(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(hover: hover)').matches;
}

/**
 * Detects if device is touch-based (mobile/tablet)
 * @returns True if device is touch-based
 */
export function isTouchDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return !supportsHover();
}

/**
 * Calculates random rotation angle for preview image based on index
 * @param index - Image index (0-based)
 * @returns Random rotation in degrees
 */
export function getPreviewRotation(index: number): number {
  const random = (min: number, max: number) => Math.random() * (max - min) + min;

  if (index === 0) return random(-20, -10);
  if (index === 1) return random(-10, 10);
  return random(10, 20);
}
