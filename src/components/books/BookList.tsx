import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { Edit, Trash2, Plus, Book } from "lucide-react";
import { BookForm } from "./BookForm";
import { ItemDetailModal } from "@/components/shared/ItemDetailModal";
import { CollectionFilters, SortOption, ViewMode } from "@/components/shared/CollectionFilters";
import { EmptyState } from "@/components/shared/EmptyState";

interface BookType {
  id: string;
  title: string;
  author: string;
  category_id: string;
  image_url: string | null;
  created_at: string;
  book_categories: {
    name: string;
  };
}

export function BookList() {
  const [books, setBooks] = useState<BookType[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState<SortOption>("name-asc");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [showForm, setShowForm] = useState(false);
  const [editingBook, setEditingBook] = useState<BookType | null>(null);
  const [selectedBook, setSelectedBook] = useState<BookType | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchBooks();
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
    }
  };

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
          created_at,
          book_categories (
            name
          )
        `);

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

  // Apply filters and sorting
  const filteredAndSortedBooks = books
    .filter(book => {
      const matchesSearch = 
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.book_categories.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = categoryFilter === "all" || book.category_id === categoryFilter;
      
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name-asc':
          return a.title.localeCompare(b.title);
        case 'name-desc':
          return b.title.localeCompare(a.title);
        case 'recent':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        default:
          return 0;
      }
    });

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingBook(null);
    fetchBooks();
  };

  const activeFiltersCount = (searchTerm ? 1 : 0) + (categoryFilter !== "all" ? 1 : 0);

  const handleClearFilters = () => {
    setSearchTerm("");
    setCategoryFilter("all");
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

  const renderGridView = () => (
    <div className="collection-grid">
      {filteredAndSortedBooks.map((book) => (
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
              <TooltipProvider>
                <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                  <Tooltip>
                    <TooltipTrigger asChild>
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
                    </TooltipTrigger>
                    <TooltipContent>Editar livro</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(book.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Excluir livro</TooltipContent>
                  </Tooltip>
                </div>
              </TooltipProvider>
            </RoleGuard>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderListView = () => (
    <div className="collection-list">
      {filteredAndSortedBooks.map((book) => (
        <div 
          key={book.id} 
          className="collection-list-item"
          onClick={() => setSelectedBook(book)}
        >
          <div className="collection-list-image">
            {book.image_url ? (
              <img
                src={book.image_url}
                alt={book.title}
                className="w-full h-full object-contain"
              />
            ) : (
              <Book className="h-8 w-8 text-muted-foreground" />
            )}
          </div>
          <div className="collection-list-content">
            <h3 className="font-semibold text-base line-clamp-1">{book.title}</h3>
            <p className="text-sm text-muted-foreground">{book.author}</p>
            <Badge variant="secondary" className="w-fit">
              {book.book_categories.name}
            </Badge>
          </div>
          <RoleGuard requireWrite>
            <TooltipProvider>
              <div className="collection-list-actions" onClick={(e) => e.stopPropagation()}>
                <Tooltip>
                  <TooltipTrigger asChild>
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
                  </TooltipTrigger>
                  <TooltipContent>Editar livro</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(book.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Excluir livro</TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>
          </RoleGuard>
        </div>
      ))}
    </div>
  );

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

      <CollectionFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        sortBy={sortBy}
        onSortChange={setSortBy}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        filters={[
          {
            label: "Categoria",
            value: categoryFilter,
            options: [
              { label: "Todas", value: "all" },
              ...categories.map(cat => ({ label: cat.name, value: cat.id }))
            ],
            onChange: setCategoryFilter
          }
        ]}
        activeFiltersCount={activeFiltersCount}
        onClearFilters={handleClearFilters}
        searchPlaceholder="Buscar por título, autor ou categoria..."
      />

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
      ) : filteredAndSortedBooks.length === 0 ? (
        <EmptyState
          icon={Book}
          title={searchTerm || categoryFilter !== "all" ? "Nenhum livro encontrado" : "Comece sua biblioteca"}
          description={
            searchTerm || categoryFilter !== "all"
              ? "Tente ajustar os filtros ou fazer uma nova busca."
              : "Adicione seu primeiro livro e comece a organizar sua coleção pessoal."
          }
          actionLabel="Adicionar Primeiro Livro"
          onAction={() => setShowForm(true)}
          showAction={books.length === 0}
        />
      ) : (
        viewMode === 'grid' ? renderGridView() : renderListView()
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
