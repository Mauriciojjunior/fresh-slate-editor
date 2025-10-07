import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { UserRole } from "@/types/auth";
import { User, Crown, Shield, Eye, Edit, Trash2, RefreshCw } from "lucide-react";
import { AddUserDialog } from "./AddUserDialog";
import { EditUserDialog } from "./EditUserDialog";
import { DeleteUserDialog } from "./DeleteUserDialog";

interface UserWithRole {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  created_at: string;
}

export function UserManagement() {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<UserWithRole | null>(null);
  const [deletingUser, setDeletingUser] = useState<UserWithRole | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Fetch users from auth admin (requires service role key)
      const { data: authUsersData, error: authError } = await supabase.auth.admin.listUsers();
      
      if (authError) throw authError;

      // Fetch profiles and roles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, created_at');

      if (profilesError) throw profilesError;

      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      // Combine data
      const usersWithRoles: UserWithRole[] = authUsersData.users.map(authUser => {
        const profile = profilesData.find(p => p.id === authUser.id);
        const userRole = rolesData.find(r => r.user_id === authUser.id);
        
        return {
          id: authUser.id,
          email: authUser.email || 'Sem email',
          full_name: profile?.full_name || null,
          role: (userRole?.role as UserRole) || 'user',
          created_at: authUser.created_at,
        };
      });

      setUsers(usersWithRoles);
    } catch (error) {
      console.error('Error fetching users:', error);
      // Fallback to profiles only if auth admin fails
      try {
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name, created_at');

        if (profilesError) throw profilesError;

        const { data: rolesData, error: rolesError } = await supabase
          .from('user_roles')
          .select('user_id, role');

        if (rolesError) throw rolesError;

        const usersWithRoles: UserWithRole[] = profilesData.map(profile => {
          const userRole = rolesData.find(role => role.user_id === profile.id);
          return {
            id: profile.id,
            email: 'Email não disponível',
            full_name: profile.full_name,
            role: (userRole?.role as UserRole) || 'user',
            created_at: profile.created_at,
          };
        });

        setUsers(usersWithRoles);
      } catch (fallbackError) {
        toast({
          title: "Erro",
          description: "Não foi possível carregar os usuários.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user: UserWithRole) => {
    setEditingUser(user);
  };

  const handleDeleteUser = (user: UserWithRole) => {
    setDeletingUser(user);
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return <Crown className="h-3 w-3" />;
      case 'user':
        return <Shield className="h-3 w-3" />;
      case 'read_only':
        return <Eye className="h-3 w-3" />;
      default:
        return <User className="h-3 w-3" />;
    }
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'Administrador';
      case 'user':
        return 'Usuário';
      case 'read_only':
        return 'Somente Leitura';
      default:
        return 'Usuário';
    }
  };

  const getRoleVariant = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'default' as const;
      case 'user':
        return 'secondary' as const;
      case 'read_only':
        return 'outline' as const;
      default:
        return 'secondary' as const;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Carregando usuários...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Gerenciamento de Usuários</CardTitle>
              <CardDescription>
                Gerencie os usuários e suas permissões no sistema
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button onClick={fetchUsers} variant="outline" size="sm">
                <RefreshCw className="mr-2 h-4 w-4" />
                Atualizar
              </Button>
              <AddUserDialog onUserAdded={fetchUsers} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {users.length === 0 && !loading ? (
            <div className="text-center py-8">
              <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhum usuário encontrado</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Perfil</TableHead>
                  <TableHead>Data de Criação</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <span>{user.full_name || 'Sem nome'}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {user.email}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getRoleVariant(user.role)}>
                        {getRoleIcon(user.role)}
                        <span className="ml-1">{getRoleLabel(user.role)}</span>
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(user.created_at).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditUser(user)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteUser(user)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <EditUserDialog
        user={editingUser}
        open={!!editingUser}
        onOpenChange={(open) => !open && setEditingUser(null)}
        onUserUpdated={fetchUsers}
      />

      <DeleteUserDialog
        user={deletingUser}
        open={!!deletingUser}
        onOpenChange={(open) => !open && setDeletingUser(null)}
        onUserDeleted={fetchUsers}
      />
    </div>
  );
}