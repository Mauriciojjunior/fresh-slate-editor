import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";
import { ReportsPage } from "@/components/reports/ReportsPage";

export default function Relatorios() {
  return (
    <ProtectedRoute>
      <AppLayout>
        <ReportsPage />
      </AppLayout>
    </ProtectedRoute>
  );
}