import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, Clock, Mail } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface PendingUser {
  id: string;
  full_name: string | null;
  created_at: string;
  email?: string;
}

export function UserApprovalCard() {
  const queryClient = useQueryClient();
  const [approvingId, setApprovingId] = useState<string | null>(null);

  const { data: pendingUsers, isLoading } = useQuery({
    queryKey: ['pending-users'],
    queryFn: async () => {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, created_at, approved')
        .eq('approved', false)
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Get emails from auth.users
      const userIds = profiles?.map(p => p.id) || [];
      const usersWithEmails: PendingUser[] = [];

      for (const profile of profiles || []) {
        const { data: { user } } = await supabase.auth.admin.getUserById(profile.id);
        usersWithEmails.push({
          ...profile,
          email: user?.email
        });
      }

      return usersWithEmails;
    }
  });

  const approveMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from('profiles')
        .update({ approved: true })
        .eq('id', userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-users'] });
      toast({
        title: "Usuário aprovado",
        description: "O usuário agora pode acessar o sistema.",
      });
      setApprovingId(null);
    },
    onError: () => {
      toast({
        title: "Erro ao aprovar usuário",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
      setApprovingId(null);
    }
  });

  const handleApprove = (userId: string) => {
    setApprovingId(userId);
    approveMutation.mutate(userId);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Solicitações Pendentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Solicitações Pendentes
        </CardTitle>
        <CardDescription>
          Usuários aguardando aprovação para acessar o sistema
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!pendingUsers || pendingUsers.length === 0 ? (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Não há solicitações pendentes no momento.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">
            {pendingUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">
                      {user.full_name || "Nome não informado"}
                    </p>
                    <Badge variant="secondary">
                      <Clock className="h-3 w-3 mr-1" />
                      Pendente
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-3 w-3" />
                    {user.email}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Solicitado em: {new Date(user.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <Button
                  onClick={() => handleApprove(user.id)}
                  disabled={approvingId === user.id}
                  size="sm"
                >
                  {approvingId === user.id ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Aprovando...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Aprovar
                    </>
                  )}
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
