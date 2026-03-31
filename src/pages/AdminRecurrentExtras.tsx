import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CalendarDays, CreditCard, DollarSign, CheckCircle2, Clock, AlertCircle, Users, FileText, ArrowLeft, Loader2, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface ClienteRecorrente {
  cliente_id: string;
  cliente_nome: string;
  cliente_email: string;
  extras: { id: string; nome: string; preco_mensal: number; status: string }[];
  totalMensal: number;
}

const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pendente: { label: "Pendente", variant: "secondary" },
  pago_manualmente: { label: "Pago Manual", variant: "default" },
  pago_asaas: { label: "Pago Asaas", variant: "default" },
  em_atraso: { label: "Em Atraso", variant: "destructive" },
};

const meses = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
function formatMes(mes: string) {
  const [ano, m] = mes.split("-");
  return `${meses[parseInt(m) - 1]}/${ano}`;
}

export default function AdminRecurrentExtras() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [clientes, setClientes] = useState<ClienteRecorrente[]>([]);
  const [selectedClientes, setSelectedClientes] = useState<Set<string>>(new Set());
  const [generatingInvoices, setGeneratingInvoices] = useState(false);
  const [showHistoryDialog, setShowHistoryDialog] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState<ClienteRecorrente | null>(null);
  const [historico, setHistorico] = useState<any[]>([]);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  const loadClientes = useCallback(async () => {
    setLoading(true);
    try {
      const { data: extras } = await supabase
        .from("extras_clientes")
        .select("id, cliente_id, preco_mensal, status, extras_catalogo(nome)")
        .gt("preco_mensal", 0)
        .eq("status", "ativo");

      const clienteIds = [...new Set(extras?.map(e => e.cliente_id) || [])];
      if (clienteIds.length === 0) { setClientes([]); setLoading(false); return; }

      const { data: clientesData } = await supabase
        .from("clientes")
        .select("id, nome, email")
        .in("id", clienteIds);

      const cMap = new Map(clientesData?.map(c => [c.id, c]) || []);
      const grouped = new Map<string, ClienteRecorrente>();

      for (const e of extras || []) {
        const c = cMap.get(e.cliente_id);
        if (!c) continue;
        if (!grouped.has(e.cliente_id)) {
          grouped.set(e.cliente_id, { cliente_id: e.cliente_id, cliente_nome: c.nome, cliente_email: c.email, extras: [], totalMensal: 0 });
        }
        const g = grouped.get(e.cliente_id)!;
        g.extras.push({ id: e.id, nome: (e.extras_catalogo as any)?.nome || "Extra", preco_mensal: Number(e.preco_mensal), status: e.status });
        g.totalMensal += Number(e.preco_mensal);
      }
      setClientes(Array.from(grouped.values()).sort((a, b) => a.cliente_nome.localeCompare(b.cliente_nome)));
    } catch (error) {
      console.error("Erro:", error);
      toast({ title: "Erro ao carregar clientes", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const handleGenerateInvoices = async () => {
    if (selectedClientes.size === 0) {
      toast({ title: "Selecione pelo menos um cliente", variant: "destructive" });
      return;
    }
    setGeneratingInvoices(true);
    const mesAtual = new Date().toISOString().slice(0, 7);
    const ano = new Date().getFullYear();
    const mes = new Date().getMonth() + 1;
    let ok = 0, erros = 0;

    for (const clienteId of selectedClientes) {
      const cliente = clientes.find(c => c.cliente_id === clienteId);
      if (!cliente) continue;
      try {
        const { data: existing } = await (supabase as any)
          .from("recurrent_billing_history").select("id").eq("cliente_id", clienteId).eq("mes", mesAtual).single();
        if (existing) { erros++; continue; }

        const descricao = `Cobrança Recorrente — ${formatMes(mesAtual)}\n` +
          cliente.extras.map(e => `• ${e.nome}: R$ ${Number(e.preco_mensal).toFixed(2)}/mês`).join('\n');
        const vencimento = new Date(); vencimento.setDate(vencimento.getDate() + 10);

        const { data: fin } = await supabase.from("financeiro").insert({
          cliente_id: clienteId, tipo: "entrada", valor: cliente.totalMensal, descricao,
          data: new Date().toISOString().split("T")[0],
          vencimento: vencimento.toISOString().split("T")[0], status: "pendente",
        }).select().single();

        if (fin) {
          await (supabase as any).from("recurrent_billing_history").insert({
            cliente_id: clienteId, mes: mesAtual, ano, mes_numero: mes,
            valor_total: cliente.totalMensal, status: "pendente",
            financeiro_id: fin.id, extras_count: cliente.extras.length, descricao,
          });
          ok++;
        }
      } catch { erros++; }
    }

    setGeneratingInvoices(false);
    setSelectedClientes(new Set());
    if (ok > 0) toast({ title: `${ok} fatura(s) gerada(s)!`, description: `Competência: ${formatMes(mesAtual)}` });
    if (erros > 0) toast({ title: `${erros} já existiam ou falharam`, variant: "destructive" });
    loadClientes();
  };

  const loadHistorico = async (cliente: ClienteRecorrente) => {
    try {
      const { data } = await (supabase as any)
        .from("recurrent_billing_history").select("*")
        .eq("cliente_id", cliente.cliente_id)
        .order("ano", { ascending: false }).order("mes_numero", { ascending: false });
      setHistorico(data || []);
      setSelectedCliente(cliente);
      setShowHistoryDialog(true);
    } catch {
      toast({ title: "Erro ao carregar histórico", variant: "destructive" });
    }
  };

  const handleUpdateStatus = async (recordId: string, status: string) => {
    setUpdatingStatus(recordId);
    try {
      const formaPagamento = status === "pago_manualmente" ? "manual" : status === "pago_asaas" ? "asaas" : null;
      const dataPagamento = status.includes("pago") ? new Date().toISOString().split("T")[0] : null;

      await (supabase as any).from("recurrent_billing_history").update({
        status, forma_pagamento: formaPagamento, data_pagamento: dataPagamento, updated_at: new Date().toISOString(),
      }).eq("id", recordId);

      const record = historico.find(r => r.id === recordId);
      if (record?.financeiro_id) {
        await supabase.from("financeiro").update({ status: status.includes("pago") ? "pago" : "pendente" }).eq("id", record.financeiro_id);
      }

      setHistorico(prev => prev.map(r => r.id === recordId ? { ...r, status, forma_pagamento: formaPagamento, data_pagamento: dataPagamento } : r));
      toast({ title: "Status atualizado!" });
    } catch {
      toast({ title: "Erro ao atualizar", variant: "destructive" });
    } finally {
      setUpdatingStatus(null);
    }
  };

  useEffect(() => { loadClientes(); }, [loadClientes]);

  const totalSelecionado = Array.from(selectedClientes).reduce((t, id) => {
    const c = clientes.find(x => x.cliente_id === id);
    return t + (c?.totalMensal || 0);
  }, 0);

  const toggleCliente = (id: string) => {
    setSelectedClientes(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

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
            <p className="text-xs text-muted-foreground">Gerencie cobranças mensais dos extras</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={loadClientes} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-1.5" /> Atualizar
          </Button>
          <Button
            onClick={handleGenerateInvoices}
            disabled={selectedClientes.size === 0 || generatingInvoices}
            size="sm"
          >
            {generatingInvoices ? (
              <><Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> Gerando...</>
            ) : (
              <><FileText className="w-4 h-4 mr-1.5" /> Gerar Faturas ({selectedClientes.size})</>
            )}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        {[
          { icon: Users, label: "Clientes", value: clientes.length, color: "text-blue-500" },
          { icon: CheckCircle2, label: "Selecionados", value: selectedClientes.size, color: "text-emerald-500" },
          { icon: DollarSign, label: "Total", value: `R$ ${Number(totalSelecionado).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, color: "text-amber-500" },
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
                            onClick={(e) => { e.stopPropagation(); loadHistorico(c); }}
                          >
                            <CalendarDays className="w-3 h-3 mr-1" /> Meses
                          </Button>
                        </div>
                      </div>
                      {/* Extras tags */}
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

      {/* Dialog Histórico Mensal */}
      <Dialog open={showHistoryDialog} onOpenChange={setShowHistoryDialog}>
        <DialogContent className="max-w-[95vw] sm:max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2 text-sm sm:text-base">
              <CalendarDays className="w-4 h-4 sm:w-5 sm:h-5" />
              Histórico — {selectedCliente?.cliente_nome}
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
                  <p className="text-[9px] sm:text-xs text-muted-foreground">Meses</p>
                  <p className="text-sm sm:text-lg font-bold text-foreground">{historico.length}</p>
                </div>
              </div>

              {/* Tabela — Mobile: cards, Desktop: table */}
              <div className="hidden sm:block">
                <Card>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-xs">Mês</TableHead>
                            <TableHead className="text-xs">Valor</TableHead>
                            <TableHead className="text-xs">Status</TableHead>
                            <TableHead className="text-xs">Pagamento</TableHead>
                            <TableHead className="text-xs">Data</TableHead>
                            <TableHead className="text-xs text-right">Ações</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {historico.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={6} className="text-center py-8 text-muted-foreground text-xs">
                                Nenhum histórico. Gere faturas primeiro.
                              </TableCell>
                            </TableRow>
                          ) : historico.map((r) => {
                            const st = statusMap[r.status] || statusMap.pendente;
                            return (
                              <TableRow key={r.id}>
                                <TableCell className="font-medium text-foreground text-sm">{formatMes(r.mes)}</TableCell>
                                <TableCell className="text-foreground text-sm">R$ {Number(r.valor_total).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</TableCell>
                                <TableCell><Badge variant={st.variant} className="text-xs">{st.label}</Badge></TableCell>
                                <TableCell className="text-muted-foreground text-xs">{r.forma_pagamento === "asaas" ? "Asaas" : r.forma_pagamento === "manual" ? "Manual" : "—"}</TableCell>
                                <TableCell className="text-muted-foreground text-xs">{r.data_pagamento ? new Date(r.data_pagamento).toLocaleDateString("pt-BR") : "—"}</TableCell>
                                <TableCell className="text-right">
                                  {r.status === "pendente" && (
                                    <div className="flex gap-1 justify-end">
                                      <Button size="sm" variant="outline" className="text-xs h-7" disabled={updatingStatus === r.id}
                                        onClick={() => handleUpdateStatus(r.id, "pago_manualmente")}>
                                        {updatingStatus === r.id ? "..." : "Manual"}
                                      </Button>
                                      <Button size="sm" variant="outline" className="text-xs h-7" disabled={updatingStatus === r.id}
                                        onClick={() => handleUpdateStatus(r.id, "pago_asaas")}>
                                        {updatingStatus === r.id ? "..." : "Asaas"}
                                      </Button>
                                    </div>
                                  )}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Mobile: Cards */}
              <div className="sm:hidden space-y-2">
                {historico.length === 0 ? (
                  <p className="text-center text-xs text-muted-foreground py-6">Nenhum histórico. Gere faturas primeiro.</p>
                ) : historico.map((r) => {
                  const st = statusMap[r.status] || statusMap.pendente;
                  return (
                    <Card key={r.id}>
                      <CardContent className="p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-foreground">{formatMes(r.mes)}</span>
                          <Badge variant={st.variant} className="text-[10px]">{st.label}</Badge>
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>R$ {Number(r.valor_total).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                          <span>{r.forma_pagamento === "asaas" ? "Asaas" : r.forma_pagamento === "manual" ? "Manual" : "—"}</span>
                        </div>
                        {r.data_pagamento && (
                          <p className="text-[10px] text-muted-foreground">Pago em: {new Date(r.data_pagamento).toLocaleDateString("pt-BR")}</p>
                        )}
                        {r.status === "pendente" && (
                          <div className="flex gap-2 pt-1">
                            <Button size="sm" variant="outline" className="flex-1 text-xs h-8" disabled={updatingStatus === r.id}
                              onClick={() => handleUpdateStatus(r.id, "pago_manualmente")}>
                              {updatingStatus === r.id ? "..." : "Pago Manual"}
                            </Button>
                            <Button size="sm" variant="outline" className="flex-1 text-xs h-8" disabled={updatingStatus === r.id}
                              onClick={() => handleUpdateStatus(r.id, "pago_asaas")}>
                              {updatingStatus === r.id ? "..." : "Pago Asaas"}
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
