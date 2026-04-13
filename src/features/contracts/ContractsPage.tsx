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
import { ContractActivityFeed } from "@/components/contracts/ContractActivityFeed";
import { ContractSignaturePanel, ContractSignedStatusBadge } from "@/components/contracts/ContractSignaturePanel";
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
import { useContractsCatalog } from "@/features/contracts/hooks/useContractsCatalog";
import {
  deleteBuilderDraftContract,
  fetchActiveClientExtras,
  fetchContractVersions,
  saveBuilderContractRecord,
  sendBuilderContractToClientRecord,
  setContractArchived,
} from "@/features/contracts/services";
import { useContractsRealtime } from "@/hooks/useContractsRealtime";
import { useContractEventsRealtime } from "@/hooks/useContractEventsRealtime";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import {
  createAdminNotification,
  createClientNotification,
  createContractEvent,
  type ContractEventRow,
} from "@/lib/contract-activity";
import {
  buildProposalSummary,
  buildContractClauseExplanations,
  buildContractSignatureSummary,
  buildBuilderTemplateValues,
  buildContractWordHtml,
  buildContractanteFromClient,
  computeBuilderPricing,
  createEmptyBuilderPayload,
  describeClientExtraPricing,
  formatCurrencyBRL,
  getContractExtraSnapshots,
  parseMoneyInput,
  selectPrimaryPlan,
  stripLegacySignaturePlaceholders,
  type BuilderPrimaryPlanId,
  type ContractBuilderClientExtraSnapshot,
  type ContractClauseExplanation,
  type ContractBuilderPayload,
  type ContractBuilderPricing,
  type ContractProposalSummary,
  type ContractSignatureSummary,
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
import {
  CONTRACT_STATUS_ORDER,
  getContractStatusBadgeClass,
  getContractStatusColor,
  getContractStatusInsight,
  getContractStatusLabel,
} from "@/lib/contract-status";
import { contractTemplates, fillTemplate, getContractTypeLabel } from "@/lib/contract-templates";
import { PUBLIC_PLAN_CATALOG } from "@/lib/public-plans";
import { sendPushToClient } from "@/lib/push-notifications";

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
  contract?: Contrato | null;
}

const BUILDER_TEMPLATE_ID = "novaesweb-contrato-mestre";
const RESIGN_REASON_DEFAULT = "Assinatura pendente por atualização de extra e melhoria do sistema.";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const moneyDraftFieldPattern = /^(pricing):(.+):(discountValue|entryValue|negotiatedMonthly)$/;

type MoneyDraftField =
  | "discountValue"
  | "entryValue"
  | "negotiatedMonthly";

function buildPdfFileName(title: string) {
  return title.replace(/[^a-zA-Z0-9]/g, "_");
}

