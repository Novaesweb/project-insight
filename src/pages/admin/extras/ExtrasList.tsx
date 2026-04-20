import { useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Package, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { DeleteConfirmDialog, useDeleteConfirm } from "@/components/DeleteConfirmDialog";
import { Button } from "@/components/ui/button";
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

// Componentes Modularizados
import { ExtraUpsertDialog, emptyExtraForm } from "@/features/extras/components/ExtraUpsertDialog";
import { PackageUpsertDialog, emptyPackageForm } from "@/features/extras/components/PackageUpsertDialog";
import { AssignItemDialog } from "@/features/extras/components/AssignItemDialog";
import { AddToPackageDialog } from "@/features/extras/components/AddToPackageDialog";

type CatalogFilter = "todos" | ExtraCategory | "pacotes";

type ExtraDialogState = {
  open: boolean;
  item: ExtraCatalogItem | null;
};

type PackageDialogState = {
  open: boolean;
  item: PackageItem | null;
};

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
