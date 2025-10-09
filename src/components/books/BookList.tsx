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
import { ItemDetailModal } from "@/components/shared/ItemDetailModal";

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
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
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
        <div className="collection-grid">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="animate-pulse collection-card">
              <div className="h-[220px] bg-muted"></div>
              <CardContent className="collection-card-content">
                <div className="h-4 bg-muted rounded"></div>
                <div className="h-3 bg-muted rounded"></div>
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
        <div className="collection-grid">
          {filteredBooks.map((book) => (
            <Card key={book.id} className="collection-card" onClick={() => setSelectedBook(book)}>
              {book.image_url ? (
                <div className="h-[220px] flex items-center justify-center bg-muted">
                  <img
                    src={book.image_url}
                    alt={book.title}
                    className="collection-thumbnail"
                  />
                </div>
              ) : (
                <div className="h-[220px] bg-muted flex items-center justify-center">
                  <Book className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
              <CardContent className="collection-card-content">
                <h3 className="font-semibold text-lg line-clamp-2">{book.title}</h3>
                <p className="text-muted-foreground text-sm">{book.author}</p>
                <Badge variant="secondary">
                  {book.book_categories.name}
                </Badge>
                <RoleGuard requireWrite>
                  <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
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

      {selectedBook && (
        <ItemDetailModal
          open={!!selectedBook}
          onOpenChange={(open) => !open && setSelectedBook(null)}
          title={selectedBook.title}
          imageUrl={selectedBook.image_url}
          imagePlaceholder={<Book className="h-24 w-24 text-muted-foreground" />}
          fields={[
            { label: "Título", value: selectedBook.title },
            { label: "Autor", value: selectedBook.author },
            { label: "Categoria", value: <Badge variant="secondary">{selectedBook.book_categories.name}</Badge> },
          ]}
        />
      )}
    </div>
  );
}