import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ExtraCatalogItem, PackageItem } from "@/features/extras/services/extra-service";

interface AddToPackageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: ExtraCatalogItem | null;
  packages: PackageItem[];
  selectedPackageId: string;
  onPackageChange: (value: string) => void;
  onSubmit: () => Promise<void>;
  saving: boolean;
}

export function AddToPackageDialog({
  open,
  onOpenChange,
  item,
  packages,
  selectedPackageId,
  onPackageChange,
  onSubmit,
  saving,
}: AddToPackageDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card border-[0.5px] text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white">Adicionar ao pacote</DialogTitle>
          <DialogDescription className="text-white/50">
            Vincule este item a um pacote já existente no catálogo.
          </DialogDescription>
        </DialogHeader>

        {item && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <p className="text-sm font-semibold text-white">{item.nome}</p>
              <p className="text-xs text-white/40 mt-1">Selecione o pacote que receberá este item.</p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-white/50">Pacote</Label>
              <Select value={selectedPackageId} onValueChange={onPackageChange}>
                <SelectTrigger className="glass-input border-white/10 text-white">
                  <SelectValue placeholder="Selecione o pacote" />
                </SelectTrigger>
                <SelectContent>
                  {packages.map((pkg) => (
                    <SelectItem key={pkg.id} value={pkg.id}>
                      {pkg.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            className="gradient-primary border-0 text-white"
            onClick={() => void onSubmit()}
            disabled={saving || !selectedPackageId}
          >
            {saving ? "Atualizando..." : "Adicionar ao pacote"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
