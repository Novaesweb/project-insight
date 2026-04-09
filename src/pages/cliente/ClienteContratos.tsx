import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, ClipboardList, Download, Eye, FileText, Lock, PenSquare, ShieldCheck, Vault } from "lucide-react";
import jsPDF from "jspdf";

import { ContractActivityFeed } from "@/components/contracts/ContractActivityFeed";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useContractEventsRealtime } from "@/hooks/useContractEventsRealtime";
import { useContractsRealtime } from "@/hooks/useContractsRealtime";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import {
  buildContractSignatureSummary,
  stripLegacySignaturePlaceholders,
  type ContractSignatureSummary,
} from "@/lib/contract-builder";
import {
  CONTRACT_STATUS_ORDER,
  getContractStatusBadgeClass,
  getContractStatusInsight,
  getContractStatusLabel,
} from "@/lib/contract-status";
import type { ContractEventRow } from "@/lib/contract-activity";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

type ContratoCliente = Tables<"contratos">;

function generatePDF(contrato: ContratoCliente) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const maxWidth = pageWidth - margin * 2;
  const cleanedBody = stripLegacySignaturePlaceholders(contrato.corpo || contrato.descricao || "");
  const signatureSummary = buildContractSignatureSummary((contrato.builder_payload as any) || null, {
    contractanteSignedName: contrato.assinatura_cliente_nome,
    signedAt: contrato.data_assinatura,
  });

  doc.setFillColor(123, 31, 162);
  doc.rect(0, 0, pageWidth / 3, 12, "F");
  doc.setFillColor(232, 51, 74);
  doc.rect(pageWidth / 3, 0, pageWidth / 3, 12, "F");
  doc.setFillColor(194, 24, 91);
  doc.rect((pageWidth / 3) * 2, 0, pageWidth / 3, 12, "F");

  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8.5);
  doc.text("NovaesWeb • Contrato liberado no portal", margin, 8);

  doc.setTextColor(22, 18, 29);
  doc.setFontSize(14);
  doc.text(contrato.titulo, margin, 24);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  const lines = doc.splitTextToSize(cleanedBody, maxWidth);
  let y = 36;

  for (const line of lines) {
    if (y > pageHeight - 24) {
      doc.addPage();
      y = 20;
    }
    doc.text(line, margin, y);
    y += 5;
  }

  if (signatureSummary) {
    if (y > pageHeight - 70) {
      doc.addPage();
      y = 20;
    }

    y += 8;
    const sectionHeight = 56;
    const gap = 8;
    const cardWidth = (maxWidth - gap) / 2;

    doc.setDrawColor(236, 223, 244);
    doc.setFillColor(250, 244, 251);
    doc.roundedRect(margin, y, maxWidth, sectionHeight, 6, 6, "FD");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(141, 60, 176);
    doc.text("ACEITE E ASSINATURA", pageWidth / 2, y + 8, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.8);
    doc.setTextColor(109, 95, 119);
    doc.text(signatureSummary.locationAndDate, pageWidth / 2, y + 14, { align: "center" });

    const drawSignatureCard = (x: number, top: number, name: string, caption: string) => {
      doc.setDrawColor(236, 223, 244);
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(x, top, cardWidth, 24, 4, 4, "FD");
      doc.setDrawColor(194, 24, 91);
      doc.line(x + 8, top + 10, x + cardWidth - 8, top + 10);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.2);
      doc.setTextColor(31, 23, 40);
      doc.text(name, x + cardWidth / 2, top + 16, { align: "center" });
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.8);
      doc.setTextColor(109, 95, 119);
      doc.text(caption, x + cardWidth / 2, top + 20.5, { align: "center" });
    };

    drawSignatureCard(margin, y + 18, signatureSummary.contractanteName, signatureSummary.contractanteCaption);
    drawSignatureCard(
      margin + cardWidth + gap,
      y + 18,
      signatureSummary.contratadaName,
      signatureSummary.contratadaCaption,
    );
  }

  doc.save(`${contrato.titulo.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`);
}

