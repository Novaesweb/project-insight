import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { FileText, Download, PenTool, ShieldCheck, Vault, Lock, Unlock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useRealtimeSubscription } from "@/hooks/useRealtimeSubscription";
import SignaturePad from "@/components/SignaturePad";
import jsPDF from "jspdf";

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };
const statusColors: Record<string, string> = { aguardando: "#facc15", assinado: "#4ade80", cancelado: "#ef4444" };
const statusLabels: Record<string, string> = { aguardando: "Pendente de Criptografia", assinado: "Protegido no Cofre", cancelado: "Estrutura Revogada" };

function generatePDF(titulo: string, corpo: string, assinaturaAdmin?: string, assinaturaCliente?: string) {
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
    if (y > 270) { doc.addPage(); y = 20; }
    doc.text(line, margin, y);
    y += 5;
  }

  if (assinaturaAdmin) {
    if (y > 230) { doc.addPage(); y = 20; }
    y += 10;
    doc.setFont("helvetica", "bold");
    doc.text("Assinatura CONTRATADA (novaesweb):", margin, y);
    y += 5;
    doc.addImage(assinaturaAdmin, "PNG", margin, y, 60, 25);
    y += 30;
  }

  if (assinaturaCliente) {
    doc.setFont("helvetica", "bold");
    doc.text("Assinatura CONTRATANTE:", margin, y);
    y += 5;
    doc.addImage(assinaturaCliente, "PNG", margin, y, 60, 25);
  }

  doc.save(`${titulo.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`);
}

export default function ClienteContratos() {
  const cliente = JSON.parse(localStorage.getItem("clienteLogado") || "{}");
  const { toast } = useToast();
  const [contratos, setContratos] = useState<any[]>([]);
  const [signOpen, setSignOpen] = useState(false);
  const [signingContrato, setSigningContrato] = useState<any>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [viewContrato, setViewContrato] = useState<any>(null);

  const load = useCallback(() => {
    if (!cliente.id) return;
    supabase.from("contratos").select("*").eq("cliente_id", cliente.id).is("builder_payload", null).order("created_at", { ascending: false })
      .then(({ data }) => setContratos(data || []));
  }, [cliente.id]);

  useEffect(() => { load(); }, [load]);
  useRealtimeSubscription("contratos", load);

  const handleSign = (contrato: any) => {
    setSigningContrato(contrato);
    setSignOpen(true);
  };

  const submitSignature = async (dataUrl: string) => {
    if (!signingContrato) return;
    const { error } = await supabase.from("contratos").update({
      status: "assinado",
      data_assinatura: new Date().toISOString().split("T")[0],
      assinatura_cliente: dataUrl,
    } as any).eq("id", signingContrato.id);
    if (!error) {
      toast({ title: "Contrato assinado!", description: `${signingContrato.titulo} assinado com sucesso.` });
      setSignOpen(false);
      setSigningContrato(null);
      load();
    } else {
      toast({ title: "Erro ao assinar", variant: "destructive" });
    }
  };

  const handleDownload = (c: any) => {
    generatePDF(c.titulo, (c as any).corpo || c.descricao || "", (c as any).assinatura_admin, (c as any).assinatura_cliente);
  };

  const handleView = (c: any) => {
    setViewContrato(c);
    setViewOpen(true);
  };

  return (
    <motion.div variants={fadeUp} initial="hidden" animate="show" className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/30">
          <Vault className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Blindagem de Ativos</h1>
          <p className="text-xs text-white/40 uppercase tracking-widest font-mono">Digital Vault v9.0 Pro</p>
        </div>
      </div>
      <div className="space-y-3">
        {contratos.map(c => (
          <Card key={c.id} className={`border-[0.5px] ${c.status === "aguardando" ? "border-yellow-500/30" : "border-white/[0.08]"}`} style={{ background: "rgba(255,255,255,0.04)" }}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 cursor-pointer group" onClick={() => handleView(c)}>
                  {c.status === "assinado" ? <ShieldCheck className="w-4 h-4 text-emerald-400" /> : <Lock className="w-4 h-4 text-amber-400" />}
                  <span className="text-sm font-bold text-white group-hover:text-primary transition-colors">{c.titulo}</span>
                </div>
                <Badge variant="outline" className="text-[10px] border-0 px-2" style={{ backgroundColor: statusColors[c.status] + "22", color: statusColors[c.status] }}>
                  {statusLabels[c.status]}
                </Badge>
              </div>
              <p className="text-xs text-white/40 mb-3">{c.descricao}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-[11px] text-white/40">
                  <span>Valor: R$ {Number(c.valor).toLocaleString("pt-BR")}</span>
                  <span>Enviado: {c.data_envio}</span>
                  {c.data_assinatura && <span>Assinado: {c.data_assinatura}</span>}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" className="text-white/50 text-xs h-7" onClick={() => handleDownload(c)}>
                    <Download className="w-3 h-3 mr-1" /> Dossiê PDF
                  </Button>
                  {c.status === "aguardando" && (
                    <Button size="sm" className="text-[10px] h-7 border-0 text-white gap-1 px-4 shadow-lg shadow-primary/20" style={{ background: "linear-gradient(135deg, #e8334a, #7b1fa2)" }}
                      onClick={() => handleSign(c)}>
                      <Unlock className="w-3 h-3" /> Criptografar Assinatura
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {contratos.length === 0 && <p className="text-sm text-white/40 text-center py-8">Nenhum contrato encontrado</p>}
      </div>

      {/* Signature Dialog */}
      <Dialog open={signOpen} onOpenChange={setSignOpen}>
        <DialogContent className="max-w-lg" style={{ background: "rgba(20,20,30,0.95)", border: "1px solid rgba(255,255,255,0.1)" }}>
          <DialogHeader>
            <DialogTitle className="text-white text-sm">Assinar Contrato</DialogTitle>
          </DialogHeader>
          <p className="text-xs text-white/60 mb-2">{signingContrato?.titulo}</p>
          <SignaturePad
            label="Assine abaixo como CONTRATANTE"
            onSave={submitSignature}
            onCancel={() => setSignOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* View Contract Dialog */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto" style={{ background: "rgba(20,20,30,0.95)", border: "1px solid rgba(255,255,255,0.1)" }}>
          <DialogHeader>
            <DialogTitle className="text-white text-sm flex items-center justify-between">
              {viewContrato?.titulo}
              <Button size="sm" variant="outline" className="text-xs gap-1" onClick={() => viewContrato && handleDownload(viewContrato)}>
                <Download className="w-3 h-3" /> Baixar PDF
              </Button>
            </DialogTitle>
          </DialogHeader>
          <div className="bg-white text-black p-8 rounded-lg font-serif text-sm leading-relaxed whitespace-pre-wrap">
            {(viewContrato as any)?.corpo || viewContrato?.descricao || ""}
          </div>
          {viewContrato && (
            <div className="bg-white p-4 rounded-lg space-y-4">
              {(viewContrato as any)?.assinatura_admin && (
                <div>
                  <p className="text-xs font-bold text-gray-600 mb-1">Assinatura CONTRATADA:</p>
                  <img src={(viewContrato as any).assinatura_admin} alt="Assinatura" className="h-16" />
                </div>
              )}
              {(viewContrato as any)?.assinatura_cliente && (
                <div>
                  <p className="text-xs font-bold text-gray-600 mb-1">Assinatura CONTRATANTE:</p>
                  <img src={(viewContrato as any).assinatura_cliente} alt="Assinatura" className="h-16" />
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}



