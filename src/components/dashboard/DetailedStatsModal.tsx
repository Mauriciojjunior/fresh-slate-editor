import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Book, Disc3, Wine, Gamepad2, TrendingUp, Calendar } from "lucide-react";

interface CollectionCounts {
  books: number;
  records: number;
  drinks: number;
  boardGames: number;
}

interface DetailedStatsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  counts: CollectionCounts;
  totalItems: number;
}

export function DetailedStatsModal({ open, onOpenChange, counts, totalItems }: DetailedStatsModalProps) {
  const stats = [
    { 
      label: "Livros", 
      value: counts.books, 
      percentage: totalItems > 0 ? ((counts.books / totalItems) * 100).toFixed(1) : "0",
      icon: Book,
      color: "text-emerald-600 dark:text-emerald-400",
      bgColor: "bg-emerald-50 dark:bg-emerald-950/20"
    },
    { 
      label: "Discos", 
      value: counts.records, 
      percentage: totalItems > 0 ? ((counts.records / totalItems) * 100).toFixed(1) : "0",
      icon: Disc3,
      color: "text-teal-600 dark:text-teal-400",
      bgColor: "bg-teal-50 dark:bg-teal-950/20"
    },
    { 
      label: "Bebidas", 
      value: counts.drinks, 
      percentage: totalItems > 0 ? ((counts.drinks / totalItems) * 100).toFixed(1) : "0",
      icon: Wine,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-950/20"
    },
    { 
      label: "Jogos", 
      value: counts.boardGames, 
      percentage: totalItems > 0 ? ((counts.boardGames / totalItems) * 100).toFixed(1) : "0",
      icon: Gamepad2,
      color: "text-lime-600 dark:text-lime-400",
      bgColor: "bg-lime-50 dark:bg-lime-950/20"
    },
  ];

  const largestCollection = stats.reduce((prev, current) => 
    current.value > prev.value ? current : prev
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Estatísticas Detalhadas
          </DialogTitle>
          <DialogDescription>
            Análise completa do seu inventário
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 mt-4">
          {/* Total Overview */}
          <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total de Itens</p>
                <p className="text-3xl font-bold text-primary">{totalItems}</p>
              </div>
              <Calendar className="h-8 w-8 text-primary" />
            </div>
          </div>

          {/* Collection Breakdown */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-muted-foreground">Distribuição por Categoria</h3>
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                        <Icon className={`h-4 w-4 ${stat.color}`} />
                      </div>
                      <span className="font-medium text-sm">{stat.label}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold">{stat.value}</span>
                      <span className="text-xs text-muted-foreground ml-2">
                        ({stat.percentage}%)
                      </span>
                    </div>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${stat.bgColor} transition-all duration-500`}
                      style={{ width: `${stat.percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Insights */}
          {totalItems > 0 && (
            <div className="p-4 rounded-lg bg-muted/50 border border-border">
              <div className="flex items-start gap-2">
                <TrendingUp className="h-4 w-4 text-primary mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Maior Coleção</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Sua categoria <span className="font-semibold text-foreground">{largestCollection.label}</span> lidera com {largestCollection.value} itens ({largestCollection.percentage}% do total)
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