function ContractPortalSignatureBlock({ summary }: { summary: ContractSignatureSummary | null }) {
  if (!summary) return null;

  return (
    <div className="rounded-[28px] border border-rose-200 bg-[linear-gradient(135deg,rgba(123,31,162,0.08),rgba(232,51,74,0.08),rgba(194,24,91,0.12))] p-6 text-center">
      <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#a52f88]">Aceite e assinatura</p>
      <p className="mt-2 text-sm text-slate-500">{summary.locationAndDate}</p>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {[
          { name: summary.contractanteName, caption: summary.contractanteCaption },
          { name: summary.contratadaName, caption: summary.contratadaCaption },
        ].map((signer) => (
          <div key={`${signer.name}-${signer.caption}`} className="rounded-[22px] border border-rose-100 bg-white/90 px-5 py-6">
            <div className="h-px w-full bg-[linear-gradient(90deg,rgba(123,31,162,0.45),rgba(232,51,74,0.75),rgba(194,24,91,0.5))]" />
            <p className="mt-5 text-lg font-semibold text-slate-900">{signer.name}</p>
            <p className="mt-2 text-xs text-slate-500">{signer.caption}</p>
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs text-slate-500">{summary.note}</p>
    </div>
  );
}

function formatContractDate(date?: string | null) {
  if (!date) return "Pendente";
  return new Date(date).toLocaleString("pt-BR");
}

function ContractPortalTimeline({
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
    { id: "rascunho", label: "Preparado", date: null },
    { id: "enviado", label: "Enviado", date: dataEnvio },
    { id: "visualizado", label: "Visualizado", date: dataVisualizacao },
    { id: "assinado", label: "Assinado", date: dataAssinatura },
  ];
  const activeIndex = Math.min(
    Math.max(CONTRACT_STATUS_ORDER.indexOf(status as (typeof CONTRACT_STATUS_ORDER)[number]), 0),
    steps.length - 1,
  );

  return (
    <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
      {steps.map((step, index) => {
        const isActive = index <= activeIndex;
        const isCurrent = steps[activeIndex]?.id === step.id;

        return (
          <div
            key={step.id}
            className={`rounded-2xl border p-3 ${
              isCurrent
                ? "border-rose-300/20 bg-[linear-gradient(135deg,rgba(123,31,162,0.22),rgba(232,51,74,0.16),rgba(194,24,91,0.18))]"
                : isActive
                  ? "border-emerald-300/20 bg-emerald-300/10"
                  : "border-white/10 bg-white/[0.03]"
            }`}
          >
            <p className="text-xs font-medium text-white">{step.label}</p>
            <p className="mt-1 text-[11px] text-white/45">
              {step.date ? formatContractDate(step.date) : isCurrent ? "Etapa atual" : "Aguardando"}
            </p>
          </div>
        );
      })}
    </div>
  );
}

export default function ClienteContratos() {
  const { toast } = useToast();
  const cliente = JSON.parse(localStorage.getItem("clienteLogado") || "{}");
  const [contratos, setContratos] = useState<ContratoCliente[]>([]);
  const [viewOpen, setViewOpen] = useState(false);
  const [viewContrato, setViewContrato] = useState<ContratoCliente | null>(null);
  const [contractEvents, setContractEvents] = useState<ContractEventRow[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [signerName, setSignerName] = useState("");
  const [revisionMessage, setRevisionMessage] = useState("");
  const [portalActionLoading, setPortalActionLoading] = useState<"approve" | "revision" | null>(null);

  const sortEvents = useCallback((items: ContractEventRow[]) => {
    return [...items].sort((left, right) => {
      const leftDate = new Date(left.created_at).getTime();
      const rightDate = new Date(right.created_at).getTime();
      return rightDate - leftDate;
    });
  }, []);

  const sortContracts = useCallback((items: ContratoCliente[]) => {
    return [...items].sort((left, right) => {
      const leftDate = new Date(left.updated_at || left.created_at).getTime();
      const rightDate = new Date(right.updated_at || right.created_at).getTime();
      return rightDate - leftDate;
    });
  }, []);

  const upsertContrato = useCallback(
    (contrato: ContratoCliente) => {
      if (contrato.archived_at || contrato.status === "rascunho") {
        setContratos((current) => current.filter((item) => item.id !== contrato.id));
        setViewContrato((current) => (current?.id === contrato.id ? contrato : current));
        return;
      }

      setContratos((current) => sortContracts([contrato, ...current.filter((item) => item.id !== contrato.id)]));
      setViewContrato((current) => (current?.id === contrato.id ? contrato : current));
    },
    [sortContracts],
  );

  const load = useCallback(() => {
    if (!cliente.id) return;

    supabase
      .from("contratos")
      .select("*")
      .eq("cliente_id", cliente.id)
      .is("archived_at", null)
      .not("status", "eq", "rascunho")
      .order("updated_at", { ascending: false })
      .then(({ data }) => setContratos(sortContracts((data as ContratoCliente[]) || [])));
  }, [cliente.id, sortContracts]);

  useEffect(() => {
    load();
  }, [load]);

  const loadContractEvents = useCallback(async (contractId: string) => {
    setEventsLoading(true);
    const { data, error } = await supabase
      .from("contrato_eventos")
      .select("*")
      .eq("contrato_id", contractId)
      .order("created_at", { ascending: false });

    if (error) {
      setContractEvents([]);
      setEventsLoading(false);
      throw error;
    }

    setContractEvents(sortEvents((data as ContractEventRow[]) || []));
    setEventsLoading(false);
  }, [sortEvents]);

  useContractsRealtime({
    channelName: `contracts-client-${cliente.id}`,
    filter: cliente.id ? `cliente_id=eq.${cliente.id}` : undefined,
    enabled: Boolean(cliente.id),
    onUpsert: (contrato) => upsertContrato(contrato),
    onDelete: (contractId) => {
      setContratos((current) => current.filter((item) => item.id !== contractId));
      setViewContrato((current) => (current?.id === contractId ? null : current));
    },
  });

  useContractEventsRealtime({
    contractId: viewContrato?.id,
    enabled: viewOpen && Boolean(viewContrato?.id),
    onInsert: (event) => setContractEvents((current) => sortEvents([event, ...current])),
  });

  const handleDownload = (contrato: ContratoCliente) => {
    generatePDF(contrato);
  };

  const markViewed = useCallback(async (contrato: ContratoCliente) => {
    if (contrato.status !== "enviado") return;

    const { data, error } = await supabase.rpc("mark_contract_viewed", {
      p_contract_id: contrato.id,
    });

    if (!error && data) {
      upsertContrato(data as ContratoCliente);
    }
  }, [upsertContrato]);

  const handleView = (contrato: ContratoCliente) => {
    setViewContrato(contrato);
    setViewOpen(true);
    setSignerName(cliente.nome || "");
    setRevisionMessage("");
    void loadContractEvents(contrato.id).catch(() => {
      toast({
        title: "Erro ao carregar atividade",
        description: "A timeline do contrato não pôde ser carregada.",
        variant: "destructive",
      });
    });
    void markViewed(contrato);
  };

  const handleApprove = async () => {
    if (!viewContrato) return;
    const isResignFlow = Boolean((viewContrato as any).requer_reassinatura);
    if (!signerName.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Informe o nome de quem está aprovando o contrato.",
        variant: "destructive",
      });
      return;
    }

    setPortalActionLoading("approve");
    const { data, error } = await supabase.rpc("sign_contract_from_portal", {
      p_contract_id: viewContrato.id,
      p_full_name: signerName.trim(),
    });
    setPortalActionLoading(null);

    if (error) {
      toast({
        title: "Erro ao aprovar contrato",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    const updated = data as ContratoCliente;
    upsertContrato(updated);
    setViewContrato(updated);
    void loadContractEvents(updated.id);
    toast({
      title: isResignFlow ? "Versão atualizada assinada" : "Contrato aprovado",
      description: isResignFlow
        ? "A nova assinatura da versão atualizada foi registrada com sucesso."
        : "A assinatura foi registrada no portal com sucesso.",
    });
  };

  const handleRequestRevision = async () => {
    if (!viewContrato) return;
    if (!revisionMessage.trim()) {
      toast({
        title: "Mensagem obrigatória",
        description: "Descreva o ajuste desejado antes de enviar.",
        variant: "destructive",
      });
      return;
    }

    setPortalActionLoading("revision");
    const { data, error } = await supabase.rpc("request_contract_revision", {
      p_contract_id: viewContrato.id,
      p_message: revisionMessage.trim(),
    });
    setPortalActionLoading(null);

    if (error) {
      toast({
        title: "Erro ao solicitar ajuste",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    const updated = data as ContratoCliente;
    upsertContrato(updated);
    setViewContrato(updated);
    setRevisionMessage("");
    void loadContractEvents(updated.id);
    toast({
      title: "Ajuste enviado",
      description: "O pedido já está disponível para o admin revisar.",
    });
  };

  const viewStatusInsight = viewContrato
    ? getContractStatusInsight({
        status: viewContrato.status,
        dataEnvio: viewContrato.data_envio,
        dataVisualizacao: viewContrato.data_visualizacao,
        dataAssinatura: viewContrato.data_assinatura,
        onboardingStartedAt: (viewContrato as any).onboarding_started_at,
        pedidoId: (viewContrato as any).pedido_id,
        requiresResign: (viewContrato as any).requer_reassinatura,
        resignReason: (viewContrato as any).reassinatura_motivo,
      })
    : null;

  const viewSignatureSummary = viewContrato
    ? buildContractSignatureSummary((viewContrato.builder_payload as any) || null, {
        contractanteSignedName: viewContrato.assinatura_cliente_nome,
        signedAt: viewContrato.data_assinatura,
      })
    : null;

  return (
    <motion.div variants={fadeUp} initial="hidden" animate="show" className="space-y-6">
      <Card className="overflow-hidden border-white/10 bg-[linear-gradient(135deg,rgba(123,31,162,0.18),rgba(232,51,74,0.12),rgba(194,24,91,0.16))]">
        <CardContent className="p-6 md:p-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/10">
              <Vault className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Cofre de Contratos</h1>
              <p className="text-xs text-white/45 uppercase tracking-[0.22em]">
                Leitura e download dos contratos liberados para o cliente
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {contratos.map((contrato) => (
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
          <Card
            key={contrato.id}
            className="overflow-hidden rounded-[26px] border border-white/10 bg-[linear-gradient(135deg,rgba(123,31,162,0.12),rgba(232,51,74,0.08),rgba(255,255,255,0.03))] shadow-[0_18px_40px_rgba(26,8,40,0.28)]"
          >
            <CardContent className="space-y-4 p-5">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div
                  className="flex items-start gap-3 cursor-pointer group min-w-0"
                  onClick={() => handleView(contrato)}
                >
                  <div className="mt-1 rounded-2xl border border-white/10 bg-white/[0.05] p-2">
                    {contrato.status === "assinado" || contrato.status === "visualizado" ? (
                      <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : contrato.status === "enviado" ? (
                      <Eye className="w-4 h-4 text-emerald-300 shrink-0" />
                    ) : (
                      <Lock className="w-4 h-4 text-amber-400 shrink-0" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-white group-hover:text-primary transition-colors truncate">
                        {contrato.titulo}
                      </span>
                      <Badge variant="outline" className={getContractStatusBadgeClass(contrato.status)}>
                        {getContractStatusLabel(contrato.status)}
                      </Badge>
                      {(contrato as any).requer_reassinatura && (
                        <Badge variant="outline" className="border-amber-300/20 bg-amber-300/10 text-amber-100">
                          Assinatura pendente
                        </Badge>
                      )}
                    </div>
                    <p className="mt-2 text-xs text-white/45">{contrato.descricao}</p>
                    <div className="mt-3 rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2">
                      <p className="text-xs font-medium text-white">{statusInsight.title}</p>
                      <p className="mt-1 text-[11px] text-white/45">{statusInsight.subtitle}</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-white/60 text-xs h-8"
                    onClick={() => handleDownload(contrato)}
                  >
                    <Download className="w-3 h-3 mr-1" /> Baixar PDF
                  </Button>
                  <Button
                    size="sm"
                    className="text-[10px] h-8 border-0 text-white gap-1 px-4 shadow-lg shadow-primary/20"
                    style={{ background: "linear-gradient(135deg, #7b1fa2, #e8334a, #c2185b)" }}
                    onClick={() => handleView(contrato)}
                  >
                    <FileText className="w-3 h-3" /> Abrir contrato
                  </Button>
                </div>
              </div>

              <ContractPortalTimeline
                status={contrato.status}
                dataEnvio={contrato.data_envio}
                dataVisualizacao={contrato.data_visualizacao}
                dataAssinatura={contrato.data_assinatura}
              />

              <div className="flex items-center justify-between gap-3 flex-wrap text-[11px] text-white/40">
                <div className="flex items-center gap-4 flex-wrap">
                  <span>Valor: R$ {Number(contrato.valor || 0).toLocaleString("pt-BR")}</span>
                  {contrato.data_envio && <span>Enviado: {formatContractDate(contrato.data_envio)}</span>}
                  {contrato.data_visualizacao && <span>Visualizado: {formatContractDate(contrato.data_visualizacao)}</span>}
                  {contrato.data_assinatura && <span>Assinado: {formatContractDate(contrato.data_assinatura)}</span>}
                </div>
              </div>
            </CardContent>
          </Card>
            );
          })()
        ))}

        {contratos.length === 0 && (
          <Card className="border-white/10 bg-white/[0.03]">
            <CardContent className="py-12 text-center text-sm text-white/45">
              Nenhum contrato disponível no portal.
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent
          className="max-w-4xl max-h-[85vh] overflow-y-auto"
          style={{ background: "rgba(20,20,30,0.96)", border: "1px solid rgba(255,255,255,0.1)" }}
        >
          <DialogHeader>
            <DialogTitle className="text-white text-sm flex items-center justify-between gap-3">
              {viewContrato?.titulo}
              <Button
                size="sm"
                variant="outline"
                className="text-xs gap-1"
                onClick={() => viewContrato && handleDownload(viewContrato)}
              >
                <Download className="w-3 h-3" /> Baixar PDF
              </Button>
            </DialogTitle>
          </DialogHeader>

          {viewContrato && (
            <div className="space-y-4">
              <ContractPortalTimeline
                status={viewContrato.status}
                dataEnvio={viewContrato.data_envio}
                dataVisualizacao={viewContrato.data_visualizacao}
                dataAssinatura={viewContrato.data_assinatura}
              />

              <div className="bg-white p-4 rounded-lg space-y-4">
                {viewStatusInsight && (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Status do contrato</p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">{viewStatusInsight.title}</p>
                    <p className="mt-1 text-sm text-slate-600">{viewStatusInsight.subtitle}</p>
                  </div>
                )}

                {(viewContrato as any).requer_reassinatura && (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 rounded-full bg-amber-100 p-2 text-amber-600">
                        <AlertTriangle className="h-4 w-4" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-amber-700">
                          Assinatura pendente
                        </p>
                        <p className="text-sm font-semibold text-amber-900">
                          O contrato foi atualizado com extras ou melhorias.
                        </p>
                        <p className="text-sm text-amber-800">
                          {(viewContrato as any).reassinatura_motivo ||
                            "Assinatura pendente por atualização de extra e melhoria do sistema."}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {viewContrato.status !== "assinado" && viewContrato.status !== "cancelado" && (
                  <div className="rounded-2xl border border-rose-200/40 bg-[linear-gradient(135deg,rgba(123,31,162,0.08),rgba(232,51,74,0.08),rgba(194,24,91,0.08))] p-4 space-y-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-gray-500">Ações do cliente</p>
                      <p className="mt-1 text-sm text-gray-600">
                        {(viewContrato as any).requer_reassinatura
                          ? "Revise os extras e melhorias adicionados, assine novamente esta versão ou solicite um ajuste."
                          : "Aprove o contrato com seu nome completo ou solicite um ajuste antes de assinar."}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Input
                        value={signerName}
                        onChange={(event) => setSignerName(event.target.value)}
                        placeholder="Nome completo para aprovação"
                        className="border-gray-200 bg-white"
                      />
                      <Button
                        className="w-full text-white border-0"
                        style={{ background: "linear-gradient(135deg, #7b1fa2, #e8334a, #c2185b)" }}
                        onClick={() => void handleApprove()}
                        disabled={portalActionLoading !== null}
                      >
                        <ShieldCheck className="w-4 h-4 mr-2" />
                        {portalActionLoading === "approve"
                          ? "Aprovando..."
                          : (viewContrato as any).requer_reassinatura
                            ? "Assinar versão atualizada"
                            : "Aprovar e assinar contrato"}
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <Textarea
                        rows={3}
                        value={revisionMessage}
                        onChange={(event) => setRevisionMessage(event.target.value)}
                        placeholder="Descreva o ajuste que você quer solicitar no contrato"
                        className="border-gray-200 bg-white resize-none"
                      />
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => void handleRequestRevision()}
                        disabled={portalActionLoading !== null}
                      >
                        <PenSquare className="w-4 h-4 mr-2" />
                        {portalActionLoading === "revision" ? "Enviando ajuste..." : "Solicitar ajuste"}
                      </Button>
                    </div>
                  </div>
                )}

                {viewContrato.status === "assinado" && (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-center">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">Assinatura registrada</p>
                    <p className="mt-2 text-base font-semibold text-emerald-900">
                      {viewContrato.assinatura_cliente_nome || signerName || "Cliente"}
                    </p>
                    <p className="mt-1 text-sm text-emerald-800">Aceite confirmado no portal do cliente.</p>
                  </div>
                )}

                <div className="bg-white text-black p-8 rounded-lg font-serif text-sm leading-relaxed whitespace-pre-wrap">
                  {stripLegacySignaturePlaceholders(viewContrato.corpo || viewContrato.descricao || "")}
                </div>

                <ContractPortalSignatureBlock summary={viewSignatureSummary} />

                {((viewContrato as any).onboarding_started_at || (viewContrato as any).pedido_id) && (
                  <div className="rounded-2xl border border-fuchsia-200 bg-[linear-gradient(135deg,rgba(123,31,162,0.08),rgba(232,51,74,0.08),rgba(194,24,91,0.08))] p-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div className="space-y-1">
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-fuchsia-700">
                          Checklist e dados do projeto
                        </p>
                        <p className="text-sm text-slate-700">
                          O checklist do cliente já está liberado para enviar materiais, acessos e referências.
                        </p>
                      </div>
                      <Button
                        className="border-0 text-white"
                        style={{ background: "linear-gradient(135deg, #7b1fa2, #e8334a, #c2185b)" }}
                        onClick={() => window.location.assign("/cliente/dados")}
                      >
                        <ClipboardList className="mr-2 h-4 w-4" />
                        Abrir checklist
                      </Button>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-gray-500">Timeline do contrato</p>
                    <p className="mt-1 text-sm text-gray-500">Acompanhe o que já aconteceu com este contrato no portal.</p>
                  </div>
                  <ContractActivityFeed
                    events={contractEvents}
                    loading={eventsLoading}
                    emptyLabel="Ainda não existe atividade operacional registrada para este contrato."
                  />
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
