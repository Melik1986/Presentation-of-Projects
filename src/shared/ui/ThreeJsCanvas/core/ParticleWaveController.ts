import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  BufferGeometry,
  Float32BufferAttribute,
  Points,
  Clock,
  type Material,
} from 'three';

import { createLogger } from '@/shared/lib';

import { CameraController } from './CameraController';
import { ShaderAnimationModule } from './ShaderAnimationModule';

import type { AuroraConfig } from '../types';

const logger = createLogger().child({ module: 'ParticleWaveController' });

// Background for canvas is now controlled purely by CSS variables.

interface ControllerState {
  isInitialized: boolean;
  isAnimating: boolean;
  shouldUpdateCamera: boolean;
}

/**
 * Централизованный контроллер для управления анимацией микрочастиц.
 * Отвечает за инициализацию, рендеринг и координацию всех подсистем.
 */
export class ParticleWaveController {
  private readonly scene: Scene;
  private readonly camera: PerspectiveCamera;
  private readonly renderer: WebGLRenderer;
  private readonly shaderModule: ShaderAnimationModule;
  private readonly cameraController: CameraController;
  private readonly clock: Clock;

  private particles: Points | null = null;
  private frameId: number | null = null;
  private state: ControllerState;
  private themeObserver: MutationObserver | null = null;

  constructor(
    private readonly container: HTMLElement,
    private readonly config: AuroraConfig
  ) {
    this.scene = new Scene();
    this.camera = this.createCamera();
    this.renderer = this.createRenderer();
    this.clock = new Clock();

    this.shaderModule = new ShaderAnimationModule(config);
    this.cameraController = new CameraController(this.camera, config);

    this.state = {
      isInitialized: false,
      isAnimating: false,
      shouldUpdateCamera: false,
    };

    // Renderer clear color left transparent — CSS controls the visible canvas background.
  }

  /**
   * Инициализация всех компонентов анимации
   */
  public async initialize(): Promise<void> {
    if (this.state.isInitialized) return;

    try {
      // Создаем геометрию частиц
      const geometry = this.createParticleGeometry();

      // Создаем материал с шейдерами
      const material = this.shaderModule.createAnimatedMaterial();

      // Создаем систему частиц
      this.particles = new Points(geometry, material);
      this.scene.add(this.particles);

      this.state.isInitialized = true;
    } catch (error) {
      logger.error(error, 'Ошибка инициализации анимации частиц');
      throw error;
    }
  }

  /**
   * Запуск анимации
   */
  public startAnimation(): void {
    if (!this.state.isInitialized || this.state.isAnimating) return;

    this.state.isAnimating = true;
    this.clock.start();
    this.animate();
  }

  /**
   * Остановка анимации
   */
  public stopAnimation(): void {
    if (!this.state.isAnimating) return;

    this.state.isAnimating = false;
    this.state.shouldUpdateCamera = false;

    if (this.frameId !== null) {
      cancelAnimationFrame(this.frameId);
      this.frameId = null;
    }
  }

  /**
   * Включение отслеживания мыши для камеры
   */
  public enableMouseTracking(): void {
    this.state.shouldUpdateCamera = true;
  }

  /**
   * Обновление позиции мыши
   */
  public updateMousePosition(x: number, y: number): void {
    this.cameraController.updateMouseTarget(x, y);
  }

  /**
   * Обработка изменения размера контейнера
   */
  public handleResize(): void {
    const width = this.container.clientWidth || this.container.offsetWidth || 1;
    let height = this.container.clientHeight || this.container.offsetHeight || 1;
    // Высота полностью задаётся CSS контейнера; оставляем лишь защиту от нуля
    if (height <= 0) height = 1;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
    this.cameraController.updateViewport(width, height);
  }

  /**
   * Освобождение ресурсов
   */
  public dispose(): void {
    this.stopAnimation();

    if (this.particles) {
      this.particles.geometry.dispose();

      // Безопасное освобождение материала
      const material = this.particles.material;
      if (Array.isArray(material)) {
        material.forEach((mat: Material) => mat.dispose());
      } else {
        material.dispose();
      }

      this.scene.remove(this.particles);
    }

    this.renderer.dispose();
    if (this.container.contains(this.renderer.domElement)) {
      this.container.removeChild(this.renderer.domElement);
    }

    if (this.themeObserver) {
      this.themeObserver.disconnect();
      this.themeObserver = null;
    }
  }

  /**
   * Основной цикл анимации
   */
  private animate = (): void => {
    if (!this.state.isAnimating) return;

    try {
      const deltaTime = this.clock.getDelta();
      const elapsedTime = this.clock.getElapsedTime();

      // Обновляем анимацию волн в шейдере
      this.shaderModule.updateTime(elapsedTime);

      // Обновляем камеру при необходимости
      if (this.state.shouldUpdateCamera) {
        this.cameraController.update(deltaTime);
      }

      // Рендерим сцену
      this.renderer.render(this.scene, this.camera);
    } catch (error) {
      logger.warn(error, 'Ошибка в цикле анимации');
    }

    this.frameId = requestAnimationFrame(this.animate);
  };

  /**
   * Создание камеры с настройками из конфигурации
   */
  private createCamera(): PerspectiveCamera {
    const width = this.container.clientWidth || this.container.offsetWidth || 1;
    let height = this.container.clientHeight || this.container.offsetHeight || 1;
    if (height <= 0) height = 1;

    const camera = new PerspectiveCamera(
      this.config.cameraFov,
      width / height,
      this.config.cameraNear,
      this.config.cameraFar
    );

    camera.position.z = this.config.cameraZ;
    return camera;
  }

  /**
   * Создание рендерера
   */
  private createRenderer(): WebGLRenderer {
    const renderer = new WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    const width = this.container.clientWidth || this.container.offsetWidth || 1;
    let height = this.container.clientHeight || this.container.offsetHeight || 1;
    if (height <= 0) height = 1;
    renderer.setSize(width, height, false);

    this.container.appendChild(renderer.domElement);
    // Ensure the WebGL clear color is transparent so CSS background is visible
    try {
      renderer.setClearColor(0x000000, 0);
    } catch {
      // ignore
    }
    try {
      const canvas = renderer.domElement as HTMLCanvasElement;
      canvas.style.width = '';
      canvas.style.height = '';
    } catch {
      // no-op
    }
    return renderer;
  }

  /**
   * Создание геометрии частиц
   */
  private createParticleGeometry(): BufferGeometry {
    const { amountX, amountY, separation } = this.config;
    const positions = new Float32Array(amountX * amountY * 3);

    let index = 0;
    for (let x = 0; x < amountX; x++) {
      for (let y = 0; y < amountY; y++) {
        positions[index++] = x * separation - (amountX * separation) / 2;
        positions[index++] = 0;
        positions[index++] = y * separation - (amountY * separation) / 2;
      }
    }

    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));

    return geometry;
  }
}
