import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FileText, Loader2 } from "lucide-react";

interface GerarFaturaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCount: number;
  totalValor: number;
  mesSelecionado: string;
  onMesChange: (mes: string) => void;
  diaVencimento: string;
  onDiaVencimentoChange: (dia: string) => void;
  opcoesMeses: { value: string; label: string }[];
  onGerar: () => void;
  gerando: boolean;
}

export function GerarFaturaDialog({
  open,
  onOpenChange,
  selectedCount,
  totalValor,
  mesSelecionado,
  onMesChange,
  diaVencimento,
  onDiaVencimentoChange,
  opcoesMeses,
  onGerar,
  gerando,
}: GerarFaturaDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground text-sm sm:text-base flex items-center gap-2">
            <FileText className="w-4 h-4" /> Gerar Fatura Recorrente
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="p-3 rounded-lg bg-secondary">
            <p className="text-xs text-muted-foreground mb-1">Clientes selecionados</p>
            <p className="text-lg font-bold text-foreground">{selectedCount}</p>
            <p className="text-xs text-muted-foreground">
              Total: R$ {totalValor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-foreground">Mês de competência</Label>
            <Select value={mesSelecionado} onValueChange={onMesChange}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {opcoesMeses.map(o => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-foreground">Dia de vencimento</Label>
            <Input
              type="number" min="1" max="28" value={diaVencimento}
              onChange={e => onDiaVencimentoChange(e.target.value)}
              className="text-foreground"
            />
            <p className="text-[10px] text-muted-foreground">
              Vencimento: {diaVencimento.padStart(2, "0")}/{mesSelecionado.split("-")[1]}/{mesSelecionado.split("-")[0]}
            </p>
          </div>

          <Button onClick={onGerar} disabled={gerando} className="w-full">
            {gerando ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Gerando...</>
            ) : (
              <><FileText className="w-4 h-4 mr-2" /> Criar Faturas como Rascunho</>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
