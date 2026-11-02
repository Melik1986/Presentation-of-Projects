'use client';

import { Search, UserPlus } from 'lucide-react';

import { Button } from '@/shared/lib/ui/button';
import { Card } from '@/shared/lib/ui/card';
import { Input } from '@/shared/lib/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/lib/ui/select';

import type { UserFiltersProps, UserRole } from './types';

/**
 * Role Filter Select
 */
function RoleSelect({
  value,
  onChange,
}: {
  value: UserRole | 'all';
  onChange: (v: UserRole | 'all') => void;
}) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as UserRole | 'all')}>
      <SelectTrigger className="w-[140px] bg-white/10 border-white/10 text-white text-xs">
        <SelectValue placeholder="Role" />
      </SelectTrigger>
      <SelectContent className="bg-slate-900/95 backdrop-blur-xl border-white/10 text-white">
        <SelectItem value="all">All</SelectItem>
        <SelectItem value="admin">Admin</SelectItem>
        <SelectItem value="user">User</SelectItem>
        <SelectItem value="guest">Guest</SelectItem>
      </SelectContent>
    </Select>
  );
}

/**
 * Sort Dropdown
 */
function SortDropdown({
  value,
  onChange,
}: {
  value: 'recent' | 'name' | 'email';
  onChange: (v: 'recent' | 'name' | 'email') => void;
}) {
  const sortOptions = [
    { value: 'recent' as const, label: 'Recent' },
    { value: 'name' as const, label: 'Name' },
    { value: 'email' as const, label: 'Email' },
  ];

  return (
    <Select value={value} onValueChange={(v) => onChange(v as 'recent' | 'name' | 'email')}>
      <SelectTrigger className="w-[110px] bg-white/10 border-white/10 text-white text-xs">
        <SelectValue placeholder="Sort" />
      </SelectTrigger>
      <SelectContent className="bg-slate-900/95 backdrop-blur-xl border-white/10 text-white">
        {sortOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

/**
 * Search Input
 */
function SearchInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex-1 relative h-10">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none z-10" />
      <Input
        type="text"
        placeholder="Search by name or email..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-10 pl-10 pr-4 bg-white/10 border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
      />
    </div>
  );
}

/**
 * User Filters Component
 * Adapted from ProjectsFilter with Role filters, Search, Sort, and Create button
 */
export function UserFilters({ filters, onFilterChange, onCreateNew }: UserFiltersProps) {
  return (
    <Card className="rounded-xl p-3 bg-white/5 backdrop-blur-xl border-white/10">
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Поиск слева */}
        <div className="flex-1">
          <SearchInput
            value={filters.searchQuery || ''}
            onChange={(v) => onFilterChange({ searchQuery: v })}
          />
        </div>

        {/* Фильтры и кнопка справа */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <RoleSelect value={filters.role ?? 'all'} onChange={(v) => onFilterChange({ role: v })} />
          <SortDropdown
            value={filters.sortBy || 'recent'}
            onChange={(v) => onFilterChange({ sortBy: v })}
          />
          {onCreateNew && (
            <Button
              onClick={onCreateNew}
              className="bg-emerald-500 hover:bg-emerald-600 text-white whitespace-nowrap shrink-0"
            >
              <UserPlus className="size-4 mr-2" />
              Add User
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
