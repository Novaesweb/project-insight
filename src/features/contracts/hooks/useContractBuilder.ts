import { useCallback, useEffect, useMemo, useState } from "react";
import { useReducedMotion } from "framer-motion";

import { useToast } from "@/hooks/use-toast";
import {
  buildDefaultExtraClause,
  buildProposalSummary,
  computeBuilderPricing,
  createEmptyBuilderPayload,
  formatCurrencyBRL,
  resolveContractCustomClauses,
  selectPrimaryPlan,
  type BuilderPrimaryPlanId,
  type ContractBuilderClientExtraSnapshot,
  type ContractBuilderPayload,
  type ContractBuilderStepIndex,
  type ContractStatus,
} from "@/lib/contract-builder";
import { validateAndSanitizeBuilderPayload } from "@/lib/contract-builder-schema";
import { type ContractClauseSelection } from "@/lib/contract-clauses";
import {
  buildBuilderSavePayload,
  buildPricingMoneyDraftKey,
  formatContractClock,
  getContractErrorMessage,
  normalizeBuilderPayload,
} from "@/features/contracts/utils";
import { createContractEvent } from "@/lib/contract-activity";
import { downloadWordDocument, generateContractPDF } from "@/features/contracts/documents";
import { logContractAdminError } from "@/features/contracts/debug";
import {
  fetchActiveClientExtras,
  saveBuilderContractDirectly,
  updateBuilderContractStatus,
} from "@/features/contracts/services";
import {
  EMPTY_CLIENTES,
  EMPTY_EXTRAS_CATALOGO,
  ensureArray,
  noopCofreFilterChange,
  noopContractAction,
  noopSearchChange,
  noopTabChange,
} from "@/features/contracts/runtime";
import {
  BUILDER_STEPS,
  BUILDER_TEMPLATE_ID,
  type Cliente,
  type Contrato,
  type ExtraCatalogo,
} from "@/features/contracts/types";

interface UseContractBuilderProps {
  clientes: Cliente[];
  extrasCatalogo: ExtraCatalogo[];
  extrasLoaded: boolean;
  upsertContratoState: (contrato: Contrato) => void;
  setTab: (tab: string, options?: { step?: ContractBuilderStepIndex }) => void;
  setCofreFilter: (filter: "ativos" | "arquivados") => void;
  setSearchTerm: (term: string) => void;
}

type UseContractBuilderInput = Partial<UseContractBuilderProps>;

function mapClientExtraToSnapshot(item: any, index: number): ContractBuilderClientExtraSnapshot {
  const safeItem = item && typeof item === "object" ? item : {};
  const name =
    safeItem.extras_catalogo?.nome ||
    safeItem.nome ||
    safeItem.label ||
    safeItem.name ||
    `Extra ${index + 1}`;
  const description =
    safeItem.extras_catalogo?.descricao ||
    safeItem.descricao ||
    safeItem.description ||
    "";
  const setupPrice = Number(
    safeItem.preco_ativacao ?? safeItem.preco_setup ?? safeItem.setupPrice ?? safeItem.valor ?? 0,
  );
  const monthlyPrice = Number(safeItem.preco_mensal ?? safeItem.monthlyPrice ?? 0);

  return {
    id: safeItem.id || safeItem.extra_id || safeItem.extraId || `extra-${index}`,
    extraId: safeItem.extra_id || safeItem.extraId || safeItem.id || `extra-${index}`,
    name,
    description,
    clause:
      safeItem.clausula ||
      safeItem.clause ||
      buildDefaultExtraClause({ name, description, setupPrice, monthlyPrice }),
    active: safeItem.status !== "cancelado",
    order: index,
    setupPrice,
    monthlyPrice,
  };
}

function buildPricingFromPayload(payload: ContractBuilderPayload) {
  return computeBuilderPricing(payload.items, payload.clientExtrasSnapshot, {
    baseValue: payload.pricing.baseValue,
    entryValue: payload.pricing.entryValue,
  });
}

