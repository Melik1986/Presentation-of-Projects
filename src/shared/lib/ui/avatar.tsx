import * as React from 'react';

import { cn } from '@/shared/lib/utils';

export const Avatar = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('relative flex size-8 shrink-0 overflow-hidden rounded-full', className)}
        {...props}
      />
    );
  }
);

Avatar.displayName = 'Avatar';

export const AvatarImage = React.forwardRef<
  HTMLImageElement,
  React.ImgHTMLAttributes<HTMLImageElement>
>(({ className, src, alt, ...props }, ref) => {
  const [loaded, setLoaded] = React.useState(false);

  if (!src) return null;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={ref}
      src={src}
      alt={alt}
      className={cn('aspect-square size-full object-cover', !loaded && 'opacity-0', className)}
      onLoad={() => setLoaded(true)}
      {...props}
    />
  );
});

AvatarImage.displayName = 'AvatarImage';

export const AvatarFallback = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'flex size-full items-center justify-center rounded-full bg-slate-700 text-white',
        className
      )}
      {...props}
    />
  );
});

AvatarFallback.displayName = 'AvatarFallback';
