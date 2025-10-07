import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { Search, Edit, Trash2, Plus, Gamepad2 } from "lucide-react";
import { BoardGameForm } from "./BoardGameForm";

interface BoardGame {
  id: string;
  name: string;
  image_url: string | null;
}

export function BoardGameList() {
  const [games, setGames] = useState<BoardGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingGame, setEditingGame] = useState<BoardGame | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    try {
      const { data, error } = await supabase
        .from('board_games')
        .select('*')
        .order('name');

      if (error) throw error;
      setGames(data || []);
    } catch (error: any) {
      console.error('Error fetching board games:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os jogos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este jogo?")) return;

    try {
      const { error } = await supabase
        .from('board_games')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: "Jogo excluído com sucesso!",
      });
      
      fetchGames();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Não foi possível excluir o jogo.",
        variant: "destructive",
      });
    }
  };

  const filteredGames = games.filter(game => 
    game.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingGame(null);
    fetchGames();
  };

  if (showForm) {
    return (
      <BoardGameForm 
        game={editingGame}
        onSuccess={handleFormSuccess}
        onCancel={() => {
          setShowForm(false);
          setEditingGame(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Jogos de Tabuleiro</h2>
        <RoleGuard requireWrite>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Jogo
          </Button>
        </RoleGuard>
      </div>

      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome do jogo..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="aspect-square bg-muted rounded-t-lg"></div>
              <CardContent className="p-4">
                <div className="h-4 bg-muted rounded mb-2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredGames.length === 0 ? (
        <div className="text-center py-12">
          <Gamepad2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Nenhum jogo encontrado</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm ? "Tente ajustar sua busca" : "Comece adicionando seu primeiro jogo"}
          </p>
          <RoleGuard requireWrite>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Primeiro Jogo
            </Button>
          </RoleGuard>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredGames.map((game) => (
            <Card key={game.id} className="overflow-hidden">
              {game.image_url ? (
                <img
                  src={game.image_url}
                  alt={game.name}
                  className="aspect-square w-full object-cover"
                />
              ) : (
                <div className="aspect-square bg-muted flex items-center justify-center">
                  <Gamepad2 className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-3 line-clamp-2">{game.name}</h3>
                <RoleGuard requireWrite>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingGame(game);
                        setShowForm(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(game.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </RoleGuard>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}