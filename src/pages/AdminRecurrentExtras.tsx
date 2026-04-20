import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  CreditCard, CheckCircle2, AlertCircle, ArrowLeft, Loader2, RefreshCw, Plus 
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useRealtimeRefresh } from "@/hooks/useRealtimeRefresh";
import { notifyClientPanel } from "@/lib/user-notifications";

// Componentes Modularizados
import { RecurrentBillingStats } from "@/features/recurrent-billing/components/RecurrentBillingStats";
import { RecurrentBillingGuide } from "@/features/recurrent-billing/components/RecurrentBillingGuide";
import { ClienteRecorrenteCard } from "@/features/recurrent-billing/components/ClienteRecorrenteCard";
import { GerarFaturaDialog } from "@/features/recurrent-billing/components/GerarFaturaDialog";
import { EditFaturaDialog } from "@/features/recurrent-billing/components/EditFaturaDialog";
import { ClienteHistoricoDialog } from "@/features/recurrent-billing/components/ClienteHistoricoDialog";

// Tipos e Helpers
import { 
  formatMes, 
  type ClienteRecorrente, 
  type FaturaMes 
} from "@/features/recurrent-billing/types";

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
  const [deletingFatura, setDeletingFatura] = useState<string | null>(null);
  
  // Dialog: editar fatura
  const [editingFatura, setEditingFatura] = useState<FaturaMes | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editValor, setEditValor] = useState("");
  const [editDescricao, setEditDescricao] = useState("");

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
      console.error("Erro ao carregar extras recorrentes");
      toast({ title: "Erro ao carregar clientes", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { loadClientes(); }, [loadClientes]);

  useRealtimeRefresh(
    [
      { table: "extras_clientes" },
      { table: "clientes" },
      { table: "recurrent_billing_history" },
    ],
    loadClientes,
    { channelPrefix: "admin-recurrent-extras", debounceMs: 400 },
  );

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

    for (const clienteId of selectedClientes) {
      const cliente = clientes.find(c => c.cliente_id === clienteId);
      if (!cliente) continue;

      try {
        const { data: existing } = await (supabase as any)
          .from("recurrent_billing_history")
          .select("id")
          .eq("cliente_id", clienteId)
          .eq("mes", mesSelecionado)
          .maybeSingle();

        if (existing) {
          toast({ 
            title: `${cliente.cliente_nome} já tem fatura para ${formatMes(mesSelecionado)}`, 
            description: "Verifique no histórico do cliente ou escolha outro mês",
            variant: "destructive" 
          });
          erros++;
          continue;
        }

        const extrasDoMes = cliente.extras.filter(e => {
          const comp = getMesCompetencia(e.data_ativacao);
          return comp <= mesSelecionado;
        });

        const valorTotal = extrasDoMes.reduce((acc, e) => acc + e.preco_mensal, 0);
        if (valorTotal <= 0) { erros++; continue; }

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

        const { error: insertError } = await (supabase as any).from("recurrent_billing_history").insert(faturaData).select();

        if (insertError) {
          console.error("Erro ao inserir fatura recorrente");
          erros++;
        } else {
          ok++;
        }
      } catch (err) {
        console.error("Erro ao gerar fatura recorrente");
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

  const loadClienteHistorico = useCallback(async (clienteId: string) => {
    try {
      const { data, error } = await (supabase as any)
        .from("recurrent_billing_history")
        .select("*")
        .eq("cliente_id", clienteId)
        .order("ano", { ascending: true })
        .order("mes_numero", { ascending: true });
      
      if (error) throw error;
      setFaturasMes(data || []);
    } catch (err) {
      console.error("Erro ao carregar histórico de faturamento");
      toast({ title: "Erro ao carregar histórico", variant: "destructive" });
    }
  }, [toast]);

  const openClienteHistorico = async (cliente: ClienteRecorrente) => {
    await loadClienteHistorico(cliente.cliente_id);
    setSelectedCliente(cliente);
    setShowClienteDialog(true);
  };

  useRealtimeRefresh(
    [
      { table: "recurrent_billing_history", filter: selectedCliente ? `cliente_id=eq.${selectedCliente.cliente_id}` : undefined },
      { table: "financeiro", filter: selectedCliente ? `cliente_id=eq.${selectedCliente.cliente_id}` : undefined },
    ],
    async () => {
      if (selectedCliente) {
        await loadClienteHistorico(selectedCliente.cliente_id);
      }
    },
    {
      enabled: showClienteDialog && Boolean(selectedCliente),
      channelPrefix: "admin-recurrent-history",
      debounceMs: 400,
    },
  );

  const handleEnviarFinanceiro = async (fatura: FaturaMes) => {
    if (!selectedCliente) return;
    setEnviandoFinanceiro(fatura.id);
    try {
      const venc = fatura.vencimento || (() => {
        const d = new Date(); d.setDate(d.getDate() + 10);
        return d.toISOString().split("T")[0];
      })();

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

      await (supabase as any).from("recurrent_billing_history").update({
        status: "pendente", financeiro_id: fin.id, vencimento: venc, updated_at: new Date().toISOString(),
      }).eq("id", fatura.id);

      setFaturasMes(prev => prev.map(f => f.id === fatura.id ? { ...f, status: "pendente", financeiro_id: fin.id } : f));
      toast({ title: "Enviado para o Financeiro!" });

      await notifyClientPanel(fatura.cliente_id, {
        title: "Nova cobrança recorrente disponível",
        body: `${fatura.descricao || `Cobrança recorrente de ${formatMes(fatura.mes)}`} foi adicionada ao seu financeiro.`,
        url: "/cliente/faturas",
      });
    } catch (err: any) {
      toast({ title: "Erro ao enviar para financeiro", description: err?.message, variant: "destructive" });
    } finally {
      setEnviandoFinanceiro(null);
    }
  };

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
        await supabase.from("financeiro").update({ status: newStatus.includes("pago") ? "pago" : "pendente" }).eq("id", fatura.financeiro_id);
      }

      setFaturasMes(prev => prev.map(f => f.id === fatura.id ? { ...f, status: newStatus, forma_pagamento: formaPagamento, data_pagamento: dataPagamento } : f));
      toast({ title: "Status atualizado!" });
    } catch {
      toast({ title: "Erro ao atualizar status", variant: "destructive" });
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleDeleteFatura = async (fatura: FaturaMes) => {
    if (!window.confirm(`Tem certeza que deseja excluir a fatura de ${formatMes(fatura.mes)}?`)) return;
    setDeletingFatura(fatura.id);
    try {
      if (fatura.financeiro_id) await supabase.from("financeiro").delete().eq("id", fatura.financeiro_id);
      const { error } = await (supabase as any).from("recurrent_billing_history").delete().eq("id", fatura.id);
      if (error) throw error;
      setFaturasMes(prev => prev.filter(f => f.id !== fatura.id));
      toast({ title: "Fatura excluída!" });
    } catch (err: any) {
      toast({ title: "Erro ao excluir fatura", description: err?.message, variant: "destructive" });
    } finally {
      setDeletingFatura(null);
    }
  };

  const handleEditFatura = (fatura: FaturaMes) => {
    setEditingFatura(fatura);
    setEditValor(fatura.valor_total.toString());
    setEditDescricao(fatura.descricao || "");
    setShowEditDialog(true);
  };

  const handleSaveEdit = async () => {
    if (!editingFatura) return;
    try {
      const novoValor = parseFloat(editValor);
      if (isNaN(novoValor) || novoValor <= 0) {
        toast({ title: "Valor inválido", variant: "destructive" });
        return;
      }
      const { error } = await (supabase as any).from("recurrent_billing_history").update({
        valor_total: novoValor, descricao: editDescricao, updated_at: new Date().toISOString(),
      }).eq("id", editingFatura.id);
      if (error) throw error;
      if (editingFatura.financeiro_id) {
        await supabase.from("financeiro").update({ valor: novoValor, descricao: editDescricao || `Cobrança Recorrente — ${formatMes(editingFatura.mes)}` }).eq("id", editingFatura.financeiro_id);
      }
      setFaturasMes(prev => prev.map(f => f.id === editingFatura.id ? { ...f, valor_total: novoValor, descricao: editDescricao } : f));
      setShowEditDialog(false);
      setEditingFatura(null);
      toast({ title: "Fatura atualizada!" });
    } catch (err: any) {
      toast({ title: "Erro ao editar fatura", description: err?.message, variant: "destructive" });
    }
  };

  const totalSelecionado = Array.from(selectedClientes).reduce((t, id) => {
    return t + (clientes.find(c => c.cliente_id === id)?.totalMensal || 0);
  }, 0);

  const toggleCliente = (id: string) => {
    setSelectedClientes(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
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
            <p className="text-[10px] sm:text-xs text-muted-foreground">Controle mensal • Gere faturas manualmente</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={loadClientes} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-1.5" /> Atualizar
          </Button>
          <Button onClick={() => setShowGerarDialog(true)} disabled={selectedClientes.size === 0} size="sm">
            <Plus className="w-4 h-4 mr-1.5" /> Gerar Fatura ({selectedClientes.size})
          </Button>
        </div>
      </div>

      <RecurrentBillingStats 
        totalClientes={clientes.length} 
        totalSelecionados={selectedClientes.size} 
        totalSelecionadoValor={totalSelecionado} 
      />

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
                <ClienteRecorrenteCard 
                  key={c.cliente_id}
                  cliente={c}
                  isSelected={selectedClientes.has(c.cliente_id)}
                  onToggle={toggleCliente}
                  onOpenHistory={openClienteHistorico}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <RecurrentBillingGuide diaCorte={DIA_CORTE} />

      <GerarFaturaDialog 
        open={showGerarDialog} 
        onOpenChange={setShowGerarDialog}
        selectedCount={selectedClientes.size}
        totalValor={totalSelecionado}
        mesSelecionado={mesSelecionado}
        onMesChange={setMesSelecionado}
        diaVencimento={diaVencimento}
        onDiaVencimentoChange={setDiaVencimento}
        opcoesMeses={opcoesMeses}
        onGerar={handleGerarFaturas}
        gerando={gerando}
      />

      <ClienteHistoricoDialog 
        open={showClienteDialog}
        onOpenChange={setShowClienteDialog}
        cliente={selectedCliente}
        faturas={faturasMes}
        enviandoFinanceiro={enviandoFinanceiro}
        updatingStatus={updatingStatus}
        deletingFatura={deletingFatura}
        onEdit={handleEditFatura}
        onDelete={handleDeleteFatura}
        onSendFinanceiro={handleEnviarFinanceiro}
        onUpdateStatus={handleUpdateStatus}
      />

      <EditFaturaDialog 
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        fatura={editingFatura}
        valor={editValor}
        onValorChange={setEditValor}
        descricao={editDescricao}
        onDescricaoChange={setEditDescricao}
        onSave={handleSaveEdit}
      />
    </motion.div>
  );
}
