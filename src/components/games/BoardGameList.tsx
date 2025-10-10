import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { Edit, Trash2, Plus, Gamepad2 } from "lucide-react";
import { BoardGameForm } from "./BoardGameForm";
import { ItemDetailModal } from "@/components/shared/ItemDetailModal";
import { CollectionFilters, SortOption, ViewMode } from "@/components/shared/CollectionFilters";
import { EmptyState } from "@/components/shared/EmptyState";

interface BoardGame {
  id: string;
  name: string;
  image_url: string | null;
  created_at: string;
}

export function BoardGameList() {
  const [games, setGames] = useState<BoardGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("name-asc");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [showForm, setShowForm] = useState(false);
  const [editingGame, setEditingGame] = useState<BoardGame | null>(null);
  const [selectedGame, setSelectedGame] = useState<BoardGame | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    try {
      const { data, error } = await supabase
        .from('board_games')
        .select('*');

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

  // Apply filters and sorting
  const filteredAndSortedGames = games
    .filter(game => game.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      switch (sortBy) {
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'recent':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        default:
          return 0;
      }
    });

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

  const renderGridView = () => (
    <div className="collection-grid">
      {filteredAndSortedGames.map((game) => (
        <Card key={game.id} className="collection-card" onClick={() => setSelectedGame(game)}>
          {game.image_url ? (
            <div className="h-[220px] flex items-center justify-center bg-muted">
              <img
                src={game.image_url}
                alt={game.name}
                className="collection-thumbnail"
              />
            </div>
          ) : (
            <div className="h-[220px] bg-muted flex items-center justify-center">
              <Gamepad2 className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
          <CardContent className="collection-card-content">
            <h3 className="font-semibold text-lg line-clamp-2">{game.name}</h3>
            <RoleGuard requireWrite>
              <TooltipProvider>
                <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                  <Tooltip>
                    <TooltipTrigger asChild>
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
                    </TooltipTrigger>
                    <TooltipContent>Editar jogo</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(game.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Excluir jogo</TooltipContent>
                  </Tooltip>
                </div>
              </TooltipProvider>
            </RoleGuard>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderListView = () => (
    <div className="collection-list">
      {filteredAndSortedGames.map((game) => (
        <div 
          key={game.id} 
          className="collection-list-item"
          onClick={() => setSelectedGame(game)}
        >
          <div className="collection-list-image">
            {game.image_url ? (
              <img
                src={game.image_url}
                alt={game.name}
                className="w-full h-full object-contain"
              />
            ) : (
              <Gamepad2 className="h-8 w-8 text-muted-foreground" />
            )}
          </div>
          <div className="collection-list-content">
            <h3 className="font-semibold text-base line-clamp-1">{game.name}</h3>
          </div>
          <RoleGuard requireWrite>
            <TooltipProvider>
              <div className="collection-list-actions" onClick={(e) => e.stopPropagation()}>
                <Tooltip>
                  <TooltipTrigger asChild>
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
                  </TooltipTrigger>
                  <TooltipContent>Editar jogo</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(game.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Excluir jogo</TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>
          </RoleGuard>
        </div>
      ))}
    </div>
  );

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

      <CollectionFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        sortBy={sortBy}
        onSortChange={setSortBy}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        activeFiltersCount={searchTerm ? 1 : 0}
        onClearFilters={() => setSearchTerm("")}
        searchPlaceholder="Buscar por nome do jogo..."
      />

      {loading ? (
        <div className="collection-grid">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="animate-pulse collection-card">
              <div className="h-[220px] bg-muted"></div>
              <CardContent className="collection-card-content">
                <div className="h-4 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredAndSortedGames.length === 0 ? (
        <EmptyState
          icon={Gamepad2}
          title={searchTerm ? "Nenhum jogo encontrado" : "Monte sua ludoteca"}
          description={
            searchTerm
              ? "Tente ajustar sua busca para encontrar o jogo desejado."
              : "Adicione seu primeiro jogo de tabuleiro e organize sua coleção."
          }
          actionLabel="Adicionar Primeiro Jogo"
          onAction={() => setShowForm(true)}
          showAction={games.length === 0}
        />
      ) : (
        viewMode === 'grid' ? renderGridView() : renderListView()
      )}

      {selectedGame && (
        <ItemDetailModal
          open={!!selectedGame}
          onOpenChange={(open) => !open && setSelectedGame(null)}
          title={selectedGame.name}
          imageUrl={selectedGame.image_url}
          imagePlaceholder={<Gamepad2 className="h-24 w-24 text-muted-foreground" />}
          fields={[
            { label: "Nome", value: selectedGame.name },
          ]}
        />
      )}
    </div>
  );
}
