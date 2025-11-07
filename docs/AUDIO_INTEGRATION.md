# Audio Integration Guide

## Overview

Starlight uses **YouTube IFrame API** and **SoundCloud Widget API** for legal, background audio playback. This document explains the architecture and how to use it.

## Architecture

### Platform Adapter Pattern

The audio system uses the Adapter pattern to support multiple platforms:

```
AudioDirector (Orchestrator)
    ↓
Platform Detector (Identify platform from URL)
    ↓
Platform Adapters (YouTube / SoundCloud)
    ↓
Hidden IFrame Players (Audio only, 0x0, opacity:0)
    ↓
Web Audio API (AnalyserNode for visualization, GainNode for crossfade)
```

### Key Components

1. **`AudioDirector`** (`src/features/audio/model/AudioDirector.ts`)
   - Central orchestrator for all audio operations
   - Manages track lifecycle, crossfading, volume, mute
   - Integrates with Web Audio API for visualization

2. **Platform Detector** (`src/features/audio/services/platform-detector.ts`)
   - Detects platform from URL (YouTube, SoundCloud, unknown)
   - Extracts video ID / track path
   - Validates URLs

3. **Platform Adapters**
   - `YouTubeAdapter` (`src/features/audio/services/youtube-adapter.ts`)
   - `SoundCloudAdapter` (`src/features/audio/services/soundcloud-widget-adapter.ts`)
   - Implements `PlatformAdapter` interface
   - Manages platform-specific player lifecycle

4. **Types** (`src/features/audio/model/types.ts`)
   - `Platform`: 'youtube' | 'soundcloud' | 'unknown'
   - `PlatformAdapter`: Interface for all adapters
   - `TrackBundle`: Track data structure

## Usage

### Adding Tracks

Edit `content/catalogs.json`:

```json
{
  "homeTrack": "https://www.youtube.com/watch?v=VIDEO_ID",
  "catalogs": [
    {
      "id": "nextjs",
      "name": "Next.js Projects",
      "track": "https://soundcloud.com/artist/track-name"
    },
    {
      "id": "threejs",
      "name": "Three.js",
      "track": "https://youtu.be/VIDEO_ID"
    }
  ]
}
```

### Supported URL Formats

**YouTube:**

- `https://www.youtube.com/watch?v=VIDEO_ID`
- `https://youtu.be/VIDEO_ID`
- `https://www.youtube.com/embed/VIDEO_ID`

**SoundCloud:**

- `https://soundcloud.com/artist/track-name`

### Using AudioDirector Hook

```typescript
import { useAudioDirector } from '@/features/audio';

function MyComponent() {
  const {
    isReady,
    config,
    state,
    settings,
    actions,
    getAnalyserData
  } = useAudioDirector();

  const handlePlay = async () => {
    await actions.enterCatalog('nextjs');
  };

  const handleStop = async () => {
    await actions.setHome();
  };

  return (
    <button onClick={handlePlay}>Play Next.js Track</button>
  );
}
```

### Available Actions

- `setHome()`: Play home track
- `previewCatalog(catalogId)`: Preview catalog track (hover)
- `enterCatalog(catalogId)`: Enter catalog, play track
- `leaveCatalog()`: Leave catalog, return to home
- `toggleMute(forcedValue?)`: Toggle mute
- `setVolume(value)`: Set master volume (0-1)
- `resume()`: Resume AudioContext (user gesture required)

## Crossfade Behavior

Tracks crossfade smoothly with configurable duration:

- **Home → Catalog**: Home fades out, catalog fades in
- **Catalog → Home**: Catalog fades out, home fades in
- **Hover Preview**: Home volume reduces, preview track plays softly
- **Duration**: 1.1 seconds (configurable in `constants.ts`)

## Visualization

Use `getAnalyserData()` or `useAnalyserData()` hook:

```typescript
import { useAnalyserData } from '@/features/audio';

function Visualizer() {
  const { data, frame } = useAnalyserData();

  // data: Uint8Array of frequency data (0-255)
  // frame: Counter for React re-renders

  return (
    <canvas ref={canvasRef} />
  );
}
```

## Adding New Platform

1. Create adapter file: `src/features/audio/services/[platform]-adapter.ts`
2. Implement `PlatformAdapter` interface
3. Add platform detection in `platform-detector.ts`
4. Add case in `AudioDirector.createAdapter()`
5. Update types if needed

Example:

```typescript
export class SpotifyAdapter implements PlatformAdapter {
  public readonly platform: Platform = 'spotify';

  async initialize(containerId: string, url: string): Promise<void> {
    // Load Spotify Web Playback SDK
    // Create hidden player
  }

  async play(): Promise<void> {
    // Delegate to Spotify player
  }

  // ... implement all PlatformAdapter methods
}
```

## Troubleshooting

### Track won't load

1. **Check URL format**: Use supported formats listed above
2. **Check console**: Look for initialization errors
3. **Check embed permissions**: Some videos/tracks disable embedding
4. **Regional restrictions**: Content may be blocked in some regions

### No audio playback

1. **User gesture required**: Call `actions.resume()` on user click/touch
2. **Browser autoplay policy**: Modern browsers block autoplay without interaction
3. **Check volume/mute**: Ensure not muted and volume > 0

### Crossfade not working

1. **Check GainNode**: Verify Web Audio API graph is connected
2. **Check GSAP**: Ensure GSAP library is loaded
3. **Check timings**: Adjust `CROSSFADE_SECONDS` in constants

### Visualizer not updating

1. **Check AnalyserNode**: Verify connection to audio source
2. **Check requestAnimationFrame**: Ensure animation loop is running
3. **Check data array**: Verify `getAnalyserData()` returns valid data

## Performance Considerations

- **Lazy loading**: Tracks load on-demand when first needed
- **Hidden players**: Players are 0x0 and off-screen to save resources
- **Pre-buffering**: AudioDirector pre-loads tracks for instant playback
- **Memory management**: Tracks are destroyed when no longer needed

## Best Practices

1. **Test tracks before adding**: Ensure they support embedding
2. **Use public tracks**: Private/restricted tracks will fail
3. **Handle errors gracefully**: Always check for null/undefined
4. **Respect autoplay policies**: Always require user gesture
5. **Provide visual feedback**: Show loading states, errors to user
6. **Monitor console**: Check for warnings/errors during development

## API Reference

See type definitions in `src/features/audio/model/types.ts` for complete API documentation.
