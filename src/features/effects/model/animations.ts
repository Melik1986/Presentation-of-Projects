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
  previewImages: Element[]
): () => void {
  return () => {
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
  previewImages: Element[]
): () => void {
  return () => {
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
 * Note: Touch events are handled by React component + CSS animations
 */
export function attachHoverEvents(
  folder: Element,
  wrapper: HTMLElement,
  folders: Element[]
): () => void {
  const previewImages = Array.from(folder.querySelectorAll('.folder-preview-img'));
  const handleEnter = createEnterHandler(folder, wrapper, folders, previewImages);
  const handleLeave = createLeaveHandler(wrapper, folders, previewImages);

  // Desktop only: mouse events (GSAP animations)
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
  wrappers: HTMLElement[]
): (() => void)[] {
  return folders.map((folder, index) => attachHoverEvents(folder, wrappers[index]!, folders));
}

/**
 * Create resize handler for responsive behavior
 * Industry pattern: clean transition between mobile/desktop modes
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
    
    if (nextIsMobile) {
      // Switching TO mobile: remove all GSAP inline styles
      const previews = container.querySelectorAll('.folder-preview-img');
      previews.forEach((preview) => {
        (preview as HTMLElement).removeAttribute('style');
      });
      wrappers.forEach((wrapper) => {
        wrapper.removeAttribute('style');
      });
    } else {
      // Switching TO desktop: set initial GSAP state
      setWrapperOffset(wrappers, false);
      resetPreviews(container);
    }
    
    enableAllFolders(folders);
  };
}

/**
 * Setup Wildyriftian animation system
 * Industry best practice: separate Desktop (GSAP) and Mobile (CSS) logic
 */
export function setupWildyriftianAnimation(container: HTMLElement): (() => void) | undefined {
  const folders = Array.from(container.querySelectorAll('.folder'));
  if (folders.length === 0) {
    return undefined;
  }

  const wrappers = Array.from(container.querySelectorAll<HTMLElement>('.folder-wrapper'));
  const isMobile = window.innerWidth < MOBILE_BREAKPOINT;

  // Mobile: Clear GSAP inline styles, use pure CSS
  if (isMobile) {
    const previews = container.querySelectorAll('.folder-preview-img');
    
    // Remove any GSAP inline styles that block CSS animations
    previews.forEach((preview) => {
      (preview as HTMLElement).removeAttribute('style');
    });
    wrappers.forEach((wrapper) => {
      wrapper.removeAttribute('style');
    });

    // Mobile uses CSS animations only, no JS listeners needed
    return undefined;
  }

  // Desktop: GSAP hover animations
  const mobileState = createMobileState();
  setWrapperOffset(wrappers, mobileState.current);

  const detachHover = bindHoverListeners(folders, wrappers);
  const handleResize = createResizeHandler(container, wrappers, folders, mobileState);

  window.addEventListener('resize', handleResize);

  return () => {
    window.removeEventListener('resize', handleResize);
    detachHover.forEach((detach) => detach());
  };
}
