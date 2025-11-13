'use client';

import { ChevronDown } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/shared/lib/utils';

interface SelectContextValue {
  value: string;
  onValueChange: (value: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
}

const SelectContext = React.createContext<SelectContextValue | undefined>(undefined);

export interface SelectProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
}

export function Select({ value, onValueChange, children }: SelectProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <SelectContext.Provider value={{ value, onValueChange, open, setOpen }}>
      {children}
    </SelectContext.Provider>
  );
}

export const SelectTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, children, ...props }, ref) => {
  const context = React.useContext(SelectContext);

  return (
    <button
      ref={ref}
      type="button"
      className={cn(
        'flex h-9 w-full items-center justify-between rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white',
        'focus:outline-none focus:ring-2 focus:ring-primary/50',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      onClick={() => context?.setOpen(!context.open)}
      {...props}
    >
      {children}
      <ChevronDown className="size-4 opacity-50" />
    </button>
  );
});

SelectTrigger.displayName = 'SelectTrigger';

export const SelectValue = ({ placeholder }: { placeholder?: string }) => {
  const context = React.useContext(SelectContext);
  return <span>{context?.value || placeholder || 'Select...'}</span>;
};

export const SelectContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    const context = React.useContext(SelectContext);
    if (!context?.open) return null;

    return (
      <>
        <div className="fixed inset-0 z-40" onClick={() => context.setOpen(false)} />
        <div
          ref={ref}
          className={cn(
            'absolute z-50 mt-1 min-w-[8rem] overflow-hidden rounded-md border border-white/10 bg-slate-900 p-1 shadow-md',
            'animate-in fade-in-0 zoom-in-95',
            className
          )}
          {...props}
        >
          {children}
        </div>
      </>
    );
  }
);

SelectContent.displayName = 'SelectContent';

export const SelectItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { value: string }
>(({ className, children, value, ...props }, ref) => {
  const context = React.useContext(SelectContext);

  return (
    <div
      ref={ref}
      className={cn(
        'relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm text-slate-300',
        'hover:bg-emerald-500/10 hover:text-emerald-400 focus:bg-emerald-500/10 focus:text-emerald-400',
        'transition-colors duration-200',
        'outline-none',
        className
      )}
      onClick={() => {
        context?.onValueChange(value);
        context?.setOpen(false);
      }}
      {...props}
    >
      {children}
    </div>
  );
});

SelectItem.displayName = 'SelectItem';
