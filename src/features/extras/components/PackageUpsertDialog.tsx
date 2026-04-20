import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus } from "lucide-react";
import type { ExtraCatalogItem } from "@/features/extras/services/extra-service";

export const emptyPackageForm = {
  nome: "",
  descricao: "",
  preco_total: "",
  itemIds: [] as string[],
};

interface PackageUpsertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: typeof emptyPackageForm;
  catalog: ExtraCatalogItem[];
  onChange: (value: typeof emptyPackageForm) => void;
  onSubmit: () => Promise<void>;
  onCreateItem?: () => void;
  saving: boolean;
  editing: boolean;
}

export function PackageUpsertDialog({
  open,
  onOpenChange,
  form,
  catalog,
  onChange,
  onSubmit,
  onCreateItem,
  saving,
  editing,
}: PackageUpsertDialogProps) {
  const toggleItem = (itemId: string, checked: boolean) => {
    if (checked) {
      onChange({ ...form, itemIds: [...form.itemIds, itemId] });
      return;
    }

    onChange({ ...form, itemIds: form.itemIds.filter((currentId) => currentId !== itemId) });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card border-[0.5px] text-white max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-white">{editing ? "Editar pacote" : "Novo pacote"}</DialogTitle>
          <DialogDescription className="text-white/50">
            Monte bundles premium combinando itens do catálogo atual.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-white/50">Nome</Label>
            <Input
              className="glass-input border-white/10 text-white h-10"
              value={form.nome}
              onChange={(event) => onChange({ ...form, nome: event.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-white/50">Descrição</Label>
            <Textarea
              className="glass-input border-white/10 text-white min-h-[96px]"
              value={form.descricao}
              onChange={(event) => onChange({ ...form, descricao: event.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-white/50">Preço final (R$)</Label>
            <Input
              type="number"
              min={0}
              className="glass-input border-white/10 text-white h-10"
              value={form.preco_total}
              onChange={(event) => onChange({ ...form, preco_total: event.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-white/50">Itens inclusos</Label>
            {catalog.length === 0 ? (
              <div className="space-y-3 rounded-xl border border-dashed border-white/10 bg-black/20 p-4 text-center">
                <p className="text-sm text-white/60">Cadastre pelo menos um item antes de montar um pacote.</p>
                {onCreateItem && (
                  <Button
                    type="button"
                    variant="outline"
                    className="border-white/10 bg-white/5 text-white hover:bg-white/10"
                    onClick={onCreateItem}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Criar item agora
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto p-3 rounded-xl bg-black/20 border border-white/10">
                {catalog.map((item) => (
                  <label key={item.id} className="flex items-center gap-3 cursor-pointer text-sm text-white/80">
                    <Checkbox
                      checked={form.itemIds.includes(item.id)}
                      onCheckedChange={(checked) => toggleItem(item.id, Boolean(checked))}
                    />
                    <span className="truncate">{item.nome}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            className="gradient-primary border-0 text-white"
            onClick={() => void onSubmit()}
            disabled={saving || !form.nome.trim() || form.itemIds.length === 0}
          >
            {saving ? "Salvando..." : editing ? "Salvar pacote" : "Criar pacote"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
