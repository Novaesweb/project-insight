import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CalendarDays, CreditCard, DollarSign, Eye, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ClienteRecorrente {
  cliente_id: string;
  cliente_nome: string;
  cliente_email: string;
  extras: { id: string; nome: string; preco_mensal: number; status: string }[];
  totalMensal: number;
}

interface HistoryRecord {
  id: string;
  cliente_id: string;
  mes: string;
  ano: number;
  mes_numero: number;
  valor_total: number;
  status: string;
  forma_pagamento: string | null;
  data_pagamento: string | null;
  financeiro_id: string | null;
  asaas_invoice_url: string | null;
  extras_count: number;
  descricao: string | null;
  created_at: string | null;
}

const statusMap: Record<string, { label: string; color: string; bg: string }> = {
  pendente: { label: "Pendente", color: "text-amber-400", bg: "bg-amber-500/10" },
  pago_manualmente: { label: "Pago Manualmente", color: "text-blue-400", bg: "bg-blue-500/10" },
  pago_asaas: { label: "Pago pelo Asaas", color: "text-green-400", bg: "bg-green-500/10" },
  em_atraso: { label: "Em Atraso", color: "text-red-400", bg: "bg-red-500/10" },
};

const meses = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];

function formatMes(mes: string) {
  const [ano, m] = mes.split("-");
  return `${meses[parseInt(m) - 1]}/${ano}`;
}

export default function AdminRecurrentHistory() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [clientes, setClientes] = useState<ClienteRecorrente[]>([]);
  const [selectedCliente, setSelectedCliente] = useState<ClienteRecorrente | null>(null);
  const [historico, setHistorico] = useState<HistoryRecord[]>([]);
  const [showDialog, setShowDialog] = useState(false);
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
      setShowDialog(true);
    } catch (error) {
      console.error("Erro ao carregar histórico:", error);
      toast({ title: "Erro ao carregar histórico", variant: "destructive" });
    }
  };

  const handleUpdateStatus = async (recordId: string, newStatus: string) => {
    setUpdatingStatus(recordId);
    try {
      const formaPagamento = newStatus === "pago_manualmente" ? "manual" : newStatus === "pago_asaas" ? "asaas" : null;
      const dataPagamento = newStatus.includes("pago") ? new Date().toISOString().split("T")[0] : null;

      const { error } = await (supabase as any)
        .from("recurrent_billing_history")
        .update({
          status: newStatus,
          forma_pagamento: formaPagamento,
          data_pagamento: dataPagamento,
          updated_at: new Date().toISOString(),
        })
        .eq("id", recordId);

      if (error) throw error;

      setHistorico(prev => prev.map(r =>
        r.id === recordId ? { ...r, status: newStatus, forma_pagamento: formaPagamento, data_pagamento: dataPagamento } : r
      ));

      toast({ title: "Status atualizado!" });
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
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-1">Histórico de Cobranças Recorrentes</h1>
          <p className="text-xs text-muted-foreground">Clique em um cliente para ver o histórico mensal</p>
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
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
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
                  <p className="text-xs text-muted-foreground">Extras</p>
                  <p className="text-lg font-bold text-foreground">{selectedCliente.extras.length}</p>
                </div>
                <div className="p-3 rounded-lg bg-secondary col-span-2 md:col-span-1">
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="text-sm font-medium text-foreground truncate">{selectedCliente.cliente_email}</p>
                </div>
              </div>

              {/* Extras do cliente */}
              <div className="space-y-1">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Extras Ativos</p>
                <div className="flex flex-wrap gap-2">
                  {selectedCliente.extras.map(e => (
                    <Badge key={e.id} variant="outline" className="text-xs">
                      {e.nome} — R$ {e.preco_mensal.toFixed(2)}/mês
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Tabela de meses */}
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">Mês</TableHead>
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
                            Nenhum registro encontrado. As cobranças aparecerão aqui quando forem geradas.
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
                                <Badge className={`text-xs ${st.bg} ${st.color} border-0`}>{st.label}</Badge>
                              </TableCell>
                              <TableCell className="text-muted-foreground text-sm">
                                {r.forma_pagamento === "asaas" ? "Asaas" : r.forma_pagamento === "manual" ? "Manual" : "-"}
                              </TableCell>
                              <TableCell className="text-muted-foreground text-sm">
                                {r.data_pagamento ? new Date(r.data_pagamento).toLocaleDateString("pt-BR") : "-"}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center gap-1 justify-end flex-wrap">
                                  {r.status === "pendente" && (
                                    <>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleUpdateStatus(r.id, "pago_manualmente")}
                                        disabled={updatingStatus === r.id}
                                        className="text-xs h-7"
                                      >
                                        {updatingStatus === r.id ? "..." : "Manual"}
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleUpdateStatus(r.id, "pago_asaas")}
                                        disabled={updatingStatus === r.id}
                                        className="text-xs h-7"
                                      >
                                        {updatingStatus === r.id ? "..." : "Asaas"}
                                      </Button>
                                    </>
                                  )}
                                  {r.asaas_invoice_url && (
                                    <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => window.open(r.asaas_invoice_url!, "_blank")}>
                                      Ver Fatura
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
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
