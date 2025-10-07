import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Package } from "lucide-react";
import { LoginForm } from "@/components/auth/LoginForm";
import { SignUpForm } from "@/components/auth/SignUpForm";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { useAuth } from "@/contexts/AuthContext";

type AuthMode = "login" | "signup" | "forgot";

export default function Auth() {
  const [mode, setMode] = useState<AuthMode>("login");
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to home if user is already authenticated
    if (user && !loading) {
      navigate("/");
    }
  }, [user, loading, navigate]);

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
            Gerencie seus itens de forma eficiente
          </p>
        </div>

        {/* Auth Forms */}
        {mode === "login" && (
          <LoginForm
            onToggleMode={() => setMode("signup")}
            onForgotPassword={() => setMode("forgot")}
          />
        )}
        
        {mode === "signup" && (
          <SignUpForm onToggleMode={() => setMode("login")} />
        )}
        
        {mode === "forgot" && (
          <ForgotPasswordForm onBack={() => setMode("login")} />
        )}
      </div>
    </div>
  );
}