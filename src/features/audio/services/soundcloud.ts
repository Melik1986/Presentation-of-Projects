import type {
  SoundCloudMedia,
  SoundCloudResolvedTrack,
  SoundCloudStreamInfo,
  SoundCloudTrack,
  SoundCloudTranscoding,
} from '../model/types';

const CLIENT_ID = process.env.NEXT_PUBLIC_SOUNDCLOUD_CLIENT_ID;
const RESOLVE_ENDPOINT = 'https://api.soundcloud.com/resolve';
const STREAM_PROTOCOL_PRIORITY = ['progressive', 'hls'] as const;
const resolutionCache = new Map<string, SoundCloudResolvedTrack>();

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
    },
  });
  if (!response.ok) {
    throw new Error(`SoundCloud request failed with status ${response.status}`);
  }
  return (await response.json()) as T;
}

function selectTranscoding(media?: SoundCloudMedia | null): SoundCloudTranscoding | null {
  const list = media?.transcodings;
  if (!list?.length) {
    return null;
  }
  for (const protocol of STREAM_PROTOCOL_PRIORITY) {
    const match = list.find((item) => item.format?.protocol === protocol);
    if (match) {
      return match;
    }
  }
  return list[0] ?? null;
}

export async function resolveSoundCloudTrack(trackUrl: string): Promise<SoundCloudResolvedTrack> {
  if (!CLIENT_ID) {
    console.warn('SoundCloud: CLIENT_ID not configured, using fallback URL');
    return {
      streamUrl: trackUrl,
      artworkUrl: null,
      title: trackUrl,
      permalinkUrl: trackUrl,
    };
  }

  const cached = resolutionCache.get(trackUrl);
  if (cached) {
    return cached;
  }

  try {
    const resolveUrl = `${RESOLVE_ENDPOINT}?url=${encodeURIComponent(trackUrl)}&client_id=${CLIENT_ID}`;
    const trackData = await fetchJson<SoundCloudTrack>(resolveUrl);
    const transcoding = selectTranscoding(trackData.media);

    if (!transcoding) {
      throw new Error('SoundCloud track has no available stream transcodings');
    }

    const streamInfoUrl = `${transcoding.url}?client_id=${CLIENT_ID}`;
    const streamInfo = await fetchJson<SoundCloudStreamInfo>(streamInfoUrl);

    const result: SoundCloudResolvedTrack = {
      streamUrl: streamInfo.url,
      artworkUrl: trackData.artwork_url ?? trackData.user?.avatar_url ?? null,
      title: trackData.title ?? trackUrl,
      permalinkUrl: trackData.permalink_url ?? trackUrl,
    };

    resolutionCache.set(trackUrl, result);
    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    if (errorMessage.includes('CORS') || errorMessage.includes('Failed to fetch')) {
      console.warn(`SoundCloud: CORS error for ${trackUrl}, using fallback`);
      return {
        streamUrl: trackUrl,
        artworkUrl: null,
        title: trackUrl,
        permalinkUrl: trackUrl,
      };
    }

    throw error;
  }
}

export function clearSoundCloudCache(): void {
  resolutionCache.clear();
}
