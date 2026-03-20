import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2, ArrowRight } from "lucide-react";
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

      <motion.div variants={fadeUp}>
        <Card className="glass-card border-[0.5px]">
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow className="border-[rgba(255,255,255,0.06)]">
                  {["Nº Pedido", "Cliente", "Tipo", "Valor", "Data", "Ações"].map((h) => (
                    <TableHead key={h} className="text-[11px] text-[hsl(var(--muted-foreground))]">{h}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtrados.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center text-sm text-[hsl(var(--muted-foreground))] py-8">Nenhum pedido</TableCell></TableRow>
                ) : filtrados.map((p) => (
                  <TableRow key={p.id} className="border-[rgba(255,255,255,0.04)]">
                    <TableCell className="text-sm font-mono font-medium gradient-text">{p.codigo}</TableCell>
                    <TableCell className="text-sm text-white">{p.clientes?.nome || "—"}</TableCell>
                    <TableCell className="text-sm text-[hsl(var(--muted-foreground))]">{p.tipo}</TableCell>
                    <TableCell className="text-sm text-[hsl(var(--muted-foreground))]">{p.data ? new Date(p.data).toLocaleDateString("pt-BR") : new Date(p.created_at).toLocaleDateString("pt-BR")}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {p.projeto_id ? (
                          <Button variant="ghost" size="sm" className="text-emerald-400 hover:text-emerald-300 h-8 gap-1.5 text-[10px]" onClick={() => window.location.href = `/admin/projetos`}>
                            <ArrowRight className="w-3 h-3" /> Ver Projeto
                          </Button>
                        ) : (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-8 text-[10px] border-primary/20 text-primary hover:bg-primary/10 gap-1.5" 
                            disabled={saving}
                            onClick={() => iniciarProjeto(p)}
                          >
                            <Plus className="w-3 h-3" /> Iniciar Projeto
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-white/50 hover:text-white" onClick={() => openEdit(p)}>
                          <Pencil className="w-3 h-3" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500/50 hover:text-red-500" onClick={() => handleDelete(p.id)}>
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