function formatMoneyInputValue(value: number) {
  return Number(value || 0).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function buildPricingMoneyDraftKey(field: "discountValue" | "entryValue" | "negotiatedMonthly") {
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
  contractanteSignedName?: string | null;
  signedAt?: string | null;
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
  const cleanedBody = stripLegacySignaturePlaceholders(corpo);
  const signatureSummary = buildContractSignatureSummary(options?.proposal, {
    contractanteSignedName: options?.contractanteSignedName,
    signedAt: options?.signedAt,
  });

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

  const paragraphs = cleanedBody.split(/\n{2,}/).map((block) => block.trim()).filter(Boolean);
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

  if (signatureSummary) {
    const sectionHeight = 70;
    const cardGap = 8;
    const cardWidth = (maxWidth - cardGap) / 2;
    const cardHeight = 30;

    if (y > pageHeight - 90) {
      doc.addPage();
      y = 18;
    }

    y += 6;
    doc.setDrawColor(236, 223, 244);
    doc.setFillColor(250, 244, 251);
    doc.roundedRect(margin, y, maxWidth, sectionHeight, 6, 6, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(141, 60, 176);
    doc.text("ACEITE E ASSINATURA", pageWidth / 2, y + 8, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.2);
    doc.setTextColor(97, 84, 109);
    doc.text(signatureSummary.locationAndDate, pageWidth / 2, y + 14, { align: "center" });

    const drawSignatureCard = (
      x: number,
      startY: number,
      role: string,
      name: string,
      caption: string,
    ) => {
      doc.setDrawColor(236, 223, 244);
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(x, startY, cardWidth, cardHeight, 5, 5, "FD");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(6.8);
      doc.setTextColor(139, 121, 152);
      doc.text(role.toUpperCase(), x + cardWidth / 2, startY + 6.5, { align: "center" });
      doc.setDrawColor(194, 24, 91);
      doc.line(x + 8, startY + 12.5, x + cardWidth - 8, startY + 12.5);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(31, 23, 40);
      doc.text(name, x + cardWidth / 2, startY + 20, { align: "center" });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(109, 95, 119);
      doc.text(caption, x + cardWidth / 2, startY + 25.5, { align: "center" });
    };

    const cardsY = y + 20;
    drawSignatureCard(margin, cardsY, "Contratante", signatureSummary.contractanteName, signatureSummary.contractanteCaption);
    drawSignatureCard(
      margin + cardWidth + cardGap,
      cardsY,
      "Contratada",
      signatureSummary.contratadaName,
      signatureSummary.contratadaCaption,
    );

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.4);
    doc.setTextColor(109, 95, 119);
    doc.text(signatureSummary.note, pageWidth / 2, y + sectionHeight - 6, { align: "center" });
    y += sectionHeight + 4;
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
  signatureOptions?: {
    contractanteSignedName?: string | null;
    signedAt?: string | null;
  },
) {
  const blob = new Blob([buildContractWordHtml(title, body, proposal, signatureOptions)], {
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

function mapClientExtraToSnapshot(extra: {
  id: string;
  extra_id: string;
  categoria: string;
  preco_ativacao: number;
  preco_mensal: number;
  extras_catalogo?: {
    nome?: string | null;
    descricao?: string | null;
  } | null;
}): ContractBuilderClientExtraSnapshot {
  const category = extra.categoria === "mensal" || extra.categoria === "intermediario" || extra.categoria === "fixo"
    ? extra.categoria
    : "fixo";

  return {
    id: extra.id,
    extraId: extra.extra_id,
    name: extra.extras_catalogo?.nome?.trim() || "Extra",
    description: extra.extras_catalogo?.descricao?.trim() || "",
    category,
    typeLabel: Number(extra.preco_mensal || 0) > 0 ? "mensal" : "único",
    setupPrice: Number(extra.preco_ativacao || 0),
    monthlyPrice: Number(extra.preco_mensal || 0),
  };
}

function countSelectedBuilderEntries(payload: ContractBuilderPayload) {
  const selectedPlanCount = payload.primaryPlanId !== "none" ? 1 : 0;
  return selectedPlanCount + getContractExtraSnapshots(payload).length;
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

  const clientExtrasSnapshot = Array.isArray(payload.clientExtrasSnapshot)
    ? payload.clientExtrasSnapshot.map((item) => ({
        ...item,
        setupPrice: Number(item.setupPrice || 0),
        monthlyPrice: Number(item.monthlyPrice || 0),
        typeLabel: item.typeLabel === "mensal" ? "mensal" : "único",
        category:
          item.category === "mensal" || item.category === "intermediario" || item.category === "fixo"
            ? item.category
            : "fixo",
      }))
    : [];

  const pricing = computeBuilderPricing(items, clientExtrasSnapshot, {
    negotiatedSetup: Number(payload.pricing?.negotiatedSetup ?? payload.pricing?.setupSubtotal ?? 0),
    discountType: payload.pricing?.discountType === "percentage" ? "percentage" : "fixed",
    discountValue: Number(payload.pricing?.discountValue ?? 0),
    entryValue: Number(payload.pricing?.entryValue ?? 0),
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
    clientExtrasSnapshot,
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
  const selectedCount = countSelectedBuilderEntries(normalizedPayload);
  const selectedPlan =
    PUBLIC_PLAN_CATALOG.find((plan) => plan.id === normalizedPayload.primaryPlanId)?.title || "Sem plano principal";
  const clientLabel =
    normalizedPayload.contractante.nomeEmpresa?.trim() || normalizedPayload.contractante.nome.trim() || "Cliente";

  return {
    normalizedPayload,
    title: `Contrato Mestre NovaesWeb — ${clientLabel}`,
    body: fillTemplate(template.corpo, templateValues),
    description: `Montador Comercial • ${selectedPlan} • ${selectedCount} item(ns) contratado(s)`,
    value: normalizedPayload.pricing.finalSetupTotal,
  };
}

function hasSignedContractMaterialChanges(
  existingContract: Contrato,
  prepared: NonNullable<ReturnType<typeof buildBuilderSavePayload>>,
  extras: ExtraCatalogo[],
) {
  const existingPayload = normalizeBuilderPayload(
    existingContract.builder_payload,
    extras,
    existingContract.cliente_id || "",
    4,
  );

  const existingSignature = buildContractMaterialSignature({
    title: existingContract.titulo || "",
    description: existingContract.descricao || "",
    value: Number(existingContract.valor || 0),
    body: (existingContract.corpo as string) || existingContract.descricao || "",
    payload: existingPayload,
  });

  const nextSignature = buildContractMaterialSignature({
    title: prepared.title,
    description: prepared.description,
    value: Number(prepared.value || 0),
    body: prepared.body,
    payload: prepared.normalizedPayload,
  });

  return existingSignature !== nextSignature;
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
      payload.clientExtrasSnapshot.length > 0 ||
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

function buildComparableContractPayload(payload: ContractBuilderPayload) {
  return validateAndSanitizeBuilderPayload({
    ...payload,
    createdAt: "",
    updatedAt: "",
    lastStep: 4,
  });
}

function buildContractMaterialSignature(input: {
  title: string;
  description: string;
  value: number;
  body: string;
  payload: ContractBuilderPayload;
}) {
  return JSON.stringify({
    title: input.title.trim(),
    description: input.description.trim(),
    value: Number(input.value || 0),
    body: stripLegacySignaturePlaceholders(input.body).replace(/\s+/g, " ").trim(),
    payload: buildComparableContractPayload(input.payload),
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
  signatureSummary,
}: {
  title: string;
  body: string;
  summary: ContractProposalSummary | null;
  explanations: ContractClauseExplanation[];
  signatureSummary: ContractSignatureSummary | null;
}) {
  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-primary/20 bg-[radial-gradient(circle_at_top_left,rgba(194,24,91,0.34),transparent_32%),radial-gradient(circle_at_top_right,rgba(123,31,162,0.32),transparent_38%),linear-gradient(135deg,rgba(15,12,22,0.96),rgba(30,11,33,0.94),rgba(45,12,34,0.9))] shadow-[0_30px_70px_rgba(17,6,26,0.38)]">
        <CardContent className="relative overflow-hidden p-6 md:p-8">
          <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.35),transparent)]" />
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="border-white/15 bg-white/10 text-white/80">
              NovaesWeb
            </Badge>
            <Badge variant="outline" className="border-fuchsia-300/20 bg-fuchsia-300/10 text-fuchsia-100">
              Proposta premium
            </Badge>
            <Badge variant="outline" className="border-white/10 bg-white/[0.06] text-white/55">
              Experiência de assinatura centralizada
            </Badge>
          </div>
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_280px] xl:items-end">
              <div className="space-y-3">
                <h3 className="text-2xl font-semibold text-white leading-tight md:text-[2rem]">{title}</h3>
                <p className="max-w-3xl text-sm leading-relaxed text-white/65">
                  Estrutura comercial gerada no montador do contrato mestre, com escopo, condições financeiras,
                  cláusulas consolidadas e assinatura final preparada para leitura, aceite e impressão.
                </p>
              </div>
              {summary ? (
                <div className="rounded-[26px] border border-white/10 bg-white/[0.05] p-4 backdrop-blur-xl">
                  <p className="text-[10px] uppercase tracking-[0.22em] text-white/40">Painel executivo</p>
                  <div className="mt-4 space-y-3">
                    <div>
                      <p className="text-xs text-white/45">Cliente</p>
                      <p className="text-sm font-medium text-white">{summary.contractante.title}</p>
                    </div>
                    <div>
                      <p className="text-xs text-white/45">Comercial</p>
                      <p className="text-sm font-medium text-white">{summary.comercial.lines[0] || "Sem valor definido"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-white/45">Assinaturas</p>
                      <p className="text-sm font-medium text-white">Somente CONTRATANTE e CONTRATADA</p>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
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
                  {stripLegacySignaturePlaceholders(body)}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      <ContractSignaturePanel summary={signatureSummary} variant="dark" />
    </div>
  );
}

function ContractLifecycleTimeline({
  status,
  dataEnvio,
  dataVisualizacao,
  dataAssinatura,
}: {
  status: string;
  dataEnvio?: string | null;
  dataVisualizacao?: string | null;
  dataAssinatura?: string | null;
}) {
  const steps = [
    { id: "rascunho", label: "Rascunho", date: null },
    { id: "enviado", label: "Enviado", date: dataEnvio },
    { id: "visualizado", label: "Visualizado", date: dataVisualizacao },
    { id: "assinado", label: "Assinado", date: dataAssinatura },
  ];
  const activeIndex = Math.min(
    Math.max(CONTRACT_STATUS_ORDER.indexOf(status as (typeof CONTRACT_STATUS_ORDER)[number]), 0),
    steps.length - 1,
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[10px] uppercase tracking-[0.2em] text-white/35">Ciclo do contrato</p>
        <Badge variant="outline" className={getContractStatusBadgeClass(status)}>
          {getContractStatusLabel(status)}
        </Badge>
      </div>
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        {steps.map((step, index) => {
          const isActive = index <= activeIndex;
          const isCurrent = steps[activeIndex]?.id === step.id;

          return (
            <div
              key={step.id}
              className={`rounded-2xl border p-3 transition-all ${
                isCurrent
                  ? "border-fuchsia-300/25 bg-[linear-gradient(135deg,rgba(123,31,162,0.26),rgba(232,51,74,0.18),rgba(194,24,91,0.2))] shadow-[0_16px_32px_rgba(194,24,91,0.18)]"
                  : isActive
                    ? "border-emerald-300/20 bg-emerald-300/10"
                    : "border-white/10 bg-white/[0.03]"
              }`}
            >
              <p className="text-xs font-medium text-white">{step.label}</p>
              <p className="mt-1 text-[11px] text-white/45">
                {step.date ? formatContractDateTime(step.date) : isCurrent ? "Etapa atual" : "Pendente"}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function BuilderLiveSummary({
  summary,
  selectedCount,
  syncState,
  contractStatus,
  contractDates,
}: {
  summary: ContractProposalSummary | null;
  selectedCount: number;
  syncState: "idle" | "saving" | "saved" | "error";
  contractStatus?: string | null;
  contractDates?: {
    dataEnvio?: string | null;
    dataVisualizacao?: string | null;
    dataAssinatura?: string | null;
    onboardingStartedAt?: string | null;
    pedidoId?: string | null;
    requiresResign?: boolean | null;
    resignReason?: string | null;
  };
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

    if (normalized.includes("subtotal da implantação")) acc.subtotal = numericValue;
    if (normalized.includes("desconto aplicado")) acc.discount = numericValue;
    if (normalized.includes("valor final da implantação") || normalized.includes("ativação total")) {
      acc.setup = numericValue;
    }
    if (normalized.includes("entrada / sinal")) acc.entry = numericValue;
    if (normalized.includes("saldo na entrega")) acc.balance = numericValue;
    if (normalized.includes("mensalidade contratada")) acc.monthly = numericValue;
    return acc;
  }, {});
  const statusInsight = contractStatus
    ? getContractStatusInsight({
        status: contractStatus,
        dataEnvio: contractDates?.dataEnvio,
        dataVisualizacao: contractDates?.dataVisualizacao,
        dataAssinatura: contractDates?.dataAssinatura,
        onboardingStartedAt: contractDates?.onboardingStartedAt,
        pedidoId: contractDates?.pedidoId,
        requiresResign: contractDates?.requiresResign,
        resignReason: contractDates?.resignReason,
      })
    : null;

  return (
    <Card className="glass-card overflow-hidden border-[0.5px] border-fuchsia-400/15 bg-[linear-gradient(180deg,rgba(17,15,24,0.98),rgba(17,15,24,0.85))] shadow-[0_20px_50px_rgba(35,8,52,0.5)]">
      <CardHeader className="border-b border-white/10 bg-[linear-gradient(135deg,rgba(123,31,162,0.24),rgba(232,51,74,0.16),rgba(194,24,91,0.18))]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-sm text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-fuchsia-200" /> Resumo ao vivo
            </CardTitle>
            <CardDescription className="text-xs text-white/50">
              {selectedCount} item(ns) contratado(s) na proposta atual.
            </CardDescription>
          </div>
          <Badge
            variant="outline"
            className={
              syncState === "saving"
                ? "border-fuchsia-300/20 bg-fuchsia-300/10 text-fuchsia-100"
                : syncState === "error"
                  ? "border-red-300/20 bg-red-300/10 text-red-100"
                  : "border-white/15 bg-white/10 text-white/80"
            }
          >
            {syncState === "saving"
              ? "Sincronizando"
              : syncState === "error"
                ? "Falha no sync"
                : "NovaesWeb live"}
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

        {contractStatus && (
          <div className="space-y-3">
            {statusInsight ? (
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-sm font-medium text-white">{statusInsight.title}</p>
                <p className="mt-1 text-xs text-white/50">{statusInsight.subtitle}</p>
              </div>
            ) : null}
            <ContractLifecycleTimeline
              status={contractStatus}
              dataEnvio={contractDates?.dataEnvio}
              dataVisualizacao={contractDates?.dataVisualizacao}
              dataAssinatura={contractDates?.dataAssinatura}
            />
          </div>
        )}

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
  const [previewContractEvents, setPreviewContractEvents] = useState<ContractEventRow[]>([]);
  const [previewContractEventsLoading, setPreviewContractEventsLoading] = useState(false);
  const [builderPayload, setBuilderPayload] = useState<ContractBuilderPayload | null>(null);
  const [editingBuilderContract, setEditingBuilderContract] = useState<Contrato | null>(null);
  const [builderStep, setBuilderStep] = useState<ContractBuilderStepIndex>(0);
  const [mobileSummaryOpen, setMobileSummaryOpen] = useState(false);
  const [cofreFilter, setCofreFilter] = useState<"ativos" | "arquivados">("ativos");
  const [cofreStatusFilter, setCofreStatusFilter] = useState<"todos" | "rascunho" | "enviado" | "visualizado" | "assinado" | "cancelado">("todos");
  const [builderLastSavedSignature, setBuilderLastSavedSignature] = useState<string | null>(null);
  const [builderLastSavedAt, setBuilderLastSavedAt] = useState<string | null>(null);
  const [versionsOpen, setVersionsOpen] = useState(false);
  const [versionsLoading, setVersionsLoading] = useState(false);
  const [versionsContract, setVersionsContract] = useState<Contrato | null>(null);
  const [contractVersions, setContractVersions] = useState<ContratoVersion[]>([]);
  const [compareVersion, setCompareVersion] = useState<ContratoVersion | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Contrato | null>(null);
  const [moneyDrafts, setMoneyDrafts] = useState<Record<string, string>>({});
  const [syncingClientExtras, setSyncingClientExtras] = useState(false);
  const [builderRecoveredLocally, setBuilderRecoveredLocally] = useState(false);
  const [builderRemoteAutosaveState, setBuilderRemoteAutosaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const shouldReduceMotion = useReducedMotion();
  const contractRecoveryRestoredRef = useRef(false);
  const contractRecoveryAutosaveSignatureRef = useRef<string | null>(null);
  const contractRemoteAutosaveSignatureRef = useRef<string | null>(null);
  const masterTemplate = contractTemplates[0];

  const sortContractEvents = useCallback((items: ContractEventRow[]) => {
    return [...items].sort((left, right) => {
      const leftDate = new Date(left.created_at).getTime();
      const rightDate = new Date(right.created_at).getTime();
      return rightDate - leftDate;
    });
  }, []);

  const decorateContrato = useCallback(
    (contrato: Tables<"contratos"> | Contrato): Contrato => {
      const clienteNome =
        "clientes" in contrato && contrato.clientes?.nome
          ? contrato.clientes.nome
          : clientes.find((item) => item.id === contrato.cliente_id)?.nome || null;

      return {
        ...(contrato as Contrato),
        clientes: clienteNome ? { nome: clienteNome } : null,
      };
    },
    [clientes],
  );

  const sortContratosByUpdatedAt = useCallback((items: Contrato[]) => {
    return [...items].sort((left, right) => {
      const leftDate = new Date(left.updated_at || left.created_at).getTime();
      const rightDate = new Date(right.updated_at || right.created_at).getTime();
      return rightDate - leftDate;
    });
  }, []);

  const upsertContratoState = useCallback(
    (contrato: Tables<"contratos"> | Contrato) => {
      const decorated = decorateContrato(contrato);
      setContratos((current) => {
        const next = current.filter((item) => item.id !== decorated.id);
        next.unshift(decorated);
        return sortContratosByUpdatedAt(next);
      });
      setEditingBuilderContract((current) => (current?.id === decorated.id ? decorated : current));
      setVersionsContract((current) => (current?.id === decorated.id ? decorated : current));
      return decorated;
    },
    [decorateContrato, sortContratosByUpdatedAt],
  );

  const removeContratoState = useCallback((contractId: string) => {
    setContratos((current) => current.filter((item) => item.id !== contractId));
    setEditingBuilderContract((current) => (current?.id === contractId ? null : current));
    setVersionsContract((current) => (current?.id === contractId ? null : current));
  }, []);

  const syncBuilderSavedState = useCallback(
    (
      payload: ContractBuilderPayload,
      step: ContractBuilderStepIndex,
      savedAt?: string | null,
    ) => {
      setBuilderLastSavedSignature(buildBuilderDirtySignature(payload, step));
      setBuilderLastSavedAt(savedAt || null);
      setBuilderRecoveredLocally(false);
      setBuilderRemoteAutosaveState(savedAt ? "saved" : "idle");
      contractRecoveryAutosaveSignatureRef.current = buildBuilderDirtySignature(payload, step);
      contractRemoteAutosaveSignatureRef.current = buildBuilderDirtySignature(payload, step);
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

  const { loadContratos, loadClientes, loadExtrasCatalogo, loadPreviewContractEvents } = useContractsCatalog({
    decorateContrato: decorateContrato as (contrato: Contrato) => Contrato,
    sortContratosByUpdatedAt,
    sortContractEvents,
    setContratos,
    setContratosLoaded,
    setClientes,
    setExtrasCatalogo,
    setExtrasLoaded,
    setPreviewContractEvents,
    setPreviewContractEventsLoading,
  });

  useEffect(() => {
    void loadContratos();
    void loadClientes();
    void loadExtrasCatalogo();
  }, [loadContratos, loadClientes, loadExtrasCatalogo]);

  useContractsRealtime({
    channelName: "contracts-admin-realtime",
    filter: `modelo=eq.${BUILDER_TEMPLATE_ID}`,
    enabled: contratosLoaded,
    onUpsert: (contrato) => {
      upsertContratoState(contrato);
    },
    onDelete: (contractId) => {
      removeContratoState(contractId);
    },
  });

  useContractEventsRealtime({
    contractId: previewState?.contract?.id,
    enabled: previewOpen && Boolean(previewState?.contract?.id),
    onInsert: (event) => {
      setPreviewContractEvents((current) => sortContractEvents([event, ...current]));
    },
  });

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
    if (nextState.contract?.id) {
      void loadPreviewContractEvents(nextState.contract.id).catch(() => {
        toast({
          title: "Erro ao carregar atividade do contrato",
          description: "O histórico operacional não pôde ser carregado.",
          variant: "destructive",
        });
      });
    } else {
      setPreviewContractEvents([]);
      setPreviewContractEventsLoading(false);
    }
    setPreviewOpen(true);
  };

  const saveBuilderContractDirectly = useCallback(
    async ({
      contractId,
      payloadToPersist,
      createVersionSnapshot = true,
    }: {
      contractId: string | null;
      payloadToPersist: Record<string, unknown>;
      createVersionSnapshot?: boolean;
    }) => {
      return saveBuilderContractRecord({
        contractId,
        payloadToPersist,
        currentContracts: contratos,
        createVersionSnapshot,
      });
    },
    [contratos],
  );

  const runContractRealtimeSideEffects = useCallback(
    async ({
      contract,
      event,
      adminNotification,
      clientNotification,
    }: {
      contract: Contrato;
      event?: {
        tipo: string;
        titulo: string;
        descricao?: string | null;
        actorType?: string;
        actorId?: string | null;
        meta?: Record<string, unknown>;
      };
      adminNotification?: {
        title: string;
        body: string;
        url?: string;
      };
      clientNotification?: {
        title: string;
        body: string;
        url?: string;
      };
    }) => {
      const jobs: Promise<unknown>[] = [];

      if (event) {
        jobs.push(
          createContractEvent({
            contratoId: contract.id,
            tipo: event.tipo,
            titulo: event.titulo,
            descricao: event.descricao,
            actorType: event.actorType,
            actorId: event.actorId,
            meta: event.meta,
          }),
        );
      }

      if (adminNotification) {
        jobs.push(createAdminNotification(adminNotification.title, adminNotification.body, adminNotification.url));
      }

      if (clientNotification && contract.cliente_id) {
        jobs.push(
          createClientNotification(
            contract.cliente_id,
            clientNotification.title,
            clientNotification.body,
            clientNotification.url,
          ),
        );
        jobs.push(sendPushToClient(contract.cliente_id, clientNotification.title, clientNotification.body, clientNotification.url));
      }

      if (jobs.length > 0) {
        await Promise.allSettled(jobs);
      }
    },
    [],
  );

  const sendBuilderContractToClientDirectly = useCallback(
    async (contract: Contrato) => {
      const { contract: contratoEnviado, isResignFlow, sentAt } = await sendBuilderContractToClientRecord(contract);
      const clienteNome = (contratoEnviado.clientes as any)?.nome || "Cliente";

      await runContractRealtimeSideEffects({
        contract: contratoEnviado,
        event: {
          tipo: "enviado",
          titulo: isResignFlow ? "Versão atualizada enviada ao cliente" : "Contrato enviado ao cliente",
          descricao: isResignFlow
            ? `${clienteNome} recebeu a versão atualizada e precisa assinar novamente no portal.`
            : `${clienteNome} recebeu o contrato no portal do cliente.`,
          actorType: "admin",
          meta: {
            status: contratoEnviado.status,
            sentAt,
            requires_resign: isResignFlow,
          },
        },
        clientNotification: {
          title: isResignFlow ? "✍️ Versão atualizada do contrato" : "📄 Novo contrato disponível",
          body: isResignFlow
            ? (contratoEnviado as any).reassinatura_motivo || RESIGN_REASON_DEFAULT
            : `A proposta "${contratoEnviado.titulo}" já está liberada no seu portal.`,
          url: "/cliente/contratos",
        },
      });

      return contratoEnviado;
    },
    [runContractRealtimeSideEffects],
  );

  const handleOpenVersions = useCallback(
    async (contrato: Contrato) => {
      setVersionsOpen(true);
      setVersionsContract(contrato);
      setCompareVersion(null);
      setVersionsLoading(true);

      try {
        const data = await fetchContractVersions(contrato.id);
        setContractVersions(data);
      } catch (error) {
        toast({
          title: "Erro ao carregar versões",
          description: getContractErrorMessage(error, "Não foi possível carregar o histórico."),
          variant: "destructive",
        });
        setContractVersions([]);
      }

      setVersionsLoading(false);
    },
    [toast],
  );

  const handleArchiveContract = useCallback(
    async (contrato: Contrato) => {
      try {
        const updatedContrato = upsertContratoState(await setContractArchived(contrato.id, true));
        await runContractRealtimeSideEffects({
          contract: updatedContrato,
          event: {
            tipo: "arquivado",
            titulo: "Contrato arquivado",
            descricao: "A proposta foi movida para a área de arquivados do cofre.",
            actorType: "admin",
          },
        });

        if (editingBuilderContract?.id === contrato.id) {
          setEditingBuilderContract(updatedContrato);
        }

        setVersionsContract((current) => (current?.id === contrato.id ? updatedContrato : current));
        toast({ title: "Contrato arquivado no cofre" });
      } catch (error) {
        toast({
          title: "Erro ao arquivar contrato",
          description: getContractErrorMessage(error, "Não foi possível arquivar o contrato."),
          variant: "destructive",
        });
      }
    },
    [editingBuilderContract?.id, runContractRealtimeSideEffects, toast, upsertContratoState],
  );

  const handleUnarchiveContract = useCallback(
    async (contrato: Contrato) => {
      try {
        const updatedContrato = upsertContratoState(await setContractArchived(contrato.id, false));
        await runContractRealtimeSideEffects({
          contract: updatedContrato,
          event: {
            tipo: "desarquivado",
            titulo: "Contrato desarquivado",
            descricao: "A proposta voltou para a lista principal do cofre.",
            actorType: "admin",
          },
        });

        if (editingBuilderContract?.id === contrato.id) {
          setEditingBuilderContract(updatedContrato);
        }

        setVersionsContract((current) => (current?.id === contrato.id ? updatedContrato : current));
        toast({ title: "Contrato retornou para a lista principal" });
      } catch (error) {
        toast({
          title: "Erro ao desarquivar contrato",
          description: getContractErrorMessage(error, "Não foi possível desarquivar o contrato."),
          variant: "destructive",
        });
      }
    },
    [editingBuilderContract?.id, runContractRealtimeSideEffects, toast, upsertContratoState],
  );

  const handleDuplicateContract = useCallback(
    async (contrato: Contrato) => {
      try {
        if (!extrasLoaded) {
          toast({
            title: "Catálogo ainda carregando",
            description: "Os extras ainda estão sendo sincronizados. Tente novamente em instantes.",
            variant: "destructive",
          });
          return;
        }

        const duplicatedPayloadBase = normalizeBuilderPayload(
          contrato.builder_payload,
          extrasCatalogo,
          contrato.cliente_id,
          4,
        );
        const duplicatedPayload = {
          ...duplicatedPayloadBase,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          lastStep: duplicatedPayloadBase.lastStep,
        };
        const prepared = buildBuilderSavePayload(duplicatedPayload, duplicatedPayload.lastStep);

        if (!prepared) {
          throw new Error("Não foi possível preparar a duplicação da proposta.");
        }

        const duplicatedTitle = prepared.title.includes("Cópia")
          ? prepared.title
          : `${prepared.title} • Cópia`;
        const duplicatedContrato = await saveBuilderContractDirectly({
          contractId: null,
          createVersionSnapshot: false,
          payloadToPersist: {
            cliente_id: prepared.normalizedPayload.clienteId || null,
            titulo: duplicatedTitle,
            descricao: prepared.description,
            valor: prepared.value,
            status: "rascunho",
            corpo: prepared.body,
            modelo: BUILDER_TEMPLATE_ID,
            builder_payload: prepared.normalizedPayload as any,
            assinatura_admin: null,
            assinatura_cliente: null,
            assinatura_cliente_nome: null,
            assinatura_cliente_email: null,
            data_visualizacao: null,
            data_assinatura: null,
            archived_at: null,
            updated_at: new Date().toISOString(),
          },
        });

        const normalizedDuplicatedPayload = normalizeBuilderPayload(
          duplicatedContrato.builder_payload,
          extrasCatalogo,
          duplicatedContrato.cliente_id,
          prepared.normalizedPayload.lastStep,
        );

        upsertContratoState(duplicatedContrato);
        setBuilderPayload(normalizedDuplicatedPayload);
        setEditingBuilderContract(duplicatedContrato);
        setBuilderStep(normalizedDuplicatedPayload.lastStep);
        setTab("montador");
        setMobileSummaryOpen(false);
        setMoneyDrafts({});
        syncBuilderSavedState(
          normalizedDuplicatedPayload,
          normalizedDuplicatedPayload.lastStep,
          duplicatedContrato.updated_at || duplicatedContrato.created_at,
        );

        await runContractRealtimeSideEffects({
          contract: duplicatedContrato,
          event: {
            tipo: "duplicado",
            titulo: "Proposta duplicada",
            descricao: `A nova proposta foi criada a partir de "${contrato.titulo}".`,
            actorType: "admin",
            meta: { original_contract_id: contrato.id },
          },
        });

        toast({
          title: "Proposta duplicada",
          description: "A cópia já foi aberta no montador para edição.",
        });
      } catch (error) {
        toast({
          title: "Erro ao duplicar proposta",
          description: getContractErrorMessage(error, "Não foi possível duplicar o contrato."),
          variant: "destructive",
        });
      }
    },
    [
      extrasCatalogo,
      extrasLoaded,
      runContractRealtimeSideEffects,
      saveBuilderContractDirectly,
      syncBuilderSavedState,
      toast,
      upsertContratoState,
    ],
  );

  const handleDeleteDraft = useCallback(async () => {
    if (!deleteTarget) return;

    const target = deleteTarget;
    try {
      await deleteBuilderDraftContract(target.id);

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
      removeContratoState(target.id);
      toast({ title: "Rascunho excluído do cofre" });
    } catch (error) {
      toast({
        title: "Erro ao excluir rascunho",
        description: getContractErrorMessage(error, "Não foi possível excluir o rascunho."),
        variant: "destructive",
      });
    }
  }, [deleteTarget, editingBuilderContract?.id, extrasCatalogo, extrasLoaded, removeContratoState, syncBuilderSavedState, toast, versionsContract?.id]);

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
        const updatedContrato = await sendBuilderContractToClientDirectly(target);

        setEditingBuilderContract((current) =>
          current?.id === updatedContrato.id ? updatedContrato : current,
        );
        upsertContratoState(updatedContrato);

        toast({
          title:
            target.status === "enviado" || target.status === "visualizado"
              ? "Contrato enviado atualizado"
              : "Contrato enviado ao cliente",
          description: "O contrato já está disponível no portal do cliente para visualização e download.",
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
    [editingBuilderContract, sendBuilderContractToClientDirectly, toast, upsertContratoState],
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
    setBuilderRemoteAutosaveState("saved");
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
      contract: contrato,
    });
  };

  const handleBuilderClientChange = async (clienteId: string) => {
    const cliente = clientes.find((item) => item.id === clienteId);
    const currentPayload = getWorkingBuilderPayload();
    if (!cliente || !currentPayload) return;

    setSyncingClientExtras(true);
    try {
      const activeClientExtras = await fetchActiveClientExtras(clienteId);
      const clientExtrasSnapshot = activeClientExtras.map(mapClientExtraToSnapshot);
      const nextItems = currentPayload.items.filter((item) => item.isPrimaryPlan);
      const nextPricing = recalculateBuilderPricing(
        nextItems,
        currentPayload.pricing,
        clientExtrasSnapshot,
      );

      setBuilderPayload({
        ...currentPayload,
        clienteId,
        contractante: buildContractanteFromClient(cliente),
        items: nextItems,
        clientExtrasSnapshot,
        pricing: nextPricing,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      toast({
        title: "Erro ao sincronizar extras do cliente",
        description: getContractErrorMessage(error, "Não foi possível carregar os extras ativos deste cliente."),
        variant: "destructive",
      });
    } finally {
      setSyncingClientExtras(false);
    }
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
    const nextPricing = recalculateBuilderPricing(
      nextItems,
      currentPayload.pricing,
      currentPayload.clientExtrasSnapshot,
    );

    setBuilderPayload({
      ...currentPayload,
      primaryPlanId: planId,
      items: nextItems,
      pricing: nextPricing,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleBuilderDiscountTypeChange = (discountType: ContractBuilderPricing["discountType"]) => {
    const currentPayload = getWorkingBuilderPayload();
    if (!currentPayload) return;

    setBuilderPayload({
      ...currentPayload,
      pricing: recalculateBuilderPricing(
        currentPayload.items,
        {
          ...currentPayload.pricing,
          discountType,
        },
        currentPayload.clientExtrasSnapshot,
      ),
      updatedAt: new Date().toISOString(),
    });
  };

  const handleBuilderPricingChange = (
    field: "discountValue" | "entryValue" | "negotiatedMonthly",
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
          const hasLegacyExtraSelection = currentPayload.items.some(
            (item) => !item.isPrimaryPlan && item.selected,
          );
          if (currentPayload.primaryPlanId === "none" && !hasLegacyExtraSelection) {
            return "Selecione um dos planos para montar o contrato.";
          }
          if (currentPayload.primaryPlanId === "sob-medida" && !currentPayload.customScope.trim()) {
            return "Descreva o escopo customizado para propostas Sob Medida.";
          }
          return null;
        }
        case 3:
          if (!currentPayload.prazoDias.trim()) return "Informe o prazo estimado da proposta.";
          if (!currentPayload.formaPagamento.trim()) return "Informe a forma de pagamento.";
          if (currentPayload.pricing.entryValue > currentPayload.pricing.finalSetupTotal) {
            return "A entrada não pode ser maior que o valor final da implantação.";
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

  const persistBuilderDraft = useCallback(async ({
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
    const isResignAlreadyPending = Boolean((editingBuilderContract as any)?.requer_reassinatura);

    const shouldRequireResignature = Boolean(
      editingBuilderContract &&
        requireCompleteValidation &&
        !autosaveRemote &&
        (editingBuilderContract.status === "assinado" ||
          (editingBuilderContract as any).requer_reassinatura) &&
        hasSignedContractMaterialChanges(editingBuilderContract, prepared, extrasCatalogo),
    );

    saveBuilderRecoveryLocally(
      prepared.normalizedPayload,
      prepared.normalizedPayload.lastStep,
      recoveryOrigin,
    );

    const nowIso = new Date().toISOString();
    const persistedStatus =
      shouldRequireResignature
        ? "enviado"
        : editingBuilderContract?.status && editingBuilderContract.status !== "cancelado"
          ? editingBuilderContract.status
        : "rascunho";
    const payloadToPersist = {
      cliente_id: prepared.normalizedPayload.clienteId || null,
      titulo: prepared.title,
      descricao: prepared.description,
      valor: prepared.value,
      status: persistedStatus,
      corpo: prepared.body,
      modelo: BUILDER_TEMPLATE_ID,
      builder_payload: prepared.normalizedPayload as any,
      assinatura_admin: null,
      assinatura_cliente: shouldRequireResignature ? null : editingBuilderContract?.assinatura_cliente ?? null,
      assinatura_cliente_nome: shouldRequireResignature ? null : editingBuilderContract?.assinatura_cliente_nome ?? null,
      assinatura_cliente_email: shouldRequireResignature ? null : editingBuilderContract?.assinatura_cliente_email ?? null,
      data_envio: shouldRequireResignature ? nowIso.slice(0, 10) : editingBuilderContract?.data_envio ?? nowIso.slice(0, 10),
      data_visualizacao: shouldRequireResignature ? null : editingBuilderContract?.data_visualizacao ?? null,
      data_assinatura: shouldRequireResignature ? null : editingBuilderContract?.data_assinatura ?? null,
      requer_reassinatura: shouldRequireResignature ? true : isResignAlreadyPending,
      reassinatura_motivo: shouldRequireResignature
        ? RESIGN_REASON_DEFAULT
        : isResignAlreadyPending
          ? (editingBuilderContract as any)?.reassinatura_motivo || RESIGN_REASON_DEFAULT
          : null,
      updated_at: nowIso,
    };

    try {
      if (autosaveRemote) {
        setBuilderRemoteAutosaveState("saving");
      }
      const savedContrato = await saveBuilderContractDirectly({
        contractId: editingBuilderContract?.id ?? null,
        payloadToPersist,
        createVersionSnapshot: !autosaveRemote,
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
      upsertContratoState(savedContrato);
      if (!autosaveRemote) {
        await runContractRealtimeSideEffects({
          contract: savedContrato,
          event: {
            tipo: shouldRequireResignature
              ? "reassinatura_pendente"
              : requireCompleteValidation
                ? "cofre_salvo"
                : "rascunho_salvo",
            titulo: shouldRequireResignature
              ? "Nova assinatura solicitada"
              : requireCompleteValidation
              ? editingBuilderContract
                ? "Contrato atualizado no cofre"
                : "Contrato salvo no cofre"
              : editingBuilderContract
                ? "Rascunho atualizado"
                : "Rascunho salvo",
            descricao: shouldRequireResignature
              ? RESIGN_REASON_DEFAULT
              : requireCompleteValidation
              ? "A proposta comercial foi consolidada no cofre do Contrato Mestre."
              : "O montador foi salvo como rascunho para continuar depois.",
            actorType: "admin",
            meta: {
              status: savedContrato.status,
              autosave: false,
              requires_resign: shouldRequireResignature,
            },
          },
          clientNotification: shouldRequireResignature
            ? {
                title: "✍️ Assinatura pendente",
                body: RESIGN_REASON_DEFAULT,
                url: "/cliente/contratos",
              }
            : undefined,
        });
      }
      if (!autosaveRemote) {
        clearContractRecoverySnapshot();
      }
      if (!silent) {
        toast({
          title: exitAfterSave
            ? editingBuilderContract
              ? "Rascunho atualizado. Você pode continuar depois."
              : "Rascunho salvo. Você pode continuar depois."
            : shouldRequireResignature
              ? "Contrato atualizado. Nova assinatura solicitada."
            : editingBuilderContract
              ? "Contrato mestre atualizado!"
            : "Contrato mestre salvo no cofre!",
        });
      }
      if (autosaveRemote) {
        setBuilderRemoteAutosaveState("saved");
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
      if (autosaveRemote) {
        setBuilderRemoteAutosaveState("error");
      }
      return false;
    }

    if (exitAfterSave) {
      setMobileSummaryOpen(false);
      setTab("lista");
    }

    return true;
  }, [
    builderStep,
    editingBuilderContract,
    extrasCatalogo,
    saveBuilderContractDirectly,
    saveBuilderRecoveryLocally,
    syncBuilderSavedState,
    syncMoneyDraftsToState,
    toast,
    runContractRealtimeSideEffects,
    upsertContratoState,
    validateBuilderAll,
  ]);

  const handleSaveBuilder = async () => {
    await persistBuilderDraft({ requireCompleteValidation: true });
  };

  const handleSaveBuilderAndExit = async () => {
    await persistBuilderDraft({ exitAfterSave: true });
  };

  useEffect(() => {
    if (!workingBuilderPayload) return;
    if (!workingBuilderPayload.clienteId) return;
    if (!hasMeaningfulBuilderState(workingBuilderPayload) && !editingBuilderContract?.id) return;

    const payloadSignature = buildBuilderDirtySignature(workingBuilderPayload, builderStep);
    if (contractRemoteAutosaveSignatureRef.current === payloadSignature) return;
    if (builderRemoteAutosaveState === "saving") return;

    const timer = window.setTimeout(() => {
      void persistBuilderDraft({
        silent: true,
        autosaveRemote: true,
      });
    }, editingBuilderContract?.id ? 2200 : 1400);

    return () => window.clearTimeout(timer);
  }, [
    builderRemoteAutosaveState,
    builderStep,
    editingBuilderContract?.id,
    persistBuilderDraft,
    workingBuilderPayload,
  ]);

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
    if (!currentPayload.clienteId) {
      toast({
        title: "Selecione um cliente primeiro",
        description: "Os extras automáticos são carregados a partir do cadastro do cliente.",
        variant: "destructive",
      });
      return;
    }

    setSyncingClientExtras(true);
    try {
      const previousIds = new Set(currentPayload.clientExtrasSnapshot.map((item) => item.id));
      const activeClientExtras = await fetchActiveClientExtras(currentPayload.clienteId);
      const clientExtrasSnapshot = activeClientExtras.map(mapClientExtraToSnapshot);
      const nextItems = currentPayload.items.filter((item) => item.isPrimaryPlan);
      const nextPricing = recalculateBuilderPricing(
        nextItems,
        currentPayload.pricing,
        clientExtrasSnapshot,
      );
      const newExtraCount = clientExtrasSnapshot.filter((item) => !previousIds.has(item.id)).length;

      setBuilderPayload({
        ...currentPayload,
        items: nextItems,
        clientExtrasSnapshot,
        pricing: nextPricing,
        updatedAt: new Date().toISOString(),
      });
      setMoneyDrafts({});

      toast({
        title: "Extras sincronizados",
        description:
          newExtraCount > 0
            ? `${newExtraCount} novo(s) extra(s) ativo(s) foram puxados do cadastro do cliente.`
            : "Os extras do contrato foram atualizados com o cadastro atual do cliente.",
      });
    } catch (error) {
      toast({
        title: "Erro ao atualizar extras",
        description: getContractErrorMessage(error, "Não foi possível sincronizar os extras ativos do cliente."),
        variant: "destructive",
      });
    } finally {
      setSyncingClientExtras(false);
    }
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
    if (builderRemoteAutosaveState === "saving") {
      return {
        tone: "syncing" as const,
        title: "Sincronizando rascunho",
        subtitle: "O cofre está recebendo a versão mais recente da proposta.",
      };
    }

    if (builderHasUnsavedChanges) {
      return {
        tone: "warning" as const,
        title: "Alterações não salvas",
        subtitle: "O autosave local protege a proposta. O cofre será sincronizado em seguida.",
      };
    }

    if (builderRemoteAutosaveState === "error") {
      return {
        tone: "warning" as const,
        title: "Falha de sincronização",
        subtitle: "O rascunho local foi preservado. Tente salvar novamente para atualizar o cofre.",
      };
    }

    if (builderLastSavedAt) {
      const formattedClock = formatContractClock(builderLastSavedAt);
      return {
        tone: "saved" as const,
        title: editingBuilderContract ? "Sincronizado com o cofre" : "Rascunho salvo",
        subtitle: formattedClock ? `Sincronizado às ${formattedClock}` : "Salvo no cofre",
      };
    }

    return {
      tone: "new" as const,
      title: "Novo rascunho",
      subtitle: "Ainda não existe uma proposta salva no cofre.",
    };
  }, [builderHasUnsavedChanges, builderLastSavedAt, builderRemoteAutosaveState, editingBuilderContract]);

  const filteredContratos = useMemo(
    () =>
      contratos.filter((contrato) => {
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
      }),
    [cofreFilter, cofreStatusFilter, contratos, searchTerm],
  );

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

  const cofreDashboardCards = useMemo(() => {
    const activeContracts = contratos.filter((contrato) => !contrato.archived_at);
    const sentContracts = activeContracts.filter((contrato) => contrato.status === "enviado");
    const viewedContracts = activeContracts.filter((contrato) => contrato.status === "visualizado");
    const signedContracts = activeContracts.filter((contrato) => contrato.status === "assinado");
    const pipelineValue = activeContracts.reduce((sum, contrato) => sum + Number(contrato.valor || 0), 0);
    const signedValue = signedContracts.reduce((sum, contrato) => sum + Number(contrato.valor || 0), 0);

    return [
      {
        key: "pipeline",
        label: "Pipeline ativo",
        value: activeContracts.length,
        helper: `R$ ${formatContratoValue(pipelineValue)}`,
        gradient: "from-[#7b1fa2]/35 via-[#c2185b]/20 to-[#e8334a]/25",
      },
      {
        key: "sent",
        label: "Enviados aguardando leitura",
        value: sentContracts.length,
        helper: "Prontos no portal do cliente",
        gradient: "from-emerald-500/25 via-emerald-400/10 to-[#c2185b]/15",
      },
      {
        key: "viewed",
        label: "Visualizados aguardando assinatura",
        value: viewedContracts.length,
        helper: "Momento ideal para follow-up",
        gradient: "from-[#c2185b]/30 via-[#e8334a]/15 to-[#7b1fa2]/15",
      },
      {
        key: "signed",
        label: "Assinados",
        value: signedContracts.length,
        helper: `R$ ${formatContratoValue(signedValue)}`,
        gradient: "from-emerald-500/25 via-[#7b1fa2]/12 to-[#c2185b]/18",
      },
    ];
  }, [contratos]);

  const builderClientExtras = useMemo(
    () => (workingBuilderPayload ? getContractExtraSnapshots(workingBuilderPayload) : []),
    [workingBuilderPayload],
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

  const selectedItemsCount = workingBuilderPayload ? countSelectedBuilderEntries(workingBuilderPayload) : 0;
  const builderProgress = ((builderStep + 1) / BUILDER_STEPS.length) * 100;

  return (
    <motion.div
      className="relative space-y-6"
      initial="hidden"
      animate="show"
      variants={{ show: { transition: { staggerChildren: 0.08 } } }}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px] bg-[radial-gradient(circle_at_top_left,rgba(123,31,162,0.24),transparent_34%),radial-gradient(circle_at_top_right,rgba(232,51,74,0.18),transparent_36%),radial-gradient(circle_at_center,rgba(194,24,91,0.14),transparent_48%)] blur-3xl" />
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
            <Card className="glass-card overflow-hidden border-[0.5px] border-fuchsia-400/15 bg-[linear-gradient(180deg,rgba(17,15,24,0.98),rgba(17,15,24,0.9))]">
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
                  <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[hsl(var(--muted-foreground))]" />
                    <Input
                      placeholder="Buscar contrato mestre..."
                      value={searchTerm}
                      onChange={(event) => setSearchTerm(event.target.value)}
                      className="pl-9 glass-input border-[rgba(255,255,255,0.1)] text-[hsl(var(--foreground))] text-xs h-9"
                    />
                  </div>
                </div>
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4 pt-2">
                  {cofreDashboardCards.map((card) => (
                    <div
                      key={card.key}
                      className={`rounded-[24px] border border-white/10 bg-gradient-to-br ${card.gradient} p-4 shadow-[0_18px_36px_rgba(18,10,28,0.24)] backdrop-blur-xl`}
                    >
                      <p className="text-[10px] uppercase tracking-[0.18em] text-white/45">{card.label}</p>
                      <p className="mt-3 text-2xl font-semibold text-white">{card.value}</p>
                      <p className="mt-2 text-xs text-white/55">{card.helper}</p>
                    </div>
                  ))}
                </div>
                <div className="space-y-3 pt-2">
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
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Button
                      size="sm"
                      variant="outline"
                      className={`border-white/10 text-xs ${
                        cofreStatusFilter === "todos"
                          ? "bg-white/10 text-white"
                          : "bg-white/[0.03] text-white/65 hover:bg-white/10"
                      }`}
                      onClick={() => setCofreStatusFilter("todos")}
                    >
                      Todos ({contratos.length})
                    </Button>
                    {CONTRACT_STATUS_ORDER.map((status) => (
                      <Button
                        key={status}
                        size="sm"
                        variant="outline"
                        className={`border-white/10 text-xs ${
                          cofreStatusFilter === status
                            ? `${getContractStatusBadgeClass(status)}`
                            : "bg-white/[0.03] text-white/65 hover:bg-white/10"
                        }`}
                        onClick={() => setCofreStatusFilter(status)}
                      >
                        {getContractStatusLabel(status)} ({contractStatusCounts[status] || 0})
                      </Button>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {filteredContratos.map((contrato) => (
                  (() => {
                    const statusInsight = getContractStatusInsight({
                      status: contrato.status,
                      dataEnvio: contrato.data_envio,
                      dataVisualizacao: contrato.data_visualizacao,
                      dataAssinatura: contrato.data_assinatura,
                      onboardingStartedAt: (contrato as any).onboarding_started_at,
                      pedidoId: (contrato as any).pedido_id,
                      requiresResign: (contrato as any).requer_reassinatura,
                      resignReason: (contrato as any).reassinatura_motivo,
                    });

                    return (
                  <motion.div
                    key={contrato.id}
                    whileHover={shouldReduceMotion ? undefined : { y: -4, scale: 1.003 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                    className="rounded-[28px] border border-white/10 bg-[linear-gradient(145deg,rgba(123,31,162,0.18),rgba(232,51,74,0.1),rgba(255,255,255,0.04))] p-4 shadow-[0_22px_48px_rgba(26,8,40,0.3)] backdrop-blur-xl"
                  >
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                      <div className="min-w-0 space-y-4">
                        <div className="flex items-start gap-3 cursor-pointer" onClick={() => handleViewContrato(contrato)}>
                          <div className="mt-1 rounded-2xl border border-white/10 bg-white/[0.05] p-2">
                            <FileText className="w-4 h-4 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-sm font-semibold text-[hsl(var(--foreground))] truncate">{contrato.titulo}</p>
                              <Badge variant="outline" className={getContractStatusBadgeClass(contrato.status)}>
                                {getContractStatusLabel(contrato.status)}
                              </Badge>
                              {(contrato as any).requer_reassinatura && (
                                <Badge
                                  variant="outline"
                                  className="border-amber-300/20 bg-amber-300/10 text-amber-100"
                                >
                                  Assinatura pendente
                                </Badge>
                              )}
                              {contrato.archived_at && (
                                <Badge variant="outline" className="border-amber-300/10 px-2 bg-amber-300/10 text-amber-200">
                                  Arquivado
                                </Badge>
                              )}
                            </div>
                            <div className="mt-2 flex items-center gap-2 flex-wrap text-[11px] text-[hsl(var(--muted-foreground))]">
                              <span>{(contrato.clientes as any)?.nome || "Cliente"}</span>
                              <span>•</span>
                              <span>Valor: R$ {formatContratoValue(contrato.valor)}</span>
                              <span>•</span>
                              <span>{formatContractDateTime(contrato.updated_at || contrato.created_at)}</span>
                            </div>
                            <div className="mt-2 rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2">
                              <p className="text-xs font-medium text-white">{statusInsight.title}</p>
                              <p className="mt-1 text-[11px] text-white/45">{statusInsight.subtitle}</p>
                            </div>
                          </div>
                        </div>
                        <ContractLifecycleTimeline
                          status={contrato.status}
                          dataEnvio={contrato.data_envio}
                          dataVisualizacao={contrato.data_visualizacao}
                          dataAssinatura={contrato.data_assinatura}
                        />
                      </div>
                      <div className="flex items-center gap-2 flex-wrap justify-end xl:max-w-[260px] xl:justify-start">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-primary hover:text-primary text-xs h-8 px-3"
                          title="Abrir montador"
                          onClick={() => openBuilderContract(contrato)}
                        >
                          <FilePenLine className="w-3.5 h-3.5 mr-1.5" /> Editar
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-white/60 hover:text-white text-xs h-8 px-3"
                          title="Ver contrato"
                          onClick={() => handleViewContrato(contrato)}
                        >
                          <Lock className="w-3.5 h-3.5 mr-1.5" /> Visualizar
                        </Button>
                        {!contrato.archived_at && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-emerald-300/20 bg-emerald-300/10 text-emerald-100 hover:bg-emerald-300/20"
                            onClick={() => void handleSendContractToClient(contrato)}
                          >
                            <Send className="w-3.5 h-3.5 mr-1.5" />
                            {(contrato as any).requer_reassinatura
                              ? "Solicitar nova assinatura"
                              : contrato.status === "assinado"
                              ? "Reenviar cópia"
                              : contrato.status === "enviado" || contrato.status === "visualizado"
                                ? "Atualizar envio"
                                : "Enviar"}
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-white/60 hover:text-white text-xs h-8 px-3"
                          title="Baixar PDF"
                          onClick={() =>
                            generateContractPDF(
                              contrato.titulo,
                              (contrato as any).corpo || contrato.descricao || "",
                              {
                                assinaturaAdmin: (contrato as any).assinatura_admin,
                                assinaturaCliente: (contrato as any).assinatura_cliente,
                                contractanteSignedName: contrato.assinatura_cliente_nome,
                                signedAt: contrato.data_assinatura,
                                proposal: normalizeBuilderPayload(contrato.builder_payload, extrasCatalogo, contrato.cliente_id),
                              },
                            )
                          }
                        >
                          <Download className="w-3.5 h-3.5 mr-1.5" /> PDF
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-white/60 hover:text-white text-xs h-8 px-3"
                              title="Mais ações"
                            >
                              <MoreHorizontal className="w-3.5 h-3.5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuItem onClick={() => void handleDuplicateContract(contrato)}>
                              <Boxes className="w-4 h-4 mr-2" /> Duplicar proposta
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleOpenVersions(contrato)}>
                              <History className="w-4 h-4 mr-2" /> Histórico de versões
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                downloadWordDocument(
                                  contrato.titulo,
                                  (contrato as any).corpo || contrato.descricao || "",
                                  normalizeBuilderPayload(contrato.builder_payload, extrasCatalogo, contrato.cliente_id),
                                  {
                                    contractanteSignedName: contrato.assinatura_cliente_nome,
                                    signedAt: contrato.data_assinatura,
                                  },
                                )
                              }
                            >
                              <FileText className="w-4 h-4 mr-2" /> Baixar Word
                            </DropdownMenuItem>
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
                      </div>
                    </div>
                      </motion.div>
                      );
                  })()
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
                              : builderStatusLabel.tone === "syncing"
                                ? "border-fuchsia-300/20 bg-fuchsia-300/10 text-fuchsia-100"
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
                              ? "border-fuchsia-300/25 bg-[linear-gradient(135deg,rgba(123,31,162,0.24),rgba(232,51,74,0.14),rgba(194,24,91,0.16))] shadow-[0_16px_32px_rgba(194,24,91,0.16)]"
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
                className="overflow-hidden rounded-[28px] border border-fuchsia-400/15 bg-[linear-gradient(180deg,rgba(17,15,24,0.96),rgba(17,15,24,0.9))] shadow-[0_24px_60px_rgba(47,11,64,0.42)] backdrop-blur-xl"
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
                    <span className="text-xs text-rose-200">{mobileSummaryOpen ? "Recolher" : "Expandir"}</span>
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
                      <BuilderLiveSummary
                        summary={builderSummary}
                        selectedCount={selectedItemsCount}
                        syncState={builderRemoteAutosaveState}
                        contractStatus={editingBuilderContract?.status}
                        contractDates={{
                          dataEnvio: editingBuilderContract?.data_envio,
                          dataVisualizacao: editingBuilderContract?.data_visualizacao,
                          dataAssinatura: editingBuilderContract?.data_assinatura,
                          requiresResign: (editingBuilderContract as any)?.requer_reassinatura,
                          resignReason: (editingBuilderContract as any)?.reassinatura_motivo,
                        }}
                      />
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
                                  Escolha um dos 3 planos oficiais. Os extras ativos do cliente entram automaticamente na proposta.
                                </CardDescription>
                              </CardHeader>
                              <CardContent className="space-y-4">
                                <RadioGroup
                                  value={builderPayload.primaryPlanId}
                                  onValueChange={(value) => handlePrimaryPlanChange(value as BuilderPrimaryPlanId)}
                                  className="space-y-4"
                                >
                                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                    {PUBLIC_PLAN_CATALOG.map((plan) => {
                                      const selected = builderPayload.primaryPlanId === plan.id;
                                      return (
                                        <Label
                                          key={plan.id}
                                          htmlFor={`plan-${plan.id}`}
                                          className={`rounded-2xl border p-5 cursor-pointer space-y-4 transition-all ${
                                            selected
                                              ? "border-fuchsia-300/25 bg-[linear-gradient(135deg,rgba(123,31,162,0.24),rgba(232,51,74,0.14),rgba(194,24,91,0.16))] shadow-[0_18px_36px_rgba(194,24,91,0.16)]"
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
                                    <CardTitle className="text-sm text-white">Extras ativos do cliente</CardTitle>
                                    <CardDescription className="text-xs text-white/45">
                                      O contrato puxa os extras ativos do cadastro do cliente. Quando houver mudança no cadastro, sincronize manualmente este rascunho.
                                    </CardDescription>
                                  </div>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-white/10 bg-white/5 text-white hover:bg-white/10"
                                    onClick={handleRefreshBuilderExtras}
                                    disabled={!builderPayload.clienteId || syncingClientExtras}
                                  >
                                    <RefreshCw className={`w-3.5 h-3.5 mr-2 ${syncingClientExtras ? "animate-spin" : ""}`} />
                                    {syncingClientExtras ? "Sincronizando" : "Atualizar extras"}
                                  </Button>
                                </div>
                              </CardHeader>
                              <CardContent className="space-y-5">
                                {!builderPayload.clienteId ? (
                                  <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-6 text-sm text-white/45">
                                    Selecione um cliente para carregar os extras ativos automaticamente.
                                  </div>
                                ) : builderClientExtras.length > 0 ? (
                                  <div className="space-y-3">
                                    {builderClientExtras.map((item) => (
                                      <div
                                        key={item.id}
                                        className="rounded-2xl border border-fuchsia-300/15 bg-[linear-gradient(135deg,rgba(123,31,162,0.16),rgba(232,51,74,0.08),rgba(194,24,91,0.1))] p-4"
                                      >
                                        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                                          <div className="space-y-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                              <p className="text-sm font-medium text-white">{item.name}</p>
                                              <Badge variant="outline" className="border-white/10 text-white/60">
                                                {item.typeLabel === "mensal" ? "Mensal" : "Único"}
                                              </Badge>
                                            </div>
                                            <p className="text-xs text-white/50 leading-relaxed">
                                              {item.description || "Sem descrição adicional."}
                                            </p>
                                          </div>
                                          <div className="text-right space-y-1 min-w-[180px]">
                                            <p className="text-xs uppercase tracking-[0.18em] text-white/35">Snapshot do contrato</p>
                                            <p className="text-sm font-medium text-white">{describeClientExtraPricing(item)}</p>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-6 text-sm text-white/45">
                                    Nenhum extra ativo encontrado no cadastro deste cliente.
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          </div>
                        )}

                        {builderStep === 3 && (
                          <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                              <Card className="bg-white/[0.03] border-white/10">
                                <CardContent className="p-5 space-y-2">
                                  <p className="text-[10px] uppercase tracking-[0.18em] text-white/35">Subtotal implantação</p>
                                  <AnimatedValue
                                    value={workingBuilderPayload?.pricing.setupSubtotal || builderPayload.pricing.setupSubtotal}
                                    format={formatCurrencyBRL}
                                    className="block text-2xl font-semibold text-white"
                                  />
                                </CardContent>
                              </Card>
                              <Card className="bg-white/[0.03] border-white/10">
                                <CardContent className="p-5 space-y-2">
                                  <p className="text-[10px] uppercase tracking-[0.18em] text-white/35">Desconto</p>
                                  <AnimatedValue
                                    value={workingBuilderPayload?.pricing.discountAmount || builderPayload.pricing.discountAmount}
                                    format={formatCurrencyBRL}
                                    className="block text-2xl font-semibold text-white"
                                  />
                                </CardContent>
                              </Card>
                              <Card className="bg-white/[0.03] border-primary/20">
                                <CardContent className="p-5 space-y-2">
                                  <p className="text-[10px] uppercase tracking-[0.18em] text-white/35">Valor final</p>
                                  <AnimatedValue
                                    value={workingBuilderPayload?.pricing.finalSetupTotal || builderPayload.pricing.finalSetupTotal}
                                    format={formatCurrencyBRL}
                                    className="block text-2xl font-semibold text-white"
                                  />
                                </CardContent>
                              </Card>
                              <Card className="bg-white/[0.03] border-white/10">
                                <CardContent className="p-5 space-y-2">
                                  <p className="text-[10px] uppercase tracking-[0.18em] text-white/35">Mensalidade</p>
                                  <AnimatedValue
                                    value={workingBuilderPayload?.pricing.finalMonthlyTotal || builderPayload.pricing.finalMonthlyTotal}
                                    format={formatCurrencyBRL}
                                    className="block text-2xl font-semibold text-white"
                                  />
                                </CardContent>
                              </Card>
                            </div>

                            <Card className="bg-white/[0.03] border-primary/20">
                              <CardHeader>
                                <CardTitle className="text-sm text-white flex items-center gap-2">
                                  <CircleDollarSign className="w-4 h-4 text-primary" /> Totais e pagamento
                                </CardTitle>
                                <CardDescription className="text-xs text-white/45">
                                  O valor é calculado automaticamente com base no plano, nos extras ativos do cliente e no desconto aplicado.
                                </CardDescription>
                              </CardHeader>
                              <CardContent className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                  <Label className="text-xs text-white/55">Tipo de desconto</Label>
                                  <Select
                                    value={builderPayload.pricing.discountType}
                                    onValueChange={(value) =>
                                      handleBuilderDiscountTypeChange(value as ContractBuilderPricing["discountType"])
                                    }
                                  >
                                    <SelectTrigger className="glass-input border-white/10 text-white">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="fixed">Valor fixo</SelectItem>
                                      <SelectItem value="percentage">Porcentagem</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-xs text-white/55">
                                    {builderPayload.pricing.discountType === "percentage"
                                      ? "Desconto (%)"
                                      : "Desconto (R$)"}
                                  </Label>
                                  <Input
                                    value={getMoneyInputDisplayValue(
                                      buildPricingMoneyDraftKey("discountValue"),
                                      builderPayload.pricing.discountValue,
                                    )}
                                    onChange={(event) => handleBuilderPricingChange("discountValue", event.target.value)}
                                    onBlur={() => commitMoneyDraft(buildPricingMoneyDraftKey("discountValue"))}
                                    className="glass-input border-white/10 text-white"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-xs text-white/55">Subtotal da implantação</Label>
                                  <Input
                                    value={formatMoneyInputValue(
                                      workingBuilderPayload?.pricing.setupSubtotal || builderPayload.pricing.setupSubtotal,
                                    )}
                                    readOnly
                                    className="glass-input border-white/10 text-white/75"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-xs text-white/55">Valor final da implantação</Label>
                                  <Input
                                    value={formatMoneyInputValue(
                                      workingBuilderPayload?.pricing.finalSetupTotal || builderPayload.pricing.finalSetupTotal,
                                    )}
                                    readOnly
                                    className="glass-input border-white/10 text-white/75"
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
                                  <Label className="text-xs text-white/55">Mensalidade final</Label>
                                  <Input
                                    value={formatMoneyInputValue(
                                      workingBuilderPayload?.pricing.finalMonthlyTotal || builderPayload.pricing.finalMonthlyTotal,
                                    )}
                                    readOnly
                                    className="glass-input border-white/10 text-white/75"
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
                                  signatureSummary={buildContractSignatureSummary(builderPrepared.normalizedPayload)}
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
                                {editingBuilderContract?.status === "assinado"
                                  ? "Reenviar cópia ao cliente"
                                  : editingBuilderContract?.status === "enviado" || editingBuilderContract?.status === "visualizado"
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
                  <BuilderLiveSummary
                    summary={builderSummary}
                    selectedCount={selectedItemsCount}
                    syncState={builderRemoteAutosaveState}
                    contractStatus={editingBuilderContract?.status}
                    contractDates={{
                      dataEnvio: editingBuilderContract?.data_envio,
                      dataVisualizacao: editingBuilderContract?.data_visualizacao,
                      dataAssinatura: editingBuilderContract?.data_assinatura,
                      onboardingStartedAt: (editingBuilderContract as any)?.onboarding_started_at,
                      pedidoId: (editingBuilderContract as any)?.pedido_id,
                      requiresResign: (editingBuilderContract as any)?.requer_reassinatura,
                      resignReason: (editingBuilderContract as any)?.reassinatura_motivo,
                    }}
                  />
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(123,31,162,0.24),transparent_24%),radial-gradient(circle_at_top_right,rgba(232,51,74,0.18),transparent_28%),rgba(17,15,24,0.97)] shadow-[0_30px_90px_rgba(9,4,16,0.56)]">
          <DialogHeader>
            <DialogTitle className="text-white text-base">
              {previewState?.title || "Preview do contrato mestre"}
            </DialogTitle>
          </DialogHeader>

          {previewState && (
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
              <BuilderPreviewDocument
                title={previewState.title}
                body={previewState.body}
                summary={previewState.proposal ? buildProposalSummary(previewState.proposal) : null}
                signatureSummary={buildContractSignatureSummary(previewState.proposal, {
                  contractanteSignedName: previewState.contract?.assinatura_cliente_nome,
                  signedAt: previewState.contract?.data_assinatura,
                })}
                explanations={previewState.proposal ? buildContractClauseExplanations(previewState.proposal) : []}
              />
              {previewState.contract?.id ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.18em] text-white/35">Painel operacional</p>
                    <p className="text-sm text-white/55">Status ao vivo, assinatura e histórico deste contrato.</p>
                  </div>
                  <Card className="overflow-hidden border-white/10 bg-[linear-gradient(145deg,rgba(123,31,162,0.22),rgba(232,51,74,0.14),rgba(255,255,255,0.04))] shadow-[0_20px_44px_rgba(16,8,24,0.34)]">
                    <CardContent className="space-y-4 p-5">
                      <div className="space-y-1">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">Situação da versão</p>
                        <p className="text-sm font-medium text-white">
                          {previewState.contract.status === "assinado"
                            ? "Contrato assinado e registrado"
                            : (previewState.contract as any).requer_reassinatura
                              ? "Nova assinatura solicitada"
                              : "Contrato em acompanhamento"}
                        </p>
                      </div>
                      <ContractSignedStatusBadge
                        signedName={previewState.contract.assinatura_cliente_nome}
                        signedAt={previewState.contract.data_assinatura}
                        variant="dark"
                      />
                      <p className="text-xs leading-relaxed text-white/50">
                        A assinatura aparece apenas no bloco final do contrato. Aqui ficam somente metadados operacionais.
                      </p>
                    </CardContent>
                  </Card>
                  <ContractActivityFeed
                    events={previewContractEvents}
                    loading={previewContractEventsLoading}
                    emptyLabel="Ainda não existe atividade operacional registrada para este contrato."
                  />
                </div>
              ) : null}
            </div>
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
