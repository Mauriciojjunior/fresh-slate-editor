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
      icon: Book,
      link: "/livros",
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
    {
      title: "Discos",
      description: "Coleção de vinis e CDs",
      count: counts.records,
      icon: Disc3,
      link: "/discos",
      color: "text-teal-600",
      bgColor: "bg-teal-50",
    },
    {
      title: "Bebidas",
      description: "Sua adega e bar",
      count: counts.drinks,
      icon: Wine,
      link: "/bebidas",
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Jogos",
      description: "Jogos de tabuleiro",
      count: counts.boardGames,
      icon: Gamepad2,
      link: "/jogos",
      color: "text-lime-600",
      bgColor: "bg-lime-50",
    },
  ];

  const totalItems = counts.books + counts.records + counts.drinks + counts.boardGames;

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-foreground">
          Meu Inventário
        </h1>
        <p className="text-xl text-muted-foreground">
          Gerencie suas coleções pessoais em um só lugar
        </p>
      </div>

      {/* Collection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {collections.map((collection) => {
          const Icon = collection.icon;
          
          return (
            <Card key={collection.title} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className={`p-3 rounded-lg ${collection.bgColor}`}>
                    <Icon className={`h-6 w-6 ${collection.color}`} />
                  </div>
                  <div className="text-right">
                    {loading ? (
                      <div className="animate-pulse bg-muted h-8 w-8 rounded"></div>
                    ) : (
                      <div className="text-3xl font-bold text-foreground">
                        {collection.count}
                      </div>
                    )}
                  </div>
                </div>
                <CardTitle className="text-lg">{collection.title}</CardTitle>
                <CardDescription>{collection.description}</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button asChild variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Link to={collection.link} className="flex items-center justify-center">
                    Ver Coleção
                    <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card 
          className="lg:col-span-2 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20 cursor-pointer hover:shadow-lg transition-all"
          onClick={() => setStatsModalOpen(true)}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-primary">Total de Itens</h3>
                <p className="text-muted-foreground">Clique para ver detalhes</p>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold text-primary">{totalItems}</div>
                {totalItems > 0 && (
                  <div className="flex items-center text-sm text-emerald-600 mt-1">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    Crescendo
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top 5 Drinks to Buy */}
        {drinksToBuy.length > 0 && (
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                  <ShoppingCart className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <CardTitle className="text-base text-green-800 dark:text-green-200">
                    Bebidas que precisam ser compradas
                  </CardTitle>
                  <CardDescription className="text-xs text-green-600 dark:text-green-400">
                    Top 5 mais urgentes
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {drinksToBuy.map((drink) => (
                <div 
                  key={drink.id}
                  className="flex items-start justify-between p-3 rounded-lg bg-white/50 dark:bg-green-950/10 border border-green-100 dark:border-green-900/30"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-green-900 dark:text-green-100 truncate">
                      {drink.name}
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-400">
                      {drink.drink_types.name}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-green-700 dark:text-green-300 ml-2">
                    <Clock className="h-3 w-3" />
                    <span className="whitespace-nowrap">
                      {formatDistanceToNow(new Date(drink.needs_to_buy_marked_at), {
                        addSuffix: true,
                        locale: ptBR
                      })}
                    </span>
                  </div>
                </div>
              ))}
              <Button 
                asChild 
                variant="outline" 
                size="sm"
                className="w-full mt-2 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/30"
              >
                <Link to="/bebidas">
                  Ver todas as bebidas
                  <ArrowRight className="h-3 w-3 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Recent Items Card */}
        <RecentItemsCard items={recentItems} />
      </div>

      {/* Evolution Chart */}
      {totalItems > 0 && monthlyData.length > 0 && (
        <div className="grid grid-cols-1 gap-6">
          <DashboardEvolutionChart data={monthlyData} />
        </div>
      )}

      {/* Quick Actions */}
      {totalItems === 0 && (
        <Card className="border-dashed border-2 border-muted-foreground/25">
          <CardContent className="p-8 text-center">
            <div className="space-y-4">
              <div className="text-6xl">📚</div>
              <h3 className="text-xl font-semibold">Comece sua primeira coleção</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Adicione seus primeiros itens e comece a organizar suas coleções pessoais
              </p>
              <div className="flex flex-wrap justify-center gap-3 mt-6">
                {collections.map((collection) => (
                  <Button key={collection.title} asChild variant="outline" size="sm">
                    <Link to={collection.link}>
                      <collection.icon className="h-4 w-4 mr-2" />
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
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold mb-2">Relatórios Detalhados</h3>
                <p className="text-muted-foreground">
                  Visualize gráficos e estatísticas das suas coleções
                </p>
              </div>
              <Button asChild>
                <Link to="/relatorios" className="flex items-center">
                  <BarChart3 className="h-4 w-4 mr-2" />
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