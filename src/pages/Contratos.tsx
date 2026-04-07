import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Boxes,
  ChevronLeft,
  CircleDollarSign,
  Download,
  Eye,
  FilePenLine,
  FileText,
  Lock,
  PenTool,
  Plus,
  Save,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Vault,
} from "lucide-react";
import jsPDF from "jspdf";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import SignaturePad from "@/components/SignaturePad";
import { useToast } from "@/hooks/use-toast";
import { useRealtimeSubscription } from "@/hooks/useRealtimeSubscription";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import {
  buildBuilderTemplateValues,
  buildContractWordHtml,
  buildContractanteFromClient,
  computeBuilderPricing,
  createEmptyBuilderPayload,
  formatCurrencyBRL,
  parseMoneyInput,
  selectPrimaryPlan,
  toggleBuilderItem,
  updateBuilderItemPrice,
  type BuilderPrimaryPlanId,
  type ContractBuilderPayload,
  type ContractBuilderPricing,
} from "@/lib/contract-builder";
import { contractTemplates, fillTemplate, getContractTypeLabel, type ContractTemplate } from "@/lib/contract-templates";
import { PUBLIC_PLAN_CATALOG } from "@/lib/public-plans";

type Cliente = Tables<"clientes">;
type ExtraCatalogo = Tables<"extras_catalogo">;
type Contrato = Tables<"contratos"> & {
  clientes?: {
    nome: string;
  } | null;
};

interface PreviewState {
  title: string;
  body: string;
  assinaturaAdmin?: string | null;
  assinaturaCliente?: string | null;
}

const BUILDER_TEMPLATE_ID = "novaesweb-contrato-mestre";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const statusColors: Record<string, string> = {
  aguardando: "#facc15",
  assinado: "#4ade80",
  cancelado: "#ef4444",
  rascunho: "#94a3b8",
};

const statusLabels: Record<string, string> = {
  aguardando: "Aguardando",
  assinado: "Assinado",
  cancelado: "Cancelado",
  rascunho: "Rascunho",
};

const builderGroupTitles: Record<string, string> = {
  fixo: "Extras Únicos",
  intermediario: "Extras Pro",
  mensal: "Extras Mensais",
};

function buildPdfFileName(title: string) {
  return title.replace(/[^a-zA-Z0-9]/g, "_");
}

function generateContractPDF(
  titulo: string,
  corpo: string,
  assinaturaAdmin?: string | null,
  assinaturaCliente?: string | null,
) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 18;
  const maxWidth = pageWidth - margin * 2;

  doc.setFillColor(123, 31, 162);
  doc.rect(0, 0, pageWidth / 3, 14, "F");
  doc.setFillColor(232, 51, 74);
  doc.rect(pageWidth / 3, 0, pageWidth / 3, 14, "F");
  doc.setFillColor(194, 24, 91);
  doc.rect((pageWidth / 3) * 2, 0, pageWidth / 3, 14, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("NovaesWeb • Contrato Comercial Premium", margin, 9);

  doc.setTextColor(19, 13, 26);
  doc.setFontSize(16);
  doc.text(titulo, margin, 26);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10.5);
  const lines = doc.splitTextToSize(corpo, maxWidth);
  let y = 38;

  for (const line of lines) {
    if (y > pageHeight - 22) {
      doc.addPage();
      y = 18;
    }
    doc.text(line, margin, y);
    y += 5;
  }

  if (assinaturaAdmin) {
    if (y > pageHeight - 60) {
      doc.addPage();
      y = 18;
    }
    y += 8;
    doc.setFont("helvetica", "bold");
    doc.text("Assinatura CONTRATADA:", margin, y);
    y += 4;
    doc.addImage(assinaturaAdmin, "PNG", margin, y, 60, 24);
    y += 28;
  }

  if (assinaturaCliente) {
    if (y > pageHeight - 60) {
      doc.addPage();
      y = 18;
    }
    doc.setFont("helvetica", "bold");
    doc.text("Assinatura CONTRATANTE:", margin, y);
    y += 4;
    doc.addImage(assinaturaCliente, "PNG", margin, y, 60, 24);
  }

  const pageCount = doc.getNumberOfPages();
  for (let page = 1; page <= pageCount; page += 1) {
    doc.setPage(page);
    doc.setDrawColor(240, 216, 234);
    doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(109, 95, 119);
    doc.text(
      "NovaesWeb • Estrutura digital premium • Documento gerado no painel administrativo",
      margin,
      pageHeight - 7,
    );
  }

  doc.save(`${buildPdfFileName(titulo)}.pdf`);
}

