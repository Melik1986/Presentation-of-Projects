import { Vector2, type PerspectiveCamera } from 'three';

import type { AuroraConfig } from '../types';

interface MouseState {
  target: Vector2;
  current: Vector2;
}

/**
 * Контроллер камеры, сглаживающий движение и обеспечивающий устойчивость.
 */
export class CameraController {
  private readonly camera: PerspectiveCamera;
  private readonly config: AuroraConfig;
  private readonly mouse: MouseState;
  private width = 1;
  private height = 1;

  constructor(camera: PerspectiveCamera, config: AuroraConfig) {
    this.camera = camera;
    this.config = config;
    this.mouse = {
      target: new Vector2(0, 0),
      current: new Vector2(0, 0),
    };
  }

  public updateViewport(width: number, height: number): void {
    this.width = Math.max(1, width);
    this.height = Math.max(1, height);
  }

  public updateMouseTarget(clientX: number, clientY: number): void {
    const x = (clientX / this.width) * 2 - 1;
    const y = -(clientY / this.height) * 2 + 1;
    this.mouse.target.set(x, y);
  }

  public update(delta: number): void {
    const ease = this.config.cameraEase;
    this.mouse.current.lerp(this.mouse.target, ease * Math.min(delta * 60, 1));

    const offsetX = this.mouse.current.x * this.config.cameraMaxOffset;
    const offsetY = this.mouse.current.y * this.config.cameraMaxOffset;

    this.camera.position.x = offsetX;
    this.camera.position.y = offsetY;
    this.camera.lookAt(0, 0, 0);
  }
}
