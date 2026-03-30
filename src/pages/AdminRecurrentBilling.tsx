import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, DollarSign, TrendingUp, AlertTriangle, CheckCircle2, Play, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { RecurrentBillingService } from "@/lib/recurrent-billing";

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

interface LogSistema {
  id: string;
  acao: string;
  descricao: string;
  usuario_id: string;
  created_at: string;
}

interface Financeiro {
  id: string;
  valor: number;
  descricao: string;
  tipo: string;
  vencimento: string;
  status: string;
  clientes: {
    nome: string;
  };
}

export default function AdminRecurrentBilling() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [lastExecution, setLastExecution] = useState<string | null>(null);
  const [upcomingBills, setUpcomingBills] = useState<Financeiro[]>([]);
  const [stats, setStats] = useState({
    totalClientes: 0,
    totalMensalidades: 0,
    proximasCobrancas: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const upcoming = await RecurrentBillingService.getUpcomingBills(15);
      setUpcomingBills(upcoming);

      const { data: clientes } = await supabase
        .from("extras_clientes")
        .select("cliente_id")
        .eq("status", "ativo")
        .in("categoria", ["mensal", "intermediario"])
        .gt("preco_mensal", 0);

      const { data: financeiro } = await supabase
        .from("financeiro")
        .select("valor")
        .like("descricao", "%RECURRENTE%")
        .eq("tipo", "entrada");

      const totalMensalidades = financeiro?.reduce((acc, f) => acc + Number(f.valor || 0), 0) || 0;

      setStats({
        totalClientes: new Set(clientes?.map(c => c.cliente_id)).size || 0,
        totalMensalidades: totalMensalidades,
        proximasCobrancas: upcoming.length
      });

      const { data: lastExec } = await supabase
        .from("logs_sistema")
        .select("created_at")
        .eq("acao", "GERACAO_COBRANCAS_RECURRENTES")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      setLastExecution(lastExec?.created_at || null);

    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    }
  };

  const handleGenerateRecurrentBills = async () => {
    setLoading(true);
    
    try {
      await RecurrentBillingService.generateMonthlyRecurrentBills();
      
      await supabase.from("logs_sistema").insert({
        acao: "GERACAO_COBRANCAS_RECURRENTES",
        descricao: "Geração automática de cobranças recorrentes mensais",
        usuario_id: "system"
      });

      toast({ 
        title: "✅ Cobranças Recorrentes Geradas!", 
        description: "Todas as mensalidades foram processadas com sucesso." 
      });
      
      await loadData();
      
    } catch (error) {
      console.error("Erro ao gerar cobranças recorrentes:", error);
      toast({ 
        title: "❌ Erro na Geração", 
        description: "Não foi possível gerar as cobranças recorrentes.", 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      className="space-y-6 p-6" 
      initial="hidden" 
      animate="show" 
      variants={fadeUp}
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Cobranças Recorrentes</h1>
          <p className="text-white/60">Gerenciamento de faturamento mensal automático</p>
        </div>
        
        <Button 
          onClick={handleGenerateRecurrentBills}
          disabled={loading}
          className="gradient-primary border-0 text-white"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Processando...
            </>
          ) : (
            <>
              <Play className="w-4 h-4 mr-2" />
              Gerar Cobranças do Mês
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass-card border-[0.5px]">
          <CardContent className="p-4 text-center">
            <div className="p-2 rounded-lg bg-emerald-500/10 w-fit mx-auto mb-2">
              <TrendingUp className="w-6 h-6 text-emerald-400" />
            </div>
            <p className="text-2xl font-bold text-white">{stats.totalClientes}</p>
            <p className="text-sm text-white/60">Clientes com Mensalidades</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-[0.5px]">
          <CardContent className="p-4 text-center">
            <div className="p-2 rounded-lg bg-blue-500/10 w-fit mx-auto mb-2">
              <DollarSign className="w-6 h-6 text-blue-400" />
            </div>
            <p className="text-2xl font-bold text-white">
              R$ {stats.totalMensalidades.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
            <p className="text-sm text-white/60">Receita Mensal Total</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-[0.5px]">
          <CardContent className="p-4 text-center">
            <div className="p-2 rounded-lg bg-amber-500/10 w-fit mx-auto mb-2">
              <CalendarDays className="w-6 h-6 text-amber-400" />
            </div>
            <p className="text-2xl font-bold text-white">{stats.proximasCobrancas}</p>
            <p className="text-sm text-white/60">Cobranças Próximas (15 dias)</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-[0.5px]">
          <CardContent className="p-4 text-center">
            <div className="p-2 rounded-lg bg-purple-500/10 w-fit mx-auto mb-2">
              <CheckCircle2 className="w-6 h-6 text-purple-400" />
            </div>
            <p className="text-sm font-bold text-white">
              {lastExecution 
                ? new Date(lastExecution).toLocaleDateString("pt-BR")
                : "Nunca executado"
              }
            </p>
            <p className="text-sm text-white/60">Última Execução</p>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card border-[0.5px]">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-amber-400" />
            Próximas Cobranças Recorrentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingBills.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <p className="text-white/60">Nenhuma cobrança recorrente próxima nos próximos 15 dias</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingBills.map((bill) => (
                <div key={bill.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
                  <div className="flex-1">
                    <p className="text-white font-medium">{bill.clientes.nome}</p>
                    <p className="text-sm text-white/60">
                      Vencimento: {new Date(bill.vencimento).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-amber-400">
                      R$ {Number(bill.valor).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </p>
                    <Badge variant="outline" className="text-xs border-amber-500/30 text-amber-400">
                      {new Date(bill.vencimento) <= new Date() ? "Vencida" : "A Vencer"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="glass-card border-[0.5px]">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-blue-400" />
            Como Funciona
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-emerald-400 mt-1.5" />
            <div>
              <p className="text-white font-medium">Geração Automática</p>
              <p className="text-sm text-white/60">Clique no botão para gerar todas as cobranças mensais do mês atual</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-blue-400 mt-1.5" />
            <div>
              <p className="text-white font-medium">Faturas Recorrentes</p>
              <p className="text-sm text-white/60">Sistema cria faturas automáticas para clientes com extras mensais</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-amber-400 mt-1.5" />
            <div>
              <p className="text-white font-medium">Integração Asaas</p>
              <p className="text-sm text-white/60">Links de pagamento gerados automaticamente no Asaas</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-purple-400 mt-1.5" />
            <div>
              <p className="text-white font-medium">Controle de Duplicidade</p>
              <p className="text-sm text-white/60">Sistema evita gerar faturas duplicadas para o mesmo mês</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
