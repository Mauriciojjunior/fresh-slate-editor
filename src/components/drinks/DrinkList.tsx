import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { Edit, Trash2, Plus, Wine, Clock } from "lucide-react";
import { DrinkForm } from "./DrinkForm";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ItemDetailModal } from "@/components/shared/ItemDetailModal";
import { CollectionFilters, SortOption, ViewMode } from "@/components/shared/CollectionFilters";
import { EmptyState } from "@/components/shared/EmptyState";

interface Drink {
  id: string;
  name: string;
  type_id: string;
  manufacturing_location: string | null;
  grape_type: string | null;
  image_url: string | null;
  needs_to_buy: boolean;
  is_finished: boolean;
  created_at: string;
  needs_to_buy_marked_at: string | null;
  needs_to_buy_unmarked_at: string | null;
  is_finished_marked_at: string | null;
  is_finished_unmarked_at: string | null;
  drink_types: {
    name: string;
  };
}

export function DrinkList() {
  const [drinks, setDrinks] = useState<Drink[]>([]);
  const [drinkTypes, setDrinkTypes] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState<SortOption>("name-asc");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [showForm, setShowForm] = useState(false);
  const [editingDrink, setEditingDrink] = useState<Drink | null>(null);
  const [selectedDrink, setSelectedDrink] = useState<Drink | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchDrinks();
    fetchDrinkTypes();
  }, []);

  const fetchDrinkTypes = async () => {
    try {
      const { data, error } = await supabase
        .from('drink_types')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setDrinkTypes(data || []);
    } catch (error: any) {
      console.error('Error fetching drink types:', error);
    }
  };

  const fetchDrinks = async () => {
    try {
      const { data, error } = await supabase
        .from('drinks')
        .select(`
          id,
          name,
          type_id,
          manufacturing_location,
          grape_type,
          image_url,
          needs_to_buy,
          is_finished,
          created_at,
          needs_to_buy_marked_at,
          needs_to_buy_unmarked_at,
          is_finished_marked_at,
          is_finished_unmarked_at,
          drink_types (
            name
          )
        `);

      if (error) throw error;
      setDrinks(data || []);
    } catch (error: any) {
      console.error('Error fetching drinks:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as bebidas.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta bebida?")) return;

    try {
      const { error } = await supabase
        .from('drinks')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: "Bebida excluída com sucesso!",
      });
      
      fetchDrinks();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Não foi possível excluir a bebida.",
        variant: "destructive",
      });
    }
  };

  // Apply filters and sorting
  const filteredAndSortedDrinks = drinks
    .filter(drink => {
      const matchesSearch = 
        drink.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        drink.drink_types.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (drink.manufacturing_location && drink.manufacturing_location.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (drink.grape_type && drink.grape_type.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesType = typeFilter === "all" || drink.type_id === typeFilter;
      
      const matchesStatus = 
        statusFilter === "all" ||
        (statusFilter === "available" && !drink.is_finished && !drink.needs_to_buy) ||
        (statusFilter === "buy" && drink.needs_to_buy) ||
        (statusFilter === "finished" && drink.is_finished);
      
      return matchesSearch && matchesType && matchesStatus;
    })
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
    setEditingDrink(null);
    fetchDrinks();
  };

  const getStatusBadge = (drink: Drink) => {
    if (drink.is_finished) {
      return <Badge variant="destructive">Acabou</Badge>;
    }
    if (drink.needs_to_buy) {
      return (
        <div className="flex items-center gap-2">
          <Badge variant="secondary">Comprar</Badge>
          {drink.needs_to_buy_marked_at && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    Marcado {formatDistanceToNow(new Date(drink.needs_to_buy_marked_at), {
                      addSuffix: true,
                      locale: ptBR
                    })}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      );
    }
    return <Badge variant="default">Disponível</Badge>;
  };

  const activeFiltersCount = 
    (searchTerm ? 1 : 0) + 
    (typeFilter !== "all" ? 1 : 0) +
    (statusFilter !== "all" ? 1 : 0);

  const handleClearFilters = () => {
    setSearchTerm("");
    setTypeFilter("all");
    setStatusFilter("all");
  };

  if (showForm) {
    return (
      <DrinkForm 
        drink={editingDrink}
        onSuccess={handleFormSuccess}
        onCancel={() => {
          setShowForm(false);
          setEditingDrink(null);
        }}
      />
    );
  }

  const renderGridView = () => (
    <div className="collection-grid">
      {filteredAndSortedDrinks.map((drink) => (
        <Card key={drink.id} className="collection-card" onClick={() => setSelectedDrink(drink)}>
          {drink.image_url ? (
            <div className="h-[220px] flex items-center justify-center bg-muted">
              <img
                src={drink.image_url}
                alt={drink.name}
                className="collection-thumbnail"
              />
            </div>
          ) : (
            <div className="h-[220px] bg-muted flex items-center justify-center">
              <Wine className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
          <CardContent className="collection-card-content">
            <h3 className="font-semibold text-lg line-clamp-2">{drink.name}</h3>
            <p className="text-muted-foreground text-sm">{drink.drink_types.name}</p>
            {drink.manufacturing_location && (
              <p className="text-sm text-muted-foreground line-clamp-1">
                {drink.manufacturing_location}
              </p>
            )}
            <div>
              {getStatusBadge(drink)}
            </div>
            <RoleGuard requireWrite>
              <TooltipProvider>
                <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingDrink(drink);
                          setShowForm(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Editar bebida</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(drink.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Excluir bebida</TooltipContent>
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
      {filteredAndSortedDrinks.map((drink) => (
        <div 
          key={drink.id} 
          className="collection-list-item"
          onClick={() => setSelectedDrink(drink)}
        >
          <div className="collection-list-image">
            {drink.image_url ? (
              <img
                src={drink.image_url}
                alt={drink.name}
                className="w-full h-full object-contain"
              />
            ) : (
              <Wine className="h-8 w-8 text-muted-foreground" />
            )}
          </div>
          <div className="collection-list-content">
            <h3 className="font-semibold text-base line-clamp-1">{drink.name}</h3>
            <p className="text-sm text-muted-foreground">{drink.drink_types.name}</p>
            <div className="flex items-center gap-2">
              {getStatusBadge(drink)}
            </div>
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
                        setEditingDrink(drink);
                        setShowForm(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Editar bebida</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(drink.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Excluir bebida</TooltipContent>
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
        <h2 className="text-2xl font-bold">Bebidas</h2>
        <RoleGuard requireWrite>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Bebida
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
        filters={[
          {
            label: "Tipo",
            value: typeFilter,
            options: [
              { label: "Todos", value: "all" },
              ...drinkTypes.map(type => ({ label: type.name, value: type.id }))
            ],
            onChange: setTypeFilter
          },
          {
            label: "Status",
            value: statusFilter,
            options: [
              { label: "Todos", value: "all" },
              { label: "Disponível", value: "available" },
              { label: "Comprar", value: "buy" },
              { label: "Acabou", value: "finished" }
            ],
            onChange: setStatusFilter
          }
        ]}
        activeFiltersCount={activeFiltersCount}
        onClearFilters={handleClearFilters}
        searchPlaceholder="Buscar por nome, tipo, local ou uva..."
      />

      {loading ? (
        <div className="collection-grid">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="animate-pulse collection-card">
              <div className="h-[220px] bg-muted"></div>
              <CardContent className="collection-card-content">
                <div className="h-4 bg-muted rounded"></div>
                <div className="h-3 bg-muted rounded"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredAndSortedDrinks.length === 0 ? (
        <EmptyState
          icon={Wine}
          title={searchTerm || typeFilter !== "all" || statusFilter !== "all" ? "Nenhuma bebida encontrada" : "Inicie sua adega"}
          description={
            searchTerm || typeFilter !== "all" || statusFilter !== "all"
              ? "Tente ajustar os filtros ou fazer uma nova busca."
              : "Adicione sua primeira bebida e comece a organizar sua coleção pessoal."
          }
          actionLabel="Adicionar Primeira Bebida"
          onAction={() => setShowForm(true)}
          showAction={drinks.length === 0}
        />
      ) : (
        viewMode === 'grid' ? renderGridView() : renderListView()
      )}

      {selectedDrink && (
        <ItemDetailModal
          open={!!selectedDrink}
          onOpenChange={(open) => !open && setSelectedDrink(null)}
          title={selectedDrink.name}
          imageUrl={selectedDrink.image_url}
          imagePlaceholder={<Wine className="h-24 w-24 text-muted-foreground" />}
          fields={[
            { label: "Nome", value: selectedDrink.name },
            { label: "Tipo", value: <Badge variant="secondary">{selectedDrink.drink_types.name}</Badge> },
            ...(selectedDrink.manufacturing_location ? [{ label: "Local de Fabricação", value: selectedDrink.manufacturing_location }] : []),
            ...(selectedDrink.grape_type ? [{ label: "Tipo de Uva", value: selectedDrink.grape_type }] : []),
            { 
              label: "Status", 
              value: getStatusBadge(selectedDrink)
            },
          ]}
        />
      )}
    </div>
  );
}
