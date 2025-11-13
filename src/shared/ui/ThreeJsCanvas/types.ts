/**
 * Configuration interface for Aurora particle wave animation
 * Based on original AuroraConfig from AboutSection
 */
export interface AuroraConfig {
  // Grid configuration
  separation: number;
  amountX: number;
  amountY: number;

  // Legacy parameters (kept for backward compatibility)
  particleColor?: number;
  particleSize?: number;
  waveSpeed?: number;
  waveFrequencyX?: number;
  waveFrequencyY?: number;
  waveAmplitude?: number;

  // Camera configuration
  cameraSpeed?: number;
  cameraFov: number;
  cameraNear: number;
  cameraFar: number;
  cameraZ: number;
  cameraLerp?: number;

  // New optimized architecture parameters
  cameraEase: number;
  cameraMaxOffset: number;

  // Particle appearance (new structure)
  particles: {
    color: string;
    size: number;
  };

  // Wave animation (new structure)
  wave: {
    speed: number;
    amplitude: number;
    frequency: number;
  };
}
