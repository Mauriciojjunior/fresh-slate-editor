import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface RecentItem {
  id: string;
  name: string;
  category: string;
  image_url: string | null;
  created_at: string;
}

interface RecentItemsCardProps {
  items: RecentItem[];
}

export function RecentItemsCard({ items }: RecentItemsCardProps) {
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      "Livros": "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
      "Discos": "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300",
      "Bebidas": "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
      "Jogos": "bg-lime-100 text-lime-700 dark:bg-lime-900/30 dark:text-lime-300",
    };
    return colors[category] || "bg-primary/10 text-primary";
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <Clock className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-base">Últimos Itens Adicionados</CardTitle>
            <CardDescription className="text-xs">Novidades na coleção</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((item) => (
          <div 
            key={item.id}
            className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
          >
            <div className="w-12 h-12 rounded-md overflow-hidden bg-background flex-shrink-0">
              {item.image_url ? (
                <img 
                  src={item.image_url} 
                  alt={item.name}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                  N/A
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">
                {item.name}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className={getCategoryColor(item.category)}>
                  {item.category}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(item.created_at), {
                    addSuffix: true,
                    locale: ptBR
                  })}
                </span>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
