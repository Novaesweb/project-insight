import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CalendarDays, CreditCard, DollarSign, CheckCircle2, Clock, AlertCircle, Users,
  FileText, ArrowLeft, Loader2, RefreshCw, Send, Eye, ExternalLink, Plus
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

// ── Types ──
interface ClienteRecorrente {
  cliente_id: string;
  cliente_nome: string;
  cliente_email: string;
  cliente_documento?: string;
  cliente_telefone?: string;
  extras: { id: string; nome: string; preco_mensal: number; status: string; data_ativacao: string }[];
  totalMensal: number;
}

interface FaturaMes {
  id: string;
  cliente_id: string;
  mes: string;
  ano: number;
  mes_numero: number;
  valor_total: number;
  status: string;
  forma_pagamento?: string;
  data_pagamento?: string;
  financeiro_id?: string;
  asaas_payment_id?: string;
  asaas_invoice_url?: string;
  extras_count: number;
  descricao?: string;
  vencimento?: string;
  created_at: string;
}

// ── Helpers ──
const MESES = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
const formatMes = (mes: string) => { const [a, m] = mes.split("-"); return `${MESES[parseInt(m)-1]}/${a}`; };

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: typeof Clock }> = {
  rascunho: { label: "Rascunho", variant: "outline", icon: FileText },
  pendente: { label: "Pendente", variant: "secondary", icon: Clock },
  pago_manualmente: { label: "Pago Manual", variant: "default", icon: CheckCircle2 },
  pago_asaas: { label: "Pago Asaas", variant: "default", icon: CheckCircle2 },
  em_atraso: { label: "Em Atraso", variant: "destructive", icon: AlertCircle },
};

/** Dia de corte: extras adicionados após este dia vão para o mês seguinte */
const DIA_CORTE = 20;

function getMesCompetencia(dataAtivacao: string): string {
  const d = new Date(dataAtivacao + "T00:00:00");
  let mes = d.getMonth() + 1;
  let ano = d.getFullYear();
  if (d.getDate() > DIA_CORTE) {
    mes++;
    if (mes > 12) { mes = 1; ano++; }
  }
  return `${ano}-${mes.toString().padStart(2, "0")}`;
}

function gerarOpcoesMeses(): { value: string; label: string }[] {
  const hoje = new Date();
  const opcoes: { value: string; label: string }[] = [];
  for (let i = -2; i <= 6; i++) {
    const d = new Date(hoje.getFullYear(), hoje.getMonth() + i, 1);
    const val = `${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2,"0")}`;
    opcoes.push({ value: val, label: formatMes(val) });
  }
  return opcoes;
}

