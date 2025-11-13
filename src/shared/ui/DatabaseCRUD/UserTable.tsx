'use client';

import { Edit, Trash2, MoreVertical } from 'lucide-react';
import React from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/shared/lib/ui/avatar';
import { Badge } from '@/shared/lib/ui/badge';
import { Button } from '@/shared/lib/ui/button';
import { Card, CardContent } from '@/shared/lib/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/lib/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/lib/ui/table';
import { cn } from '@/shared/lib/utils';

import type { UserTableProps } from './types';

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
 * Desktop Table Row Component
 */
function DesktopUserRow({
  user,
  onEdit,
  onDelete,
}: {
  user: UserTableProps['users'][0];
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}) {
  return (
    <TableRow
      className="border-white/10 hover:bg-white/5 transition-colors duration-200"
      data-table-row
    >
      <TableCell>
        <div className="flex items-center gap-3">
          <Avatar className="size-10 border-2 border-emerald-500/30">
            <AvatarImage src={user.avatar || undefined} alt={user.name} />
            <AvatarFallback className="bg-emerald-500/20 text-emerald-400 font-semibold">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
          <span className="font-medium text-white">{user.name}</span>
        </div>
      </TableCell>
      <TableCell className="text-slate-400">{user.email}</TableCell>
      <TableCell>
        <Badge
          variant="outline"
          className="border-emerald-500/30 bg-emerald-500/20 text-emerald-400"
        >
          {user.role}
        </Badge>
      </TableCell>
      <TableCell>
        <Badge
          variant="outline"
          className={cn(
            user.status === 'active' && 'border-green-500/30 bg-green-500/20 text-green-400',
            user.status === 'inactive' && 'border-gray-500/30 bg-gray-500/20 text-gray-400',
            user.status === 'pending' && 'border-yellow-500/30 bg-yellow-500/20 text-yellow-400'
          )}
        >
          {user.status}
        </Badge>
      </TableCell>
      <TableCell className="text-slate-400 text-sm">{user.projectsCount}</TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit?.(user.id)}
            className="size-8 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
            aria-label="Edit user"
          >
            <Edit className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete?.(user.id)}
            className="size-8 text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

/**
 * Mobile Card Component
 */
function MobileUserCard({
  user,
  onEdit,
  onDelete,
}: {
  user: UserTableProps['users'][0];
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}) {
  return (
    <Card
      className="bg-slate-900/90 backdrop-blur-xl border-white/10 overflow-hidden shadow-lg hover:shadow-emerald-500/20 transition-all duration-300"
      data-mobile-card
    >
      <CardContent className="p-3">
        <div className="flex items-start justify-between mb-2.5">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <Avatar className="size-10 border-2 border-emerald-500/30 shrink-0">
              <AvatarImage src={user.avatar || undefined} alt={user.name} />
              <AvatarFallback className="bg-emerald-500/20 text-emerald-400 font-semibold text-xs">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-white text-sm truncate">{user.name}</h3>
              <p className="text-xs text-slate-400 truncate">{user.email}</p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-7 text-slate-400 hover:text-white hover:bg-white/10 shrink-0"
              >
                <MoreVertical className="size-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-slate-900 border-slate-700">
              <DropdownMenuItem
                onClick={() => onEdit?.(user.id)}
                className="text-slate-300 hover:text-emerald-400 hover:bg-emerald-500/10 cursor-pointer"
              >
                <Edit className="size-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete?.(user.id)}
                className="text-slate-300 hover:text-red-400 hover:bg-red-500/10 cursor-pointer"
              >
                <Trash2 className="size-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap text-xs">
          <Badge
            variant="outline"
            className="border-emerald-500/30 bg-emerald-500/20 text-emerald-400 text-[10px] px-1.5 py-0"
          >
            {user.role}
          </Badge>
          <Badge
            variant="outline"
            className={cn(
              'text-[10px] px-1.5 py-0',
              user.status === 'active' && 'border-green-500/30 bg-green-500/20 text-green-400',
              user.status === 'inactive' && 'border-gray-500/30 bg-gray-500/20 text-gray-400',
              user.status === 'pending' && 'border-yellow-500/30 bg-yellow-500/20 text-yellow-400'
            )}
          >
            {user.status}
          </Badge>
          <span className="text-[10px] text-slate-500 ml-auto">{user.projectsCount} projects</span>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * User Management Table Component
 * Desktop: Full table layout with glassmorphism
 * Mobile: Card layout
 */
export function UserTable({ users, onEdit, onDelete }: UserTableProps) {
  if (users.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400 text-lg">No users found</p>
      </div>
    );
  }

  return (
    <>
      {/* Desktop Table */}
      <div className="hidden md:block">
        <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden shadow-2xl">
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-white/5">
                <TableHead className="text-slate-300 font-semibold">User</TableHead>
                <TableHead className="text-slate-300 font-semibold">Email</TableHead>
                <TableHead className="text-slate-300 font-semibold">Role</TableHead>
                <TableHead className="text-slate-300 font-semibold">Status</TableHead>
                <TableHead className="text-slate-300 font-semibold">Projects</TableHead>
                <TableHead className="text-slate-300 font-semibold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <DesktopUserRow key={user.id} user={user} onEdit={onEdit} onDelete={onDelete} />
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Mobile Cards - показываем ~2 карточки, остальные скроллятся */}
      <div
        className="md:hidden max-h-[300px] overflow-y-auto space-y-2.5 pr-1.5"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(16, 185, 129, 0.4) transparent',
        }}
      >
        {users.map((user) => (
          <MobileUserCard key={user.id} user={user} onEdit={onEdit} onDelete={onDelete} />
        ))}
      </div>
    </>
  );
}
