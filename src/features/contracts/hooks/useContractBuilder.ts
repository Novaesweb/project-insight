import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { useReducedMotion } from "framer-motion";
import {
  ContractBuilderPayload,
  ContractBuilderStepIndex,
  ContractBuilderPricing,
  ContractBuilderClientExtraSnapshot,
  BuilderPrimaryPlanId,
  createEmptyBuilderPayload,
  computeBuilderPricing,
  selectPrimaryPlan,
  buildProposalSummary,
} from "@/lib/contract-builder";
import {
  ContractRecoveryOriginAction,
  clearContractRecoverySnapshot,
  saveContractRecoverySnapshot,
} from "@/lib/contract-recovery";
import {
  buildPricingMoneyDraftKey,
  buildBuilderDirtySignature,
  buildBuilderSavePayload,
  getContractErrorMessage,
  downloadWordDocument,
  formatMoneyInputValue,
  formatContractClock,
  generateContractPDF,
  hasMeaningfulBuilderState,
  normalizeBuilderPayload,
  normalizeBuilderStep,
  parseMoneyInput,
} from "@/lib/contract-utils";
import {
  saveBuilderContractDirectly,
  fetchActiveClientExtras,
} from "@/features/contracts/services";
import { hasSignedContractMaterialChanges } from "@/features/contracts/utils";
import { BUILDER_STEPS, BUILDER_TEMPLATE_ID, Contrato, ExtraCatalogo, Cliente, RESIGN_REASON_DEFAULT } from "@/features/contracts/types";

const mapClientExtraToSnapshot = (item: any): ContractBuilderClientExtraSnapshot => ({
  id: item.id,
  extraId: item.extra_id || item.extraId || item.id,
  name: item.label || item.nome || item.name || "",
  description: item.descricao || item.description || "",
  setupPrice: Number(item.preco_setup || item.setupPrice || 0),
  monthlyPrice: Number(item.preco_mensal || item.monthlyPrice || 0),
  typeLabel: item.typeLabel === "mensal" ? "mensal" : "único",
  category: item.category === "mensal" || item.category === "intermediario" || item.category === "fixo"
    ? item.category
    : "fixo",
});

const moneyDraftFieldPattern = /^(pricing):(.+):(discountValue|entryValue|negotiatedMonthly)$/;

interface UseContractBuilderProps {
  clientes: Cliente[];
  extrasCatalogo: ExtraCatalogo[];
  extrasLoaded: boolean;
  upsertContratoState: (contrato: Contrato) => void;
  setTab: (tab: string) => void;
  setCofreFilter: (filter: "ativos" | "arquivados") => void;
  setSearchTerm: (term: string) => void;
}

