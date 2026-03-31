import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { 
  Users, Plus, Search, Mail, Phone, MapPin, 
  Trash2, Pencil, ExternalLink, ArrowLeft,
  DollarSign, Package, Sparkles, FileText,
  AlertCircle, CheckCircle2, Clock, Zap,
  ArrowRight, UserPlus, Copy, RefreshCw, Pause
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { 
  Card, CardContent, CardHeader, CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from "@/components/ui/table";
import {
  Tabs, TabsContent, TabsList, TabsTrigger
} from "@/components/ui/tabs";
import { 
  Dialog, DialogContent, DialogDescription, 
  DialogHeader, DialogTitle, DialogTrigger 
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "react-router-dom";
import { sendPushToAdmins } from "@/lib/push-notifications";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

const catLabels: any = {
  vendas: "Vendas / Social",
  estratégia: "Estratégia",
  conteúdo: "Conteúdo",
  desenvolvimento: "Dev",
  design: "Branding",
  gestão: "Gestão"
};

const catColors: any = {
  vendas: "text-blue-400",
  estratégia: "text-purple-400",
  conteúdo: "text-pêssego-400",
  desenvolvimento: "text-emerald-400",
  design: "text-pink-400",
  gestão: "text-amber-400"
};

const StatusBadge = ({ status }: { status: string }) => {
  const configs: any = {
    ativo: { icon: CheckCircle2, color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20", label: "Ativo" },
    inativo: { icon: AlertCircle, color: "text-red-400 bg-red-400/10 border-red-400/20", label: "Inativo" },
    pago: { icon: CheckCircle2, color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20", label: "Pago" },
    pendente: { icon: Clock, color: "text-amber-400 bg-amber-400/10 border-amber-400/20", label: "Pendente" },
    briefing: { icon: Sparkles, color: "text-purple-400 bg-purple-400/10 border-purple-400/20", label: "Briefing" },
    em_andamento: { icon: RefreshCw, color: "text-blue-400 bg-blue-400/10 border-blue-400/20", label: "Execução" }
  };
  const config = configs[status] || configs.ativo;
  const Icon = config.icon;
  return (
    <Badge variant="outline" className={`${config.color} gap-1.5 py-1 px-3 border-[0.5px] rounded-full`}>
      <Icon className="w-3 h-3" /> {config.label}
    </Badge>
  );
};

function ClienteDetalhes({ clienteId, onBack }: { clienteId: string; onBack: () => void }) {
  const { toast } = useToast();
  const [cliente, setCliente] = useState<any>(null);
  const [extras, setExtras] = useState<any[]>([]);
  const [projetos, setProjetos] = useState<any[]>([]);
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [catalogo, setCatalogo] = useState<any[]>([]);
  const [showAddExtra, setShowAddExtra] = useState(false);
  const [extraSelecionado, setExtraSelecionado] = useState("");
  const [observacao, setObservacao] = useState("");
  const [savingExtra, setSavingExtra] = useState(false);

  const loadData = useCallback(async () => {
    const { data: c } = await supabase.from("clientes").select("*").eq("id", clienteId).single();
    if (c) setCliente(c);

    const { data: e } = await supabase.from("extras_clientes").select("*, extras_catalogo(*)").eq("cliente_id", clienteId);
    if (e) setExtras(e);

    const { data: p } = await supabase.from("projetos").select("*").eq("cliente_id", clienteId).order("created_at", { ascending: false });
    if (p) setProjetos(p);

    const { data: ped } = await supabase.from("pedidos").select("*").eq("cliente_id", clienteId).order("created_at", { ascending: false });
    if (ped) setPedidos(ped);

    const { data: cat } = await supabase.from("extras_catalogo").select("*");
    if (cat) setCatalogo(cat);
  }, [clienteId]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleAddExtra = async () => {
    if (!extraSelecionado) return;
    setSavingExtra(true);
    const sel = catalogo.find(c => c.id === extraSelecionado);
    const { error } = await (supabase.from("clientes_extras" as any) as any).insert({
      cliente_id: clienteId,
      extra_id: extraSelecionado,
      categoria: sel?.categoria || "vendas",
      preco_ativacao: sel?.preco_ativacao || 0,
      preco_mensal: sel?.preco_mensal || 0,
      observacao,
      status: "pendente"
    });

    if (error) {
      toast({ title: "Erro ao adicionar", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Extra adicionado!", description: "Recurso vinculado ao cliente." });
      loadData();
      setShowAddExtra(false);
      setExtraSelecionado("");
      setObservacao("");
    }
    setSavingExtra(false);
  };

  if (!cliente) return null;

  const totalMensal = extras.reduce((acc, curr) => acc + (Number(curr.preco_mensal) || 0), 0);
  const totalAtivacoes = extras.reduce((acc, curr) => acc + (Number(curr.preco_ativacao) || 0), 0);
  const avatar = cliente.nome?.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();

  const extrasDisponiveis = catalogo.filter(c => !extras.some(e => e.extra_id === c.id));

  return (
    <motion.div className="space-y-6" initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.08 } } }}>
      <motion.div variants={fadeUp}>
        <Button variant="ghost" className="text-[hsl(var(--muted-foreground))] hover:text-white mb-3" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Voltar para Clientes
        </Button>
        <Card className="glass-card border-[0.5px]">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full gradient-primary flex items-center justify-center">
                <span className="text-white text-lg font-bold">{avatar}</span>
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-white">{cliente.nome}</h2>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">{cliente.email} · {cliente.telefone}</p>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 mt-3">
                   <div className="flex-1 max-w-sm">
                      <Label className="text-[10px] text-white/30 uppercase font-bold mb-1 block">URL do Site</Label>
                      <div className="flex gap-2">
                         <Input 
                           value={cliente.site_url || ""} 
                           onChange={e => setCliente({ ...cliente, site_url: e.target.value })}
                           placeholder="https://exemplo.com.br"
                           className="glass-input h-8 text-xs border-white/10"
                         />
                         <Button 
                           size="sm" 
                           className="h-8 gradient-primary border-0 text-[10px] px-3"
                           onClick={async () => {
                             const { error } = await supabase.from("clientes").update({ site_url: cliente.site_url } as any).eq("id", clienteId);
                             if (error) toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
                             else toast({ title: "URL do site salva!" });
                           }}
                         >
                           Salvar
                         </Button>
                      </div>
                   </div>
                   <div className="flex-1 max-w-[200px]">
                      <Label className="text-[10px] text-white/30 uppercase font-bold mb-1 block">Slug (URL Cardápio)</Label>
                      <div className="flex gap-2">
                         <Input 
                           value={cliente.slug || ""} 
                           onChange={e => setCliente({ ...cliente, slug: e.target.value.toLowerCase().replace(/ /g, '-') })}
                           placeholder="pizzaria-joao"
                           className="glass-input h-8 text-xs border-white/10"
                         />
                         <Button 
                           size="sm" 
                           variant="outline"
                           className="h-8 border-white/10 text-[10px] px-3"
                           onClick={async () => {
                             const { error } = await supabase.from("clientes").update({ slug: cliente.slug } as any).eq("id", clienteId);
                             if (error) toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
                             else toast({ title: "Slug atualizado!" });
                           }}
                         >
                           OK
                         </Button>
                      </div>
                   </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 mt-6 p-4 rounded-2xl bg-white/5 border border-white/10">
                   <div className="flex-1">
                      <p className="text-[10px] text-white/40 uppercase font-bold mb-1">Status do Acesso / Trial</p>
                      <div className="flex items-center gap-2">
                        <Input 
                          type="date"
                          value={cliente.trial_ends_at ? new Date(cliente.trial_ends_at).toISOString().split('T')[0] : ""}
                          onChange={e => setCliente({ ...cliente, trial_ends_at: e.target.value })}
                          className="glass-input h-9 text-xs w-40"
                        />
                        {cliente.trial_ends_at && new Date(cliente.trial_ends_at) < new Date() ? (
                          <Badge variant="outline" className="border-red-500/50 text-red-500 bg-red-500/10">EXPIRADO</Badge>
                        ) : (
                          <Badge variant="outline" className="border-emerald-500/50 text-emerald-500 bg-emerald-500/10">ATIVO</Badge>
                        )}
                      </div>
                   </div>
                   <div className="flex items-end gap-2">
                      <Button 
                         size="sm" 
                         variant="outline" 
                         className="h-9 border-white/10 hover:bg-white/5 text-[10px]"
                         onClick={async () => {
                           const newDate = new Date();
                           newDate.setDate(newDate.getDate() + 7);
                           const { error } = await supabase.from("clientes").update({ trial_ends_at: newDate.toISOString() } as any).eq("id", clienteId);
                           if (error) toast({ title: "Erro", description: error.message, variant: "destructive" });
                           else { toast({ title: "Trial expandido!", description: "+7 dias concedidos." }); loadData(); }
                         }}
                      >
                         Dar +7 Dias
                      </Button>
                      <Button 
                         size="sm" 
                         variant="outline" 
                         className="h-9 border-red-500/20 text-red-500 hover:bg-red-500/10 text-[10px]"
                         onClick={async () => {
                           const newDate = new Date();
                           newDate.setDate(newDate.getDate() - 1);
                           const { error } = await supabase.from("clientes").update({ trial_ends_at: newDate.toISOString() } as any).eq("id", clienteId);
                           if (error) toast({ title: "Erro", description: error.message, variant: "destructive" });
                           else { toast({ title: "Acesso Bloqueado!", variant: "destructive" }); loadData(); }
                         }}
                      >
                         <Pause className="w-3 h-3 mr-1" /> Bloquear Agora
                      </Button>
                      <Button 
                         size="sm" 
                         className="h-9 gradient-primary border-0 text-[10px]"
                         onClick={async () => {
                           const { error } = await supabase.from("clientes").update({ trial_ends_at: cliente.trial_ends_at } as any).eq("id", clienteId);
                           if (error) toast({ title: "Erro", description: error.message, variant: "destructive" });
                           else toast({ title: "Data salva!" });
                         }}
                      >
                         Salvar Data
                      </Button>
                   </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-3">
                 <Button
                   className="gradient-primary text-white text-[10px] font-black uppercase tracking-widest h-10 px-6 rounded-xl shadow-lg flex items-center gap-2"
                   onClick={() => {
                     localStorage.setItem("clienteLogado", JSON.stringify(cliente));
                     window.open("/cliente/dashboard", "_blank");
                     toast({ title: "Modo Espelhamento", description: `Acessando portal como ${cliente.nome}` });
                   }}
                 >
                   <Zap className="w-3.5 h-3.5" /> Portal do Cliente
                 </Button>
                 <StatusBadge status={cliente.status} />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={fadeUp}>
        <Tabs defaultValue="extras" className="space-y-4">
          <TabsList className="glass-card border-[0.5px] bg-transparent p-1 gap-1">
            <TabsTrigger value="extras" className="data-[state=active]:gradient-primary data-[state=active]:text-white text-[hsl(var(--muted-foreground))] text-xs gap-1.5">
              <Package className="w-3.5 h-3.5" /> Extras ({extras.length})
            </TabsTrigger>
            <TabsTrigger value="briefing" className="data-[state=active]:gradient-primary data-[state=active]:text-white text-[hsl(var(--muted-foreground))] text-xs gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Briefing
            </TabsTrigger>
            <TabsTrigger value="financeiro" className="data-[state=active]:gradient-primary data-[state=active]:text-white text-[hsl(var(--muted-foreground))] text-xs gap-1.5">
              <DollarSign className="w-3.5 h-3.5" /> Financeiro
            </TabsTrigger>
            <TabsTrigger value="projetos" className="data-[state=active]:gradient-primary data-[state=active]:text-white text-[hsl(var(--muted-foreground))] text-xs">Projetos ({projetos.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="briefing" className="space-y-6">
            <Card className="glass-card border-[0.5px]">
              <CardHeader>
                <CardTitle className="text-sm font-bold text-white uppercase tracking-widest">Configuração do Projeto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] text-white/30 uppercase font-black">Título</Label>
                    <Input className="glass-input h-10" value={cliente.projeto_titulo || ""} onChange={e => setCliente({ ...cliente, projeto_titulo: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] text-white/30 uppercase font-black">Escopo/Briefing</Label>
                    <Textarea className="glass-input min-h-[120px]" value={cliente.projeto_briefing || ""} onChange={e => setCliente({ ...cliente, projeto_briefing: e.target.value })} />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" className="h-10 text-xs border-white/10" onClick={async () => {
                    const { error } = await supabase.from("clientes").update({
                      projeto_titulo: cliente.projeto_titulo,
                      projeto_briefing: cliente.projeto_briefing
                    } as any).eq("id", clienteId);
                    if (!error) toast({ title: "Briefing salvo!" });
                  }}>Salvar Rascunho</Button>
                  <Button className="gradient-primary h-10 text-xs" onClick={async () => {
                     const { error } = await supabase.from("projetos").insert({
                       titulo: cliente.projeto_titulo,
                       cliente_id: clienteId,
                       status: "briefing",
                       progresso: 10
                     });
                     if (!error) toast({ title: "Projeto Criado!" });
                  }}>Iniciar Projeto Oficial</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="financeiro" className="space-y-4">
             <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                   <DollarSign className="w-4 h-4 text-emerald-400" /> Histórico Financeiro
                </h3>
                <Button 
                  className="gradient-primary text-white text-[10px] font-black uppercase tracking-widest h-9 px-6 rounded-xl shadow-lg"
                  onClick={async () => {
                    const code = `PED-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
                    const { error } = await supabase.from("pedidos").insert({
                      codigo: code,
                      cliente_id: clienteId,
                      tipo: cliente.projeto_titulo || "Serviço Avulso",
                      valor: Number(cliente.projeto_valor || 0),
                      status: "pendente",
                      data: new Date().toISOString().split("T")[0]
                    });
                    if (!error) { toast({ title: "Fatura Gerada!" }); loadData(); }
                  }}
                >
                   <Plus className="w-3 h-3 mr-2" /> Gerar Cobrança
                </Button>
             </div>

             <div className="rounded-xl border border-white/5 overflow-hidden">
                <Table>
                   <TableHeader className="bg-white/5">
                      <TableRow className="border-white/5">
                         <TableHead className="text-[10px] text-white/50 uppercase font-black">Descrição</TableHead>
                         <TableHead className="text-[10px] text-white/50 uppercase font-black text-right">Valor</TableHead>
                         <TableHead className="text-[10px] text-white/50 uppercase font-black text-center">Data</TableHead>
                         <TableHead className="text-[10px] text-white/50 uppercase font-black text-center">Status</TableHead>
                         <TableHead className="text-[10px] text-white/50 uppercase font-black text-right">Ações</TableHead>
                      </TableRow>
                   </TableHeader>
                   <TableBody className="bg-white/[0.02]">
                      {pedidos.length === 0 ? (
                         <TableRow><TableCell colSpan={5} className="text-center py-10 text-xs text-white/20 italic">Sem faturas.</TableCell></TableRow>
                      ) : pedidos.map((p: any) => (
                         <TableRow key={p.id} className="border-white/5 hover:bg-white/[0.02] transition-colors">
                            <TableCell className="py-4">
                               <p className="text-xs font-bold text-white">{p.tipo || "Cobrança"}</p>
                               <span className="text-[9px] text-white/30 font-mono uppercase tracking-tighter">{p.codigo}</span>
                            </TableCell>
                            <TableCell className="text-xs text-white/70 font-bold text-right">
                               {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.valor || 0)}
                            </TableCell>
                            <TableCell className="text-[10px] text-white/40 text-center">
                               {p.data ? new Date(p.data).toLocaleDateString() : "—"}
                            </TableCell>
                            <TableCell className="text-center"><StatusBadge status={p.status} /></TableCell>
                            <TableCell>
                               <div className="flex items-center justify-end gap-2">
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className={`h-7 px-3 text-[9px] font-black uppercase rounded-lg border-white/10 ${p.status === 'pago' ? 'text-amber-400 hover:bg-amber-400/10' : 'text-emerald-400 hover:bg-emerald-400/10'}`}
                                    onClick={async () => {
                                       const next = p.status === "pago" ? "pendente" : "pago";
                                       const { error } = await supabase.from("pedidos").update({ status: next }).eq("id", p.id);
                                       if (!error) { toast({ title: "Status Alterado!" }); loadData(); }
                                    }}
                                  >
                                     {p.status === "pago" ? "Marcar Pendente" : "Marcar Pago"}
                                  </Button>
                                  <Dialog>
                                     <DialogTrigger asChild>
                                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-white/20 hover:text-white hover:bg-white/5 rounded-lg">
                                           <Pencil className="w-3 h-3" />
                                        </Button>
                                     </DialogTrigger>
                                     <DialogContent className="glass-card border-white/10 text-white max-w-sm">
                                        <DialogHeader><DialogTitle className="text-white text-sm">Editar Valor</DialogTitle></DialogHeader>
                                        <div className="space-y-4 mt-4">
                                           <div className="space-y-1.5">
                                              <Label className="text-[10px] text-white/50 uppercase">Valor (R$)</Label>
                                              <Input 
                                                type="number" 
                                                className="glass-input h-10" 
                                                defaultValue={p.valor}
                                                onBlur={async (e) => {
                                                   const val = Number(e.target.value);
                                                   if (val === p.valor) return;
                                                   const { error } = await supabase.from("pedidos").update({ valor: val }).eq("id", p.id);
                                                   if (!error) { toast({ title: "Valor Atualizado!" }); loadData(); }
                                                }}
                                              />
                                           </div>
                                        </div>
                                     </DialogContent>
                                  </Dialog>
                                  <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    className="h-7 w-7 p-0 text-red-500/20 hover:text-red-500 hover:bg-red-500/10 rounded-lg"
                                    onClick={async () => {
                                       if (!confirm("Excluir fatura?")) return;
                                       const { error } = await supabase.from("pedidos").delete().eq("id", p.id);
                                       if (!error) { toast({ title: "Fatura Excluída!" }); loadData(); }
                                    }}
                                  >
                                     <Trash2 className="w-3.5 h-3.5" />
                                  </Button>
                               </div>
                            </TableCell>
                         </TableRow>
                      ))}
                   </TableBody>
                </Table>
             </div>
          </TabsContent>

          <TabsContent value="extras" className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <Card className="glass-card bg-blue-500/[0.05] border-blue-500/10">
                  <CardContent className="p-4 flex items-center justify-between">
                     <div>
                        <p className="text-[10px] text-blue-400 uppercase font-black">Recorrência Mensal</p>
                        <p className="text-xl font-black text-white">R$ {totalMensal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                     </div>
                     <RefreshCw className="w-8 h-8 text-blue-500/20" />
                  </CardContent>
               </Card>
               <Card className="glass-card bg-emerald-500/[0.05] border-emerald-500/10">
                  <CardContent className="p-4 flex items-center justify-between">
                     <div>
                        <p className="text-[10px] text-emerald-400 uppercase font-black">Total Ativações</p>
                        <p className="text-xl font-black text-white">R$ {totalAtivacoes.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                     </div>
                     <DollarSign className="w-8 h-8 text-emerald-500/20" />
                  </CardContent>
               </Card>
            </div>
            <div className="flex justify-end"><Button className="gradient-primary h-9 text-xs" onClick={() => setShowAddExtra(true)}><Plus className="w-3.5 h-3.5 mr-2" /> Adicionar Recurso</Button></div>
            <div className="rounded-xl border border-white/5 overflow-hidden">
               <Table>
                 <TableHeader className="bg-white/5"><TableRow className="border-white/5">{["Recurso", "Status"].map(h => (<TableHead key={h} className="text-[10px] text-white/50 uppercase font-black">{h}</TableHead>))}</TableRow></TableHeader>
                 <TableBody className="bg-white/[0.02]">
                   {extras.length === 0 ? (<TableRow><TableCell colSpan={2} className="text-center py-10 text-xs text-white/20 italic">Sem recursos ativos.</TableCell></TableRow>) : extras.map((e: any) => (
                     <TableRow key={e.id} className="border-white/5">
                       <TableCell className="py-3 text-xs font-bold text-white">{e.extras_catalogo?.nome || "Serviço"}</TableCell>
                       <TableCell><StatusBadge status={e.status} /></TableCell>
                     </TableRow>
                   ))}
                 </TableBody>
               </Table>
            </div>
          </TabsContent>

          <TabsContent value="projetos">
               <div className="rounded-xl border border-white/5 overflow-hidden">
                <Table>
                  <TableHeader className="bg-white/5"><TableRow className="border-white/5">{["Projeto", "Status"].map(h => (<TableHead key={h} className="text-[10px] text-white/50 uppercase font-black">{h}</TableHead>))}</TableRow></TableHeader>
                  <TableBody className="bg-white/[0.02]">
                    {projetos.length === 0 ? (<TableRow><TableCell colSpan={2} className="text-center py-10 text-xs text-white/20 italic">Sem projetos.</TableCell></TableRow>) : projetos.map((p: any) => (
                      <TableRow key={p.id} className="border-white/5">
                        <TableCell className="py-3 text-xs font-bold text-white">{p.titulo}</TableCell>
                        <TableCell><StatusBadge status={p.status} /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
               </div>
          </TabsContent>
        </Tabs>
      </motion.div>

      <Dialog open={showAddExtra} onOpenChange={setShowAddExtra}>
        <DialogContent className="glass-card border-[0.5px] text-white max-w-md">
          <DialogHeader><DialogTitle className="text-white">Vincular Novo Recurso</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-white/50">Cátalogo de Serviços</Label>
              <select
                className="w-full h-10 rounded-xl glass-input border border-white/10 text-white text-xs px-3 bg-transparent outline-none focus:border-primary/50 transition-colors"
                value={extraSelecionado}
                onChange={(e) => setExtraSelecionado(e.target.value)}
              >
                <option value="" className="bg-[#0f1117]">Selecione um item...</option>
                {extrasDisponiveis.map((c) => (
                  <option key={c.id} value={c.id} className="bg-[#0f1117]">
                    {c.nome} — {catLabels[c.categoria] || c.categoria}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-white/50">Notas Adicionais</Label>
              <Textarea
                className="glass-input border-white/10 text-white text-xs min-h-[80px]"
                placeholder="Ex: Condições especiais, descontos..."
                value={observacao}
                onChange={(e) => setObservacao(e.target.value)}
              />
            </div>
            <Button
              className="gradient-primary text-white w-full rounded-xl h-11 font-black uppercase tracking-widest text-xs"
              onClick={handleAddExtra}
              disabled={!extraSelecionado || savingExtra}
            >
              {savingExtra ? "Processando..." : "Ativar Recurso"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

export default function Clientes() {
  const { toast } = useToast();
  const location = useLocation();
  const [clientes, setClientes] = useState<any[]>([]);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [selectedCliente, setSelectedCliente] = useState<string | null>(null);

  useEffect(() => {
    if (location.state?.selectedId) {
      setSelectedCliente(location.state.selectedId);
    }
  }, [location.state]);
  
  const [showNew, setShowNew] = useState(false);
  const [criarConta, setCriarConta] = useState(true);
  const [senhaCliente, setSenhaCliente] = useState("");
  const [contaCriada, setContaCriada] = useState<{ email: string; senha: string; link: string } | null>(null);
  const [form, setForm] = useState({ 
    nome: "", email: "", telefone: "", documento: "", endereco: "", cidade: "", estado: "", status: "ativo", site_url: "",
    // Campos do Onboarding de Elite
    projeto_titulo: "",
    projeto_valor: "",
    projeto_tipo: "site",
    gerar_fatura: true
  });
  const [saving, setSaving] = useState(false);

  const fetchClientes = useCallback(async () => {
    const { data } = await supabase.from("clientes").select("*").order("created_at", { ascending: false });
    if (data) setClientes(data);
  }, []);

  useEffect(() => { fetchClientes(); }, [fetchClientes]);

  if (selectedCliente) {
    return <ClienteDetalhes clienteId={selectedCliente} onBack={() => setSelectedCliente(null)} />;
  }

  const filtrados = clientes.filter((c) => {
    const matchBusca = c.nome.toLowerCase().includes(busca.toLowerCase()) || c.email.toLowerCase().includes(busca.toLowerCase());
    const matchStatus = filtroStatus === "todos" || c.status === filtroStatus;
    return matchBusca && matchStatus;
  });

  const handleSave = async () => {
    if (!form.nome || !form.email) {
      toast({ title: "Preencha nome e e-mail", variant: "destructive" });
      return;
    }
    setSaving(true);
    const avatar = form.nome.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
    
    // 1. Inserir Cliente
    const { data: novoCliente, error } = await supabase.from("clientes").insert({ 
      nome: form.nome, email: form.email, telefone: form.telefone, documento: form.documento,
      endereco: form.endereco, cidade: form.cidade, estado: form.estado, status: form.status,
      site_url: form.site_url, avatar, senha: senhaCliente 
    } as any).select().single();

    if (error) { toast({ title: "Erro ao criar cliente", description: error.message, variant: "destructive" }); setSaving(false); return; }
 
    // 2. Se houver projeto, criar Pedido + Projeto + Financeiro
    if (form.projeto_titulo) {
      const valor = Number(form.projeto_valor) || 0;
      const codigoPed = `PED-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

      // Criar Pedido
      const { data: novoPedido } = await supabase.from("pedidos").insert({
        cliente_id: novoCliente.id,
        codigo: codigoPed,
        tipo: form.projeto_titulo,
        valor,
        status: "pendente",
        data: new Date().toISOString().split("T")[0]
      }).select().single();

      // Criar Projeto
      await supabase.from("projetos").insert({
        cliente_id: novoCliente.id,
        titulo: form.projeto_titulo,
        valor: valor,
        status: "briefing",
        progresso: 10,
        descricao: `Projeto inicial: ${form.projeto_titulo}`
      });

      // Lançar no Financeiro
      if (form.gerar_fatura && valor > 0) {
        await supabase.from("financeiro").insert({
          cliente_id: novoCliente.id,
          tipo: "receita",
          categoria: "Projetos",
          valor,
          descricao: `Contrato Inicial: ${form.projeto_titulo} (${codigoPed})`,
          data: new Date().toISOString().split("T")[0],
          status: "pendente",
          metodo: "asaas"
        });
      }
    }

    if (criarConta && senhaCliente.length >= 6) {
      const link = `${window.location.origin}/cliente`;
      setContaCriada({ email: form.email, senha: senhaCliente, link });
    }

    toast({ title: "Onboarding Concluído!", description: "Cliente, Projeto e Financeiro configurados." });
    sendPushToAdmins("🚀 Novo Contrato Elite", `${form.nome} - ${form.projeto_titulo}`, "/admin/clientes");
    setShowNew(false);
    setForm({ 
      nome: "", email: "", telefone: "", documento: "", endereco: "", cidade: "", estado: "", status: "ativo", site_url: "",
      projeto_titulo: "", projeto_valor: "", projeto_tipo: "site", gerar_fatura: true
    });
    setSenhaCliente("");
    setCriarConta(true);
    setSaving(false);
    fetchClientes();
  };

  const handleAcessarPortal = (cliente: any) => {
    localStorage.setItem("clienteLogado", JSON.stringify(cliente));
    window.open("/cliente/dashboard", "_blank");
    toast({ title: "Modo Espelhamento", description: `Acessando portal como ${cliente.nome}` });
  };

  const handleDeleteCliente = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este cliente e todos os seus dados?")) return;
    const { error } = await supabase.from("clientes").delete().eq("id", id);
    if (error) { toast({ title: "Erro ao excluir", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Cliente excluído com sucesso!" });
    fetchClientes();
  };

  return (
    <motion.div className="space-y-6" initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.08 } } }}>
      <motion.div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4" variants={fadeUp}>
        <div />
        <Dialog open={showNew} onOpenChange={setShowNew}>
          <DialogTrigger asChild>
            <Button className="gradient-primary border-0 text-white rounded-lg"><Plus className="w-4 h-4 mr-2" /> Novo Cliente</Button>
          </DialogTrigger>
          <DialogContent className="glass-card border-[0.5px] text-white max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle className="text-white">Novo Cliente</DialogTitle></DialogHeader>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
              {[
                { key: "nome", label: "Nome completo" }, { key: "email", label: "E-mail" },
                { key: "telefone", label: "Telefone" }, { key: "documento", label: "CPF/CNPJ" },
                { key: "cidade", label: "Cidade" }, { key: "estado", label: "Estado" },
              ].map((f) => (
                <div key={f.key} className="space-y-1">
                  <Label className="text-[10px] text-[hsl(var(--muted-foreground))] uppercase">{f.label}</Label>
                  <Input className="glass-input border-[rgba(255,255,255,0.1)] text-white text-sm h-9"
                    value={(form as any)[f.key]} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} />
                </div>
              ))}
              {[
                { key: "endereco", label: "Endereço" },
                { key: "site_url", label: "URL do Site" },
              ].map((f) => (
                <div key={f.key} className="space-y-1 sm:col-span-2">
                  <Label className="text-[10px] text-[hsl(var(--muted-foreground))] uppercase">{f.label}</Label>
                  <Input className="glass-input border-[rgba(255,255,255,0.1)] text-white text-sm h-9"
                    value={(form as any)[f.key]} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} />
                </div>
              ))}
            </div>

            <div className="mt-4 p-3 rounded-xl bg-primary/5 border border-primary/20 space-y-3">
               <div className="flex items-center gap-2">
                 <Sparkles className="w-4 h-4 text-primary" />
                 <h3 className="text-[10px] font-black text-white uppercase tracking-wider">🚀 Primeiro Projeto</h3>
               </div>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                 <div className="space-y-1">
                   <Label className="text-[10px] text-white/50 uppercase font-bold">Título do Projeto</Label>
                   <Input className="glass-input h-9 text-xs" placeholder="Ex: Landing Page" value={form.projeto_titulo} onChange={e => setForm({...form, projeto_titulo: e.target.value})} />
                 </div>
                 <div className="space-y-1">
                   <Label className="text-[10px] text-white/50 uppercase font-bold">Valor (R$)</Label>
                   <Input type="number" className="glass-input h-9 text-xs" placeholder="0.00" value={form.projeto_valor} onChange={e => setForm({...form, projeto_valor: e.target.value})} />
                 </div>
               </div>
               <div className="flex items-center gap-2">
                 <input type="checkbox" id="gf" checked={form.gerar_fatura} onChange={e => setForm({...form, gerar_fatura: e.target.checked})} className="rounded accent-primary" />
                 <Label htmlFor="gf" className="text-[10px] text-white/60 cursor-pointer">Lançar fatura pendente</Label>
               </div>
            </div>

            <div className="mt-3 p-3 rounded-xl bg-white/5 border border-white/10 space-y-2">
              <div className="flex items-center gap-2">
                <input type="checkbox" id="cc" checked={criarConta} onChange={e => setCriarConta(e.target.checked)} className="rounded" />
                <Label htmlFor="cc" className="text-xs text-white cursor-pointer">Liberar acesso ao Painel</Label>
              </div>
              {criarConta && (
                <div className="space-y-1">
                  <Label className="text-[10px] text-[hsl(var(--muted-foreground))]">Senha (mín. 6 caracteres)</Label>
                  <Input type="text" className="glass-input border-[rgba(255,255,255,0.1)] text-white text-sm h-9"
                    value={senhaCliente} onChange={e => setSenhaCliente(e.target.value)} placeholder="Senha do cliente" />
                </div>
              )}
            </div>

            <Button className="gradient-primary border-0 text-white w-full mt-3 rounded-lg" onClick={handleSave} disabled={saving}>
              {saving ? "Salvando..." : "Salvar Cliente"}
            </Button>
          </DialogContent>
        </Dialog>
      </motion.div>

      <motion.div variants={fadeUp}>
        <Card className="glass-card border-[0.5px]">
          <CardHeader>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--muted-foreground))]" />
                <Input placeholder="Buscar por nome ou e-mail..." className="pl-9 glass-input border-0 text-white text-sm" value={busca} onChange={(e) => setBusca(e.target.value)} />
              </div>
              <div className="flex gap-2">
                {["todos", "ativo", "inativo"].map((s) => (
                  <Button key={s} size="sm"
                    className={filtroStatus === s ? "gradient-primary border-0 text-white" : "glass-input border-0 text-[hsl(var(--muted-foreground))] hover:text-white"}
                    onClick={() => setFiltroStatus(s)}>
                    {s === "todos" ? "Todos" : s === "ativo" ? "Ativos" : "Inativos"}
                  </Button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table className="min-w-[650px]">
              <TableHeader>
                <TableRow className="border-[rgba(255,255,255,0.06)]">
                  {["Cliente", "E-mail", "Telefone", "Cidade", "Status", "Ações"].map(h => (
                    <TableHead key={h} className="text-[11px] text-[hsl(var(--muted-foreground))]">{h}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtrados.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center text-sm text-[hsl(var(--muted-foreground))] py-8">Nenhum cliente encontrado</TableCell></TableRow>
                ) : filtrados.map((c) => {
                  const avatar = c.avatar || c.nome?.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();
                  return (
                    <TableRow key={c.id} className="border-[rgba(255,255,255,0.04)] cursor-pointer hover:bg-[rgba(255,255,255,0.02)]">
                      <TableCell onClick={() => setSelectedCliente(c.id)}>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center shrink-0">
                            <span className="text-white text-[10px] font-bold">{avatar}</span>
                          </div>
                          <span className="text-sm font-medium text-white">{c.nome}</span>
                        </div>
                      </TableCell>
                      <TableCell onClick={() => setSelectedCliente(c.id)} className="text-sm text-[hsl(var(--muted-foreground))]">{c.email}</TableCell>
                      <TableCell onClick={() => setSelectedCliente(c.id)} className="text-sm text-[hsl(var(--muted-foreground))]">{c.telefone}</TableCell>
                      <TableCell onClick={() => setSelectedCliente(c.id)} className="text-sm text-[hsl(var(--muted-foreground))]">{c.cidade}, {c.estado}</TableCell>
                      <TableCell onClick={() => setSelectedCliente(c.id)}><StatusBadge status={c.status} /></TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                           <Button 
                             variant="ghost" 
                             size="sm" 
                             className="text-primary hover:bg-primary/10 text-xs gap-1"
                             onClick={(e) => { e.stopPropagation(); handleAcessarPortal(c); }}
                           >
                             <Zap className="w-3 h-3" /> Portal
                           </Button>
                           <Button 
                             variant="ghost" 
                             size="sm" 
                             className="text-white/50 hover:text-white text-xs"
                             onClick={(e) => { e.stopPropagation(); setSelectedCliente(c.id); }}
                           >
                             Ver
                           </Button>
                           <Button 
                             variant="ghost" 
                             size="sm" 
                             className="text-red-400/50 hover:text-red-400 h-8 w-8 p-0"
                             onClick={(e) => { e.stopPropagation(); handleDeleteCliente(c.id); }}
                           >
                              <Trash2 className="w-3.5 h-3.5" />
                           </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>

      {/* Dialog Conta Criada */}
      <Dialog open={!!contaCriada} onOpenChange={() => setContaCriada(null)}>
        <DialogContent className="glass-card border-[0.5px] text-white max-w-md">
          <DialogHeader><DialogTitle className="text-white flex items-center gap-2"><UserPlus className="w-5 h-5" /> Conta criada com sucesso!</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <p className="text-xs text-[hsl(var(--muted-foreground))]">Compartilhe os dados abaixo com o cliente para que ele acesse o portal:</p>
            <div className="p-4 rounded-xl bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.06)] space-y-3">
              <div>
                <p className="text-[10px] text-[hsl(var(--muted-foreground))]">Link do Portal</p>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-white font-mono flex-1">{contaCriada?.link}</p>
                  <Button size="sm" variant="ghost" className="text-white/50 h-7" onClick={() => { navigator.clipboard.writeText(contaCriada?.link || ""); toast({ title: "Link copiado!" }); }}>
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              <div>
                <p className="text-[10px] text-[hsl(var(--muted-foreground))]">E-mail</p>
                <p className="text-sm text-white">{contaCriada?.email}</p>
              </div>
              <div>
                <p className="text-[10px] text-[hsl(var(--muted-foreground))]">Senha</p>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-white font-mono">{contaCriada?.senha}</p>
                  <Button size="sm" variant="ghost" className="text-white/50 h-7" onClick={() => { navigator.clipboard.writeText(contaCriada?.senha || ""); toast({ title: "Senha copiada!" }); }}>
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
            <Button className="gradient-primary border-0 text-white w-full" onClick={() => setContaCriada(null)}>Entendi</Button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}



