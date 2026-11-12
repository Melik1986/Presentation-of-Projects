import { createLogger } from '@/shared/lib';

import { ANALYSER_FFT_SIZE, ANALYSER_SMOOTHING } from './constants';

import type { DirectorSettings } from './types';

const logger = createLogger().child({ module: 'AudioContextFactory' });

export type AudioGraph = {
  context: AudioContext;
  masterGain: GainNode;
  analyser: AnalyserNode;
};

function resolveAudioContextCtor(): typeof AudioContext | null {
  const extendedWindow = window as typeof window & {
    webkitAudioContext?: typeof AudioContext;
  };
  return window.AudioContext ?? extendedWindow.webkitAudioContext ?? null;
}

async function closeContextQuietly(context: AudioContext): Promise<void> {
  if (context.state === 'closed') {
    return;
  }
  try {
    await context.close();
  } catch {
    // Ignore close errors
  }
}

/**
 * Creates a fresh AudioContext graph (gain → analyser → destination).
 */
export function createAudioGraph(settings: DirectorSettings): AudioGraph | null {
  const AudioContextCtor = resolveAudioContextCtor();
  if (!AudioContextCtor) {
    logger.warn('AudioContext is not supported in this environment');
    return null;
  }

  const context = new AudioContextCtor();
  const masterGain = context.createGain();
  masterGain.gain.value = settings.muted ? 0 : settings.volume;

  const analyser = context.createAnalyser();
  analyser.fftSize = ANALYSER_FFT_SIZE;
  analyser.smoothingTimeConstant = ANALYSER_SMOOTHING;

  masterGain.connect(analyser);
  analyser.connect(context.destination);

  return { context, masterGain, analyser };
}

/**
 * Replaces a closed/missing context with a new graph.
 */
export function ensureAudioGraph(
  current: AudioContext | null,
  settings: DirectorSettings
): AudioGraph | null {
  if (current && current.state !== 'closed') {
    return null;
  }
  if (current) {
    void closeContextQuietly(current);
  }
  return createAudioGraph(settings);
}

/**
 * Resumes a suspended context after a user gesture.
 */
export async function resumeAudioContext(ctx: AudioContext | null, label: string): Promise<void> {
  if (ctx?.state !== 'suspended') {
    return;
  }
  try {
    await ctx.resume();
  } catch (error) {
    logger.warn(`Failed to resume AudioContext${label}:`, error);
  }
}

export function hasBrowserUserActivation(hasUserGesture: boolean): boolean {
  if (hasUserGesture) {
    return true;
  }
  if (typeof navigator === 'undefined') {
    return false;
  }
  const activation = (navigator as unknown as { userActivation?: { hasBeenActive: boolean } })
    .userActivation;
  return Boolean(activation?.hasBeenActive);
}
