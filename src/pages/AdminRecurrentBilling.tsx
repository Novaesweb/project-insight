import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
  DollarSign, TrendingUp, CheckCircle2, RefreshCw, Users, FileText, Loader2, Eye, Phone, Mail, IdCard, MapPin, CreditCard
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AsaasService } from "@/lib/asaas-service";

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

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

export default function AdminRecurrentBilling() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [clientes, setClientes] = useState<ClienteRecorrente[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [selectedCliente, setSelectedCliente] = useState<ClienteRecorrente | null>(null);
  const [generatingIndividual, setGeneratingIndividual] = useState<string | null>(null);

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
      .select("id, nome, email, documento, telefone")
      .in("id", clienteIds);

    if (clientesError) {
      console.error("❌ Erro ao buscar clientes:", clientesError);
    }

    console.log("👤 Clientes encontrados:", clientesData?.length || 0);
    console.log("📋 Dados completos dos clientes:", clientesData);

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

  // Função para gerar cobrança Asaas individual
  const handleGerarAsaasIndividual = async (cliente: ClienteRecorrente) => {
    setGeneratingIndividual(cliente.cliente_id);
    try {
      // 1. Buscar detalhes completo do cliente
      console.log("🔍 Buscando dados completos do cliente...");
      const { data: clienteCompleto } = await supabase.from("clientes").select("*").eq("id", cliente.cliente_id).single();
      
      if (!clienteCompleto) {
        toast({ title: "Cliente não encontrado", description: `O cliente ${cliente.cliente_nome} não foi encontrado no banco de dados.`, variant: "destructive" });
        return;
      }

      // 2. Verificar se cliente tem CPF/CNPJ
      if (!clienteCompleto.documento) {
        toast({ title: "Cliente sem documento", description: `O cliente ${cliente.cliente_nome} não possui CPF/CNPJ cadastrado.`, variant: "destructive" });
        return;
      }

      // 3. Garantir cliente no Asaas
      console.log("👤 Criando/atualizando cliente no Asaas...");
      const asaasCustomer = await AsaasService.getOrCreateCustomer({
        name: clienteCompleto.nome,
        email: clienteCompleto.email,
        cpfCnpj: clienteCompleto.documento || undefined,
        mobilePhone: clienteCompleto.telefone || undefined,
        externalReference: cliente.cliente_id
      });

      // 4. Gerar fatura consolidada no banco
      console.log("📄 Criando fatura no banco...");
      const financeiroData = {
        cliente_id: cliente.cliente_id,
        tipo: "receita",
        valor: cliente.totalMensal,
        descricao: `Cobrança Recorrente — ${new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}\n` + 
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
        // 5. Gerar cobrança no Asaas
        console.log("💳 Gerando cobrança no Asaas...");
        const paymentData = {
          customer: asaasCustomer.id,
          billingType: "UNDEFINED" as const,
          value: cliente.totalMensal,
          dueDate: new Date(new Date().setDate(new Date().getDate() + 10)).toISOString().split('T')[0],
          description: `Cobrança Recorrente - ${new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })} - ${cliente.extras.length} Extras`,
          externalReference: financeiroRecord.id
        };
        
        const payment = await AsaasService.createPayment(paymentData);

        // 6. Salvar ID na descrição
        const novaDescricao = `${financeiroData.descricao} (Asaas: ${payment.invoiceUrl})`;
        await supabase
          .from("financeiro")
          .update({ descricao: novaDescricao })
          .eq("id", financeiroRecord.id);

        toast({ 
          title: "✅ Cobrança Asaas gerada!", 
          description: `Cobrança para ${cliente.cliente_nome} criada com sucesso.` 
        });
      }

    } catch (error: any) {
      console.error("❌ Erro ao gerar cobrança Asaas individual:", error);
      toast({ 
        title: "Erro ao gerar cobrança", 
        description: error.message || "Não foi possível gerar a cobrança Asaas", 
        variant: "destructive" 
      });
    } finally {
      setGeneratingIndividual(null);
    }
  };

  const handleGenerateBills = useCallback(async () => {
    console.log("🚀 handleGenerateBills chamado!");
    
    if (selected.size === 0) {
      console.log("❌ Nenhum cliente selecionado");
      toast({ title: "Selecione ao menos um cliente", variant: "destructive" });
      return;
    }

    console.log("🚀 Iniciando geração de cobranças Asaas...");
    console.log("📊 Clientes selecionados:", selected.size);
    console.log("👥 IDs dos clientes:", Array.from(selected));
    console.log("👥 Clientes disponíveis:", clientes.map(c => ({ id: c.cliente_id, nome: c.cliente_nome })));

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
      console.log(`📧 Email do cliente: ${cliente.cliente_email}`);
      console.log(`📋 CPF/CNPJ do cliente: ${cliente.cliente_documento || 'NÃO CADASTRADO'}`);
      console.log(`📋 Extras do cliente:`, cliente.extras);

      try {
        // 1. Buscar detalhes completo do cliente (como no Financeiro)
        console.log("🔍 Buscando dados completos do cliente...");
        const { data: clienteCompleto } = await supabase.from("clientes").select("*").eq("id", clienteId).single();
        
        if (!clienteCompleto) {
          errorCount++;
          console.error("❌ Cliente não encontrado no banco:", clienteId);
          toast({ 
            title: "Cliente não encontrado", 
            description: `O cliente ${cliente.cliente_nome} não foi encontrado no banco de dados.`, 
            variant: "destructive" 
          });
          continue;
        }

        console.log("📋 Dados completos do cliente:", clienteCompleto);

        // 2. Verificar se cliente tem CPF/CNPJ
        if (!clienteCompleto.documento) {
          errorCount++;
          console.error("❌ Cliente sem CPF/CNPJ:", clienteCompleto.nome);
          toast({ 
            title: "Cliente sem documento", 
            description: `O cliente ${clienteCompleto.nome} não possui CPF/CNPJ cadastrado. Cadastre o documento para gerar cobranças Asaas.`, 
            variant: "destructive" 
          });
          continue;
        }

        // 3. Garantir cliente no Asaas (exatamente como no Financeiro)
        console.log("👤 Criando/atualizando cliente no Asaas...");
        const asaasCustomer = await AsaasService.getOrCreateCustomer({
          name: clienteCompleto.nome,
          email: clienteCompleto.email,
          cpfCnpj: clienteCompleto.documento || undefined,
          mobilePhone: clienteCompleto.telefone || undefined,
          externalReference: clienteId
        });
        console.log("✅ Cliente Asaas criado/atualizado:", asaasCustomer.id);

        // 4. Gerar fatura consolidada no banco
        console.log("📄 Criando fatura no banco...");
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
        console.log("📋 Dados da fatura:", financeiroData);
        
        const { data: financeiroRecord, error: financeiroError } = await supabase
          .from("financeiro")
          .insert(financeiroData)
          .select()
          .single();

        if (financeiroError) {
          errorCount++;
          console.error("❌ Erro ao criar fatura:", financeiroError);
          continue;
        }

        console.log("✅ Fatura criada no banco:", financeiroRecord.id);

        // 5. Gerar cobrança no Asaas (exatamente como no Financeiro)
        if (financeiroRecord) {
          console.log("💳 Gerando cobrança no Asaas...");
          const paymentData = {
            customer: asaasCustomer.id,
            billingType: "UNDEFINED" as const, // Deixa o cliente escolher (Boleto, Pix, Cartão)
            value: cliente.totalMensal,
            dueDate: new Date(new Date().setDate(new Date().getDate() + 10)).toISOString().split('T')[0],
            description: `Cobrança Recorrente - ${mesAtual} - ${cliente.extras.length} Extras`,
            externalReference: financeiroRecord.id
          };
          console.log("💳 Dados do pagamento:", paymentData);
          
          const payment = await AsaasService.createPayment(paymentData);
          console.log("✅ Cobrança Asaas criada:", payment.id);

          // 6. Salvar ID na descrição (exatamente como no Financeiro)
          const novaDescricao = `${financeiroData.descricao} (Asaas: ${payment.invoiceUrl})`;
          await supabase
            .from("financeiro")
            .update({ descricao: novaDescricao })
            .eq("id", financeiroRecord.id);

          successCount++;
          console.log(`🎉 Cobrança Asaas gerada para ${clienteCompleto.nome}`);
        }

      } catch (error) {
        errorCount++;
        console.error("❌ Erro ao gerar cobrança Asaas:", error);
        console.error("❌ Stack trace:", error instanceof Error ? error.stack : 'No stack trace');
        console.error("❌ Error details:", JSON.stringify(error, null, 2));
        
        // Mostrar toast com detalhes completos
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
        const errorStack = error instanceof Error ? error.stack : '';
        
        toast({ 
          title: "Erro no Asaas", 
          description: `Cliente: ${cliente.cliente_nome}\nErro: ${errorMessage}\nStack: ${errorStack?.substring(0, 200)}...`, 
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
          onClick={() => {
            console.log("🖱️ Botão de gerar cobranças clicado!");
            console.log("📊 Clientes selecionados:", selected.size);
            console.log("👥 Selected set:", Array.from(selected));
            console.log("👥 Clientes disponíveis:", clientes.length);
            console.log("🔍 Botão habilitado?", !generating && selected.size > 0);
            handleGenerateBills();
          }}
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
                  <TableHead className="text-[10px] text-white/50 uppercase text-center">Ações</TableHead>
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
                    <TableCell onClick={e => e.stopPropagation()} className="text-center">
                      <div className="flex items-center gap-1 justify-center">
                        {/* Botão Ver Dados */}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 w-7 text-blue-400/60 hover:text-blue-400 hover:bg-blue-400/10"
                              onClick={() => setSelectedCliente(c)}
                            >
                              <Eye className="w-3 h-3" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle className="text-white">Dados Completos do Cliente</DialogTitle>
                            </DialogHeader>
                            {selectedCliente && (
                              <div className="space-y-6">
                                {/* Informações Básicas */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="space-y-3">
                                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Informações Básicas</h3>
                                    <div className="space-y-2">
                                      <div className="flex items-center gap-2">
                                        <IdCard className="w-4 h-4 text-blue-400" />
                                        <span className="text-sm text-white/80">Nome:</span>
                                        <span className="text-sm font-medium text-white">{selectedCliente.cliente_nome}</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Mail className="w-4 h-4 text-green-400" />
                                        <span className="text-sm text-white/80">Email:</span>
                                        <span className="text-sm font-medium text-white">{selectedCliente.cliente_email}</span>
                                      </div>
                                      {selectedCliente.cliente_documento && (
                                        <div className="flex items-center gap-2">
                                          <IdCard className="w-4 h-4 text-purple-400" />
                                          <span className="text-sm text-white/80">CPF/CNPJ:</span>
                                          <span className="text-sm font-medium text-white">{selectedCliente.cliente_documento}</span>
                                        </div>
                                      )}
                                      {selectedCliente.cliente_telefone && (
                                        <div className="flex items-center gap-2">
                                          <Phone className="w-4 h-4 text-amber-400" />
                                          <span className="text-sm text-white/80">Telefone:</span>
                                          <span className="text-sm font-medium text-white">{selectedCliente.cliente_telefone}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Extras Recorrentes */}
                                <div className="space-y-3">
                                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Extras Recorrentes</h3>
                                  <div className="space-y-2">
                                    {selectedCliente.extras.map((extra) => (
                                      <div key={extra.id} className="flex items-center justify-between p-3 rounded-lg border border-white/10 bg-white/5">
                                        <div>
                                          <span className="text-sm font-medium text-white">{extra.nome}</span>
                                          <div className="flex items-center gap-2 mt-1">
                                            <span className="text-xs px-2 py-1 rounded-full bg-green-400/10 text-green-400 border border-green-400/20">
                                              {extra.status}
                                            </span>
                                          </div>
                                        </div>
                                        <span className="text-sm font-bold text-green-400">
                                          R$ {Number(extra.preco_mensal).toFixed(2)}/mês
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                                
                                {/* Resumo Financeiro */}
                                <div className="p-4 rounded-lg border border-primary/20 bg-primary/5">
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-white/80">Total Mensal:</span>
                                    <span className="text-lg font-bold text-primary">
                                      R$ {selectedCliente.totalMensal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                        
                        {/* Botão Gerar no Asaas */}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 text-green-400/60 hover:text-green-400 hover:bg-green-400/10"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleGerarAsaasIndividual(c);
                          }}
                          disabled={generatingIndividual === c.cliente_id}
                          title="Gerar cobrança no Asaas"
                        >
                          {generatingIndividual === c.cliente_id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <CreditCard className="w-3 h-3" />
                          )}
                        </Button>
                      </div>
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
