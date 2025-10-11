import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Shield, Users, Crown, Eye } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface UserWithRole {
  id: string;
  full_name: string | null;
  role: string;
  email?: string;
}

interface RoleGroup {
  role: string;
  users: UserWithRole[];
  permissions: string[];
  icon: any;
  color: string;
}

export function PermissionGroupsManager() {
  const [roleGroups, setRoleGroups] = useState<RoleGroup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRoleGroups();
  }, []);

  const fetchRoleGroups = async () => {
    try {
      const { data: userRoles, error } = await supabase
        .from('user_roles')
        .select('role, user_id');

      if (error) throw error;

      // Get profiles separately
      const userIds = userRoles?.map(ur => ur.user_id) || [];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', userIds);

      const profilesMap = new Map(profilesData?.map(p => [p.id, p.full_name || null]));

      // Get emails from auth.users
      const { data: authData } = await supabase.auth.admin.listUsers();
      
      const emailMap = new Map<string, string>();
      const usersList = authData?.users || [];
      for (const user of usersList) {
        if (user?.id && user?.email) {
          emailMap.set(user.id, user.email);
        }
      }

      const groupedByRole = userRoles?.reduce((acc, ur) => {
        if (!acc[ur.role]) {
          acc[ur.role] = [];
        }
        acc[ur.role].push({
          id: ur.user_id,
          full_name: profilesMap.get(ur.user_id) || null,
          role: ur.role,
          email: emailMap.get(ur.user_id) || 'Email não disponível'
        });
        return acc;
      }, {} as Record<string, UserWithRole[]>);

      const groups: RoleGroup[] = [
        {
          role: 'admin',
          users: groupedByRole?.admin || [],
          permissions: ['Gerenciar usuários', 'Configurações do sistema', 'Acesso total', 'Gerenciar categorias', 'Ver logs'],
          icon: Crown,
          color: 'text-yellow-500'
        },
        {
          role: 'user',
          users: groupedByRole?.user || [],
          permissions: ['Ler dados', 'Criar itens', 'Editar próprios itens', 'Deletar próprios itens'],
          icon: Users,
          color: 'text-blue-500'
        },
        {
          role: 'read_only',
          users: groupedByRole?.read_only || [],
          permissions: ['Apenas visualização', 'Sem permissões de escrita'],
          icon: Eye,
          color: 'text-gray-500'
        }
      ];

      setRoleGroups(groups);
    } catch (error) {
      console.error('Error fetching role groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      admin: 'Administrador',
      user: 'Usuário',
      read_only: 'Somente Leitura'
    };
    return labels[role] || role;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Grupos de Permissões
        </CardTitle>
        <CardDescription>
          Visualize os usuários e suas permissões por grupo
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {roleGroups.map((group, index) => {
            const Icon = group.icon;
            return (
              <AccordionItem key={group.role} value={`role-${index}`}>
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3">
                    <div className={`${group.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold">{getRoleLabel(group.role)}</div>
                      <div className="text-sm text-muted-foreground">
                        {group.users.length} {group.users.length === 1 ? 'usuário' : 'usuários'}
                      </div>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 pt-4">
                    <div>
                      <h4 className="text-sm font-medium mb-2">Permissões:</h4>
                      <div className="flex flex-wrap gap-2">
                        {group.permissions.map((permission) => (
                          <Badge key={permission} variant="secondary">
                            {permission}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium mb-2">Usuários:</h4>
                      {group.users.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          Nenhum usuário neste grupo
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {group.users.map((user) => (
                            <div
                              key={user.id}
                              className="flex items-center gap-3 p-3 rounded-lg border bg-card"
                            >
                              <Avatar className="h-8 w-8">
                                <AvatarFallback>
                                  {user.full_name?.charAt(0).toUpperCase() || 'U'}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">
                                  {user.full_name || 'Sem nome'}
                                </p>
                                <p className="text-sm text-muted-foreground truncate">
                                  {user.email || 'Email não disponível'}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </CardContent>
    </Card>
  );
}
