import { useState } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Download, FileSpreadsheet, FileText } from "lucide-react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

type CollectionType = "books" | "records" | "drinks" | "board_games";
type ExportFormat = "excel" | "pdf";

export default function Exportacao() {
  const [selectedCollection, setSelectedCollection] = useState<CollectionType>("books");
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>("excel");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const collections = [
    { value: "books", label: "Livros", table: "books" },
    { value: "records", label: "Discos", table: "records" },
    { value: "drinks", label: "Bebidas", table: "drinks" },
    { value: "board_games", label: "Jogos de Tabuleiro", table: "board_games" },
  ];

  const formats = [
    { value: "excel", label: "Excel (.xlsx)", icon: FileSpreadsheet },
    { value: "pdf", label: "PDF (.pdf)", icon: FileText },
  ];

  const fetchCollectionData = async (collection: CollectionType) => {
    let data, error;

    switch (collection) {
      case "books":
        ({ data, error } = await supabase.from("books").select("*").order("created_at", { ascending: false }));
        break;
      case "records":
        ({ data, error } = await supabase.from("records").select("*").order("created_at", { ascending: false }));
        break;
      case "drinks":
        ({ data, error } = await supabase.from("drinks").select("*").order("created_at", { ascending: false }));
        break;
      case "board_games":
        ({ data, error } = await supabase.from("board_games").select("*").order("created_at", { ascending: false }));
        break;
    }

    if (error) throw error;
    return data;
  };

  const formatDataForExport = (collection: CollectionType, data: any[]) => {
    switch (collection) {
      case "books":
        return data.map((item) => ({
          Título: item.title,
          Autor: item.author,
          "Criado em": new Date(item.created_at).toLocaleDateString("pt-BR"),
        }));
      case "records":
        return data.map((item) => ({
          Artista: item.artist,
          Álbum: item.album,
          Formato: item.format,
          Novo: item.is_new ? "Sim" : "Não",
          "Criado em": new Date(item.created_at).toLocaleDateString("pt-BR"),
        }));
      case "drinks":
        return data.map((item) => ({
          Nome: item.name,
          "Local de Fabricação": item.manufacturing_location || "-",
          "Tipo de Uva": item.grape_type || "-",
          "Precisa Comprar": item.needs_to_buy ? "Sim" : "Não",
          Acabou: item.is_finished ? "Sim" : "Não",
          "Criado em": new Date(item.created_at).toLocaleDateString("pt-BR"),
        }));
      case "board_games":
        return data.map((item) => ({
          Nome: item.name,
          "Criado em": new Date(item.created_at).toLocaleDateString("pt-BR"),
        }));
      default:
        return data;
    }
  };

  const exportToExcel = (collection: CollectionType, data: any[]) => {
    const formattedData = formatDataForExport(collection, data);
    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    
    const collectionLabel = collections.find((c) => c.value === collection)?.label || collection;
    XLSX.utils.book_append_sheet(workbook, worksheet, collectionLabel);

    const fileName = `${collectionLabel}_${new Date().toLocaleDateString("pt-BR").replace(/\//g, "-")}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  const exportToPDF = (collection: CollectionType, data: any[]) => {
    const doc = new jsPDF();
    const formattedData = formatDataForExport(collection, data);
    const collectionLabel = collections.find((c) => c.value === collection)?.label || collection;

    doc.setFontSize(18);
    doc.text(`Exportação: ${collectionLabel}`, 14, 20);
    
    doc.setFontSize(10);
    doc.text(`Data: ${new Date().toLocaleDateString("pt-BR")}`, 14, 28);

    if (formattedData.length > 0) {
      const headers = Object.keys(formattedData[0]);
      const rows = formattedData.map((item) => headers.map((header) => item[header]));

      autoTable(doc, {
        head: [headers],
        body: rows,
        startY: 35,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [59, 130, 246] },
      });
    }

    const fileName = `${collectionLabel}_${new Date().toLocaleDateString("pt-BR").replace(/\//g, "-")}.pdf`;
    doc.save(fileName);
  };

  const handleExport = async () => {
    try {
      setLoading(true);

      const data = await fetchCollectionData(selectedCollection);
      
      if (!data || data.length === 0) {
        toast({
          title: "Aviso",
          description: "Não há dados para exportar nesta coleção.",
          variant: "destructive",
        });
        return;
      }

      if (selectedFormat === "excel") {
        exportToExcel(selectedCollection, data);
      } else {
        exportToPDF(selectedCollection, data);
      }

      toast({
        title: "Sucesso",
        description: `Arquivo exportado com sucesso!`,
      });
    } catch (error: any) {
      console.error("Error exporting data:", error);
      toast({
        title: "Erro",
        description: "Não foi possível exportar os dados. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <AppLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Exportação de Dados</h1>
            <p className="text-muted-foreground">
              Exporte suas coleções em Excel ou PDF
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Configurações de Exportação</CardTitle>
              <CardDescription>
                Selecione a coleção e o formato desejado para exportação
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label>Coleção</Label>
                <RadioGroup
                  value={selectedCollection}
                  onValueChange={(value) => setSelectedCollection(value as CollectionType)}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                  {collections.map((collection) => (
                    <div key={collection.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={collection.value} id={collection.value} />
                      <Label htmlFor={collection.value} className="cursor-pointer">
                        {collection.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div className="space-y-3">
                <Label>Formato de Exportação</Label>
                <RadioGroup
                  value={selectedFormat}
                  onValueChange={(value) => setSelectedFormat(value as ExportFormat)}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                  {formats.map((format) => (
                    <div key={format.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={format.value} id={format.value} />
                      <Label htmlFor={format.value} className="cursor-pointer flex items-center gap-2">
                        <format.icon className="h-4 w-4" />
                        {format.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <Button onClick={handleExport} disabled={loading} className="w-full md:w-auto">
                <Download className="mr-2 h-4 w-4" />
                {loading ? "Exportando..." : "Exportar Dados"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}
