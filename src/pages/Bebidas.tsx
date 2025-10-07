import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";
import { DrinkList } from "@/components/drinks/DrinkList";
import { DrinkHistory } from "@/components/drinks/DrinkHistory";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wine, History } from "lucide-react";

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
          
          <Tabs defaultValue="list" className="w-full">
            <TabsList>
              <TabsTrigger value="list" className="flex items-center gap-2">
                <Wine className="h-4 w-4" />
                Lista de Bebidas
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2">
                <History className="h-4 w-4" />
                Histórico de Estoque
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="list" className="mt-6">
              <DrinkList />
            </TabsContent>
            
            <TabsContent value="history" className="mt-6">
              <DrinkHistory />
            </TabsContent>
          </Tabs>
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}