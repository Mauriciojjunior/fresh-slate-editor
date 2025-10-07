import { ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePermissions } from '@/hooks/usePermissions';
import { toast } from '@/hooks/use-toast';

interface RouteGuardProps {
  children: ReactNode;
  requireAdmin?: boolean;
  requireWrite?: boolean;
  requireDelete?: boolean;
  requireUserManagement?: boolean;
  redirectTo?: string;
}

export function RouteGuard({ 
  children,
  requireAdmin = false,
  requireWrite = false,
  requireDelete = false,
  requireUserManagement = false,
  redirectTo = '/'
}: RouteGuardProps) {
  const navigate = useNavigate();
  const { 
    canAccessAdminPanel, 
    canWrite, 
    canDelete, 
    canManageUsers,
    loading 
  } = usePermissions();

  useEffect(() => {
    if (loading) return;

    const hasPermission = 
      (!requireAdmin || canAccessAdminPanel) &&
      (!requireWrite || canWrite) &&
      (!requireDelete || canDelete) &&
      (!requireUserManagement || canManageUsers);

    if (!hasPermission) {
      toast({
        title: "Acesso negado",
        description: "Você não tem permissão para acessar esta página.",
        variant: "destructive",
      });
      navigate(redirectTo);
    }
  }, [
    loading,
    canAccessAdminPanel,
    canWrite,
    canDelete,
    canManageUsers,
    requireAdmin,
    requireWrite,
    requireDelete,
    requireUserManagement,
    navigate,
    redirectTo
  ]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Verificando permissões...</p>
        </div>
      </div>
    );
  }

  const hasPermission = 
    (!requireAdmin || canAccessAdminPanel) &&
    (!requireWrite || canWrite) &&
    (!requireDelete || canDelete) &&
    (!requireUserManagement || canManageUsers);

  if (!hasPermission) {
    return null;
  }

  return <>{children}</>;
}
