import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { formatMes, type FaturaMes } from "../types";

interface EditFaturaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fatura: FaturaMes | null;
  valor: string;
  onValorChange: (valor: string) => void;
  descricao: string;
  onDescricaoChange: (desc: string) => void;
  onSave: () => void;
}

export function EditFaturaDialog({
  open,
  onOpenChange,
  fatura,
  valor,
  onValorChange,
  descricao,
  onDescricaoChange,
  onSave,
}: EditFaturaDialogProps) {
  if (!fatura) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground text-sm sm:text-base flex items-center gap-2">
            <Edit className="w-4 h-4" /> Editar Fatura
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="p-3 rounded-lg bg-secondary">
            <p className="text-xs text-muted-foreground mb-1">Mês</p>
            <p className="text-lg font-bold text-foreground">{formatMes(fatura.mes)}</p>
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-foreground">Valor Total</Label>
            <Input
              type="number"
              step="0.01"
              min="0.01"
              value={valor}
              onChange={e => onValorChange(e.target.value)}
              className="text-foreground"
              placeholder="0,00"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-foreground">Descrição</Label>
            <textarea
              className="w-full p-2 border rounded-md text-sm text-foreground bg-background resize-none"
              rows={3}
              value={descricao}
              onChange={e => onDescricaoChange(e.target.value)}
              placeholder="Descrição da fatura..."
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={onSave} className="flex-1">
              <Edit className="w-4 h-4 mr-2" /> Salvar
            </Button>
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)} 
              className="flex-1"
            >
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
