import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ItemDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  imageUrl?: string | null;
  imagePlaceholder: React.ReactNode;
  fields: {
    label: string;
    value: string | React.ReactNode;
  }[];
}

export function ItemDetailModal({
  open,
  onOpenChange,
  title,
  imageUrl,
  imagePlaceholder,
  fields,
}: ItemDetailModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold pr-8">{title}</DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Image Section */}
          <div className="w-full flex justify-center">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={title}
                className="max-h-80 w-auto object-contain rounded-lg shadow-lg"
              />
            ) : (
              <div className="h-80 w-full bg-muted flex items-center justify-center rounded-lg">
                {imagePlaceholder}
              </div>
            )}
          </div>

          {/* Details Section */}
          <div className="space-y-4">
            {fields.map((field, index) => (
              <div key={index} className="border-b pb-3 last:border-0">
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  {field.label}
                </p>
                <div className="text-base">
                  {field.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
