import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Package } from "lucide-react";
import { LoginForm } from "@/components/auth/LoginForm";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

type AuthMode = "login" | "forgot" | "reset";

export default function Auth() {
  const [mode, setMode] = useState<AuthMode>("login");
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if this is a password recovery session
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setMode("reset");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    // Redirect to home if user is authenticated and not in reset mode
    if (user && !loading && mode !== "reset") {
      navigate("/");
    }
  }, [user, loading, navigate, mode]);

  const handleResetSuccess = async () => {
    await supabase.auth.signOut();
    setMode("login");
  };

  // Show loading while checking auth state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
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
            {mode === "reset" 
              ? "Redefina sua senha de acesso" 
              : "Gerencie seus itens de forma eficiente"}
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

        {mode === "reset" && (
          <ResetPasswordForm onSuccess={handleResetSuccess} />
        )}
      </div>
    </div>
  );
}