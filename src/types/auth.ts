export type UserRole = 'admin' | 'user' | 'read_only';

export interface Permission {
  canRead: boolean;
  canWrite: boolean;
  canDelete: boolean;
  canManageUsers: boolean;
  canAccessAdminPanel: boolean;
}

export const ROLE_PERMISSIONS: Record<UserRole, Permission> = {
  admin: {
    canRead: true,
    canWrite: true,
    canDelete: true,
    canManageUsers: true,
    canAccessAdminPanel: true,
  },
  user: {
    canRead: true,
    canWrite: true,
    canDelete: true,
    canManageUsers: false,
    canAccessAdminPanel: false,
  },
  read_only: {
    canRead: true,
    canWrite: false,
    canDelete: false,
    canManageUsers: false,
    canAccessAdminPanel: false,
  },
};
