import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { AppLayout } from "@/components/layout/AppLayout";
import { UserManagement } from "@/components/admin/UserManagement";

export default function UsuariosAdmin() {
  return (
    <ProtectedRoute>
      <RouteGuard requireAdmin>
        <AppLayout>
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Gestão de Usuários</h1>
              <p className="text-muted-foreground">
                Gerencie usuários e suas permissões
              </p>
            </div>

            <UserManagement />
          </div>
        </AppLayout>
      </RouteGuard>
    </ProtectedRoute>
  );
}
