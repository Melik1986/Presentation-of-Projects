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

export function DropdownMenu({ children }: Readonly<DropdownMenuProps>) {
  const [open, setOpen] = React.useState(false);
  const value = React.useMemo(() => ({ open, setOpen }), [open]);

  return (
    <DropdownMenuContext.Provider value={value}>{children}</DropdownMenuContext.Provider>
  );
}

export const DropdownMenuTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }
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
    <button
      type="button"
      ref={ref}
      className={className}
      onClick={handleClick}
      aria-expanded={context?.open}
      aria-haspopup="menu"
      {...props}
    >
      {children}
    </button>
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
      <button
        type="button"
        aria-label="Close menu"
        className="fixed inset-0 z-40 cursor-default"
        onClick={() => context.setOpen(false)}
      />
      <div
        ref={ref}
        role="menu"
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
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }
>(({ className, children, asChild, ...props }, ref) => {
  if (asChild && React.isValidElement(children)) {
    return children;
  }

  return (
    <button
      type="button"
      ref={ref}
      role="menuitem"
      className={cn(
        'relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-left text-sm',
        'hover:bg-white/5 focus:bg-white/5',
        'outline-none',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
});

DropdownMenuItem.displayName = 'DropdownMenuItem';
