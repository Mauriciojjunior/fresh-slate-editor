import { useState } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUserRole } from "@/hooks/useUserRole";
import { Settings, Users, Shield, Database, BarChart3, Book, Wine } from "lucide-react";
import { UserManagement } from "@/components/admin/UserManagement";
import { BookCategoryManager } from "@/components/admin/BookCategoryManager";
import { DrinkTypeManager } from "@/components/admin/DrinkTypeManager";

export default function Admin() {
  const { role } = useUserRole();
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <ProtectedRoute>
      <RouteGuard requireAdmin>
        <AppLayout>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Administração</h1>
                <p className="text-muted-foreground">
                  Painel administrativo do sistema
                </p>
              </div>
              <Badge variant="secondary" className="text-xs">
                <Shield className="mr-1 h-3 w-3" />
                Admin: {role}
              </Badge>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                <TabsTrigger value="users">Usuários</TabsTrigger>
                <TabsTrigger value="categories">Categorias de Livros</TabsTrigger>
                <TabsTrigger value="drinks">Tipos de Bebida</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Gerenciar Usuários
                      </CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">12</div>
                      <CardDescription className="mt-2">
                        Usuários cadastrados no sistema
                      </CardDescription>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-4 w-full"
                        onClick={() => setActiveTab("users")}
                      >
                        Gerenciar Usuários
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Configurações
                      </CardTitle>
                      <Settings className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">8</div>
                      <CardDescription className="mt-2">
                        Configurações do sistema
                      </CardDescription>
                      <Button variant="outline" size="sm" className="mt-4 w-full">
                        Configurar Sistema
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Database
                      </CardTitle>
                      <Database className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">99%</div>
                      <CardDescription className="mt-2">
                        Status da base de dados
                      </CardDescription>
                      <Button variant="outline" size="sm" className="mt-4 w-full">
                        Ver Logs
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Relatórios Avançados
                      </CardTitle>
                      <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">24</div>
                      <CardDescription className="mt-2">
                        Relatórios disponíveis
                      </CardDescription>
                      <Button variant="outline" size="sm" className="mt-4 w-full">
                        Ver Relatórios
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Permissões
                      </CardTitle>
                      <Shield className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">5</div>
                      <CardDescription className="mt-2">
                        Grupos de permissões
                      </CardDescription>
                      <Button variant="outline" size="sm" className="mt-4 w-full">
                        Gerenciar Roles
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="users">
                <UserManagement />
              </TabsContent>
              
              <TabsContent value="categories">
                <BookCategoryManager />
              </TabsContent>
              
              <TabsContent value="drinks">
                <DrinkTypeManager />
              </TabsContent>
            </Tabs>
          </div>
        </AppLayout>
      </RouteGuard>
    </ProtectedRoute>
  );
}