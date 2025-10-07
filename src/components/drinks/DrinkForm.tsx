import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ImageUpload } from "@/components/shared/ImageUpload";
import { ArrowLeft, Save } from "lucide-react";

interface DrinkType {
  id: string;
  name: string;
}

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
}

interface DrinkFormProps {
  drink?: Drink | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function DrinkForm({ drink, onSuccess, onCancel }: DrinkFormProps) {
  const [drinkTypes, setDrinkTypes] = useState<DrinkType[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: drink?.name || "",
    type_id: drink?.type_id || "",
    manufacturing_location: drink?.manufacturing_location || "",
    grape_type: drink?.grape_type || "",
    image_url: drink?.image_url || "",
    needs_to_buy: drink?.needs_to_buy ?? false,
    is_finished: drink?.is_finished ?? false,
  });
  const { toast } = useToast();

  useEffect(() => {
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
      toast({
        title: "Erro",
        description: "Não foi possível carregar os tipos de bebida.",
        variant: "destructive",
      });
    }
  };

  const selectedDrinkType = drinkTypes.find(type => type.id === formData.type_id);
  const isWineType = selectedDrinkType?.name.toLowerCase().includes('vinho');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const now = new Date().toISOString();
      const drinkData: any = {
        name: formData.name,
        type_id: formData.type_id,
        manufacturing_location: formData.manufacturing_location || null,
        grape_type: isWineType ? formData.grape_type || null : null,
        image_url: formData.image_url || null,
        needs_to_buy: formData.needs_to_buy,
        is_finished: formData.is_finished,
      };

      // Update timestamps when checkbox states change
      if (drink) {
        // If needs_to_buy changed from false to true
        if (!drink.needs_to_buy && formData.needs_to_buy) {
          drinkData.needs_to_buy_marked_at = now;
        }
        // If needs_to_buy changed from true to false
        if (drink.needs_to_buy && !formData.needs_to_buy) {
          drinkData.needs_to_buy_unmarked_at = now;
        }
        
        // If is_finished changed from false to true
        if (!drink.is_finished && formData.is_finished) {
          drinkData.is_finished_marked_at = now;
        }
        // If is_finished changed from true to false
        if (drink.is_finished && !formData.is_finished) {
          drinkData.is_finished_unmarked_at = now;
        }
      } else {
        // For new drinks, set initial timestamps based on checkbox state
        if (formData.needs_to_buy) {
          drinkData.needs_to_buy_marked_at = now;
        }
        if (formData.is_finished) {
          drinkData.is_finished_marked_at = now;
        }
      }

      if (drink) {
        const { error } = await supabase
          .from('drinks')
          .update(drinkData)
          .eq('id', drink.id);
        
        if (error) throw error;
        
        toast({
          title: "Sucesso",
          description: "Bebida atualizada com sucesso!",
        });
      } else {
        const { error } = await supabase
          .from('drinks')
          .insert([drinkData]);
        
        if (error) throw error;
        
        toast({
          title: "Sucesso",
          description: "Bebida cadastrada com sucesso!",
        });
      }

      onSuccess();
    } catch (error: any) {
      console.error('Error saving drink:', error);
      toast({
        title: "Erro",
        description: drink ? "Não foi possível atualizar a bebida." : "Não foi possível cadastrar a bebida.",
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
          {drink ? "Editar Bebida" : "Cadastrar Bebida"}
        </h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{drink ? "Editar Bebida" : "Nova Bebida"}</CardTitle>
          <CardDescription>
            Preencha as informações da bebida
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                placeholder="Nome da bebida"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="type">Tipo *</Label>
              <Select 
                value={formData.type_id} 
                onValueChange={(value) => setFormData({ ...formData, type_id: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo de bebida" />
                </SelectTrigger>
                <SelectContent>
                  {drinkTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="manufacturing_location">Local de Fabricação</Label>
              <Input
                id="manufacturing_location"
                placeholder="Local onde foi fabricado"
                value={formData.manufacturing_location}
                onChange={(e) => setFormData({ ...formData, manufacturing_location: e.target.value })}
              />
            </div>

            {isWineType && (
              <div className="grid gap-2">
                <Label htmlFor="grape_type">Tipo de Uva</Label>
                <Input
                  id="grape_type"
                  placeholder="Tipo da uva (ex: Cabernet Sauvignon)"
                  value={formData.grape_type}
                  onChange={(e) => setFormData({ ...formData, grape_type: e.target.value })}
                />
              </div>
            )}

            <div className="grid gap-2">
              <Label>Foto da Bebida</Label>
              <ImageUpload
                bucket="drink-images"
                currentImageUrl={formData.image_url}
                onImageUpload={handleImageUpload}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="needs_to_buy"
                  checked={formData.needs_to_buy}
                  onCheckedChange={(checked) => setFormData({ ...formData, needs_to_buy: !!checked })}
                />
                <Label htmlFor="needs_to_buy">Precisa comprar</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_finished"
                  checked={formData.is_finished}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_finished: !!checked })}
                />
                <Label htmlFor="is_finished">Acabou</Label>
              </div>
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
                    {drink ? "Atualizar" : "Cadastrar"}
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