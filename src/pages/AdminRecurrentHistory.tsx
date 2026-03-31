import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CalendarDays, CreditCard, DollarSign, CheckCircle2, Clock, AlertCircle, Eye, ArrowLeft, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AsaasService } from "@/lib/asaas-service";
import { RecurrentBillingHistory, RecurrentBillingHistoryService } from "@/lib/recurrent-billing-history";

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

export default function AdminRecurrentHistory() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [clientes, setClientes] = useState<ClienteRecorrente[]>([]);
  const [selectedCliente, setSelectedCliente] = useState<ClienteRecorrente | null>(null);
  const [historico, setHistorico] = useState<RecurrentBillingHistory[]>([]);
  const [showHistoryDialog, setShowHistoryDialog] = useState(false);
  const [generatingPayment, setGeneratingPayment] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

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

  // Carregar histórico de um cliente
  const loadHistorico = async (cliente: ClienteRecorrente) => {
    try {
      const history = await RecurrentBillingHistoryService.getHistoryByClient(cliente.cliente_id);
      setHistorico(history);
      setSelectedCliente(cliente);
      setShowHistoryDialog(true);
    } catch (error) {
      console.error("Erro ao carregar histórico:", error);
      toast({ title: "Erro ao carregar histórico", variant: "destructive" });
    }
  };

  // Gerar cobrança para um mês específico
  const handleGeneratePayment = async (historyRecord?: RecurrentBillingHistory) => {
    if (!selectedCliente) return;

    const mes = historyRecord?.mes || RecurrentBillingHistoryService.getNextMonth(
      await RecurrentBillingHistoryService.getHistoryByClient(selectedCliente.cliente_id)
        .then(h => h?.[0]?.mes || `${new Date().getFullYear()}-${(new Date().getMonth() + 1).toString().padStart(2, '0')}`)
    );

    // Verificar se já existe cobrança para este mês
    if (await RecurrentBillingHistoryService.hasBillingForMonth(selectedCliente.cliente_id, mes)) {
      toast({ title: "Cobrança já existe", description: "Já existe uma cobrança para este mês.", variant: "destructive" });
      return;
    }

    setGeneratingPayment(mes);
    
    try {
      // Buscar cliente completo
      const { data: clienteCompleto } = await supabase.from("clientes").select("*").eq("id", selectedCliente.cliente_id).single();
      
      if (!clienteCompleto?.documento) {
        toast({ title: "Cliente sem documento", description: "Cliente não possui CPF/CNPJ cadastrado.", variant: "destructive" });
        return;
      }

      // Criar cliente no Asaas
      const asaasCustomer = await AsaasService.getOrCreateCustomer({
        name: clienteCompleto.nome,
        email: clienteCompleto.email,
        cpfCnpj: clienteCompleto.documento,
        mobilePhone: clienteCompleto.telefone,
        externalReference: selectedCliente.cliente_id
      });

      // Criar fatura no Financeiro
      const financeiroData = {
        cliente_id: selectedCliente.cliente_id,
        tipo: "receita",
        valor: selectedCliente.totalMensal,
        descricao: `Cobrança Recorrente — ${RecurrentBillingHistoryService.formatMonthDisplay(mes)}\n` + 
          selectedCliente.extras.map(extra => 
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
        // Gerar cobrança no Asaas
        const payment = await AsaasService.createPayment({
          customer: asaasCustomer.id,
          billingType: "UNDEFINED" as const,
          value: selectedCliente.totalMensal,
          dueDate: financeiroData.vencimento,
          description: `Cobrança Recorrente - ${RecurrentBillingHistoryService.formatMonthDisplay(mes)} - ${selectedCliente.extras.length} Extras`,
          externalReference: financeiroRecord.id
        });

        // Atualizar fatura com link Asaas
        await supabase
          .from("financeiro")
          .update({ 
            descricao: `${financeiroData.descricao} (Asaas: ${payment.invoiceUrl})` 
          })
          .eq("id", financeiroRecord.id);

        // Criar registro no histórico
        await RecurrentBillingHistoryService.createHistoryRecord({
          cliente_id: selectedCliente.cliente_id,
          mes,
          ano: parseInt(mes.split("-")[0]),
          mes_numero: parseInt(mes.split("-")[1]),
          valor_total: selectedCliente.totalMensal,
          status: "pendente",
          forma_pagamento: "asaas",
          financeiro_id: financeiroRecord.id,
          asaas_payment_id: payment.id,
          asaas_invoice_url: payment.invoiceUrl,
          extras_count: selectedCliente.extras.length,
          descricao: financeiroData.descricao
        });

        toast({ title: "Cobrança gerada!", description: `Cobrança para ${RecurrentBillingHistoryService.formatMonthDisplay(mes)} criada com sucesso.` });
        
        // Recarregar histórico
        await loadHistorico(selectedCliente);
      }
    } catch (error) {
      console.error("Erro ao gerar cobrança:", error);
      toast({ title: "Erro ao gerar cobrança", variant: "destructive" });
    } finally {
      setGeneratingPayment(null);
    }
  };

  // Atualizar status de pagamento
  const handleUpdateStatus = async (historyId: string, status: RecurrentBillingHistory["status"]) => {
    setUpdatingStatus(historyId);
    
    try {
      const formaPagamento = status === "pago_manualmente" ? "manual" : status === "pago_asaas" ? "asaas" : undefined;
      const dataPagamento = status.includes("pago") ? new Date().toISOString().split("T")[0] : undefined;

      await RecurrentBillingHistoryService.updatePaymentStatus(historyId, status, formaPagamento, dataPagamento);
      
      toast({ title: "Status atualizado!", description: "Status de pagamento atualizado com sucesso." });
      
      // Recarregar histórico
      if (selectedCliente) {
        await loadHistorico(selectedCliente);
      }
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      toast({ title: "Erro ao atualizar status", variant: "destructive" });
    } finally {
      setUpdatingStatus(null);
    }
  };

  useEffect(() => {
    loadClientes();
  }, [loadClientes]);

  return (
    <motion.div className="space-y-6 p-3 sm:p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white mb-1">Histórico de Cobranças Recorrentes</h1>
          <p className="text-xs text-white/50">Clique em um cliente para ver o histórico mensal</p>
        </div>
        
        <Button onClick={loadClientes} variant="outline" className="border-white/10 text-white hover:bg-white/10">
          <RefreshCw className="w-4 h-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Lista de Clientes */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <CalendarDays className="w-5 h-5" />
            Clientes com Cobranças Recorrentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-20 text-center">
              <p className="text-white/20 animate-pulse font-black uppercase text-xs tracking-widest">Carregando clientes...</p>
            </div>
          ) : clientes.length === 0 ? (
            <div className="py-20 text-center">
              <CalendarDays className="w-16 h-16 text-white/10 mx-auto mb-4" />
              <p className="text-white/40 font-bold">Nenhum cliente com cobranças recorrentes encontrado.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {clientes.map((cliente) => (
                <Card key={cliente.cliente_id} className="border-white/5 hover:border-white/10 transition-all cursor-pointer group" onClick={() => loadHistorico(cliente)}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-white mb-1">{cliente.cliente_nome}</h3>
                        <p className="text-sm text-white/60">{cliente.cliente_email}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-sm text-white/40">
                            <DollarSign className="w-4 h-4 inline mr-1" />
                            R$ {cliente.totalMensal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}/mês
                          </span>
                          <span className="text-sm text-white/40">
                            <CreditCard className="w-4 h-4 inline mr-1" />
                            {cliente.extras.length} extras
                          </span>
                        </div>
                      </div>
                      <Button variant="ghost" className="text-blue-400 hover:text-blue-300 hover:bg-blue-400/10">
                        <Eye className="w-5 h-5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Histórico */}
      <Dialog open={showHistoryDialog} onOpenChange={setShowHistoryDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <CalendarDays className="w-5 h-5" />
              Histórico de {selectedCliente?.cliente_nome}
            </DialogTitle>
          </DialogHeader>
          
          {selectedCliente && (
            <div className="space-y-6">
              {/* Resumo do Cliente */}
              <Card className="border-white/10">
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-white/60 mb-1">Valor Mensal</p>
                      <p className="text-lg font-bold text-white">
                        R$ {selectedCliente.totalMensal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-white/60 mb-1">Total de Extras</p>
                      <p className="text-lg font-bold text-white">{selectedCliente.extras.length}</p>
                    </div>
                    <div>
                      <p className="text-sm text-white/60 mb-1">Email</p>
                      <p className="text-sm font-medium text-white">{selectedCliente.cliente_email}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Botão Gerar Próximo Mês */}
              <div className="flex justify-center">
                <Button
                  onClick={() => handleGeneratePayment()}
                  disabled={generatingPayment !== null}
                  className="gradient-primary border-0 text-white"
                >
                  {generatingPayment ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      Gerando...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4 mr-2" />
                      Gerar Cobrança Próximo Mês
                    </>
                  )}
                </Button>
              </div>

              {/* Tabela de Histórico */}
              <Card className="border-white/10">
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-white/10">
                        <TableHead className="text-white/50">Mês</TableHead>
                        <TableHead className="text-white/50">Valor</TableHead>
                        <TableHead className="text-white/50">Status</TableHead>
                        <TableHead className="text-white/50">Forma Pagamento</TableHead>
                        <TableHead className="text-white/50">Data Pagamento</TableHead>
                        <TableHead className="text-white/50 text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {historico.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8">
                            <p className="text-white/40">Nenhum histórico encontrado.</p>
                          </TableCell>
                        </TableRow>
                      ) : (
                        historico.map((record) => {
                          const statusDisplay = RecurrentBillingHistoryService.getStatusDisplay(record.status);
                          const isOverdue = RecurrentBillingHistoryService.isMonthOverdue(record.mes);
                          
                          return (
                            <TableRow key={record.id} className={`border-white/5 ${isOverdue && record.status === 'pendente' ? 'bg-red-500/5' : ''}`}>
                              <TableCell className="text-white font-medium">
                                {RecurrentBillingHistoryService.formatMonthDisplay(record.mes)}
                              </TableCell>
                              <TableCell className="text-white">
                                R$ {record.valor_total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                              </TableCell>
                              <TableCell>
                                <Badge className={`text-xs font-black ${statusDisplay.bg} ${statusDisplay.color} border-0`}>
                                  {statusDisplay.label}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-white/60 text-sm">
                                {record.forma_pagamento === 'asaas' ? 'Asaas' : 
                                 record.forma_pagamento === 'manual' ? 'Manual' : '-'}
                              </TableCell>
                              <TableCell className="text-white/60 text-sm">
                                {record.data_pagamento ? new Date(record.data_pagamento).toLocaleDateString('pt-BR') : '-'}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center gap-2 justify-end">
                                  {record.status === 'pendente' && (
                                    <>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleUpdateStatus(record.id, 'pago_manualmente')}
                                        disabled={updatingStatus === record.id}
                                        className="border-blue-400/20 text-blue-400 hover:bg-blue-400/10"
                                      >
                                        {updatingStatus === record.id ? (
                                          <div className="w-3 h-3 border border-blue-400 border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                          'Manual'
                                        )}
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleUpdateStatus(record.id, 'pago_asaas')}
                                        disabled={updatingStatus === record.id}
                                        className="border-green-400/20 text-green-400 hover:bg-green-400/10"
                                      >
                                        {updatingStatus === record.id ? (
                                          <div className="w-3 h-3 border border-green-400 border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                          'Asaas'
                                        )}
                                      </Button>
                                    </>
                                  )}
                                  {record.asaas_invoice_url && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => window.open(record.asaas_invoice_url, '_blank')}
                                      className="border-purple-400/20 text-purple-400 hover:bg-purple-400/10"
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
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
