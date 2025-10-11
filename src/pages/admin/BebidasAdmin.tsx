import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { AppLayout } from "@/components/layout/AppLayout";
import { DrinkTypeManager } from "@/components/admin/DrinkTypeManager";
import { GrapeTypeManager } from "@/components/admin/GrapeTypeManager";

export default function BebidasAdmin() {
  return (
    <ProtectedRoute>
      <RouteGuard requireAdmin>
        <AppLayout>
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Gestão de Bebidas</h1>
              <p className="text-muted-foreground">
                Gerencie tipos de bebidas e tipos de uva
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2 grid-cols-1">
              <div className="space-y-4 min-w-0">
                <h2 className="text-xl font-semibold">Tipos de Bebida</h2>
                <DrinkTypeManager />
              </div>
              
              <div className="space-y-4 min-w-0">
                <h2 className="text-xl font-semibold">Tipos de Uva</h2>
                <GrapeTypeManager />
              </div>
            </div>
          </div>
        </AppLayout>
      </RouteGuard>
    </ProtectedRoute>
  );
}
