import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { FileText, FileSpreadsheet, FileDown, CreditCard, Copy, CheckCircle2, QrCode } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useRealtimeSubscription } from "@/hooks/useRealtimeSubscription";
import { exportFaturaPDF, exportFaturaWord, exportFaturaCSV } from "@/lib/fatura-export";
import { useToast } from "@/hooks/use-toast";

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };
const statusColors: Record<string, string> = { paga: "#4ade80", pendente: "#facc15", atrasada: "#ef4444" };
const statusLabels: Record<string, string> = { paga: "Paga", pendente: "Pendente", atrasada: "Atrasada" };

export default function ClienteFaturas() {
  const cliente = JSON.parse(localStorage.getItem("clienteLogado") || "{}");
  const { toast } = useToast();
  const [faturas, setFaturas] = useState<any[]>([]);
  const [pixKey, setPixKey] = useState("");
  const [showPixModal, setShowPixModal] = useState(false);
  const [selectedFatura, setSelectedFatura] = useState<any>(null);

  const load = useCallback(() => {
    if (!cliente.id) return;
    supabase.from("faturas").select("*").eq("cliente_id", cliente.id).order("vencimento", { ascending: false })
      .then(({ data }) => setFaturas(data || []));
    
    // Carregar chave pix das configurações
    supabase.from("app_config").select("value").eq("key", "pix_key").single()
      .then(({ data }) => { if (data) setPixKey(data.value); });
  }, [cliente.id]);

  useEffect(() => { load(); }, [load]);
  useRealtimeSubscription("faturas", load);

  const totalPendente = faturas.filter(f => f.status === "pendente").reduce((a, f) => a + Number(f.valor), 0);
  const totalAtrasado = faturas.filter(f => f.status === "atrasada").reduce((a, f) => a + Number(f.valor), 0);

  const handleExport = async (f: any, type: "pdf" | "word" | "csv") => {
    const data = { descricao: f.descricao, valor: Number(f.valor), vencimento: f.vencimento, data_emissao: f.data_emissao, status: f.status, clienteNome: cliente.nome };
    try {
      if (type === "pdf") exportFaturaPDF(data);
      else if (type === "word") await exportFaturaWord(data);
      else exportFaturaCSV(data);
      toast({ title: `Fatura exportada em ${type.toUpperCase()}!` });
    } catch { toast({ title: "Erro ao exportar", variant: "destructive" }); }
  };

  const openPayment = (f: any) => {
    setSelectedFatura(f);
    setShowPixModal(true);
  };

  return (
    <motion.div variants={fadeUp} initial="hidden" animate="show" className="space-y-6 pb-10">
      <h1 className="text-lg font-bold text-white">Minhas Faturas</h1>
      <div className="grid grid-cols-2 gap-4">
        <Card className="border-[0.5px] border-white/[0.08]" style={{ background: "rgba(255,255,255,0.04)" }}>
          <CardContent className="p-4">
            <p className="text-[10px] text-white/40 uppercase font-bold tracking-wider mb-1">Total pendente</p>
            <p className="text-lg font-bold text-yellow-400">R$ {totalPendente.toLocaleString("pt-BR")}</p>
          </CardContent>
        </Card>
        <Card className="border-[0.5px] border-white/[0.08]" style={{ background: "rgba(255,255,255,0.04)" }}>
          <CardContent className="p-4">
            <p className="text-[10px] text-white/40 uppercase font-bold tracking-wider mb-1">Total em atraso</p>
            <p className="text-lg font-bold text-red-400">R$ {totalAtrasado.toLocaleString("pt-BR")}</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3">
        {faturas.map(f => (
          <Card key={f.id} className={`border-[0.5px] ${f.status === "atrasada" ? "border-red-500/30" : "border-white/[0.08]"}`} style={{ background: "rgba(255,255,255,0.04)" }}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-white">{f.descricao}</span>
                <Badge variant="outline" className="text-[10px] border-0 px-2 font-bold" style={{ backgroundColor: statusColors[f.status] + "22", color: statusColors[f.status] }}>
                  {statusLabels[f.status]}
                </Badge>
              </div>
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-4 text-[11px] text-white/40">
                  <span className="text-white font-bold">R$ {Number(f.valor).toLocaleString("pt-BR")}</span>
                  <span>Vencimento: {f.vencimento}</span>
                </div>
                <div className="flex items-center gap-2">
                  {f.status !== "paga" && (
                    <Button
                      size="sm"
                      className="h-7 text-[10px] gradient-primary border-0 text-white font-bold rounded-lg"
                      onClick={() => openPayment(f)}
                    >
                      <CreditCard className="w-3 h-3 mr-1" /> Pagar Agora
                    </Button>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm" variant="ghost" className="text-white/40 text-[10px] h-7 px-2 hover:text-white">
                        <FileDown className="w-3 h-3 mr-1" /> Exportar
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-[#1a1a2e] border-white/10 text-white">
                      <DropdownMenuItem onClick={() => handleExport(f, "pdf")} className="text-xs gap-2 cursor-pointer">
                        <FileText className="w-3 h-3 text-red-400" /> Baixar PDF
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleExport(f, "word")} className="text-xs gap-2 cursor-pointer">
                        <FileText className="w-3 h-3 text-blue-400" /> Baixar Word
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleExport(f, "csv")} className="text-xs gap-2 cursor-pointer">
                        <FileSpreadsheet className="w-3 h-3 text-green-400" /> Baixar CSV
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {faturas.length === 0 && <p className="text-sm text-white/40 text-center py-8">Nenhuma fatura encontrada</p>}
      </div>

      <Dialog open={showPixModal} onOpenChange={setShowPixModal}>
        <DialogContent className="glass-card border-white/10 text-white max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-white">Pagamento via Pix</DialogTitle>
            <DialogDescription className="text-white/40 text-xs">
              Valor a pagar: <span className="text-white font-bold">R$ {selectedFatura ? Number(selectedFatura.valor).toLocaleString("pt-BR") : "0,00"}</span>
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center p-6 space-y-6">
            <div className="w-40 h-40 bg-white p-2 rounded-xl flex items-center justify-center relative group">
               <QrCode className="w-32 h-32 text-slate-900" />
               <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-xl">
                  <p className="text-[10px] font-bold text-white text-center px-4 uppercase">Chave Pix abaixo habilitada</p>
               </div>
            </div>
            
            <div className="w-full space-y-2">
              <p className="text-[10px] text-center text-white/30 uppercase font-black tracking-widest">Copia e Cola / Chave Pix</p>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 break-all text-center">
                 <p className="text-xs text-white/80 font-mono select-all">{pixKey || "Chave não configurada"}</p>
              </div>
              <Button 
                className="w-full gradient-primary border-0 text-white gap-2 mt-2"
                onClick={() => {
                  navigator.clipboard.writeText(pixKey);
                  toast({ title: "Chave Pix copiada!", description: "Agora basta colar no seu banco." });
                }}
              >
                <Copy className="w-4 h-4" /> Copiar Chave Pix
              </Button>
            </div>
            
            <p className="text-[10px] text-white/40 text-center italic">
               Após realizar o pagamento, o status será atualizado automaticamente em até 24h.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
