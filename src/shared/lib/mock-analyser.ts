/**
 * Mock Audio Analyser
 * Generates realistic-looking frequency data without Web Audio API
 */

import { useEffect, useRef, useState } from 'react';

const BUFFER_SIZE = 32;
const BASE_BPM = 130;
const FRAME_INTERVAL = (60 / BASE_BPM) * 1000;

interface MockAnalyserOptions {
  isMuted: boolean;
  volume: number;
}

interface MockAnalyserResult {
  data: Uint8Array<ArrayBuffer>;
  frame: number;
}

/**
 * Generates smooth random value between min and max
 */
function smoothRandom(prev: number, min: number, max: number, smoothing: number): number {
  const target = Math.random() * (max - min) + min;
  return prev + (target - prev) * smoothing;
}

/**
 * Creates mock frequency data that looks realistic
 */
function generateFrequencyData(
  prevData: Uint8Array,
  volume: number,
  isMuted: boolean,
  beatPhase: number
): Uint8Array<ArrayBuffer> {
  const data = new Uint8Array(BUFFER_SIZE) as Uint8Array<ArrayBuffer>;

  if (isMuted || volume <= 0.001) {
    return data;
  }

  const beatIntensity = Math.abs(Math.sin(beatPhase)) * 0.6 + 0.4;

  for (let i = 0; i < BUFFER_SIZE; i++) {
    const prevValue = prevData[i] ?? 0;
    const normalizedIndex = i / BUFFER_SIZE;

    let baseValue: number;
    let smoothing: number;

    if (i < 10) {
      baseValue = 180 * beatIntensity * volume;
      smoothing = 0.3;
    } else if (i < 20) {
      baseValue = 140 * volume;
      smoothing = 0.4;
    } else {
      baseValue = 80 * volume;
      smoothing = 0.5;
    }

    const variance = 30 * (1 - normalizedIndex);
    const minValue = Math.max(0, baseValue - variance);
    const maxValue = Math.min(255, baseValue + variance);

    const newValue = smoothRandom(prevValue, minValue, maxValue, smoothing);
    data[i] = Math.round(Math.max(0, Math.min(255, newValue)));
  }

  return data;
}

/**
 * Hook for mock audio analyser data
 * Generates realistic frequency data synchronized to BPM
 */
export function useMockAnalyser(options: MockAnalyserOptions): MockAnalyserResult {
  const { isMuted, volume } = options;
  const [frame, setFrame] = useState(0);
  const dataRef = useRef<Uint8Array<ArrayBuffer>>(new Uint8Array(BUFFER_SIZE) as Uint8Array<ArrayBuffer>);
  const phaseRef = useRef(0);
  const lastUpdateRef = useRef(0);

  useEffect(() => {
    let animationFrame: number;
    let isActive = true;

    const update = (timestamp: number) => {
      if (!isActive) {
        return;
      }

      const elapsed = timestamp - lastUpdateRef.current;

      if (elapsed >= 16) {
        lastUpdateRef.current = timestamp;
        phaseRef.current += (Math.PI * 2 * elapsed) / FRAME_INTERVAL;

        if (phaseRef.current > Math.PI * 2) {
          phaseRef.current -= Math.PI * 2;
        }

        dataRef.current = generateFrequencyData(dataRef.current, volume, isMuted, phaseRef.current);

        setFrame((prev) => (prev + 1) % Number.MAX_SAFE_INTEGER);
      }

      animationFrame = requestAnimationFrame(update);
    };

    animationFrame = requestAnimationFrame(update);

    return () => {
      isActive = false;
      cancelAnimationFrame(animationFrame);
    };
  }, [volume, isMuted]);

  return {
    data: dataRef.current,
    frame,
  };
}

/**
 * Direct function for getting mock analyser data
 * For use outside React components
 */
export function createMockAnalyser() {
  let data = new Uint8Array(BUFFER_SIZE) as Uint8Array<ArrayBuffer>;
  let phase = 0;

  return {
    getFrequencyData: (volume: number, isMuted: boolean): Uint8Array<ArrayBuffer> => {
      phase += Math.PI / 30;
      if (phase > Math.PI * 2) {
        phase -= Math.PI * 2;
      }
      data = generateFrequencyData(data, volume, isMuted, phase);
      return data;
    },
  };
}

