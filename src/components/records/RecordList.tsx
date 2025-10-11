import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { Edit, Trash2, Plus, Disc3 } from "lucide-react";
import { RecordForm } from "./RecordForm";
import { ItemDetailModal } from "@/components/shared/ItemDetailModal";
import { CollectionFilters, SortOption, ViewMode } from "@/components/shared/CollectionFilters";
import { EmptyState } from "@/components/shared/EmptyState";

interface Record {
  id: string;
  artist: string;
  album: string;
  format: 'vinil' | 'cd';
  image_url: string | null;
  is_new: boolean;
  created_at: string;
}

export function RecordList() {
  const [records, setRecords] = useState<Record[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [formatFilter, setFormatFilter] = useState("all");
  const [conditionFilter, setConditionFilter] = useState("all");
  const [sortBy, setSortBy] = useState<SortOption>("name-asc");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Record | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<Record | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      const { data, error } = await supabase
        .from('records')
        .select('*');

      if (error) throw error;
      setRecords((data || []).map(record => ({
        ...record,
        format: record.format as 'vinil' | 'cd'
      })));
    } catch (error: any) {
      console.error('Error fetching records:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os discos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este disco?")) return;

    try {
      const { error } = await supabase
        .from('records')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: "Disco excluído com sucesso!",
      });
      
      fetchRecords();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Não foi possível excluir o disco.",
        variant: "destructive",
      });
    }
  };

  // Apply filters and sorting
  const filteredAndSortedRecords = records
    .filter(record => {
      const matchesSearch = 
        record.album.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.artist.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFormat = formatFilter === "all" || record.format === formatFilter;
      
      const matchesCondition = 
        conditionFilter === "all" ||
        (conditionFilter === "new" && record.is_new) ||
        (conditionFilter === "used" && !record.is_new);
      
      return matchesSearch && matchesFormat && matchesCondition;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name-asc':
          return a.album.localeCompare(b.album);
        case 'name-desc':
          return b.album.localeCompare(a.album);
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
    setEditingRecord(null);
    fetchRecords();
  };

  const activeFiltersCount = 
    (searchTerm ? 1 : 0) + 
    (formatFilter !== "all" ? 1 : 0) +
    (conditionFilter !== "all" ? 1 : 0);

  const handleClearFilters = () => {
    setSearchTerm("");
    setFormatFilter("all");
    setConditionFilter("all");
  };

  if (showForm) {
    return (
      <RecordForm 
        record={editingRecord}
        onSuccess={handleFormSuccess}
        onCancel={() => {
          setShowForm(false);
          setEditingRecord(null);
        }}
      />
    );
  }

  const renderGridView = () => (
    <div className="collection-grid">
      {filteredAndSortedRecords.map((record) => (
        <Card key={record.id} className="collection-card" onClick={() => setSelectedRecord(record)}>
          {record.image_url ? (
            <div className="h-[220px] flex items-center justify-center bg-muted">
              <img
                src={record.image_url}
                alt={record.album}
                className="collection-thumbnail"
              />
            </div>
          ) : (
            <div className="h-[220px] bg-muted flex items-center justify-center">
              <Disc3 className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
          <CardContent className="collection-card-content">
            <h3 className="font-semibold text-lg line-clamp-2">{record.album}</h3>
            <p className="text-muted-foreground text-sm">{record.artist}</p>
            <div className="flex gap-2 flex-wrap">
              <Badge variant={record.format === 'vinil' ? 'default' : 'secondary'}>
                {record.format.toUpperCase()}
              </Badge>
              <Badge variant={record.is_new ? 'default' : 'outline'}>
                {record.is_new ? 'Novo' : 'Usado'}
              </Badge>
            </div>
            <RoleGuard requireWrite>
              <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingRecord(record);
                        setShowForm(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Editar disco</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(record.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Excluir disco</TooltipContent>
                </Tooltip>
              </div>
            </RoleGuard>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderListView = () => (
    <div className="collection-list">
      {filteredAndSortedRecords.map((record) => (
        <div 
          key={record.id} 
          className="collection-list-item"
          onClick={() => setSelectedRecord(record)}
        >
          <div className="collection-list-image">
            {record.image_url ? (
              <img
                src={record.image_url}
                alt={record.album}
                className="w-full h-full object-contain"
              />
            ) : (
              <Disc3 className="h-8 w-8 text-muted-foreground" />
            )}
          </div>
          <div className="collection-list-content">
            <h3 className="font-semibold text-base line-clamp-1">{record.album}</h3>
            <p className="text-sm text-muted-foreground">{record.artist}</p>
            <div className="flex gap-2 flex-wrap">
              <Badge variant={record.format === 'vinil' ? 'default' : 'secondary'}>
                {record.format.toUpperCase()}
              </Badge>
              <Badge variant={record.is_new ? 'default' : 'outline'}>
                {record.is_new ? 'Novo' : 'Usado'}
              </Badge>
            </div>
          </div>
          <RoleGuard requireWrite>
            <div className="collection-list-actions" onClick={(e) => e.stopPropagation()}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingRecord(record);
                      setShowForm(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Editar disco</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(record.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Excluir disco</TooltipContent>
              </Tooltip>
            </div>
          </RoleGuard>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Discos</h2>
        <RoleGuard requireWrite>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Disco
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
            label: "Formato",
            value: formatFilter,
            options: [
              { label: "Todos", value: "all" },
              { label: "Vinil", value: "vinil" },
              { label: "CD", value: "cd" }
            ],
            onChange: setFormatFilter
          },
          {
            label: "Condição",
            value: conditionFilter,
            options: [
              { label: "Todos", value: "all" },
              { label: "Novo", value: "new" },
              { label: "Usado", value: "used" }
            ],
            onChange: setConditionFilter
          }
        ]}
        activeFiltersCount={activeFiltersCount}
        onClearFilters={handleClearFilters}
        searchPlaceholder="Buscar por álbum ou artista..."
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
      ) : filteredAndSortedRecords.length === 0 ? (
        <EmptyState
          icon={Disc3}
          title={searchTerm || formatFilter !== "all" || conditionFilter !== "all" ? "Nenhum disco encontrado" : "Comece sua coleção"}
          description={
            searchTerm || formatFilter !== "all" || conditionFilter !== "all"
              ? "Tente ajustar os filtros ou fazer uma nova busca."
              : "Adicione seu primeiro disco e comece a organizar sua coleção musical."
          }
          actionLabel="Adicionar Primeiro Disco"
          onAction={() => setShowForm(true)}
          showAction={records.length === 0}
        />
      ) : (
        viewMode === 'grid' ? renderGridView() : renderListView()
      )}

      {selectedRecord && (
        <ItemDetailModal
          open={!!selectedRecord}
          onOpenChange={(open) => !open && setSelectedRecord(null)}
          title={selectedRecord.album}
          imageUrl={selectedRecord.image_url}
          imagePlaceholder={<Disc3 className="h-24 w-24 text-muted-foreground" />}
          fields={[
            { label: "Álbum", value: selectedRecord.album },
            { label: "Artista", value: selectedRecord.artist },
            { 
              label: "Formato", 
              value: <Badge variant={selectedRecord.format === 'vinil' ? 'default' : 'secondary'}>
                {selectedRecord.format.toUpperCase()}
              </Badge>
            },
            { 
              label: "Condição", 
              value: <Badge variant={selectedRecord.is_new ? 'default' : 'outline'}>
                {selectedRecord.is_new ? 'Novo' : 'Usado'}
              </Badge>
            },
          ]}
        />
      )}
    </div>
  );
}
