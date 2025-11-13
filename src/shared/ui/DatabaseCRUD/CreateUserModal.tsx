'use client';

import { UserPlus, X } from 'lucide-react';
import React, { useState } from 'react';

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

import type { CreateUserModalProps, UserRole } from './types';

/**
 * Create User Modal Component
 * Glassmorphism form for adding new database user
 */
export function CreateUserModal({ isOpen, onClose, onSubmit }: CreateUserModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'user' as UserRole,
    avatar: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    onSubmit({
      name: formData.name,
      email: formData.email,
      role: formData.role,
      avatar: formData.avatar || null,
      status: 'pending',
    });

    setFormData({ name: '', email: '', role: 'user', avatar: '' });
    setErrors({});
    onClose();
  };

  const handleClose = () => {
    setFormData({ name: '', email: '', role: 'user', avatar: '' });
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-slate-900/95 backdrop-blur-xl border-white/10 text-white sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-emerald-400 flex items-center gap-2">
            <UserPlus className="size-6" />
            Add New User
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Create a new user account in the database
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-slate-300">
              Name *
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter full name"
              className={cn(
                'bg-white/5 border-white/10 text-white placeholder:text-slate-500',
                'focus:border-emerald-500/50 focus:ring-emerald-500/20',
                errors.name && 'border-red-500/50'
              )}
            />
            {errors.name && <p className="text-xs text-red-400">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-slate-300">
              Email *
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="user@example.com"
              className={cn(
                'bg-white/5 border-white/10 text-white placeholder:text-slate-500',
                'focus:border-emerald-500/50 focus:ring-emerald-500/20',
                errors.email && 'border-red-500/50'
              )}
            />
            {errors.email && <p className="text-xs text-red-400">{errors.email}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="role" className="text-slate-300">
              Role
            </Label>
            <Select
              value={formData.role}
              onValueChange={(value) => setFormData({ ...formData, role: value as UserRole })}
            >
              <SelectTrigger className="col-span-3 bg-white/10 border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-700">
                <SelectItem
                  value="admin"
                  className="text-slate-300 hover:text-emerald-400 hover:bg-emerald-500/10"
                >
                  Admin
                </SelectItem>
                <SelectItem
                  value="user"
                  className="text-slate-300 hover:text-blue-400 hover:bg-blue-500/10"
                >
                  User
                </SelectItem>
                <SelectItem
                  value="guest"
                  className="text-slate-300 hover:text-gray-400 hover:bg-gray-500/10"
                >
                  Guest
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="avatar" className="text-slate-300">
              Avatar URL (optional)
            </Label>
            <Input
              id="avatar"
              type="url"
              value={formData.avatar}
              onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
              placeholder="https://example.com/avatar.jpg"
              className="col-span-3 bg-white/10 border-white/10 text-white placeholder:text-slate-500"
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="border-white/10 text-slate-300 hover:bg-white/5"
            >
              <X className="size-4 mr-2" />
              Cancel
            </Button>
            <Button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-white">
              <UserPlus className="size-4 mr-2" />
              Create User
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
