import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Archive,
  Boxes,
  CheckCircle2,
  CircleDollarSign,
  Download,
  Eye,
  FilePenLine,
  FileText,
  History,
  Lock,
  MoreHorizontal,
  Plus,
  RefreshCw,
  RotateCcw,
  Save,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Trash2,
  Vault,
} from "lucide-react";
import jsPDF from "jspdf";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useRealtimeSubscription } from "@/hooks/useRealtimeSubscription";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { invokeAdminFunction, refreshAdminSessionSilently } from "@/lib/admin-function-client";
import {
  buildContractClauseExplanations,
  buildProposalSummary,
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
  type ContractClauseExplanation,
  type ContractBuilderPayload,
  type ContractBuilderPricing,
  type ContractProposalSummary,
  type ContractBuilderStepIndex,
} from "@/lib/contract-builder";
import { validateAndSanitizeBuilderPayload } from "@/lib/contract-builder-schema";
import {
  clearContractRecoverySnapshot,
  consumePendingContractRecoverySnapshot,
  loadContractRecoverySnapshot,
  saveContractRecoverySnapshot,
  type ContractRecoveryOriginAction,
} from "@/lib/contract-recovery";
import { contractTemplates, fillTemplate, getContractTypeLabel } from "@/lib/contract-templates";
import { PUBLIC_PLAN_CATALOG } from "@/lib/public-plans";

type Cliente = Tables<"clientes">;
type ExtraCatalogo = Tables<"extras_catalogo">;
type Contrato = Tables<"contratos"> & {
  clientes?: {
    nome: string;
  } | null;
};
type ContratoVersion = Tables<"contrato_versions">;

interface PreviewState {
  title: string;
  body: string;
  assinaturaAdmin?: string | null;
  assinaturaCliente?: string | null;
  proposal?: ContractBuilderPayload | null;
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
  aguardando: "Leitura do cliente",
  assinado: "Assinado",
  cancelado: "Cancelado",
  rascunho: "Rascunho",
};

const builderGroupTitles: Record<string, string> = {
  fixo: "Extras Únicos",
  intermediario: "Extras Pro",
  mensal: "Extras Mensais",
};

const moneyDraftFieldPattern = /^(item|pricing):(.+):(setupPrice|monthlyPrice|negotiatedSetup|entryValue|negotiatedMonthly)$/;

type MoneyDraftField = "setupPrice" | "monthlyPrice" | "negotiatedSetup" | "entryValue" | "negotiatedMonthly";

function buildPdfFileName(title: string) {
  return title.replace(/[^a-zA-Z0-9]/g, "_");
}

function formatMoneyInputValue(value: number) {
  return Number(value || 0).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function buildItemMoneyDraftKey(itemId: string, field: "setupPrice" | "monthlyPrice") {
  return `item:${itemId}:${field}`;
}

function buildPricingMoneyDraftKey(field: "negotiatedSetup" | "entryValue" | "negotiatedMonthly") {
  return `pricing:root:${field}`;
}

function getContractErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) return error.message;

  if (error && typeof error === "object" && "message" in error && typeof error.message === "string") {
    return error.message;
  }

  return fallback;
}

function drawWrappedText(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  pageHeight: number,
  bottomMargin: number,
) {
  const lines = doc.splitTextToSize(text, maxWidth);
  let nextY = y;

  for (const line of lines) {
    if (nextY > pageHeight - bottomMargin) {
      doc.addPage();
      nextY = 18;
    }
    doc.text(line, x, nextY);
    nextY += lineHeight;
  }

  return nextY;
}

type ContractPdfOptions = {
  assinaturaAdmin?: string | null;
  assinaturaCliente?: string | null;
  proposal?: ContractBuilderPayload | null;
};

function generateContractPDF(
  titulo: string,
  corpo: string,
  options?: ContractPdfOptions,
) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 18;
  const maxWidth = pageWidth - margin * 2;
  const summary = options?.proposal ? buildProposalSummary(options.proposal) : null;
  const explanations = options?.proposal ? buildContractClauseExplanations(options.proposal) : [];
  const assinaturaAdmin = options?.assinaturaAdmin;
  const assinaturaCliente = options?.assinaturaCliente;

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

  let y = 38;

  if (summary) {
    doc.setFont("helvetica", "normal");
    doc.setTextColor(92, 77, 104);
    doc.setFontSize(9.5);
    y = drawWrappedText(
      doc,
      "Proposta premium gerada pelo montador comercial da NovaesWeb com escopo selecionado, condições financeiras e corpo contratual consolidado.",
      margin,
      y,
      maxWidth,
      5,
      pageHeight,
      18,
    );

    const cardWidth = (maxWidth - 8) / 2;
    const drawSummaryCard = (title: string, lines: string[], x: number, startY: number) => {
      const contentLines = lines.flatMap((line) => doc.splitTextToSize(line, cardWidth - 10));
      const cardHeight = Math.max(26, 16 + contentLines.length * 4.4);
      doc.setDrawColor(236, 223, 244);
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(x, startY, cardWidth, cardHeight, 4, 4, "FD");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(141, 60, 176);
      doc.text(title.toUpperCase(), x + 5, startY + 7);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(55, 43, 64);
      let cardY = startY + 13;
      contentLines.forEach((line) => {
        doc.text(line, x + 5, cardY);
        cardY += 4.4;
      });
      return cardHeight;
    };

    y += 4;
    const leftHeight = drawSummaryCard(summary.contractante.title, summary.contractante.lines, margin, y);
    const rightHeight = drawSummaryCard(summary.contratada.title, summary.contratada.lines, margin + cardWidth + 8, y);
    y += Math.max(leftHeight, rightHeight) + 8;
    const comercialHeight = drawSummaryCard(summary.comercial.title, summary.comercial.lines, margin, y);
    y += comercialHeight + 8;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(141, 60, 176);
    doc.text("PLANO E SERVIÇOS CONTRATADOS", margin, y);
    y += 7;

    const serviceLines: string[] = [];
    if (summary.selectedPlan) {
      serviceLines.push(`${summary.selectedPlan.name} — ${summary.selectedPlan.pricing}`);
    }
    if (summary.customScope) {
      serviceLines.push(`Escopo customizado: ${summary.customScope}`);
    }
    summary.selectedServices.forEach((service) => {
      serviceLines.push(`${service.name} — ${service.pricing}`);
      if (service.description) {
        serviceLines.push(`Descrição: ${service.description}`);
      }
    });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.4);
    doc.setTextColor(41, 31, 50);
    serviceLines.forEach((line) => {
      if (y > pageHeight - 22) {
        doc.addPage();
        y = 18;
      }
      const wrapped = doc.splitTextToSize(`• ${line}`, maxWidth);
      wrapped.forEach((entry: string) => {
        if (y > pageHeight - 22) {
          doc.addPage();
          y = 18;
        }
        doc.text(entry, margin, y);
        y += 4.8;
      });
      y += 1;
    });

    y += 3;
    doc.setDrawColor(240, 216, 234);
    doc.line(margin, y, pageWidth - margin, y);
    y += 8;
  }

  if (explanations.length > 0) {
    if (y > pageHeight - 28) {
      doc.addPage();
      y = 18;
    }

    doc.setFont("helvetica", "bold");
    doc.setTextColor(141, 60, 176);
    doc.setFontSize(10);
    doc.text("CONTRATO EXPLICADO EM LINGUAGEM SIMPLES", margin, y);
    y += 7;

    explanations.forEach((item) => {
      if (y > pageHeight - 26) {
        doc.addPage();
        y = 18;
      }

      doc.setFont("helvetica", "bold");
      doc.setTextColor(76, 33, 102);
      doc.setFontSize(9.8);
      y = drawWrappedText(
        doc,
        `Cláusula ${item.number} — ${item.title}`,
        margin,
        y,
        maxWidth,
        4.9,
        pageHeight,
        18,
      );

      doc.setFont("helvetica", "normal");
      doc.setTextColor(41, 31, 50);
      doc.setFontSize(9.6);
      y = drawWrappedText(doc, item.explanation, margin, y + 1, maxWidth, 4.8, pageHeight, 18);
      y += 3.5;
    });

    doc.setDrawColor(240, 216, 234);
    doc.line(margin, y, pageWidth - margin, y);
    y += 8;
  }

  doc.setFont("helvetica", "bold");
  doc.setTextColor(19, 13, 26);
  doc.setFontSize(11);
  doc.text("Corpo contratual", margin, y);
  y += 7;

  const paragraphs = corpo.split(/\n{2,}/).map((block) => block.trim()).filter(Boolean);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10.2);
  doc.setTextColor(31, 23, 40);

  for (const paragraph of paragraphs) {
    const isClause =
      /^CLÁUSULA\s+\d+/i.test(paragraph) ||
      /^CONTRATO /i.test(paragraph) ||
      /^CONTRATANTE:/i.test(paragraph) ||
      /^CONTRATADA:/i.test(paragraph);
    if (isClause) {
      if (y > pageHeight - 24) {
        doc.addPage();
        y = 18;
      }
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10.6);
      doc.setTextColor(90, 34, 122);
      y = drawWrappedText(doc, paragraph, margin, y, maxWidth, 5.1, pageHeight, 18);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10.2);
      doc.setTextColor(31, 23, 40);
      y += 1.5;
      continue;
    }

    y = drawWrappedText(doc, paragraph, margin, y, maxWidth, 5, pageHeight, 18);
    y += 2.5;
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

