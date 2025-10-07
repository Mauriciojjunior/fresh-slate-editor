import { ROLE_PERMISSIONS, Permission } from '@/types/auth';
import { useUserRole } from './useUserRole';

export function usePermissions(): Permission & { loading: boolean } {
  const { role, loading } = useUserRole();

  const permissions = role ? ROLE_PERMISSIONS[role] : {
    canRead: false,
    canWrite: false,
    canDelete: false,
    canManageUsers: false,
    canAccessAdminPanel: false,
  };

  return {
    ...permissions,
    loading,
  };
}
