import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useRealtimeSubscription } from "@/hooks/useRealtimeSubscription";
import { useToast } from "@/hooks/use-toast";
import { Zap, Star, CalendarDays, Rocket, ShieldCheck, Sparkles, CreditCard, ExternalLink } from "lucide-react";
import logoImg from "@/assets/novaesweb-logo-premium.png";

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };
const catConfig: Record<string, { label: string; color: string; bg: string; border: string; icon: any }> = {
  fixo: { label: "Único", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", icon: Zap },
  intermediario: { label: "Pro", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", icon: Star },
  mensal: { label: "Assinatura", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20", icon: CalendarDays },
};

export default function ClienteExtras() {
  const cliente = JSON.parse(localStorage.getItem("clienteLogado") || "{}");
  const { toast } = useToast();
  const [meusExtras, setMeusExtras] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(() => {
    if (!cliente.id) return;
    supabase.from("extras_clientes").select("*, extras_catalogo(nome)").eq("cliente_id", cliente.id)
      .then(({ data }) => setMeusExtras(data || []));
  }, [cliente.id]);

  useEffect(() => { load(); }, [load]);
  useRealtimeSubscription("extras_clientes", load);

  const ativos = meusExtras.filter(e => e.status === "ativo");
  const totalMensal = ativos.reduce((acc, e) => acc + Number(e.preco_mensal), 0);
  const totalAtivacao = ativos.reduce((acc, e) => acc + Number(e.preco_ativacao), 0);

  // Função para gerar cobrança no Asaas
  const handleGerarAsaas = async (extra: any) => {
    if (!cliente.id) return;
    
    setLoading(true);
    try {
      // Importar AsaasService dinamicamente
      const { AsaasService } = await import("@/lib/asaas-service");
      
      // 1. Buscar dados completos do cliente
      const { data: clienteData } = await supabase.from("clientes").select("*").eq("id", cliente.id).single();
      if (!clienteData) throw new Error("Cliente não encontrado");

      // 2. Criar/atualizar cliente no Asaas
      const asaasCustomer = await AsaasService.getOrCreateCustomer({
        name: clienteData.nome,
        email: clienteData.email,
        cpfCnpj: clienteData.documento || undefined,
        mobilePhone: clienteData.telefone || undefined,
        externalReference: cliente.id
      });

      // 3. Gerar cobrança no Asaas
      const payment = await AsaasService.createPayment({
        customer: asaasCustomer.id,
        billingType: "UNDEFINED" as const,
        value: Number(extra.preco_mensal),
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        description: `Extra: ${(extra.extras_catalogo as any)?.nome || extra.nome} - Mensalidade`
      });

      // 4. Criar fatura no financeiro com link Asaas
      const financeiroData = {
        cliente_id: cliente.id,
        tipo: "receita",
        valor: Number(extra.preco_mensal),
        descricao: `Extra: ${(extra.extras_catalogo as any)?.nome || extra.nome} - Mensalidade\n(Asaas: ${payment.invoiceUrl})`,
        data: new Date().toISOString().split("T")[0],
        vencimento: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: "pendente"
      };

      await supabase.from("financeiro").insert(financeiroData);

      toast({ 
        title: "✅ Cobrança Gerada!", 
        description: `Cobrança Asaas criada com sucesso. Valor: R$ ${Number(extra.preco_mensal).toFixed(2)}` 
      });

    } catch (error: any) {
      console.error("Erro ao gerar cobrança Asaas:", error);
      toast({ 
        title: "Erro ao gerar cobrança", 
        description: error.message || "Não foi possível gerar a cobrança Asaas", 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div variants={fadeUp} initial="hidden" animate="show" className="space-y-10 pb-20">
      {/* Header Premium */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="flex items-center justify-center bg-white/5 p-1.5 rounded-xl border border-white/10 shadow-inner shrink-0">
            <img src={logoImg} alt="Novaes Web" className="h-7 sm:h-8 w-auto object-contain" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tighter flex items-center gap-3">
              <Rocket className="w-8 h-8 text-purple-500" /> Meus Módulos
            </h1>
            <p className="text-white/40 font-medium text-sm mt-1 italic">Funcionalidades extras ativas no seu ecossistema digital.</p>
          </div>
        </div>
        
        <div className="px-4 py-2 rounded-full border border-white/10 bg-white/5 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Ambiente Seguro</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-[0.5px] border-emerald-500/20 shadow-lg shadow-emerald-500/5 relative overflow-hidden group" style={{ background: "rgba(255,255,255,0.04)" }}>
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity"><Zap className="w-12 h-12 text-emerald-400" /></div>
          <CardContent className="p-6">
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-black mb-1">Custo Mensal Ativo</p>
            <p className="text-3xl font-black text-emerald-400">R$ {totalMensal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            <div className="mt-2 h-1 w-12 bg-emerald-500/30 rounded-full" />
          </CardContent>
        </Card>
        
        <Card className="border-[0.5px] border-blue-500/20 shadow-lg shadow-blue-500/5 relative overflow-hidden group" style={{ background: "rgba(255,255,255,0.04)" }}>
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity"><CalendarDays className="w-12 h-12 text-blue-400" /></div>
          <CardContent className="p-6">
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-black mb-1">Total de Ativações</p>
            <p className="text-3xl font-black text-blue-400">R$ {totalAtivacao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            <div className="mt-2 h-1 w-12 bg-blue-500/30 rounded-full" />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {meusExtras.map(e => {
          const config = catConfig[e.categoria] || catConfig.fixo;
          const Icon = config.icon;
          
          return (
            <Card key={e.id} className="border-[0.5px] border-white/5 hover:border-white/10 transition-all group relative overflow-hidden" style={{ background: "linear-gradient(160deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)" }}>
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/[0.02] rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform" />
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div className={`p-3 rounded-2xl ${config.bg} ${config.color} shadow-lg shadow-current/5`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest border-0 px-3 py-1" style={{ backgroundColor: (e.status === "ativo" ? "#4ade80" : "#facc15") + "15", color: e.status === "ativo" ? "#4ade80" : "#facc15" }}>
                    {e.status === "ativo" ? "Ativo" : "Em Processo"}
                  </Badge>
                </div>

                <h3 className="text-sm font-black text-white mb-2 leading-tight uppercase tracking-tight">{(e as any).extras_catalogo?.nome || "Extra Especial"}</h3>
                
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className={`text-[8px] font-bold border-0 px-2 py-0.5 ${config.bg} ${config.color}`}>{config.label}</Badge>
                    <span className="text-[10px] text-white/20 font-medium">Iniciado em {new Date(e.created_at).toLocaleDateString("pt-BR")}</span>
                  </div>

                  <div className="pt-4 border-t border-white/5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        {Number(e.preco_ativacao) > 0 && <p className="text-[10px] text-white/30 uppercase font-black tracking-tighter">Ativação</p>}
                        {Number(e.preco_mensal) > 0 && <p className="text-[10px] text-white/30 uppercase font-black tracking-tighter">Mensalidade</p>}
                      </div>
                      <div className="text-right">
                        {Number(e.preco_ativacao) > 0 && <p className="text-sm font-black text-white">R$ {Number(e.preco_ativacao).toFixed(2)}</p>}
                        {Number(e.preco_mensal) > 0 && <p className="text-sm font-black text-white">R$ {Number(e.preco_mensal).toFixed(2)}</p>}
                      </div>
                    </div>
                    
                    {/* Botão Gerar no Asaas para recorrentes */}
                    {e.status === "ativo" && Number(e.preco_mensal) > 0 && e.categoria === "mensal" && (
                      <Button
                        onClick={() => handleGerarAsaas(e)}
                        disabled={loading}
                        className="w-full h-10 rounded-xl font-black uppercase tracking-widest text-xs transition-all gradient-primary border-0 text-white shadow-lg shadow-primary/20 hover:shadow-primary/30"
                      >
                        {loading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                            Gerando...
                          </>
                        ) : (
                          <>
                            <CreditCard className="w-4 h-4 mr-2" />
                            Gerar no Asaas
                          </>
                        )}
                      </Button>
                    )}
                  </div>

                  {e.observacao && (
                    <div className="p-3 rounded-xl bg-black/20 border border-white/5">
                      <p className="text-[10px] text-white/40 italic">Nota: {e.observacao}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
        {meusExtras.length === 0 && (
          <div className="col-span-full py-20 flex flex-col items-center gap-4 bg-white/[0.02] rounded-3xl border border-dashed border-white/10">
            <Sparkles className="w-8 h-8 text-white/10" />
            <p className="text-sm text-white/30 font-medium italic">Nenhum módulo extra contratado no momento.</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}



