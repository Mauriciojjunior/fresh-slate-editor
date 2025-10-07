import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";
import { BoardGameList } from "@/components/games/BoardGameList";

export default function Jogos() {
  return (
    <ProtectedRoute>
      <AppLayout>
        <div className="space-y-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold tracking-tight">Jogos de Tabuleiro</h1>
            <p className="text-muted-foreground">
              Gerencie sua coleção de jogos de tabuleiro
            </p>
          </div>
          <BoardGameList />
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}