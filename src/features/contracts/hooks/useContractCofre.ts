import { useState, useMemo, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { setContractArchived, deleteBuilderDraftContract } from "@/features/contracts/services";
import { Contrato, CONTRACT_STATUS_OPTIONS } from "@/features/contracts/types";
import { ensureArray, noopContractAction } from "@/features/contracts/runtime";
import { normalizeContractStatus } from "@/lib/contract-status";

interface UseContractCofreProps {
  contratos: Contrato[];
  setContratos: React.Dispatch<React.SetStateAction<Contrato[]>>;
  upsertContratoState: (contrato: Contrato) => void;
  removeContratoState: (contractId: string) => void;
}

type UseContractCofreInput = Partial<UseContractCofreProps>;

export function useContractCofre({
  contratos = [],
  setContratos,
  upsertContratoState = noopContractAction,
  removeContratoState = () => undefined,
}: UseContractCofreInput = {}) {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [cofreFilter, setCofreFilter] = useState<"ativos" | "arquivados">("ativos");
  const [cofreStatusFilter, setCofreStatusFilter] = useState<"todos" | (typeof CONTRACT_STATUS_OPTIONS)[number]["value"]>("todos");
  const [deleteTarget, setDeleteTarget] = useState<Contrato | null>(null);
  const safeContratos = useMemo(() => ensureArray(contratos), [contratos]);

  const filteredContratos = useMemo(() => {
    return safeContratos.filter((contrato) => {
      const isArchived = Boolean(contrato.archived_at);
      if (cofreFilter === "ativos" && isArchived) return false;
      if (cofreFilter === "arquivados" && !isArchived) return false;
      if (cofreStatusFilter !== "todos" && normalizeContractStatus(contrato.status) !== cofreStatusFilter) return false;

      const term = searchTerm.trim().toLowerCase();
      if (!term) return true;

      return (
        contrato.titulo?.toLowerCase().includes(term) ||
        (contrato.clientes as any)?.nome?.toLowerCase().includes(term)
      );
    });
  }, [cofreFilter, cofreStatusFilter, safeContratos, searchTerm]);

  const activeContractsCount = useMemo(
    () => safeContratos.filter((contrato) => !contrato.archived_at).length,
    [safeContratos],
  );

  const archivedContractsCount = useMemo(
    () => safeContratos.filter((contrato) => Boolean(contrato.archived_at)).length,
    [safeContratos],
  );

  const contractStatusCounts = useMemo(
    () =>
      safeContratos.reduce<Record<string, number>>((acc, contrato) => {
        const key = normalizeContractStatus(contrato.status);
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {}),
    [safeContratos],
  );

  const handleArchiveContract = useCallback(
    async (target: Contrato) => {
      try {
        const updated = await setContractArchived(target.id, true);
        upsertContratoState(updated);
        toast({
          title: "Contrato arquivado",
          description: "O contrato foi movido para a seção de arquivados.",
        });
      } catch (error) {
        toast({
          title: "Erro ao arquivar contrato",
          description: "Não foi possível arquivar o contrato selecionado.",
          variant: "destructive",
        });
      }
    },
    [upsertContratoState, toast],
  );

  const handleUnarchiveContract = useCallback(
    async (target: Contrato) => {
      try {
        const updated = await setContractArchived(target.id, false);
        upsertContratoState(updated);
        toast({
          title: "Contrato restaurado",
          description: "O contrato foi movido de volta para a seção de ativos.",
        });
      } catch (error) {
        toast({
          title: "Erro ao restaurar contrato",
          description: "Não foi possível restaurar o contrato selecionado.",
          variant: "destructive",
        });
      }
    },
    [upsertContratoState, toast],
  );

  const handleDeleteDraft = useCallback(async () => {
    if (!deleteTarget) return;

    try {
      await deleteBuilderDraftContract(deleteTarget.id);
      removeContratoState(deleteTarget.id);
      setDeleteTarget(null);
      toast({
        title: "Rascunho excluído",
        description: "O rascunho foi removido permanentemente do cofre.",
      });
    } catch (error) {
      toast({
        title: "Erro ao excluir rascunho",
        description: "Não foi possível remover o rascunho selecionado.",
        variant: "destructive",
      });
    }
  }, [deleteTarget, removeContratoState, toast]);

  return {
    searchTerm,
    setSearchTerm,
    cofreFilter,
    setCofreFilter,
    cofreStatusFilter,
    setCofreStatusFilter,
    deleteTarget,
    setDeleteTarget,
    filteredContratos,
    activeContractsCount,
    archivedContractsCount,
    contractStatusCounts,
    handleArchiveContract,
    handleUnarchiveContract,
    handleDeleteDraft,
  };
}
