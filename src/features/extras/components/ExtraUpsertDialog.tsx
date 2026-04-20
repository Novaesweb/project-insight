import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ExtraCategory } from "@/features/extras/services/extra-service";

export const emptyExtraForm = {
  nome: "",
  descricao: "",
  categoria: "fixo" as ExtraCategory,
  preco_ativacao: "",
  preco_mensal: "",
  status: "ativo" as "ativo" | "inativo",
};

interface ExtraUpsertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: typeof emptyExtraForm;
  onChange: (value: typeof emptyExtraForm) => void;
  onSubmit: () => Promise<void>;
  saving: boolean;
  editing: boolean;
}

export function ExtraUpsertDialog({
  open,
  onOpenChange,
  form,
  onChange,
  onSubmit,
  saving,
  editing,
}: ExtraUpsertDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card border-[0.5px] text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white">{editing ? "Editar item" : "Novo item"}</DialogTitle>
          <DialogDescription className="text-white/50">
            Configure o extra que ficará disponível para atribuição no portal do cliente.
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
            <Label className="text-xs text-white/50">Categoria</Label>
            <Select
              value={form.categoria}
              onValueChange={(value) =>
                onChange({
                  ...form,
                  categoria: value as ExtraCategory,
                  preco_mensal: value === "fixo" ? "" : form.preco_mensal,
                })
              }
            >
              <SelectTrigger className="glass-input border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fixo">Único</SelectItem>
                <SelectItem value="intermediario">Pro</SelectItem>
                <SelectItem value="mensal">Assinatura</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-white/50">Descrição</Label>
            <Textarea
              className="glass-input border-white/10 text-white min-h-[96px]"
              value={form.descricao}
              onChange={(event) => onChange({ ...form, descricao: event.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-white/50">Ativação (R$)</Label>
              <Input
                type="number"
                min={0}
                className="glass-input border-white/10 text-white h-10"
                value={form.preco_ativacao}
                onChange={(event) => onChange({ ...form, preco_ativacao: event.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-white/50">Mensal (R$)</Label>
              <Input
                type="number"
                min={0}
                disabled={form.categoria === "fixo"}
                className="glass-input border-white/10 text-white h-10 disabled:opacity-50"
                value={form.categoria === "fixo" ? "" : form.preco_mensal}
                onChange={(event) => onChange({ ...form, preco_mensal: event.target.value })}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-white/50">Status</Label>
            <Select
              value={form.status}
              onValueChange={(value) =>
                onChange({ ...form, status: value as "ativo" | "inativo" })
              }
            >
              <SelectTrigger className="glass-input border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ativo">Ativo</SelectItem>
                <SelectItem value="inativo">Inativo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            className="gradient-primary border-0 text-white"
            onClick={() => void onSubmit()}
            disabled={saving || !form.nome.trim()}
          >
            {saving ? "Salvando..." : editing ? "Salvar alterações" : "Criar item"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
