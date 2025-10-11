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
import BebidasAdmin from "./pages/admin/BebidasAdmin";
import LivrosAdmin from "./pages/admin/LivrosAdmin";
import UsuariosAdmin from "./pages/admin/UsuariosAdmin";
import Profile from "./pages/Profile";
import Exportacao from "./pages/Exportacao";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={<Index />} />
            <Route path="/livros" element={<Livros />} />
            <Route path="/discos" element={<Discos />} />
            <Route path="/bebidas" element={<Bebidas />} />
            <Route path="/jogos" element={<Jogos />} />
            <Route path="/relatorios" element={<Relatorios />} />
            <Route path="/exportacao" element={<Exportacao />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/bebidas" element={<BebidasAdmin />} />
            <Route path="/admin/livros" element={<LivrosAdmin />} />
            <Route path="/admin/usuarios" element={<UsuariosAdmin />} />
            <Route path="/perfil" element={<Profile />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </TooltipProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
