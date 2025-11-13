'use client';

import * as React from 'react';

import { cn } from '@/shared/lib/utils';

interface DropdownMenuContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const DropdownMenuContext = React.createContext<DropdownMenuContextValue | undefined>(undefined);

export interface DropdownMenuProps {
  children: React.ReactNode;
}

export function DropdownMenu({ children }: DropdownMenuProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <DropdownMenuContext.Provider value={{ open, setOpen }}>
      {children}
    </DropdownMenuContext.Provider>
  );
}

export const DropdownMenuTrigger = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { asChild?: boolean }
>(({ className, children, asChild, ...props }, ref) => {
  const context = React.useContext(DropdownMenuContext);

  const handleClick = () => {
    context?.setOpen(!context.open);
  };

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(
      children as React.ReactElement<{ onClick?: () => void }>,
      {
        onClick: handleClick,
      } as Partial<{ onClick: () => void }>
    );
  }

  return (
    <div ref={ref} className={className} onClick={handleClick} {...props}>
      {children}
    </div>
  );
});

DropdownMenuTrigger.displayName = 'DropdownMenuTrigger';

export const DropdownMenuContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { align?: 'start' | 'end' }
>(({ className, align = 'start', children, ...props }, ref) => {
  const context = React.useContext(DropdownMenuContext);
  if (!context?.open) return null;

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={() => context.setOpen(false)} />
      <div
        ref={ref}
        className={cn(
          'absolute z-50 mt-2 min-w-[8rem] overflow-hidden rounded-md border border-white/10 bg-slate-900 p-1 shadow-md',
          'animate-in fade-in-0 zoom-in-95',
          align === 'end' && 'right-0',
          className
        )}
        {...props}
      >
        {children}
      </div>
    </>
  );
});

DropdownMenuContent.displayName = 'DropdownMenuContent';

export const DropdownMenuItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { asChild?: boolean }
>(({ className, children, asChild, ...props }, ref) => {
  if (asChild && React.isValidElement(children)) {
    return children;
  }

  return (
    <div
      ref={ref}
      className={cn(
        'relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm',
        'hover:bg-white/5 focus:bg-white/5',
        'outline-none',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

DropdownMenuItem.displayName = 'DropdownMenuItem';
