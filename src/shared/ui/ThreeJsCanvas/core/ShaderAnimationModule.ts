import { ShaderMaterial, Vector2, Color, type IUniform } from 'three';

import type { AuroraConfig } from '../types';

/**
 * Модуль для создания и обновления шейдерного материала частиц.
 * Хранит uniform-переменные и обновляет время анимации.
 */
export class ShaderAnimationModule {
  private readonly config: AuroraConfig;
  private readonly uniforms: { [uniform: string]: IUniform };
  private material: ShaderMaterial | null = null;

  constructor(config: AuroraConfig) {
    this.config = config;
    this.uniforms = this.createUniforms();
  }

  public createAnimatedMaterial(): ShaderMaterial {
    if (this.material) return this.material;

    const vertexShader = `
      uniform float uTime;
      uniform float uWaveSpeed;
      uniform float uWaveAmplitude;
      uniform float uWaveFrequency;
      uniform float uPointSize;
      
      void main() {
        float wave = sin(position.x * uWaveFrequency + uTime * uWaveSpeed)
                   + cos(position.z * uWaveFrequency * 0.75 + uTime * uWaveSpeed * 0.9);
        
        vec3 transformed = position;
        transformed.y += wave * uWaveAmplitude;
        
        gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
        gl_PointSize = uPointSize;
      }
    `;

    const fragmentShader = `
      uniform vec3 uColor;
      void main() {
        float d = length(gl_PointCoord - vec2(0.5));
        if (d > 0.5) discard;
        gl_FragColor = vec4(uColor, 0.9);
      }
    `;

    this.material = new ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
    });

    return this.material;
  }

  public updateTime(elapsed: number): void {
    (this.uniforms.uTime as { value: number }).value = elapsed;
  }

  private createUniforms(): { [uniform: string]: IUniform } {
    return {
      uTime: { value: 0 },
      uWaveSpeed: { value: this.config.wave.speed },
      uWaveAmplitude: { value: this.config.wave.amplitude },
      uWaveFrequency: { value: this.config.wave.frequency },
      uPointSize: { value: this.config.particles.size },
      uResolution: { value: new Vector2(1, 1) },
      uColor: { value: new Color(this.config.particles.color) },
    };
  }
}
