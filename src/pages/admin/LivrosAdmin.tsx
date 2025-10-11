import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { AppLayout } from "@/components/layout/AppLayout";
import { BookCategoryManager } from "@/components/admin/BookCategoryManager";

export default function LivrosAdmin() {
  return (
    <ProtectedRoute>
      <RouteGuard requireAdmin>
        <AppLayout>
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Gestão de Livros</h1>
              <p className="text-muted-foreground">
                Gerencie categorias de livros
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Categorias de Livros</h2>
              <BookCategoryManager />
            </div>
          </div>
        </AppLayout>
      </RouteGuard>
    </ProtectedRoute>
  );
}
