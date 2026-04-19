import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { useReducedMotion } from "framer-motion";
import {
  ContractBuilderPayload,
  ContractBuilderStepIndex,
  ContractBuilderPricing,
  ContractBuilderClientExtraSnapshot,
  BuilderPrimaryPlanId,
  buildBuilderDirtySignature,
  createEmptyBuilderPayload,
  computeBuilderPricing,
  selectPrimaryPlan,
  normalizeBuilderPayload,
  normalizeBuilderStep,
  hasMeaningfulBuilderState,
  buildBuilderSavePayload,
  ContractRecoveryOriginAction,
  saveContractRecoverySnapshot,
  clearContractRecoverySnapshot,
  BUILDER_STEPS,
  BUILDER_TEMPLATE_ID,
  RESIGN_REASON_DEFAULT,
} from "@/lib/contract-builder";
import {
  getContractErrorMessage,
  generateContractPDF,
  downloadWordDocument,
  formatContractClock,
  parseMoneyInput,
  formatMoneyInputValue,
  buildPricingMoneyDraftKey,
} from "@/lib/contract-utils";
import {
  saveBuilderContractDirectly,
  fetchActiveClientExtras,
  runContractRealtimeSideEffects,
  hasSignedContractMaterialChanges,
} from "@/features/contracts/services";
import { Contrato, ExtraCatalogo, Cliente } from "@/features/contracts/types";
import { mapClientExtraToSnapshot } from "@/lib/contract-builder-utils";

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

  const contractRecoveryAutosaveSignatureRef = useRef<string | null>(null);
  const contractRemoteAutosaveSignatureRef = useRef<string | null>(null);

  const moneyDraftFieldPattern = /^(pricing):(.+):(discountValue|entryValue|negotiatedMonthly)$/;

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
    [builderStep, editingBuilderContract, extrasCatalogo, saveBuilderContractDirectly, saveBuilderRecoveryLocally, setTab, syncBuilderSavedState, syncMoneyDraftsToState, toast, upsertContratoState],
  );

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
    workingBuilderPayload,
    resetBuilder,
    openBuilderContract,
    persistBuilderDraft,
  };
}
