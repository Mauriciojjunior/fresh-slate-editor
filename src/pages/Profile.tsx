import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { usePermissions } from "@/hooks/usePermissions";
import { User, Mail, Shield, Calendar } from "lucide-react";

export default function Profile() {
  const { user } = useAuth();
  const { role } = useUserRole();
  const permissions = usePermissions();

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <ProtectedRoute>
      <AppLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Meu Perfil</h1>
            <p className="text-muted-foreground">
              Gerencie suas informações pessoais
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Informações Pessoais
                </CardTitle>
                <CardDescription>
                  Suas informações de perfil
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={user?.email || ''}
                      disabled
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="created">Membro desde</Label>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <Input
                      id="created"
                      value={user?.created_at ? formatDate(user.created_at) : ''}
                      disabled
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Nível de acesso</Label>
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <Badge variant="secondary" className="w-full justify-center">
                      {role === 'admin' ? 'Administrador' : role === 'user' ? 'Usuário' : 'Somente Leitura'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Permissões
                </CardTitle>
                <CardDescription>
                  Suas permissões no sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Visualizar conteúdo</span>
                    <Badge variant="outline" className={
                      permissions.canRead
                        ? "bg-green-500/10 text-green-700 dark:text-green-400"
                        : "bg-red-500/10 text-red-700 dark:text-red-400"
                    }>
                      {permissions.canRead ? 'Permitido' : 'Negado'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Criar e editar</span>
                    <Badge variant="outline" className={
                      permissions.canWrite
                        ? "bg-green-500/10 text-green-700 dark:text-green-400"
                        : "bg-red-500/10 text-red-700 dark:text-red-400"
                    }>
                      {permissions.canWrite ? 'Permitido' : 'Negado'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Excluir itens</span>
                    <Badge variant="outline" className={
                      permissions.canDelete
                        ? "bg-green-500/10 text-green-700 dark:text-green-400"
                        : "bg-red-500/10 text-red-700 dark:text-red-400"
                    }>
                      {permissions.canDelete ? 'Permitido' : 'Negado'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Gerenciar usuários</span>
                    <Badge variant="outline" className={
                      permissions.canManageUsers
                        ? "bg-green-500/10 text-green-700 dark:text-green-400"
                        : "bg-red-500/10 text-red-700 dark:text-red-400"
                    }>
                      {permissions.canManageUsers ? 'Permitido' : 'Negado'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Painel administrativo</span>
                    <Badge variant="outline" className={
                      permissions.canAccessAdminPanel
                        ? "bg-green-500/10 text-green-700 dark:text-green-400"
                        : "bg-red-500/10 text-red-700 dark:text-red-400"
                    }>
                      {permissions.canAccessAdminPanel ? 'Permitido' : 'Negado'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Ações da Conta</CardTitle>
              <CardDescription>
                Gerencie as configurações da sua conta
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full sm:w-auto">
                Alterar Senha
              </Button>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}
