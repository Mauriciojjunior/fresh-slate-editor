import { useState } from "react";
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

interface Record {
  id: string;
  artist: string;
  album: string;
  format: 'vinil' | 'cd';
  image_url: string | null;
  is_new: boolean;
}

interface RecordFormProps {
  record?: Record | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function RecordForm({ record, onSuccess, onCancel }: RecordFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    artist: record?.artist || "",
    album: record?.album || "",
    format: record?.format || "vinil",
    image_url: record?.image_url || "",
    is_new: record?.is_new ?? true,
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const recordData = {
        artist: formData.artist,
        album: formData.album,
        format: formData.format,
        image_url: formData.image_url || null,
        is_new: formData.is_new,
      };

      if (record) {
        const { error } = await supabase
          .from('records')
          .update(recordData)
          .eq('id', record.id);
        
        if (error) throw error;
        
        toast({
          title: "Sucesso",
          description: "Disco atualizado com sucesso!",
        });
      } else {
        const { error } = await supabase
          .from('records')
          .insert([recordData]);
        
        if (error) throw error;
        
        toast({
          title: "Sucesso",
          description: "Disco cadastrado com sucesso!",
        });
      }

      onSuccess();
    } catch (error: any) {
      console.error('Error saving record:', error);
      toast({
        title: "Erro",
        description: record ? "Não foi possível atualizar o disco." : "Não foi possível cadastrar o disco.",
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
          {record ? "Editar Disco" : "Cadastrar Disco"}
        </h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{record ? "Editar Disco" : "Novo Disco"}</CardTitle>
          <CardDescription>
            Preencha as informações do disco
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-2">
              <Label htmlFor="artist">Artista *</Label>
              <Input
                id="artist"
                placeholder="Nome do artista ou banda"
                value={formData.artist}
                onChange={(e) => setFormData({ ...formData, artist: e.target.value })}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="album">Álbum *</Label>
              <Input
                id="album"
                placeholder="Nome do álbum"
                value={formData.album}
                onChange={(e) => setFormData({ ...formData, album: e.target.value })}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="format">Formato *</Label>
              <Select 
                value={formData.format} 
                onValueChange={(value: 'vinil' | 'cd') => setFormData({ ...formData, format: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o formato" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vinil">Vinil</SelectItem>
                  <SelectItem value="cd">CD</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_new"
                checked={formData.is_new}
                onCheckedChange={(checked) => setFormData({ ...formData, is_new: !!checked })}
              />
              <Label htmlFor="is_new">Disco novo (não usado)</Label>
            </div>

            <div className="grid gap-2">
              <Label>Foto do Disco</Label>
              <ImageUpload
                bucket="record-images"
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
                    {record ? "Atualizar" : "Cadastrar"}
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