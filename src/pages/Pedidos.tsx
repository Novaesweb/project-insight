import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
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
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ descricao: "", tipo: "produto" as const, valor: "", cliente_id: "", projeto_id: "" });

  const load = async () => {
    const [p, c, pr] = await Promise.all([
      supabase.from("pedidos").select("*, clientes(nome_empresa)").order("created_at", { ascending: false }),
      supabase.from("clientes").select("id, nome_empresa").eq("ativo", true),
      supabase.from("projetos").select("id, nome"),
    ]);
    setPedidos(p.data || []);
    setClientes(c.data || []);
    setProjetos(pr.data || []);
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.from("pedidos").insert({
      descricao: form.descricao || "Novo pedido",
      tipo: form.tipo as any,
      valor: Number(form.valor) || 0,
      cliente_id: form.cliente_id,
      projeto_id: form.projeto_id || null,
    });
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Pedido criado!" });
      setForm({ descricao: "", tipo: "produto", valor: "", cliente_id: "", projeto_id: "" });
      setDialogOpen(false);
      load();
    }
    setSaving(false);
  };

  const filtrados = filtro === "todos" ? pedidos : pedidos.filter(p => p.status === filtro);

  return (
    <motion.div className="space-y-6" initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.08 } } }}>
      <motion.div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4" variants={fadeUp}>
        <div className="flex gap-2 flex-wrap">
          {[{ key: "todos", label: "Todos" }, { key: "pendente", label: "Pendente" }, { key: "em_revisao", label: "Em revisão" }, { key: "entregue", label: "Entregue" }, { key: "cancelado", label: "Cancelado" }].map((s) => (
            <Button key={s.key} size="sm"
              className={filtro === s.key ? "gradient-primary border-0 text-white" : "glass-input border-0 text-[hsl(var(--muted-foreground))] hover:text-white"}
              onClick={() => setFiltro(s.key)}>{s.label}</Button>
          ))}
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-primary border-0 text-white rounded-lg" size="sm"><Plus className="w-4 h-4 mr-2" /> Novo Pedido</Button>
          </DialogTrigger>
          <DialogContent className="glass-card border-[0.5px] text-[hsl(var(--foreground))]">
            <DialogHeader>
              <DialogTitle>Novo Pedido</DialogTitle>
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
                {saving ? "Salvando..." : "Criar Pedido"}
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
                  {["Nº Pedido", "Cliente", "Tipo", "Valor", "Data", "Status"].map((h) => (
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
                    <TableCell className="text-sm text-white">R$ {Number(p.valor).toLocaleString("pt-BR")}</TableCell>
                    <TableCell className="text-sm text-[hsl(var(--muted-foreground))]">{p.data ? new Date(p.data).toLocaleDateString("pt-BR") : "—"}</TableCell>
                    <TableCell><StatusBadge status={p.status} /></TableCell>
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
