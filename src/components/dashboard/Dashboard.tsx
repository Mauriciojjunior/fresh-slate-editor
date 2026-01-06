import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Book, Disc3, Wine, Gamepad2, ArrowRight, TrendingUp, BarChart3, ShoppingCart, Clock } from "lucide-react";
import { formatDistanceToNow, format, subMonths, startOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DashboardEvolutionChart } from "./DashboardEvolutionChart";
import { RecentItemsCard } from "./RecentItemsCard";
import { DetailedStatsModal } from "./DetailedStatsModal";
import { QuickAddButton } from "./QuickAddButton";
import { BookColorIcon } from "@/components/icons/BookColorIcon";
import { DiscColorIcon } from "@/components/icons/DiscColorIcon";
import { DrinkColorIcon } from "@/components/icons/DrinkColorIcon";
import { GameColorIcon } from "@/components/icons/GameColorIcon";

interface CollectionCounts {
  books: number;
  records: number;
  drinks: number;
  boardGames: number;
}

interface DrinkToBuy {
  id: string;
  name: string;
  needs_to_buy_marked_at: string;
  drink_types: {
    name: string;
  };
}

interface RecentItem {
  id: string;
  name: string;
  category: string;
  image_url: string | null;
  created_at: string;
}

interface MonthlyData {
  month: string;
  total: number;
}

