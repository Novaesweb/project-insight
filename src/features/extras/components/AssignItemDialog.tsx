import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { ExtraCatalogItem, PackageItem } from "@/features/extras/services/extra-service";

interface AssignItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: ExtraCatalogItem | PackageItem | null;
  clients: Array<{ id: string; nome: string }>;
  selectedClientId: string;
  note: string;
  onClientChange: (value: string) => void;
  onNoteChange: (value: string) => void;
  onSubmit: () => Promise<void>;
  onGoToClients?: () => void;
  saving: boolean;
}

export function AssignItemDialog({
  open,
  onOpenChange,
  item,
  clients,
  selectedClientId,
  note,
  onClientChange,
  onNoteChange,
  onSubmit,
  onGoToClients,
  saving,
}: AssignItemDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card border-[0.5px] text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white">Adicionar a cliente</DialogTitle>
          <DialogDescription className="text-white/50">
            Ative este item no portal do cliente e registre a cobrança inicial quando houver valor.
          </DialogDescription>
        </DialogHeader>

        {item && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <p className="text-sm font-semibold text-white">{item.nome}</p>
              <p className="text-xs text-white/40 mt-1">
                {"categoria" in item ? "Item individual" : "Pacote premium"}
              </p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-white/50">Cliente</Label>
              {clients.length === 0 ? (
                <div className="space-y-3 rounded-xl border border-dashed border-white/10 bg-black/20 p-4">
                  <p className="text-sm text-white/60">Nenhum cliente ativo encontrado para receber este item.</p>
                  {onGoToClients && (
                    <Button
                      type="button"
                      variant="outline"
                      className="border-white/10 bg-white/5 text-white hover:bg-white/10"
                      onClick={onGoToClients}
                    >
                      Ir para clientes
                    </Button>
                  )}
                </div>
              ) : (
                <Select value={selectedClientId} onValueChange={onClientChange}>
                  <SelectTrigger className="glass-input border-white/10 text-white">
                    <SelectValue placeholder="Selecione o cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-white/50">Observação</Label>
              <Textarea
                className="glass-input border-white/10 text-white min-h-[96px]"
                value={note}
                onChange={(event) => onNoteChange(event.target.value)}
              />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          {clients.length > 0 && onGoToClients && (
            <Button
              type="button"
              variant="outline"
              className="border-white/10 bg-white/5 text-white hover:bg-white/10"
              onClick={onGoToClients}
            >
              Ver clientes
            </Button>
          )}
          <Button
            className="gradient-primary border-0 text-white"
            onClick={() => void onSubmit()}
            disabled={saving || clients.length === 0 || !selectedClientId}
          >
            {saving ? "Atribuindo..." : "Confirmar atribuição"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
