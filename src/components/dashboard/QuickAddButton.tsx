import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, Book, Disc3, Wine, Gamepad2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function QuickAddButton() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const quickActions = [
    { label: "Livro", icon: Book, path: "/livros", color: "text-emerald-600" },
    { label: "Disco", icon: Disc3, path: "/discos", color: "text-teal-600" },
    { label: "Bebida", icon: Wine, path: "/bebidas", color: "text-green-600" },
    { label: "Jogo", icon: Gamepad2, path: "/jogos", color: "text-lime-600" },
  ];

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          size="lg"
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all z-50"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <DropdownMenuItem
              key={action.path}
              onClick={() => {
                navigate(action.path);
                setOpen(false);
              }}
              className="cursor-pointer"
            >
              <Icon className={`h-4 w-4 mr-2 ${action.color}`} />
              Adicionar {action.label}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
