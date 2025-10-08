import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { Edit, Trash2, Plus, Disc3 } from "lucide-react";
import { RecordForm } from "./RecordForm";
import { ItemDetailModal } from "@/components/shared/ItemDetailModal";

interface Record {
  id: string;
  artist: string;
  album: string;
  format: 'vinil' | 'cd';
  image_url: string | null;
  is_new: boolean;
}

export function RecordList() {
  const [records, setRecords] = useState<Record[]>([]);
  const [loading, setLoading] = useState(true);
  const [formatFilter, setFormatFilter] = useState<string>("all");
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Record | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<Record | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      let query = supabase
        .from('records')
        .select('*')
        .order('artist');

      if (formatFilter !== "all") {
        query = query.eq('format', formatFilter);
      }

      const { data, error } = await query;

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

  useEffect(() => {
    fetchRecords();
  }, [formatFilter]);

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

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingRecord(null);
    fetchRecords();
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

      <div className="flex items-center gap-4">
        <span className="text-sm font-medium">Filtrar por formato:</span>
        <Select value={formatFilter} onValueChange={setFormatFilter}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="vinil">Vinil</SelectItem>
            <SelectItem value="cd">CD</SelectItem>
          </SelectContent>
        </Select>
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
      ) : records.length === 0 ? (
        <div className="text-center py-12">
          <Disc3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Nenhum disco encontrado</h3>
          <p className="text-muted-foreground mb-4">
            {formatFilter !== "all" 
              ? `Nenhum disco encontrado no formato ${formatFilter}` 
              : "Comece adicionando seu primeiro disco"
            }
          </p>
          <RoleGuard requireWrite>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Primeiro Disco
            </Button>
          </RoleGuard>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {records.map((record) => (
            <Card key={record.id} className="overflow-hidden cursor-pointer hover-scale" onClick={() => setSelectedRecord(record)}>
              {record.image_url ? (
                <img
                  src={record.image_url}
                  alt={record.album}
                  className="h-48 w-full object-cover"
                />
              ) : (
                <div className="h-48 bg-muted flex items-center justify-center">
                  <Disc3 className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-1">{record.album}</h3>
                <p className="text-muted-foreground mb-2">{record.artist}</p>
                <div className="flex gap-2 mb-3">
                  <Badge variant={record.format === 'vinil' ? 'default' : 'secondary'}>
                    {record.format.toUpperCase()}
                  </Badge>
                  <Badge variant={record.is_new ? 'default' : 'outline'}>
                    {record.is_new ? 'Novo' : 'Usado'}
                  </Badge>
                </div>
                <RoleGuard requireWrite>
                  <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
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
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(record.id)}
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