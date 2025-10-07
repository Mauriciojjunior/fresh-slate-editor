import { ReactNode } from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield } from 'lucide-react';

interface RoleGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
  requireAdmin?: boolean;
  requireWrite?: boolean;
  requireDelete?: boolean;
  requireUserManagement?: boolean;
}

export function RoleGuard({ 
  children, 
  fallback,
  requireAdmin = false,
  requireWrite = false,
  requireDelete = false,
  requireUserManagement = false
}: RoleGuardProps) {
  const { 
    canAccessAdminPanel, 
    canWrite, 
    canDelete, 
    canManageUsers,
    loading 
  } = usePermissions();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>
    );
  }

  const hasPermission = 
    (!requireAdmin || canAccessAdminPanel) &&
    (!requireWrite || canWrite) &&
    (!requireDelete || canDelete) &&
    (!requireUserManagement || canManageUsers);

  if (!hasPermission) {
    return fallback || (
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Você não tem permissão para acessar este conteúdo.
        </AlertDescription>
      </Alert>
    );
  }

  return <>{children}</>;
}
