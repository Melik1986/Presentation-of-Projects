'use client';

import * as React from 'react';

import { cn } from '@/shared/lib/utils';

interface ProjectGalleryRevealContextValue {
  isHovered: boolean;
  isActive?: boolean;
}

const ProjectGalleryRevealContext = React.createContext<ProjectGalleryRevealContextValue | null>(
  null
);

function useProjectGalleryReveal() {
  const context = React.useContext(ProjectGalleryRevealContext);
  if (!context) {
    throw new Error('Project gallery reveal content must be inside ProjectGalleryReveal');
  }

  return context;
}

export interface ProjectGalleryRevealProps extends React.HTMLAttributes<HTMLDivElement> {
  isActive?: boolean;
}

export const ProjectGalleryReveal = React.forwardRef<
  HTMLDivElement,
  ProjectGalleryRevealProps
>(({ className, isActive, ...props }, ref) => {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <ProjectGalleryRevealContext.Provider value={{ isHovered, isActive }}>
      <div
        ref={ref}
        className={cn('relative overflow-hidden', className)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onFocusCapture={() => setIsHovered(true)}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) {
            setIsHovered(false);
          }
        }}
        {...props}
      />
    </ProjectGalleryRevealContext.Provider>
  );
});
ProjectGalleryReveal.displayName = 'ProjectGalleryReveal';

interface ProjectGalleryRevealMainProps extends React.HTMLAttributes<HTMLDivElement> {
  initialScale?: number;
  hoverScale?: number;
}

export const ProjectGalleryRevealMain = React.forwardRef<
  HTMLDivElement,
  ProjectGalleryRevealMainProps
>(({ className, initialScale = 1, hoverScale = 1.05, style, ...props }, ref) => {
  const { isHovered, isActive } = useProjectGalleryReveal();
  const shouldScale = typeof isActive === 'boolean' ? isActive : isHovered;

  return (
    <div
      ref={ref}
      className={cn('size-full transition-transform duration-300', className)}
      style={{ transform: `scale(${shouldScale ? hoverScale : initialScale})`, ...style }}
      {...props}
    />
  );
});
ProjectGalleryRevealMain.displayName = 'ProjectGalleryRevealMain';

export const ProjectGalleryRevealContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, style, ...props }, ref) => {
  const { isHovered, isActive } = useProjectGalleryReveal();
  const isVisible = typeof isActive === 'boolean' ? isActive : isHovered;

  return (
    <div
      ref={ref}
      className={cn(
        'absolute inset-x-6 bottom-6 p-6 transition-all duration-500 ease-in-out',
        className
      )}
      style={{
        translate: isVisible ? '0%' : '0% 120%',
        opacity: isVisible ? 1 : 0,
        ...style,
      }}
      {...props}
    />
  );
});
ProjectGalleryRevealContent.displayName = 'ProjectGalleryRevealContent';
