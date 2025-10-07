import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";
import { Book, Disc3, Wine, Gamepad2, BarChart3 } from "lucide-react";

interface BooksByCategory {
  name: string;
  value: number;
}

interface RecordsByFormat {
  format: string;
  count: number;
}

interface DrinksByType {
  name: string;
  count: number;
}

interface ReportData {
  booksByCategory: BooksByCategory[];
  recordsByFormat: RecordsByFormat[];
  drinksByType: DrinksByType[];
  totalGames: number;
  totalBooks: number;
  totalRecords: number;
  totalDrinks: number;
}

const COLORS = [
  'hsl(142, 71%, 45%)',
  'hsl(160, 60%, 45%)', 
  'hsl(173, 58%, 39%)',
  'hsl(197, 37%, 24%)',
  'hsl(120, 100%, 25%)',
  'hsl(142, 71%, 65%)',
  'hsl(160, 60%, 65%)',
  'hsl(173, 58%, 59%)',
];

export function ReportsPage() {
  const [data, setData] = useState<ReportData>({
    booksByCategory: [],
    recordsByFormat: [],
    drinksByType: [],
    totalGames: 0,
    totalBooks: 0,
    totalRecords: 0,
    totalDrinks: 0,
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      setLoading(true);

      // Fetch books by category
      const { data: booksData, error: booksError } = await supabase
        .from('books')
        .select(`
          book_categories (name)
        `);

      if (booksError) throw booksError;

      // Fetch records by format
      const { data: recordsData, error: recordsError } = await supabase
        .from('records')
        .select('format');

      if (recordsError) throw recordsError;

      // Fetch drinks by type
      const { data: drinksData, error: drinksError } = await supabase
        .from('drinks')
        .select(`
          drink_types (name)
        `);

      if (drinksError) throw drinksError;

      // Fetch total games
      const { count: gamesCount, error: gamesError } = await supabase
        .from('board_games')
        .select('*', { count: 'exact', head: true });

      if (gamesError) throw gamesError;

      // Process books by category
      const booksByCategory = booksData?.reduce((acc: { [key: string]: number }, book: any) => {
        const categoryName = book.book_categories?.name || 'Sem categoria';
        acc[categoryName] = (acc[categoryName] || 0) + 1;
        return acc;
      }, {});

      const booksCategoryData = Object.entries(booksByCategory || {}).map(([name, value]) => ({
        name,
        value: value as number,
      }));

      // Process records by format
      const recordsByFormat = recordsData?.reduce((acc: { [key: string]: number }, record: any) => {
        const format = record.format === 'vinil' ? 'Vinil' : 'CD';
        acc[format] = (acc[format] || 0) + 1;
        return acc;
      }, {});

      const recordsFormatData = Object.entries(recordsByFormat || {}).map(([format, count]) => ({
        format,
        count: count as number,
      }));

      // Process drinks by type
      const drinksByType = drinksData?.reduce((acc: { [key: string]: number }, drink: any) => {
        const typeName = drink.drink_types?.name || 'Sem tipo';
        acc[typeName] = (acc[typeName] || 0) + 1;
        return acc;
      }, {});

      const drinksTypeData = Object.entries(drinksByType || {}).map(([name, count]) => ({
        name,
        count: count as number,
      }));

      setData({
        booksByCategory: booksCategoryData,
        recordsByFormat: recordsFormatData,
        drinksByType: drinksTypeData,
        totalGames: gamesCount || 0,
        totalBooks: booksData?.length || 0,
        totalRecords: recordsData?.length || 0,
        totalDrinks: drinksData?.length || 0,
      });

    } catch (error: any) {
      console.error('Error fetching report data:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados do relatório.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const totalItems = data.totalBooks + data.totalRecords + data.totalDrinks + data.totalGames;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Relatórios</h1>
          <p className="text-muted-foreground">
            Análise detalhada das suas coleções
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-64 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Relatórios</h1>
        <p className="text-muted-foreground">
          Análise detalhada das suas coleções
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Geral</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{totalItems}</div>
            <p className="text-xs text-muted-foreground">Itens cadastrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Livros</CardTitle>
            <Book className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalBooks}</div>
            <p className="text-xs text-muted-foreground">Livros cadastrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Discos</CardTitle>
            <Disc3 className="h-4 w-4 text-teal-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalRecords}</div>
            <p className="text-xs text-muted-foreground">Discos cadastrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bebidas</CardTitle>
            <Wine className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalDrinks}</div>
            <p className="text-xs text-muted-foreground">Bebidas cadastradas</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Books by Category - Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Book className="h-5 w-5 text-emerald-600" />
              Livros por Categoria
            </CardTitle>
            <CardDescription>
              Distribuição dos livros por categoria
            </CardDescription>
          </CardHeader>
          <CardContent>
            {data.booksByCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={data.booksByCategory}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {data.booksByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Nenhum livro cadastrado
              </div>
            )}
          </CardContent>
        </Card>

        {/* Records by Format - Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Disc3 className="h-5 w-5 text-teal-600" />
              Discos por Formato
            </CardTitle>
            <CardDescription>
              Quantidade de discos por formato
            </CardDescription>
          </CardHeader>
          <CardContent>
            {data.recordsByFormat.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.recordsByFormat}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="format" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(173, 58%, 39%)" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Nenhum disco cadastrado
              </div>
            )}
          </CardContent>
        </Card>

        {/* Drinks by Type - Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wine className="h-5 w-5 text-green-600" />
              Bebidas por Tipo
            </CardTitle>
            <CardDescription>
              Quantidade de bebidas por tipo
            </CardDescription>
          </CardHeader>
          <CardContent>
            {data.drinksByType.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.drinksByType}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(142, 71%, 45%)" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Nenhuma bebida cadastrada
              </div>
            )}
          </CardContent>
        </Card>

        {/* Games Total - Simple Display */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gamepad2 className="h-5 w-5 text-lime-600" />
              Jogos de Tabuleiro
            </CardTitle>
            <CardDescription>
              Total de jogos cadastrados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex flex-col items-center justify-center">
              <div className="text-6xl font-bold text-primary mb-4">
                {data.totalGames}
              </div>
              <p className="text-lg text-muted-foreground">
                {data.totalGames === 1 ? 'Jogo cadastrado' : 'Jogos cadastrados'}
              </p>
              {data.totalGames > 0 && (
                <div className="mt-4 text-center">
                  <p className="text-sm text-muted-foreground">
                    Representa {totalItems > 0 ? ((data.totalGames / totalItems) * 100).toFixed(1) : 0}% 
                    do total da coleção
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Empty State */}
      {totalItems === 0 && (
        <Card className="border-dashed border-2 border-muted-foreground/25">
          <CardContent className="p-12 text-center">
            <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Nenhum dado para exibir</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Comece adicionando itens às suas coleções para ver relatórios detalhados aqui.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}