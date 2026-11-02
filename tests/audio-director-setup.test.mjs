import { afterAll, beforeAll, beforeEach, describe, expect, it, mock } from 'bun:test';

let director;
let containers;

beforeAll(async () => {
  globalThis.window = {
    localStorage: {
      getItem: mock(() => null),
      setItem: mock(() => {}),
    },
  };

  globalThis.document = {
    addEventListener: mock(() => {}),
    body: {
      appendChild: mock((container) => {
        containers.set(container.id, container);
      }),
    },
    createElement: mock(() => {
      const container = {
        id: '',
        style: { cssText: '' },
        remove: mock(() => {
          containers.delete(container.id);
        }),
      };
      return container;
    }),
    getElementById: mock((id) => containers.get(id) ?? null),
  };

  director = (await import('../src/features/audio/model/AudioDirector.ts')).default;
});

afterAll(() => {
  delete globalThis.window;
  delete globalThis.document;
});

beforeEach(() => {
  containers = new Map();
  director.tracks.clear();
  director.pendingTracks.clear();
  director.createdContainers.clear();
  director.pendingContainers.clear();
  director.initializationGeneration = 1;
});

function createTrackSetup(initialize = mock(async () => {})) {
  const gain = {
    gain: { value: 0 },
    connect: mock(() => {}),
  };
  const context = {
    createGain: mock(() => gain),
  };
  const masterGain = { context };
  const adapter = {
    initialize,
    destroy: mock(() => {}),
    getElement: mock(() => null),
  };

  director.context = context;
  director.masterGain = masterGain;

  return {
    setup: {
      id: 'catalog-1',
      url: 'https://www.youtube.com/watch?v=example',
      platform: 'youtube',
      adapter,
      context,
      generation: 1,
    },
    adapter,
    gain,
  };
}

describe('AudioDirector track setup', () => {
  it('registers a track and retains its player container after initialization', async () => {
    const { setup, adapter, gain } = createTrackSetup();

    const track = await director.setupTrackBundle(setup);

    expect(track).toMatchObject({
      id: setup.id,
      url: setup.url,
      platform: setup.platform,
      adapter,
      gain,
    });
    expect(director.tracks.get(setup.id)).toBe(track);
    expect(director.pendingContainers.size).toBe(0);
    expect(director.createdContainers.size).toBe(1);
  });

  it('discards a track when its initialization generation is stale', async () => {
    const { setup, adapter } = createTrackSetup(
      mock(async () => {
        director.initializationGeneration += 1;
      })
    );

    const track = await director.setupTrackBundle(setup);

    expect(track).toBeNull();
    expect(adapter.destroy).toHaveBeenCalledTimes(1);
    expect(director.tracks.has(setup.id)).toBe(false);
    expect(director.pendingContainers.size).toBe(0);
    expect(director.createdContainers.size).toBe(0);
  });

  it('destroys the adapter and removes its container when initialization fails', async () => {
    const { setup, adapter } = createTrackSetup(
      mock(async () => {
        throw new Error('Initialization failed');
      })
    );

    const track = await director.setupTrackBundle(setup);

    expect(track).toBeNull();
    expect(adapter.destroy).toHaveBeenCalledTimes(1);
    expect(director.tracks.has(setup.id)).toBe(false);
    expect(director.pendingContainers.size).toBe(0);
    expect(director.createdContainers.size).toBe(0);
  });
});
