'use client';

import * as React from 'react';

import { cn } from '@/shared/lib/utils';

interface DialogContextValue {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DialogContext = React.createContext<DialogContextValue | undefined>(undefined);

const NOOP_OPEN_CHANGE = (_open: boolean): void => {
  // controlled Dialog without onOpenChange — intentional no-op
};

export interface DialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

export function Dialog({ open, onOpenChange, children }: Readonly<DialogProps>) {
  const value = React.useMemo(
    () => ({
      open: open ?? false,
      onOpenChange: onOpenChange ?? NOOP_OPEN_CHANGE,
    }),
    [open, onOpenChange]
  );

  return <DialogContext.Provider value={value}>{children}</DialogContext.Provider>;
}

export interface DialogContentProps extends React.DialogHTMLAttributes<HTMLDialogElement> {
  children: React.ReactNode;
}

export const DialogContent = React.forwardRef<HTMLDialogElement, DialogContentProps>(
  ({ className, children, ...props }, ref) => {
    const context = React.useContext(DialogContext);
    if (!context?.open) return null;

    return (
      <>
        <button
          type="button"
          aria-label="Close dialog"
          className="fixed inset-0 z-50 cursor-default bg-black/80 backdrop-blur-sm"
          onClick={() => context.onOpenChange(false)}
        />
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
          <dialog
            ref={ref}
            open
            className={cn(
              'pointer-events-auto relative m-0 w-full max-w-lg rounded-xl border border-white/10 bg-slate-900 p-6 shadow-lg',
              'animate-in fade-in-0 zoom-in-95',
              className
            )}
            {...props}
          >
            {children}
          </dialog>
        </div>
      </>
    );
  }
);

DialogContent.displayName = 'DialogContent';

export const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn('flex flex-col space-y-1.5 text-center sm:text-left', className)}
      {...props}
    />
  );
};

DialogHeader.displayName = 'DialogHeader';

export const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2', className)}
      {...props}
    />
  );
};

DialogFooter.displayName = 'DialogFooter';

export const DialogTitle = ({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) => {
  return (
    <h2 className={cn('text-lg font-semibold leading-none tracking-tight', className)} {...props}>
      {children}
    </h2>
  );
};

DialogTitle.displayName = 'DialogTitle';

export const DialogDescription = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) => {
  return <p className={cn('text-sm text-slate-400', className)} {...props} />;
};

DialogDescription.displayName = 'DialogDescription';
