import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";
import { BookList } from "@/components/books/BookList";

export default function Livros() {
  return (
    <ProtectedRoute>
      <AppLayout>
        <div className="space-y-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold tracking-tight">Livros</h1>
            <p className="text-muted-foreground">
              Gerencie sua coleção de livros
            </p>
          </div>
          <BookList />
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}