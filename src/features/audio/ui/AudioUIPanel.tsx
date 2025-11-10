'use client';

import { useRef } from 'react';

import { AudioControls } from './AudioControls';
import { EqualizerCanvas } from './EqualizerCanvas';
import { useAudioPanelAnimation } from '../model/hooks/useAudioPanelAnimation';

import type { ReactElement } from 'react';

interface AudioUIPanelProps {
  className?: string;
}

export function AudioUIPanel({ className = '' }: AudioUIPanelProps): ReactElement {
  const panelRef = useRef<HTMLDivElement>(null);

  useAudioPanelAnimation(panelRef);

  return (
    <div
      ref={panelRef}
      className={`audio-ui-panel ${className}`}
      role="complementary"
      aria-label="Audio controls and visualizer"
    >
      <AudioControls />
      <EqualizerCanvas barCount={32} barGap={2} className="audio-ui-panel__equalizer" />
    </div>
  );
}
