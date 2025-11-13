'use client';

import { Save } from 'lucide-react';
import React, { useEffect, useState } from 'react';

import { Button } from '@/shared/lib/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/lib/ui/dialog';
import { Input } from '@/shared/lib/ui/input';
import { Label } from '@/shared/lib/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/lib/ui/select';
import { cn } from '@/shared/lib/utils';

import type { EditUserModalProps, UserRole, UserStatus } from './types';

/**
 * Edit User Modal Component
 * Allows editing existing user data
 */
export function EditUserModal({ isOpen, user, onClose, onSubmit }: EditUserModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('user');
  const [status, setStatus] = useState<UserStatus>('active');
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setRole(user.role);
      setStatus(user.status);
    }
  }, [user]);

  const validate = () => {
    const newErrors: { name?: string; email?: string } = {};
    if (!name.trim()) newErrors.name = 'Name is required';
    if (!email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Email is invalid';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate() && user) {
      onSubmit({ ...user, name, email, role, status });
      setErrors({});
      onClose();
    }
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900/95 backdrop-blur-xl border-white/10 text-white sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-white">Edit User</DialogTitle>
          <DialogDescription className="text-slate-400">
            Update user information and permissions.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-name" className="text-right text-slate-300">
              Name
            </Label>
            <Input
              id="edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={cn(
                'col-span-3 bg-white/10 border-white/10 text-white placeholder:text-slate-500',
                errors.name && 'border-red-500'
              )}
              aria-invalid={!!errors.name}
            />
            {errors.name && (
              <p className="col-start-2 col-span-3 text-red-500 text-sm">{errors.name}</p>
            )}
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-email" className="text-right text-slate-300">
              Email
            </Label>
            <Input
              id="edit-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={cn(
                'col-span-3 bg-white/10 border-white/10 text-white placeholder:text-slate-500',
                errors.email && 'border-red-500'
              )}
              aria-invalid={!!errors.email}
            />
            {errors.email && (
              <p className="col-start-2 col-span-3 text-red-500 text-sm">{errors.email}</p>
            )}
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-role" className="text-right text-slate-300">
              Role
            </Label>
            <Select value={role} onValueChange={(value) => setRole(value as UserRole)}>
              <SelectTrigger className="col-span-3 bg-white/10 border-white/10 text-white">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900/95 backdrop-blur-xl border-white/10 text-white">
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="guest">Guest</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-status" className="text-right text-slate-300">
              Status
            </Label>
            <Select value={status} onValueChange={(value) => setStatus(value as UserStatus)}>
              <SelectTrigger className="col-span-3 bg-white/10 border-white/10 text-white">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900/95 backdrop-blur-xl border-white/10 text-white">
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter className="mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-white/10 text-slate-300 hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-white">
              <Save className="size-4 mr-2" />
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
