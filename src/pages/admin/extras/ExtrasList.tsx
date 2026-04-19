import { useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Package, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { DeleteConfirmDialog, useDeleteConfirm } from "@/components/DeleteConfirmDialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ExtraCard } from "@/features/extras/components/ExtraCard";
import { ExtraFilterBar } from "@/features/extras/components/ExtraFilterBar";
import { useExtras } from "@/features/extras/hooks/useExtras";
import {
  ExtraCatalogItem,
  ExtraCategory,
  ExtraFormInput,
  PackageFormInput,
  PackageItem,
} from "@/features/extras/services/extra-service";

type CatalogFilter = "todos" | ExtraCategory | "pacotes";

type ExtraDialogState = {
  open: boolean;
  item: ExtraCatalogItem | null;
};

type PackageDialogState = {
  open: boolean;
  item: PackageItem | null;
};

const emptyExtraForm = {
  nome: "",
  descricao: "",
  categoria: "fixo" as ExtraCategory,
  preco_ativacao: "",
  preco_mensal: "",
  status: "ativo" as "ativo" | "inativo",
};

const emptyPackageForm = {
  nome: "",
  descricao: "",
  preco_total: "",
  itemIds: [] as string[],
};

function ExtraUpsertDialog({
  open,
  onOpenChange,
  form,
  onChange,
  onSubmit,
  saving,
  editing,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: typeof emptyExtraForm;
  onChange: (value: typeof emptyExtraForm) => void;
  onSubmit: () => Promise<void>;
  saving: boolean;
  editing: boolean;
}) {
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

function PackageUpsertDialog({
  open,
  onOpenChange,
  form,
  catalog,
  onChange,
  onSubmit,
  onCreateItem,
  saving,
  editing,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: typeof emptyPackageForm;
  catalog: ExtraCatalogItem[];
  onChange: (value: typeof emptyPackageForm) => void;
  onSubmit: () => Promise<void>;
  onCreateItem?: () => void;
  saving: boolean;
  editing: boolean;
}) {
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

function AssignItemDialog({
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
}: {
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
}) {
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

function AddToPackageDialog({
  open,
  onOpenChange,
  item,
  packages,
  selectedPackageId,
  onPackageChange,
  onSubmit,
  saving,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: ExtraCatalogItem | null;
  packages: PackageItem[];
  selectedPackageId: string;
  onPackageChange: (value: string) => void;
  onSubmit: () => Promise<void>;
  saving: boolean;
}) {
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

export default function ExtrasList() {
  const navigate = useNavigate();
  const {
    catalog,
    packages,
    packageItems,
    clients,
    loading,
    createExtra,
    updateExtra,
    deleteExtra,
    createPackage,
    updatePackage,
    deletePackage,
    addExtraToPackage,
    assignItemToClient,
  } = useExtras();

  const [filtro, setFiltro] = useState<CatalogFilter>("todos");
  const [busca, setBusca] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [extraDialog, setExtraDialog] = useState<ExtraDialogState>({ open: false, item: null });
  const [packageDialog, setPackageDialog] = useState<PackageDialogState>({ open: false, item: null });
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedAssignItem, setSelectedAssignItem] = useState<ExtraCatalogItem | PackageItem | null>(null);
  const [selectedClientId, setSelectedClientId] = useState("");
  const [assignmentNote, setAssignmentNote] = useState("");
  const [addToPackageOpen, setAddToPackageOpen] = useState(false);
  const [selectedPackageId, setSelectedPackageId] = useState("");
  const [selectedCatalogItem, setSelectedCatalogItem] = useState<ExtraCatalogItem | null>(null);
  const [extraForm, setExtraForm] = useState(emptyExtraForm);
  const [packageForm, setPackageForm] = useState(emptyPackageForm);
  const { requestDelete, dialogProps } = useDeleteConfirm();

  const availablePackagesForExtra = useMemo(() => {
    if (!selectedCatalogItem) return packages;

    return packages.filter((pkg) =>
      !packageItems.some(
        (link) => link.pacote_id === pkg.id && link.extra_id === selectedCatalogItem.id,
      ),
    );
  }, [packageItems, packages, selectedCatalogItem]);

  const filteredItems = useMemo(() => {
    const matchesSearch = (value: { nome: string; descricao?: string | null }) =>
      value.nome.toLowerCase().includes(busca.toLowerCase()) ||
      (value.descricao?.toLowerCase() || "").includes(busca.toLowerCase());

    if (filtro === "pacotes") {
      return packages.filter(matchesSearch);
    }

    let list = filtro === "todos" ? catalog : catalog.filter((item) => item.categoria === filtro);
    return list.filter(matchesSearch);
  }, [busca, catalog, filtro, packages]);

  const openCreateExtraDialog = () => {
    setExtraDialog({ open: true, item: null });
    setExtraForm(emptyExtraForm);
  };

  const openEditExtraDialog = (item: ExtraCatalogItem) => {
    setExtraDialog({ open: true, item });
    setExtraForm({
      nome: item.nome,
      descricao: item.descricao || "",
      categoria: item.categoria,
      preco_ativacao: String(item.preco_ativacao || 0),
      preco_mensal: String(item.preco_mensal || 0),
      status: item.status,
    });
  };

  const openCreatePackageDialog = () => {
    setPackageDialog({ open: true, item: null });
    setPackageForm(emptyPackageForm);
  };

  const openEditPackageDialog = (item: PackageItem) => {
    const linkedItemIds = packageItems
      .filter((link) => link.pacote_id === item.id)
      .map((link) => link.extra_id)
      .filter((value): value is string => Boolean(value));

    setPackageDialog({ open: true, item });
    setPackageForm({
      nome: item.nome,
      descricao: item.descricao || "",
      preco_total: String(item.preco_total || 0),
      itemIds: linkedItemIds,
    });
  };

  const handleExtraSubmit = async () => {
    const payload: ExtraFormInput = {
      nome: extraForm.nome.trim(),
      descricao: extraForm.descricao.trim() || null,
      categoria: extraForm.categoria,
      preco_ativacao: Number(extraForm.preco_ativacao || 0),
      preco_mensal: extraForm.categoria === "fixo" ? 0 : Number(extraForm.preco_mensal || 0),
      status: extraForm.status,
    };

    setSubmitting(true);

    try {
      if (extraDialog.item) {
        await updateExtra({ id: extraDialog.item.id, extra: payload });
      } else {
        await createExtra(payload);
      }

      setFiltro(payload.categoria);
      setBusca("");
      setExtraDialog({ open: false, item: null });
      setExtraForm(emptyExtraForm);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePackageSubmit = async () => {
    const payload: PackageFormInput = {
      nome: packageForm.nome.trim(),
      descricao: packageForm.descricao.trim() || null,
      preco_total: Number(packageForm.preco_total || 0),
      itemIds: packageForm.itemIds,
    };

    setSubmitting(true);

    try {
      if (packageDialog.item) {
        await updatePackage({ id: packageDialog.item.id, pkg: payload });
      } else {
        await createPackage(payload);
      }

      setFiltro("pacotes");
      setBusca("");
      setPackageDialog({ open: false, item: null });
      setPackageForm(emptyPackageForm);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAssignSubmit = async () => {
    if (!selectedAssignItem || !selectedClientId) return;

    setSubmitting(true);

    try {
      await assignItemToClient({
        clientId: selectedClientId,
        item: selectedAssignItem,
        note: assignmentNote.trim() || null,
      });

      setAssignDialogOpen(false);
      setSelectedAssignItem(null);
      setSelectedClientId("");
      setAssignmentNote("");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddToPackageSubmit = async () => {
    if (!selectedCatalogItem || !selectedPackageId) return;

    setSubmitting(true);

    try {
      await addExtraToPackage({
        packageId: selectedPackageId,
        extraId: selectedCatalogItem.id,
      });

      setAddToPackageOpen(false);
      setSelectedCatalogItem(null);
      setSelectedPackageId("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <ExtraFilterBar busca={busca} setBusca={setBusca} filtro={filtro} setFiltro={setFiltro} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm text-white/40">
          {loading
            ? "Atualizando catálogo..."
            : `${filteredItems.length} item(ns) encontrados no filtro atual.`}
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            className="h-10 border-white/10 bg-white/5 text-white hover:bg-white/10"
            onClick={openCreatePackageDialog}
          >
            <Package className="mr-2 h-4 w-4" />
            Novo pacote
          </Button>
          <Button
            className="h-10 gradient-primary border-0 text-white"
            onClick={openCreateExtraDialog}
          >
            <Plus className="mr-2 h-4 w-4" />
            Novo item
          </Button>
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <div className="space-y-4 rounded-3xl border border-white/10 bg-white/[0.03] px-6 py-16 text-center text-white/40">
          <p>Nenhum item encontrado para este filtro.</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button
              variant="outline"
              className="border-white/10 bg-white/5 text-white hover:bg-white/10"
              onClick={openCreatePackageDialog}
            >
              <Package className="mr-2 h-4 w-4" />
              Novo pacote
            </Button>
            <Button className="gradient-primary border-0 text-white" onClick={openCreateExtraDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Novo item
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredItems.map((item) => {
              const isPackage = filtro === "pacotes";

              return (
                <ExtraCard
                  key={item.id}
                  item={item}
                  isPkg={isPackage}
                  onUpdate={(id, data) => void updateExtra({ id, extra: data })}
                  onDelete={(id) =>
                    requestDelete(
                      async () => {
                        if (isPackage) {
                          await deletePackage(id);
                        } else {
                          await deleteExtra(id);
                        }
                      },
                      isPackage ? "Excluir pacote" : "Excluir item",
                      isPackage
                        ? "Deseja remover este pacote do catálogo? Pacotes em uso precisam ser desativados antes."
                        : "Deseja remover este item do catálogo? Itens em uso precisam ser desativados ou desvinculados antes.",
                    )
                  }
                  onAssign={(selected) => {
                    setSelectedAssignItem(selected);
                    setSelectedClientId("");
                    setAssignmentNote("");
                    setAssignDialogOpen(true);
                  }}
                  onEdit={(selected) => {
                    if (isPackage) {
                      openEditPackageDialog(selected as PackageItem);
                      return;
                    }

                    openEditExtraDialog(selected as ExtraCatalogItem);
                  }}
                  onAddToPackage={(selected) => {
                    setSelectedCatalogItem(selected as ExtraCatalogItem);
                    setSelectedPackageId("");
                    setAddToPackageOpen(true);
                  }}
                />
              );
            })}
          </AnimatePresence>
        </div>
      )}

      <ExtraUpsertDialog
        open={extraDialog.open}
        onOpenChange={(open) => {
          setExtraDialog((current) => ({ ...current, open }));
          if (!open) setExtraForm(emptyExtraForm);
        }}
        form={extraForm}
        onChange={setExtraForm}
        onSubmit={handleExtraSubmit}
        saving={submitting}
        editing={Boolean(extraDialog.item)}
      />

      <PackageUpsertDialog
        open={packageDialog.open}
        onOpenChange={(open) => {
          setPackageDialog((current) => ({ ...current, open }));
          if (!open) setPackageForm(emptyPackageForm);
        }}
        form={packageForm}
        catalog={catalog}
        onChange={setPackageForm}
        onSubmit={handlePackageSubmit}
        onCreateItem={() => {
          setPackageDialog({ open: false, item: null });
          setPackageForm(emptyPackageForm);
          openCreateExtraDialog();
        }}
        saving={submitting}
        editing={Boolean(packageDialog.item)}
      />

      <AssignItemDialog
        open={assignDialogOpen}
        onOpenChange={(open) => {
          setAssignDialogOpen(open);
          if (!open) {
            setSelectedAssignItem(null);
            setSelectedClientId("");
            setAssignmentNote("");
          }
        }}
        item={selectedAssignItem}
        clients={clients}
        selectedClientId={selectedClientId}
        note={assignmentNote}
        onClientChange={setSelectedClientId}
        onNoteChange={setAssignmentNote}
        onSubmit={handleAssignSubmit}
        onGoToClients={() => {
          setAssignDialogOpen(false);
          setSelectedAssignItem(null);
          setSelectedClientId("");
          setAssignmentNote("");
          navigate("/admin/clientes");
        }}
        saving={submitting}
      />

      <AddToPackageDialog
        open={addToPackageOpen}
        onOpenChange={(open) => {
          setAddToPackageOpen(open);
          if (!open) {
            setSelectedCatalogItem(null);
            setSelectedPackageId("");
          }
        }}
        item={selectedCatalogItem}
        packages={availablePackagesForExtra}
        selectedPackageId={selectedPackageId}
        onPackageChange={setSelectedPackageId}
        onSubmit={handleAddToPackageSubmit}
        saving={submitting}
      />

      <DeleteConfirmDialog {...dialogProps} />
    </div>
  );
}