function createEventLabel(status: ContractStatus) {
  if (status === "aprovado") return "Contrato aprovado internamente";
  if (status === "ativo") return "Contrato ativado";
  if (status === "cancelado") return "Contrato cancelado";
  if (status === "encerrado") return "Contrato encerrado";
  if (status === "assinado") return "Contrato marcado como assinado";
  if (status === "em_revisao") return "Contrato em revisao";
  return "Status do contrato atualizado";
}

function buildEmptyContractantePatch(current: ContractBuilderPayload["contractante"]) {
  return {
    ...current,
    nome: "",
    nomeEmpresa: "",
    documento: "",
    email: "",
    whatsapp: "",
    telefone: "",
    endereco: "",
    cep: "",
    cidade: "",
    estado: "",
  };
}

export function useContractBuilder({
  clientes = EMPTY_CLIENTES,
  extrasCatalogo = EMPTY_EXTRAS_CATALOGO,
  extrasLoaded = false,
  upsertContratoState = noopContractAction,
  setTab = noopTabChange,
  setCofreFilter = noopCofreFilterChange,
  setSearchTerm = noopSearchChange,
}: UseContractBuilderInput = {}) {
  const { toast } = useToast();
  const shouldReduceMotion = useReducedMotion();
  const safeClientes = useMemo(() => ensureArray(clientes), [clientes]);
  const safeExtrasCatalogo = useMemo(() => ensureArray(extrasCatalogo), [extrasCatalogo]);

  void setCofreFilter;
  void setSearchTerm;

  const [builderPayload, setBuilderPayload] = useState<ContractBuilderPayload | null>(() => {
    try {
      const saved = typeof window !== "undefined" ? localStorage.getItem("nv_contract_builder_draft") : null;
      if (!saved) return null;

      const parsed = JSON.parse(saved);
      if (!parsed || typeof parsed !== "object") return null;

      // Validate and sanitize the recovered draft to prevent crashes
      try {
        if (typeof validateAndSanitizeBuilderPayload === "function") {
          return validateAndSanitizeBuilderPayload(parsed);
        }
        console.warn("Validation function not ready during hook initialization");
        return null;
      } catch (e) {
        console.warn("Recovered draft is invalid, discarding", e);
        if (typeof window !== "undefined") {
          localStorage.removeItem("nv_contract_builder_draft");
        }
        return null;
      }
    } catch (e) {
      console.error("Failed to recover contract draft", e);
      return null;
    }
  });

  // Sync payload to localStorage
  useEffect(() => {
    if (builderPayload) {
      localStorage.setItem("nv_contract_builder_draft", JSON.stringify(builderPayload));
    } else {
      localStorage.removeItem("nv_contract_builder_draft");
    }
  }, [builderPayload]);
  const [editingBuilderContract, setEditingBuilderContract] = useState<Contrato | null>(null);
  const [builderStep, setBuilderStepState] = useState<ContractBuilderStepIndex>(() => {
    try {
      const saved = localStorage.getItem("nv_contract_builder_draft");
      if (saved) {
        const parsed = JSON.parse(saved);
        return (parsed.lastStep as ContractBuilderStepIndex) ?? 0;
      }
    } catch (e) {
      // Ignore, fallback to 0
    }
    return 0;
  });
  const [mobileSummaryOpen, setMobileSummaryOpen] = useState(false);
  const [syncingClientExtras, setSyncingClientExtras] = useState(false);
  const [builderRemoteAutosaveState, setBuilderRemoteAutosaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [builderClientExtras, setBuilderClientExtras] = useState<any[]>([]);
  const [builderLastSavedAt, setBuilderLastSavedAt] = useState<string | null>(null);

  const workingBuilderPayload = useMemo(() => {
    if (!builderPayload) return null;
    return {
      ...builderPayload,
      customClauses: resolveContractCustomClauses(builderPayload),
      pricing: buildPricingFromPayload(builderPayload),
    };
  }, [builderPayload]);

  const builderSummary = useMemo(
    () => (workingBuilderPayload ? buildProposalSummary(workingBuilderPayload) : null),
    [workingBuilderPayload],
  );

  const builderPrepared = useMemo(() => {
    if (!workingBuilderPayload) return null;

    try {
      return buildBuilderSavePayload(workingBuilderPayload, 4);
    } catch {
      return null;
    }
  }, [workingBuilderPayload]);

  const builderPreparedError = useMemo(() => {
    if (!workingBuilderPayload || builderPrepared) return null;

    try {
      buildBuilderSavePayload(workingBuilderPayload, 4);
      return null;
    } catch (error) {
      return getContractErrorMessage(error, "Esse contrato precisa de revisao antes de ser salvo.");
    }
  }, [builderPrepared, workingBuilderPayload]);

  const setBuilderStep = useCallback((nextStep: ContractBuilderStepIndex) => {
    setBuilderStepState(nextStep);
    setBuilderPayload((current) =>
      current
        ? {
            ...current,
            lastStep: nextStep,
            updatedAt: new Date().toISOString(),
          }
        : current,
    );
  }, []);

  const builderProgress = builderPayload
    ? Math.round(((builderStep + 1) / BUILDER_STEPS.length) * 100)
    : 0;

  const selectedItemsCount =
    (workingBuilderPayload?.clientExtrasSnapshot.filter((item) => item.active !== false).length || 0) +
    (workingBuilderPayload?.primaryPlanId !== "none" ? 1 : 0);

  const builderStatusLabel = useMemo(() => {
    if (builderRemoteAutosaveState === "saving") {
      return { title: "Salvando", subtitle: "Sincronizando contrato com o cofre." };
    }

    if (builderRemoteAutosaveState === "saved" && builderLastSavedAt) {
      return {
        title: "Sincronizado",
        subtitle: `Ultima atualizacao as ${formatContractClock(builderLastSavedAt)}`,
      };
    }

    if (editingBuilderContract) {
      return {
        title: "Em edicao",
        subtitle: "Continue o fluxo por etapas e finalize o documento na revisao final.",
      };
    }

    return {
      title: "Novo contrato",
      subtitle: "Preencha cada etapa, revise o resumo no topo e finalize a previa no ultimo passo.",
    };
  }, [builderLastSavedAt, builderRemoteAutosaveState, editingBuilderContract]);

  const getBuilderStepError = useCallback(
    (step: number) => {
      const current = workingBuilderPayload;
      if (!current) return "Aguarde o carregamento do contrato.";

      const clientError = !current.clienteId
        ? "Selecione um cliente para iniciar o contrato."
        : !current.contractante.nome.trim()
          ? "O nome do cliente e obrigatorio."
          : !current.contractante.documento.trim()
            ? "O documento do cliente e obrigatorio."
            : null;

      const contractError = !current.contractNumber.trim()
        ? "Informe o numero do contrato."
        : !current.issueDate
          ? "Defina a data de emissao."
          : !current.startDate
            ? "Defina a data de inicio."
            : !current.dueDate
              ? "Defina a data de vencimento."
              : !current.formaPagamento.trim()
                ? "Informe a forma de pagamento."
                : null;

      const planError = current.primaryPlanId === "none"
        ? "Escolha um plano principal para o contrato."
        : current.pricing.baseValue <= 0
          ? "Defina um valor base maior que zero."
          : null;

      const previewError = clientError || contractError || planError || builderPreparedError;

      if (step === 0) return clientError;
      if (step === 1) return contractError;
      if (step === 2) return planError;
      if (step === 3) return null;
      return previewError;
    },
    [builderPreparedError, workingBuilderPayload],
  );

  const resetBuilder = useCallback(() => {
    if (!extrasLoaded) return;

    const nextPayload = createEmptyBuilderPayload(safeExtrasCatalogo);
    nextPayload.lastStep = 0;

    setBuilderPayload(nextPayload);
    setEditingBuilderContract(null);
    setBuilderStepState(0);
    setMobileSummaryOpen(false);
    setBuilderRemoteAutosaveState("idle");
    setBuilderClientExtras([]);
    setBuilderLastSavedAt(null);
    setTab("montador", { step: 0 });
  }, [extrasLoaded, safeExtrasCatalogo, setTab]);

  const hydrateClientExtras = useCallback(async (clienteId: string) => {
    const extras = clienteId ? await fetchActiveClientExtras(clienteId) : [];
    setBuilderClientExtras(extras);

    setBuilderPayload((current) => {
      if (!current) return current;

      const extrasSnapshot = extras.map((item, index) => mapClientExtraToSnapshot(item, index));
      return {
        ...current,
        clientExtrasSnapshot: extrasSnapshot,
        pricing: computeBuilderPricing(current.items, extrasSnapshot, {
          baseValue: current.pricing.baseValue,
          entryValue: current.pricing.entryValue,
        }),
        updatedAt: new Date().toISOString(),
      };
    });
  }, []);

  const onClientChange = useCallback(
    async (clienteId: string) => {
      const cliente = safeClientes.find((entry) => entry.id === clienteId);

      if (!clienteId) {
        setBuilderPayload((current) => {
          if (!current) return current;
          return {
            ...current,
            clienteId: "",
            contractante: buildEmptyContractantePatch(current.contractante),
            clientExtrasSnapshot: [],
            pricing: computeBuilderPricing(current.items, [], {
              baseValue: current.pricing.baseValue,
              entryValue: current.pricing.entryValue,
            }),
            updatedAt: new Date().toISOString(),
          };
        });
        setBuilderClientExtras([]);
        return;
      }

      if (!cliente) {
        setBuilderPayload((current) =>
          current
            ? {
                ...current,
                clienteId,
                updatedAt: new Date().toISOString(),
              }
            : current,
        );
        setBuilderClientExtras([]);
        return;
      }

      setBuilderPayload((current) => {
        if (!current) return current;

        return {
          ...current,
          clienteId,
          contractante: {
            ...current.contractante,
            nome: cliente.nome || "",
            nomeEmpresa: cliente.nome_empresa || "",
            documento: cliente.documento || "",
            email: cliente.email || "",
            whatsapp: cliente.whatsapp || "",
            telefone: cliente.telefone || "",
            endereco: [
              cliente.endereco,
              cliente.numero_endereco,
              cliente.complemento,
              cliente.bairro,
            ]
              .filter(Boolean)
              .join(", "),
            cep: cliente.cep || "",
            cidade: cliente.cidade || "",
            estado: cliente.estado || "",
          },
          updatedAt: new Date().toISOString(),
        };
      });

      setSyncingClientExtras(true);
      try {
        await hydrateClientExtras(clienteId);
      } catch (error) {
        const debugEntry = logContractAdminError("builder-client-change", error, {
          clienteId,
          contractId: editingBuilderContract?.id || null,
        });

        setBuilderClientExtras([]);
        toast({
          title: "Extras do cliente indisponiveis",
          description: `${debugEntry.safeMessage} Ref ${debugEntry.reference}.`,
          variant: "destructive",
        });
      } finally {
        setSyncingClientExtras(false);
      }
    },
    [editingBuilderContract?.id, hydrateClientExtras, safeClientes, toast],
  );

  const onRefreshExtras = useCallback(async () => {
    if (!builderPayload?.clienteId) return;

    setSyncingClientExtras(true);
    try {
      await hydrateClientExtras(builderPayload.clienteId);
      toast({ title: "Extras sincronizados", description: "Os extras do cliente foram recarregados." });
    } catch (error) {
      const debugEntry = logContractAdminError("builder-refresh-extras", error, {
        clienteId: builderPayload.clienteId,
        contractId: editingBuilderContract?.id || null,
      });
      toast({
        title: "Nao foi possivel atualizar os extras",
        description: `${debugEntry.safeMessage} Ref ${debugEntry.reference}.`,
        variant: "destructive",
      });
    } finally {
      setSyncingClientExtras(false);
    }
  }, [builderPayload?.clienteId, editingBuilderContract?.id, hydrateClientExtras, toast]);

  const onUpdateContractante = useCallback((field: string, value: string) => {
    setBuilderPayload((current) => {
      if (!current) return current;
      return {
        ...current,
        contractante: {
          ...current.contractante,
          [field]: value,
        },
        updatedAt: new Date().toISOString(),
      };
    });
  }, []);

  const onUpdateContratada = useCallback((field: string, value: string) => {
    setBuilderPayload((current) => {
      if (!current) return current;
      return {
        ...current,
        contratada: {
          ...current.contratada,
          [field]: value,
        },
        updatedAt: new Date().toISOString(),
      };
    });
  }, []);

  const onUpdateTextField = useCallback((field: string, value: string) => {
    setBuilderPayload((current) => {
      if (!current) return current;

      if (field === "contractNumber" || field === "issueDate" || field === "startDate" || field === "dueDate") {
        return {
          ...current,
          [field]: value,
          updatedAt: new Date().toISOString(),
        };
      }

      if (field === "status") {
        return {
          ...current,
          status: value as ContractStatus,
          updatedAt: new Date().toISOString(),
        };
      }

      return {
        ...current,
        [field]: value,
        updatedAt: new Date().toISOString(),
      };
    });
  }, []);

  const onClauseSelectionChange = useCallback((selection: ContractClauseSelection) => {
    setBuilderPayload((current) => {
      if (!current) return current;

      return {
        ...current,
        clauseSelection: {
          items: selection.items
            .slice()
            .sort((left, right) => left.order - right.order)
            .map((item, index) => ({
              ...item,
              order: index,
            })),
          updatedAt: selection.updatedAt || new Date().toISOString(),
        },
        updatedAt: new Date().toISOString(),
      };
    });
  }, []);

  const onPrimaryPlanChange = useCallback((planId: BuilderPrimaryPlanId) => {
    setBuilderPayload((current) => {
      if (!current) return current;

      const nextItems = selectPrimaryPlan(current.items, planId);
      const selectedPlan = nextItems.find((item) => item.selected) || null;
      return {
        ...current,
        primaryPlanId: planId,
        items: nextItems,
        pricing: computeBuilderPricing(nextItems, current.clientExtrasSnapshot, {
          baseValue: selectedPlan?.setupPrice ?? current.pricing.baseValue,
          entryValue: current.pricing.entryValue,
        }),
        updatedAt: new Date().toISOString(),
      };
    });
  }, []);

  const onPricingChange = useCallback((field: string, value: string) => {
    setBuilderPayload((current) => {
      if (!current) return current;

      const numeric = Math.max(Number.isFinite(Number(value)) ? Number(value) : 0, 0);
      const nextPricing = {
        ...current.pricing,
        ...(field === "baseValue" ? { baseValue: numeric } : {}),
        ...(field === "entryValue" ? { entryValue: numeric } : {}),
      };

      return {
        ...current,
        pricing: computeBuilderPricing(current.items, current.clientExtrasSnapshot, {
          baseValue: nextPricing.baseValue,
          entryValue: nextPricing.entryValue,
        }),
        updatedAt: new Date().toISOString(),
      };
    });
  }, []);

  const onDiscountTypeChange = useCallback(() => undefined, []);
  const onMoneyDraftBlur = useCallback(() => undefined, []);

  const onExtraFieldChange = useCallback(
    (extraId: string, field: "name" | "description" | "clause" | "setupPrice", value: string) => {
      setBuilderPayload((current) => {
        if (!current) return current;

        const nextExtras = current.clientExtrasSnapshot.map((item) =>
          item.id === extraId
            ? {
                ...item,
                [field]: field === "setupPrice" ? Math.max(Number(value || 0), 0) : value,
              }
            : item,
        );

        return {
          ...current,
          clientExtrasSnapshot: nextExtras,
          pricing: computeBuilderPricing(current.items, nextExtras, {
            baseValue: current.pricing.baseValue,
            entryValue: current.pricing.entryValue,
          }),
          updatedAt: new Date().toISOString(),
        };
      });
    },
    [],
  );

  const onToggleExtra = useCallback((extraId: string, active: boolean) => {
    setBuilderPayload((current) => {
      if (!current) return current;

      const nextExtras = current.clientExtrasSnapshot.map((item) =>
        item.id === extraId ? { ...item, active } : item,
      );

      return {
        ...current,
        clientExtrasSnapshot: nextExtras,
        pricing: computeBuilderPricing(current.items, nextExtras, {
          baseValue: current.pricing.baseValue,
          entryValue: current.pricing.entryValue,
        }),
        updatedAt: new Date().toISOString(),
      };
    });
  }, []);

  const openBuilderContract = useCallback(
    (contrato: Contrato) => {
      try {
        const payload = normalizeBuilderPayload(contrato.builder_payload, safeExtrasCatalogo, contrato.cliente_id || "");
        const nextStep = payload.lastStep ?? 4;

        setBuilderPayload(payload);
        setEditingBuilderContract(contrato);
        setBuilderStepState(nextStep);
        setMobileSummaryOpen(false);
        setBuilderRemoteAutosaveState("saved");
        setBuilderLastSavedAt(contrato.updated_at || contrato.created_at);
        setBuilderClientExtras(payload.clientExtrasSnapshot);
        setTab("montador", { step: nextStep });
      } catch (error) {
        const debugEntry = logContractAdminError("builder-open-contract", error, {
          contractId: contrato.id,
          clientId: contrato.cliente_id || null,
          status: contrato.status,
        });
        toast({
          title: "Contrato com revisao necessaria",
          description: `${debugEntry.safeMessage} Ref ${debugEntry.reference}.`,
          variant: "destructive",
        });
      }
    },
    [safeExtrasCatalogo, setTab, toast],
  );

  const persistBuilderDraft = useCallback(
    async ({
      requireCompleteValidation = false,
      silent = false,
      autosaveRemote = false,
      stepOverride,
    }: {
      requireCompleteValidation?: boolean;
      silent?: boolean;
      autosaveRemote?: boolean;
      stepOverride?: ContractBuilderStepIndex;
    } = {}) => {
      const currentPayload = workingBuilderPayload;
      if (!currentPayload) return false;

      const targetStep = stepOverride ?? builderStep;
      const validationMessage = getBuilderStepError(requireCompleteValidation ? 4 : targetStep);
      if (requireCompleteValidation && validationMessage) {
        if (!silent) {
          toast({
            title: "Revise os dados do contrato",
            description: validationMessage,
            variant: "destructive",
          });
        }
        return false;
      }

      try {
        const prepared = buildBuilderSavePayload(currentPayload, targetStep);
        if (!prepared) return false;

        if (autosaveRemote) setBuilderRemoteAutosaveState("saving");

        const payloadToPersist = {
          cliente_id: prepared.normalizedPayload.clienteId || null,
          titulo: prepared.title,
          descricao: prepared.description,
          valor: prepared.value,
          status: prepared.normalizedPayload.status,
          corpo: prepared.body,
          modelo: BUILDER_TEMPLATE_ID,
          builder_payload: prepared.normalizedPayload as any,
          updated_at: new Date().toISOString(),
        };

        const savedContrato = await saveBuilderContractDirectly({
          contractId: editingBuilderContract?.id ?? null,
          payloadToPersist,
          createVersionSnapshot: !autosaveRemote,
        });

        const savedPayload = normalizeBuilderPayload(
          savedContrato.builder_payload,
          safeExtrasCatalogo,
          savedContrato.cliente_id || "",
          targetStep,
        );

        setBuilderPayload(savedPayload);
        setEditingBuilderContract(savedContrato);
        setBuilderStepState(savedPayload.lastStep ?? targetStep);
        setBuilderLastSavedAt(savedContrato.updated_at || savedContrato.created_at);
        setBuilderRemoteAutosaveState("saved");
        upsertContratoState(savedContrato);
        localStorage.removeItem("nv_contract_builder_draft");

        if (!silent && !autosaveRemote) {
          toast({
            title: editingBuilderContract ? "Contrato atualizado" : "Contrato salvo",
            description: "O contrato foi salvo no cofre com a etapa atual preservada.",
          });
        }

        return savedContrato;
      } catch (error) {
        const debugEntry = logContractAdminError("builder-save-contract", error, {
          contractId: editingBuilderContract?.id || null,
          clientId: currentPayload.clienteId || null,
          autosaveRemote,
        });

        setBuilderRemoteAutosaveState("error");

        if (!silent) {
          toast({
            title: "Erro ao salvar contrato",
            description: `${debugEntry.safeMessage} Ref ${debugEntry.reference}.`,
            variant: "destructive",
          });
        }

        return null;
      }
    },
    [builderStep, editingBuilderContract, getBuilderStepError, safeExtrasCatalogo, toast, upsertContratoState, workingBuilderPayload],
  );

  const changeContractStatus = useCallback(
    async (status: ContractStatus) => {
      if (!editingBuilderContract) {
        setBuilderPayload((current) =>
          current
            ? {
                ...current,
                status,
                updatedAt: new Date().toISOString(),
              }
            : current,
        );
        return false;
      }

      try {
        const patch =
          status === "ativo"
            ? { onboarding_started_at: editingBuilderContract.onboarding_started_at || new Date().toISOString() }
            : status === "assinado"
              ? { data_assinatura: editingBuilderContract.data_assinatura || new Date().toISOString() }
              : {};

        const updated = await updateBuilderContractStatus(editingBuilderContract.id, status, patch);
        upsertContratoState(updated);
        setEditingBuilderContract(updated);
        setBuilderPayload((current) =>
          current
            ? {
                ...current,
                status,
                updatedAt: new Date().toISOString(),
              }
            : current,
        );

        await createContractEvent({
          contratoId: updated.id,
          tipo: status,
          titulo: createEventLabel(status),
          descricao: `O status do contrato foi atualizado para ${status.replace(/_/g, " ")}.`,
          actorType: "admin",
        });

        toast({
          title: "Status atualizado",
          description: `O contrato agora esta como ${status.replace(/_/g, " ")}.`,
        });
        return true;
      } catch (error) {
        const debugEntry = logContractAdminError("builder-status-change", error, {
          contractId: editingBuilderContract.id,
          status,
        });
        toast({
          title: "Nao foi possivel atualizar o status",
          description: `${debugEntry.safeMessage} Ref ${debugEntry.reference}.`,
          variant: "destructive",
        });
        return false;
      }
    },
    [editingBuilderContract, toast, upsertContratoState],
  );

  const handleGeneratePdf = useCallback(() => {
    if (!builderPrepared) return;
    generateContractPDF(builderPrepared.title, builderPrepared.body, {
      proposal: builderPrepared.normalizedPayload,
      contractanteSignedName: editingBuilderContract?.assinatura_cliente_nome,
      signedAt: editingBuilderContract?.data_assinatura,
    });
  }, [builderPrepared, editingBuilderContract?.assinatura_cliente_nome, editingBuilderContract?.data_assinatura]);

  const handleDownloadWord = useCallback(() => {
    if (!builderPrepared) return;
    downloadWordDocument(builderPrepared.title, builderPrepared.body, {
      proposal: builderPrepared.normalizedPayload,
      contractanteSignedName: editingBuilderContract?.assinatura_cliente_nome,
      signedAt: editingBuilderContract?.data_assinatura,
    });
  }, [builderPrepared, editingBuilderContract?.assinatura_cliente_nome, editingBuilderContract?.data_assinatura]);

  const handlePrint = useCallback(() => {
    if (!builderPrepared) return;

    const printWindow = window.open("", "_blank", "noopener,noreferrer,width=980,height=900");
    if (!printWindow) {
      toast({
        title: "Nao foi possivel abrir a impressao",
        description: "O navegador bloqueou a janela de impressao deste contrato.",
        variant: "destructive",
      });
      return;
    }

    const html = downloadWordDocument(builderPrepared.title, builderPrepared.body, {
      proposal: builderPrepared.normalizedPayload,
      contractanteSignedName: editingBuilderContract?.assinatura_cliente_nome,
      signedAt: editingBuilderContract?.data_assinatura,
      returnHtml: true,
    }) as string;

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  }, [builderPrepared, editingBuilderContract?.assinatura_cliente_nome, editingBuilderContract?.data_assinatura, toast]);

  const getMoneyInputDisplayValue = useCallback((_key: string, value: number) => `${value}`, []);

  const describeClientExtraPricing = useCallback((item: any) => {
    const price = Number(item.setupPrice ?? item.preco_ativacao ?? item.valor ?? 0);
    return formatCurrencyBRL(price);
  }, []);

  const onNext = useCallback(async () => {
    if (!builderPayload) return;
    const nextStep = (builderStep + 1) as ContractBuilderStepIndex;
    if (nextStep < BUILDER_STEPS.length) {
      setBuilderStep(nextStep);
      setTab("montador", { step: nextStep });
    }
  }, [builderPayload, builderStep, setBuilderStep, setTab]);

  const onBack = useCallback(() => {
    if (builderStep > 0) {
      const prevStep = (builderStep - 1) as ContractBuilderStepIndex;
      setBuilderStep(prevStep);
      setTab("montador", { step: prevStep });
    }
  }, [builderStep, setBuilderStep, setTab]);

  const onSaveDraft = useCallback(async () => {
    return await persistBuilderDraft({ silent: false, autosaveRemote: false });
  }, [persistBuilderDraft]);

  const onSaveAndExit = useCallback(async () => {
    const success = await persistBuilderDraft({ silent: false, autosaveRemote: false });
    if (success) {
      setTab("lista");
    }
    return success;
  }, [persistBuilderDraft, setTab]);

  const onSaveDirect = useCallback(async () => {
    return await persistBuilderDraft({ silent: true, autosaveRemote: true });
  }, [persistBuilderDraft]);

  return useMemo(() => ({
    builderPayload,
    setBuilderPayload,
    editingBuilderContract,
    setEditingBuilderContract,
    builderStep,
    setBuilderStep,
    mobileSummaryOpen,
    setMobileSummaryOpen,
    syncingClientExtras,
    setSyncingClientExtras,
    builderRecoveredLocally: false,
    builderLastSavedSignature: null,
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
    onClauseSelectionChange,
    onPrimaryPlanChange,
    onDiscountTypeChange,
    onPricingChange,
    onMoneyDraftBlur,
    onRefreshExtras,
    getBuilderStepError,
    getMoneyInputDisplayValue,
    buildPricingMoneyDraftKey,
    describeClientExtraPricing,
    onExtraFieldChange,
    onToggleExtra,
    changeContractStatus,
    handleGeneratePdf,
    handleDownloadWord,
    handlePrint,
    onNext,
    onBack,
    onSaveDraft,
    onSaveAndExit,
    onSave: onSaveDirect,
  }), [
    builderPayload,
    editingBuilderContract,
    builderStep,
    mobileSummaryOpen,
    syncingClientExtras,
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
    onClauseSelectionChange,
    onPrimaryPlanChange,
    onDiscountTypeChange,
    onPricingChange,
    onMoneyDraftBlur,
    onRefreshExtras,
    getBuilderStepError,
    getMoneyInputDisplayValue,
    describeClientExtraPricing,
    onExtraFieldChange,
    onToggleExtra,
    changeContractStatus,
    handleGeneratePdf,
    handleDownloadWord,
    handlePrint,
    onNext,
    onBack,
    onSaveDraft,
    onSaveAndExit,
    onSaveDirect,
  ]);
}
