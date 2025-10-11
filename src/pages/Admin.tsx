import { useState } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUserRole } from "@/hooks/useUserRole";
import { Settings, Users, Shield, Database, BarChart3, Activity, CheckCircle2 } from "lucide-react";
import { LogsViewer } from "@/components/admin/LogsViewer";
import { PermissionGroupsManager } from "@/components/admin/PermissionGroupsManager";
import { UserStatsCard } from "@/components/admin/UserStatsCard";

export default function Admin() {
  const { role } = useUserRole();
  const [activeTab, setActiveTab] = useState("overview");
  const [systemStatus] = useState({
    database: { status: 'online', health: 99 },
    users: { status: 'online', total: 12 },
    settings: { status: 'configured', items: 8 }
  });

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
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                <TabsTrigger value="logs">Logs</TabsTrigger>
                <TabsTrigger value="permissions">Permissões</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.location.href = '/admin/usuarios'}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Usuários Ativos
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        {systemStatus.users.status === 'online' && (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        )}
                        <Users className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{systemStatus.users.total}</div>
                      <CardDescription className="mt-2 flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                        Sistema operacional
                      </CardDescription>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-4 w-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.location.href = '/admin/usuarios';
                        }}
                      >
                        Gerenciar Usuários
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.location.href = '/admin/livros'}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Categorias de Livros
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-blue-500" />
                        <Settings className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">Configurado</div>
                      <CardDescription className="mt-2 flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                        Gerenciar categorias
                      </CardDescription>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-4 w-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.location.href = '/admin/livros';
                        }}
                      >
                        Gerenciar Livros
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.location.href = '/admin/bebidas'}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Tipos de Bebidas
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-purple-500" />
                        <Database className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">Configurado</div>
                      <CardDescription className="mt-2 flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                        Bebidas e uvas
                      </CardDescription>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-4 w-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.location.href = '/admin/bebidas';
                        }}
                      >
                        Gerenciar Bebidas
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Atividade Recente
                      </CardTitle>
                      <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">Real-time</div>
                      <CardDescription className="mt-2">
                        Monitoramento em tempo real
                      </CardDescription>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-4 w-full"
                        onClick={() => setActiveTab("logs")}
                      >
                        Ver Atividades
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
                      <div className="text-2xl font-bold">3</div>
                      <CardDescription className="mt-2">
                        Grupos de permissões
                      </CardDescription>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-4 w-full"
                        onClick={() => setActiveTab("permissions")}
                      >
                        Gerenciar Roles
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid gap-4 md:grid-cols-1">
                  <UserStatsCard />
                </div>
              </TabsContent>
              
              <TabsContent value="logs">
                <LogsViewer />
              </TabsContent>

              <TabsContent value="permissions">
                <PermissionGroupsManager />
              </TabsContent>
            </Tabs>
          </div>
        </AppLayout>
      </RouteGuard>
    </ProtectedRoute>
  );
}