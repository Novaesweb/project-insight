import { useCallback, useMemo, useState } from "react";
import { useReducedMotion } from "framer-motion";

import { useToast } from "@/hooks/use-toast";
import {
  buildDefaultExtraClause,
  buildProposalSummary,
  computeBuilderPricing,
  createEmptyBuilderPayload,
  formatCurrencyBRL,
  selectPrimaryPlan,
  type BuilderPrimaryPlanId,
  type ContractBuilderClientExtraSnapshot,
  type ContractBuilderPayload,
  type ContractStatus,
} from "@/lib/contract-builder";
import {
  buildBuilderSavePayload,
  buildPricingMoneyDraftKey,
  formatContractClock,
  getContractErrorMessage,
  normalizeBuilderPayload,
} from "@/lib/contract-utils";
import { createContractEvent } from "@/lib/contract-activity";
import {
  downloadWordDocument,
  generateContractPDF,
} from "@/features/contracts/documents";
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
  setTab: (tab: string) => void;
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
  if (status === "em_revisao") return "Contrato em revisão";
  return "Status do contrato atualizado";
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

  const [builderPayload, setBuilderPayload] = useState<ContractBuilderPayload | null>(null);
  const [editingBuilderContract, setEditingBuilderContract] = useState<Contrato | null>(null);
  const [builderStep, setBuilderStep] = useState(4);
  const [mobileSummaryOpen, setMobileSummaryOpen] = useState(false);
  const [syncingClientExtras, setSyncingClientExtras] = useState(false);
  const [builderRemoteAutosaveState, setBuilderRemoteAutosaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [builderClientExtras, setBuilderClientExtras] = useState<any[]>([]);
  const [builderLastSavedAt, setBuilderLastSavedAt] = useState<string | null>(null);

  const workingBuilderPayload = useMemo(() => {
    if (!builderPayload) return null;
    return {
      ...builderPayload,
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
      return getContractErrorMessage(error, "Esse contrato precisa de revisão antes de ser salvo.");
    }
  }, [builderPrepared, workingBuilderPayload]);

  const builderProgress = builderPayload ? 100 : 0;
  const selectedItemsCount = (workingBuilderPayload?.clientExtrasSnapshot.filter((item) => item.active !== false).length || 0) +
    (workingBuilderPayload?.primaryPlanId !== "none" ? 1 : 0);

  const builderStatusLabel = useMemo(() => {
    if (builderRemoteAutosaveState === "saving") {
      return { title: "Salvando", subtitle: "Sincronizando contrato com o cofre." };
    }

    if (builderRemoteAutosaveState === "saved" && builderLastSavedAt) {
      return {
        title: "Sincronizado",
        subtitle: `Última atualização às ${formatContractClock(builderLastSavedAt)}`,
      };
    }

    if (editingBuilderContract) {
      return {
        title: "Em edição",
        subtitle: "Este contrato já existe no cofre e pode ser atualizado sem sair da tela.",
      };
    }

    return {
      title: "Novo contrato",
      subtitle: "Monte o documento à esquerda e acompanhe a prévia em tempo real.",
    };
  }, [builderLastSavedAt, builderRemoteAutosaveState, editingBuilderContract]);

  const getBuilderStepError = useCallback(
    (_step: number) => {
      const current = workingBuilderPayload;
      if (!current) return "Aguarde o carregamento do contrato.";
      if (!current.clienteId) return "Selecione um cliente para iniciar o contrato.";
      if (!current.contractante.nome.trim()) return "O nome do cliente é obrigatório.";
      if (!current.contractante.documento.trim()) return "O documento do cliente é obrigatório.";
      if (current.primaryPlanId === "none") return "Escolha um plano principal para o contrato.";
      if (current.pricing.baseValue <= 0) return "Defina um valor base maior que zero.";
      if (!current.contractNumber.trim()) return "Informe o número do contrato.";
      return null;
    },
    [workingBuilderPayload],
  );

  const resetBuilder = useCallback(() => {
    if (!extrasLoaded) return;

    const nextPayload = createEmptyBuilderPayload(safeExtrasCatalogo);
    setBuilderPayload(nextPayload);
    setEditingBuilderContract(null);
    setBuilderStep(0);
    setMobileSummaryOpen(false);
    setBuilderRemoteAutosaveState("idle");
    setBuilderClientExtras([]);
    setBuilderLastSavedAt(null);
    setTab("montador");
  }, [extrasLoaded, safeExtrasCatalogo, setTab]);

  const hydrateClientExtras = useCallback(async (clienteId: string) => {
    const extras = await fetchActiveClientExtras(clienteId);
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
      if (!cliente) return;

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
          title: "Extras do cliente indisponíveis",
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
        title: "Não foi possível atualizar os extras",
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

  const onExtraFieldChange = useCallback((extraId: string, field: "name" | "description" | "clause" | "setupPrice", value: string) => {
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
  }, []);

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
        setBuilderPayload(payload);
        setEditingBuilderContract(contrato);
        setBuilderStep(payload.lastStep ?? 4);
        setMobileSummaryOpen(false);
        setBuilderRemoteAutosaveState("saved");
        setBuilderLastSavedAt(contrato.updated_at || contrato.created_at);
        setBuilderClientExtras(payload.clientExtrasSnapshot);
        setTab("montador");
      } catch (error) {
        const debugEntry = logContractAdminError("builder-open-contract", error, {
          contractId: contrato.id,
          clientId: contrato.cliente_id || null,
          status: contrato.status,
        });
        toast({
          title: "Contrato com revisão necessária",
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
    }: {
      exitAfterSave?: boolean;
      requireCompleteValidation?: boolean;
      silent?: boolean;
      autosaveRemote?: boolean;
    } = {}) => {
      const currentPayload = workingBuilderPayload;
      if (!currentPayload) return false;

      const validationMessage = getBuilderStepError(4);
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
        const prepared = buildBuilderSavePayload(currentPayload, 4);
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
          4,
        );

        setBuilderPayload(savedPayload);
        setEditingBuilderContract(savedContrato);
        setBuilderLastSavedAt(savedContrato.updated_at || savedContrato.created_at);
        setBuilderRemoteAutosaveState("saved");
        upsertContratoState(savedContrato);

        if (!silent && !autosaveRemote) {
          toast({
            title: editingBuilderContract ? "Contrato atualizado" : "Contrato salvo",
            description: "O contrato foi salvo no cofre com a prévia atual.",
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
    [editingBuilderContract, getBuilderStepError, safeExtrasCatalogo, toast, upsertContratoState, workingBuilderPayload],
  );

  const changeContractStatus = useCallback(
    async (status: ContractStatus) => {
      if (!editingBuilderContract) {
        setBuilderPayload((current) => (current ? { ...current, status } : current));
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
        setBuilderPayload((current) => (current ? { ...current, status } : current));

        await createContractEvent({
          contratoId: updated.id,
          tipo: status,
          titulo: createEventLabel(status),
          descricao: `O status do contrato foi atualizado para ${status.replace(/_/g, " ")}.`,
          actorType: "admin",
        });

        toast({
          title: "Status atualizado",
          description: `O contrato agora está como ${status.replace(/_/g, " ")}.`,
        });
        return true;
      } catch (error) {
        const debugEntry = logContractAdminError("builder-status-change", error, {
          contractId: editingBuilderContract.id,
          status,
        });
        toast({
          title: "Não foi possível atualizar o status",
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
        title: "Não foi possível abrir a impressão",
        description: "O navegador bloqueou a janela de impressão deste contrato.",
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

  return {
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
  };
}
