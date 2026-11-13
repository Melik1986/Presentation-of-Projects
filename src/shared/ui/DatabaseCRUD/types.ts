/**
 * Types for Database CRUD Admin Panel
 */

/**
 * User Role in the system
 */
export type UserRole = 'admin' | 'user' | 'guest';

/**
 * User Status
 */
export type UserStatus = 'active' | 'inactive' | 'pending';

/**
 * Sort options for the user table
 */
export type UserSortBy = 'recent' | 'name' | 'email';

/**
 * Role filter including the "all" sentinel
 */
export type UserRoleFilter = UserRole | 'all';

/**
 * Database User Interface
 */
export interface DatabaseUser {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  lastLogin: string | null;
  projectsCount: number;
}

/**
 * CRUD Filters
 */
export interface CRUDFilters {
  role?: UserRoleFilter;
  status?: UserStatus | 'all';
  searchQuery?: string;
  sortBy?: UserSortBy;
}

/**
 * Props for DatabaseCRUD component
 */
export interface DatabaseCRUDProps {
  className?: string;
}

/**
 * Props for UserTable component
 */
export interface UserTableProps {
  users: DatabaseUser[];
  onEdit?: (userId: string) => void;
  onDelete?: (userId: string) => void;
}

/**
 * Props for UserFilters component
 */
export interface UserFiltersProps {
  filters: CRUDFilters;
  onFilterChange: (filters: Partial<CRUDFilters>) => void;
  onCreateNew?: () => void;
}

/**
 * Props for CreateUserModal component
 */
export interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (user: Omit<DatabaseUser, 'id' | 'createdAt' | 'lastLogin' | 'projectsCount'>) => void;
}

/**
 * Props for EditUserModal component
 */
export interface EditUserModalProps {
  isOpen: boolean;
  user: DatabaseUser | null;
  onClose: () => void;
  onSubmit: (user: DatabaseUser) => void;
}

/**
 * Props for DeleteConfirmModal component
 */
export interface DeleteConfirmModalProps {
  isOpen: boolean;
  user: DatabaseUser | null;
  onClose: () => void;
  onConfirm: () => void;
}

/**
 * Mock Database Users for presentation
 */
export const MOCK_USERS: DatabaseUser[] = [
  {
    id: '1',
    name: 'Alex Johnson',
    email: 'alex.johnson@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
    role: 'admin',
    status: 'active',
    createdAt: '2024-01-15T10:30:00Z',
    lastLogin: '2024-11-13T08:45:00Z',
    projectsCount: 12,
  },
  {
    id: '2',
    name: 'Sarah Williams',
    email: 'sarah.w@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    role: 'user',
    status: 'active',
    createdAt: '2024-02-20T14:20:00Z',
    lastLogin: '2024-11-12T16:30:00Z',
    projectsCount: 8,
  },
  {
    id: '3',
    name: 'Michael Chen',
    email: 'mchen@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael',
    role: 'user',
    status: 'active',
    createdAt: '2024-03-10T09:15:00Z',
    lastLogin: '2024-11-13T07:20:00Z',
    projectsCount: 5,
  },
  {
    id: '4',
    name: 'Emily Davis',
    email: 'emily.davis@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily',
    role: 'admin',
    status: 'active',
    createdAt: '2024-01-05T11:00:00Z',
    lastLogin: '2024-11-11T19:45:00Z',
    projectsCount: 15,
  },
  {
    id: '5',
    name: 'David Martinez',
    email: 'd.martinez@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
    role: 'user',
    status: 'inactive',
    createdAt: '2024-04-22T13:40:00Z',
    lastLogin: '2024-10-28T12:10:00Z',
    projectsCount: 3,
  },
  {
    id: '6',
    name: 'Jessica Taylor',
    email: 'j.taylor@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jessica',
    role: 'guest',
    status: 'pending',
    createdAt: '2024-11-10T08:00:00Z',
    lastLogin: null,
    projectsCount: 0,
  },
  {
    id: '7',
    name: 'Robert Anderson',
    email: 'rob.anderson@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Robert',
    role: 'user',
    status: 'active',
    createdAt: '2024-05-18T16:25:00Z',
    lastLogin: '2024-11-13T09:15:00Z',
    projectsCount: 7,
  },
  {
    id: '8',
    name: 'Maria Garcia',
    email: 'maria.g@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria',
    role: 'user',
    status: 'active',
    createdAt: '2024-06-30T10:50:00Z',
    lastLogin: '2024-11-12T14:00:00Z',
    projectsCount: 4,
  },
  {
    id: '9',
    name: 'James Wilson',
    email: 'jwilson@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=James',
    role: 'guest',
    status: 'pending',
    createdAt: '2024-11-12T15:30:00Z',
    lastLogin: null,
    projectsCount: 0,
  },
  {
    id: '10',
    name: 'Lisa Thompson',
    email: 'lisa.t@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa',
    role: 'user',
    status: 'inactive',
    createdAt: '2024-07-14T12:00:00Z',
    lastLogin: '2024-09-20T11:30:00Z',
    projectsCount: 2,
  },
];

/**
 * Role color mapping
 */
export const ROLE_COLORS: Record<UserRole, string> = {
  admin: '#10b981',
  user: '#3b82f6',
  guest: '#6b7280',
};

/**
 * Status color mapping
 */
export const STATUS_COLORS: Record<UserStatus, string> = {
  active: '#10b981',
  inactive: '#6b7280',
  pending: '#eab308',
};
