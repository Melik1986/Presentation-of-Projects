/**
 * Security utilities for input validation and sanitization
 */

/**
 * Sanitizes string to prevent XSS attacks
 * Removes potentially dangerous characters and patterns
 * @param input - String to sanitize
 * @param maxLength - Maximum allowed length
 * @returns Sanitized string
 */
export function sanitizeString(input: string, maxLength: number = 500): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  return input
    .trim()
    .slice(0, maxLength)
    .replace(/[<>"']/g, '') // Remove dangerous HTML characters
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, ''); // Remove event handlers
}

/**
 * Validates and sanitizes URL
 * Only allows http/https protocols
 * @param url - URL to sanitize
 * @returns Sanitized URL or null if invalid
 */
export function sanitizeUrl(url: string): string | null {
  if (!url || typeof url !== 'string') {
    return null;
  }

  try {
    const urlObj = new URL(url);

    // Only allow http and https
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return null;
    }

    return urlObj.toString();
  } catch {
    return null;
  }
}

/**
 * Validates alphanumeric ID (for catalog IDs, etc.)
 * @param id - ID to validate
 * @param maxLength - Maximum allowed length
 * @returns true if valid
 */
export function validateAlphanumericId(id: string, maxLength: number = 50): boolean {
  if (!id || typeof id !== 'string') {
    return false;
  }

  const pattern = new RegExp(`^[a-zA-Z0-9-_]{1,${maxLength}}$`);
  return pattern.test(id);
}
