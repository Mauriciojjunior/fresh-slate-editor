import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import Livros from "./pages/Livros";
import Discos from "./pages/Discos";
import Bebidas from "./pages/Bebidas";
import Jogos from "./pages/Jogos";
import Relatorios from "./pages/Relatorios";
import Admin from "./pages/Admin";
import Profile from "./pages/Profile";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={<Index />} />
            <Route path="/livros" element={<Livros />} />
            <Route path="/discos" element={<Discos />} />
            <Route path="/bebidas" element={<Bebidas />} />
            <Route path="/jogos" element={<Jogos />} />
            <Route path="/relatorios" element={<Relatorios />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/perfil" element={<Profile />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
