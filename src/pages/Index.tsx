import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Users, FolderKanban, ShoppingCart, DollarSign, Headphones, TrendingUp, AlertTriangle, Plus, Sparkles, Calendar, BellRing, Clock } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import StatusBadge from "@/components/StatusBadge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };
const stagger = { show: { transition: { staggerChildren: 0.08 } } };

export default function Dashboard() {
  const { toast } = useToast();
  const [stats, setStats] = useState({ clientes: 0, projetos: 0, pedidos: 0, receita: 0 });
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [dbStatus, setDbStatus] = useState<"conectado" | "erro" | "carregando">("carregando");
  const [subCount, setSubCount] = useState(0);

  // Add Extra state
  const [showAddExtra, setShowAddExtra] = useState(false);
  const [clientes, setClientes] = useState<any[]>([]);
  const [catalogo, setCatalogo] = useState<any[]>([]);
  const [clienteSel, setClienteSel] = useState("");
  const [extraSel, setExtraSel] = useState("");
  const [obs, setObs] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      const [c, p, ped, t, fin] = await Promise.all([
        supabase.from("clientes").select("*", { count: "exact", head: true }).eq("status", "ativo"),
        supabase.from("projetos").select("*", { count: "exact", head: true }).eq("status", "em_andamento"),
        supabase.from("pedidos").select("*, clientes(nome)").order("created_at", { ascending: false }).limit(5),
        supabase.from("tickets").select("*, clientes(nome)").neq("status", "resolvido").order("created_at", { ascending: false }).limit(5),
        supabase.from("financeiro").select("valor").eq("tipo", "entrada").eq("status", "pago"),
      ]);
      const receita = (fin.data || []).reduce((s: number, f: any) => s + Number(f.valor), 0);
      setStats({ clientes: c.count || 0, projetos: p.count || 0, pedidos: (ped.data || []).filter((x: any) => x.status === "pendente").length, receita });
      setPedidos(ped.data || []);
      setTickets(t.data || []);
      if (c.error) console.error("[Dashboard] Error fetching clients:", c.error);
      if (p.error) console.error("[Dashboard] Error fetching projects:", p.error);
      if (ped.error) console.error("[Dashboard] Error fetching orders:", ped.error);
      if (t.error) console.error("[Dashboard] Error fetching tickets:", t.error);
      if (fin.error) console.error("[Dashboard] Error fetching finance:", fin.error);

      setDbStatus(c.error || p.error || ped.error || t.error || fin.error ? "erro" : "conectado");

      // Count subscriptions
      supabase.from("push_subscriptions").select("id", { count: "exact", head: true })
        .then(({ count }) => setSubCount(count || 0));
    };
    load();
  }, []);

  const openAddExtra = async () => {
    const [cli, cat] = await Promise.all([
      supabase.from("clientes").select("id, nome").eq("status", "ativo").order("nome"),
      supabase.from("extras_catalogo").select("*").eq("status", "ativo").order("nome"),
    ]);
    setClientes(cli.data || []);
    setCatalogo(cat.data || []);
    setShowAddExtra(true);
  };

  const handleAddExtra = async () => {
    if (!clienteSel || !extraSel) return;
    const extra = catalogo.find(c => c.id === extraSel);
    if (!extra) return;
    setSaving(true);
    const { error } = await supabase.from("extras_clientes").insert({
      cliente_id: clienteSel,
      extra_id: extra.id,
      categoria: extra.categoria,
      preco_ativacao: Number(extra.preco_ativacao) || 0,
      preco_mensal: Number(extra.preco_mensal) || 0,
      observacao: obs || null,
    });
    setSaving(false);
    if (error) { toast({ title: "Erro", description: error.message, variant: "destructive" }); return; }
    const clienteNome = clientes.find(c => c.id === clienteSel)?.nome;
    toast({ title: "Extra adicionado!", description: `"${extra.nome}" vinculado a ${clienteNome}.` });
    setShowAddExtra(false);
    setClienteSel("");
    setExtraSel("");
    setObs("");
  };

  const kpis = [
    { label: "Clientes ativos", value: String(stats.clientes), change: "", icon: Users, color: "from-blue-500 to-blue-600" },
    { label: "Projetos em andamento", value: String(stats.projetos), change: "", icon: FolderKanban, color: "from-emerald-500 to-emerald-600" },
    { label: "Pedidos pendentes", value: String(stats.pedidos), change: stats.pedidos > 0 ? "Atenção" : "", icon: ShoppingCart, color: "from-amber-500 to-amber-600", alert: stats.pedidos > 0 },
    { label: "Receita total", value: `R$ ${(stats.receita / 1000).toFixed(0)}k`, change: "", icon: DollarSign, color: "from-violet-500 to-violet-600" },
  ];

  const selectedExtra = catalogo.find(c => c.id === extraSel);

  return (
    <motion.div className="space-y-6 ambient-glow min-h-screen pb-10" initial="hidden" animate="show" variants={stagger}>
      {/* Header Premium */}
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            Dashboard <Badge variant="outline" className="text-[10px] border-primary/30 text-primary bg-primary/10">v2.4.8 Premium</Badge>
          </h1>
          <p className="text-xs text-[hsl(var(--muted-foreground))]">Bem-vindo de volta! Aqui está o resumo do seu negócio hoje.</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[11px] text-white/50">
          <Clock className="w-3.5 h-3.5 text-emerald-400" />
          Sistema Operacional • {new Date().toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' })}
        </div>
      </motion.div>

      {/* KPIs */}
      <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" variants={fadeUp}>
        {kpis.map((kpi) => (
          <Card key={kpi.label} className="glass-card border-white/5 overflow-hidden info-card-hover group relative">
            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${kpi.color} opacity-0 group-hover:opacity-10 blur-[40px] transition-opacity duration-500`} />
            <CardContent className="p-5 relative z-10">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-[hsl(var(--muted-foreground))] font-semibold">{kpi.label}</p>
                  <p className="text-3xl font-bold text-white mt-1.5 tracking-tight">{kpi.value}</p>
                  {kpi.change && (
                    <p className={`text-[11px] mt-2 flex items-center gap-1 font-medium ${kpi.alert ? "text-amber-400" : "text-emerald-400"}`}>
                      {kpi.alert ? <AlertTriangle className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
                      {kpi.change}
                    </p>
                  )}
                </div>
                <div className={`p-3 rounded-2xl bg-gradient-to-br ${kpi.color} shadow-lg shadow-black/20 group-hover:scale-110 transition-transform duration-500`}>
                  <kpi.icon className="w-5 h-5 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>


      {/* Quick Actions Premium */}
      <motion.div variants={fadeUp}>
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-bold text-white uppercase tracking-widest">Ações Rápidas</h2>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button className="h-14 px-6 rounded-2xl gradient-primary text-white shadow-xl shadow-[hsl(var(--primary))]/20 hover:shadow-[hsl(var(--primary))]/40 hover:-translate-y-1 transition-all duration-300 text-sm font-semibold border-0 group" onClick={openAddExtra}>
            <Plus className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform" /> Adicionar Extra
          </Button>
          <Button asChild className="h-14 px-6 rounded-2xl bg-white/5 hover:bg-white/10 text-white border border-white/10 shadow-lg hover:-translate-y-1 transition-all duration-300 text-sm font-medium">
            <Link to="/admin/clientes">
              <Users className="w-4 h-4 mr-2 text-blue-400" /> Novo Cliente
            </Link>
          </Button>
          <Button asChild className="h-14 px-6 rounded-2xl bg-white/5 hover:bg-white/10 text-white border border-white/10 shadow-lg hover:-translate-y-1 transition-all duration-300 text-sm font-medium">
            <Link to="/admin/financeiro">
              <DollarSign className="w-4 h-4 mr-2 text-emerald-400" /> Nova Fatura
            </Link>
          </Button>
          <Button asChild className="h-14 px-6 rounded-2xl bg-white/5 hover:bg-white/10 text-white border border-white/10 shadow-lg hover:-translate-y-1 transition-all duration-300 text-sm font-medium">
            <Link to="/admin/projetos">
              <FolderKanban className="w-4 h-4 mr-2 text-amber-400" /> Novo Projeto
            </Link>
          </Button>
          <Button asChild className="h-14 px-6 rounded-2xl bg-white/5 hover:bg-white/10 text-white border border-white/10 shadow-lg hover:-translate-y-1 transition-all duration-300 text-sm font-medium">
            <Link to="/admin/agenda">
              <Calendar className="w-4 h-4 mr-2 text-red-400" /> Nova Reunião
            </Link>
          </Button>
          <Button asChild className="h-14 px-6 rounded-2xl bg-white/5 hover:bg-white/10 text-white border border-white/10 shadow-lg hover:-translate-y-1 transition-all duration-300 text-sm font-medium">
            <Link to="/admin/leads">
              <Sparkles className="w-4 h-4 mr-2 text-purple-400" /> Capturar Leads
            </Link>
          </Button>
          <Button asChild className="h-14 px-6 rounded-2xl bg-white/5 hover:bg-white/10 text-white border border-white/10 shadow-lg hover:-translate-y-1 transition-all duration-300 text-sm font-medium">
            <Link to="/admin/suporte">
              <Headphones className="w-4 h-4 mr-2 text-indigo-400" /> Suporte
            </Link>
          </Button>
        </div>
      </motion.div>

      {/* System Status Alert */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass-card border-[0.5px] bg-emerald-500/5 border-emerald-500/20">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <div>
                <p className="text-xs font-semibold text-white">Banco de Dados</p>
                <p className="text-[10px] text-emerald-400">Operacional • Latência Baixa</p>
              </div>
            </div>
            <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${dbStatus === "conectado" ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}>
              {dbStatus === "conectado" ? "ESTÁVEL" : "ERRO"}
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-[0.5px] bg-blue-500/5 border-blue-500/20">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BellRing className="w-4 h-4 text-blue-400" />
              <div>
                <p className="text-xs font-semibold text-white">Notificações Push</p>
                <p className="text-[10px] text-blue-400">{subCount} aparelhos registrados</p>
              </div>
            </div>
            <Link to="/admin/configuracoes?tab=notificacoes" className="text-[10px] font-bold text-blue-400 hover:underline">GERENCIAR</Link>
          </CardContent>
        </Card>

        <Card className="glass-card border-[0.5px] bg-purple-500/5 border-purple-500/20">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-4 h-4 text-purple-400" />
              <div>
                <p className="text-xs font-semibold text-white">Performance Mensal</p>
                <p className="text-[10px] text-purple-400">Crescimento de +12.5%</p>
              </div>
            </div>
            <Link to="/admin/relatorios" className="text-[10px] font-bold text-purple-400 hover:underline">VER MAIS</Link>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tables */}
      <motion.div className="grid grid-cols-1 lg:grid-cols-2 gap-4" variants={fadeUp}>
        <Card className="glass-card border-[0.5px]">
          <CardHeader><CardTitle className="text-sm font-semibold text-white">Pedidos Recentes</CardTitle></CardHeader>
          <CardContent>
            {pedidos.length === 0 ? (
              <p className="text-sm text-[hsl(var(--muted-foreground))] text-center py-8">Nenhum pedido ainda</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-[rgba(255,255,255,0.06)]">
                    <TableHead className="text-[11px] text-[hsl(var(--muted-foreground))]">Cliente</TableHead>
                    <TableHead className="text-[11px] text-[hsl(var(--muted-foreground))]">Tipo</TableHead>
                    <TableHead className="text-[11px] text-[hsl(var(--muted-foreground))]">Valor</TableHead>
                    <TableHead className="text-[11px] text-[hsl(var(--muted-foreground))]">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pedidos.map((p: any) => (
                    <TableRow key={p.id} className="border-[rgba(255,255,255,0.04)]">
                      <TableCell className="text-sm text-white">{p.clientes?.nome || "—"}</TableCell>
                      <TableCell className="text-sm text-[hsl(var(--muted-foreground))]">{p.tipo}</TableCell>
                      <TableCell className="text-sm text-white">R$ {Number(p.valor).toLocaleString("pt-BR")}</TableCell>
                      <TableCell><StatusBadge status={p.status} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card className="glass-card border-[0.5px]">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
              <Headphones className="w-4 h-4" /> Tickets de Suporte
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {tickets.length === 0 ? (
              <p className="text-sm text-[hsl(var(--muted-foreground))] text-center py-8">Nenhum ticket aberto</p>
            ) : (
              tickets.map((t: any) => (
                <div key={t.id} className="flex items-start justify-between p-3 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)]">
                  <div>
                    <p className="text-sm font-medium text-white">{t.titulo}</p>
                    <p className="text-[11px] text-[hsl(var(--muted-foreground))] mt-0.5">{t.clientes?.nome || "—"}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <StatusBadge status={t.prioridade} />
                    <StatusBadge status={t.status} />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Dialog Adicionar Extra */}
      <Dialog open={showAddExtra} onOpenChange={setShowAddExtra}>
        <DialogContent className="glass-card border-[0.5px] text-white max-w-md">
          <DialogHeader><DialogTitle className="text-white">Adicionar Extra ao Cliente</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label className="text-xs text-[hsl(var(--muted-foreground))]">Cliente</Label>
              <Select value={clienteSel} onValueChange={setClienteSel}>
                <SelectTrigger className="glass-input border-[rgba(255,255,255,0.1)] text-white"><SelectValue placeholder="Selecione o cliente" /></SelectTrigger>
                <SelectContent>
                  {clientes.map(c => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-[hsl(var(--muted-foreground))]">Extra</Label>
              <Select value={extraSel} onValueChange={setExtraSel}>
                <SelectTrigger className="glass-input border-[rgba(255,255,255,0.1)] text-white"><SelectValue placeholder="Selecione o extra" /></SelectTrigger>
                <SelectContent>
                  {catalogo.map(e => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.nome} {Number(e.preco_mensal) > 0 ? `(R$ ${Number(e.preco_mensal).toFixed(2)}/mês)` : ""} {Number(e.preco_ativacao) > 0 ? `(Ativ: R$ ${Number(e.preco_ativacao).toFixed(2)})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedExtra && (
              <div className="p-3 rounded-xl bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.06)]">
                <p className="text-sm font-medium text-white">{selectedExtra.nome}</p>
                {selectedExtra.descricao && <p className="text-[11px] text-[hsl(var(--muted-foreground))] mt-0.5">{selectedExtra.descricao}</p>}
                <div className="flex gap-3 mt-2 text-xs text-[hsl(var(--muted-foreground))]">
                  <span className="text-emerald-400">{selectedExtra.categoria}</span>
                  {Number(selectedExtra.preco_ativacao) > 0 && <span>Ativação: R$ {Number(selectedExtra.preco_ativacao).toFixed(2)}</span>}
                  {Number(selectedExtra.preco_mensal) > 0 && <span>Mensal: R$ {Number(selectedExtra.preco_mensal).toFixed(2)}</span>}
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <Label className="text-xs text-[hsl(var(--muted-foreground))]">Observação (opcional)</Label>
              <Textarea className="glass-input border-[rgba(255,255,255,0.1)] text-white text-sm min-h-[60px]" placeholder="Ex: Cortesia por 3 meses..." value={obs} onChange={e => setObs(e.target.value)} />
            </div>

            <Button className="gradient-primary border-0 text-white w-full rounded-lg" onClick={handleAddExtra} disabled={!clienteSel || !extraSel || saving}>
              {saving ? "Salvando..." : "Confirmar"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
