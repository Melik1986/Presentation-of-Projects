/**
 * Platform detection and URL parsing utilities
 */

export type Platform = 'youtube' | 'soundcloud' | 'unknown';

/**
 * Detects the platform from a given URL
 * @param url - Track URL to detect
 * @returns Platform type
 */
export function detectPlatform(url: string): Platform {
  if (!url || typeof url !== 'string') {
    return 'unknown';
  }

  const normalized = url.toLowerCase().trim();

  // YouTube patterns
  if (
    normalized.includes('youtube.com') ||
    normalized.includes('youtu.be') ||
    normalized.includes('youtube-nocookie.com')
  ) {
    return 'youtube';
  }

  // SoundCloud patterns
  if (normalized.includes('soundcloud.com')) {
    return 'soundcloud';
  }

  return 'unknown';
}

/**
 * Extracts YouTube video ID from various URL formats
 * Supports:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * - https://www.youtube-nocookie.com/embed/VIDEO_ID
 *
 * @param url - YouTube URL
 * @returns Video ID or null if not found
 */
export function extractYouTubeVideoId(url: string): string | null {
  if (!url || typeof url !== 'string') {
    return null;
  }

  try {
    const urlObj = new URL(url);

    // Pattern 1: youtube.com/watch?v=VIDEO_ID
    if (urlObj.hostname.includes('youtube.com') && urlObj.searchParams.has('v')) {
      return urlObj.searchParams.get('v');
    }

    // Pattern 2: youtu.be/VIDEO_ID
    if (urlObj.hostname === 'youtu.be') {
      const videoId = urlObj.pathname.slice(1).split('/')[0];
      return videoId || null;
    }

    // Pattern 3: youtube.com/embed/VIDEO_ID
    if (urlObj.hostname.includes('youtube.com') && urlObj.pathname.includes('/embed/')) {
      const videoId = urlObj.pathname.split('/embed/')[1]?.split('/')[0];
      return videoId || null;
    }

    // Pattern 4: youtube-nocookie.com/embed/VIDEO_ID
    if (urlObj.hostname.includes('youtube-nocookie.com') && urlObj.pathname.includes('/embed/')) {
      const videoId = urlObj.pathname.split('/embed/')[1]?.split('/')[0];
      return videoId || null;
    }

    return null;
  } catch {
    // Invalid URL, try regex fallback
    const regexPatterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    ];

    for (const pattern of regexPatterns) {
      const match = url.match(pattern);
      if (match?.[1]) {
        return match[1];
      }
    }

    return null;
  }
}

/**
 * Validates and returns SoundCloud track URL
 * Expected format: https://soundcloud.com/artist/track-name
 *
 * @param url - SoundCloud URL
 * @returns Validated URL or null if invalid
 */
export function extractSoundCloudTrackUrl(url: string): string | null {
  if (!url || typeof url !== 'string') {
    return null;
  }

  try {
    const urlObj = new URL(url);

    if (!urlObj.hostname.includes('soundcloud.com')) {
      return null;
    }

    // Must have at least /artist/track format
    const pathParts = urlObj.pathname.split('/').filter(Boolean);
    if (pathParts.length < 2) {
      return null;
    }

    // Return full URL for SoundCloud Widget API
    return url;
  } catch {
    return null;
  }
}

/**
 * Validates URL for a given platform
 * @param url - URL to validate
 * @param platform - Expected platform
 * @returns true if valid for platform
 */
export function validatePlatformUrl(url: string, platform: Platform): boolean {
  switch (platform) {
    case 'youtube':
      return extractYouTubeVideoId(url) !== null;
    case 'soundcloud':
      return extractSoundCloudTrackUrl(url) !== null;
    default:
      return false;
  }
}
