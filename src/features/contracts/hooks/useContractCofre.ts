import { useState, useMemo, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { setContractArchived, deleteBuilderDraftContract } from "@/features/contracts/services";
import { Contrato, CONTRACT_STATUS_ORDER } from "@/features/contracts/types";
import { getContractStatusLabel, getContractStatusBadgeClass } from "@/lib/contract-status";
import { formatContratoValue } from "@/lib/contract-utils";

interface UseContractCofreProps {
  contratos: Contrato[];
  setContratos: React.Dispatch<React.SetStateAction<Contrato[]>>;
  upsertContratoState: (contrato: Contrato) => void;
  removeContratoState: (contractId: string) => void;
}

export function useContractCofre({ 
  contratos, 
  setContratos, 
  upsertContratoState,
  removeContratoState 
}: UseContractCofreProps) {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [cofreFilter, setCofreFilter] = useState<"ativos" | "arquivados">("ativos");
  const [cofreStatusFilter, setCofreStatusFilter] = useState<"todos" | "rascunho" | "enviado" | "visualizado" | "assinado" | "cancelado">("todos");
  const [deleteTarget, setDeleteTarget] = useState<Contrato | null>(null);

  const filteredContratos = useMemo(() => {
    return contratos.filter((contrato) => {
      const isArchived = Boolean(contrato.archived_at);
      if (cofreFilter === "ativos" && isArchived) return false;
      if (cofreFilter === "arquivados" && !isArchived) return false;
      if (cofreStatusFilter !== "todos" && contrato.status !== cofreStatusFilter) return false;

      const term = searchTerm.trim().toLowerCase();
      if (!term) return true;

      return (
        contrato.titulo?.toLowerCase().includes(term) ||
        (contrato.clientes as any)?.nome?.toLowerCase().includes(term)
      );
    });
  }, [cofreFilter, cofreStatusFilter, contratos, searchTerm]);

  const activeContractsCount = useMemo(
    () => contratos.filter((contrato) => !contrato.archived_at).length,
    [contratos],
  );

  const archivedContractsCount = useMemo(
    () => contratos.filter((contrato) => Boolean(contrato.archived_at)).length,
    [contratos],
  );

  const contractStatusCounts = useMemo(
    () =>
      contratos.reduce<Record<string, number>>((acc, contrato) => {
        acc[contrato.status] = (acc[contrato.status] || 0) + 1;
        return acc;
      }, {}),
    [contratos],
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