function downloadWordDocument(title: string, body: string) {
  const blob = new Blob([buildContractWordHtml(title, body)], {
    type: "application/msword;charset=utf-8",
  });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${buildPdfFileName(title)}.doc`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

function isBuilderContract(contrato: Contrato) {
  return Boolean(contrato.builder_payload);
}

function normalizeBuilderPayload(
  rawPayload: unknown,
  extras: ExtraCatalogo[],
  fallbackClientId = "",
): ContractBuilderPayload {
  const base = createEmptyBuilderPayload(extras);

  if (!rawPayload || typeof rawPayload !== "object") {
    return {
      ...base,
      clienteId: fallbackClientId,
    };
  }

  const payload = rawPayload as Partial<ContractBuilderPayload>;
  const savedItems = Array.isArray(payload.items) ? payload.items : [];
  const baseById = new Map(base.items.map((item) => [item.id, item]));
  const mergedItems = base.items.map((item) => {
    const saved = savedItems.find((entry) => entry.id === item.id);
    if (!saved) return item;

    return {
      ...item,
      name: saved.name || item.name,
      description: saved.description || item.description,
      selected: Boolean(saved.selected),
      setupPrice: Number(saved.setupPrice ?? item.setupPrice ?? 0),
      monthlyPrice: Number(saved.monthlyPrice ?? item.monthlyPrice ?? 0),
    };
  });

  const legacyItems = savedItems.filter((item) => !baseById.has(item.id));
  const items = [...mergedItems, ...legacyItems];
  const primaryPlanId =
    payload.primaryPlanId && payload.primaryPlanId !== "none"
      ? (payload.primaryPlanId as BuilderPrimaryPlanId)
      : ((items.find((item) => item.isPrimaryPlan && item.selected)?.sourceId as BuilderPrimaryPlanId) || "none");

  const pricing = computeBuilderPricing(items, {
    negotiatedSetup: Number(payload.pricing?.negotiatedSetup ?? payload.pricing?.setupSubtotal ?? 0),
    entryValue: Number(payload.pricing?.entryValue ?? 0),
    balanceValue: Number(payload.pricing?.balanceValue ?? 0),
    negotiatedMonthly: Number(payload.pricing?.negotiatedMonthly ?? payload.pricing?.monthlySubtotal ?? 0),
  });

  return {
    ...base,
    ...payload,
    clienteId: payload.clienteId || fallbackClientId,
    primaryPlanId,
    contractante: {
      ...base.contractante,
      ...(payload.contractante || {}),
    },
    contratada: {
      ...base.contratada,
      ...(payload.contratada || {}),
    },
    items,
    pricing,
    createdAt: payload.createdAt || base.createdAt,
    updatedAt: new Date().toISOString(),
  };
}

function buildBuilderSavePayload(payload: ContractBuilderPayload) {
  const template = contractTemplates.find((item) => item.id === BUILDER_TEMPLATE_ID);
  if (!template) return null;

  const normalizedPayload: ContractBuilderPayload = {
    ...payload,
    updatedAt: new Date().toISOString(),
  };

  const templateValues = buildBuilderTemplateValues(normalizedPayload);
  const selectedCount = normalizedPayload.items.filter((item) => item.selected).length;
  const selectedPlan =
    PUBLIC_PLAN_CATALOG.find((plan) => plan.id === normalizedPayload.primaryPlanId)?.title || "Sem plano principal";
  const clientLabel =
    normalizedPayload.contractante.nomeEmpresa?.trim() || normalizedPayload.contractante.nome.trim() || "Cliente";

  return {
    normalizedPayload,
    title: `Contrato Mestre NovaesWeb — ${clientLabel}`,
    body: fillTemplate(template.corpo, templateValues),
    description: `Montador Comercial • ${selectedPlan} • ${selectedCount} item(ns) selecionado(s)`,
    value: normalizedPayload.pricing.negotiatedSetup,
  };
}

function formatContratoValue(value: number | null) {
  return Number(value || 0).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function Contratos() {
  const { toast } = useToast();
  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [extrasCatalogo, setExtrasCatalogo] = useState<ExtraCatalogo[]>([]);
  const [extrasLoaded, setExtrasLoaded] = useState(false);
  const [tab, setTab] = useState("lista");
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedTemplate, setSelectedTemplate] = useState<ContractTemplate | null>(null);
  const [selectedClienteId, setSelectedClienteId] = useState("");
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewState, setPreviewState] = useState<PreviewState | null>(null);

  const [signOpen, setSignOpen] = useState(false);
  const [adminSignature, setAdminSignature] = useState<string>("");

  const [builderPayload, setBuilderPayload] = useState<ContractBuilderPayload | null>(null);
  const [editingBuilderContract, setEditingBuilderContract] = useState<Contrato | null>(null);

  const loadContratos = useCallback(() => {
    supabase
      .from("contratos")
      .select("*, clientes(nome)")
      .order("created_at", { ascending: false })
      .then(({ data }) => setContratos((data as Contrato[]) || []));
  }, []);

  const loadClientes = useCallback(() => {
    supabase
      .from("clientes")
      .select(
        "id, nome, nome_empresa, email, documento, whatsapp, telefone, endereco, numero_endereco, complemento, bairro, cidade, estado, cep, instagram, site_url, status",
      )
      .eq("status", "ativo")
      .order("nome", { ascending: true })
      .then(({ data }) => setClientes((data as Cliente[]) || []));
  }, []);

  const loadExtrasCatalogo = useCallback(() => {
    supabase
      .from("extras_catalogo")
      .select("id, nome, descricao, categoria, preco_ativacao, preco_mensal, status, subcategoria")
      .eq("status", "ativo")
      .order("categoria", { ascending: true })
      .order("nome", { ascending: true })
      .then(({ data }) => {
        setExtrasCatalogo((data as ExtraCatalogo[]) || []);
        setExtrasLoaded(true);
      });
  }, []);

  useEffect(() => {
    loadContratos();
    loadClientes();
    loadExtrasCatalogo();
  }, [loadContratos, loadClientes, loadExtrasCatalogo]);

  useRealtimeSubscription("contratos", loadContratos);

  useEffect(() => {
    if (!builderPayload && extrasLoaded) {
      setBuilderPayload(createEmptyBuilderPayload(extrasCatalogo));
    }
  }, [builderPayload, extrasCatalogo, extrasLoaded]);

  useEffect(() => {
    if (!selectedClienteId || !selectedTemplate) return;
    const cliente = clientes.find((item) => item.id === selectedClienteId);
    if (!cliente) return;

    setFormValues((prev) => ({
      ...prev,
      nome_cliente: cliente.nome,
      cpf_cnpj: cliente.documento || "",
      endereco: cliente.endereco || "",
    }));
  }, [selectedClienteId, clientes, selectedTemplate]);

  useEffect(() => {
    if (!selectedTemplate) return;

    const defaults: Record<string, string> = {};
    selectedTemplate.variaveis.forEach((variable) => {
      if (variable.defaultValue) defaults[variable.key] = variable.defaultValue;
      if (variable.autoFill === "data") defaults[variable.key] = new Date().toISOString().slice(0, 10);
    });

    const config = localStorage.getItem("config_empresa");
    if (config) {
      const parsed = JSON.parse(config);
      if (parsed.cnpj) {
        defaults.cnpj_novaesweb = parsed.cnpj;
        defaults.cpf_cnpj_contratada = parsed.cnpj;
      }
      if (parsed.nome) defaults.nome_contratada = parsed.nome;
      if (parsed.endereco) defaults.endereco_contratada = parsed.endereco;
    }

    setFormValues((prev) => ({ ...defaults, ...prev }));
  }, [selectedTemplate]);

  const openPreview = (nextState: PreviewState) => {
    setPreviewState(nextState);
    setPreviewOpen(true);
  };

  const handleSelectTemplate = (templateId: string) => {
    const template = contractTemplates.find((item) => item.id === templateId);
    if (!template) return;

    setSelectedTemplate(template);
    setFormValues({});
    setSelectedClienteId("");
    setAdminSignature("");
    setTab("criar");
  };

  const handlePreview = () => {
    if (!selectedTemplate) return;

    openPreview({
      title: `${selectedTemplate.nome} — ${formValues.nome_cliente || "Pré-visualização"}`,
      body: fillTemplate(selectedTemplate.corpo, formValues),
      assinaturaAdmin: adminSignature || null,
    });
  };

  const handleViewContrato = (contrato: Contrato) => {
    openPreview({
      title: contrato.titulo,
      body: (contrato as any).corpo || contrato.descricao || "Conteúdo não disponível",
      assinaturaAdmin: (contrato as any).assinatura_admin,
      assinaturaCliente: (contrato as any).assinatura_cliente,
    });
  };

  const getValorFromForm = () => {
    const valorTotal = parseFloat(formValues.valor_total || "0") || 0;
    const valorEntrada = parseFloat(formValues.valor_entrada || "0") || 0;
    const valorSaldo = parseFloat(formValues.valor_saldo || "0") || 0;
    const valorMensal = parseFloat(formValues.valor_mensal || "0") || 0;

    if (valorTotal > 0) return valorTotal;
    if (valorEntrada > 0 || valorSaldo > 0) return valorEntrada + valorSaldo;
    return valorMensal;
  };

  const handleSave = async (status: "rascunho" | "aguardando") => {
    if (!selectedTemplate || !selectedClienteId) {
      toast({ title: "Selecione um cliente", variant: "destructive" });
      return;
    }

    if (status === "aguardando" && !adminSignature) {
      toast({
        title: "Assine o contrato antes de enviar",
        description: "Clique em 'Assinar' para adicionar sua assinatura.",
        variant: "destructive",
      });
      return;
    }

    const body = fillTemplate(selectedTemplate.corpo, formValues);
    const { error } = await supabase.from("contratos").insert({
      cliente_id: selectedClienteId,
      titulo: `${selectedTemplate.nome} — ${formValues.nome_cliente || ""}`,
      descricao: `Modelo: ${selectedTemplate.nome}`,
      valor: getValorFromForm(),
      status,
      corpo: body,
      modelo: selectedTemplate.id,
      assinatura_admin: adminSignature || null,
    } as any);

    if (error) {
      toast({ title: "Erro ao salvar contrato", description: error.message, variant: "destructive" });
      return;
    }

    toast({
      title: status === "rascunho" ? "Rascunho salvo!" : "Contrato enviado para assinatura!",
    });
    setTab("lista");
    setSelectedTemplate(null);
    setFormValues({});
    setAdminSignature("");
    loadContratos();
  };

  const recalculateBuilderPricing = useCallback(
    (items: ContractBuilderPayload["items"], previousPricing: ContractBuilderPricing) => {
      const basePricing = computeBuilderPricing(items);
      const negotiatedSetup =
        previousPricing.negotiatedSetup === previousPricing.setupSubtotal
          ? basePricing.setupSubtotal
          : previousPricing.negotiatedSetup;
      const negotiatedMonthly =
        previousPricing.negotiatedMonthly === previousPricing.monthlySubtotal
          ? basePricing.monthlySubtotal
          : previousPricing.negotiatedMonthly;
      const entryValue = Math.min(previousPricing.entryValue, negotiatedSetup);

      return computeBuilderPricing(items, {
        negotiatedSetup,
        entryValue,
        balanceValue: Math.max(negotiatedSetup - entryValue, 0),
        negotiatedMonthly,
      });
    },
    [],
  );

  const resetBuilder = useCallback(() => {
    if (!extrasLoaded) return;
    setBuilderPayload(createEmptyBuilderPayload(extrasCatalogo));
    setEditingBuilderContract(null);
    setTab("montador");
  }, [extrasCatalogo, extrasLoaded]);

  const openBuilderContract = (contrato: Contrato) => {
    if (!extrasLoaded) {
      toast({
        title: "Montador ainda carregando",
        description: "Os extras do catálogo ainda estão sendo sincronizados.",
        variant: "destructive",
      });
      return;
    }

    const payload = normalizeBuilderPayload(contrato.builder_payload, extrasCatalogo, contrato.cliente_id);
    setBuilderPayload(payload);
    setEditingBuilderContract(contrato);
    setTab("montador");
  };

  const handleBuilderClientChange = (clienteId: string) => {
    const cliente = clientes.find((item) => item.id === clienteId);
    if (!cliente || !builderPayload) return;

    setBuilderPayload({
      ...builderPayload,
      clienteId,
      contractante: buildContractanteFromClient(cliente),
      updatedAt: new Date().toISOString(),
    });
  };

  const updateBuilderContractante = (
    field: keyof ContractBuilderPayload["contractante"],
    value: string,
  ) => {
    if (!builderPayload) return;
    setBuilderPayload({
      ...builderPayload,
      contractante: {
        ...builderPayload.contractante,
        [field]: value,
      },
      updatedAt: new Date().toISOString(),
    });
  };

  const updateBuilderContratada = (
    field: keyof ContractBuilderPayload["contratada"],
    value: string,
  ) => {
    if (!builderPayload) return;
    setBuilderPayload({
      ...builderPayload,
      contratada: {
        ...builderPayload.contratada,
        [field]: value,
      },
      updatedAt: new Date().toISOString(),
    });
  };

  const updateBuilderTextField = (
    field:
      | "customScope"
      | "prazoDias"
      | "formaPagamento"
      | "numeroRevisoes"
      | "valorRevisao"
      | "prazoSuporte"
      | "observacoesComerciais"
      | "escopoExclusoes",
    value: string,
  ) => {
    if (!builderPayload) return;
    setBuilderPayload({
      ...builderPayload,
      [field]: value,
      updatedAt: new Date().toISOString(),
    });
  };

  const handlePrimaryPlanChange = (planId: BuilderPrimaryPlanId) => {
    if (!builderPayload) return;

    const nextItems = selectPrimaryPlan(builderPayload.items, planId);
    const nextPricing = recalculateBuilderPricing(nextItems, builderPayload.pricing);

    setBuilderPayload({
      ...builderPayload,
      primaryPlanId: planId,
      items: nextItems,
      pricing: nextPricing,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleBuilderItemToggle = (itemId: string, selected: boolean) => {
    if (!builderPayload) return;

    const nextItems = toggleBuilderItem(builderPayload.items, itemId, selected);
    const nextPricing = recalculateBuilderPricing(nextItems, builderPayload.pricing);

    setBuilderPayload({
      ...builderPayload,
      items: nextItems,
      pricing: nextPricing,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleBuilderItemPriceChange = (
    itemId: string,
    field: "setupPrice" | "monthlyPrice",
    rawValue: string,
  ) => {
    if (!builderPayload) return;

    const nextItems = updateBuilderItemPrice(
      builderPayload.items,
      itemId,
      field,
      parseMoneyInput(rawValue),
    );
    const nextPricing = recalculateBuilderPricing(nextItems, builderPayload.pricing);

    setBuilderPayload({
      ...builderPayload,
      items: nextItems,
      pricing: nextPricing,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleBuilderPricingChange = (
    field: "negotiatedSetup" | "entryValue" | "negotiatedMonthly",
    rawValue: string,
  ) => {
    if (!builderPayload) return;

    const numericValue = parseMoneyInput(rawValue);
    const nextPricing = { ...builderPayload.pricing };

    if (field === "negotiatedSetup") {
      nextPricing.negotiatedSetup = numericValue;
      nextPricing.entryValue = Math.min(nextPricing.entryValue, numericValue);
      nextPricing.balanceValue = Math.max(numericValue - nextPricing.entryValue, 0);
    }

    if (field === "entryValue") {
      nextPricing.entryValue = Math.min(numericValue, nextPricing.negotiatedSetup);
      nextPricing.balanceValue = Math.max(nextPricing.negotiatedSetup - nextPricing.entryValue, 0);
    }

    if (field === "negotiatedMonthly") {
      nextPricing.negotiatedMonthly = numericValue;
    }

    setBuilderPayload({
      ...builderPayload,
      pricing: nextPricing,
      updatedAt: new Date().toISOString(),
    });
  };

  const validateBuilder = () => {
    if (!builderPayload) return false;

    if (!builderPayload.clienteId) {
      toast({ title: "Selecione um cliente", variant: "destructive" });
      return false;
    }

    const selectedItems = builderPayload.items.filter((item) => item.selected);
    if (!selectedItems.length) {
      toast({
        title: "Selecione pelo menos um serviço",
        description: "Marque um plano principal ou algum item adicional para montar o contrato.",
        variant: "destructive",
      });
      return false;
    }

    if (builderPayload.primaryPlanId === "sob-medida" && !builderPayload.customScope.trim()) {
      toast({
        title: "Descreva o escopo customizado",
        description: "O plano Sob Medida precisa de um escopo claro para proteger a negociação.",
        variant: "destructive",
      });
      return false;
    }

    if (!builderPayload.contractante.nome.trim()) {
      toast({
        title: "Preencha os dados do contratante",
        description: "O nome do cliente é obrigatório para gerar o contrato.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleBuilderPreview = () => {
    if (!validateBuilder() || !builderPayload) return;

    const prepared = buildBuilderSavePayload(builderPayload);
    if (!prepared) {
      toast({ title: "Modelo mestre não encontrado", variant: "destructive" });
      return;
    }

    openPreview({
      title: prepared.title,
      body: prepared.body,
    });
  };

  const handleSaveBuilder = async () => {
    if (!validateBuilder() || !builderPayload) return;

    const prepared = buildBuilderSavePayload(builderPayload);
    if (!prepared) {
      toast({ title: "Modelo mestre não encontrado", variant: "destructive" });
      return;
    }

    const payloadToPersist = {
      cliente_id: builderPayload.clienteId,
      titulo: prepared.title,
      descricao: prepared.description,
      valor: prepared.value,
      status: "rascunho",
      corpo: prepared.body,
      modelo: BUILDER_TEMPLATE_ID,
      builder_payload: prepared.normalizedPayload as any,
      assinatura_admin: null,
    };

    if (editingBuilderContract) {
      const { data, error } = await supabase
        .from("contratos")
        .update(payloadToPersist as any)
        .eq("id", editingBuilderContract.id)
        .select("*, clientes(nome)")
        .single();

      if (error) {
        toast({ title: "Erro ao atualizar contrato", description: error.message, variant: "destructive" });
        return;
      }

      setEditingBuilderContract(data as Contrato);
      toast({ title: "Contrato comercial atualizado!" });
    } else {
      const { data, error } = await supabase
        .from("contratos")
        .insert(payloadToPersist as any)
        .select("*, clientes(nome)")
        .single();

      if (error) {
        toast({ title: "Erro ao salvar contrato", description: error.message, variant: "destructive" });
        return;
      }

      setEditingBuilderContract(data as Contrato);
      toast({ title: "Contrato comercial salvo no cofre!" });
    }

    loadContratos();
  };

  const handleBuilderPdfDownload = () => {
    if (!validateBuilder() || !builderPayload) return;

    const prepared = buildBuilderSavePayload(builderPayload);
    if (!prepared) return;
    generateContractPDF(prepared.title, prepared.body);
  };

  const handleBuilderWordDownload = () => {
    if (!validateBuilder() || !builderPayload) return;

    const prepared = buildBuilderSavePayload(builderPayload);
    if (!prepared) return;
    downloadWordDocument(prepared.title, prepared.body);
  };

  const filteredContratos = contratos.filter((contrato) => {
    const term = searchTerm.toLowerCase();
    return (
      contrato.titulo?.toLowerCase().includes(term) ||
      (contrato.clientes as any)?.nome?.toLowerCase().includes(term)
    );
  });

  const groupedExtras = builderPayload?.items
    .filter((item) => !item.isPrimaryPlan)
    .reduce<Record<string, typeof builderPayload.items>>((acc, item) => {
      if (!acc[item.group]) acc[item.group] = [];
      acc[item.group].push(item);
      return acc;
    }, {});

  return (
    <motion.div
      className="space-y-6"
      initial="hidden"
      animate="show"
      variants={{ show: { transition: { staggerChildren: 0.08 } } }}
    >
      <motion.div variants={fadeUp}>
        <Tabs value={tab} onValueChange={setTab} className="space-y-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <TabsList className="glass-card border-[0.5px] bg-transparent p-1 gap-1 flex-wrap">
              <TabsTrigger
                value="lista"
                className="data-[state=active]:gradient-primary data-[state=active]:text-white text-[hsl(var(--muted-foreground))] text-xs gap-1.5 px-4"
              >
                <ShieldCheck className="w-3.5 h-3.5" /> Ativos Blindados
              </TabsTrigger>
              <TabsTrigger
                value="modelos"
                className="data-[state=active]:gradient-primary data-[state=active]:text-white text-[hsl(var(--muted-foreground))] text-xs gap-1.5 px-4"
              >
                <Plus className="w-3.5 h-3.5" /> Nova Estrutura
              </TabsTrigger>
              <TabsTrigger
                value="montador"
                className="data-[state=active]:gradient-primary data-[state=active]:text-white text-[hsl(var(--muted-foreground))] text-xs gap-1.5 px-4"
              >
                <FilePenLine className="w-3.5 h-3.5" /> Montador Comercial
              </TabsTrigger>
              {selectedTemplate && (
                <TabsTrigger
                  value="criar"
                  className="data-[state=active]:gradient-primary data-[state=active]:text-white text-[hsl(var(--muted-foreground))] text-xs gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5" /> {selectedTemplate.nome}
                </TabsTrigger>
              )}
            </TabsList>
          </div>

          <TabsContent value="lista">
            <Card className="glass-card border-[0.5px]">
              <CardHeader>
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div>
                    <CardTitle className="text-sm text-white flex items-center gap-2">
                      <Vault className="w-4 h-4 text-primary" /> Cofre de Ativos Digitais
                    </CardTitle>
                    <CardDescription className="text-[10px] text-white/40 uppercase tracking-widest mt-1">
                      Contratos manuais e propostas do montador comercial
                    </CardDescription>
                  </div>
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[hsl(var(--muted-foreground))]" />
                    <Input
                      placeholder="Buscar..."
                      value={searchTerm}
                      onChange={(event) => setSearchTerm(event.target.value)}
                      className="pl-9 glass-input border-[rgba(255,255,255,0.1)] text-[hsl(var(--foreground))] text-xs h-8"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {filteredContratos.map((contrato) => (
                  <div
                    key={contrato.id}
                    className="flex items-center justify-between gap-4 p-3 rounded-lg"
                    style={{ background: "rgba(255,255,255,0.04)" }}
                  >
                    <div
                      className="flex items-center gap-3 cursor-pointer"
                      onClick={() => handleViewContrato(contrato)}
                    >
                      <FileText className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
                      <div>
                        <p className="text-sm font-medium text-[hsl(var(--foreground))]">{contrato.titulo}</p>
                        <p className="text-[11px] text-[hsl(var(--muted-foreground))]">
                          {(contrato.clientes as any)?.nome || "Cliente"} • Valor: R$ {formatContratoValue(contrato.valor)}
                          {isBuilderContract(contrato)
                            ? " • Montador Comercial"
                            : ` • ${contrato.data_envio ? `Enviado em ${contrato.data_envio}` : "Fluxo manual"}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap justify-end">
                      {isBuilderContract(contrato) && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-primary hover:text-primary text-xs h-7 px-2"
                          title="Abrir montador"
                          onClick={() => openBuilderContract(contrato)}
                        >
                          <FilePenLine className="w-3 h-3" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-white/40 hover:text-white text-xs h-7 px-2"
                        title="Ver contrato"
                        onClick={() => handleViewContrato(contrato)}
                      >
                        <Lock className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-white/40 hover:text-white text-xs h-7 px-2"
                        title="Baixar PDF"
                        onClick={() =>
                          generateContractPDF(
                            contrato.titulo,
                            (contrato as any).corpo || contrato.descricao || "",
                            (contrato as any).assinatura_admin,
                            (contrato as any).assinatura_cliente,
                          )
                        }
                      >
                        <Download className="w-3 h-3" />
                      </Button>
                      {isBuilderContract(contrato) && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-white/40 hover:text-white text-xs h-7 px-2"
                          title="Baixar Word"
                          onClick={() =>
                            downloadWordDocument(
                              contrato.titulo,
                              (contrato as any).corpo || contrato.descricao || "",
                            )
                          }
                        >
                          <FileText className="w-3 h-3" />
                        </Button>
                      )}
                      <Badge
                        variant="outline"
                        className="text-[9px] border-white/5 px-2 bg-white/5 text-white/60"
                        style={{
                          color: statusColors[contrato.status] || "#94a3b8",
                        }}
                      >
                        {statusLabels[contrato.status] || contrato.status}
                      </Badge>
                    </div>
                  </div>
                ))}
                {filteredContratos.length === 0 && (
                  <p className="text-sm text-[hsl(var(--muted-foreground))] text-center py-8">
                    Nenhum contrato encontrado
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="modelos">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {contractTemplates.map((template) => (
                <Card
                  key={template.id}
                  className="glass-card border-[0.5px] cursor-pointer hover:border-[hsl(var(--primary))]/50 transition-all"
                  onClick={() => handleSelectTemplate(template.id)}
                >
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary) / 0.6))" }}
                      >
                        <FileText className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[hsl(var(--foreground))]">{template.nome}</p>
                        <Badge
                          variant="outline"
                          className="text-[9px] border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))]"
                        >
                          {getContractTypeLabel(template.tipo)}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">
                      {template.variaveis.length} variáveis configuráveis
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="montador">
            <div className="space-y-6">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" /> Montador Comercial do Contrato Mestre
                  </h2>
                  <p className="text-xs text-white/50 mt-1">
                    Escolha o cliente, monte a proposta com planos e extras, edite os dados e exporte em PDF ou Word.
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {editingBuilderContract && (
                    <Badge variant="outline" className="border-primary/20 bg-primary/10 text-primary text-[10px] px-3 py-1">
                      Editando contrato salvo
                    </Badge>
                  )}
                  <Button size="sm" variant="outline" className="text-xs gap-1.5" onClick={resetBuilder}>
                    <Plus className="w-3.5 h-3.5" /> Novo montador
                  </Button>
                </div>
              </div>

              {!builderPayload ? (
                <Card className="glass-card border-[0.5px]">
                  <CardContent className="p-8 text-sm text-white/50 text-center">
                    Carregando catálogo comercial...
                  </CardContent>
                </Card>
              ) : (
                <>
                  <Card className="glass-card border-[0.5px]">
                    <CardHeader>
                      <CardTitle className="text-sm text-white flex items-center gap-2">
                        <FilePenLine className="w-4 h-4 text-primary" /> Base do contrato
                      </CardTitle>
                      <CardDescription className="text-xs text-white/40">
                        Escolha o cliente para puxar CPF/CNPJ, telefone, e-mail e endereço automaticamente.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-1.5">
                        <Label className="text-xs text-[hsl(var(--muted-foreground))]">Cliente</Label>
                        <Select value={builderPayload.clienteId || ""} onValueChange={handleBuilderClientChange}>
                          <SelectTrigger className="glass-input border-[rgba(255,255,255,0.1)] text-[hsl(var(--foreground))] text-sm h-9">
                            <SelectValue placeholder="Selecione o cliente para autofill..." />
                          </SelectTrigger>
                          <SelectContent>
                            {clientes.map((cliente) => (
                              <SelectItem key={cliente.id} value={cliente.id}>
                                {cliente.nome} — {cliente.email}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="border-white/10 text-white/60">
                              Dados do Contratante
                            </Badge>
                            <span className="text-[11px] text-white/40">Puxados do cadastro e editáveis</span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <Label className="text-xs text-[hsl(var(--muted-foreground))]">Nome do cliente</Label>
                              <Input
                                value={builderPayload.contractante.nome}
                                onChange={(event) => updateBuilderContractante("nome", event.target.value)}
                                className="glass-input border-[rgba(255,255,255,0.1)] text-[hsl(var(--foreground))]"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-xs text-[hsl(var(--muted-foreground))]">Empresa</Label>
                              <Input
                                value={builderPayload.contractante.nomeEmpresa || ""}
                                onChange={(event) => updateBuilderContractante("nomeEmpresa", event.target.value)}
                                className="glass-input border-[rgba(255,255,255,0.1)] text-[hsl(var(--foreground))]"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-xs text-[hsl(var(--muted-foreground))]">Documento do cliente (CPF/CNPJ)</Label>
                              <Input
                                value={builderPayload.contractante.documento}
                                onChange={(event) => updateBuilderContractante("documento", event.target.value)}
                                className="glass-input border-[rgba(255,255,255,0.1)] text-[hsl(var(--foreground))]"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-xs text-[hsl(var(--muted-foreground))]">E-mail</Label>
                              <Input
                                value={builderPayload.contractante.email || ""}
                                onChange={(event) => updateBuilderContractante("email", event.target.value)}
                                className="glass-input border-[rgba(255,255,255,0.1)] text-[hsl(var(--foreground))]"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-xs text-[hsl(var(--muted-foreground))]">WhatsApp</Label>
                              <Input
                                value={builderPayload.contractante.whatsapp || ""}
                                onChange={(event) => updateBuilderContractante("whatsapp", event.target.value)}
                                className="glass-input border-[rgba(255,255,255,0.1)] text-[hsl(var(--foreground))]"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-xs text-[hsl(var(--muted-foreground))]">Telefone</Label>
                              <Input
                                value={builderPayload.contractante.telefone || ""}
                                onChange={(event) => updateBuilderContractante("telefone", event.target.value)}
                                className="glass-input border-[rgba(255,255,255,0.1)] text-[hsl(var(--foreground))]"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-xs text-[hsl(var(--muted-foreground))]">Instagram</Label>
                              <Input
                                value={builderPayload.contractante.instagram || ""}
                                onChange={(event) => updateBuilderContractante("instagram", event.target.value)}
                                className="glass-input border-[rgba(255,255,255,0.1)] text-[hsl(var(--foreground))]"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-xs text-[hsl(var(--muted-foreground))]">Site</Label>
                              <Input
                                value={builderPayload.contractante.siteUrl || ""}
                                onChange={(event) => updateBuilderContractante("siteUrl", event.target.value)}
                                className="glass-input border-[rgba(255,255,255,0.1)] text-[hsl(var(--foreground))]"
                              />
                            </div>
                            <div className="space-y-1.5 md:col-span-2">
                              <Label className="text-xs text-[hsl(var(--muted-foreground))]">Endereço completo</Label>
                              <Textarea
                                value={builderPayload.contractante.endereco}
                                onChange={(event) => updateBuilderContractante("endereco", event.target.value)}
                                className="glass-input border-[rgba(255,255,255,0.1)] text-[hsl(var(--foreground))] min-h-[84px]"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="border-white/10 text-white/60">
                              Dados da Contratada
                            </Badge>
                            <span className="text-[11px] text-white/40">NovaesWeb já vem preenchida, mas você pode ajustar manualmente</span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <Label className="text-xs text-[hsl(var(--muted-foreground))]">Nome da contratada</Label>
                              <Input
                                value={builderPayload.contratada.nome}
                                onChange={(event) => updateBuilderContratada("nome", event.target.value)}
                                className="glass-input border-[rgba(255,255,255,0.1)] text-[hsl(var(--foreground))]"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-xs text-[hsl(var(--muted-foreground))]">Representante / CEO</Label>
                              <Input
                                value={builderPayload.contratada.representante}
                                onChange={(event) => updateBuilderContratada("representante", event.target.value)}
                                className="glass-input border-[rgba(255,255,255,0.1)] text-[hsl(var(--foreground))]"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-xs text-[hsl(var(--muted-foreground))]">CPF da contratada</Label>
                              <Input
                                value={builderPayload.contratada.documento}
                                onChange={(event) => updateBuilderContratada("documento", event.target.value)}
                                className="glass-input border-[rgba(255,255,255,0.1)] text-[hsl(var(--foreground))]"
                              />
                            </div>
                            <div className="space-y-1.5 md:col-span-2">
                              <Label className="text-xs text-[hsl(var(--muted-foreground))]">Endereço da contratada</Label>
                              <Textarea
                                value={builderPayload.contratada.endereco}
                                onChange={(event) => updateBuilderContratada("endereco", event.target.value)}
                                className="glass-input border-[rgba(255,255,255,0.1)] text-[hsl(var(--foreground))] min-h-[84px]"
                              />
                            </div>
                            <div className="space-y-1.5 md:col-span-2">
                              <Label className="text-xs text-[hsl(var(--muted-foreground))]">Observação jurídica da contratada</Label>
                              <Textarea
                                value={builderPayload.contratada.observacaoRecebimento}
                                onChange={(event) => updateBuilderContratada("observacaoRecebimento", event.target.value)}
                                className="glass-input border-[rgba(255,255,255,0.1)] text-[hsl(var(--foreground))] min-h-[96px]"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="glass-card border-[0.5px]">
                    <CardHeader>
                      <CardTitle className="text-sm text-white flex items-center gap-2">
                        <Boxes className="w-4 h-4 text-primary" /> Plano principal e extras
                      </CardTitle>
                      <CardDescription className="text-xs text-white/40">
                        O plano principal funciona com seleção única. Extras podem ser combinados em checkbox.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-3">
                        <Label className="text-xs text-[hsl(var(--muted-foreground))]">Plano principal</Label>
                        <RadioGroup
                          value={builderPayload.primaryPlanId}
                          onValueChange={(value) => handlePrimaryPlanChange(value as BuilderPrimaryPlanId)}
                          className="grid grid-cols-1 lg:grid-cols-3 gap-4"
                        >
                          <label className="glass-card border-[0.5px] rounded-2xl p-4 cursor-pointer flex items-start gap-3">
                            <RadioGroupItem value="none" className="mt-1" />
                            <div className="space-y-1">
                              <p className="text-sm font-semibold text-white">Sem plano principal</p>
                              <p className="text-xs text-white/50">
                                Use esta opção se o contrato for composto apenas por extras ou estrutura personalizada avulsa.
                              </p>
                            </div>
                          </label>
                          {PUBLIC_PLAN_CATALOG.map((plan) => (
                            <label key={plan.id} className="glass-card border-[0.5px] rounded-2xl p-4 cursor-pointer flex items-start gap-3">
                              <RadioGroupItem value={plan.id} className="mt-1" />
                              <div className="space-y-2 flex-1">
                                <div className="flex items-center justify-between gap-2">
                                  <p className="text-sm font-semibold text-white">{plan.title}</p>
                                  {plan.popular && (
                                    <Badge className="gradient-primary border-0 text-white text-[9px] px-2 py-0.5">
                                      Mais popular
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-xs text-white/50">{plan.description}</p>
                                <div className="text-xs text-primary font-medium">
                                  {plan.id === "sob-medida"
                                    ? "Sob análise comercial"
                                    : `${plan.pricePrefix ? `${plan.pricePrefix} ` : ""}${formatCurrencyBRL(plan.setupPrice)}`}
                                </div>
                              </div>
                            </label>
                          ))}
                        </RadioGroup>
                      </div>

                      {builderPayload.primaryPlanId === "sob-medida" && (
                        <div className="space-y-1.5">
                          <Label className="text-xs text-[hsl(var(--muted-foreground))]">
                            Descrição do Escopo Customizado
                          </Label>
                          <Textarea
                            value={builderPayload.customScope}
                            onChange={(event) => updateBuilderTextField("customScope", event.target.value)}
                            placeholder="Ex.: Desenvolvimento de sistema de agendamento com integração com agenda Google e painel de controle de prestadores."
                            className="glass-input border-[rgba(255,255,255,0.1)] text-[hsl(var(--foreground))] min-h-[110px]"
                          />
                        </div>
                      )}

                      <div className="space-y-4">
                        {Object.entries(groupedExtras || {}).map(([group, items]) => (
                          <div key={group} className="space-y-3">
                            <div className="flex items-center justify-between gap-3 flex-wrap">
                              <Label className="text-xs uppercase tracking-[0.18em] text-white/45">
                                {builderGroupTitles[group] || group}
                              </Label>
                              <Badge variant="outline" className="border-white/10 text-white/50">
                                {items.length} item(ns)
                              </Badge>
                            </div>
                            <div className="rounded-2xl border border-white/10 overflow-hidden">
                              <div className="hidden md:grid grid-cols-[80px_1.2fr_1.5fr_160px_160px] gap-3 px-4 py-3 text-[10px] uppercase tracking-[0.18em] text-white/40 bg-white/[0.03]">
                                <span>Incluir</span>
                                <span>Serviço</span>
                                <span>Descrição</span>
                                <span>Setup</span>
                                <span>Mensal</span>
                              </div>
                              {items.map((item) => (
                                <div
                                  key={item.id}
                                  className="grid grid-cols-1 md:grid-cols-[80px_1.2fr_1.5fr_160px_160px] gap-3 px-4 py-4 border-t border-white/5 first:border-t-0 bg-white/[0.02]"
                                >
                                  <div className="flex items-center md:justify-center">
                                    <input
                                      type="checkbox"
                                      checked={item.selected}
                                      onChange={(event) => handleBuilderItemToggle(item.id, event.target.checked)}
                                      className="h-4 w-4 rounded border-white/20 bg-transparent accent-[hsl(var(--primary))]"
                                    />
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-white">{item.name}</p>
                                    <p className="text-[11px] text-white/40 md:hidden mt-1">{item.description}</p>
                                  </div>
                                  <p className="hidden md:block text-sm text-white/55">{item.description}</p>
                                  <div className="space-y-1.5">
                                    <Label className="text-[10px] uppercase tracking-[0.16em] text-white/35 md:hidden">Setup</Label>
                                    <Input
                                      type="number"
                                      step="0.01"
                                      value={item.setupPrice}
                                      onChange={(event) => handleBuilderItemPriceChange(item.id, "setupPrice", event.target.value)}
                                      className="glass-input border-[rgba(255,255,255,0.1)] text-[hsl(var(--foreground))] h-9"
                                    />
                                  </div>
                                  <div className="space-y-1.5">
                                    <Label className="text-[10px] uppercase tracking-[0.16em] text-white/35 md:hidden">Mensal</Label>
                                    <Input
                                      type="number"
                                      step="0.01"
                                      value={item.monthlyPrice}
                                      onChange={(event) => handleBuilderItemPriceChange(item.id, "monthlyPrice", event.target.value)}
                                      className="glass-input border-[rgba(255,255,255,0.1)] text-[hsl(var(--foreground))] h-9"
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="glass-card border-[0.5px]">
                    <CardHeader>
                      <CardTitle className="text-sm text-white flex items-center gap-2">
                        <CircleDollarSign className="w-4 h-4 text-primary" /> Totais, condições e observações
                      </CardTitle>
                      <CardDescription className="text-xs text-white/40">
                        Os totais começam automáticos, mas você pode ajustar negociação, entrada, saldo e mensalidade.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        <Card className="bg-white/[0.03] border-white/10">
                          <CardContent className="p-4 space-y-1">
                            <p className="text-[11px] uppercase tracking-[0.18em] text-white/40">Total implantação</p>
                            <p className="text-xl font-semibold text-white">{formatCurrencyBRL(builderPayload.pricing.setupSubtotal)}</p>
                          </CardContent>
                        </Card>
                        <Card className="bg-white/[0.03] border-white/10">
                          <CardContent className="p-4 space-y-1">
                            <p className="text-[11px] uppercase tracking-[0.18em] text-white/40">Total mensal</p>
                            <p className="text-xl font-semibold text-white">{formatCurrencyBRL(builderPayload.pricing.monthlySubtotal)}</p>
                          </CardContent>
                        </Card>
                        <Card className="bg-white/[0.03] border-white/10">
                          <CardContent className="p-4 space-y-1">
                            <p className="text-[11px] uppercase tracking-[0.18em] text-white/40">Saldo na entrega</p>
                            <p className="text-xl font-semibold text-white">{formatCurrencyBRL(builderPayload.pricing.balanceValue)}</p>
                          </CardContent>
                        </Card>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                        <div className="space-y-1.5">
                          <Label className="text-xs text-[hsl(var(--muted-foreground))]">Valor negociado</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={builderPayload.pricing.negotiatedSetup}
                            onChange={(event) => handleBuilderPricingChange("negotiatedSetup", event.target.value)}
                            className="glass-input border-[rgba(255,255,255,0.1)] text-[hsl(var(--foreground))]"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs text-[hsl(var(--muted-foreground))]">Entrada / sinal</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={builderPayload.pricing.entryValue}
                            onChange={(event) => handleBuilderPricingChange("entryValue", event.target.value)}
                            className="glass-input border-[rgba(255,255,255,0.1)] text-[hsl(var(--foreground))]"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs text-[hsl(var(--muted-foreground))]">Saldo na entrega</Label>
                          <Input
                            value={builderPayload.pricing.balanceValue}
                            readOnly
                            className="glass-input border-[rgba(255,255,255,0.08)] text-[hsl(var(--foreground))] opacity-80"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs text-[hsl(var(--muted-foreground))]">Mensalidade negociada</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={builderPayload.pricing.negotiatedMonthly}
                            onChange={(event) => handleBuilderPricingChange("negotiatedMonthly", event.target.value)}
                            className="glass-input border-[rgba(255,255,255,0.1)] text-[hsl(var(--foreground))]"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                        <div className="space-y-1.5">
                          <Label className="text-xs text-[hsl(var(--muted-foreground))]">Prazo em dias</Label>
                          <Input
                            value={builderPayload.prazoDias}
                            onChange={(event) => updateBuilderTextField("prazoDias", event.target.value)}
                            className="glass-input border-[rgba(255,255,255,0.1)] text-[hsl(var(--foreground))]"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs text-[hsl(var(--muted-foreground))]">Forma de pagamento</Label>
                          <Input
                            value={builderPayload.formaPagamento}
                            onChange={(event) => updateBuilderTextField("formaPagamento", event.target.value)}
                            className="glass-input border-[rgba(255,255,255,0.1)] text-[hsl(var(--foreground))]"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs text-[hsl(var(--muted-foreground))]">Revisões incluídas</Label>
                          <Input
                            value={builderPayload.numeroRevisoes}
                            onChange={(event) => updateBuilderTextField("numeroRevisoes", event.target.value)}
                            className="glass-input border-[rgba(255,255,255,0.1)] text-[hsl(var(--foreground))]"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs text-[hsl(var(--muted-foreground))]">Valor de revisão extra</Label>
                          <Input
                            value={builderPayload.valorRevisao}
                            onChange={(event) => updateBuilderTextField("valorRevisao", event.target.value)}
                            className="glass-input border-[rgba(255,255,255,0.1)] text-[hsl(var(--foreground))]"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                          <Label className="text-xs text-[hsl(var(--muted-foreground))]">Prazo de suporte</Label>
                          <Input
                            value={builderPayload.prazoSuporte}
                            onChange={(event) => updateBuilderTextField("prazoSuporte", event.target.value)}
                            className="glass-input border-[rgba(255,255,255,0.1)] text-[hsl(var(--foreground))]"
                          />
                        </div>
                        <div className="space-y-1.5 xl:col-span-2">
                          <Label className="text-xs text-[hsl(var(--muted-foreground))]">Observações comerciais</Label>
                          <Textarea
                            value={builderPayload.observacoesComerciais}
                            onChange={(event) => updateBuilderTextField("observacoesComerciais", event.target.value)}
                            className="glass-input border-[rgba(255,255,255,0.1)] text-[hsl(var(--foreground))] min-h-[110px]"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs text-[hsl(var(--muted-foreground))]">Escopo e exclusões</Label>
                        <Textarea
                          value={builderPayload.escopoExclusoes}
                          onChange={(event) => updateBuilderTextField("escopoExclusoes", event.target.value)}
                          className="glass-input border-[rgba(255,255,255,0.1)] text-[hsl(var(--foreground))] min-h-[110px]"
                        />
                      </div>

                      <div className="flex flex-wrap gap-3 pt-4 border-t border-[hsl(var(--border))]">
                        <Button size="sm" variant="outline" className="text-xs gap-1.5" onClick={handleBuilderPreview}>
                          <Eye className="w-3 h-3" /> Pré-visualizar
                        </Button>
                        <Button size="sm" variant="outline" className="text-xs gap-1.5" onClick={handleSaveBuilder}>
                          <Save className="w-3 h-3" /> {editingBuilderContract ? "Atualizar contrato" : "Salvar no cofre"}
                        </Button>
                        <Button size="sm" variant="outline" className="text-xs gap-1.5" onClick={handleBuilderPdfDownload}>
                          <Download className="w-3 h-3" /> Baixar PDF
                        </Button>
                        <Button size="sm" className="gradient-primary border-0 text-white text-xs gap-1.5" onClick={handleBuilderWordDownload}>
                          <FileText className="w-3 h-3" /> Baixar Word
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          </TabsContent>

          <TabsContent value="criar">
            {selectedTemplate && (
              <div className="space-y-6">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-[hsl(var(--muted-foreground))] text-xs"
                  onClick={() => {
                    setTab("modelos");
                    setSelectedTemplate(null);
                  }}
                >
                  <ChevronLeft className="w-3 h-3 mr-1" /> Voltar aos modelos
                </Button>

                <Card className="glass-card border-[0.5px]">
                  <CardHeader>
                    <CardTitle className="text-sm text-white">{selectedTemplate.nome}</CardTitle>
                    <CardDescription className="text-xs text-white/40">
                      Configure os parâmetros do contrato manual
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-1.5">
                      <Label className="text-xs text-[hsl(var(--muted-foreground))]">Cliente</Label>
                      <Select value={selectedClienteId} onValueChange={setSelectedClienteId}>
                        <SelectTrigger className="glass-input border-[rgba(255,255,255,0.1)] text-[hsl(var(--foreground))] text-sm h-9">
                          <SelectValue placeholder="Selecione o cliente..." />
                        </SelectTrigger>
                        <SelectContent>
                          {clientes.map((cliente) => (
                            <SelectItem key={cliente.id} value={cliente.id}>
                              {cliente.nome} — {cliente.email}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedTemplate.variaveis.map((variable) => (
                        <div
                          key={variable.key}
                          className={`space-y-1.5 ${variable.type === "textarea" ? "md:col-span-2" : ""}`}
                        >
                          <Label className="text-xs text-[hsl(var(--muted-foreground))]">{variable.label}</Label>
                          {variable.type === "textarea" ? (
                            <Textarea
                              value={formValues[variable.key] || ""}
                              onChange={(event) =>
                                setFormValues((prev) => ({ ...prev, [variable.key]: event.target.value }))
                              }
                              className="glass-input border-[rgba(255,255,255,0.1)] text-[hsl(var(--foreground))] text-sm min-h-[80px]"
                            />
                          ) : (
                            <Input
                              type={
                                variable.type === "number"
                                  ? "number"
                                  : variable.type === "date"
                                    ? "date"
                                    : "text"
                              }
                              value={formValues[variable.key] || ""}
                              onChange={(event) =>
                                setFormValues((prev) => ({ ...prev, [variable.key]: event.target.value }))
                              }
                              className="glass-input border-[rgba(255,255,255,0.1)] text-[hsl(var(--foreground))] text-sm h-9"
                            />
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="pt-4 border-t border-[hsl(var(--border))]">
                      {adminSignature ? (
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-emerald-400 flex items-center gap-1">
                            <PenTool className="w-3 h-3" /> Assinatura da CONTRATADA adicionada
                          </p>
                          <div className="bg-white rounded-lg p-2 inline-block">
                            <img src={adminSignature} alt="Assinatura Admin" className="h-12" />
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-xs text-[hsl(var(--muted-foreground))]"
                            onClick={() => setSignOpen(true)}
                          >
                            Refazer assinatura
                          </Button>
                        </div>
                      ) : (
                        <Button size="sm" variant="outline" className="text-xs gap-1.5" onClick={() => setSignOpen(true)}>
                          <PenTool className="w-3 h-3" /> Assinar como CONTRATADA
                        </Button>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-3 pt-4 border-t border-[hsl(var(--border))]">
                      <Button size="sm" variant="outline" className="text-xs gap-1.5" onClick={handlePreview}>
                        <Eye className="w-3 h-3" /> Pré-visualizar
                      </Button>
                      <Button size="sm" variant="outline" className="text-xs gap-1.5" onClick={() => handleSave("rascunho")}>
                        <Save className="w-3 h-3" /> Salvar rascunho
                      </Button>
                      <Button
                        size="sm"
                        className="gradient-primary border-0 text-white text-xs gap-1.5"
                        onClick={() => handleSave("aguardando")}
                      >
                        <Send className="w-3 h-3" /> Enviar para assinatura
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </motion.div>

      <Dialog open={signOpen} onOpenChange={setSignOpen}>
        <DialogContent className="glass-card border-[0.5px] max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-[hsl(var(--foreground))] text-sm">Assinatura da CONTRATADA</DialogTitle>
          </DialogHeader>
          <SignaturePad
            label="Assine abaixo como representante da NovaesWeb"
            onSave={(dataUrl) => {
              setAdminSignature(dataUrl);
              setSignOpen(false);
              toast({ title: "Assinatura adicionada!" });
            }}
            onCancel={() => setSignOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto glass-card border-[0.5px]">
          <DialogHeader>
            <DialogTitle className="text-[hsl(var(--foreground))] text-sm flex items-center justify-between gap-2">
              <span>{previewState?.title || "Pré-visualização do contrato"}</span>
              {previewState && (
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs gap-1"
                    onClick={() =>
                      generateContractPDF(
                        previewState.title,
                        previewState.body,
                        previewState.assinaturaAdmin,
                        previewState.assinaturaCliente,
                      )
                    }
                  >
                    <Download className="w-3 h-3" /> Baixar PDF
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs gap-1"
                    onClick={() => downloadWordDocument(previewState.title, previewState.body)}
                  >
                    <FileText className="w-3 h-3" /> Baixar Word
                  </Button>
                </div>
              )}
            </DialogTitle>
          </DialogHeader>
          <div className="bg-white text-black p-8 rounded-lg font-serif text-sm leading-relaxed whitespace-pre-wrap">
            {previewState?.body}
          </div>
          {previewState && (previewState.assinaturaAdmin || previewState.assinaturaCliente) && (
            <div className="bg-white p-4 rounded-lg space-y-4">
              {previewState.assinaturaAdmin && (
                <div>
                  <p className="text-xs font-bold text-gray-600 mb-1">Assinatura CONTRATADA:</p>
                  <img src={previewState.assinaturaAdmin} alt="Assinatura Admin" className="h-16" />
                </div>
              )}
              {previewState.assinaturaCliente && (
                <div>
                  <p className="text-xs font-bold text-gray-600 mb-1">Assinatura CONTRATANTE:</p>
                  <img src={previewState.assinaturaCliente} alt="Assinatura Cliente" className="h-16" />
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
