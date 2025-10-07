import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ImageUpload } from "@/components/shared/ImageUpload";
import { ArrowLeft, Save } from "lucide-react";

interface BookCategory {
  id: string;
  name: string;
}

interface Book {
  id: string;
  title: string;
  author: string;
  category_id: string;
  image_url: string | null;
}

interface BookFormProps {
  book?: Book | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function BookForm({ book, onSuccess, onCancel }: BookFormProps) {
  const [categories, setCategories] = useState<BookCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: book?.title || "",
    author: book?.author || "",
    category_id: book?.category_id || "",
    image_url: book?.image_url || "",
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('book_categories')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error: any) {
      console.error('Error fetching categories:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as categorias.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const bookData = {
        title: formData.title,
        author: formData.author,
        category_id: formData.category_id,
        image_url: formData.image_url || null,
      };

      if (book) {
        const { error } = await supabase
          .from('books')
          .update(bookData)
          .eq('id', book.id);
        
        if (error) throw error;
        
        toast({
          title: "Sucesso",
          description: "Livro atualizado com sucesso!",
        });
      } else {
        const { error } = await supabase
          .from('books')
          .insert([bookData]);
        
        if (error) throw error;
        
        toast({
          title: "Sucesso",
          description: "Livro cadastrado com sucesso!",
        });
      }

      onSuccess();
    } catch (error: any) {
      console.error('Error saving book:', error);
      toast({
        title: "Erro",
        description: book ? "Não foi possível atualizar o livro." : "Não foi possível cadastrar o livro.",
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
          {book ? "Editar Livro" : "Cadastrar Livro"}
        </h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{book ? "Editar Livro" : "Novo Livro"}</CardTitle>
          <CardDescription>
            Preencha as informações do livro
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-2">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                placeholder="Digite o título do livro"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="author">Autor *</Label>
              <Input
                id="author"
                placeholder="Nome do autor"
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="category">Categoria *</Label>
              <Select 
                value={formData.category_id} 
                onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Foto do Livro</Label>
              <ImageUpload
                bucket="book-images"
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
                    {book ? "Atualizar" : "Cadastrar"}
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