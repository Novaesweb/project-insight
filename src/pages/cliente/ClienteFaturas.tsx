import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { FileText, FileSpreadsheet, FileDown, CreditCard, CheckCircle2, ArrowRight, Wallet, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useRealtimeSubscription } from "@/hooks/useRealtimeSubscription";
import { exportFaturaPDF, exportFaturaWord, exportFaturaCSV } from "@/lib/fatura-export";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };
const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  pago: { label: "Pago", color: "text-emerald-400 font-black", bg: "bg-emerald-500/10 border-emerald-500/20" },
  pendente: { label: "Pendente", color: "text-amber-400 font-black", bg: "bg-amber-500/10 border-amber-500/20" },
  em_atraso: { label: "Em Atraso", color: "text-rose-400 font-black", bg: "bg-rose-500/10 border-rose-500/20" },
};

export default function ClienteFaturas() {
  const cliente = JSON.parse(localStorage.getItem("clienteLogado") || "{}");
  const { toast } = useToast();
  const [faturas, setFaturas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!cliente.id) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("financeiro")
      .select("*")
      .eq("cliente_id", cliente.id)
      .order("vencimento", { ascending: false });

    if (error) {
      console.error("Erro ao carregar faturas:", error);
    } else {
      setFaturas(data || []);
    }
    setLoading(false);
  }, [cliente.id]);

  useEffect(() => { load(); }, [load]);
  useRealtimeSubscription("financeiro", load);

  const totalPendente = faturas.filter(f => f.status !== "pago").reduce((a, f) => a + Number(f.valor), 0);

  const handleExport = async (f: any, type: "pdf" | "word" | "csv") => {
    const data = { 
      descricao: f.descricao, 
      valor: Number(f.valor), 
      vencimento: f.vencimento, 
      data_emissao: f.created_at, 
      status: f.status, 
      clienteNome: cliente.nome 
    };
    try {
      if (type === "pdf") exportFaturaPDF(data);
      else if (type === "word") await exportFaturaWord(data);
      else exportFaturaCSV(data);
      toast({ title: `💎 Fatura exportada em ${type.toUpperCase()}!` });
    } catch { 
      toast({ title: "Erro ao exportar", variant: "destructive" }); 
    }
  };

  const payFatura = (descricao: string) => {
    const asaasUrl = descricao.includes("Asaas: ") ? descricao.split("Asaas: ")[1].replace(")", "") : null;
    if (asaasUrl) {
      window.open(asaasUrl, "_blank");
    } else {
      toast({ 
        title: "Link em geração", 
        description: "A nossa equipe está preparando o seu checkout. Tente novamente em breve!",
        variant: "default"
      });
    }
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-10 pb-20">
      {/* Header Premium */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tighter flex items-center gap-3">
            <Wallet className="w-8 h-8 text-primary" /> Minhas Faturas
          </h1>
          <p className="text-white/40 font-medium text-sm mt-1">Gerencie seus pagamentos com transparência total.</p>
        </div>

        <div className="p-1 px-6 bg-white/5 border border-white/5 rounded-2xl backdrop-blur-xl flex items-center h-14">
           <p className="text-xs font-black text-white/40 uppercase tracking-widest mr-4">Total em Aberto</p>
           <p className="text-2xl font-black text-white">R$ {totalPendente.toLocaleString("pt-BR")}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="py-20 text-center"><p className="text-white/20 animate-pulse font-black uppercase text-xs tracking-widest">Sincronizando faturas...</p></div>
        ) : faturas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-40 glass-card rounded-[3rem] border-white/5">
             <FileText className="w-16 h-16 text-white/10 mb-4" />
             <p className="text-white/40 font-bold">Nenhuma fatura encontrada no momento.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {faturas.map(f => {
              const config = statusConfig[f.status] || statusConfig.pendente;
              const hasAsaasLink = f.descricao.includes("Asaas: ");

              return (
                <motion.div key={f.id} variants={fadeUp} className="group cursor-default">
                  <Card className={cn(
                    "glass-card-premium p-6 rounded-[2rem] border border-white/5 transition-all overflow-hidden relative",
                    f.status === "em_atraso" && "border-rose-500/20"
                  )}>
                    {/* Background Glow */}
                    <div className="absolute -right-20 -top-20 w-40 h-40 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />

                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                           <h3 className="text-lg font-black text-white tracking-tight uppercase">
                             {f.descricao.split(" (Asaas:")[0]}
                           </h3>
                           <Badge variant="outline" className={cn("px-4 py-1 rounded-full border-[0.5px] uppercase text-[9px] tracking-widest", config.bg, config.color)}>
                              {config.label}
                           </Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-[11px] text-white/30 font-bold uppercase tracking-widest">
                           <span className="flex items-center gap-1.5"><CreditCard className="w-3 h-3" /> R$ {Number(f.valor).toLocaleString("pt-BR")}</span>
                           <span className="flex items-center gap-1.5"><ArrowRight className="w-3 h-3" /> Vencimento {f.vencimento ? new Date(f.vencimento).toLocaleDateString("pt-BR") : "A Definir"}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 w-full md:w-auto">
                        {f.status !== "pago" && (
                          <Button
                            className={cn(
                              "flex-1 md:flex-none h-12 px-8 rounded-xl font-black uppercase tracking-widest text-xs transition-all",
                              hasAsaasLink ? "gradient-primary text-white shadow-lg shadow-primary/20" : "bg-white/5 text-white/40"
                            )}
                            onClick={() => payFatura(f.descricao)}
                          >
                            <CreditCard className="w-4 h-4 mr-2" />
                            {hasAsaasLink ? "Pagar Agora" : "Gerando Pagamento"}
                          </Button>
                        )}
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-12 w-12 rounded-xl bg-white/5 border border-white/5 text-white/30 hover:text-white hover:bg-white/10">
                              <FileDown className="w-5 h-5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="glass-card border-white/5 text-white p-2 w-48">
                            <p className="text-[10px] font-black uppercase tracking-widest text-white/20 p-2 border-b border-white/5 mb-2">Exportar Comprovante</p>
                            <DropdownMenuItem onClick={() => handleExport(f, "pdf")} className="rounded-lg gap-2 text-xs font-bold py-2.5 cursor-pointer">
                              <FileText className="w-4 h-4 text-rose-400" /> Baixar PDF
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleExport(f, "word")} className="rounded-lg gap-2 text-xs font-bold py-2.5 cursor-pointer">
                              <FileText className="w-4 h-4 text-blue-400" /> Baixar Word
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleExport(f, "csv")} className="rounded-lg gap-2 text-xs font-bold py-2.5 cursor-pointer">
                              <FileSpreadsheet className="w-4 h-4 text-emerald-400" /> Baixar CSV
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    {f.status === "pago" && (
                       <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <p className="text-[10px] text-emerald-400 font-black uppercase tracking-widest">Pagamento validado com sucesso. Obrigado!</p>
                       </div>
                    )}
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}

        <div className="p-8 rounded-[3rem] bg-white/[0.02] border border-white/5 flex flex-col md:flex-row items-center gap-6 justify-between">
           <div className="flex items-center gap-4 text-center md:text-left">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-400">
                  <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                 <p className="text-white font-black text-sm uppercase tracking-tight leading-tight">Dúvidas sobre o financeiro?</p>
                 <p className="text-white/40 text-[11px] font-medium tracking-tight mt-1">Nossa equipe de suporte está online para te ajudar agora mesmo.</p>
              </div>
           </div>
           <Button variant="ghost" className="h-12 px-8 rounded-xl bg-white/5 text-white text-[10px] font-black uppercase tracking-widest hover:bg-white/10">
              Falar com o Financeiro
           </Button>
        </div>
      </div>
    </motion.div>
  );
}
