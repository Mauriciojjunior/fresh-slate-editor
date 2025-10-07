import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";
import { RecordList } from "@/components/records/RecordList";

export default function Discos() {
  return (
    <ProtectedRoute>
      <AppLayout>
        <div className="space-y-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold tracking-tight">Discos</h1>
            <p className="text-muted-foreground">
              Gerencie sua coleção de discos
            </p>
          </div>
          <RecordList />
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}