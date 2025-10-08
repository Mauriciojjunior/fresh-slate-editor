import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { History, ShoppingCart, Wine, Clock } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Drink {
  id: string;
  name: string;
  needs_to_buy_marked_at: string | null;
  needs_to_buy_unmarked_at: string | null;
  is_finished_marked_at: string | null;
  is_finished_unmarked_at: string | null;
  drink_types: {
    name: string;
  };
}

interface TimelineEvent {
  drinkId: string;
  drinkName: string;
  drinkType: string;
  timestamp: string;
  type: 'needs_to_buy_marked' | 'needs_to_buy_unmarked' | 'is_finished_marked' | 'is_finished_unmarked';
}

export function DrinkHistory() {
  const [drinks, setDrinks] = useState<Drink[]>([]);
  const [loading, setLoading] = useState(true);
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
        description: "Não foi possível carregar o histórico.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getTimelineEvents = (): TimelineEvent[] => {
    const events: TimelineEvent[] = [];

    drinks.forEach(drink => {
      if (drink.needs_to_buy_marked_at) {
        events.push({
          drinkId: drink.id,
          drinkName: drink.name,
          drinkType: drink.drink_types.name,
          timestamp: drink.needs_to_buy_marked_at,
          type: 'needs_to_buy_marked'
        });
      }
      if (drink.needs_to_buy_unmarked_at) {
        events.push({
          drinkId: drink.id,
          drinkName: drink.name,
          drinkType: drink.drink_types.name,
          timestamp: drink.needs_to_buy_unmarked_at,
          type: 'needs_to_buy_unmarked'
        });
      }
      if (drink.is_finished_marked_at) {
        events.push({
          drinkId: drink.id,
          drinkName: drink.name,
          drinkType: drink.drink_types.name,
          timestamp: drink.is_finished_marked_at,
          type: 'is_finished_marked'
        });
      }
      if (drink.is_finished_unmarked_at) {
        events.push({
          drinkId: drink.id,
          drinkName: drink.name,
          drinkType: drink.drink_types.name,
          timestamp: drink.is_finished_unmarked_at,
          type: 'is_finished_unmarked'
        });
      }
    });

    return events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  };

  const getEventLabel = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'needs_to_buy_marked':
        return { label: 'Marcado para Comprar', variant: 'secondary' as const, icon: ShoppingCart };
      case 'needs_to_buy_unmarked':
        return { label: 'Desmarcado para Comprar', variant: 'outline' as const, icon: ShoppingCart };
      case 'is_finished_marked':
        return { label: 'Marcado como Acabou', variant: 'destructive' as const, icon: Wine };
      case 'is_finished_unmarked':
        return { label: 'Desmarcado como Acabou', variant: 'default' as const, icon: Wine };
    }
  };

  const timelineEvents = getTimelineEvents();

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-4 bg-muted rounded mb-2 w-1/3"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (timelineEvents.length === 0) {
    return (
      <div className="text-center py-12">
        <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">Nenhum histórico disponível</h3>
        <p className="text-muted-foreground">
          O histórico de estoque será exibido quando houver alterações nas bebidas
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="relative">
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border"></div>
        <div className="space-y-4">
          {timelineEvents.map((event, index) => {
            const eventInfo = getEventLabel(event.type);
            const EventIcon = eventInfo.icon;
            
            return (
              <div key={`${event.drinkId}-${event.type}-${index}`} className="relative pl-14">
                <div className="absolute left-0 top-2 p-2 bg-background border-2 border-border rounded-full">
                  <EventIcon className="h-4 w-4" />
                </div>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold truncate">{event.drinkName}</h3>
                          <Badge variant="outline" className="shrink-0">{event.drinkType}</Badge>
                        </div>
                        <div className="mb-2">
                          <Badge variant={eventInfo.variant}>{eventInfo.label}</Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-3.5 w-3.5" />
                          <span>
                            {format(new Date(event.timestamp), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