// ── Component ──
export default function AdminRecurrentExtras() {
  const { toast } = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [clientes, setClientes] = useState<ClienteRecorrente[]>([]);
  const [selectedClientes, setSelectedClientes] = useState<Set<string>>(new Set());

  // Dialog: gerar fatura
  const [showGerarDialog, setShowGerarDialog] = useState(false);
  const [mesSelecionado, setMesSelecionado] = useState(() => {
    const h = new Date();
    return `${h.getFullYear()}-${(h.getMonth()+1).toString().padStart(2,"0")}`;
  });
  const [diaVencimento, setDiaVencimento] = useState("10");
  const [gerando, setGerando] = useState(false);

  // Dialog: histórico / faturas do cliente
  const [showClienteDialog, setShowClienteDialog] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState<ClienteRecorrente | null>(null);
  const [faturasMes, setFaturasMes] = useState<FaturaMes[]>([]);
  const [enviandoFinanceiro, setEnviandoFinanceiro] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  // ── Load data ──
  const loadClientes = useCallback(async () => {
    setLoading(true);
    try {
      const { data: extras } = await supabase
        .from("extras_clientes")
        .select("id, cliente_id, preco_mensal, status, data_ativacao, extras_catalogo(nome)")
        .gt("preco_mensal", 0)
        .eq("status", "ativo");

      const clienteIds = [...new Set(extras?.map(e => e.cliente_id) || [])];
      if (clienteIds.length === 0) { setClientes([]); setLoading(false); return; }

      const { data: clientesData } = await supabase
        .from("clientes")
        .select("id, nome, email, documento, telefone")
        .in("id", clienteIds);

      const cMap = new Map(clientesData?.map(c => [c.id, c]) || []);
      const grouped = new Map<string, ClienteRecorrente>();

      for (const e of extras || []) {
        const c = cMap.get(e.cliente_id);
        if (!c) continue;
        if (!grouped.has(e.cliente_id)) {
          grouped.set(e.cliente_id, {
            cliente_id: e.cliente_id, cliente_nome: c.nome, cliente_email: c.email,
            cliente_documento: c.documento ?? undefined, cliente_telefone: c.telefone ?? undefined,
            extras: [], totalMensal: 0,
          });
        }
        const g = grouped.get(e.cliente_id)!;
        g.extras.push({
          id: e.id, nome: (e.extras_catalogo as any)?.nome || "Extra",
          preco_mensal: Number(e.preco_mensal), status: e.status,
          data_ativacao: e.data_ativacao,
        });
        g.totalMensal += Number(e.preco_mensal);
      }
      setClientes(Array.from(grouped.values()).sort((a, b) => a.cliente_nome.localeCompare(b.cliente_nome)));
    } catch (err) {
      console.error("Erro:", err);
      toast({ title: "Erro ao carregar clientes", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { loadClientes(); }, [loadClientes]);

  // ── Gerar faturas (rascunho — NÃO vai pro financeiro) ──
  const handleGerarFaturas = async () => {
    if (selectedClientes.size === 0) {
      toast({ title: "Selecione pelo menos um cliente", variant: "destructive" });
      return;
    }
    setGerando(true);
    let ok = 0, erros = 0;
    const [anoStr, mesStr] = mesSelecionado.split("-");
    const ano = parseInt(anoStr);
    const mesNum = parseInt(mesStr);
    const vencDia = parseInt(diaVencimento) || 10;
    const vencimento = `${anoStr}-${mesStr}-${vencDia.toString().padStart(2, "0")}`;

    console.log("Gerando faturas para:", { selectedClientes: Array.from(selectedClientes), mesSelecionado, ano, mesNum, vencimento });

    for (const clienteId of selectedClientes) {
      const cliente = clientes.find(c => c.cliente_id === clienteId);
      if (!cliente) continue;

      try {
        console.log("Processando cliente:", cliente.cliente_nome);
        
        // Check existing
        const { data: existing, error: existingError } = await (supabase as any)
          .from("recurrent_billing_history")
          .select("id")
          .eq("cliente_id", clienteId)
          .eq("mes", mesSelecionado)
          .maybeSingle();

        console.log("Verificação de existente:", { existing, existingError });

        if (existing) {
          console.log(`Fatura duplicada encontrada para ${cliente.cliente_nome} no mês ${formatMes(mesSelecionado)}`);
          toast({ 
            title: `${cliente.cliente_nome} já tem fatura para ${formatMes(mesSelecionado)}`, 
            description: "Verifique no histórico do cliente ou escolha outro mês",
            variant: "destructive" 
          });
          erros++;
          continue;
        }

        // Calcular extras do mês (respeitar corte)
        const extrasDoMes = cliente.extras.filter(e => {
          const comp = getMesCompetencia(e.data_ativacao);
          return comp <= mesSelecionado; // extras ativados até este mês
        });

        console.log("Extras do mês:", extrasDoMes);

        const valorTotal = extrasDoMes.reduce((acc, e) => acc + e.preco_mensal, 0);
        if (valorTotal <= 0) { 
          console.log("Valor total zerado, pulando cliente");
          erros++; 
          continue; 
        }

        const descricao = `Cobrança Recorrente — ${formatMes(mesSelecionado)}\n` +
          extrasDoMes.map(e => `• ${e.nome}: R$ ${e.preco_mensal.toFixed(2)}/mês`).join("\n");

        const faturaData = {
          cliente_id: clienteId,
          mes: mesSelecionado,
          ano,
          mes_numero: mesNum,
          valor_total: valorTotal,
          status: "rascunho",
          extras_count: extrasDoMes.length,
          descricao,
          vencimento,
        };

        console.log("Inserindo fatura:", faturaData);

        // Criar como RASCUNHO (sem financeiro_id)
        const { data: insertedData, error: insertError } = await (supabase as any).from("recurrent_billing_history").insert(faturaData).select();

        console.log("Resultado da inserção:", { insertedData, insertError });

        if (insertError) {
          console.error("Erro ao inserir fatura:", insertError);
          erros++;
        } else {
          console.log("Fatura criada com sucesso:", insertedData);
          ok++;
        }
      } catch (err) {
        console.error("Erro gerando fatura:", err);
        erros++;
      }
    }

    setGerando(false);
    setSelectedClientes(new Set());
    setShowGerarDialog(false);
    if (ok > 0) toast({ title: `${ok} fatura(s) criada(s) como rascunho`, description: `Competência: ${formatMes(mesSelecionado)}` });
    if (erros > 0) toast({ title: `${erros} erro(s) ou duplicados`, variant: "destructive" });
    loadClientes();
  };

  // ── Load faturas de um cliente ──
  const openClienteHistorico = async (cliente: ClienteRecorrente) => {
    try {
      console.log("Carregando histórico do cliente:", cliente.cliente_id);
      
      // Primeiro, vamos verificar se há dados na tabela
      const { data: allData, error: allError } = await (supabase as any)
        .from("recurrent_billing_history")
        .select("*")
        .eq("cliente_id", cliente.cliente_id);
      
      console.log("TODOS os dados do cliente (sem ordenar):", allData);
      console.log("Erro em todos os dados:", allError);
      
      // Agora com ordenação
      const { data, error } = await (supabase as any)
        .from("recurrent_billing_history")
        .select("*")
        .eq("cliente_id", cliente.cliente_id)
        .order("ano", { ascending: false })
        .order("mes_numero", { ascending: false });
      
      console.log("Dados carregados (com ordenação):", data);
      console.log("Erro (com ordenação):", error);
      console.log("Quantidade de faturas:", data?.length || 0);
      
      if (data && data.length > 0) {
        console.log("Faturas encontradas:");
        data.forEach((fatura, index) => {
          console.log(`  ${index + 1}. ${formatMes(fatura.mes)} - ${fatura.status} - R$ ${fatura.valor_total} - ID: ${fatura.id}`);
        });
      } else {
        console.log("Nenhuma fatura encontrada para este cliente");
        
        // Vamos verificar se há alguma fatura para qualquer cliente
        const { data: anyData } = await (supabase as any)
          .from("recurrent_billing_history")
          .select("*")
          .limit(5);
        
        console.log("Exemplos de faturas no sistema:", anyData);
      }
      
      setFaturasMes(data || []);
      setSelectedCliente(cliente);
      setShowClienteDialog(true);
    } catch (err) {
      console.error("Erro ao carregar histórico:", err);
      toast({ title: "Erro ao carregar histórico", variant: "destructive" });
    }
  };

  // ── Enviar para financeiro + Asaas ──
  const handleEnviarFinanceiro = async (fatura: FaturaMes) => {
    if (!selectedCliente) return;
    setEnviandoFinanceiro(fatura.id);
    try {
      const venc = fatura.vencimento || (() => {
        const d = new Date(); d.setDate(d.getDate() + 10);
        return d.toISOString().split("T")[0];
      })();

      // 1. Criar no financeiro
      const { data: fin, error: finErr } = await supabase.from("financeiro").insert({
        cliente_id: fatura.cliente_id,
        tipo: "entrada",
        valor: fatura.valor_total,
        descricao: fatura.descricao || `Cobrança Recorrente — ${formatMes(fatura.mes)}`,
        data: new Date().toISOString().split("T")[0],
        vencimento: venc,
        status: "pendente",
      }).select().single();

      if (finErr || !fin) throw finErr;

      // 2. Atualizar recurrent_billing_history (sem enviar ao Asaas — isso é automático 3 dias antes do vencimento)
      await (supabase as any).from("recurrent_billing_history").update({
        status: "pendente",
        financeiro_id: fin.id,
        vencimento: venc,
        updated_at: new Date().toISOString(),
      }).eq("id", fatura.id);

      // Update local state
      setFaturasMes(prev => prev.map(f => f.id === fatura.id ? {
        ...f, status: "pendente", financeiro_id: fin.id,
      } : f));

      toast({
        title: "Enviado para o Financeiro!",
        description: "Fatura criada. O Asaas será acionado automaticamente 3 dias antes do vencimento.",
      });
    } catch (err: any) {
      console.error("Erro ao enviar:", err);
      toast({ title: "Erro ao enviar para financeiro", description: err?.message, variant: "destructive" });
    } finally {
      setEnviandoFinanceiro(null);
    }
  };

  // ── Update payment status ──
  const handleUpdateStatus = async (fatura: FaturaMes, newStatus: string) => {
    setUpdatingStatus(fatura.id);
    try {
      const formaPagamento = newStatus === "pago_manualmente" ? "manual" : newStatus === "pago_asaas" ? "asaas" : null;
      const dataPagamento = newStatus.includes("pago") ? new Date().toISOString().split("T")[0] : null;

      await (supabase as any).from("recurrent_billing_history").update({
        status: newStatus, forma_pagamento: formaPagamento, data_pagamento: dataPagamento,
        updated_at: new Date().toISOString(),
      }).eq("id", fatura.id);

      if (fatura.financeiro_id) {
        await supabase.from("financeiro").update({
          status: newStatus.includes("pago") ? "pago" : "pendente",
        }).eq("id", fatura.financeiro_id);
      }

      setFaturasMes(prev => prev.map(f => f.id === fatura.id ? {
        ...f, status: newStatus, forma_pagamento: formaPagamento, data_pagamento: dataPagamento,
      } : f));
      toast({ title: "Status atualizado!" });
    } catch {
      toast({ title: "Erro ao atualizar status", variant: "destructive" });
    } finally {
      setUpdatingStatus(null);
    }
  };

  // ── Computed ──
  const totalSelecionado = Array.from(selectedClientes).reduce((t, id) => {
    return t + (clientes.find(c => c.cliente_id === id)?.totalMensal || 0);
  }, 0);

  const toggleCliente = (id: string) => {
    setSelectedClientes(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const opcoesMeses = gerarOpcoesMeses();

  return (
    <motion.div className="space-y-4 sm:space-y-6 p-3 sm:p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      {/* Header */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg sm:text-2xl font-bold text-foreground">Extras Recorrentes</h1>
            <p className="text-[10px] sm:text-xs text-muted-foreground">
              Controle mensal • Gere faturas e envie ao financeiro manualmente
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={loadClientes} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-1.5" /> Atualizar
          </Button>
          <Button
            onClick={() => setShowGerarDialog(true)}
            disabled={selectedClientes.size === 0}
            size="sm"
          >
            <Plus className="w-4 h-4 mr-1.5" /> Gerar Fatura ({selectedClientes.size})
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        {[
          { icon: Users, label: "Clientes", value: clientes.length, color: "text-blue-500" },
          { icon: CheckCircle2, label: "Selecionados", value: selectedClientes.size, color: "text-emerald-500" },
          { icon: DollarSign, label: "Total Sel.", value: `R$ ${Number(totalSelecionado).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, color: "text-amber-500" },
        ].map((s, i) => (
          <Card key={i}>
            <CardContent className="p-3 sm:p-4 flex items-center gap-2 sm:gap-3">
              <s.icon className={`w-5 h-5 ${s.color} shrink-0`} />
              <div className="min-w-0">
                <p className="text-sm sm:text-lg font-bold text-foreground truncate">{s.value}</p>
                <p className="text-[9px] sm:text-[10px] text-muted-foreground uppercase font-bold truncate">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Lista de clientes */}
      <Card>
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-xs sm:text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-primary" /> Clientes Recorrentes
          </CardTitle>
          <Button
            variant="ghost" size="sm"
            onClick={() => {
              if (selectedClientes.size === clientes.length) setSelectedClientes(new Set());
              else setSelectedClientes(new Set(clientes.map(c => c.cliente_id)));
            }}
            className="text-xs text-muted-foreground"
          >
            {selectedClientes.size === clientes.length ? "Desmarcar" : "Marcar todos"}
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-12 text-center"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground mx-auto" /></div>
          ) : clientes.length === 0 ? (
            <div className="py-12 text-center">
              <AlertCircle className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
              <p className="text-xs text-muted-foreground">Nenhum cliente com extras recorrentes</p>
            </div>
          ) : (
            <div className="space-y-2">
              {clientes.map((c) => (
                <div
                  key={c.cliente_id}
                  className={`p-3 sm:p-4 rounded-lg border transition-all cursor-pointer ${
                    selectedClientes.has(c.cliente_id) ? "bg-primary/5 border-primary/30" : "bg-secondary/30 border-border hover:bg-secondary/60"
                  }`}
                  onClick={() => toggleCliente(c.cliente_id)}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={selectedClientes.has(c.cliente_id)}
                      onCheckedChange={() => toggleCliente(c.cliente_id)}
                      className="mt-0.5 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-4">
                        <div className="min-w-0">
                          <h3 className="text-sm font-bold text-foreground truncate">{c.cliente_nome}</h3>
                          <p className="text-[10px] text-muted-foreground truncate">{c.cliente_email}</p>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                          <div className="text-right">
                            <p className="text-sm font-bold text-foreground">
                              R$ {c.totalMensal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                            </p>
                            <p className="text-[10px] text-muted-foreground">{c.extras.length} extras</p>
                          </div>
                          <Button
                            size="sm" variant="outline" className="h-7 text-xs shrink-0"
                            onClick={(e) => { e.stopPropagation(); openClienteHistorico(c); }}
                          >
                            <CalendarDays className="w-3 h-3 mr-1" /> Meses
                          </Button>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {c.extras.map(e => (
                          <span key={e.id} className="text-[9px] border border-border rounded-full px-1.5 py-0.5 text-muted-foreground">
                            {e.nome} • R$ {e.preco_mensal.toFixed(2)}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Como funciona */}
      <Card>
        <CardContent className="p-4 space-y-2">
          <h3 className="text-xs font-black text-foreground uppercase tracking-wider mb-3">Como funciona</h3>
          {[
            { color: "bg-blue-500", text: `Extras adicionados após o dia ${DIA_CORTE} vão para o mês seguinte` },
            { color: "bg-emerald-500", text: "Selecione clientes → Gerar Fatura → escolha mês e vencimento" },
            { color: "bg-amber-500", text: "A fatura fica como RASCUNHO até você clicar 'Enviar ao Financeiro'" },
            { color: "bg-purple-500", text: "O Asaas é acionado automaticamente 3 dias antes do vencimento" },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className={`w-1.5 h-1.5 rounded-full ${item.color} shrink-0 mt-1.5`} />
              <p className="text-[11px] text-muted-foreground">{item.text}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* ── Dialog: Gerar Fatura ── */}
      <Dialog open={showGerarDialog} onOpenChange={setShowGerarDialog}>
        <DialogContent className="max-w-[95vw] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground text-sm sm:text-base flex items-center gap-2">
              <FileText className="w-4 h-4" /> Gerar Fatura Recorrente
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-secondary">
              <p className="text-xs text-muted-foreground mb-1">Clientes selecionados</p>
              <p className="text-lg font-bold text-foreground">{selectedClientes.size}</p>
              <p className="text-xs text-muted-foreground">
                Total: R$ {Number(totalSelecionado).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-foreground">Mês de competência</Label>
              <Select value={mesSelecionado} onValueChange={setMesSelecionado}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {opcoesMeses.map(o => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-foreground">Dia de vencimento</Label>
              <Input
                type="number" min="1" max="28" value={diaVencimento}
                onChange={e => setDiaVencimento(e.target.value)}
                className="text-foreground"
              />
              <p className="text-[10px] text-muted-foreground">
                Vencimento: {diaVencimento.padStart(2, "0")}/{mesSelecionado.split("-")[1]}/{mesSelecionado.split("-")[0]}
              </p>
            </div>

            <Button onClick={handleGerarFaturas} disabled={gerando} className="w-full">
              {gerando ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Gerando...</>
              ) : (
                <><FileText className="w-4 h-4 mr-2" /> Criar Faturas como Rascunho</>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Dialog: Histórico mensal do cliente ── */}
      <Dialog open={showClienteDialog} onOpenChange={setShowClienteDialog}>
        <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2 text-sm sm:text-base">
              <CalendarDays className="w-4 h-4 sm:w-5 sm:h-5" />
              {selectedCliente?.cliente_nome} — Faturas Mensais
            </DialogTitle>
          </DialogHeader>

          {selectedCliente && (
            <div className="space-y-4">
              {/* Resumo */}
              <div className="grid grid-cols-3 gap-2">
                <div className="p-2 sm:p-3 rounded-lg bg-secondary">
                  <p className="text-[9px] sm:text-xs text-muted-foreground">Valor/mês</p>
                  <p className="text-sm sm:text-lg font-bold text-foreground">
                    R$ {selectedCliente.totalMensal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="p-2 sm:p-3 rounded-lg bg-secondary">
                  <p className="text-[9px] sm:text-xs text-muted-foreground">Extras</p>
                  <p className="text-sm sm:text-lg font-bold text-foreground">{selectedCliente.extras.length}</p>
                </div>
                <div className="p-2 sm:p-3 rounded-lg bg-secondary">
                  <p className="text-[9px] sm:text-xs text-muted-foreground">Faturas</p>
                  <p className="text-sm sm:text-lg font-bold text-foreground">{faturasMes.length}</p>
                </div>
              </div>

              {/* Extras */}
              <div className="flex flex-wrap gap-1">
                {selectedCliente.extras.map(e => (
                  <span key={e.id} className="text-[9px] sm:text-xs border border-border rounded-full px-2 py-0.5 text-muted-foreground">
                    {e.nome} — R$ {e.preco_mensal.toFixed(2)}
                  </span>
                ))}
              </div>

              {/* Faturas por mês */}
              {faturasMes.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
                  <p className="text-xs text-muted-foreground">Nenhuma fatura gerada ainda</p>
                  <p className="text-[10px] text-muted-foreground mt-1">Selecione o cliente e clique em "Gerar Fatura"</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {faturasMes.map((f) => {
                    const st = statusConfig[f.status] || statusConfig.pendente;
                    const isRascunho = f.status === "rascunho";
                    const isPendente = f.status === "pendente";
                    const isPago = f.status.includes("pago");

                    return (
                      <Card key={f.id} className={isRascunho ? "border-dashed" : ""}>
                        <CardContent className="p-3 sm:p-4 space-y-3">
                          {/* Header */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-sm sm:text-base font-bold text-foreground">{formatMes(f.mes)}</span>
                              <Badge variant={st.variant} className="text-[10px]">{st.label}</Badge>
                            </div>
                            <span className="text-sm sm:text-base font-bold text-foreground">
                              R$ {Number(f.valor_total).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                            </span>
                          </div>

                          {/* Info */}
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] sm:text-xs text-muted-foreground">
                            <span>{f.extras_count} extras</span>
                            {f.vencimento && <span>Venc: {new Date(f.vencimento + "T00:00:00").toLocaleDateString("pt-BR")}</span>}
                            {f.forma_pagamento && <span>Via: {f.forma_pagamento === "asaas" ? "Asaas" : "Manual"}</span>}
                            {f.data_pagamento && <span>Pago: {new Date(f.data_pagamento).toLocaleDateString("pt-BR")}</span>}
                          </div>

                          {/* Actions */}
                          <div className="flex flex-wrap gap-2">
                            {isRascunho && (
                              <Button
                                size="sm" className="text-xs h-8 flex-1 sm:flex-none"
                                disabled={enviandoFinanceiro === f.id}
                                onClick={() => handleEnviarFinanceiro(f)}
                              >
                                {enviandoFinanceiro === f.id ? (
                                  <><Loader2 className="w-3 h-3 mr-1 animate-spin" /> Enviando...</>
                                ) : (
                                  <><Send className="w-3 h-3 mr-1" /> Enviar ao Financeiro</>
                                )}
                              </Button>
                            )}

                            {isPendente && (
                              <>
                                <Button size="sm" variant="outline" className="text-xs h-8 flex-1 sm:flex-none"
                                  disabled={updatingStatus === f.id}
                                  onClick={() => handleUpdateStatus(f, "pago_manualmente")}>
                                  {updatingStatus === f.id ? "..." : "Pago Manual"}
                                </Button>
                                <Button size="sm" variant="outline" className="text-xs h-8 flex-1 sm:flex-none"
                                  disabled={updatingStatus === f.id}
                                  onClick={() => handleUpdateStatus(f, "pago_asaas")}>
                                  {updatingStatus === f.id ? "..." : "Pago Asaas"}
                                </Button>
                              </>
                            )}

                            {f.asaas_invoice_url && (
                              <Button size="sm" variant="outline" className="text-xs h-8"
                                onClick={() => window.open(f.asaas_invoice_url!, "_blank")}>
                                <ExternalLink className="w-3 h-3 mr-1" /> Fatura Asaas
                              </Button>
                            )}

                            {isPago && (
                              <div className="flex items-center gap-1 text-emerald-500 text-xs">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Pago
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
