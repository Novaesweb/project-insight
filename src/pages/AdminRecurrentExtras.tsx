import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CalendarDays, CreditCard, DollarSign, CheckCircle2, Clock, AlertCircle, Users, FileText, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface ClienteRecorrente {
  cliente_id: string;
  cliente_nome: string;
  cliente_email: string;
  cliente_documento?: string;
  cliente_telefone?: string;
  extras: {
    id: string;
    nome: string;
    preco_mensal: number;
    status: string;
  }[];
  totalMensal: number;
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

  // Carregar clientes com extras recorrentes
  const loadClientes = useCallback(async () => {
    setLoading(true);
    
    try {
      // Buscar extras recorrentes
      const { data: extras, error: extrasError } = await supabase
        .from("extras_clientes")
        .select("id, cliente_id, preco_mensal, status, extras_catalogo(nome)")
        .gt("preco_mensal", 0)
        .eq("status", "ativo");

      if (extrasError) throw extrasError;

      // Buscar clientes
      const clienteIds = [...new Set(extras?.map(e => e.cliente_id) || [])];
      if (clienteIds.length === 0) {
        setClientes([]);
        setLoading(false);
        return;
      }

      const { data: clientesData, error: clientesError } = await supabase
        .from("clientes")
        .select("id, nome, email, documento, telefone")
        .in("id", clienteIds);

      if (clientesError) throw clientesError;

      // Agrupar por cliente
      const clienteMap = new Map(clientesData?.map(c => [c.id, c]) || []);
      const grouped = new Map<string, ClienteRecorrente>();

      for (const e of extras || []) {
        const c = clienteMap.get(e.cliente_id);
        if (!c) continue;

        if (!grouped.has(e.cliente_id)) {
          grouped.set(e.cliente_id, {
            cliente_id: e.cliente_id,
            cliente_nome: c.nome,
            cliente_email: c.email,
            cliente_documento: c.documento,
            cliente_telefone: c.telefone,
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

      setClientes(Array.from(grouped.values()).sort((a, b) => a.cliente_nome.localeCompare(b.cliente_nome)));
    } catch (error) {
      console.error("Erro ao carregar clientes:", error);
      toast({ title: "Erro ao carregar clientes", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Gerar faturas para clientes selecionados
  const handleGenerateInvoices = async () => {
    if (selectedClientes.size === 0) {
      toast({ title: "Nenhum cliente selecionado", description: "Selecione pelo menos um cliente para gerar faturas.", variant: "destructive" });
      return;
    }

    setGeneratingInvoices(true);
    
    try {
      const mesAtual = new Date().toISOString().slice(0, 7); // "2026-03"
      const ano = new Date().getFullYear();
      const mes = new Date().getMonth() + 1;
      
      let faturasGeradas = 0;
      const erros: string[] = [];

      for (const clienteId of selectedClientes) {
        const cliente = clientes.find(c => c.cliente_id === clienteId);
        if (!cliente) continue;

        try {
          // Verificar se já existe fatura para este mês
          const { data: existingInvoice } = await supabase
            .from("financeiro")
            .select("*")
            .eq("cliente_id", clienteId)
            .eq("descricao", `Cobrança Recorrente — ${mesAtual}`)
            .single();

          if (existingInvoice) {
            erros.push(`${cliente.cliente_nome} - Fatura já existe para ${mesAtual}`);
            continue;
          }

          // Criar fatura no Financeiro
          const financeiroData = {
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
          };
          
          const { data: financeiroRecord } = await supabase
            .from("financeiro")
            .insert(financeiroData)
            .select()
            .single();

          if (financeiroRecord) {
            // Criar registro no histórico recorrente
            await supabase
              .from("recurrent_billing_history")
              .insert({
                cliente_id: clienteId,
                mes: mesAtual,
                ano: ano,
                mes_numero: mes,
                valor_total: cliente.totalMensal,
                status: "pendente",
                forma_pagamento: null,
                data_pagamento: null,
                financeiro_id: financeiroRecord.id,
                asaas_payment_id: null,
                asaas_invoice_url: null,
                extras_count: cliente.extras.length,
                descricao: financeiroData.descricao
              });

            faturasGeradas++;
          }
        } catch (error) {
          console.error(`Erro ao gerar fatura para ${cliente.cliente_nome}:`, error);
          erros.push(`${cliente.cliente_nome} - Erro ao gerar fatura`);
        }
      }

      // Mensagem de resultado
      if (faturasGeradas > 0) {
        toast({ 
          title: "✅ Faturas geradas!", 
          description: `${faturasGeradas} faturas criadas com sucesso para ${mesAtual}` 
        });
      }

      if (erros.length > 0) {
        toast({ 
          title: "⚠️ Alguns erros ocorreram", 
          description: erros.slice(0, 3).join("\n"), 
          variant: "destructive" 
        });
      }

      // Limpar seleção
      setSelectedClientes(new Set());
      
      // Recarregar dados
      await loadClientes();
      
    } catch (error) {
      console.error("Erro ao gerar faturas:", error);
      toast({ 
        title: "Erro ao gerar faturas", 
        description: "Não foi possível gerar as faturas selecionadas", 
        variant: "destructive" 
      });
    } finally {
      setGeneratingInvoices(false);
    }
  };

  // Carregar histórico de um cliente
  const loadHistorico = async (cliente: ClienteRecorrente) => {
    try {
      const { data, error } = await supabase
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

  // Atualizar status de pagamento
  const handleUpdateStatus = async (recordId: string, status: string) => {
    try {
      const formaPagamento = status === "pago_manualmente" ? "manual" : status === "pago_asaas" ? "asaas" : null;
      const dataPagamento = status.includes("pago") ? new Date().toISOString().split("T")[0] : null;

      // Atualizar histórico recorrente
      const { error } = await supabase
        .from("recurrent_billing_history")
        .update({
          status: status,
          forma_pagamento: formaPagamento,
          data_pagamento: dataPagamento,
          updated_at: new Date().toISOString(),
        })
        .eq("id", recordId);

      if (error) throw error;

      // Atualizar status no financeiro (se vinculado)
      const record = historico.find(r => r.id === recordId);
      if (record?.financeiro_id) {
        const finStatus = status.includes("pago") ? "pago" : "pendente";
        await supabase
          .from("financeiro")
          .update({ status: finStatus })
          .eq("id", record.financeiro_id);
      }

      // Atualizar estado local
      setHistorico(prev => prev.map(r =>
        r.id === recordId ? { ...r, status, forma_pagamento: formaPagamento, data_pagamento: dataPagamento } : r
      ));

      toast({ title: "Status atualizado!", description: `Status de pagamento atualizado com sucesso.` });
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      toast({ title: "Erro ao atualizar status", variant: "destructive" });
    }
  };

  useEffect(() => {
    loadClientes();
  }, [loadClientes]);

  const totalSelecionado = Array.from(selectedClientes).reduce((total, clienteId) => {
    const cliente = clientes.find(c => c.cliente_id === clienteId);
    return total + (cliente?.totalMensal || 0);
  }, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/admin/dashboard")}
              className="border-white/10 text-white/60 hover:text-white hover:bg-white/5"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white">Extras Recorrentes</h1>
              <p className="text-white/60 mt-1">Gerencie cobranças mensais de extras recorrentes</p>
            </div>
          </div>
          <Button
            onClick={loadClientes}
            variant="outline"
            size="sm"
            className="border-white/10 text-white/60 hover:text-white hover:bg-white/5"
          >
            <Clock className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
        </motion.div>

        {/* Cards de Resumo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <Card className="bg-slate-800/50 border-white/10 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Clientes com Extras</p>
                  <p className="text-2xl font-bold text-white">{clientes.length}</p>
                </div>
                <Users className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-white/10 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Selecionados</p>
                  <p className="text-2xl font-bold text-white">{selectedClientes.size}</p>
                </div>
                <CheckCircle2 className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-white/10 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Total a Cobrar</p>
                  <p className="text-2xl font-bold text-white">
                    R$ {totalSelecionado.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Lista de Clientes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-slate-800/50 border-white/10 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-white">Clientes com Extras Recorrentes</CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => {
                    if (selectedClientes.size === clientes.length) {
                      setSelectedClientes(new Set());
                    } else {
                      setSelectedClientes(new Set(clientes.map(c => c.cliente_id)));
                    }
                  }}
                  variant="outline"
                  size="sm"
                  className="border-white/10 text-white/60 hover:text-white hover:bg-white/5"
                >
                  {selectedClientes.size === clientes.length ? "Desmarcar Todos" : "Marcar Todos"}
                </Button>
                <Button
                  onClick={handleGenerateInvoices}
                  disabled={selectedClientes.size === 0 || generatingInvoices}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {generatingInvoices ? (
                    <>
                      <Clock className="w-4 h-4 mr-2 animate-spin" />
                      Gerando...
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4 mr-2" />
                      Gerar Faturas
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Clock className="w-6 h-6 animate-spin text-white/60" />
                </div>
              ) : clientes.length === 0 ? (
                <div className="text-center py-12">
                  <AlertCircle className="w-12 h-12 text-white/20 mx-auto mb-4" />
                  <p className="text-white/60">Nenhum cliente com extras recorrentes encontrado.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {clientes.map((cliente) => (
                    <div
                      key={cliente.cliente_id}
                      className={`p-4 rounded-lg border transition-all cursor-pointer ${
                        selectedClientes.has(cliente.cliente_id)
                          ? "bg-blue-500/10 border-blue-500/30"
                          : "bg-slate-700/30 border-white/5 hover:bg-slate-700/50"
                      }`}
                      onClick={() => {
                        const newSelected = new Set(selectedClientes);
                        if (newSelected.has(cliente.cliente_id)) {
                          newSelected.delete(cliente.cliente_id);
                        } else {
                          newSelected.add(cliente.cliente_id);
                        }
                        setSelectedClientes(newSelected);
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Checkbox
                            checked={selectedClientes.has(cliente.cliente_id)}
                            onChange={() => {}}
                            className="border-white/20"
                          />
                          <div>
                            <h3 className="text-white font-medium">{cliente.cliente_nome}</h3>
                            <p className="text-white/60 text-sm">{cliente.cliente_email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-white font-medium">
                              R$ {cliente.totalMensal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                            </p>
                            <p className="text-white/60 text-sm">{cliente.extras.length} extras</p>
                          </div>
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              loadHistorico(cliente);
                            }}
                            variant="outline"
                            size="sm"
                            className="border-white/10 text-white/60 hover:text-white hover:bg-white/5"
                          >
                            <CalendarDays className="w-4 h-4 mr-2" />
                            Histórico
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Dialog de Histórico */}
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
                    <p className="text-lg font-bold text-foreground">
                      R$ {selectedCliente.totalMensal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </p>
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
                            <TableHead>Mês</TableHead>
                            <TableHead>Valor</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Forma Pagamento</TableHead>
                            <TableHead>Data Pagamento</TableHead>
                            <TableHead>Ações</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {historico.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={6} className="text-center py-8">
                                <p className="text-muted-foreground">Nenhum histórico encontrado.</p>
                              </TableCell>
                            </TableRow>
                          ) : (
                            historico.map((record) => {
                              const statusDisplay = {
                                pendente: { label: "Pendente", variant: "secondary" as const },
                                pago_manualmente: { label: "Pago Manualmente", variant: "default" as const },
                                pago_asaas: { label: "Pago pelo Asaas", variant: "default" as const },
                                em_atraso: { label: "Em Atraso", variant: "destructive" as const },
                              }[record.status] || { label: "Pendente", variant: "secondary" as const };

                              return (
                                <TableRow key={record.id}>
                                  <TableCell className="font-medium">
                                    {record.mes.replace('-', '/')}
                                  </TableCell>
                                  <TableCell>
                                    R$ {record.valor_total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                                  </TableCell>
                                  <TableCell>
                                    <Badge variant={statusDisplay.variant}>
                                      {statusDisplay.label}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-muted-foreground text-sm">
                                    {record.forma_pagamento === 'asaas' ? 'Asaas' : 
                                     record.forma_pagamento === 'manual' ? 'Manual' : '-'}
                                  </TableCell>
                                  <TableCell className="text-muted-foreground text-sm">
                                    {record.data_pagamento ? new Date(record.data_pagamento).toLocaleDateString('pt-BR') : '-'}
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-2">
                                      {record.status === 'pendente' && (
                                        <>
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleUpdateStatus(record.id, 'pago_manualmente')}
                                            className="text-xs"
                                          >
                                            Manual
                                          </Button>
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleUpdateStatus(record.id, 'pago_asaas')}
                                            className="text-xs"
                                          >
                                            Asaas
                                          </Button>
                                        </>
                                      )}
                                      {record.asaas_invoice_url && (
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => window.open(record.asaas_invoice_url, '_blank')}
                                          className="text-xs"
                                        >
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
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
