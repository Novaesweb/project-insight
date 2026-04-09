import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Download, Eye, FileText, Lock, ShieldCheck, Vault } from "lucide-react";
import jsPDF from "jspdf";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useContractsRealtime } from "@/hooks/useContractsRealtime";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import {
  CONTRACT_STATUS_ORDER,
  getContractStatusBadgeClass,
  getContractStatusLabel,
} from "@/lib/contract-status";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

type ContratoCliente = Tables<"contratos">;

function generatePDF(titulo: string, corpo: string) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const maxWidth = pageWidth - margin * 2;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(titulo, margin, 25);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  const lines = doc.splitTextToSize(corpo, maxWidth);
  let y = 40;

  for (const line of lines) {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
    doc.text(line, margin, y);
    y += 5;
  }

  doc.save(`${titulo.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`);
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
  const cliente = JSON.parse(localStorage.getItem("clienteLogado") || "{}");
  const [contratos, setContratos] = useState<ContratoCliente[]>([]);
  const [viewOpen, setViewOpen] = useState(false);
  const [viewContrato, setViewContrato] = useState<ContratoCliente | null>(null);

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

  const handleDownload = (contrato: ContratoCliente) => {
    generatePDF(contrato.titulo, contrato.corpo || contrato.descricao || "");
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
    void markViewed(contrato);
  };

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
                    </div>
                    <p className="mt-2 text-xs text-white/45">{contrato.descricao}</p>
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
                <div className="bg-white text-black p-8 rounded-lg font-serif text-sm leading-relaxed whitespace-pre-wrap">
                  {viewContrato.corpo || viewContrato.descricao || ""}
                </div>

                {viewContrato.assinatura_admin && (
                  <div>
                    <p className="text-xs font-bold text-gray-600 mb-1">Assinatura CONTRATADA:</p>
                    <img src={viewContrato.assinatura_admin} alt="Assinatura da contratada" className="h-16" />
                  </div>
                )}

                {viewContrato.assinatura_cliente && (
                  <div>
                    <p className="text-xs font-bold text-gray-600 mb-1">Assinatura CONTRATANTE:</p>
                    <img src={viewContrato.assinatura_cliente} alt="Assinatura do contratante" className="h-16" />
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
