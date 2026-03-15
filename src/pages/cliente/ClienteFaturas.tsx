import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { FileText, FileSpreadsheet, FileDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

  const load = useCallback(() => {
    if (!cliente.id) return;
    supabase.from("faturas").select("*").eq("cliente_id", cliente.id).order("vencimento", { ascending: false })
      .then(({ data }) => setFaturas(data || []));
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

  return (
    <motion.div variants={fadeUp} initial="hidden" animate="show" className="space-y-6">
      <h1 className="text-lg font-bold text-white">Minhas Faturas</h1>
      <div className="grid grid-cols-2 gap-4">
        <Card className="border-[0.5px] border-white/[0.08]" style={{ background: "rgba(255,255,255,0.04)" }}>
          <CardContent className="p-4">
            <p className="text-[10px] text-white/40">Total pendente</p>
            <p className="text-lg font-bold text-yellow-400">R$ {totalPendente.toLocaleString("pt-BR")}</p>
          </CardContent>
        </Card>
        <Card className="border-[0.5px] border-white/[0.08]" style={{ background: "rgba(255,255,255,0.04)" }}>
          <CardContent className="p-4">
            <p className="text-[10px] text-white/40">Total em atraso</p>
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
                <Badge variant="outline" className="text-[10px] border-0 px-2" style={{ backgroundColor: statusColors[f.status] + "22", color: statusColors[f.status] }}>
                  {statusLabels[f.status]}
                </Badge>
              </div>
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-4 text-[11px] text-white/40">
                  <span className="text-white font-medium">R$ {Number(f.valor).toLocaleString("pt-BR")}</span>
                  <span>Vencimento: {f.vencimento}</span>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="ghost" className="text-white/50 text-xs h-7">
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
            </CardContent>
          </Card>
        ))}
        {faturas.length === 0 && <p className="text-sm text-white/40 text-center py-8">Nenhuma fatura encontrada</p>}
      </div>
    </motion.div>
  );
}
