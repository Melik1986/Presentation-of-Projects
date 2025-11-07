import gsap from 'gsap';

import { MOBILE_BREAKPOINT } from './data';
import type { AnimationPhase, MobileState } from './types';

/**
 * Get random rotation based on image position
 */
export function getRotation(position: number): number {
  if (position === 0) {
    return gsap.utils.random(-20, -10);
  }

  if (position === 1) {
    return gsap.utils.random(-10, 10);
  }

  return gsap.utils.random(10, 20);
}

/**
 * Set wrapper vertical offset based on mobile state
 */
export function setWrapperOffset(wrappers: HTMLElement[], isMobile: boolean): void {
  gsap.set(wrappers, { y: isMobile ? 0 : 25 });
}

/**
 * Animate preview images on folder hover
 */
export function animatePreviewImages(images: Element[], phase: AnimationPhase): void {
  images.forEach((image, index) => {
    const targetRotation = phase === 'enter' ? getRotation(index) : 0;
    const targetY = phase === 'enter' ? '-100%' : '0%';
    const delayStep = phase === 'enter' ? 0.025 : 0.05;

    gsap.to(image, {
      y: targetY,
      rotation: targetRotation,
      duration: 0.25,
      ease: 'back.out(1.7)',
      delay: index * delayStep,
    });
  });
}

/**
 * Disable all folders except the active one
 */
export function disableSiblingFolders(folders: Element[], activeFolder: Element): void {
  folders.forEach((folder) => {
    if (folder === activeFolder) {
      return;
    }

    folder.classList.add('disabled');
  });
}

/**
 * Enable all folders
 */
export function enableAllFolders(folders: Element[]): void {
  folders.forEach((folder) => {
    folder.classList.remove('disabled');
  });
}

/**
 * Reset all preview images to initial state
 */
export function resetPreviews(container: HTMLElement): void {
  const previews = container.querySelectorAll('.folder-preview-img');
  gsap.set(previews, { y: '0%', rotation: 0 });
}

/**
 * Create mouse enter handler for folder
 */
export function createEnterHandler(
  folder: Element,
  wrapper: HTMLElement,
  folders: Element[],
  previewImages: Element[],
  mobileState: MobileState
): () => void {
  return () => {
    if (mobileState.current) {
      return;
    }

    disableSiblingFolders(folders, folder);
    gsap.to(wrapper, {
      y: 0,
      duration: 0.25,
      ease: 'back.out(1.7)',
    });
    animatePreviewImages(previewImages, 'enter');
  };
}

/**
 * Create mouse leave handler for folder
 */
export function createLeaveHandler(
  wrapper: HTMLElement,
  folders: Element[],
  previewImages: Element[],
  mobileState: MobileState
): () => void {
  return () => {
    if (mobileState.current) {
      return;
    }

    enableAllFolders(folders);
    gsap.to(wrapper, {
      y: 25,
      duration: 0.25,
      ease: 'back.out(1.7)',
    });
    animatePreviewImages(previewImages, 'leave');
  };
}

/**
 * Attach hover events to folder element
 */
export function attachHoverEvents(
  folder: Element,
  wrapper: HTMLElement,
  folders: Element[],
  mobileState: MobileState
): () => void {
  const previewImages = Array.from(folder.querySelectorAll('.folder-preview-img'));
  const handleEnter = createEnterHandler(folder, wrapper, folders, previewImages, mobileState);
  const handleLeave = createLeaveHandler(wrapper, folders, previewImages, mobileState);

  folder.addEventListener('mouseenter', handleEnter);
  folder.addEventListener('mouseleave', handleLeave);

  return () => {
    folder.removeEventListener('mouseenter', handleEnter);
    folder.removeEventListener('mouseleave', handleLeave);
  };
}

/**
 * Create mobile state object
 */
export function createMobileState(): MobileState {
  return { current: window.innerWidth < MOBILE_BREAKPOINT };
}

/**
 * Bind hover listeners to all folders
 */
export function bindHoverListeners(
  folders: Element[],
  wrappers: HTMLElement[],
  mobileState: MobileState
): (() => void)[] {
  return folders.map((folder, index) =>
    attachHoverEvents(folder, wrappers[index]!, folders, mobileState)
  );
}

/**
 * Create resize handler for responsive behavior
 */
export function createResizeHandler(
  container: HTMLElement,
  wrappers: HTMLElement[],
  folders: Element[],
  mobileState: MobileState
): () => void {
  return () => {
    const nextIsMobile = window.innerWidth < MOBILE_BREAKPOINT;
    if (nextIsMobile === mobileState.current) {
      return;
    }

    mobileState.current = nextIsMobile;
    setWrapperOffset(wrappers, mobileState.current);
    enableAllFolders(folders);
    resetPreviews(container);
  };
}

/**
 * Setup Wildyriftian animation system
 */
export function setupWildyriftianAnimation(container: HTMLElement): (() => void) | undefined {
  const folders = Array.from(container.querySelectorAll('.folder'));
  if (folders.length === 0) {
    return undefined;
  }

  const wrappers = Array.from(container.querySelectorAll<HTMLElement>('.folder-wrapper'));
  const mobileState = createMobileState();

  setWrapperOffset(wrappers, mobileState.current);

  const detachHover = bindHoverListeners(folders, wrappers, mobileState);
  const handleResize = createResizeHandler(container, wrappers, folders, mobileState);

  window.addEventListener('resize', handleResize);

  return () => {
    window.removeEventListener('resize', handleResize);
    detachHover.forEach((detach) => detach());
  };
}

