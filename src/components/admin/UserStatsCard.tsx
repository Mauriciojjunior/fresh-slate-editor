import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Clock, TrendingUp, User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface UserStats {
  id: string;
  full_name: string | null;
  email: string;
  last_login_at: string | null;
  action_count: number;
  role: string;
}

export function UserStatsCard() {
  const [userStats, setUserStats] = useState<UserStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserStats();
  }, []);

  const fetchUserStats = async () => {
    try {
      // Fetch profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, last_login_at, action_count')
        .order('last_login_at', { ascending: false, nullsFirst: false });

      if (profilesError) throw profilesError;

      // Fetch user roles
      const profileIds = profiles?.map(p => p.id) || [];
      const { data: userRolesData } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .in('user_id', profileIds);

      const rolesMap = new Map(userRolesData?.map(ur => [ur.user_id, ur.role]) || []);

      // Get emails from auth.users
      const { data: authData } = await supabase.auth.admin.listUsers();
      
      const emailMap = new Map<string, string>();
      const usersList = authData?.users || [];
      for (const user of usersList) {
        if (user?.id && user?.email) {
          emailMap.set(user.id, user.email);
        }
      }

      const stats: UserStats[] = profiles?.map(p => ({
        id: p.id,
        full_name: p.full_name,
        email: emailMap.get(p.id) || 'Email não disponível',
        last_login_at: p.last_login_at,
        action_count: p.action_count || 0,
        role: rolesMap.get(p.id) || 'user'
      })) || [];

      setUserStats(stats);
    } catch (error) {
      console.error('Error fetching user stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    if (role === 'admin') return 'default';
    if (role === 'read_only') return 'secondary';
    return 'outline';
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      admin: 'Admin',
      user: 'Usuário',
      read_only: 'Leitura'
    };
    return labels[role] || role;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Estatísticas de Usuários
        </CardTitle>
        <CardDescription>
          Último login e ações realizadas por usuário
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {userStats.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum usuário encontrado
            </div>
          ) : (
            userStats.map((stat) => (
              <div
                key={stat.id}
                className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <Avatar className="h-10 w-10">
                  <AvatarFallback>
                    {stat.full_name?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium truncate">
                      {stat.full_name || 'Sem nome'}
                    </p>
                    <Badge variant={getRoleBadgeVariant(stat.role)} className="text-xs">
                      {getRoleLabel(stat.role)}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {stat.email}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {stat.last_login_at ? (
                      formatDistanceToNow(new Date(stat.last_login_at), {
                        addSuffix: true,
                        locale: ptBR
                      })
                    ) : (
                      'Nunca'
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-xs font-medium">
                    <User className="h-3 w-3" />
                    {stat.action_count} ações
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
