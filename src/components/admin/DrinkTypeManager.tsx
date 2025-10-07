import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, RefreshCw, Wine } from "lucide-react";

interface DrinkType {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

export function DrinkTypeManager() {
  const [drinkTypes, setDrinkTypes] = useState<DrinkType[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingType, setEditingType] = useState<DrinkType | null>(null);
  const [deletingType, setDeletingType] = useState<DrinkType | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchDrinkTypes();
  }, []);

  const fetchDrinkTypes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('drink_types')
        .select('*')
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
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingType) {
        // Update existing type
        const { error } = await supabase
          .from('drink_types')
          .update({
            name: formData.name,
            description: formData.description || null,
          })
          .eq('id', editingType.id);

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Tipo de bebida atualizado com sucesso.",
        });
      } else {
        // Create new type
        const { error } = await supabase
          .from('drink_types')
          .insert({
            name: formData.name,
            description: formData.description || null,
          });

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Tipo de bebida criado com sucesso.",
        });
      }

      setFormData({ name: "", description: "" });
      setEditingType(null);
      setDialogOpen(false);
      fetchDrinkTypes();
    } catch (error: any) {
      console.error('Error saving drink type:', error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível salvar o tipo de bebida.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (drinkType: DrinkType) => {
    setEditingType(drinkType);
    setFormData({
      name: drinkType.name,
      description: drinkType.description || "",
    });
    setDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingType) return;

    try {
      const { error } = await supabase
        .from('drink_types')
        .delete()
        .eq('id', deletingType.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Tipo de bebida excluído com sucesso.",
      });

      setDeletingType(null);
      fetchDrinkTypes();
    } catch (error: any) {
      console.error('Error deleting drink type:', error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível excluir o tipo de bebida.",
        variant: "destructive",
      });
    }
  };

  const openAddDialog = () => {
    setEditingType(null);
    setFormData({ name: "", description: "" });
    setDialogOpen(true);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Tipos de Bebida</CardTitle>
            <CardDescription>
              Gerencie os tipos disponíveis para classificação de bebidas
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button onClick={fetchDrinkTypes} variant="outline" size="sm">
              <RefreshCw className="mr-2 h-4 w-4" />
              Atualizar
            </Button>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={openAddDialog}>
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Tipo
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                  <DialogHeader>
                    <DialogTitle>
                      {editingType ? "Editar Tipo" : "Novo Tipo"}
                    </DialogTitle>
                    <DialogDescription>
                      {editingType 
                        ? "Altere os dados do tipo selecionado."
                        : "Crie um novo tipo para classificar bebidas."
                      }
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Nome</Label>
                      <Input
                        id="name"
                        placeholder="Nome do tipo"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="description">Descrição</Label>
                      <Textarea
                        id="description"
                        placeholder="Descrição do tipo (opcional)"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={loading}>
                      {loading ? "Salvando..." : editingType ? "Salvar" : "Criar"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {drinkTypes.length === 0 && !loading ? (
          <div className="text-center py-8">
            <Wine className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhum tipo encontrado</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Criado em</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {drinkTypes.map((drinkType) => (
                <TableRow key={drinkType.id}>
                  <TableCell className="font-medium">{drinkType.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {drinkType.description || "Sem descrição"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(drinkType.created_at).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(drinkType)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeletingType(drinkType)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <AlertDialog open={!!deletingType} onOpenChange={() => setDeletingType(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o tipo <strong>{deletingType?.name}</strong>? 
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}