export function Dashboard() {
  const [counts, setCounts] = useState<CollectionCounts>({
    books: 0,
    records: 0,
    drinks: 0,
    boardGames: 0,
  });
  const [drinksToBuy, setDrinksToBuy] = useState<DrinkToBuy[]>([]);
  const [recentItems, setRecentItems] = useState<RecentItem[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [statsModalOpen, setStatsModalOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchCounts();
    fetchDrinksToBuy();
    fetchRecentItems();
    fetchMonthlyEvolution();
  }, []);

  const fetchCounts = async () => {
    try {
      const [booksResult, recordsResult, drinksResult, gamesResult] = await Promise.all([
        supabase.from('books').select('id', { count: 'exact', head: true }),
        supabase.from('records').select('id', { count: 'exact', head: true }),
        supabase.from('drinks').select('id', { count: 'exact', head: true }),
        supabase.from('board_games').select('id', { count: 'exact', head: true }),
      ]);

      setCounts({
        books: booksResult.count || 0,
        records: recordsResult.count || 0,
        drinks: drinksResult.count || 0,
        boardGames: gamesResult.count || 0,
      });
    } catch (error: any) {
      console.error('Error fetching counts:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as estatísticas.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchDrinksToBuy = async () => {
    try {
      const { data, error } = await supabase
        .from('drinks')
        .select(`
          id,
          name,
          needs_to_buy_marked_at,
          drink_types (
            name
          )
        `)
        .eq('needs_to_buy', true)
        .not('needs_to_buy_marked_at', 'is', null)
        .order('needs_to_buy_marked_at', { ascending: true })
        .limit(5);

      if (error) throw error;
      setDrinksToBuy(data || []);
    } catch (error: any) {
      console.error('Error fetching drinks to buy:', error);
    }
  };

  const fetchRecentItems = async () => {
    try {
      const [books, records, drinks, games] = await Promise.all([
        supabase.from('books').select('id, title, image_url, created_at').order('created_at', { ascending: false }).limit(2),
        supabase.from('records').select('id, album, image_url, created_at').order('created_at', { ascending: false }).limit(2),
        supabase.from('drinks').select('id, name, image_url, created_at').order('created_at', { ascending: false }).limit(2),
        supabase.from('board_games').select('id, name, image_url, created_at').order('created_at', { ascending: false }).limit(2),
      ]);

      const allItems: RecentItem[] = [
        ...(books.data || []).map(item => ({ ...item, name: item.title, category: 'Livros' })),
        ...(records.data || []).map(item => ({ ...item, name: item.album, category: 'Discos' })),
        ...(drinks.data || []).map(item => ({ ...item, category: 'Bebidas' })),
        ...(games.data || []).map(item => ({ ...item, category: 'Jogos' })),
      ];

      allItems.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setRecentItems(allItems.slice(0, 5));
    } catch (error: any) {
      console.error('Error fetching recent items:', error);
    }
  };

  const fetchMonthlyEvolution = async () => {
    try {
      const months = [];
      for (let i = 5; i >= 0; i--) {
        const date = subMonths(new Date(), i);
        const monthStart = startOfMonth(date);
        months.push({
          date: monthStart,
          label: format(date, 'MMM', { locale: ptBR }),
        });
      }

      const monthlyTotals = await Promise.all(
        months.map(async ({ date, label }) => {
          const [books, records, drinks, games] = await Promise.all([
            supabase.from('books').select('id', { count: 'exact', head: true }).lte('created_at', date.toISOString()),
            supabase.from('records').select('id', { count: 'exact', head: true }).lte('created_at', date.toISOString()),
            supabase.from('drinks').select('id', { count: 'exact', head: true }).lte('created_at', date.toISOString()),
            supabase.from('board_games').select('id', { count: 'exact', head: true }).lte('created_at', date.toISOString()),
          ]);

          const total = (books.count || 0) + (records.count || 0) + (drinks.count || 0) + (games.count || 0);
          return { month: label, total };
        })
      );

      setMonthlyData(monthlyTotals);
    } catch (error: any) {
      console.error('Error fetching monthly evolution:', error);
    }
  };

  const collections = [
    {
      title: "Livros",
      description: "Sua biblioteca pessoal",
      count: counts.books,
      ColorIcon: BookColorIcon,
      icon: Book,
      link: "/livros",
      bgGradient: "bg-gradient-to-br from-purple-100 via-purple-50 to-pink-50",
    },
    {
      title: "Discos",
      description: "Coleção de vinis e CDs",
      count: counts.records,
      ColorIcon: DiscColorIcon,
      icon: Disc3,
      link: "/discos",
      bgGradient: "bg-gradient-to-br from-pink-100 via-pink-50 to-rose-50",
    },
    {
      title: "Bebidas",
      description: "Sua adega e bar",
      count: counts.drinks,
      ColorIcon: DrinkColorIcon,
      icon: Wine,
      link: "/bebidas",
      bgGradient: "bg-gradient-to-br from-emerald-100 via-green-50 to-teal-50",
    },
    {
      title: "Jogos",
      description: "Jogos de tabuleiro",
      count: counts.boardGames,
      ColorIcon: GameColorIcon,
      icon: Gamepad2,
      link: "/jogos",
      bgGradient: "bg-gradient-to-br from-blue-100 via-cyan-50 to-sky-50",
    },
  ];

  const totalItems = counts.books + counts.records + counts.drinks + counts.boardGames;

  return (
    <div className="space-y-4 pb-16">
      {/* Header */}
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold text-foreground">
          Meu Inventário
        </h1>
        <p className="text-sm text-muted-foreground">
          Gerencie suas coleções pessoais
        </p>
      </div>

      {/* Collection Cards - Compact */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {collections.map((collection, index) => {
          const ColorIcon = collection.ColorIcon;
          
          return (
            <Card 
              key={collection.title} 
              className="group hover:shadow-lg transition-all duration-200 hover:-translate-y-1 animate-fade-in overflow-hidden"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <CardHeader className="p-3 pb-2">
                <div className="flex items-center justify-between">
                  <div className={`h-12 w-12 rounded-lg ${collection.bgGradient} shadow p-2 group-hover:scale-105 transition-transform duration-200`}>
                    <ColorIcon />
                  </div>
                  <div className="text-right">
                    {loading ? (
                      <div className="animate-pulse bg-muted h-6 w-6 rounded"></div>
                    ) : (
                      <div className="text-2xl font-bold text-foreground">
                        {collection.count}
                      </div>
                    )}
                  </div>
                </div>
                <CardTitle className="text-sm mt-2">{collection.title}</CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <Button asChild variant="outline" size="sm" className="w-full text-xs group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-200">
                  <Link to={collection.link} className="flex items-center justify-center">
                    Ver Coleção
                    <ArrowRight className="h-3 w-3 ml-1 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Items - Main Area */}
        <Card className="lg:col-span-2">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <CardTitle className="text-sm">Últimos Itens Adicionados</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-2 space-y-2">
            {recentItems.length > 0 ? (
              recentItems.map((item) => (
                <div 
                  key={`${item.category}-${item.id}`}
                  className="flex items-center gap-2 p-2 rounded-md bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="h-10 w-10 rounded-md bg-background border overflow-hidden flex-shrink-0">
                    {item.image_url ? (
                      <img 
                        src={item.image_url} 
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-muted-foreground text-[10px]">
                        —
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-xs truncate">{item.name}</p>
                    <div className="flex items-center gap-1.5">
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                        {item.category}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground">
                        {formatDistanceToNow(new Date(item.created_at), {
                          addSuffix: true,
                          locale: ptBR
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                <Clock className="h-6 w-6 mx-auto mb-1 opacity-50" />
                <p className="text-xs">Nenhum item adicionado ainda</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Drinks to Buy - Sidebar */}
        {drinksToBuy.length > 0 && (
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800">
            <CardHeader className="p-4 pb-2">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4 text-green-600 dark:text-green-400" />
                <CardTitle className="text-sm text-green-800 dark:text-green-200">
                  Bebidas para comprar
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-2 space-y-2">
              {drinksToBuy.map((drink) => (
                <div 
                  key={drink.id}
                  className="flex items-center justify-between p-2 rounded-md bg-white/50 dark:bg-green-950/10 border border-green-100 dark:border-green-900/30"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-xs text-green-900 dark:text-green-100 truncate">
                      {drink.name}
                    </p>
                    <p className="text-[10px] text-green-600 dark:text-green-400">
                      {drink.drink_types.name}
                    </p>
                  </div>
                  <span className="text-[10px] text-green-700 dark:text-green-300 ml-2 whitespace-nowrap">
                    {formatDistanceToNow(new Date(drink.needs_to_buy_marked_at), {
                      addSuffix: true,
                      locale: ptBR
                    })}
                  </span>
                </div>
              ))}
              <Button 
                asChild 
                variant="outline" 
                size="sm"
                className="w-full text-xs border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/30"
              >
                <Link to="/bebidas">
                  Ver todas
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Evolution Chart */}
      {totalItems > 0 && monthlyData.length > 0 && (
        <DashboardEvolutionChart data={monthlyData} />
      )}

      {/* Quick Actions */}
      {totalItems === 0 && (
        <Card className="border-dashed border-2 border-muted-foreground/25">
          <CardContent className="p-6 text-center">
            <div className="space-y-3">
              <div className="text-4xl">📚</div>
              <h3 className="text-base font-semibold">Comece sua primeira coleção</h3>
              <p className="text-sm text-muted-foreground">
                Adicione seus primeiros itens
              </p>
              <div className="flex flex-wrap justify-center gap-2 mt-4">
                {collections.map((collection) => (
                  <Button key={collection.title} asChild variant="outline" size="sm" className="text-xs">
                    <Link to={collection.link}>
                      <collection.icon className="h-3 w-3 mr-1" />
                      {collection.title}
                    </Link>
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reports Section */}
      {totalItems > 0 && (
        <Card className="bg-gradient-to-r from-secondary/30 to-secondary/10 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold">Relatórios Detalhados</h3>
                <p className="text-xs text-muted-foreground">
                  Gráficos e estatísticas
                </p>
              </div>
              <Button asChild size="sm" className="text-xs">
                <Link to="/relatorios" className="flex items-center">
                  <BarChart3 className="h-3 w-3 mr-1" />
                  Ver Relatórios
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Add Button */}
      <QuickAddButton />

      {/* Detailed Stats Modal */}
      <DetailedStatsModal 
        open={statsModalOpen}
        onOpenChange={setStatsModalOpen}
        counts={counts}
        totalItems={totalItems}
      />
    </div>
  );
}