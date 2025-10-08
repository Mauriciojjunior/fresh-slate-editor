import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { Search, Edit, Trash2, Plus, Wine, Clock } from "lucide-react";
import { DrinkForm } from "./DrinkForm";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ItemDetailModal } from "@/components/shared/ItemDetailModal";

interface Drink {
  id: string;
  name: string;
  type_id: string;
  manufacturing_location: string | null;
  grape_type: string | null;
  image_url: string | null;
  needs_to_buy: boolean;
  is_finished: boolean;
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
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingDrink, setEditingDrink] = useState<Drink | null>(null);
  const [selectedDrink, setSelectedDrink] = useState<Drink | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchDrinks();
  }, []);

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
          needs_to_buy_marked_at,
          needs_to_buy_unmarked_at,
          is_finished_marked_at,
          is_finished_unmarked_at,
          drink_types (
            name
          )
        `)
        .order('name');

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

  const filteredDrinks = drinks.filter(drink => 
    drink.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    drink.drink_types.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (drink.manufacturing_location && drink.manufacturing_location.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (drink.grape_type && drink.grape_type.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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

      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome, tipo, local ou uva..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-48 bg-muted rounded-t-lg"></div>
              <CardContent className="p-4">
                <div className="h-4 bg-muted rounded mb-2"></div>
                <div className="h-3 bg-muted rounded mb-1"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredDrinks.length === 0 ? (
        <div className="text-center py-12">
          <Wine className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Nenhuma bebida encontrada</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm ? "Tente ajustar sua busca" : "Comece adicionando sua primeira bebida"}
          </p>
          <RoleGuard requireWrite>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Primeira Bebida
            </Button>
          </RoleGuard>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDrinks.map((drink) => (
            <Card key={drink.id} className="overflow-hidden cursor-pointer hover-scale" onClick={() => setSelectedDrink(drink)}>
              {drink.image_url ? (
                <img
                  src={drink.image_url}
                  alt={drink.name}
                  className="h-48 w-full object-cover"
                />
              ) : (
                <div className="h-48 bg-muted flex items-center justify-center">
                  <Wine className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-1">{drink.name}</h3>
                <p className="text-muted-foreground mb-1">{drink.drink_types.name}</p>
                {drink.manufacturing_location && (
                  <p className="text-sm text-muted-foreground mb-1">
                    Local: {drink.manufacturing_location}
                  </p>
                )}
                {drink.grape_type && (
                  <p className="text-sm text-muted-foreground mb-2">
                    Uva: {drink.grape_type}
                  </p>
                )}
                <div className="mb-3">
                  {getStatusBadge(drink)}
                </div>
                <RoleGuard requireWrite>
                  <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
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
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(drink.id)}
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