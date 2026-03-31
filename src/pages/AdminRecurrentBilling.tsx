import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
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
  DollarSign, TrendingUp, CheckCircle2, RefreshCw, Users, FileText, Loader2, Eye, Phone, Mail, IdCard, CreditCard, CalendarDays, History
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [clientes, setClientes] = useState<ClienteRecorrente[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [selectedCliente, setSelectedCliente] = useState<ClienteRecorrente | null>(null);
  const [generatingIndividual, setGeneratingIndividual] = useState<string | null>(null);

  const mesAtual = `${new Date().getFullYear()}-${(new Date().getMonth() + 1).toString().padStart(2, '0')}`;
  const mesDisplay = new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  const loadData = useCallback(async () => {
    setLoading(true);
    const { data: extras } = await supabase
      .from("extras_clientes")
      .select("id, cliente_id, preco_mensal, status, extras_catalogo(nome)")
      .gt("preco_mensal", 0)
      .eq("status", "ativo");

    if (!extras || extras.length === 0) {
      setClientes([]);
      setLoading(false);
      return;
    }

    const clienteIds = [...new Set(extras.map(e => e.cliente_id))];
    const { data: clientesData } = await supabase
      .from("clientes")
      .select("id, nome, email, documento, telefone")
      .in("id", clienteIds);

    const clienteMap = new Map(clientesData?.map(c => [c.id, c]) || []);
    const grouped = new Map<string, ClienteRecorrente>();

    for (const e of extras) {
      const c = clienteMap.get(e.cliente_id);
      if (!c) continue;
      if (!grouped.has(e.cliente_id)) {
        grouped.set(e.cliente_id, {
          cliente_id: e.cliente_id,
          cliente_nome: c.nome,
          cliente_email: c.email,
          cliente_documento: c.documento ?? undefined,
          cliente_telefone: c.telefone ?? undefined,
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
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    setSelected(selected.size === clientes.length ? new Set() : new Set(clientes.map(c => c.cliente_id)));
  };

  // Gerar fatura no financeiro + histórico (sem Asaas)
  const gerarFaturaFinanceiro = async (cliente: ClienteRecorrente): Promise<boolean> => {
    // Verificar se já existe cobrança para este mês
    const { data: existing } = await (supabase as any)
      .from("recurrent_billing_history")
      .select("id")
      .eq("cliente_id", cliente.cliente_id)
      .eq("mes", mesAtual)
      .single();

    if (existing) {
      toast({ title: "Cobrança já existe", description: `${cliente.cliente_nome} já tem cobrança para ${mesDisplay}`, variant: "destructive" });
      return false;
    }

    const descricao = `Cobrança Recorrente — ${mesDisplay}\n` +
      cliente.extras.map(e => `• ${e.nome}: R$ ${Number(e.preco_mensal).toFixed(2)}/mês`).join('\n');

    const vencimento = new Date();
    vencimento.setDate(vencimento.getDate() + 10);

    // 1. Criar no financeiro
    const { data: fin, error: finError } = await supabase
      .from("financeiro")
      .insert({
        cliente_id: cliente.cliente_id,
        tipo: "entrada",
        valor: cliente.totalMensal,
        descricao,
        data: new Date().toISOString().split("T")[0],
        vencimento: vencimento.toISOString().split("T")[0],
        status: "pendente",
      })
      .select()
      .single();

    if (finError || !fin) {
      console.error("Erro ao criar financeiro:", finError);
      return false;
    }

    // 2. Criar no histórico recorrente
    await (supabase as any)
      .from("recurrent_billing_history")
      .insert({
        cliente_id: cliente.cliente_id,
        mes: mesAtual,
        ano: new Date().getFullYear(),
        mes_numero: new Date().getMonth() + 1,
        valor_total: cliente.totalMensal,
        status: "pendente",
        financeiro_id: fin.id,
        extras_count: cliente.extras.length,
        descricao,
      });

    return true;
  };

  // Gerar faturas em lote (financeiro apenas)
  const handleGenerateBills = async () => {
    if (selected.size === 0) {
      toast({ title: "Selecione ao menos um cliente", variant: "destructive" });
      return;
    }

    setGenerating(true);
    let success = 0, errors = 0;

    for (const clienteId of selected) {
      const cliente = clientes.find(c => c.cliente_id === clienteId);
      if (!cliente) continue;

      try {
        const ok = await gerarFaturaFinanceiro(cliente);
        if (ok) success++; else errors++;
      } catch (err) {
        console.error("Erro:", err);
        errors++;
      }
    }

    setGenerating(false);
    setSelected(new Set());

    if (success > 0) {
      toast({ title: `${success} fatura(s) gerada(s) no Financeiro!`, description: `Competência: ${mesDisplay}` });
    }
    if (errors > 0) {
      toast({ title: `${errors} erro(s) ao gerar`, variant: "destructive" });
    }

    loadData();
  };

  // Gerar fatura individual
  const handleGerarIndividual = async (cliente: ClienteRecorrente) => {
    setGeneratingIndividual(cliente.cliente_id);
    try {
      const ok = await gerarFaturaFinanceiro(cliente);
      if (ok) {
        toast({ title: "Fatura gerada!", description: `${cliente.cliente_nome} — ${mesDisplay}` });
      }
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    } finally {
      setGeneratingIndividual(null);
    }
  };

  const totalGeralMensal = clientes.reduce((acc, c) => acc + c.totalMensal, 0);
  const totalSelecionado = clientes.filter(c => selected.has(c.cliente_id)).reduce((acc, c) => acc + c.totalMensal, 0);

  return (
    <motion.div className="space-y-6 p-3 sm:p-6" initial="hidden" animate="show" variants={fadeUp}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-1">Cobranças Recorrentes</h1>
          <p className="text-xs text-muted-foreground">Selecione clientes e gere faturas no Financeiro — Competência: <strong>{mesDisplay}</strong></p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => navigate("/admin/recurrent-history")} variant="outline" size="sm">
            <History className="w-4 h-4 mr-2" /> Histórico
          </Button>
          <Button
            onClick={handleGenerateBills}
            disabled={generating || selected.size === 0}
            className="bg-primary text-primary-foreground"
            size="sm"
          >
            {generating ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Gerando...</>
            ) : (
              <><FileText className="w-4 h-4 mr-2" /> Gerar Faturas ({selected.size})</>
            )}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { icon: Users, color: "text-emerald-400", bg: "bg-emerald-500/10", value: clientes.length, label: "Clientes Recorrentes" },
          { icon: TrendingUp, color: "text-blue-400", bg: "bg-blue-500/10", value: `R$ ${totalGeralMensal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, label: "Total Mensal" },
          { icon: DollarSign, color: "text-amber-400", bg: "bg-amber-500/10", value: `R$ ${totalSelecionado.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, label: "Selecionado p/ Cobrança" },
        ].map((s, i) => (
          <Card key={i}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`p-2 rounded-lg ${s.bg}`}><s.icon className={`w-5 h-5 ${s.color}`} /></div>
              <div>
                <p className="text-xl font-black text-foreground">{s.value}</p>
                <p className="text-[10px] text-muted-foreground uppercase font-bold">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabela */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-primary" /> Clientes com Extras Recorrentes
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-10 text-muted-foreground text-xs">Carregando...</div>
          ) : clientes.length === 0 ? (
            <div className="text-center py-10">
              <CheckCircle2 className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
              <p className="text-xs text-muted-foreground">Nenhum cliente com extras recorrentes ativos</p>
            </div>
          ) : (
            <Table className="min-w-[500px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <Checkbox checked={selected.size === clientes.length && clientes.length > 0} onCheckedChange={toggleAll} />
                  </TableHead>
                  <TableHead className="text-[10px] text-muted-foreground uppercase">Cliente</TableHead>
                  <TableHead className="text-[10px] text-muted-foreground uppercase">Extras</TableHead>
                  <TableHead className="text-[10px] text-muted-foreground uppercase text-right">Valor Mensal</TableHead>
                  <TableHead className="text-[10px] text-muted-foreground uppercase text-center">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clientes.map((c) => (
                  <TableRow
                    key={c.cliente_id}
                    className={`cursor-pointer transition-colors ${selected.has(c.cliente_id) ? 'bg-primary/5' : 'hover:bg-secondary/50'}`}
                    onClick={() => toggleSelect(c.cliente_id)}
                  >
                    <TableCell onClick={e => e.stopPropagation()}>
                      <Checkbox checked={selected.has(c.cliente_id)} onCheckedChange={() => toggleSelect(c.cliente_id)} />
                    </TableCell>
                    <TableCell>
                      <p className="text-sm font-bold text-foreground">{c.cliente_nome}</p>
                      <p className="text-[10px] text-muted-foreground">{c.cliente_email}</p>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {c.extras.map((e) => (
                          <Badge key={e.id} variant="outline" className="text-[9px]">{e.nome}</Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="text-sm font-bold text-foreground">
                        R$ {c.totalMensal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </span>
                    </TableCell>
                    <TableCell onClick={e => e.stopPropagation()} className="text-center">
                      <div className="flex items-center gap-1 justify-center">
                        {/* Ver dados */}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="ghost" className="h-7 w-7" onClick={() => setSelectedCliente(c)}>
                              <Eye className="w-3 h-3" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle className="text-foreground">Dados do Cliente</DialogTitle>
                            </DialogHeader>
                            {selectedCliente && (
                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2"><IdCard className="w-4 h-4 text-primary" /><span className="text-sm">{selectedCliente.cliente_nome}</span></div>
                                  <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-primary" /><span className="text-sm">{selectedCliente.cliente_email}</span></div>
                                  {selectedCliente.cliente_documento && <div className="flex items-center gap-2"><IdCard className="w-4 h-4 text-primary" /><span className="text-sm">{selectedCliente.cliente_documento}</span></div>}
                                  {selectedCliente.cliente_telefone && <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-primary" /><span className="text-sm">{selectedCliente.cliente_telefone}</span></div>}
                                </div>
                                <div className="space-y-2">
                                  <p className="text-xs font-bold text-muted-foreground uppercase">Extras</p>
                                  {selectedCliente.extras.map(e => (
                                    <div key={e.id} className="flex justify-between p-2 rounded-lg bg-secondary">
                                      <span className="text-sm text-foreground">{e.nome}</span>
                                      <span className="text-sm font-bold text-foreground">R$ {e.preco_mensal.toFixed(2)}/mês</span>
                                    </div>
                                  ))}
                                </div>
                                <div className="p-3 rounded-lg bg-primary/10 flex justify-between items-center">
                                  <span className="text-sm text-foreground">Total Mensal:</span>
                                  <span className="text-lg font-bold text-primary">R$ {selectedCliente.totalMensal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>

                        {/* Histórico */}
                        <Button size="sm" variant="ghost" className="h-7 w-7" onClick={() => navigate("/admin/recurrent-history")} title="Ver histórico">
                          <CalendarDays className="w-3 h-3" />
                        </Button>

                        {/* Gerar fatura individual */}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10"
                          onClick={() => handleGerarIndividual(c)}
                          disabled={generatingIndividual === c.cliente_id}
                          title="Gerar fatura no Financeiro"
                        >
                          {generatingIndividual === c.cliente_id ? <Loader2 className="w-3 h-3 animate-spin" /> : <DollarSign className="w-3 h-3" />}
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
      <Card>
        <CardContent className="p-4 space-y-2">
          <h3 className="text-xs font-black text-foreground uppercase tracking-wider mb-3">Como funciona</h3>
          {[
            { color: "bg-emerald-400", text: "Selecione os clientes que deseja cobrar este mês" },
            { color: "bg-blue-400", text: "Clique em 'Gerar Faturas' — a cobrança vai para o Financeiro como pendente" },
            { color: "bg-amber-400", text: "No Histórico, marque cada mês como 'Pago Manualmente' ou 'Pago pelo Asaas'" },
            { color: "bg-purple-400", text: "Nenhuma cobrança é gerada automaticamente — você tem controle total" },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className={`w-1.5 h-1.5 rounded-full ${item.color} shrink-0`} />
              <p className="text-[11px] text-muted-foreground">{item.text}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  );
}
