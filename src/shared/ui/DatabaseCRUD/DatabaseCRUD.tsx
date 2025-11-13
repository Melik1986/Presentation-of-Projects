'use client';

import React, { useRef, useState, useMemo } from 'react';

import { cn } from '@/shared/lib/utils';

import { CreateUserModal } from './CreateUserModal';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { EditUserModal } from './EditUserModal';
import { useCRUDAnimations } from './hooks/useCRUDAnimations';
import { MOCK_USERS } from './types';
import { UserFilters } from './UserFilters';
import { UserTable } from './UserTable';

import type { CRUDFilters, DatabaseCRUDProps, DatabaseUser } from './types';

/**
 * Filter and sort users based on filters
 */
function filterAndSortUsers(users: DatabaseUser[], filters: CRUDFilters): DatabaseUser[] {
  let filtered = [...users];

  if (filters.role && filters.role !== 'all') {
    filtered = filtered.filter((user) => user.role === filters.role);
  }

  if (filters.status && filters.status !== 'all') {
    filtered = filtered.filter((user) => user.status === filters.status);
  }

  if (filters.searchQuery) {
    const query = filters.searchQuery.toLowerCase();
    filtered = filtered.filter(
      (user) => user.name.toLowerCase().includes(query) || user.email.toLowerCase().includes(query)
    );
  }

  if (filters.sortBy === 'name') {
    filtered.sort((a, b) => a.name.localeCompare(b.name));
  } else if (filters.sortBy === 'email') {
    filtered.sort((a, b) => a.email.localeCompare(b.email));
  } else {
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  return filtered;
}

/**
 * Database CRUD Admin Panel Component
 * Mock presentation with filters, table, and modals
 */
export function DatabaseCRUD({ className }: DatabaseCRUDProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [users, setUsers] = useState<DatabaseUser[]>(MOCK_USERS);
  const [filters, setFilters] = useState<CRUDFilters>({
    role: 'all',
    status: 'all',
    searchQuery: '',
    sortBy: 'recent',
  });

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<DatabaseUser | null>(null);

  const filteredUsers = useMemo(() => filterAndSortUsers(users, filters), [users, filters]);

  useCRUDAnimations(containerRef);

  const handleFilterChange = (newFilters: Partial<CRUDFilters>) => {
    setFilters({ ...filters, ...newFilters });
  };

  const handleCreateUser = (
    newUserData: Omit<DatabaseUser, 'id' | 'createdAt' | 'lastLogin' | 'projectsCount'>
  ) => {
    const newUser: DatabaseUser = {
      ...newUserData,
      id: `${users.length + 1}`,
      createdAt: new Date().toISOString(),
      lastLogin: null,
      projectsCount: 0,
    };

    setUsers([newUser, ...users]);
  };

  const handleEditClick = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (user) {
      setSelectedUser(user);
      setIsEditModalOpen(true);
    }
  };

  const handleEditSubmit = (updatedUser: DatabaseUser) => {
    setUsers(users.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
    setSelectedUser(null);
    setIsEditModalOpen(false);
  };

  const handleDeleteClick = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (user) {
      setSelectedUser(user);
      setIsDeleteModalOpen(true);
    }
  };

  const handleDeleteConfirm = () => {
    if (selectedUser) {
      setUsers(users.filter((u) => u.id !== selectedUser.id));
      setSelectedUser(null);
    }
  };

  return (
    <div ref={containerRef} className={cn('w-full h-full flex flex-col gap-4 p-4', className)}>
      <UserFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onCreateNew={() => setIsCreateModalOpen(true)}
      />

      <UserTable users={filteredUsers} onEdit={handleEditClick} onDelete={handleDeleteClick} />

      <CreateUserModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateUser}
      />

      <EditUserModal
        isOpen={isEditModalOpen}
        user={selectedUser}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedUser(null);
        }}
        onSubmit={handleEditSubmit}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        user={selectedUser}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedUser(null);
        }}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
