import * as React from 'react';

import { cn } from '@/shared/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outline';
}

export const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium transition-colors',
          variant === 'default' && 'border-transparent bg-primary text-white',
          variant === 'outline' && 'border-current',
          className
        )}
        {...props}
      />
    );
  }
);

Badge.displayName = 'Badge';
