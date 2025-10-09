import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Pencil, Plus, Trash2 } from "lucide-react";

interface GrapeType {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

export function GrapeTypeManager() {
  const [grapeTypes, setGrapeTypes] = useState<GrapeType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingGrapeType, setEditingGrapeType] = useState<GrapeType | null>(null);
  const [deleteGrapeTypeId, setDeleteGrapeTypeId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchGrapeTypes();
  }, []);

  const fetchGrapeTypes = async () => {
    try {
      const { data, error } = await supabase
        .from('grape_types')
        .select('*')
        .order('name');

      if (error) throw error;
      setGrapeTypes(data || []);
    } catch (error: any) {
      console.error('Error fetching grape types:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os tipos de uva.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const grapeTypeData = {
        name: formData.name,
        description: formData.description || null,
      };

      if (editingGrapeType) {
        const { error } = await supabase
          .from('grape_types')
          .update(grapeTypeData)
          .eq('id', editingGrapeType.id);

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Tipo de uva atualizado com sucesso!",
        });
      } else {
        const { error } = await supabase
          .from('grape_types')
          .insert([grapeTypeData]);

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Tipo de uva cadastrado com sucesso!",
        });
      }

      setIsDialogOpen(false);
      setFormData({ name: "", description: "" });
      setEditingGrapeType(null);
      fetchGrapeTypes();
    } catch (error: any) {
      console.error('Error saving grape type:', error);
      toast({
        title: "Erro",
        description: editingGrapeType 
          ? "Não foi possível atualizar o tipo de uva." 
          : "Não foi possível cadastrar o tipo de uva.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (grapeType: GrapeType) => {
    setEditingGrapeType(grapeType);
    setFormData({
      name: grapeType.name,
      description: grapeType.description || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteGrapeTypeId) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('grape_types')
        .delete()
        .eq('id', deleteGrapeTypeId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Tipo de uva excluído com sucesso!",
      });

      setIsDeleteDialogOpen(false);
      setDeleteGrapeTypeId(null);
      fetchGrapeTypes();
    } catch (error: any) {
      console.error('Error deleting grape type:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o tipo de uva.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const openAddDialog = () => {
    setEditingGrapeType(null);
    setFormData({ name: "", description: "" });
    setIsDialogOpen(true);
  };

  if (loading && grapeTypes.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Tipos de Uva</CardTitle>
            <CardDescription>
              Gerencie os tipos de uva disponíveis para vinhos
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openAddDialog}>
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Tipo
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>
                    {editingGrapeType ? "Editar Tipo de Uva" : "Novo Tipo de Uva"}
                  </DialogTitle>
                  <DialogDescription>
                    Preencha as informações do tipo de uva
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Nome *</Label>
                    <Input
                      id="name"
                      placeholder="Ex: Cabernet Sauvignon"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      placeholder="Descrição do tipo de uva (opcional)"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? "Salvando..." : editingGrapeType ? "Atualizar" : "Cadastrar"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {grapeTypes.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Nenhum tipo de uva cadastrado
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {grapeTypes.map((grapeType) => (
                <TableRow key={grapeType.id}>
                  <TableCell className="font-medium">{grapeType.name}</TableCell>
                  <TableCell>{grapeType.description || "-"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(grapeType)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setDeleteGrapeTypeId(grapeType.id);
                          setIsDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este tipo de uva? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={loading}>
              {loading ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}