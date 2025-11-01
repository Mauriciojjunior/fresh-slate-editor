import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Clock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

export function PendingApprovalMessage() {
  const { signOut } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/20 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center">
            <Clock className="h-12 w-12 text-warning" />
          </div>
          <CardTitle className="text-2xl font-bold">Aguardando Aprovação</CardTitle>
          <CardDescription>
            Seu cadastro está sendo analisado
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Mail className="h-4 w-4" />
            <AlertDescription>
              Seu cadastro foi enviado com sucesso! Um administrador irá revisar e aprovar seu acesso em breve.
              Você receberá uma notificação quando sua conta for aprovada.
            </AlertDescription>
          </Alert>
          
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={() => signOut()}
          >
            Sair
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
