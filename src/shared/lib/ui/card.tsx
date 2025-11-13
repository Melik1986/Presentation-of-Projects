import * as React from 'react';

import { cn } from '@/shared/lib/utils';

export type CardProps = React.HTMLAttributes<HTMLDivElement>;

export const Card = React.forwardRef<HTMLDivElement, CardProps>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn('rounded-xl border border-white/10 bg-white/5 p-6 shadow-sm', className)}
      {...props}
    />
  );
});

Card.displayName = 'Card';

export const CardContent = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => {
    return <div ref={ref} className={cn('p-0', className)} {...props} />;
  }
);

CardContent.displayName = 'CardContent';