function downloadWordDocument(
  title: string,
  body: string,
  proposal?: ContractBuilderPayload | null,
) {
  const blob = new Blob([buildContractWordHtml(title, body, proposal)], {
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
  fallbackStep: ContractBuilderStepIndex = 0,
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

  const normalizedPayload: ContractBuilderPayload = {
    ...base,
    ...payload,
    clienteId: payload.clienteId || fallbackClientId,
    lastStep: normalizeBuilderStep(payload.lastStep, fallbackStep),
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

  try {
    return validateAndSanitizeBuilderPayload(normalizedPayload);
  } catch {
    return normalizedPayload;
  }
}

function buildBuilderSavePayload(
  payload: ContractBuilderPayload,
  currentStep: ContractBuilderStepIndex = payload.lastStep,
) {
  const template = contractTemplates.find((item) => item.id === BUILDER_TEMPLATE_ID);
  if (!template) return null;

  const normalizedPayload = validateAndSanitizeBuilderPayload({
    ...payload,
    lastStep: currentStep,
    updatedAt: new Date().toISOString(),
  });

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

function normalizeBuilderStep(
  value: unknown,
  fallback: ContractBuilderStepIndex,
): ContractBuilderStepIndex {
  return value === 0 || value === 1 || value === 2 || value === 3 || value === 4
    ? value
    : fallback;
}

function hasMeaningfulBuilderState(payload: ContractBuilderPayload) {
  return Boolean(
    payload.clienteId ||
      payload.primaryPlanId !== "none" ||
      payload.items.some(
        (item) => item.selected || Number(item.setupPrice || 0) > 0 || Number(item.monthlyPrice || 0) > 0,
      ) ||
      payload.customScope.trim() ||
      payload.observacoesComerciais.trim() ||
      payload.escopoExclusoes.trim() ||
      Number(payload.pricing.negotiatedSetup || 0) > 0 ||
      Number(payload.pricing.negotiatedMonthly || 0) > 0
  );
}

function formatContratoValue(value: number | null) {
  return Number(value || 0).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatContractClock(value: string | null | undefined) {
  if (!value) return null;

  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatContractDateTime(value: string | null | undefined) {
  if (!value) return null;

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function buildBuilderDirtySignature(
  payload: ContractBuilderPayload,
  currentStep: ContractBuilderStepIndex,
) {
  return JSON.stringify({
    ...payload,
    lastStep: currentStep,
    updatedAt: "",
  });
}

const BUILDER_STEPS: Array<{
  id: ContractBuilderStepIndex;
  label: string;
  description: string;
}> = [
  { id: 0, label: "Cliente", description: "Selecione o cadastro base da proposta." },
  { id: 1, label: "Partes", description: "Revise contratante e contratada." },
  { id: 2, label: "Plano e extras", description: "Monte o escopo comercial contratado." },
  { id: 3, label: "Totais", description: "Ajuste valores, prazo e observações." },
  { id: 4, label: "Preview final", description: "Confira a proposta premium antes de salvar ou exportar." },
];

function ContractSummaryCard({
  title,
  eyebrow,
  lines,
}: {
  title: string;
  eyebrow: string;
  lines: string[];
}) {
  return (
    <Card className="bg-white/[0.03] border-white/10">
      <CardContent className="p-4 space-y-3">
        <div className="space-y-1">
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/35">{eyebrow}</p>
          <p className="text-base font-semibold text-white">{title}</p>
        </div>
        <div className="space-y-1.5 text-sm text-white/65">
          {lines.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function ContractClauseExplanationCard({
  item,
}: {
  item: ContractClauseExplanation;
}) {
  return (
    <Card className="bg-white/[0.03] border-white/10">
      <CardContent className="p-4 space-y-2">
        <div className="space-y-1">
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/35">Cláusula {item.number}</p>
          <p className="text-sm font-semibold text-white">{item.title}</p>
        </div>
        <p className="text-sm text-white/65 leading-relaxed">{item.explanation}</p>
      </CardContent>
    </Card>
  );
}

function AnimatedValue({
  value,
  format,
  className,
}: {
  value: number;
  format: (value: number) => string;
  className?: string;
}) {
  const shouldReduceMotion = useReducedMotion();
  const [displayValue, setDisplayValue] = useState(value);
  const previousValueRef = useRef(value);

  useEffect(() => {
    const from = previousValueRef.current;
    previousValueRef.current = value;

    if (shouldReduceMotion || Math.abs(from - value) < 0.01) {
      setDisplayValue(value);
      return;
    }

    const startedAt = performance.now();
    const duration = 320;
    let frameId = 0;

    const step = (now: number) => {
      const progress = Math.min((now - startedAt) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(from + (value - from) * eased);

      if (progress < 1) {
        frameId = requestAnimationFrame(step);
      }
    };

    frameId = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [shouldReduceMotion, value]);

  return <span className={className}>{format(displayValue)}</span>;
}

function SummaryMetric({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
      <p className="text-[10px] uppercase tracking-[0.2em] text-white/35">{label}</p>
      <AnimatedValue
        value={value}
        format={formatCurrencyBRL}
        className="mt-2 block text-lg font-semibold text-white"
      />
    </div>
  );
}

function VersionComparisonCard({
  label,
  title,
  description,
  value,
  summary,
  createdAt,
}: {
  label: string;
  title: string;
  description?: string | null;
  value: number;
  summary: ContractProposalSummary | null;
  createdAt?: string | null;
}) {
  return (
    <Card className="bg-white/[0.03] border-white/10">
      <CardContent className="p-5 space-y-4">
        <div className="space-y-1">
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/35">{label}</p>
          <p className="text-base font-semibold text-white">{title}</p>
          {description && <p className="text-sm text-white/50 leading-relaxed">{description}</p>}
          <div className="flex items-center gap-2 flex-wrap text-xs text-white/45">
            <span>Valor: {formatCurrencyBRL(value)}</span>
            {createdAt && <span>• {formatContractDateTime(createdAt)}</span>}
          </div>
        </div>

        {summary ? (
          <div className="space-y-3 text-sm text-white/65">
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] text-white/35">Cliente</p>
              <p className="text-white">{summary.contractante.title}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] text-white/35">Plano</p>
              <p className="text-white">{summary.selectedPlan?.name || "Sem plano principal"}</p>
              {summary.selectedPlan && <p className="text-primary">{summary.selectedPlan.pricing}</p>}
            </div>
            {summary.customScope && (
              <div>
                <p className="text-[10px] uppercase tracking-[0.18em] text-white/35">Escopo</p>
                <p>{summary.customScope}</p>
              </div>
            )}
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] text-white/35">Itens contratados</p>
              <div className="space-y-1.5">
                {summary.selectedServices.length > 0 ? (
                  summary.selectedServices.slice(0, 6).map((item) => (
                    <div key={`${item.name}-${item.pricing}`} className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                      <p className="text-white">{item.name}</p>
                      <p className="text-xs text-primary mt-1">{item.pricing}</p>
                    </div>
                  ))
                ) : (
                  <p>Nenhum extra adicional selecionado.</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-white/45">Resumo comercial indisponível nesta versão.</p>
        )}
      </CardContent>
    </Card>
  );
}

function BuilderPreviewDocument({
  title,
  body,
  summary,
  explanations,
}: {
  title: string;
  body: string;
  summary: ContractProposalSummary | null;
  explanations: ContractClauseExplanation[];
}) {
  return (
    <div className="space-y-6">
      <Card className="border-primary/20 bg-[linear-gradient(135deg,rgba(123,31,162,0.22),rgba(232,51,74,0.16),rgba(194,24,91,0.2))]">
        <CardContent className="p-6 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="border-white/15 bg-white/10 text-white/80">
              NovaesWeb
            </Badge>
            <Badge variant="outline" className="border-primary/20 bg-primary/10 text-primary">
              Proposta premium
            </Badge>
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-semibold text-white leading-tight">{title}</h3>
            <p className="text-sm text-white/65 max-w-3xl">
              Estrutura comercial gerada no montador do contrato mestre, com escopo, condições financeiras e cláusulas
              consolidadas para fechamento.
            </p>
          </div>
        </CardContent>
      </Card>

      {summary && (
        <>
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <ContractSummaryCard
              title={summary.contractante.title}
              eyebrow={summary.contractante.eyebrow}
              lines={summary.contractante.lines}
            />
            <ContractSummaryCard
              title={summary.contratada.title}
              eyebrow={summary.contratada.eyebrow}
              lines={summary.contratada.lines}
            />
            <ContractSummaryCard
              title={summary.comercial.title}
              eyebrow={summary.comercial.eyebrow}
              lines={summary.comercial.lines}
            />
          </div>

          <Card className="glass-card border-[0.5px]">
            <CardHeader>
              <CardTitle className="text-sm text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" /> Plano e serviços contratados
              </CardTitle>
              <CardDescription className="text-xs text-white/40">
                O documento final exibe somente os itens efetivamente contratados.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {summary.selectedPlan && (
                <Card className="bg-white/[0.03] border-primary/20">
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="border-primary/20 bg-primary/10 text-primary">
                        Plano principal
                      </Badge>
                      <p className="text-base font-semibold text-white">{summary.selectedPlan.name}</p>
                    </div>
                    <p className="text-sm text-primary">{summary.selectedPlan.pricing}</p>
                    {summary.selectedPlan.description && (
                      <p className="text-sm text-white/60">{summary.selectedPlan.description}</p>
                    )}
                  </CardContent>
                </Card>
              )}

              {summary.customScope && (
                <Card className="bg-white/[0.03] border-white/10">
                  <CardContent className="p-4 space-y-2">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-white/35">Escopo customizado</p>
                    <p className="text-sm text-white/75 leading-relaxed">{summary.customScope}</p>
                  </CardContent>
                </Card>
              )}

              {summary.selectedServices.length > 0 && (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                  {summary.selectedServices.map((service) => (
                    <Card key={`${service.name}-${service.pricing}`} className="bg-white/[0.03] border-white/10">
                      <CardContent className="p-4 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          {service.highlight && (
                            <Badge variant="outline" className="border-white/10 text-white/55">
                              {service.highlight}
                            </Badge>
                          )}
                          <p className="text-sm font-semibold text-white">{service.name}</p>
                        </div>
                        <p className="text-sm text-primary">{service.pricing}</p>
                        {service.description && <p className="text-sm text-white/60">{service.description}</p>}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      <Card className="glass-card border-[0.5px]">
        <CardContent className="p-0">
          <Accordion type="multiple" defaultValue={["contrato-explicado"]} className="w-full">
            <AccordionItem value="contrato-explicado">
              <AccordionTrigger className="px-6 py-5 text-sm text-white hover:no-underline">
                Contrato explicado em linguagem simples
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                  {explanations.map((item) => (
                    <ContractClauseExplanationCard
                      key={`${item.number}-${item.title}`}
                      item={item}
                    />
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="corpo-contratual" className="border-b-0">
              <AccordionTrigger className="px-6 py-5 text-sm text-white hover:no-underline">
                Corpo contratual completo
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6">
                <div className="rounded-2xl bg-white text-black p-6 font-serif text-sm leading-relaxed whitespace-pre-wrap">
                  {body}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}

function BuilderLiveSummary({
  summary,
  selectedCount,
}: {
  summary: ContractProposalSummary | null;
  selectedCount: number;
}) {
  if (!summary) {
    return (
      <Card className="glass-card border-[0.5px] bg-[linear-gradient(180deg,rgba(17,15,24,0.95),rgba(17,15,24,0.82))]">
        <CardContent className="p-5 text-sm text-white/45">
          Selecione o cliente e comece a montar a proposta para ver o resumo ao vivo.
        </CardContent>
      </Card>
    );
  }

  const comercialMap = summary.comercial.lines.reduce<Record<string, number>>((acc, line) => {
    const normalized = line.toLowerCase();
    const numericValue = parseMoneyInput(line);

    if (normalized.includes("ativação total")) acc.setup = numericValue;
    if (normalized.includes("entrada / sinal")) acc.entry = numericValue;
    if (normalized.includes("saldo na entrega")) acc.balance = numericValue;
    if (normalized.includes("mensalidade contratada")) acc.monthly = numericValue;
    return acc;
  }, {});

  return (
    <Card className="glass-card overflow-hidden border-[0.5px] border-cyan-400/15 bg-[linear-gradient(180deg,rgba(17,15,24,0.98),rgba(17,15,24,0.85))] shadow-[0_20px_50px_rgba(2,6,23,0.45)]">
      <CardHeader className="border-b border-white/10 bg-[linear-gradient(135deg,rgba(123,31,162,0.22),rgba(232,51,74,0.12),rgba(34,211,238,0.12))]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-sm text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-300" /> Resumo ao vivo
            </CardTitle>
            <CardDescription className="text-xs text-white/50">
              {selectedCount} item(ns) contratado(s) na proposta atual.
            </CardDescription>
          </div>
          <Badge variant="outline" className="border-cyan-400/20 bg-cyan-400/10 text-cyan-100">
            Workspace premium
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-5 p-5">
        <div className="grid grid-cols-2 gap-3">
          <SummaryMetric label="Implantação" value={comercialMap.setup || 0} />
          <SummaryMetric label="Mensalidade" value={comercialMap.monthly || 0} />
          <SummaryMetric label="Entrada" value={comercialMap.entry || 0} />
          <SummaryMetric label="Saldo" value={comercialMap.balance || 0} />
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 space-y-3">
          <div className="space-y-1">
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/35">{summary.contractante.eyebrow}</p>
            <p className="text-base font-semibold text-white">{summary.contractante.title}</p>
          </div>
          <div className="space-y-1 text-sm text-white/60">
            {summary.contractante.lines.slice(0, 4).map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-primary/20 bg-primary/10 p-4 space-y-2">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/35">Plano principal</p>
            <Badge variant="outline" className="border-white/10 text-white/60">
              {selectedCount} item(ns)
            </Badge>
          </div>
          <p className="text-sm font-medium text-white">{summary.selectedPlan?.name || "Sem plano principal"}</p>
          {summary.selectedPlan && <p className="text-sm text-primary">{summary.selectedPlan.pricing}</p>}
          {summary.customScope && <p className="text-sm text-white/60 leading-relaxed">{summary.customScope}</p>}
        </div>

        <div className="space-y-2">
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/35">Condições comerciais</p>
          <div className="space-y-2 text-sm text-white/60">
            {summary.comercial.lines.map((line) => (
              <div key={line} className="rounded-xl border border-white/10 bg-white/[0.025] px-3 py-2">
                {line}
              </div>
            ))}
          </div>
        </div>

        {summary.selectedServices.length > 0 && (
          <div className="space-y-2">
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/35">Extras selecionados</p>
            <div className="space-y-2">
              {summary.selectedServices.slice(0, 6).map((service) => (
                <motion.div
                  key={`${service.name}-${service.pricing}`}
                  layout
                  className="rounded-xl border border-white/10 bg-white/[0.03] p-3"
                >
                  <p className="text-sm font-medium text-white">{service.name}</p>
                  <p className="text-xs text-primary mt-1">{service.pricing}</p>
                </motion.div>
              ))}
              {summary.selectedServices.length > 6 && (
                <p className="text-xs text-white/40">+ {summary.selectedServices.length - 6} item(ns) adicional(is)</p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function Contratos() {
  const { toast } = useToast();
  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [contratosLoaded, setContratosLoaded] = useState(false);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [extrasCatalogo, setExtrasCatalogo] = useState<ExtraCatalogo[]>([]);
  const [extrasLoaded, setExtrasLoaded] = useState(false);
  const [tab, setTab] = useState("lista");
  const [searchTerm, setSearchTerm] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewState, setPreviewState] = useState<PreviewState | null>(null);
  const [builderPayload, setBuilderPayload] = useState<ContractBuilderPayload | null>(null);
  const [editingBuilderContract, setEditingBuilderContract] = useState<Contrato | null>(null);
  const [builderStep, setBuilderStep] = useState<ContractBuilderStepIndex>(0);
  const [mobileSummaryOpen, setMobileSummaryOpen] = useState(false);
  const [cofreFilter, setCofreFilter] = useState<"ativos" | "arquivados">("ativos");
  const [builderLastSavedSignature, setBuilderLastSavedSignature] = useState<string | null>(null);
  const [builderLastSavedAt, setBuilderLastSavedAt] = useState<string | null>(null);
  const [versionsOpen, setVersionsOpen] = useState(false);
  const [versionsLoading, setVersionsLoading] = useState(false);
  const [versionsContract, setVersionsContract] = useState<Contrato | null>(null);
  const [contractVersions, setContractVersions] = useState<ContratoVersion[]>([]);
  const [compareVersion, setCompareVersion] = useState<ContratoVersion | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Contrato | null>(null);
  const [moneyDrafts, setMoneyDrafts] = useState<Record<string, string>>({});
  const [builderRecoveredLocally, setBuilderRecoveredLocally] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const contractRecoveryRestoredRef = useRef(false);
  const contractRecoveryAutosaveSignatureRef = useRef<string | null>(null);
  const masterTemplate = contractTemplates[0];

  const syncBuilderSavedState = useCallback(
    (
      payload: ContractBuilderPayload,
      step: ContractBuilderStepIndex,
      savedAt?: string | null,
    ) => {
      setBuilderLastSavedSignature(buildBuilderDirtySignature(payload, step));
      setBuilderLastSavedAt(savedAt || null);
      setBuilderRecoveredLocally(false);
      contractRecoveryAutosaveSignatureRef.current = buildBuilderDirtySignature(payload, step);
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

  const loadContratos = useCallback(() => {
    supabase
      .from("contratos")
      .select("*, clientes(nome)")
      .eq("modelo", BUILDER_TEMPLATE_ID)
      .order("updated_at", { ascending: false })
      .then(({ data }) => {
        setContratos((data as Contrato[]) || []);
        setContratosLoaded(true);
      });
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

  const loadExtrasCatalogo = useCallback(async () => {
    const { data } = await supabase
      .from("extras_catalogo")
      .select("id, nome, descricao, categoria, preco_ativacao, preco_mensal, status, subcategoria")
      .eq("status", "ativo")
      .order("categoria", { ascending: true })
      .order("nome", { ascending: true });
    const extras = (data as ExtraCatalogo[]) || [];
    setExtrasCatalogo(extras);
    setExtrasLoaded(true);
    return extras;
  }, []);

  useEffect(() => {
    loadContratos();
    loadClientes();
    void loadExtrasCatalogo();
  }, [loadContratos, loadClientes, loadExtrasCatalogo]);

  useRealtimeSubscription("contratos", loadContratos);

  useEffect(() => {
    if (!builderPayload && extrasLoaded) {
      const emptyPayload = createEmptyBuilderPayload(extrasCatalogo);
      setBuilderPayload(emptyPayload);
      syncBuilderSavedState(emptyPayload, 0, null);
    }
  }, [builderPayload, extrasCatalogo, extrasLoaded, syncBuilderSavedState]);

  useEffect(() => {
    if (!contratosLoaded || !extrasLoaded || !builderPayload || contractRecoveryRestoredRef.current) {
      return;
    }

    const pendingRecoverySnapshot = consumePendingContractRecoverySnapshot();
    const recoverySnapshot = pendingRecoverySnapshot || loadContractRecoverySnapshot();
    contractRecoveryRestoredRef.current = true;

    if (!recoverySnapshot) {
      return;
    }

    if (!hasMeaningfulBuilderState(recoverySnapshot.builderPayload) && !recoverySnapshot.contractId) {
      clearContractRecoverySnapshot();
      return;
    }

    const restoredPayload = normalizeBuilderPayload(
      recoverySnapshot.builderPayload,
      extrasCatalogo,
      recoverySnapshot.builderPayload.clienteId,
      recoverySnapshot.lastStep,
    );
    const restoredStep = normalizeBuilderStep(recoverySnapshot.lastStep, 4);
    const restoredContrato = recoverySnapshot.contractId
      ? contratos.find((item) => item.id === recoverySnapshot.contractId) || null
      : null;
    const persistedPayload = restoredContrato?.builder_payload
      ? normalizeBuilderPayload(
          restoredContrato.builder_payload,
          extrasCatalogo,
          restoredContrato.cliente_id,
          restoredStep,
        )
      : null;
    const persistedSignature = persistedPayload
      ? buildBuilderDirtySignature(
          persistedPayload,
          normalizeBuilderStep(persistedPayload.lastStep, restoredStep),
        )
      : null;
    const shouldRestoreLocally =
      Boolean(pendingRecoverySnapshot) || recoverySnapshot.payloadSignature !== persistedSignature;

    if (!shouldRestoreLocally) {
      contractRecoveryAutosaveSignatureRef.current = persistedSignature;
      clearContractRecoverySnapshot();
      return;
    }

    if (persistedPayload) {
      syncBuilderSavedState(
        persistedPayload,
        normalizeBuilderStep(persistedPayload.lastStep, 4),
        restoredContrato.updated_at || restoredContrato.created_at,
      );
    } else {
      setBuilderLastSavedSignature(null);
      setBuilderLastSavedAt(null);
    }

    setBuilderPayload(restoredPayload);
    setEditingBuilderContract(restoredContrato);
    setBuilderStep(restoredStep);
    setTab("montador");
    setMobileSummaryOpen(false);
    setMoneyDrafts({});
    setBuilderRecoveredLocally(true);
    contractRecoveryAutosaveSignatureRef.current = recoverySnapshot.payloadSignature;

    toast({
      title: pendingRecoverySnapshot
        ? "Montador restaurado após novo login"
        : "Rascunho local restaurado",
      description: pendingRecoverySnapshot
        ? recoverySnapshot.originAction === "save-cofre"
          ? "Seu rascunho foi recuperado. Salvando no cofre automaticamente…"
          : "Seu rascunho local foi recuperado no mesmo passo em que você parou."
        : "As alterações salvas localmente voltaram para o montador.",
    });
  }, [builderPayload, contratos, contratosLoaded, extrasCatalogo, extrasLoaded, syncBuilderSavedState, toast]);

  const openPreview = (nextState: PreviewState) => {
    setPreviewState(nextState);
    setPreviewOpen(true);
  };

  const invokeContractMutation = useCallback(
    async <T,>(
      payload: Record<string, unknown>,
      options?: {
        onInvalidSession?: () => Promise<void> | void;
      },
    ) =>
      invokeAdminFunction<T>("manage-contract-builder", {
        body: payload,
        returnTo: "/admin/contratos",
        source: "contract-builder",
        fallbackMessage: "Falha ao comunicar com o backend de contratos.",
        onInvalidSession: options?.onInvalidSession,
      }),
    [],
  );

  const saveBuilderContractDirectly = useCallback(
    async ({
      contractId,
      payloadToPersist,
    }: {
      contractId: string | null;
      payloadToPersist: Record<string, unknown>;
    }) => {
      await refreshAdminSessionSilently({ force: false });

      if (contractId) {
        const { data: latestVersion, error: latestVersionError } = await supabase
          .from("contrato_versions")
          .select("version_number")
          .eq("contrato_id", contractId)
          .order("version_number", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (latestVersionError) {
          throw latestVersionError;
        }

        const existingRecord = contratos.find((item) => item.id === contractId);
        if (!existingRecord) {
          throw new Error("Contrato não encontrado para atualização.");
        }

        const nextVersionNumber = Number(latestVersion?.version_number || 0) + 1;
        const { error: snapshotError } = await supabase.from("contrato_versions").insert({
          contrato_id: existingRecord.id,
          version_number: nextVersionNumber,
          titulo: existingRecord.titulo,
          descricao: existingRecord.descricao,
          valor: existingRecord.valor,
          status: existingRecord.status,
          corpo: (existingRecord as any).corpo || "",
          builder_payload: existingRecord.builder_payload,
        } as any);

        if (snapshotError) {
          throw snapshotError;
        }

        const { data, error } = await supabase
          .from("contratos")
          .update(payloadToPersist as any)
          .eq("id", contractId)
          .eq("modelo", BUILDER_TEMPLATE_ID)
          .select("*, clientes(nome)")
          .single();

        if (error) {
          throw error;
        }

        return data as Contrato;
      }

      const { data, error } = await supabase
        .from("contratos")
        .insert(payloadToPersist as any)
        .select("*, clientes(nome)")
        .single();

      if (error) {
        throw error;
      }

      return data as Contrato;
    },
    [contratos],
  );

  const handleOpenVersions = useCallback(
    async (contrato: Contrato) => {
      setVersionsOpen(true);
      setVersionsContract(contrato);
      setCompareVersion(null);
      setVersionsLoading(true);

      const { data, error } = await supabase
        .from("contrato_versions")
        .select("*")
        .eq("contrato_id", contrato.id)
        .order("version_number", { ascending: false });

      if (error) {
        toast({
          title: "Erro ao carregar versões",
          description: error.message,
          variant: "destructive",
        });
        setContractVersions([]);
      } else {
        setContractVersions((data as ContratoVersion[]) || []);
      }

      setVersionsLoading(false);
    },
    [toast],
  );

  const handleArchiveContract = useCallback(
    async (contrato: Contrato) => {
      try {
        const response = await invokeContractMutation<{ contrato: Contrato }>({
          action: "archive",
          contractId: contrato.id,
        });
        const updatedContrato = response.contrato;

        if (editingBuilderContract?.id === contrato.id) {
          setEditingBuilderContract(updatedContrato);
        }

        setVersionsContract((current) => (current?.id === contrato.id ? updatedContrato : current));
        toast({ title: "Contrato arquivado no cofre" });
        loadContratos();
      } catch (error) {
        toast({
          title: "Erro ao arquivar contrato",
          description: getContractErrorMessage(error, "Não foi possível arquivar o contrato."),
          variant: "destructive",
        });
      }
    },
    [editingBuilderContract?.id, invokeContractMutation, loadContratos, toast],
  );

  const handleUnarchiveContract = useCallback(
    async (contrato: Contrato) => {
      try {
        const response = await invokeContractMutation<{ contrato: Contrato }>({
          action: "unarchive",
          contractId: contrato.id,
        });
        const updatedContrato = response.contrato;

        if (editingBuilderContract?.id === contrato.id) {
          setEditingBuilderContract(updatedContrato);
        }

        setVersionsContract((current) => (current?.id === contrato.id ? updatedContrato : current));
        toast({ title: "Contrato retornou para a lista principal" });
        loadContratos();
      } catch (error) {
        toast({
          title: "Erro ao desarquivar contrato",
          description: getContractErrorMessage(error, "Não foi possível desarquivar o contrato."),
          variant: "destructive",
        });
      }
    },
    [editingBuilderContract?.id, invokeContractMutation, loadContratos, toast],
  );

  const handleDeleteDraft = useCallback(async () => {
    if (!deleteTarget) return;

    const target = deleteTarget;
    try {
      await invokeContractMutation({
        action: "delete-draft",
        contractId: target.id,
      });

      if (editingBuilderContract?.id === target.id) {
        if (extrasLoaded) {
          const emptyPayload = createEmptyBuilderPayload(extrasCatalogo);
          setBuilderPayload(emptyPayload);
          setEditingBuilderContract(null);
          setBuilderStep(0);
          setMobileSummaryOpen(false);
          setMoneyDrafts({});
          syncBuilderSavedState(emptyPayload, 0, null);
          clearContractRecoverySnapshot();
          setTab("montador");
        }
      }

      setDeleteTarget(null);
      setVersionsOpen((current) => (versionsContract?.id === target.id ? false : current));
      setVersionsContract((current) => (current?.id === target.id ? null : current));
      setCompareVersion((current) => (current && versionsContract?.id === target.id ? null : current));
      toast({ title: "Rascunho excluído do cofre" });
      loadContratos();
    } catch (error) {
      toast({
        title: "Erro ao excluir rascunho",
        description: getContractErrorMessage(error, "Não foi possível excluir o rascunho."),
        variant: "destructive",
      });
    }
  }, [deleteTarget, editingBuilderContract?.id, extrasCatalogo, extrasLoaded, invokeContractMutation, loadContratos, syncBuilderSavedState, toast, versionsContract?.id]);

  const handleSendContractToClient = useCallback(
    async (contrato?: Contrato | null) => {
      const target = contrato ?? editingBuilderContract;

      if (!target) {
        toast({
          title: "Salve o contrato antes de enviar",
          description: "Primeiro salve a proposta no cofre para gerar a versão que será liberada ao cliente.",
          variant: "destructive",
        });
        return false;
      }

      if (!target.cliente_id) {
        toast({
          title: "Cliente obrigatório",
          description: "Selecione um cliente válido antes de liberar o contrato para leitura.",
          variant: "destructive",
        });
        return false;
      }

      try {
        const response = await invokeContractMutation<{ contrato: Contrato }>({
          action: "send-to-client",
          contractId: target.id,
        });

        const updatedContrato = response.contrato;

        setEditingBuilderContract((current) =>
          current?.id === updatedContrato.id ? updatedContrato : current,
        );
        setContratos((current) =>
          current.map((item) => (item.id === updatedContrato.id ? updatedContrato : item)),
        );
        loadContratos();

        toast({
          title:
            target.status === "aguardando"
              ? "Leitura do cliente atualizada"
              : "Contrato liberado para leitura",
          description: "O cliente já pode abrir esse contrato no portal em modo somente leitura.",
        });

        return true;
      } catch (error) {
        toast({
          title: "Erro ao enviar contrato para leitura",
          description: getContractErrorMessage(error, "Não foi possível liberar o contrato no portal do cliente."),
          variant: "destructive",
        });
        return false;
      }
    },
    [editingBuilderContract, invokeContractMutation, loadContratos, toast],
  );

  const handleRestoreVersion = useCallback(
    (version: ContratoVersion) => {
      if (!versionsContract) return;

      const currentPayload = normalizeBuilderPayload(
        versionsContract.builder_payload,
        extrasCatalogo,
        versionsContract.cliente_id,
        4,
      );
      const currentStep = normalizeBuilderStep(currentPayload.lastStep, 4);
      const restoredPayload = normalizeBuilderPayload(
        version.builder_payload,
        extrasCatalogo,
        versionsContract.cliente_id,
        currentStep,
      );
      const restoredStep = normalizeBuilderStep(restoredPayload.lastStep, currentStep);

      syncBuilderSavedState(currentPayload, currentStep, versionsContract.updated_at || versionsContract.created_at);
      setBuilderPayload({
        ...restoredPayload,
        updatedAt: new Date().toISOString(),
      });
      setEditingBuilderContract(versionsContract);
      setBuilderStep(restoredStep);
      setMobileSummaryOpen(false);
      setMoneyDrafts({});
      setVersionsOpen(false);
      setCompareVersion(null);
      setTab("montador");
      toast({
        title: `Versão ${version.version_number} carregada para revisão`,
        description: "Revise a proposta restaurada e salve para transformá-la na versão atual.",
      });
    },
    [extrasCatalogo, syncBuilderSavedState, toast, versionsContract],
  );

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

  const applyMoneyDraftsToPayload = useCallback(
    (payload: ContractBuilderPayload) => {
      const draftEntries = Object.entries(moneyDrafts);
      if (draftEntries.length === 0) return payload;

      let nextPayload: ContractBuilderPayload = {
        ...payload,
        items: payload.items.map((item) => ({ ...item })),
        pricing: { ...payload.pricing },
      };

      for (const [key, draftValue] of draftEntries) {
        const matched = key.match(moneyDraftFieldPattern);
        if (!matched) continue;

        const [, target, targetId, fieldName] = matched;
        const numericValue = Math.max(parseMoneyInput(draftValue), 0);

        if (target === "item" && (fieldName === "setupPrice" || fieldName === "monthlyPrice")) {
          nextPayload = {
            ...nextPayload,
            items: updateBuilderItemPrice(
              nextPayload.items,
              targetId,
              fieldName,
              numericValue,
            ),
          };
          nextPayload = {
            ...nextPayload,
            pricing: recalculateBuilderPricing(nextPayload.items, nextPayload.pricing),
          };
        }

        if (
          target === "pricing" &&
          (fieldName === "negotiatedSetup" || fieldName === "entryValue" || fieldName === "negotiatedMonthly")
        ) {
          const nextPricing = { ...nextPayload.pricing };

          if (fieldName === "negotiatedSetup") {
            nextPricing.negotiatedSetup = numericValue;
            nextPricing.entryValue = Math.min(nextPricing.entryValue, numericValue);
            nextPricing.balanceValue = Math.max(numericValue - nextPricing.entryValue, 0);
          }

          if (fieldName === "entryValue") {
            nextPricing.entryValue = Math.min(numericValue, nextPricing.negotiatedSetup);
            nextPricing.balanceValue = Math.max(nextPricing.negotiatedSetup - nextPricing.entryValue, 0);
          }

          if (fieldName === "negotiatedMonthly") {
            nextPricing.negotiatedMonthly = numericValue;
          }

          nextPayload = {
            ...nextPayload,
            pricing: nextPricing,
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
    syncBuilderSavedState(emptyPayload, 0, null);
    clearContractRecoverySnapshot();
    setTab("montador");
  }, [extrasCatalogo, extrasLoaded, syncBuilderSavedState]);

  const workingBuilderPayload = useMemo(
    () => (builderPayload ? applyMoneyDraftsToPayload(builderPayload) : null),
    [applyMoneyDraftsToPayload, builderPayload],
  );

  useEffect(() => {
    if (!workingBuilderPayload) return;
    if (!hasMeaningfulBuilderState(workingBuilderPayload) && !editingBuilderContract?.id) return;

    const payloadSignature = buildBuilderDirtySignature(workingBuilderPayload, builderStep);
    if (contractRecoveryAutosaveSignatureRef.current === payloadSignature) return;

    const timer = window.setTimeout(() => {
      saveBuilderRecoveryLocally(workingBuilderPayload, builderStep, "autosave");
      contractRecoveryAutosaveSignatureRef.current = payloadSignature;
    }, 700);

    return () => window.clearTimeout(timer);
  }, [
    builderStep,
    editingBuilderContract?.id,
    saveBuilderRecoveryLocally,
    workingBuilderPayload,
  ]);

  const openBuilderContract = (contrato: Contrato) => {
    if (!extrasLoaded) {
      toast({
        title: "Montador ainda carregando",
        description: "Os extras do catálogo ainda estão sendo sincronizados.",
        variant: "destructive",
      });
      return;
    }

    const payload = normalizeBuilderPayload(contrato.builder_payload, extrasCatalogo, contrato.cliente_id, 4);
    const restoredStep = normalizeBuilderStep(payload.lastStep, 4);
    setBuilderPayload(payload);
    setEditingBuilderContract(contrato);
    setBuilderStep(restoredStep);
    setMobileSummaryOpen(false);
    setMoneyDrafts({});
    syncBuilderSavedState(payload, restoredStep, contrato.updated_at || contrato.created_at);
    setTab("montador");
  };

  const handleViewContrato = (contrato: Contrato) => {
    const proposal = isBuilderContract(contrato)
      ? normalizeBuilderPayload(contrato.builder_payload, extrasCatalogo, contrato.cliente_id)
      : null;

    openPreview({
      title: contrato.titulo,
      body: (contrato as any).corpo || contrato.descricao || "Conteúdo não disponível",
      assinaturaAdmin: (contrato as any).assinatura_admin,
      assinaturaCliente: (contrato as any).assinatura_cliente,
      proposal,
    });
  };

  const handleBuilderClientChange = (clienteId: string) => {
    const cliente = clientes.find((item) => item.id === clienteId);
    const currentPayload = getWorkingBuilderPayload();
    if (!cliente || !currentPayload) return;

    setBuilderPayload({
      ...currentPayload,
      clienteId,
      contractante: buildContractanteFromClient(cliente),
      updatedAt: new Date().toISOString(),
    });
  };

  const updateBuilderContractante = (
    field: keyof ContractBuilderPayload["contractante"],
    value: string,
  ) => {
    const currentPayload = getWorkingBuilderPayload();
    if (!currentPayload) return;
    setBuilderPayload({
      ...currentPayload,
      contractante: {
        ...currentPayload.contractante,
        [field]: value,
      },
      updatedAt: new Date().toISOString(),
    });
  };

  const updateBuilderContratada = (
    field: keyof ContractBuilderPayload["contratada"],
    value: string,
  ) => {
    const currentPayload = getWorkingBuilderPayload();
    if (!currentPayload) return;
    setBuilderPayload({
      ...currentPayload,
      contratada: {
        ...currentPayload.contratada,
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
    const currentPayload = getWorkingBuilderPayload();
    if (!currentPayload) return;
    setBuilderPayload({
      ...currentPayload,
      [field]: value,
      updatedAt: new Date().toISOString(),
    });
  };

  const handlePrimaryPlanChange = (planId: BuilderPrimaryPlanId) => {
    const currentPayload = getWorkingBuilderPayload();
    if (!currentPayload) return;

    const nextItems = selectPrimaryPlan(currentPayload.items, planId);
    const nextPricing = recalculateBuilderPricing(nextItems, currentPayload.pricing);

    setBuilderPayload({
      ...currentPayload,
      primaryPlanId: planId,
      items: nextItems,
      pricing: nextPricing,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleBuilderItemToggle = (itemId: string, selected: boolean) => {
    const currentPayload = getWorkingBuilderPayload();
    if (!currentPayload) return;

    const nextItems = toggleBuilderItem(currentPayload.items, itemId, selected);
    const nextPricing = recalculateBuilderPricing(nextItems, currentPayload.pricing);

    setBuilderPayload({
      ...currentPayload,
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
    setMoneyDraftValue(buildItemMoneyDraftKey(itemId, field), rawValue);
  };

  const handleBuilderPricingChange = (
    field: "negotiatedSetup" | "entryValue" | "negotiatedMonthly",
    rawValue: string,
  ) => {
    setMoneyDraftValue(buildPricingMoneyDraftKey(field), rawValue);
  };

  const getMoneyInputDisplayValue = useCallback(
    (key: string, value: number) => moneyDrafts[key] ?? formatMoneyInputValue(value),
    [moneyDrafts],
  );

  const commitMoneyDraft = useCallback(
    (key: string) => {
      if (!(key in moneyDrafts)) return;

      const currentPayload = getWorkingBuilderPayload();
      if (!currentPayload) return;

      setBuilderPayload(currentPayload);
      clearMoneyDraftValue(key);
    },
    [clearMoneyDraftValue, getWorkingBuilderPayload, moneyDrafts],
  );

  const getBuilderStepError = useCallback(
    (step: Exclude<ContractBuilderStepIndex, 4>) => {
      const currentPayload = getWorkingBuilderPayload();

      if (!currentPayload) {
        return "Aguarde o carregamento do montador.";
      }

      switch (step) {
        case 0:
          if (!currentPayload.clienteId) return "Selecione um cliente para iniciar a proposta.";
          return null;
        case 1:
          if (!currentPayload.contractante.nome.trim()) return "Preencha o nome do contratante.";
          if (!currentPayload.contratada.nome.trim()) return "Preencha o nome da contratada.";
          if (!currentPayload.contratada.representante.trim()) return "Preencha o representante da contratada.";
          if (!currentPayload.contratada.documento.trim()) return "Preencha o documento da contratada.";
          if (!currentPayload.contratada.endereco.trim()) return "Preencha o endereço da contratada.";
          return null;
        case 2: {
          const selectedItems = currentPayload.items.filter((item) => item.selected);
          if (!selectedItems.length) {
            return "Selecione pelo menos um plano ou extra para montar o contrato.";
          }
          if (currentPayload.primaryPlanId === "sob-medida" && !currentPayload.customScope.trim()) {
            return "Descreva o escopo customizado para propostas Sob Medida.";
          }
          return null;
        }
        case 3:
          if (!currentPayload.prazoDias.trim()) return "Informe o prazo estimado da proposta.";
          if (!currentPayload.formaPagamento.trim()) return "Informe a forma de pagamento.";
          if (currentPayload.pricing.entryValue > currentPayload.pricing.negotiatedSetup) {
            return "A entrada não pode ser maior que o valor negociado.";
          }
          return null;
        default:
          return null;
      }
    },
    [getWorkingBuilderPayload],
  );

  const validateBuilderStep = useCallback(
    (step: Exclude<ContractBuilderStepIndex, 4>, notify = true) => {
      const error = getBuilderStepError(step);
      if (error && notify) {
        toast({ title: error, variant: "destructive" });
      }
      return !error;
    },
    [getBuilderStepError, toast],
  );

  const validateBuilderAll = useCallback(() => {
    const stepsToValidate: Array<Exclude<ContractBuilderStepIndex, 4>> = [0, 1, 2, 3];
    return stepsToValidate.every((step) => validateBuilderStep(step));
  }, [validateBuilderStep]);

  const handleBuilderStepChange = (nextStep: ContractBuilderStepIndex) => {
    if (nextStep <= builderStep) {
      syncMoneyDraftsToState();
      setBuilderStep(nextStep);
      return;
    }

    for (let currentStep = builderStep; currentStep < nextStep; currentStep += 1) {
      if (!validateBuilderStep(currentStep as Exclude<ContractBuilderStepIndex, 4>)) {
        return;
      }
    }

    syncMoneyDraftsToState();
    setBuilderStep(nextStep);
  };

  const persistBuilderDraft = async ({
    exitAfterSave = false,
    requireCompleteValidation = false,
    silent = false,
  }: {
    exitAfterSave?: boolean;
    requireCompleteValidation?: boolean;
    silent?: boolean;
  } = {}) => {
    const currentPayload = syncMoneyDraftsToState();
    if (!currentPayload) return false;
    if (requireCompleteValidation && !validateBuilderAll()) return false;

    let prepared: ReturnType<typeof buildBuilderSavePayload> = null;

    try {
      prepared = buildBuilderSavePayload(currentPayload, builderStep);
    } catch (error) {
      if (!silent) {
        toast({
          title: "Erro ao validar a proposta",
          description: getContractErrorMessage(error, "Revise os dados da proposta antes de salvar."),
          variant: "destructive",
        });
      }
      return false;
    }

    if (!prepared) {
      if (!silent) {
        toast({ title: "Modelo mestre não encontrado", variant: "destructive" });
      }
      return false;
    }

    const recoveryOrigin: ContractRecoveryOriginAction = requireCompleteValidation
      ? "save-cofre"
      : exitAfterSave
        ? "save-and-exit"
        : "save-draft";

    saveBuilderRecoveryLocally(
      prepared.normalizedPayload,
      prepared.normalizedPayload.lastStep,
      recoveryOrigin,
    );

    const nowIso = new Date().toISOString();
    const payloadToPersist = {
      cliente_id: prepared.normalizedPayload.clienteId || null,
      titulo: prepared.title,
      descricao: prepared.description,
      valor: prepared.value,
      status: editingBuilderContract?.status === "aguardando" ? "aguardando" : "rascunho",
      corpo: prepared.body,
      modelo: BUILDER_TEMPLATE_ID,
      builder_payload: prepared.normalizedPayload as any,
      assinatura_admin: null,
      updated_at: nowIso,
    };

    try {
      const savedContrato = await saveBuilderContractDirectly({
        contractId: editingBuilderContract?.id ?? null,
        payloadToPersist,
      });
      const savedPayload = normalizeBuilderPayload(
        savedContrato.builder_payload,
        extrasCatalogo,
        savedContrato.cliente_id,
        prepared.normalizedPayload.lastStep,
      );

      setBuilderPayload(savedPayload);
      setEditingBuilderContract(savedContrato);
      setMoneyDrafts({});
      syncBuilderSavedState(
        savedPayload,
        savedPayload.lastStep,
        savedContrato.updated_at || nowIso,
      );
      clearContractRecoverySnapshot();
      if (!silent) {
        toast({
          title: exitAfterSave
            ? editingBuilderContract
              ? "Rascunho atualizado. Você pode continuar depois."
              : "Rascunho salvo. Você pode continuar depois."
            : editingBuilderContract
              ? "Contrato mestre atualizado!"
            : "Contrato mestre salvo no cofre!",
        });
      }

      if (requireCompleteValidation) {
        setCofreFilter("ativos");
        setSearchTerm("");
        setMobileSummaryOpen(false);
        setTab("lista");
      }
    } catch (error) {
      if (!silent) {
        toast({
          title: editingBuilderContract ? "Erro ao atualizar contrato" : "Erro ao salvar contrato",
          description: getContractErrorMessage(error, "Não foi possível salvar a proposta."),
          variant: "destructive",
        });
      }
      return false;
    }

    loadContratos();

    if (exitAfterSave) {
      setMobileSummaryOpen(false);
      setTab("lista");
    }

    return true;
  };

  const handleSaveBuilder = async () => {
    await persistBuilderDraft({ requireCompleteValidation: true });
  };

  const handleSaveBuilderAndExit = async () => {
    await persistBuilderDraft({ exitAfterSave: true });
  };

  const handleBuilderPdfDownload = () => {
    const currentPayload = syncMoneyDraftsToState();
    if (!validateBuilderAll() || !currentPayload) return;

    const prepared = buildBuilderSavePayload(currentPayload, builderStep);
    if (!prepared) return;
    generateContractPDF(prepared.title, prepared.body, {
      proposal: prepared.normalizedPayload,
    });
  };

  const handleBuilderWordDownload = () => {
    const currentPayload = syncMoneyDraftsToState();
    if (!validateBuilderAll() || !currentPayload) return;

    const prepared = buildBuilderSavePayload(currentPayload, builderStep);
    if (!prepared) return;
    downloadWordDocument(prepared.title, prepared.body, prepared.normalizedPayload);
  };

  const handleRefreshBuilderExtras = async () => {
    const currentPayload = syncMoneyDraftsToState();
    if (!currentPayload) return;

    const currentExtraIds = new Set(
      currentPayload.items.filter((item) => item.source === "extra").map((item) => item.id),
    );

    const freshExtras = await loadExtrasCatalogo();
    const normalizedPayload = normalizeBuilderPayload(
      currentPayload,
      freshExtras,
      currentPayload.clienteId,
      builderStep,
    );
    const newExtraCount = normalizedPayload.items.filter(
      (item) => item.source === "extra" && !currentExtraIds.has(item.id),
    ).length;

    setBuilderPayload({
      ...normalizedPayload,
      updatedAt: new Date().toISOString(),
    });
    setMoneyDrafts({});

    toast({
      title: "Extras atualizados",
      description:
        newExtraCount > 0
          ? `${newExtraCount} novo(s) extra(s) ativo(s) entraram no montador.`
          : "Nenhum extra novo foi encontrado. Sua seleção atual foi preservada.",
    });
  };

  const builderDirtySignature = useMemo(
    () => (workingBuilderPayload ? buildBuilderDirtySignature(workingBuilderPayload, builderStep) : null),
    [builderStep, workingBuilderPayload],
  );

  const builderHasUnsavedChanges = useMemo(() => {
    if (builderRecoveredLocally) return true;
    if (!builderDirtySignature || !builderLastSavedSignature) return false;
    return builderDirtySignature !== builderLastSavedSignature;
  }, [builderDirtySignature, builderLastSavedSignature, builderRecoveredLocally]);

  const builderStatusLabel = useMemo(() => {
    if (builderHasUnsavedChanges) {
      return {
        tone: "warning" as const,
        title: "Alterações não salvas",
        subtitle: "Salve o rascunho para atualizar o cofre e a etapa atual.",
      };
    }

    if (builderLastSavedAt) {
      const formattedClock = formatContractClock(builderLastSavedAt);
      return {
        tone: "saved" as const,
        title: "Rascunho salvo",
        subtitle: formattedClock ? `Salvo às ${formattedClock}` : "Salvo no cofre",
      };
    }

    return {
      tone: "new" as const,
      title: "Novo rascunho",
      subtitle: "Ainda não existe uma proposta salva no cofre.",
    };
  }, [builderHasUnsavedChanges, builderLastSavedAt]);

  const filteredContratos = useMemo(
    () =>
      contratos.filter((contrato) => {
        const isArchived = Boolean(contrato.archived_at);
        if (cofreFilter === "ativos" && isArchived) return false;
        if (cofreFilter === "arquivados" && !isArchived) return false;

        const term = searchTerm.trim().toLowerCase();
        if (!term) return true;

        return (
          contrato.titulo?.toLowerCase().includes(term) ||
          (contrato.clientes as any)?.nome?.toLowerCase().includes(term)
        );
      }),
    [cofreFilter, contratos, searchTerm],
  );

  const activeContractsCount = useMemo(
    () => contratos.filter((contrato) => !contrato.archived_at).length,
    [contratos],
  );

  const archivedContractsCount = useMemo(
    () => contratos.filter((contrato) => Boolean(contrato.archived_at)).length,
    [contratos],
  );

  const groupedExtras = useMemo(
    () =>
      builderPayload?.items
        .filter((item) => !item.isPrimaryPlan)
        .reduce<Record<string, typeof builderPayload.items>>((acc, item) => {
          if (!acc[item.group]) acc[item.group] = [];
          acc[item.group].push(item);
          return acc;
        }, {}),
    [builderPayload],
  );

  const builderPrepared = useMemo(
    () => {
      if (!workingBuilderPayload) return null;

      try {
        return buildBuilderSavePayload(workingBuilderPayload, builderStep);
      } catch {
        return null;
      }
    },
    [builderStep, workingBuilderPayload],
  );

  const builderSummary = useMemo(
    () => (workingBuilderPayload ? buildProposalSummary(workingBuilderPayload) : null),
    [workingBuilderPayload],
  );

  const selectedItemsCount = workingBuilderPayload?.items.filter((item) => item.selected).length || 0;
  const builderProgress = ((builderStep + 1) / BUILDER_STEPS.length) * 100;

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
                <ShieldCheck className="w-3.5 h-3.5" /> Cofre
              </TabsTrigger>
              <TabsTrigger
                value="modelos"
                className="data-[state=active]:gradient-primary data-[state=active]:text-white text-[hsl(var(--muted-foreground))] text-xs gap-1.5 px-4"
              >
                <Boxes className="w-3.5 h-3.5" /> Modelo Mestre
              </TabsTrigger>
              <TabsTrigger
                value="montador"
                className="data-[state=active]:gradient-primary data-[state=active]:text-white text-[hsl(var(--muted-foreground))] text-xs gap-1.5 px-4"
              >
                <FilePenLine className="w-3.5 h-3.5" /> Montador
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="lista">
            <Card className="glass-card border-[0.5px]">
              <CardHeader>
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div>
                    <CardTitle className="text-sm text-white flex items-center gap-2">
                      <Vault className="w-4 h-4 text-primary" /> Cofre do Contrato Mestre
                    </CardTitle>
                    <CardDescription className="text-[10px] text-white/40 uppercase tracking-widest mt-1">
                      Somente contratos gerados pelo montador interativo
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Button
                      size="sm"
                      variant="outline"
                      className={`border-white/10 text-xs ${
                        cofreFilter === "ativos"
                          ? "bg-primary/15 text-primary hover:bg-primary/20"
                          : "bg-white/5 text-white hover:bg-white/10"
                      }`}
                      onClick={() => setCofreFilter("ativos")}
                    >
                      Ativos ({activeContractsCount})
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className={`border-white/10 text-xs ${
                        cofreFilter === "arquivados"
                          ? "bg-primary/15 text-primary hover:bg-primary/20"
                          : "bg-white/5 text-white hover:bg-white/10"
                      }`}
                      onClick={() => setCofreFilter("arquivados")}
                    >
                      Arquivados ({archivedContractsCount})
                    </Button>
                    <div className="relative w-64">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[hsl(var(--muted-foreground))]" />
                      <Input
                        placeholder="Buscar contrato mestre..."
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                        className="pl-9 glass-input border-[rgba(255,255,255,0.1)] text-[hsl(var(--foreground))] text-xs h-8"
                      />
                    </div>
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
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleViewContrato(contrato)}>
                      <FileText className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
                      <div>
                        <p className="text-sm font-medium text-[hsl(var(--foreground))]">{contrato.titulo}</p>
                        <div className="flex items-center gap-2 flex-wrap text-[11px] text-[hsl(var(--muted-foreground))]">
                          <span>{(contrato.clientes as any)?.nome || "Cliente"}</span>
                          <span>•</span>
                          <span>Valor: R$ {formatContratoValue(contrato.valor)}</span>
                          <span>•</span>
                          <span>{formatContractDateTime(contrato.updated_at || contrato.created_at)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap justify-end">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-primary hover:text-primary text-xs h-7 px-2"
                        title="Abrir montador"
                        onClick={() => openBuilderContract(contrato)}
                      >
                        <FilePenLine className="w-3 h-3" />
                      </Button>
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
                            {
                              assinaturaAdmin: (contrato as any).assinatura_admin,
                              assinaturaCliente: (contrato as any).assinatura_cliente,
                              proposal: normalizeBuilderPayload(contrato.builder_payload, extrasCatalogo, contrato.cliente_id),
                            },
                          )
                        }
                      >
                        <Download className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-white/40 hover:text-white text-xs h-7 px-2"
                        title="Baixar Word"
                        onClick={() =>
                          downloadWordDocument(
                            contrato.titulo,
                            (contrato as any).corpo || contrato.descricao || "",
                            normalizeBuilderPayload(contrato.builder_payload, extrasCatalogo, contrato.cliente_id),
                          )
                        }
                      >
                        <FileText className="w-3 h-3" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-white/40 hover:text-white text-xs h-7 px-2"
                            title="Mais ações"
                          >
                            <MoreHorizontal className="w-3 h-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                          <DropdownMenuItem onClick={() => handleOpenVersions(contrato)}>
                            <History className="w-4 h-4 mr-2" /> Histórico de versões
                          </DropdownMenuItem>
                          {!contrato.archived_at && (
                            <DropdownMenuItem onClick={() => void handleSendContractToClient(contrato)}>
                              <Send className="w-4 h-4 mr-2" />
                              {contrato.status === "aguardando" ? "Atualizar leitura do cliente" : "Enviar leitura ao cliente"}
                            </DropdownMenuItem>
                          )}
                          {contrato.archived_at ? (
                            <DropdownMenuItem onClick={() => handleUnarchiveContract(contrato)}>
                              <RotateCcw className="w-4 h-4 mr-2" /> Desarquivar
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => handleArchiveContract(contrato)}>
                              <Archive className="w-4 h-4 mr-2" /> Arquivar
                            </DropdownMenuItem>
                          )}
                          {contrato.status === "rascunho" && (
                            <DropdownMenuItem
                              className="text-red-300 focus:text-red-200"
                              onClick={() => setDeleteTarget(contrato)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" /> Excluir rascunho
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <Badge
                        variant="outline"
                        className="text-[9px] border-white/5 px-2 bg-white/5 text-white/60"
                        style={{ color: statusColors[contrato.status] || "#94a3b8" }}
                      >
                        {statusLabels[contrato.status] || contrato.status}
                      </Badge>
                      {contrato.archived_at && (
                        <Badge
                          variant="outline"
                          className="text-[9px] border-amber-300/10 px-2 bg-amber-300/10 text-amber-200"
                        >
                          Arquivado
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
                {filteredContratos.length === 0 && (
                  <div className="py-10 text-center space-y-4">
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">
                      {cofreFilter === "ativos"
                        ? "Nenhum contrato mestre ativo encontrado."
                        : "Nenhum contrato arquivado encontrado."}
                    </p>
                    {cofreFilter === "ativos" ? (
                      <Button size="sm" className="gradient-primary border-0 text-white" onClick={resetBuilder}>
                        Criar primeira proposta
                      </Button>
                    ) : null}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="modelos">
            <Card className="glass-card border-[0.5px]">
              <CardContent className="p-6 grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-6 items-start">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-[linear-gradient(135deg,hsl(var(--primary)),rgba(232,51,74,0.8))]">
                      <Boxes className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-white">{masterTemplate.nome}</p>
                      <Badge variant="outline" className="border-primary/20 bg-primary/10 text-primary mt-1">
                        {getContractTypeLabel(masterTemplate.tipo)}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm text-white/65 leading-relaxed max-w-2xl">
                    Este é o único modelo oficial do painel. Ele concentra cliente, partes, plano principal, extras,
                    escopo Sob Medida, totais e exportação premium em PDF e Word.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="bg-white/[0.03] border-white/10">
                      <CardContent className="p-4 space-y-2">
                        <p className="text-[10px] uppercase tracking-[0.18em] text-white/35">Fluxo</p>
                        <p className="text-sm text-white">Wizard guiado com preview ao vivo</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-white/[0.03] border-white/10">
                      <CardContent className="p-4 space-y-2">
                        <p className="text-[10px] uppercase tracking-[0.18em] text-white/35">Proteção</p>
                        <p className="text-sm text-white">Só mostra itens contratados no documento final</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-white/[0.03] border-white/10">
                      <CardContent className="p-4 space-y-2">
                        <p className="text-[10px] uppercase tracking-[0.18em] text-white/35">Saída</p>
                        <p className="text-sm text-white">Exportação premium em PDF e Word</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                <Card className="bg-white/[0.03] border-primary/20">
                  <CardContent className="p-5 space-y-4">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-white/35">Variáveis do modelo</p>
                    <p className="text-3xl font-semibold text-white">{masterTemplate.variaveis.length}</p>
                    <p className="text-sm text-white/60">
                      Cliente, contratada, escopo, revisão, forma de pagamento, totais e cláusulas comerciais.
                    </p>
                    <Button className="gradient-primary border-0 text-white w-full" onClick={resetBuilder}>
                      Abrir montador do contrato mestre
                    </Button>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="montador" className="space-y-6">
            <Card className="glass-card border-[0.5px] overflow-hidden">
              <CardContent className="p-0">
                <div className="bg-[linear-gradient(135deg,rgba(123,31,162,0.22),rgba(232,51,74,0.16),rgba(194,24,91,0.2))] p-6 space-y-5">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className="border-white/15 bg-white/10 text-white/80">
                          Contrato Mestre NovaesWeb
                        </Badge>
                        {editingBuilderContract && (
                          <Badge variant="outline" className="border-primary/20 bg-primary/10 text-primary">
                            Editando proposta salva
                          </Badge>
                        )}
                        <Badge
                          variant="outline"
                          className={
                            builderStatusLabel.tone === "warning"
                              ? "border-amber-300/20 bg-amber-300/10 text-amber-200"
                              : builderStatusLabel.tone === "saved"
                                ? "border-emerald-300/20 bg-emerald-300/10 text-emerald-200"
                                : "border-white/15 bg-white/10 text-white/70"
                          }
                        >
                          {builderStatusLabel.title}
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-2xl font-semibold text-white">Montador comercial interativo</h3>
                        <p className="text-sm text-white/65 max-w-3xl">
                          Monte a proposta por etapas, revise o resumo ao vivo e finalize com preview premium antes de salvar
                          ou exportar.
                        </p>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      className="border-white/10 bg-white/5 text-white hover:bg-white/10"
                      onClick={resetBuilder}
                    >
                      <Plus className="w-4 h-4 mr-2" /> Novo montador
                    </Button>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.22em] text-white/40">Etapa atual</p>
                        <p className="text-sm text-white font-medium">
                          {BUILDER_STEPS[builderStep].label} • {BUILDER_STEPS[builderStep].description}
                        </p>
                        <p className="text-xs text-white/45 mt-1">{builderStatusLabel.subtitle}</p>
                      </div>
                      <p className="text-sm text-white/55">{Math.round(builderProgress)}% concluído</p>
                    </div>
                    <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[linear-gradient(90deg,hsl(var(--primary)),rgba(232,51,74,0.95),rgba(194,24,91,0.9))] transition-all duration-300"
                        style={{ width: `${builderProgress}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                    {BUILDER_STEPS.map((step) => {
                      const isActive = step.id === builderStep;
                      const isCompleted = step.id < builderStep;

                      return (
                        <motion.button
                          key={step.id}
                          type="button"
                          onClick={() => handleBuilderStepChange(step.id)}
                          whileTap={shouldReduceMotion ? undefined : { scale: 0.985 }}
                          className={`rounded-2xl border p-4 text-left transition-all ${
                            isActive
                              ? "border-cyan-400/25 bg-[linear-gradient(135deg,rgba(123,31,162,0.24),rgba(34,211,238,0.12))] shadow-[0_16px_32px_rgba(34,211,238,0.08)]"
                              : isCompleted
                                ? "border-emerald-400/25 bg-emerald-400/10"
                                : "border-white/10 bg-white/[0.04] hover:bg-white/[0.07] hover:border-white/20"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="text-[10px] uppercase tracking-[0.2em] text-white/35">Etapa {step.id + 1}</p>
                              <p className="text-sm font-medium text-white mt-1">{step.label}</p>
                            </div>
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center border ${
                                isCompleted
                                  ? "border-emerald-400/35 bg-emerald-400/15 text-emerald-300"
                                  : isActive
                                    ? "border-primary/30 bg-primary/15 text-primary"
                                    : "border-white/10 bg-white/[0.04] text-white/45"
                              }`}
                            >
                              {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <span className="text-xs">{step.id + 1}</span>}
                            </div>
                          </div>
                          <p className="text-xs text-white/45 mt-3 leading-relaxed">{step.description}</p>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="xl:hidden fixed inset-x-4 bottom-4 z-30">
              <motion.div
                layout
                className="overflow-hidden rounded-[28px] border border-cyan-400/15 bg-[linear-gradient(180deg,rgba(17,15,24,0.96),rgba(17,15,24,0.9))] shadow-[0_24px_60px_rgba(2,6,23,0.45)] backdrop-blur-xl"
              >
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
                  onClick={() => setMobileSummaryOpen((current) => !current)}
                >
                  <div>
                    <p className="text-sm font-medium text-white">Resumo financeiro</p>
                    <p className="text-xs text-white/45">Cliente, escopo e totais atualizados em tempo real.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="border-white/10 bg-white/5 text-white/70">
                      {selectedItemsCount} item(ns)
                    </Badge>
                    <span className="text-xs text-cyan-200">{mobileSummaryOpen ? "Recolher" : "Expandir"}</span>
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {mobileSummaryOpen ? (
                    <motion.div
                      key="mobile-summary"
                      initial={shouldReduceMotion ? false : { opacity: 0, height: 0 }}
                      animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, height: "auto" }}
                      exit={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, height: 0 }}
                      transition={{ duration: shouldReduceMotion ? 0 : 0.2, ease: "easeOut" }}
                      className="px-4 pb-4"
                    >
                      <BuilderLiveSummary summary={builderSummary} selectedCount={selectedItemsCount} />
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </motion.div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px] gap-6 items-start pb-36 xl:pb-0">
              <div className="space-y-6">
                {!builderPayload ? (
                  <Card className="glass-card border-[0.5px]">
                    <CardContent className="p-8 text-center text-sm text-white/55">
                      Carregando estrutura do montador...
                    </CardContent>
                  </Card>
                ) : (
                  <>
                    <Card className="glass-card border-[0.5px]">
                      <CardHeader>
                        <CardTitle className="text-sm text-white">{BUILDER_STEPS[builderStep].label}</CardTitle>
                        <CardDescription className="text-xs text-white/45">
                          {BUILDER_STEPS[builderStep].description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <AnimatePresence mode="wait" initial={false}>
                          <motion.div
                            key={builderStep}
                            initial={shouldReduceMotion ? false : { opacity: 0, y: 18, scale: 0.985 }}
                            animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
                            exit={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: -12, scale: 0.99 }}
                            transition={{ duration: shouldReduceMotion ? 0 : 0.24, ease: "easeOut" }}
                            className="space-y-6"
                          >
                        {builderStep === 0 && (
                          <div className="space-y-6">
                            <div className="space-y-2">
                              <Label className="text-xs uppercase tracking-[0.18em] text-white/45">Cliente</Label>
                              <Select value={builderPayload.clienteId} onValueChange={handleBuilderClientChange}>
                                <SelectTrigger className="glass-input border-white/10 text-white">
                                  <SelectValue placeholder="Selecione um cliente ativo" />
                                </SelectTrigger>
                                <SelectContent>
                                  {clientes.map((cliente) => (
                                    <SelectItem key={cliente.id} value={cliente.id}>
                                      {cliente.nome} {cliente.nome_empresa ? `• ${cliente.nome_empresa}` : ""}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                              <Card className="bg-white/[0.03] border-white/10">
                                <CardContent className="p-5 space-y-3">
                                  <p className="text-[10px] uppercase tracking-[0.2em] text-white/35">Contratante</p>
                                  <p className="text-lg font-semibold text-white">
                                    {builderPayload.contractante.nome || "Nenhum cliente selecionado"}
                                  </p>
                                  <div className="space-y-1.5 text-sm text-white/60">
                                    {builderPayload.contractante.nomeEmpresa && (
                                      <p>Empresa: {builderPayload.contractante.nomeEmpresa}</p>
                                    )}
                                    {builderPayload.contractante.documento && (
                                      <p>Documento: {builderPayload.contractante.documento}</p>
                                    )}
                                    {builderPayload.contractante.email && (
                                      <p>E-mail: {builderPayload.contractante.email}</p>
                                    )}
                                    {builderPayload.contractante.whatsapp && (
                                      <p>WhatsApp: {builderPayload.contractante.whatsapp}</p>
                                    )}
                                    {builderPayload.contractante.endereco && (
                                      <p>Endereço: {builderPayload.contractante.endereco}</p>
                                    )}
                                  </div>
                                </CardContent>
                              </Card>

                              <Card className="bg-white/[0.03] border-primary/20">
                                <CardContent className="p-5 space-y-3">
                                  <p className="text-[10px] uppercase tracking-[0.2em] text-white/35">O que acontece nesta etapa</p>
                                  <div className="space-y-2 text-sm text-white/65 leading-relaxed">
                                    <p>1. Você escolhe um cliente ativo já cadastrado no admin.</p>
                                    <p>2. O montador puxa nome, documento, contato e endereço automaticamente.</p>
                                    <p>3. Na próxima etapa você ainda pode revisar e editar tudo manualmente.</p>
                                  </div>
                                </CardContent>
                              </Card>
                            </div>
                          </div>
                        )}

                        {builderStep === 1 && (
                          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                            <Card className="bg-white/[0.03] border-white/10">
                              <CardHeader>
                                <CardTitle className="text-sm text-white">Dados do contratante</CardTitle>
                                <CardDescription className="text-xs text-white/45">
                                  Dados puxados do cadastro do cliente, com edição manual liberada.
                                </CardDescription>
                              </CardHeader>
                              <CardContent className="space-y-4">
                                <div className="space-y-2">
                                  <Label className="text-xs text-white/55">Nome do contratante</Label>
                                  <Input
                                    value={builderPayload.contractante.nome}
                                    onChange={(event) => updateBuilderContractante("nome", event.target.value)}
                                    className="glass-input border-white/10 text-white"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-xs text-white/55">Nome da empresa</Label>
                                  <Input
                                    value={builderPayload.contractante.nomeEmpresa || ""}
                                    onChange={(event) => updateBuilderContractante("nomeEmpresa", event.target.value)}
                                    className="glass-input border-white/10 text-white"
                                  />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label className="text-xs text-white/55">Documento (CPF/CNPJ)</Label>
                                    <Input
                                      value={builderPayload.contractante.documento}
                                      onChange={(event) => updateBuilderContractante("documento", event.target.value)}
                                      className="glass-input border-white/10 text-white"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label className="text-xs text-white/55">E-mail</Label>
                                    <Input
                                      value={builderPayload.contractante.email || ""}
                                      onChange={(event) => updateBuilderContractante("email", event.target.value)}
                                      className="glass-input border-white/10 text-white"
                                    />
                                  </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label className="text-xs text-white/55">WhatsApp</Label>
                                    <Input
                                      value={builderPayload.contractante.whatsapp || ""}
                                      onChange={(event) => updateBuilderContractante("whatsapp", event.target.value)}
                                      className="glass-input border-white/10 text-white"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label className="text-xs text-white/55">Telefone</Label>
                                    <Input
                                      value={builderPayload.contractante.telefone || ""}
                                      onChange={(event) => updateBuilderContractante("telefone", event.target.value)}
                                      className="glass-input border-white/10 text-white"
                                    />
                                  </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label className="text-xs text-white/55">Instagram</Label>
                                    <Input
                                      value={builderPayload.contractante.instagram || ""}
                                      onChange={(event) => updateBuilderContractante("instagram", event.target.value)}
                                      className="glass-input border-white/10 text-white"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label className="text-xs text-white/55">Site</Label>
                                    <Input
                                      value={builderPayload.contractante.siteUrl || ""}
                                      onChange={(event) => updateBuilderContractante("siteUrl", event.target.value)}
                                      className="glass-input border-white/10 text-white"
                                    />
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-xs text-white/55">Endereço completo</Label>
                                  <Textarea
                                    rows={4}
                                    value={builderPayload.contractante.endereco}
                                    onChange={(event) => updateBuilderContractante("endereco", event.target.value)}
                                    className="glass-input border-white/10 text-white resize-none"
                                  />
                                </div>
                              </CardContent>
                            </Card>

                            <Card className="bg-white/[0.03] border-primary/20">
                              <CardHeader>
                                <CardTitle className="text-sm text-white">Dados da contratada</CardTitle>
                                <CardDescription className="text-xs text-white/45">
                                  Preenchidos com os dados atuais da NovaesWeb e editáveis quando necessário.
                                </CardDescription>
                              </CardHeader>
                              <CardContent className="space-y-4">
                                <div className="space-y-2">
                                  <Label className="text-xs text-white/55">Nome da contratada</Label>
                                  <Input
                                    value={builderPayload.contratada.nome}
                                    onChange={(event) => updateBuilderContratada("nome", event.target.value)}
                                    className="glass-input border-white/10 text-white"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-xs text-white/55">Representante</Label>
                                  <Input
                                    value={builderPayload.contratada.representante}
                                    onChange={(event) => updateBuilderContratada("representante", event.target.value)}
                                    className="glass-input border-white/10 text-white"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-xs text-white/55">Documento</Label>
                                  <Input
                                    value={builderPayload.contratada.documento}
                                    onChange={(event) => updateBuilderContratada("documento", event.target.value)}
                                    className="glass-input border-white/10 text-white"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-xs text-white/55">Endereço</Label>
                                  <Textarea
                                    rows={4}
                                    value={builderPayload.contratada.endereco}
                                    onChange={(event) => updateBuilderContratada("endereco", event.target.value)}
                                    className="glass-input border-white/10 text-white resize-none"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-xs text-white/55">Observação de recebimento</Label>
                                  <Textarea
                                    rows={4}
                                    value={builderPayload.contratada.observacaoRecebimento}
                                    onChange={(event) => updateBuilderContratada("observacaoRecebimento", event.target.value)}
                                    className="glass-input border-white/10 text-white resize-none"
                                  />
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                        )}

                        {builderStep === 2 && (
                          <div className="space-y-6">
                            <Card className="bg-white/[0.03] border-primary/20">
                              <CardHeader className="pb-4">
                                <CardTitle className="text-sm text-white">Plano principal</CardTitle>
                                <CardDescription className="text-xs text-white/45">
                                  Escolha única. O contrato final mostrará apenas o plano selecionado e os extras marcados.
                                </CardDescription>
                              </CardHeader>
                              <CardContent className="space-y-4">
                                <RadioGroup
                                  value={builderPayload.primaryPlanId}
                                  onValueChange={(value) => handlePrimaryPlanChange(value as BuilderPrimaryPlanId)}
                                  className="space-y-4"
                                >
                                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 flex items-center justify-between gap-4">
                                    <div>
                                      <p className="text-sm font-medium text-white">Sem plano principal</p>
                                      <p className="text-xs text-white/45">Use quando a proposta for baseada apenas em extras ou composição manual.</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                      <Label htmlFor="plan-none" className="text-xs text-white/55">Selecionar</Label>
                                      <RadioGroupItem id="plan-none" value="none" />
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                    {PUBLIC_PLAN_CATALOG.map((plan) => {
                                      const selected = builderPayload.primaryPlanId === plan.id;
                                      return (
                                        <Label
                                          key={plan.id}
                                          htmlFor={`plan-${plan.id}`}
                                          className={`rounded-2xl border p-5 cursor-pointer space-y-4 transition-all ${
                                            selected
                                              ? "border-cyan-400/25 bg-[linear-gradient(135deg,rgba(123,31,162,0.24),rgba(34,211,238,0.12))] shadow-[0_18px_36px_rgba(34,211,238,0.08)]"
                                              : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/20"
                                          }`}
                                        >
                                          <div className="flex items-start justify-between gap-4">
                                            <div>
                                              <p className="text-sm font-semibold text-white">{plan.title}</p>
                                              <p className="text-xs text-white/50 mt-1">{plan.description}</p>
                                            </div>
                                            <RadioGroupItem id={`plan-${plan.id}`} value={plan.id} />
                                          </div>
                                          <div className="space-y-1 text-sm">
                                            <p className="text-primary font-medium">Setup: {formatCurrencyBRL(plan.setupPrice)}</p>
                                            <p className="text-white/60">Mensal: {formatCurrencyBRL(plan.monthlyPrice)}</p>
                                          </div>
                                        </Label>
                                      );
                                    })}
                                  </div>
                                </RadioGroup>

                                {builderPayload.primaryPlanId === "sob-medida" && (
                                  <div className="space-y-2">
                                    <Label className="text-xs uppercase tracking-[0.18em] text-white/45">
                                      Descrição do escopo customizado
                                    </Label>
                                    <Textarea
                                      rows={5}
                                      value={builderPayload.customScope}
                                      onChange={(event) => updateBuilderTextField("customScope", event.target.value)}
                                      className="glass-input border-white/10 text-white resize-none"
                                      placeholder="Ex.: Desenvolvimento de dashboard de vendas com painel de estoque integrado."
                                    />
                                  </div>
                                )}
                              </CardContent>
                            </Card>

                            <Card className="bg-white/[0.03] border-white/10">
                              <CardHeader className="pb-4">
                                <div className="flex items-center justify-between gap-3 flex-wrap">
                                  <div>
                                    <CardTitle className="text-sm text-white">Extras e serviços adicionais</CardTitle>
                                    <CardDescription className="text-xs text-white/45">
                                      Somente extras ativos entram no montador. O refresh preserva seleção e preços já editados.
                                    </CardDescription>
                                  </div>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-white/10 bg-white/5 text-white hover:bg-white/10"
                                    onClick={handleRefreshBuilderExtras}
                                  >
                                    <RefreshCw className="w-3.5 h-3.5 mr-2" /> Atualizar extras
                                  </Button>
                                </div>
                              </CardHeader>
                              <CardContent className="space-y-5">
                                {groupedExtras && Object.keys(groupedExtras).length > 0 ? (
                                  Object.entries(groupedExtras).map(([group, items]) => (
                                    <div key={group} className="space-y-3">
                                      <div className="flex items-center justify-between gap-3">
                                        <p className="text-[10px] uppercase tracking-[0.2em] text-white/35">
                                          {builderGroupTitles[group] || "Extras"}
                                        </p>
                                        <p className="text-xs text-white/40">{items.length} item(ns)</p>
                                      </div>
                                      <div className="space-y-3">
                                        {items.map((item) => (
                                          <div
                                            key={item.id}
                                            className={`rounded-2xl border p-4 transition-colors ${
                                              item.selected
                                                ? "border-cyan-400/20 bg-[linear-gradient(135deg,rgba(123,31,162,0.2),rgba(34,211,238,0.08))]"
                                                : "border-white/10 bg-white/[0.02] hover:border-white/20"
                                            }`}
                                          >
                                            <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_140px_140px] gap-4 items-start">
                                              <div className="space-y-2">
                                                <div className="flex items-start gap-3">
                                                  <input
                                                    type="checkbox"
                                                    checked={item.selected}
                                                    onChange={(event) => handleBuilderItemToggle(item.id, event.target.checked)}
                                                    className="mt-1 h-4 w-4 rounded border-white/20 bg-transparent accent-[hsl(var(--primary))]"
                                                  />
                                                  <div className="space-y-1">
                                                    <p className="text-sm font-medium text-white">{item.name}</p>
                                                    <p className="text-xs text-white/50 leading-relaxed">
                                                      {item.description || "Sem descrição adicional."}
                                                    </p>
                                                  </div>
                                                </div>
                                              </div>

                                              <div className="space-y-2">
                                                <Label className="text-[10px] uppercase tracking-[0.18em] text-white/35">Setup</Label>
                                                <Input
                                                  value={getMoneyInputDisplayValue(
                                                    buildItemMoneyDraftKey(item.id, "setupPrice"),
                                                    item.setupPrice,
                                                  )}
                                                  onChange={(event) =>
                                                    handleBuilderItemPriceChange(item.id, "setupPrice", event.target.value)
                                                  }
                                                  onBlur={() => commitMoneyDraft(buildItemMoneyDraftKey(item.id, "setupPrice"))}
                                                  className="glass-input border-white/10 text-white"
                                                />
                                              </div>

                                              <div className="space-y-2">
                                                <Label className="text-[10px] uppercase tracking-[0.18em] text-white/35">Mensal</Label>
                                                <Input
                                                  value={getMoneyInputDisplayValue(
                                                    buildItemMoneyDraftKey(item.id, "monthlyPrice"),
                                                    item.monthlyPrice,
                                                  )}
                                                  onChange={(event) =>
                                                    handleBuilderItemPriceChange(item.id, "monthlyPrice", event.target.value)
                                                  }
                                                  onBlur={() => commitMoneyDraft(buildItemMoneyDraftKey(item.id, "monthlyPrice"))}
                                                  className="glass-input border-white/10 text-white"
                                                />
                                              </div>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  ))
                                ) : (
                                  <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-6 text-sm text-white/45">
                                    Nenhum extra ativo encontrado no catálogo.
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          </div>
                        )}

                        {builderStep === 3 && (
                          <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <Card className="bg-white/[0.03] border-white/10">
                                <CardContent className="p-5 space-y-2">
                                  <p className="text-[10px] uppercase tracking-[0.18em] text-white/35">Implantação base</p>
                                  <AnimatedValue
                                    value={workingBuilderPayload?.pricing.setupSubtotal || builderPayload.pricing.setupSubtotal}
                                    format={formatCurrencyBRL}
                                    className="block text-2xl font-semibold text-white"
                                  />
                                </CardContent>
                              </Card>
                              <Card className="bg-white/[0.03] border-white/10">
                                <CardContent className="p-5 space-y-2">
                                  <p className="text-[10px] uppercase tracking-[0.18em] text-white/35">Mensal base</p>
                                  <AnimatedValue
                                    value={workingBuilderPayload?.pricing.monthlySubtotal || builderPayload.pricing.monthlySubtotal}
                                    format={formatCurrencyBRL}
                                    className="block text-2xl font-semibold text-white"
                                  />
                                </CardContent>
                              </Card>
                              <Card className="bg-white/[0.03] border-primary/20">
                                <CardContent className="p-5 space-y-2">
                                  <p className="text-[10px] uppercase tracking-[0.18em] text-white/35">Itens contratados</p>
                                  <p className="text-2xl font-semibold text-white">{selectedItemsCount}</p>
                                </CardContent>
                              </Card>
                            </div>

                            <Card className="bg-white/[0.03] border-primary/20">
                              <CardHeader>
                                <CardTitle className="text-sm text-white flex items-center gap-2">
                                  <CircleDollarSign className="w-4 h-4 text-primary" /> Totais e pagamento
                                </CardTitle>
                                <CardDescription className="text-xs text-white/45">
                                  Você pode negociar os totais finais sem perder a composição detalhada da proposta.
                                </CardDescription>
                              </CardHeader>
                              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label className="text-xs text-white/55">Valor negociado da implantação</Label>
                                  <Input
                                    value={getMoneyInputDisplayValue(
                                      buildPricingMoneyDraftKey("negotiatedSetup"),
                                      builderPayload.pricing.negotiatedSetup,
                                    )}
                                    onChange={(event) => handleBuilderPricingChange("negotiatedSetup", event.target.value)}
                                    onBlur={() => commitMoneyDraft(buildPricingMoneyDraftKey("negotiatedSetup"))}
                                    className="glass-input border-white/10 text-white"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-xs text-white/55">Entrada / sinal</Label>
                                  <Input
                                    value={getMoneyInputDisplayValue(
                                      buildPricingMoneyDraftKey("entryValue"),
                                      builderPayload.pricing.entryValue,
                                    )}
                                    onChange={(event) => handleBuilderPricingChange("entryValue", event.target.value)}
                                    onBlur={() => commitMoneyDraft(buildPricingMoneyDraftKey("entryValue"))}
                                    className="glass-input border-white/10 text-white"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-xs text-white/55">Saldo na entrega</Label>
                                  <Input
                                    value={formatMoneyInputValue(
                                      workingBuilderPayload?.pricing.balanceValue || builderPayload.pricing.balanceValue,
                                    )}
                                    readOnly
                                    className="glass-input border-white/10 text-white/75"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-xs text-white/55">Mensalidade negociada</Label>
                                  <Input
                                    value={getMoneyInputDisplayValue(
                                      buildPricingMoneyDraftKey("negotiatedMonthly"),
                                      builderPayload.pricing.negotiatedMonthly,
                                    )}
                                    onChange={(event) => handleBuilderPricingChange("negotiatedMonthly", event.target.value)}
                                    onBlur={() => commitMoneyDraft(buildPricingMoneyDraftKey("negotiatedMonthly"))}
                                    className="glass-input border-white/10 text-white"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-xs text-white/55">Prazo estimado (dias úteis)</Label>
                                  <Input
                                    value={builderPayload.prazoDias}
                                    onChange={(event) => updateBuilderTextField("prazoDias", event.target.value)}
                                    className="glass-input border-white/10 text-white"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-xs text-white/55">Forma de pagamento</Label>
                                  <Input
                                    value={builderPayload.formaPagamento}
                                    onChange={(event) => updateBuilderTextField("formaPagamento", event.target.value)}
                                    className="glass-input border-white/10 text-white"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-xs text-white/55">Número de revisões inclusas</Label>
                                  <Input
                                    value={builderPayload.numeroRevisoes}
                                    onChange={(event) => updateBuilderTextField("numeroRevisoes", event.target.value)}
                                    className="glass-input border-white/10 text-white"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-xs text-white/55">Valor da revisão extra</Label>
                                  <Input
                                    value={builderPayload.valorRevisao}
                                    onChange={(event) => updateBuilderTextField("valorRevisao", event.target.value)}
                                    className="glass-input border-white/10 text-white"
                                  />
                                </div>
                              </CardContent>
                            </Card>

                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                              <Card className="bg-white/[0.03] border-white/10">
                                <CardHeader>
                                  <CardTitle className="text-sm text-white">Observações comerciais</CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <Textarea
                                    rows={7}
                                    value={builderPayload.observacoesComerciais}
                                    onChange={(event) => updateBuilderTextField("observacoesComerciais", event.target.value)}
                                    className="glass-input border-white/10 text-white resize-none"
                                  />
                                </CardContent>
                              </Card>
                              <Card className="bg-white/[0.03] border-white/10">
                                <CardHeader>
                                  <CardTitle className="text-sm text-white">Escopo não incluso / exclusões</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                  <Textarea
                                    rows={5}
                                    value={builderPayload.escopoExclusoes}
                                    onChange={(event) => updateBuilderTextField("escopoExclusoes", event.target.value)}
                                    className="glass-input border-white/10 text-white resize-none"
                                  />
                                  <div className="space-y-2">
                                    <Label className="text-xs text-white/55">Janela de suporte / atendimento</Label>
                                    <Textarea
                                      rows={3}
                                      value={builderPayload.prazoSuporte}
                                      onChange={(event) => updateBuilderTextField("prazoSuporte", event.target.value)}
                                      className="glass-input border-white/10 text-white resize-none"
                                    />
                                  </div>
                                </CardContent>
                              </Card>
                            </div>
                          </div>
                        )}

                        {builderStep === 4 && (
                          <div className="space-y-5">
                            {builderPrepared ? (
                              <>
                                <div className="flex items-center justify-between gap-3 flex-wrap">
                                  <div>
                                    <p className="text-[10px] uppercase tracking-[0.18em] text-white/35">Resumo executivo</p>
                                    <p className="text-sm text-white/60">
                                      Revise a proposta final e expanda o corpo jurídico se quiser ler o contrato completo.
                                    </p>
                                  </div>
                                  <Button
                                    variant="outline"
                                    className="border-white/10 bg-white/5 text-white hover:bg-white/10"
                                    onClick={() =>
                                      openPreview({
                                        title: builderPrepared.title,
                                        body: builderPrepared.body,
                                        proposal: builderPrepared.normalizedPayload,
                                      })
                                    }
                                  >
                                    <Eye className="w-4 h-4 mr-2" /> Abrir preview em modal
                                  </Button>
                                </div>
                                <BuilderPreviewDocument
                                  title={builderPrepared.title}
                                  body={builderPrepared.body}
                                  summary={builderSummary}
                                  explanations={buildContractClauseExplanations(builderPrepared.normalizedPayload)}
                                />
                              </>
                            ) : (
                              <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] p-6 text-sm text-white/45">
                                O template do contrato mestre não foi encontrado.
                              </div>
                            )}
                          </div>
                        )}
                          </motion.div>
                        </AnimatePresence>
                      </CardContent>
                    </Card>

                    <Card className="glass-card border-[0.5px]">
                      <CardContent className="p-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-white">Navegação do wizard</p>
                          <p className="text-xs text-white/45">
                            {builderStep < 4
                              ? "Avance etapa por etapa. A validação impede seguir com campos críticos vazios."
                              : "Com o preview final validado, salve no cofre ou exporte a proposta."}
                          </p>
                          {builderStep < 4 && getBuilderStepError(builderStep as Exclude<ContractBuilderStepIndex, 4>) && (
                            <p className="text-xs text-amber-300">
                              {getBuilderStepError(builderStep as Exclude<ContractBuilderStepIndex, 4>)}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-2 flex-wrap justify-end">
                          {builderStep > 0 && (
                              <Button
                                variant="outline"
                                className="border-white/10 bg-white/5 text-white hover:bg-white/10"
                                onClick={() => handleBuilderStepChange((builderStep - 1) as ContractBuilderStepIndex)}
                              >
                                <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
                              </Button>
                            )}

                            {builderStep < 4 ? (
                              <>
                                <Button
                                  variant="outline"
                                  className="border-white/10 bg-white/5 text-white hover:bg-white/10"
                                  onClick={handleSaveBuilderAndExit}
                                >
                                  <Save className="w-4 h-4 mr-2" /> Salvar rascunho e sair
                                </Button>
                                <Button
                                  className="gradient-primary border-0 text-white"
                                  onClick={() => handleBuilderStepChange((builderStep + 1) as ContractBuilderStepIndex)}
                                >
                                  Próxima etapa <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                              </>
                            ) : (
                              <>
                                <Button
                                  variant="outline"
                                  className="border-white/10 bg-white/5 text-white hover:bg-white/10"
                                  onClick={handleSaveBuilderAndExit}
                                >
                                  <Save className="w-4 h-4 mr-2" /> Salvar rascunho e sair
                                </Button>
                              <Button
                                variant="outline"
                                className="border-white/10 bg-white/5 text-white hover:bg-white/10"
                                onClick={handleSaveBuilder}
                              >
                                <Save className="w-4 h-4 mr-2" />
                                {editingBuilderContract ? "Atualizar no cofre" : "Salvar no cofre"}
                              </Button>
                              <Button
                                variant="outline"
                                className="border-white/10 bg-white/5 text-white hover:bg-white/10"
                                disabled={!editingBuilderContract || builderHasUnsavedChanges}
                                onClick={() => void handleSendContractToClient(editingBuilderContract)}
                              >
                                <Send className="w-4 h-4 mr-2" />
                                {editingBuilderContract?.status === "aguardando"
                                  ? "Atualizar leitura do cliente"
                                  : "Enviar leitura ao cliente"}
                              </Button>
                              <Button
                                variant="outline"
                                className="border-white/10 bg-white/5 text-white hover:bg-white/10"
                                onClick={handleBuilderPdfDownload}
                              >
                                <Download className="w-4 h-4 mr-2" /> Baixar PDF
                              </Button>
                              <Button className="gradient-primary border-0 text-white" onClick={handleBuilderWordDownload}>
                                <FileText className="w-4 h-4 mr-2" /> Baixar Word
                              </Button>
                            </>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}
              </div>

              <div className="hidden xl:block">
                <div className="sticky top-24">
                  <BuilderLiveSummary summary={builderSummary} selectedCount={selectedItemsCount} />
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-[rgba(17,15,24,0.96)] border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white text-base">
              {previewState?.title || "Preview do contrato mestre"}
            </DialogTitle>
          </DialogHeader>

          {previewState && (
            <BuilderPreviewDocument
              title={previewState.title}
              body={previewState.body}
              summary={previewState.proposal ? buildProposalSummary(previewState.proposal) : null}
              explanations={previewState.proposal ? buildContractClauseExplanations(previewState.proposal) : []}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={versionsOpen}
        onOpenChange={(open) => {
          setVersionsOpen(open);
          if (!open) {
            setCompareVersion(null);
          }
        }}
      >
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-[rgba(17,15,24,0.96)] border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white text-base">
              {versionsContract ? `Histórico de versões — ${versionsContract.titulo}` : "Histórico de versões"}
            </DialogTitle>
          </DialogHeader>

          {versionsLoading ? (
            <div className="py-12 text-center text-sm text-white/45">Carregando snapshots da proposta...</div>
          ) : contractVersions.length === 0 ? (
            <div className="py-12 text-center text-sm text-white/45">
              Esta proposta ainda não tem versões anteriores salvas.
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-[320px_minmax(0,1fr)] gap-6">
              <div className="space-y-3">
                {contractVersions.map((version) => (
                  <Card key={version.id} className="bg-white/[0.03] border-white/10">
                    <CardContent className="p-4 space-y-3">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-semibold text-white">Versão {version.version_number}</p>
                          <Badge variant="outline" className="border-white/10 bg-white/5 text-white/60">
                            {formatCurrencyBRL(version.valor)}
                          </Badge>
                        </div>
                        <p className="text-xs text-white/45">{formatContractDateTime(version.created_at)}</p>
                        {version.descricao && <p className="text-sm text-white/55">{version.descricao}</p>}
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-white/10 bg-white/5 text-white hover:bg-white/10"
                          onClick={() => setCompareVersion(version)}
                        >
                          <History className="w-4 h-4 mr-2" /> Comparar
                        </Button>
                        <Button
                          size="sm"
                          className="gradient-primary border-0 text-white"
                          onClick={() => handleRestoreVersion(version)}
                        >
                          <RotateCcw className="w-4 h-4 mr-2" /> Restaurar esta versão
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="space-y-4">
                {versionsContract && (
                  <VersionComparisonCard
                    label="Versão atual salva"
                    title={versionsContract.titulo}
                    description={versionsContract.descricao}
                    value={versionsContract.valor}
                    createdAt={versionsContract.updated_at || versionsContract.created_at}
                    summary={
                      versionsContract.builder_payload
                        ? buildProposalSummary(
                            normalizeBuilderPayload(
                              versionsContract.builder_payload,
                              extrasCatalogo,
                              versionsContract.cliente_id,
                              4,
                            ),
                          )
                        : null
                    }
                  />
                )}

                {compareVersion ? (
                  <VersionComparisonCard
                    label={`Comparando com a versão ${compareVersion.version_number}`}
                    title={compareVersion.titulo}
                    description={compareVersion.descricao}
                    value={compareVersion.valor}
                    createdAt={compareVersion.created_at}
                    summary={
                      compareVersion.builder_payload
                        ? buildProposalSummary(
                            normalizeBuilderPayload(
                              compareVersion.builder_payload,
                              extrasCatalogo,
                              versionsContract?.cliente_id,
                              4,
                            ),
                          )
                        : null
                    }
                  />
                ) : (
                  <Card className="bg-white/[0.03] border-white/10">
                    <CardContent className="p-6 text-sm text-white/45">
                      Escolha uma versão no histórico para comparar com a proposta atual salva.
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent className="bg-[rgba(17,15,24,0.96)] border-white/10 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir rascunho do cofre?</AlertDialogTitle>
            <AlertDialogDescription className="text-white/55">
              {deleteTarget
                ? `O rascunho "${deleteTarget.titulo}" será removido permanentemente.`
                : "O rascunho será removido permanentemente."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-white/10 bg-white/5 text-white hover:bg-white/10">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 text-white hover:bg-red-500"
              onClick={handleDeleteDraft}
            >
              Excluir rascunho
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}
