import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Package } from "lucide-react";
import { LoginForm } from "@/components/auth/LoginForm";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { PendingApprovalMessage } from "@/components/auth/PendingApprovalMessage";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

type AuthMode = "login" | "forgot";

export default function Auth() {
  const [mode, setMode] = useState<AuthMode>("login");
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const { data: userProfile, isLoading: profileLoading } = useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('approved')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id
  });

  useEffect(() => {
    // Redirect to home if user is authenticated and approved
    if (user && !loading && !profileLoading && userProfile?.approved) {
      navigate("/");
    }
  }, [user, loading, profileLoading, userProfile, navigate]);

  // Show loading while checking auth state
  if (loading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  // Show pending approval message if user is logged in but not approved
  if (user && userProfile && !userProfile.approved) {
    return <PendingApprovalMessage />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/20 px-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo and Title */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <Package className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">
            Sistema de Inventário
          </h1>
          <p className="text-muted-foreground">
            Gerencie seus itens de forma eficiente
          </p>
        </div>

        {/* Auth Forms */}
        {mode === "login" && (
          <LoginForm
            onToggleMode={() => {}}
            onForgotPassword={() => setMode("forgot")}
          />
        )}
        
        {mode === "forgot" && (
          <ForgotPasswordForm onBack={() => setMode("login")} />
        )}
      </div>
    </div>
  );
}