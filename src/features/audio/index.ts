/**
 * Audio Feature
 * Public API exports
 */

export { default as AudioDirector } from './model/AudioDirector';
export { AudioProvider, useAudioDirector, useAnalyserData } from './model/hooks/useStarlightAudio';

export { AudioControls } from './ui/AudioControls';
export { EqualizerCanvas } from './ui/EqualizerCanvas';
export { AudioUIPanel } from './ui/AudioUIPanel';
export { PreloaderTrack } from './ui/PreloaderTrack';

export type * from './model/types';
export * from './model/constants';
export * from './services/soundcloud';
