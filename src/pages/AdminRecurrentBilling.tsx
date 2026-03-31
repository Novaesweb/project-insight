import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
  DollarSign, TrendingUp, CheckCircle2, RefreshCw, Users, FileText, Loader2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AsaasService } from "@/lib/asaas-service";

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

interface ClienteRecorrente {
  cliente_id: string;
  cliente_nome: string;
  cliente_email: string;
  extras: {
    id: string;
    nome: string;
    preco_mensal: number;
    status: string;
  }[];
  totalMensal: number;
}

export default function AdminRecurrentBilling() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [clientes, setClientes] = useState<ClienteRecorrente[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const loadData = useCallback(async () => {
    setLoading(true);
    console.log("🔍 Carregando dados de cobrança recorrente...");

    // Buscar extras recorrentes (preco_mensal > 0 e status ativo)
    console.log("📊 Buscando extras recorrentes...");
    const { data: extras, error: extrasError } = await supabase
      .from("extras_clientes")
      .select("id, cliente_id, preco_mensal, status, extras_catalogo(nome)")
      .gt("preco_mensal", 0)
      .eq("status", "ativo");

    if (extrasError) {
      console.error("❌ Erro ao buscar extras:", extrasError);
    }

    console.log("📋 Extras encontrados:", extras?.length || 0);

    if (!extras || extras.length === 0) {
      console.log("⚠️ Nenhum extra recorrente encontrado");
      setClientes([]);
      setLoading(false);
      return;
    }

    console.log("💰 Extras:", extras);

    // Buscar nomes dos clientes
    const clienteIds = [...new Set(extras.map(e => e.cliente_id))];
    console.log("👥 Buscando dados dos clientes:", clienteIds);
    
    const { data: clientesData, error: clientesError } = await supabase
      .from("clientes")
      .select("id, nome, email")
      .in("id", clienteIds);

    if (clientesError) {
      console.error("❌ Erro ao buscar clientes:", clientesError);
    }

    console.log("👤 Clientes encontrados:", clientesData?.length || 0);

    const clienteMap = new Map(clientesData?.map(c => [c.id, c]) || []);

    // Agrupar por cliente
    const grouped = new Map<string, ClienteRecorrente>();
    for (const e of extras) {
      const c = clienteMap.get(e.cliente_id);
      if (!c) {
        console.error("❌ Cliente não encontrado para extra:", e.cliente_id);
        continue;
      }

      if (!grouped.has(e.cliente_id)) {
        grouped.set(e.cliente_id, {
          cliente_id: e.cliente_id,
          cliente_nome: c.nome,
          cliente_email: c.email,
          extras: [],
          totalMensal: 0,
        });
      }
      const grupo = grouped.get(e.cliente_id)!;
      grupo.extras.push({
        id: e.id,
        nome: (e.extras_catalogo as any)?.nome || "Extra",
        preco_mensal: Number(e.preco_mensal),
        status: e.status,
      });
      grupo.totalMensal += Number(e.preco_mensal);
    }

    const clientesArray = Array.from(grouped.values()).sort((a, b) => a.cliente_nome.localeCompare(b.cliente_nome));
    console.log("📊 Clientes com cobranças recorrentes:", clientesArray.length);
    console.log("💰 Totais mensais:", clientesArray.map(c => ({ nome: c.cliente_nome, total: c.totalMensal })));

    setClientes(clientesArray);
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === clientes.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(clientes.map(c => c.cliente_id)));
    }
  };

  const handleGenerateBills = async () => {
    if (selected.size === 0) {
      toast({ title: "Selecione ao menos um cliente", variant: "destructive" });
      return;
    }

    console.log("🚀 Iniciando geração de cobranças Asaas...");
    console.log("📊 Clientes selecionados:", selected.size);
    console.log("👥 IDs dos clientes:", Array.from(selected));

    setGenerating(true);
    const mesAtual = new Date().toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
    let successCount = 0;
    let errorCount = 0;

    for (const clienteId of selected) {
      const cliente = clientes.find(c => c.cliente_id === clienteId);
      if (!cliente) {
        console.error("❌ Cliente não encontrado:", clienteId);
        continue;
      }

      console.log(`🔄 Processando cliente: ${cliente.cliente_nome} (${clienteId})`);
      console.log(`💰 Valor total: R$ ${cliente.totalMensal.toFixed(2)}`);

      try {
        // 1. Criar/atualizar cliente no Asaas
        console.log("👤 Criando cliente no Asaas...");
        const asaasCustomer = await AsaasService.getOrCreateCustomer({
          name: cliente.cliente_nome,
          email: cliente.cliente_email,
          externalReference: clienteId
        });
        console.log("✅ Cliente Asaas criado:", asaasCustomer.id);

        // 2. Gerar fatura consolidada no banco
        console.log("📄 Criando fatura no banco...");
        const { data: financeiroRecord, error: financeiroError } = await supabase
          .from("financeiro")
          .insert({
            cliente_id: clienteId,
            tipo: "receita",
            valor: cliente.totalMensal,
            descricao: `Cobrança Recorrente — ${mesAtual}\n` + 
              cliente.extras.map(extra => 
                `• ${extra.nome}: R$ ${Number(extra.preco_mensal).toFixed(2)}/mês`
              ).join('\n'),
            data: new Date().toISOString().split("T")[0],
            vencimento: new Date(new Date().setDate(new Date().getDate() + 10)).toISOString().split("T")[0],
            status: "pendente",
          })
          .select()
          .single();

        if (financeiroError) {
          errorCount++;
          console.error("❌ Erro ao criar fatura:", financeiroError);
          continue;
        }

        console.log("✅ Fatura criada no banco:", financeiroRecord.id);

        // 3. Gerar cobrança no Asaas
        if (financeiroRecord) {
          console.log("💳 Gerando cobrança no Asaas...");
          const payment = await AsaasService.createPayment({
            customer: asaasCustomer.id,
            billingType: "UNDEFINED",
            value: cliente.totalMensal,
            dueDate: new Date(new Date().setDate(new Date().getDate() + 10)).toISOString().split('T')[0],
            description: `Cobrança Recorrente - ${mesAtual} - ${cliente.extras.length} Extras`
          });
          console.log("✅ Cobrança Asaas criada:", payment.id);

          // 4. Atualizar descrição com link do Asaas
          const novaDescricao = `${financeiroRecord.descricao}\n(Asaas: ${payment.invoiceUrl})`;
          await supabase
            .from("financeiro")
            .update({ descricao: novaDescricao })
            .eq("id", financeiroRecord.id);

          successCount++;
          console.log(`🎉 Cobrança Asaas gerada para ${cliente.cliente_nome}`);
        }

      } catch (error) {
        errorCount++;
        console.error("❌ Erro ao gerar cobrança Asaas:", error);
        toast({ 
          title: "Erro no Asaas", 
          description: `Cliente: ${cliente.cliente_nome} - ${(error as Error).message}`, 
          variant: "destructive" 
        });
      }
    }

    console.log(`📊 RESULTADO: ${successCount} sucesso, ${errorCount} erros`);

    setGenerating(false);

    if (errorCount > 0) {
      toast({ title: `${successCount} cobranças geradas, ${errorCount} erros`, variant: "destructive" });
    } else {
      toast({ title: `${successCount} cobranças Asaas geradas!`, description: `Para ${selected.size} cliente(s) selecionado(s).` });
    }

    setSelected(new Set());
    loadData(); // Recarregar dados
  };

  const totalGeralMensal = clientes.reduce((acc, c) => acc + c.totalMensal, 0);
  const totalSelecionado = clientes.filter(c => selected.has(c.cliente_id)).reduce((acc, c) => acc + c.totalMensal, 0);

  return (
    <motion.div className="space-y-6 p-3 sm:p-6" initial="hidden" animate="show" variants={fadeUp}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white mb-1">Cobranças Recorrentes</h1>
          <p className="text-xs text-white/50">Selecione os clientes e gere as cobranças com Asaas</p>
        </div>

        <Button
          onClick={handleGenerateBills}
          disabled={generating || selected.size === 0}
          className="gradient-primary border-0 text-white"
        >
          {generating ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Gerando...</>
          ) : (
            <><FileText className="w-4 h-4 mr-2" /> Gerar Cobranças Asaas ({selected.size})</>
          )}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="glass-card border-[0.5px]">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10"><Users className="w-5 h-5 text-emerald-400" /></div>
            <div>
              <p className="text-xl font-black text-white">{clientes.length}</p>
              <p className="text-[10px] text-white/50 uppercase font-bold">Clientes Recorrentes</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card border-[0.5px]">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10"><TrendingUp className="w-5 h-5 text-blue-400" /></div>
            <div>
              <p className="text-xl font-black text-white">R$ {totalGeralMensal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
              <p className="text-[10px] text-white/50 uppercase font-bold">Total Mensal</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card border-[0.5px]">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10"><DollarSign className="w-5 h-5 text-amber-400" /></div>
            <div>
              <p className="text-xl font-black text-white">R$ {totalSelecionado.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
              <p className="text-[10px] text-white/50 uppercase font-bold">Selecionado p/ Cobrança</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de clientes recorrentes */}
      <Card className="glass-card border-[0.5px]">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-primary" /> Clientes com Extras Recorrentes
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-10 text-white/40 text-xs">Carregando...</div>
          ) : clientes.length === 0 ? (
            <div className="text-center py-10">
              <CheckCircle2 className="w-10 h-10 text-white/10 mx-auto mb-3" />
              <p className="text-xs text-white/30">Nenhum cliente com extras recorrentes ativos</p>
            </div>
          ) : (
            <Table className="min-w-[500px]">
              <TableHeader>
                <TableRow className="border-white/5">
                  <TableHead className="w-10">
                    <Checkbox
                      checked={selected.size === clientes.length && clientes.length > 0}
                      onCheckedChange={toggleAll}
                    />
                  </TableHead>
                  <TableHead className="text-[10px] text-white/50 uppercase">Cliente</TableHead>
                  <TableHead className="text-[10px] text-white/50 uppercase">Extras</TableHead>
                  <TableHead className="text-[10px] text-white/50 uppercase text-right">Valor Mensal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clientes.map((c) => (
                  <TableRow
                    key={c.cliente_id}
                    className={`border-white/5 cursor-pointer transition-colors ${selected.has(c.cliente_id) ? 'bg-primary/5' : 'hover:bg-white/[0.02]'}`}
                    onClick={() => toggleSelect(c.cliente_id)}
                  >
                    <TableCell onClick={e => e.stopPropagation()}>
                      <Checkbox
                        checked={selected.has(c.cliente_id)}
                        onCheckedChange={() => toggleSelect(c.cliente_id)}
                      />
                    </TableCell>
                    <TableCell>
                      <p className="text-sm font-bold text-white">{c.cliente_nome}</p>
                      <p className="text-[10px] text-white/30">{c.cliente_email}</p>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {c.extras.map((e) => (
                          <span key={e.id} className="inline-flex items-center text-[9px] border border-blue-400/20 text-blue-400 bg-blue-400/5 rounded-full px-2 py-0.5">
                            {e.nome}
                          </span>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="text-sm font-bold text-white">
                        R$ {c.totalMensal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Instruções */}
      <Card className="glass-card border-[0.5px]">
        <CardContent className="p-4 space-y-2">
          <h3 className="text-xs font-black text-white uppercase tracking-wider mb-3">Como funciona</h3>
          {[
            { color: "bg-emerald-400", text: "Selecione os clientes que deseja cobrar este mês" },
            { color: "bg-blue-400", text: "Clique em 'Gerar Cobranças' — as faturas vão para o Financeiro como pendentes" },
            { color: "bg-amber-400", text: "Nenhuma cobrança é gerada automaticamente — você tem controle total" },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className={`w-1.5 h-1.5 rounded-full ${item.color} shrink-0`} />
              <p className="text-[11px] text-white/50">{item.text}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  );
}
