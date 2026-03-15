import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, List, LayoutGrid, Calendar, User } from "lucide-react";
import StatusBadge from "@/components/StatusBadge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

const kanbanColumns = [
  { key: "em_aberto", label: "Em aberto", color: "border-amber-500/50" },
  { key: "em_andamento", label: "Em andamento", color: "border-blue-500/50" },
  { key: "em_revisao", label: "Em revisão", color: "border-violet-500/50" },
  { key: "concluido", label: "Concluído", color: "border-emerald-500/50" },
  { key: "cancelado", label: "Cancelado", color: "border-red-500/50" },
];

export default function Projetos() {
  const { toast } = useToast();
  const [view, setView] = useState<"lista" | "kanban">("kanban");
  const [projetos, setProjetos] = useState<any[]>([]);
  const [clientes, setClientes] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ titulo: "", descricao: "", cliente_id: "", responsavel: "", valor: "", prazo: "", inicio: "" });

  const load = async () => {
    const [p, c] = await Promise.all([
      supabase.from("projetos").select("*, clientes(nome)").order("created_at", { ascending: false }),
      supabase.from("clientes").select("id, nome").eq("status", "ativo"),
    ]);
    setProjetos(p.data || []);
    setClientes(c.data || []);
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.from("projetos").insert({
      titulo: form.titulo,
      descricao: form.descricao || null,
      cliente_id: form.cliente_id || null,
      responsavel: form.responsavel || null,
      valor: Number(form.valor) || 0,
      prazo: form.prazo || null,
      inicio: form.inicio || null,
    });
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Projeto criado!" });
      setForm({ titulo: "", descricao: "", cliente_id: "", responsavel: "", valor: "", prazo: "", inicio: "" });
      setDialogOpen(false);
      load();
    }
    setSaving(false);
  };

  return (
    <motion.div className="space-y-6" initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.08 } } }}>
      <motion.div className="flex items-center justify-between gap-4" variants={fadeUp}>
        <div className="flex gap-1 p-1 rounded-lg glass-card border-[0.5px]">
          <Button variant="ghost" size="sm" className={view === "lista" ? "gradient-primary text-white border-0" : "text-[hsl(var(--muted-foreground))]"} onClick={() => setView("lista")}><List className="w-4 h-4" /></Button>
          <Button variant="ghost" size="sm" className={view === "kanban" ? "gradient-primary text-white border-0" : "text-[hsl(var(--muted-foreground))]"} onClick={() => setView("kanban")}><LayoutGrid className="w-4 h-4" /></Button>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-primary border-0 text-white rounded-lg"><Plus className="w-4 h-4 mr-2" /> Novo Projeto</Button>
          </DialogTrigger>
          <DialogContent className="glass-card border-[0.5px] text-[hsl(var(--foreground))]">
            <DialogHeader>
              <DialogTitle>Novo Projeto</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label className="text-xs text-[hsl(var(--muted-foreground))]">Título *</Label>
                <Input value={form.titulo} onChange={e => setForm({...form, titulo: e.target.value})} required className="glass-input border-[0.5px] mt-1" />
              </div>
              <div>
                <Label className="text-xs text-[hsl(var(--muted-foreground))]">Descrição</Label>
                <Textarea value={form.descricao} onChange={e => setForm({...form, descricao: e.target.value})} className="glass-input border-[0.5px] mt-1" rows={3} />
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
                  <Label className="text-xs text-[hsl(var(--muted-foreground))]">Responsável</Label>
                  <Input value={form.responsavel} onChange={e => setForm({...form, responsavel: e.target.value})} className="glass-input border-[0.5px] mt-1" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-xs text-[hsl(var(--muted-foreground))]">Valor (R$)</Label>
                  <Input type="number" value={form.valor} onChange={e => setForm({...form, valor: e.target.value})} className="glass-input border-[0.5px] mt-1" />
                </div>
                <div>
                  <Label className="text-xs text-[hsl(var(--muted-foreground))]">Início</Label>
                  <Input type="date" value={form.inicio} onChange={e => setForm({...form, inicio: e.target.value})} className="glass-input border-[0.5px] mt-1" />
                </div>
                <div>
                  <Label className="text-xs text-[hsl(var(--muted-foreground))]">Prazo</Label>
                  <Input type="date" value={form.prazo} onChange={e => setForm({...form, prazo: e.target.value})} className="glass-input border-[0.5px] mt-1" />
                </div>
              </div>
              <Button type="submit" disabled={saving} className="w-full gradient-primary border-0 text-white">
                {saving ? "Salvando..." : "Criar Projeto"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </motion.div>

      {view === "kanban" ? (
        <motion.div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4" variants={fadeUp}>
          {kanbanColumns.map((col) => {
            const items = projetos.filter(p => p.status === col.key);
            return (
              <div key={col.key} className="space-y-3">
                <div className={`flex items-center gap-2 px-1 border-l-2 ${col.color} pl-3`}>
                  <span className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">{col.label}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full glass-card text-[hsl(var(--muted-foreground))]">{items.length}</span>
                </div>
                {items.map((p) => (
                  <Card key={p.id} className="glass-card border-[0.5px] hover:border-[rgba(255,255,255,0.15)] transition-all cursor-pointer">
                    <CardContent className="p-4 space-y-3">
                      <p className="font-semibold text-sm text-white">{p.titulo}</p>
                      <p className="text-[11px] text-[hsl(var(--muted-foreground))]">{p.descricao}</p>
                      <div className="flex items-center gap-2 text-[11px] text-[hsl(var(--muted-foreground))]">
                        <User className="w-3 h-3" /> {p.clientes?.nome || "—"}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-[11px] text-[hsl(var(--muted-foreground))]">
                          <Calendar className="w-3 h-3" /> {p.prazo ? new Date(p.prazo).toLocaleDateString("pt-BR") : "—"}
                        </div>
                        <span className="text-xs font-semibold gradient-text">R$ {(Number(p.valor) / 1000).toFixed(0)}k</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {items.length === 0 && (
                  <div className="border border-dashed border-[rgba(255,255,255,0.08)] rounded-xl p-8 text-center text-[11px] text-[hsl(var(--muted-foreground))]">Nenhum projeto</div>
                )}
              </div>
            );
          })}
        </motion.div>
      ) : (
        <motion.div variants={fadeUp}>
          <Card className="glass-card border-[0.5px]">
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow className="border-[rgba(255,255,255,0.06)]">
                    {["Título", "Cliente", "Responsável", "Prazo", "Valor", "Status"].map((h) => (
                      <TableHead key={h} className="text-[11px] text-[hsl(var(--muted-foreground))]">{h}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projetos.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="text-center text-sm text-[hsl(var(--muted-foreground))] py-8">Nenhum projeto</TableCell></TableRow>
                  ) : projetos.map((p) => (
                    <TableRow key={p.id} className="border-[rgba(255,255,255,0.04)]">
                      <TableCell className="text-sm font-medium text-white">{p.titulo}</TableCell>
                      <TableCell className="text-sm text-[hsl(var(--muted-foreground))]">{p.clientes?.nome || "—"}</TableCell>
                      <TableCell className="text-sm text-[hsl(var(--muted-foreground))]">{p.responsavel}</TableCell>
                      <TableCell className="text-sm text-[hsl(var(--muted-foreground))]">{p.prazo ? new Date(p.prazo).toLocaleDateString("pt-BR") : "—"}</TableCell>
                      <TableCell className="text-sm text-white">R$ {Number(p.valor).toLocaleString("pt-BR")}</TableCell>
                      <TableCell><StatusBadge status={p.status} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}
