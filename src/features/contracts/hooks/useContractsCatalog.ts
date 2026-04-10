import { useCallback, type Dispatch, type SetStateAction } from "react";

import type { ContractEventRow } from "@/lib/contract-activity";

import { fetchActiveClientes, fetchActiveExtrasCatalog, fetchBuilderContracts, fetchContractEvents } from "../services";
import type { Cliente, Contrato, ExtraCatalogo } from "../types";

type UseContractsCatalogParams = {
  decorateContrato: (contrato: Contrato) => Contrato;
  sortContratosByUpdatedAt: (items: Contrato[]) => Contrato[];
  sortContractEvents: (items: ContractEventRow[]) => ContractEventRow[];
  setContratos: Dispatch<SetStateAction<Contrato[]>>;
  setContratosLoaded: Dispatch<SetStateAction<boolean>>;
  setClientes: Dispatch<SetStateAction<Cliente[]>>;
  setExtrasCatalogo: Dispatch<SetStateAction<ExtraCatalogo[]>>;
  setExtrasLoaded: Dispatch<SetStateAction<boolean>>;
  setPreviewContractEvents: Dispatch<SetStateAction<ContractEventRow[]>>;
  setPreviewContractEventsLoading: Dispatch<SetStateAction<boolean>>;
};

export function useContractsCatalog({
  decorateContrato,
  sortContratosByUpdatedAt,
  sortContractEvents,
  setContratos,
  setContratosLoaded,
  setClientes,
  setExtrasCatalogo,
  setExtrasLoaded,
  setPreviewContractEvents,
  setPreviewContractEventsLoading,
}: UseContractsCatalogParams) {
  const loadContratos = useCallback(async () => {
    try {
      const data = await fetchBuilderContracts();
      setContratos(sortContratosByUpdatedAt((data || []).map((item) => decorateContrato(item))));
    } finally {
      setContratosLoaded(true);
    }
  }, [decorateContrato, setContratos, setContratosLoaded, sortContratosByUpdatedAt]);

  const loadClientes = useCallback(async () => {
    const data = await fetchActiveClientes();
    setClientes(data);
    return data;
  }, [setClientes]);

  const loadExtrasCatalogo = useCallback(async () => {
    const extras = await fetchActiveExtrasCatalog();
    setExtrasCatalogo(extras);
    setExtrasLoaded(true);
    return extras;
  }, [setExtrasCatalogo, setExtrasLoaded]);

  const loadPreviewContractEvents = useCallback(
    async (contractId: string) => {
      setPreviewContractEventsLoading(true);

      try {
        const data = await fetchContractEvents(contractId);
        setPreviewContractEvents(sortContractEvents(data));
      } catch (error) {
        setPreviewContractEvents([]);
        throw error;
      } finally {
        setPreviewContractEventsLoading(false);
      }
    },
    [setPreviewContractEvents, setPreviewContractEventsLoading, sortContractEvents],
  );

  return {
    loadContratos,
    loadClientes,
    loadExtrasCatalogo,
    loadPreviewContractEvents,
  };
}
