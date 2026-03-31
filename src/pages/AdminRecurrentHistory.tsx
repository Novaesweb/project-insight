import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CalendarDays, CreditCard, DollarSign, Eye, RefreshCw, ArrowLeft, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { AsaasService } from "@/lib/asaas-service";
import { RecurrentBillingHistory, RecurrentBillingHistoryService } from "@/lib/recurrent-billing-history";

interface ClienteRecorrente {
  cliente_id: string;
  cliente_nome: string;
  cliente_email: string;
  extras: { id: string; nome: string; preco_mensal: number; status: string }[];
  totalMensal: number;
}

const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pendente: { label: "Pendente", variant: "secondary" },
  pago_manualmente: { label: "Pago Manualmente", variant: "default" },
  pago_asaas: { label: "Pago pelo Asaas", variant: "default" },
  em_atraso: { label: "Em Atraso", variant: "destructive" },
};

const meses = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];

function formatMes(mes: string) {
  const [ano, m] = mes.split("-");
  return `${meses[parseInt(m) - 1]}/${ano}`;
}

export default function AdminRecurrentHistory() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [clientes, setClientes] = useState<ClienteRecorrente[]>([]);
  const [selectedCliente, setSelectedCliente] = useState<ClienteRecorrente | null>(null);
const [historico, setHistorico] = useState<RecurrentBillingHistory[]>([]);
  const [showHistoryDialog, setShowHistoryDialog] = useState(false);
  const [generatingPayment, setGeneratingPayment] = useState<string | null>(null);
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
    } finally {
      setLoading(false);
    }
  }, []);

  const loadHistorico = async (cliente: ClienteRecorrente) => {
    try {
      const { data, error } = await (supabase as any)
        .from("recurrent_billing_history")
        .select("*")
        .eq("cliente_id", cliente.cliente_id)
        .order("ano", { ascending: false })
        .order("mes_numero", { ascending: false });

      if (error) throw error;
      setHistorico(data || []);
      setSelectedCliente(cliente);
      setShowHistoryDialog(true);
    } catch (error) {
      console.error("Erro ao carregar histórico:", error);
      toast({ title: "Erro ao carregar histórico", variant: "destructive" });
    }
  };

  const handleUpdateStatus = async (record: RecurrentBillingHistory, newStatus: string) => {
    setUpdatingStatus(record.id);
    try {
      const formaPagamento = newStatus === "pago_manualmente" ? "manual" : newStatus === "pago_asaas" ? "asaas" : null;
      const dataPagamento = newStatus.includes("pago") ? new Date().toISOString().split("T")[0] : null;

      // 1. Atualizar histórico recorrente
      const { error } = await (supabase as any)
        .from("recurrent_billing_history")
        .update({
          status: newStatus,
          forma_pagamento: formaPagamento,
          data_pagamento: dataPagamento,
          updated_at: new Date().toISOString(),
        })
        .eq("id", record.id);

      if (error) throw error;

      // 2. Atualizar status no financeiro (se vinculado)
      if (record.financeiro_id) {
        const finStatus = newStatus.includes("pago") ? "pago" : "pendente";
        await supabase
          .from("financeiro")
          .update({ status: finStatus })
          .eq("id", record.financeiro_id);
      }

      setHistorico(prev => prev.map(r =>
        r.id === record.id ? { ...r, status: newStatus, forma_pagamento: formaPagamento, data_pagamento: dataPagamento } : r
      ));

      toast({ title: "Status atualizado!", description: `${formatMes(record.mes)} → ${statusMap[newStatus]?.label || newStatus}` });
    } catch (error) {
      console.error("Erro:", error);
      toast({ title: "Erro ao atualizar", variant: "destructive" });
    } finally {
      setUpdatingStatus(null);
    }
  };

  useEffect(() => { loadClientes(); }, [loadClientes]);

  return (
    <motion.div className="space-y-6 p-3 sm:p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate("/recurrent-billing")}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-1">Histórico Recorrente</h1>
            <p className="text-xs text-muted-foreground">Clique em um cliente para ver as cobranças mês a mês</p>
          </div>
        </div>
        <Button onClick={loadClientes} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" /> Atualizar
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2 text-sm">
            <CalendarDays className="w-5 h-5" /> Clientes com Cobranças Recorrentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-20 text-center text-muted-foreground text-xs animate-pulse">Carregando...</div>
          ) : clientes.length === 0 ? (
            <div className="py-20 text-center">
              <CalendarDays className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhum cliente com cobranças recorrentes.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {clientes.map((c) => (
                <Card key={c.cliente_id} className="cursor-pointer hover:bg-secondary/50 transition-all" onClick={() => loadHistorico(c)}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-foreground">{c.cliente_nome}</h3>
                      <p className="text-xs text-muted-foreground">{c.cliente_email}</p>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-xs text-muted-foreground">
                          <DollarSign className="w-3 h-3 inline mr-0.5" />
                          R$ {c.totalMensal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}/mês
                        </span>
                        <span className="text-xs text-muted-foreground">
                          <CreditCard className="w-3 h-3 inline mr-0.5" />
                          {c.extras.length} extras
                        </span>
                      </div>
                    </div>
                    <Eye className="w-5 h-5 text-muted-foreground" />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Histórico Mensal */}
      <Dialog open={showHistoryDialog} onOpenChange={setShowHistoryDialog}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2">
              <CalendarDays className="w-5 h-5" />
              Histórico — {selectedCliente?.cliente_nome}
            </DialogTitle>
          </DialogHeader>

          {selectedCliente && (
            <div className="space-y-4">
              {/* Resumo */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-secondary">
                  <p className="text-xs text-muted-foreground">Valor Mensal</p>
                  <p className="text-lg font-bold text-foreground">R$ {selectedCliente.totalMensal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                </div>
                <div className="p-3 rounded-lg bg-secondary">
                  <p className="text-xs text-muted-foreground">Extras Ativos</p>
                  <p className="text-lg font-bold text-foreground">{selectedCliente.extras.length}</p>
                </div>
                <div className="p-3 rounded-lg bg-secondary col-span-2 md:col-span-1">
                  <p className="text-xs text-muted-foreground">Meses Registrados</p>
                  <p className="text-lg font-bold text-foreground">{historico.length}</p>
                </div>
              </div>

              {/* Extras */}
              <div className="flex flex-wrap gap-2">
                {selectedCliente.extras.map(e => (
                  <span key={e.id} className="inline-flex items-center text-xs border rounded-full px-2 py-0.5 border-border text-muted-foreground">
                    {e.nome} — R$ {e.preco_mensal.toFixed(2)}/mês
                  </span>
                ))}
              </div>

              {/* Tabela de meses */}
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs">Competência</TableHead>
                          <TableHead className="text-xs">Valor</TableHead>
                          <TableHead className="text-xs">Status</TableHead>
                          <TableHead className="text-xs">Pagamento</TableHead>
                          <TableHead className="text-xs">Data Pgto</TableHead>
                          <TableHead className="text-xs text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {historico.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                              Nenhuma cobrança gerada ainda. Gere faturas na tela de Cobranças Recorrentes.
                            </TableCell>
                          </TableRow>
                        ) : (
                          historico.map((r) => {
                            const st = statusMap[r.status] || statusMap.pendente;
                            return (
                              <TableRow key={r.id}>
                                <TableCell className="font-medium text-foreground">{formatMes(r.mes)}</TableCell>
                                <TableCell className="text-foreground">R$ {Number(r.valor_total).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</TableCell>
                                <TableCell>
                                  <Badge variant={st.variant} className="text-xs">{st.label}</Badge>
                                </TableCell>
                                <TableCell className="text-muted-foreground text-sm">
                                  {r.forma_pagamento === "asaas" ? "Asaas" : r.forma_pagamento === "manual" ? "Manual" : "—"}
                                </TableCell>
                                <TableCell className="text-muted-foreground text-sm">
                                  {r.data_pagamento ? new Date(r.data_pagamento).toLocaleDateString("pt-BR") : "—"}
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex items-center gap-1 justify-end flex-wrap">
                                    {r.status === "pendente" && (
                                      <>
                                        <Button
                                          size="sm" variant="outline"
                                          onClick={() => handleUpdateStatus(r, "pago_manualmente")}
                                          disabled={updatingStatus === r.id}
                                          className="text-xs h-7"
                                        >
                                          {updatingStatus === r.id ? "..." : "Manual"}
                                        </Button>
                                        <Button
                                          size="sm" variant="outline"
                                          onClick={() => handleUpdateStatus(r, "pago_asaas")}
                                          disabled={updatingStatus === r.id}
                                          className="text-xs h-7"
                                        >
                                          {updatingStatus === r.id ? "..." : "Asaas"}
                                        </Button>
                                      </>
                                    )}
                                    {r.asaas_invoice_url && (
                                      <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => window.open(r.asaas_invoice_url!, "_blank")}>
                                        <ExternalLink className="w-3 h-3 mr-1" /> Fatura
                                      </Button>
                                    )}
                                  </div>
                                </TableCell>
                              </TableRow>
                            );
                          })
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
