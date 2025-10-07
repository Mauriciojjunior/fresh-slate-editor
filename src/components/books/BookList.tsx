import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { Search, Edit, Trash2, Plus, Book } from "lucide-react";
import { BookForm } from "./BookForm";

interface Book {
  id: string;
  title: string;
  author: string;
  category_id: string;
  image_url: string | null;
  book_categories: {
    name: string;
  };
}

export function BookList() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const { data, error } = await supabase
        .from('books')
        .select(`
          id,
          title,
          author,
          category_id,
          image_url,
          book_categories (
            name
          )
        `)
        .order('title');

      if (error) throw error;
      setBooks(data || []);
    } catch (error: any) {
      console.error('Error fetching books:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os livros.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este livro?")) return;

    try {
      const { error } = await supabase
        .from('books')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: "Livro excluído com sucesso!",
      });
      
      fetchBooks();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Não foi possível excluir o livro.",
        variant: "destructive",
      });
    }
  };

  const filteredBooks = books.filter(book => 
    book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.book_categories.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingBook(null);
    fetchBooks();
  };

  if (showForm) {
    return (
      <BookForm 
        book={editingBook}
        onSuccess={handleFormSuccess}
        onCancel={() => {
          setShowForm(false);
          setEditingBook(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Livros</h2>
        <RoleGuard requireWrite>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Livro
          </Button>
        </RoleGuard>
      </div>

      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por título, autor ou categoria..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-48 bg-muted rounded-t-lg"></div>
              <CardContent className="p-4">
                <div className="h-4 bg-muted rounded mb-2"></div>
                <div className="h-3 bg-muted rounded mb-1"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredBooks.length === 0 ? (
        <div className="text-center py-12">
          <Book className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Nenhum livro encontrado</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm ? "Tente ajustar sua busca" : "Comece adicionando seu primeiro livro"}
          </p>
          <RoleGuard requireWrite>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Primeiro Livro
            </Button>
          </RoleGuard>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBooks.map((book) => (
            <Card key={book.id} className="overflow-hidden">
              {book.image_url ? (
                <img
                  src={book.image_url}
                  alt={book.title}
                  className="h-48 w-full object-cover"
                />
              ) : (
                <div className="h-48 bg-muted flex items-center justify-center">
                  <Book className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-1">{book.title}</h3>
                <p className="text-muted-foreground mb-2">{book.author}</p>
                <Badge variant="secondary" className="mb-3">
                  {book.book_categories.name}
                </Badge>
                <RoleGuard requireWrite>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingBook(book);
                        setShowForm(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(book.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </RoleGuard>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}