import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Activity, User, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ActivityLog {
  id: string;
  user_id: string;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  details: any;
  created_at: string;
  profiles?: {
    full_name: string | null;
  };
}

export function LogsViewer() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [userFilter, setUserFilter] = useState<string>("all");

  useEffect(() => {
    fetchLogs();
    
    // Subscribe to real-time updates
    const channel = supabase
      .channel('activity-logs-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'activity_logs'
        },
        (payload) => {
          setLogs(prev => [payload.new as ActivityLog, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchLogs = async () => {
    try {
      const { data: logsData, error } = await supabase
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      // Fetch user profiles separately
      const userIds = Array.from(new Set(logsData?.map(log => log.user_id).filter(Boolean)));
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', userIds);

      const profilesMap = new Map(profilesData?.map(p => [p.id, p.full_name]));

      const enrichedLogs: ActivityLog[] = (logsData || []).map(log => ({
        ...log,
        profiles: {
          full_name: profilesMap.get(log.user_id) || null
        }
      }));

      setLogs(enrichedLogs);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionColor = (action: string) => {
    if (action.includes('create') || action.includes('add')) return 'default';
    if (action.includes('update') || action.includes('edit')) return 'secondary';
    if (action.includes('delete') || action.includes('remove')) return 'destructive';
    return 'outline';
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAction = actionFilter === 'all' || log.action.includes(actionFilter);
    const matchesUser = userFilter === 'all' || log.user_id === userFilter;

    return matchesSearch && matchesAction && matchesUser;
  });

  const uniqueActions = Array.from(new Set(logs.map(log => log.action.split('_')[0])));
  const uniqueUsers = Array.from(new Set(logs.map(log => log.user_id)));

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
          <Activity className="h-5 w-5" />
          Logs em Tempo Real
        </CardTitle>
        <CardDescription>
          Acompanhe todas as ações realizadas no sistema
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrar por ação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as ações</SelectItem>
                {uniqueActions.map(action => (
                  <SelectItem key={action} value={action}>
                    {action.charAt(0).toUpperCase() + action.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-3">
              {filteredLogs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum log encontrado
                </div>
              ) : (
                filteredLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-start gap-3 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex-shrink-0 mt-1">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium truncate">
                          {log.profiles?.full_name || 'Usuário Desconhecido'}
                        </span>
                        <Badge variant={getActionColor(log.action)}>
                          {log.action}
                        </Badge>
                      </div>
                      {log.entity_type && (
                        <p className="text-sm text-muted-foreground">
                          {log.entity_type}
                        </p>
                      )}
                      <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(log.created_at), {
                          addSuffix: true,
                          locale: ptBR
                        })}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}
