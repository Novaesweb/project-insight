import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2, ArrowRight, DollarSign, FileText, Layout, Copy, Zap, Package } from "lucide-react";
import StatusBadge from "@/components/StatusBadge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

export default function Pedidos() {
  const { toast } = useToast();
  const [filtro, setFiltro] = useState("todos");
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [clientes, setClientes] = useState<any[]>([]);
  const [projetos, setProjetos] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ id: "", codigo: "", tipo: "", valor: "", cliente_id: "", projeto_id: "" });

  const load = async () => {
    const [p, c, pr] = await Promise.all([
      supabase.from("pedidos").select("*, clientes(nome)").order("created_at", { ascending: false }),
      supabase.from("clientes").select("id, nome").eq("status", "ativo"),
      supabase.from("projetos").select("id, titulo"),
    ]);
    setPedidos(p.data || []);
    setClientes(c.data || []);
    setProjetos(pr.data || []);
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const codigo = form.codigo || `PED-${String(pedidos.length + 1).padStart(3, "0")}`;
    const { error } = form.id 
      ? await supabase.from("pedidos").update({
          codigo,
          tipo: form.tipo,
          valor: Number(form.valor) || 0,
          cliente_id: form.cliente_id || null,
          projeto_id: form.projeto_id || null,
        }).eq("id", form.id)
      : await supabase.from("pedidos").insert({
          codigo,
          tipo: form.tipo,
          valor: Number(form.valor) || 0,
          cliente_id: form.cliente_id || null,
          projeto_id: form.projeto_id || null,
        });

    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      toast({ title: form.id ? "Pedido atualizado!" : "Pedido criado!" });
      setForm({ id: "", codigo: "", tipo: "", valor: "", cliente_id: "", projeto_id: "" });
      setDialogOpen(false);
      setEditingItem(null);
      load();
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este pedido?")) return;
    const { error } = await supabase.from("pedidos").delete().eq("id", id);
    if (error) toast({ title: "Erro", description: error.message, variant: "destructive" });
    else { toast({ title: "Pedido excluído" }); load(); }
  };

  const openEdit = (pedido: any) => {
    setForm({
      id: pedido.id,
      codigo: pedido.codigo,
      tipo: pedido.tipo,
      valor: pedido.valor,
      cliente_id: pedido.cliente_id,
      projeto_id: pedido.projeto_id
    });
    setEditingItem(pedido);
    setDialogOpen(true);
  };
 
  const iniciarProjeto = async (pedido: any) => {
    if (pedido.projeto_id) return;
    
    setSaving(true);
    // 1. Criar o projeto
    const { data: novoProjeto, error: errorProj } = await supabase.from("projetos").insert({
      titulo: `Projeto: ${pedido.tipo.toUpperCase()} - ${pedido.clientes?.nome}`,
      descricao: `Projeto gerado a partir do pedido ${pedido.codigo}`,
      cliente_id: pedido.cliente_id,
      valor: pedido.valor,
      status: "briefing",
      progresso: 20
    }).select().single();

    if (errorProj) {
      toast({ title: "Erro ao criar projeto", description: errorProj.message, variant: "destructive" });
      setSaving(false);
      return;
    }

    // 2. Vincular o projeto ao pedido
    const { error: errorPed } = await supabase.from("pedidos").update({
      projeto_id: novoProjeto.id
    }).eq("id", pedido.id);

    if (errorPed) {
      toast({ title: "Erro ao vincular projeto", description: errorPed.message, variant: "destructive" });
    } else {
      toast({ title: "Projeto iniciado com sucesso!" });
      load();
    }
    setSaving(false);
  };

  const filtrados = filtro === "todos" ? pedidos : pedidos.filter(p => p.status === filtro);

  return (
    <motion.div className="space-y-6" initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.08 } } }}>
      <motion.div className="flex flex-col sm:flex-row items-start sm:items-center justify-end gap-4" variants={fadeUp}>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) { setForm({ id: "", codigo: "", tipo: "", valor: "", cliente_id: "", projeto_id: "" }); setEditingItem(null); } }}>
          <DialogTrigger asChild>
            <Button className="gradient-primary border-0 text-white rounded-lg" size="sm"><Plus className="w-4 h-4 mr-2" /> Novo Pedido</Button>
          </DialogTrigger>
          <DialogContent className="glass-card border-[0.5px] text-[hsl(var(--foreground))]">
            <DialogHeader>
              <DialogTitle>{editingItem ? "Editar Pedido" : "Novo Pedido"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-[hsl(var(--muted-foreground))]">Código</Label>
                  <Input value={form.codigo} onChange={e => setForm({...form, codigo: e.target.value})} placeholder={`PED-${String(pedidos.length + 1).padStart(3, "0")}`} className="glass-input border-[0.5px] mt-1" />
                </div>
                <div>
                  <Label className="text-xs text-[hsl(var(--muted-foreground))]">Tipo *</Label>
                  <Select value={form.tipo} onValueChange={v => setForm({...form, tipo: v})}>
                    <SelectTrigger className="glass-input border-[0.5px] mt-1"><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="site">Site</SelectItem>
                      <SelectItem value="sistema">Sistema</SelectItem>
                      <SelectItem value="landing_page">Landing Page</SelectItem>
                      <SelectItem value="ecommerce">E-commerce</SelectItem>
                      <SelectItem value="manutencao">Manutenção</SelectItem>
                      <SelectItem value="outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-[hsl(var(--muted-foreground))]">Cliente</Label>
                  <Select value={form.cliente_id} onValueChange={v => setForm({...form, cliente_id: v})}>
                    <SelectTrigger className="glass-input border-[0.5px] mt-1"><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>{clientes.map(c => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-[hsl(var(--muted-foreground))]">Valor (R$)</Label>
                  <Input type="number" value={form.valor} onChange={e => setForm({...form, valor: e.target.value})} className="glass-input border-[0.5px] mt-1" />
                </div>
              </div>
              <div>
                <Label className="text-xs text-[hsl(var(--muted-foreground))]">Projeto vinculado</Label>
                <Select value={form.projeto_id} onValueChange={v => setForm({...form, projeto_id: v})}>
                  <SelectTrigger className="glass-input border-[0.5px] mt-1"><SelectValue placeholder="Nenhum" /></SelectTrigger>
                  <SelectContent>{projetos.map(p => <SelectItem key={p.id} value={p.id}>{p.titulo}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <Button type="submit" disabled={saving || !form.tipo} className="w-full gradient-primary border-0 text-white">
                {saving ? "Salvando..." : editingItem ? "Salvar Alterações" : "Criar Pedido"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </motion.div>

      <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filtrados.length === 0 ? (
          <div className="col-span-full p-20 border border-dashed border-white/10 rounded-[3rem] text-center bg-white/[0.01]">
             <Package className="w-12 h-12 text-white/10 mx-auto mb-4" />
             <p className="text-sm text-white/40 font-medium italic">Nenhum faturamento encontrado nesta categoria.</p>
          </div>
        ) : filtrados.map((p) => (
          <Card key={p.id} className="glass-card border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all overflow-hidden group relative">
            <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none group-hover:scale-110 transition-transform">
              <DollarSign className="w-24 h-24 text-primary" />
            </div>
            
            <CardContent className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{p.codigo}</span>
                    <StatusBadge status={p.status} />
                  </div>
                  <h3 className="text-lg font-black text-white group-hover:text-primary transition-colors line-clamp-1">{p.tipo}</h3>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-white/40 shadow-inner">
                  <FileText className="w-5 h-5" />
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-end border-b border-white/5 pb-4">
                  <div>
                    <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-1">Cliente</p>
                    <p className="text-sm font-bold text-white/80">{p.clientes?.nome || "Excluido"}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-1">Vencimento</p>
                    <p className="text-sm font-bold text-white/80">{p.data ? new Date(p.data).toLocaleDateString("pt-BR") : "N/D"}</p>
                  </div>
                </div>

                <div className="pt-2">
                   <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-1">Total da Fatura</p>
                   <p className="text-3xl font-black text-white tracking-tighter">
                     <span className="text-sm font-medium text-primary mr-1">R$</span>
                     {(p.valor || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                   </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                 <Button 
                   variant="ghost" 
                   className="h-12 border border-white/5 hover:border-primary/20 hover:bg-primary/10 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-primary rounded-2xl transition-all"
                   onClick={() => {
                      const text = `💎 *FATURA novaesweb*\n\nNº: ${p.codigo}\nCliente: ${p.clientes?.nome}\nServiço: ${p.tipo}\nValor: R$ ${p.valor.toLocaleString("pt-BR")}\nStatus: ${p.status.toUpperCase()}\n\n_Acesse seu portal para mais detalhes._`;
                      navigator.clipboard.writeText(text);
                      toast({ title: "Pronto para WhatsApp!", description: "Dados copiados com sucesso." });
                   }}
                 >
                   <Copy className="w-3.5 h-3.5 mr-2" /> Copiar Dados
                 </Button>
                 
                 {p.projeto_id ? (
                   <Button 
                     className="h-12 gradient-primary text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-primary/20"
                     onClick={() => window.location.href = `/admin/projetos`}
                   >
                     <Layout className="w-3.5 h-3.5 mr-2" /> Ver Projeto
                   </Button>
                 ) : (
                   <Button 
                     variant="outline"
                     className="h-12 border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/10 text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all"
                     disabled={saving}
                     onClick={() => iniciarProjeto(p)}
                   >
                     <Zap className="w-3.5 h-3.5 mr-2" /> Criar Projeto
                   </Button>
                 )}
              </div>

              <div className="absolute bottom-4 right-8 opacity-0 group-hover:opacity-100 transition-opacity">
                 <div className="flex gap-2">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg text-white/20 hover:text-white" onClick={() => openEdit(p)}>
                      <Pencil className="w-3 h-3" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg text-rose-500/40 hover:text-rose-500" onClick={() => handleDelete(p.id)}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                 </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>
    </motion.div>
  );
}



