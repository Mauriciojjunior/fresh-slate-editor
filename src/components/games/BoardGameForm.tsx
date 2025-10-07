import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ImageUpload } from "@/components/shared/ImageUpload";
import { ArrowLeft, Save } from "lucide-react";

interface BoardGame {
  id: string;
  name: string;
  image_url: string | null;
}

interface BoardGameFormProps {
  game?: BoardGame | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function BoardGameForm({ game, onSuccess, onCancel }: BoardGameFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: game?.name || "",
    image_url: game?.image_url || "",
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const gameData = {
        name: formData.name,
        image_url: formData.image_url || null,
      };

      if (game) {
        const { error } = await supabase
          .from('board_games')
          .update(gameData)
          .eq('id', game.id);
        
        if (error) throw error;
        
        toast({
          title: "Sucesso",
          description: "Jogo atualizado com sucesso!",
        });
      } else {
        const { error } = await supabase
          .from('board_games')
          .insert([gameData]);
        
        if (error) throw error;
        
        toast({
          title: "Sucesso",
          description: "Jogo cadastrado com sucesso!",
        });
      }

      onSuccess();
    } catch (error: any) {
      console.error('Error saving board game:', error);
      toast({
        title: "Erro",
        description: game ? "Não foi possível atualizar o jogo." : "Não foi possível cadastrar o jogo.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (url: string) => {
    setFormData({ ...formData, image_url: url });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="sm" onClick={onCancel}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-2xl font-bold">
          {game ? "Editar Jogo" : "Cadastrar Jogo"}
        </h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{game ? "Editar Jogo" : "Novo Jogo"}</CardTitle>
          <CardDescription>
            Preencha as informações do jogo de tabuleiro
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome do Jogo *</Label>
              <Input
                id="name"
                placeholder="Digite o nome do jogo"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label>Foto da Caixa do Jogo</Label>
              <ImageUpload
                bucket="game-images"
                currentImageUrl={formData.image_url}
                onImageUpload={handleImageUpload}
              />
            </div>

            <div className="flex gap-3">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {game ? "Atualizar" : "Cadastrar"}
                  </>
                )}
              </Button>
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}