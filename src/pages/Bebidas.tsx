import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";
import { DrinkList } from "@/components/drinks/DrinkList";

export default function Bebidas() {
  return (
    <ProtectedRoute>
      <AppLayout>
        <div className="space-y-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold tracking-tight">Bebidas</h1>
            <p className="text-muted-foreground">
              Gerencie sua coleção de bebidas
            </p>
          </div>
          <DrinkList />
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}