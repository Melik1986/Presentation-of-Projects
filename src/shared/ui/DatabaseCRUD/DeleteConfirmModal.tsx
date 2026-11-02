'use client';

import { AlertTriangle, Trash2, X } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/shared/lib/ui/avatar';
import { Button } from '@/shared/lib/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/lib/ui/dialog';

import type { DeleteConfirmModalProps } from './types';

/**
 * Get user initials from name
 */
const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

/**
 * Delete Confirmation Modal Component
 * Shows user preview and confirmation dialog
 */
export function DeleteConfirmModal({ isOpen, user, onClose, onConfirm }: DeleteConfirmModalProps) {
  if (!user) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900/95 backdrop-blur-xl border-white/10 text-white sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-red-400 flex items-center gap-2">
            <AlertTriangle className="size-6" />
            Delete User
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            This action cannot be undone. This will permanently delete the user account.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4">
            <div className="flex items-center gap-3 mb-3">
              <Avatar className="size-12 border-2 border-red-500/30">
                <AvatarImage src={user.avatar || undefined} alt={user.name} />
                <AvatarFallback className="bg-red-500/20 text-red-400 font-semibold">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h4 className="font-semibold text-white">{user.name}</h4>
                <p className="text-sm text-slate-400">{user.email}</p>
              </div>
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Role:</span>
                <span className="text-white capitalize">{user.role}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Status:</span>
                <span className="text-white capitalize">{user.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Projects:</span>
                <span className="text-white">{user.projectsCount}</span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="border-white/10 text-slate-300 hover:bg-white/5"
          >
            <X className="size-4 mr-2" />
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            className="bg-red-500 hover:bg-red-600 text-white"
          >
            <Trash2 className="size-4 mr-2" />
            Delete User
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