export function useContractBuilder({
  clientes,
  extrasCatalogo,
  extrasLoaded,
  upsertContratoState,
  setTab,
  setCofreFilter,
  setSearchTerm,
}: UseContractBuilderProps) {
  const { toast } = useToast();
  const shouldReduceMotion = useReducedMotion();

  const [builderPayload, setBuilderPayload] = useState<ContractBuilderPayload | null>(null);
  const [editingBuilderContract, setEditingBuilderContract] = useState<Contrato | null>(null);
  const [builderStep, setBuilderStep] = useState<ContractBuilderStepIndex>(0);
  const [mobileSummaryOpen, setMobileSummaryOpen] = useState(false);
  const [moneyDrafts, setMoneyDrafts] = useState<Record<string, string>>({});
  const [syncingClientExtras, setSyncingClientExtras] = useState(false);
  const [builderRecoveredLocally, setBuilderRecoveredLocally] = useState(false);
  const [builderLastSavedSignature, setBuilderLastSavedSignature] = useState<string | null>(null);
  const [builderLastSavedAt, setBuilderLastSavedAt] = useState<string | null>(null);
  const [builderRemoteAutosaveState, setBuilderRemoteAutosaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [builderClientExtras, setBuilderClientExtras] = useState<any[]>([]);

  const contractRecoveryAutosaveSignatureRef = useRef<string | null>(null);
  const contractRemoteAutosaveSignatureRef = useRef<string | null>(null);

  const syncBuilderSavedState = useCallback(
    (payload: ContractBuilderPayload, step: ContractBuilderStepIndex, savedAt?: string | null) => {
      const sig = buildBuilderDirtySignature(payload, step);
      setBuilderLastSavedSignature(sig);
      setBuilderLastSavedAt(savedAt || null);
      setBuilderRecoveredLocally(false);
      setBuilderRemoteAutosaveState(savedAt ? "saved" : "idle");
      contractRecoveryAutosaveSignatureRef.current = sig;
      contractRemoteAutosaveSignatureRef.current = sig;
    },
    [],
  );

  const saveBuilderRecoveryLocally = useCallback(
    (
      payload: ContractBuilderPayload,
      step: ContractBuilderStepIndex,
      originAction: ContractRecoveryOriginAction,
      options?: { markPendingRestore?: boolean },
    ) => {
      if (!hasMeaningfulBuilderState(payload) && !editingBuilderContract?.id) {
        return;
      }

      saveContractRecoverySnapshot(
        {
          contractId: editingBuilderContract?.id ?? null,
          builderPayload: payload,
          lastStep: step,
          savedAt: new Date().toISOString(),
          originAction,
          payloadSignature: buildBuilderDirtySignature(payload, step),
        },
        options,
      );
    },
    [editingBuilderContract?.id],
  );

  const recalculateBuilderPricing = useCallback(
    (
      items: ContractBuilderPayload["items"],
      previousPricing: ContractBuilderPricing,
      clientExtrasSnapshot: ContractBuilderClientExtraSnapshot[] = [],
    ) => {
      const basePricing = computeBuilderPricing(items, clientExtrasSnapshot);
      const negotiatedMonthly =
        previousPricing.negotiatedMonthly === previousPricing.monthlySubtotal
          ? basePricing.monthlySubtotal
          : previousPricing.negotiatedMonthly;

      return computeBuilderPricing(items, clientExtrasSnapshot, {
        negotiatedSetup: basePricing.setupSubtotal,
        discountType: previousPricing.discountType === "percentage" ? "percentage" : "fixed",
        discountValue: previousPricing.discountValue,
        entryValue: previousPricing.entryValue,
        negotiatedMonthly,
      });
    },
    [],
  );

  const applyMoneyDraftsToPayload = useCallback(
    (payload: ContractBuilderPayload) => {
      const draftEntries = Object.entries(moneyDrafts);
      if (draftEntries.length === 0) return payload;

      let nextPayload: ContractBuilderPayload = {
        ...payload,
        pricing: { ...payload.pricing },
      };

      for (const [key, draftValue] of draftEntries) {
        const matched = key.match(moneyDraftFieldPattern);
        if (!matched) continue;

        const [, target, , fieldName] = matched;
        const numericValue = Math.max(parseMoneyInput(draftValue), 0);

        if (
          target === "pricing" &&
          (fieldName === "discountValue" || fieldName === "entryValue" || fieldName === "negotiatedMonthly")
        ) {
          const nextPricing = { ...nextPayload.pricing };

          if (fieldName === "discountValue") nextPricing.discountValue = numericValue;
          if (fieldName === "entryValue") nextPricing.entryValue = numericValue;
          if (fieldName === "negotiatedMonthly") nextPricing.negotiatedMonthly = numericValue;

          nextPayload = {
            ...nextPayload,
            pricing: recalculateBuilderPricing(
              nextPayload.items,
              nextPricing,
              nextPayload.clientExtrasSnapshot,
            ),
          };
        }
      }

      return {
        ...nextPayload,
        updatedAt: new Date().toISOString(),
      };
    },
    [moneyDrafts, recalculateBuilderPricing],
  );

  const getWorkingBuilderPayload = useCallback(
    () => (builderPayload ? applyMoneyDraftsToPayload(builderPayload) : null),
    [applyMoneyDraftsToPayload, builderPayload],
  );

  const workingBuilderPayload = useMemo(
    () => (builderPayload ? applyMoneyDraftsToPayload(builderPayload) : null),
    [applyMoneyDraftsToPayload, builderPayload],
  );

  const syncMoneyDraftsToState = useCallback(() => {
    const currentPayload = getWorkingBuilderPayload();
    if (!currentPayload) return null;

    if (Object.keys(moneyDrafts).length > 0) {
      setBuilderPayload(currentPayload);
      setMoneyDrafts({});
    }

    return currentPayload;
  }, [getWorkingBuilderPayload, moneyDrafts]);

  const onUpdateTextField = useCallback((field: any, value: string) => {
    setBuilderPayload(current => {
      if (!current) return null;
      return {
        ...current,
        [field]: value,
        updatedAt: new Date().toISOString()
      };
    });
  }, []);

  const onUpdateContractante = useCallback((field: string, value: string) => {
    setBuilderPayload(current => {
      if (!current) return null;
      return {
        ...current,
        contractante: { ...current.contractante, [field]: value },
        updatedAt: new Date().toISOString()
      };
    });
  }, []);

  const onUpdateContratada = useCallback((field: string, value: string) => {
    setBuilderPayload(current => {
      if (!current) return null;
      return {
        ...current,
        contratada: { ...current.contratada, [field]: value },
        updatedAt: new Date().toISOString()
      };
    });
  }, []);

  const onPrimaryPlanChange = useCallback((planId: BuilderPrimaryPlanId) => {
    setBuilderPayload(current => {
      if (!current) return null;
      const nextItems = selectPrimaryPlan(current.items, planId);
      return {
        ...current,
        primaryPlanId: planId,
        items: nextItems,
        pricing: recalculateBuilderPricing(nextItems, current.pricing, current.clientExtrasSnapshot),
        updatedAt: new Date().toISOString()
      };
    });
  }, [recalculateBuilderPricing]);

  const onDiscountTypeChange = useCallback((type: ContractBuilderPricing["discountType"]) => {
    setBuilderPayload(current => {
      if (!current) return null;
      const nextPricing = { ...current.pricing, discountType: type };
      return {
        ...current,
        pricing: recalculateBuilderPricing(current.items, nextPricing, current.clientExtrasSnapshot),
        updatedAt: new Date().toISOString()
      };
    });
  }, [recalculateBuilderPricing]);

  const setMoneyDraftValue = useCallback((key: string, value: string) => {
    setMoneyDrafts((current) => ({
      ...current,
      [key]: value,
    }));
  }, []);

  const clearMoneyDraftValue = useCallback((key: string) => {
    setMoneyDrafts((current) => {
      if (!(key in current)) return current;
      const nextDrafts = { ...current };
      delete nextDrafts[key];
      return nextDrafts;
    });
  }, []);

  const onPricingChange = useCallback((field: any, value: string) => {
    setMoneyDraftValue(buildPricingMoneyDraftKey(field), value);
  }, [setMoneyDraftValue]);

  const onMoneyDraftBlur = useCallback((key: string) => {
    if (!(key in moneyDrafts)) return;
    const currentPayload = getWorkingBuilderPayload();
    if (!currentPayload) return;
    setBuilderPayload(currentPayload);
    clearMoneyDraftValue(key);
  }, [clearMoneyDraftValue, getWorkingBuilderPayload, moneyDrafts]);

  const onClientChange = useCallback(async (clienteId: string) => {
    const cliente = clientes.find(c => c.id === clienteId);
    if (!cliente) return;

    setBuilderPayload(current => {
      if (!current) return null;
      return {
        ...current,
        clienteId,
        contractante: {
          ...current.contractante,
          nome: cliente.nome,
          documento: cliente.documento || "",
          endereco: cliente.endereco || "",
          email: cliente.email || ""
        },
        updatedAt: new Date().toISOString()
      };
    });

    setSyncingClientExtras(true);
    try {
      const extras = await fetchActiveClientExtras(clienteId);
      setBuilderClientExtras(extras);
      setBuilderPayload(current => {
        if (!current) return null;
        const extrasSnapshot = extras.map(mapClientExtraToSnapshot);
        return {
          ...current,
          clientExtrasSnapshot: extrasSnapshot,
          pricing: recalculateBuilderPricing(current.items, current.pricing, extrasSnapshot),
          updatedAt: new Date().toISOString()
        };
      });
    } finally {
      setSyncingClientExtras(false);
    }
  }, [clientes, recalculateBuilderPricing]);

  const onRefreshExtras = useCallback(async () => {
    if (!builderPayload?.clienteId) return;
    setSyncingClientExtras(true);
    try {
      const extras = await fetchActiveClientExtras(builderPayload.clienteId);
      setBuilderClientExtras(extras);
      setBuilderPayload(current => {
        if (!current) return null;
        const extrasSnapshot = extras.map(mapClientExtraToSnapshot);
        return {
          ...current,
          clientExtrasSnapshot: extrasSnapshot,
          pricing: recalculateBuilderPricing(current.items, current.pricing, extrasSnapshot),
          updatedAt: new Date().toISOString()
        };
      });
    } finally {
      setSyncingClientExtras(false);
    }
  }, [builderPayload?.clienteId, recalculateBuilderPricing]);

  const getBuilderStepError = useCallback((step: number) => {
    const current = getWorkingBuilderPayload();
    if (!current) return "Aguarde o carregamento...";
    
    if (step === 0 && !current.clienteId) return "Selecione um cliente.";
    if (step === 1) {
      if (!current.contractante.nome.trim()) return "Nome do contratante obrigatório.";
      if (!current.contratada.nome.trim()) return "Nome da contratada obrigatório.";
      if (!current.contratada.representante.trim()) return "Representante obrigatório.";
      if (!current.contratada.documento.trim()) return "Documento obrigatório.";
      if (!current.contratada.endereco.trim()) return "Endereço obrigatório.";
    }
    if (step === 2) {
       const hasLegacy = current.items.some(i => !i.isPrimaryPlan && i.selected);
       if (current.primaryPlanId === 'none' && !hasLegacy) return "Selecione um plano.";
    }
    return null;
  }, [getWorkingBuilderPayload]);

  const resetBuilder = useCallback(() => {
    if (!extrasLoaded) return;
    const emptyPayload = createEmptyBuilderPayload(extrasCatalogo);
    setBuilderPayload(emptyPayload);
    setEditingBuilderContract(null);
    setBuilderStep(0);
    setMobileSummaryOpen(false);
    setMoneyDrafts({});
    setBuilderRemoteAutosaveState("idle");
    contractRemoteAutosaveSignatureRef.current = null;
    syncBuilderSavedState(emptyPayload, 0, null);
    clearContractRecoverySnapshot();
    setTab("montador");
  }, [extrasCatalogo, extrasLoaded, setTab, syncBuilderSavedState]);

  const openBuilderContract = useCallback(
    (contrato: Contrato) => {
      const payload = normalizeBuilderPayload(contrato.builder_payload, extrasCatalogo, contrato.cliente_id);
      const restoredStep = normalizeBuilderStep(payload.lastStep, 4);

      setBuilderPayload(payload);
      setEditingBuilderContract(contrato);
      setBuilderStep(restoredStep);
      setMobileSummaryOpen(false);
      setMoneyDrafts({});
      setBuilderRemoteAutosaveState("saved");
      syncBuilderSavedState(payload, restoredStep, contrato.updated_at || contrato.created_at);
      setTab("montador");
    },
    [extrasCatalogo, setTab, syncBuilderSavedState],
  );

  const persistBuilderDraft = useCallback(
    async ({
      exitAfterSave = false,
      requireCompleteValidation = false,
      silent = false,
      autosaveRemote = false,
    }: {
      exitAfterSave?: boolean;
      requireCompleteValidation?: boolean;
      silent?: boolean;
      autosaveRemote?: boolean;
    } = {}) => {
      const currentPayload = syncMoneyDraftsToState();
      if (!currentPayload) return false;
      
      // Basic validation logic moved from ContractsPage
      const getBuilderStepError = (step: number) => {
        if (step === 0 && !currentPayload.clienteId) return "Selecione um cliente para iniciar a proposta.";
        if (step === 1) {
            if (!currentPayload.contractante.nome.trim()) return "Preencha o nome do contratante.";
            if (!currentPayload.contratada.nome.trim()) return "Preencha o nome da contratada.";
        }
        return null;
      };

      const validateAll = () => [0, 1, 2, 3].every(s => !getBuilderStepError(s));
      if (requireCompleteValidation && !validateAll()) {
         if (!silent) toast({ title: "Revise os dados da proposta", variant: "destructive" });
         return false;
      }

      try {
        const prepared = buildBuilderSavePayload(currentPayload, builderStep);
        if (!prepared) return false;

        const isResignAlreadyPending = Boolean((editingBuilderContract as any)?.requer_reassinatura);
        const shouldRequireResignature = Boolean(
          editingBuilderContract &&
            requireCompleteValidation &&
            !autosaveRemote &&
            (editingBuilderContract.status === "assinado" || isResignAlreadyPending) &&
            hasSignedContractMaterialChanges(editingBuilderContract, prepared, extrasCatalogo),
        );

        saveBuilderRecoveryLocally(prepared.normalizedPayload, prepared.normalizedPayload.lastStep, "save-draft");

        const nowIso = new Date().toISOString();
        const payloadToPersist = {
          cliente_id: prepared.normalizedPayload.clienteId || null,
          titulo: prepared.title,
          descricao: prepared.description,
          valor: prepared.value,
          status: shouldRequireResignature ? "enviado" : editingBuilderContract?.status || "rascunho",
          corpo: prepared.body,
          modelo: BUILDER_TEMPLATE_ID,
          builder_payload: prepared.normalizedPayload as any,
          updated_at: nowIso,
          requer_reassinatura: shouldRequireResignature ? true : isResignAlreadyPending,
        };

        if (autosaveRemote) setBuilderRemoteAutosaveState("saving");

        const savedContrato = await saveBuilderContractDirectly({
          contractId: editingBuilderContract?.id ?? null,
          payloadToPersist,
          createVersionSnapshot: !autosaveRemote,
        });

        const savedPayload = normalizeBuilderPayload(savedContrato.builder_payload, extrasCatalogo, savedContrato.cliente_id, builderStep);
        setBuilderPayload(savedPayload);
        setEditingBuilderContract(savedContrato);
        syncBuilderSavedState(savedPayload, builderStep, savedContrato.updated_at);
        upsertContratoState(savedContrato);

        if (autosaveRemote) setBuilderRemoteAutosaveState("saved");

        if (requireCompleteValidation && !silent) {
           toast({ title: "Contrato salvo no cofre!" });
           setTab("lista");
        }

        return true;
      } catch (error) {
        if (autosaveRemote) setBuilderRemoteAutosaveState("error");
        if (!silent) toast({ title: "Erro ao salvar", variant: "destructive" });
        return false;
      }
    },
    [builderStep, editingBuilderContract, extrasCatalogo, saveBuilderRecoveryLocally, setTab, syncBuilderSavedState, syncMoneyDraftsToState, toast, upsertContratoState],
  );

  const builderSummary = useMemo(() => 
    workingBuilderPayload ? buildProposalSummary(workingBuilderPayload) : null
  , [workingBuilderPayload]);

  const builderProgress = useMemo(() => 
    ((builderStep + 1) / 5) * 100
  , [builderStep]);

  const builderStatusLabel = useMemo(() => {
    if (builderRemoteAutosaveState === "saving") return { title: "Salvando...", subtitle: "Sincronizando com a nuvem" };
    if (builderRemoteAutosaveState === "saved" && builderLastSavedAt) {
      return { 
        title: "Salvo", 
        subtitle: `Última alteração às ${formatContractClock(builderLastSavedAt)}` 
      };
    }
    return { title: "Rascunho", subtitle: "As alterações são salvas automaticamente" };
  }, [builderRemoteAutosaveState, builderLastSavedAt]);

  const { builderPrepared, builderPreparedError } = useMemo(() => {
    if (!workingBuilderPayload) {
      return { builderPrepared: null, builderPreparedError: null };
    }

    try {
      return {
        builderPrepared: buildBuilderSavePayload(workingBuilderPayload, builderStep),
        builderPreparedError: null,
      };
    } catch (error) {
      return {
        builderPrepared: null,
        builderPreparedError: getContractErrorMessage(
          error,
          "Esse contrato precisa de revisao antes da visualizacao final.",
        ),
      };
    }
  }, [builderStep, workingBuilderPayload]);

  const selectedItemsCount = useMemo(() => 
    workingBuilderPayload?.items.filter(i => i.selected).length || 0
  , [workingBuilderPayload]);

  const getMoneyInputDisplayValue = (key: string, value: number): string =>
    moneyDrafts[key] ?? formatMoneyInputValue(value);

  const describeClientExtraPricing = (item: any): string => {
    const monthly = item.preco_mensal || 0;
    const setup = item.preco_setup || 0;
    if (monthly > 0 && setup > 0) return `R$ ${monthly}/mês + R$ ${setup} setup`;
    if (monthly > 0) return `R$ ${monthly}/mês`;
    if (setup > 0) return `R$ ${setup} setup`;
    return "Cortesia";
  };

  return {
    builderPayload,
    setBuilderPayload,
    editingBuilderContract,
    setEditingBuilderContract,
    builderStep,
    setBuilderStep,
    mobileSummaryOpen,
    setMobileSummaryOpen,
    moneyDrafts,
    setMoneyDraftValue,
    clearMoneyDraftValue,
    syncingClientExtras,
    setSyncingClientExtras,
    builderRecoveredLocally,
    builderLastSavedSignature,
    builderLastSavedAt,
    builderRemoteAutosaveState,
    shouldReduceMotion,
    workingBuilderPayload,
    resetBuilder,
    openBuilderContract,
    persistBuilderDraft,
    builderSummary,
    builderProgress,
    builderStatusLabel,
    builderPrepared,
    builderPreparedError,
    selectedItemsCount,
    builderClientExtras,
    onClientChange,
    onUpdateContractante,
    onUpdateContratada,
    onUpdateTextField,
    onPrimaryPlanChange,
    onDiscountTypeChange,
    onPricingChange,
    onMoneyDraftBlur,
    onRefreshExtras,
    getBuilderStepError,
    getMoneyInputDisplayValue,
    buildPricingMoneyDraftKey,
    describeClientExtraPricing,
  };
}
