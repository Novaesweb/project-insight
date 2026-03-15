import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, AlertTriangle, DollarSign, Plus } from "lucide-react";
import StatusBadge from "@/components/StatusBadge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

export default function Financeiro() {
  const { toast } = useToast();
  const [financeiro, setFinanceiro] = useState<any[]>([]);
  const [clientes, setClientes] = useState<any[]>([]);
  const [filtro, setFiltro] = useState("todos");
  const [showNew, setShowNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ descricao: "", tipo: "entrada", valor: "", vencimento: "", cliente_id: "", status: "pendente" });

  const load = async () => {
    const [f, c] = await Promise.all([
      supabase.from("financeiro").select("*, clientes(nome)").order("created_at", { ascending: false }),
      supabase.from("clientes").select("id, nome").eq("status", "ativo"),
    ]);
    setFinanceiro(f.data || []);
    setClientes(c.data || []);
  };

  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    if (!form.descricao || !form.valor) {
      toast({ title: "Preencha os campos obrigatórios", variant: "destructive" });
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("financeiro").insert({
      descricao: form.descricao,
      tipo: form.tipo,
      valor: Number(form.valor) || 0,
      vencimento: form.vencimento || null,
      cliente_id: form.cliente_id || null,
      status: form.status,
    });
    setSaving(false);
    if (error) { toast({ title: "Erro", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Lançamento criado!" });
    setShowNew(false);
    setForm({ descricao: "", tipo: "entrada", valor: "", vencimento: "", cliente_id: "", status: "pendente" });
    load();
  };

  const totalRecebido = financeiro.filter(f => f.tipo === "entrada" && f.status === "pago").reduce((s, f) => s + Number(f.valor), 0);
  const totalPendente = financeiro.filter(f => f.status === "pendente").reduce((s, f) => s + Number(f.valor), 0);
  const totalAtraso = financeiro.filter(f => f.status === "em_atraso").reduce((s, f) => s + Number(f.valor), 0);
  const filtrados = filtro === "todos" ? financeiro : financeiro.filter(f => f.status === filtro);

  return (
    <motion.div className="space-y-6" initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.08 } } }}>
      <motion.div className="grid grid-cols-1 sm:grid-cols-3 gap-4" variants={fadeUp}>
        <Card className="glass-card border-[0.5px]">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-emerald-500/10"><TrendingUp className="w-5 h-5 text-emerald-400" /></div>
            <div>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">Total Recebido</p>
              <p className="text-xl font-bold text-white">R$ {totalRecebido.toLocaleString("pt-BR")}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card border-[0.5px]">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-amber-500/10"><DollarSign className="w-5 h-5 text-amber-400" /></div>
            <div>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">Total Pendente</p>
              <p className="text-xl font-bold text-white">R$ {totalPendente.toLocaleString("pt-BR")}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card border-[0.5px]">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-red-500/10"><AlertTriangle className="w-5 h-5 text-red-400" /></div>
            <div>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">Em Atraso</p>
              <p className="text-xl font-bold text-white">R$ {totalAtraso.toLocaleString("pt-BR")}</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={fadeUp}>
        <Card className="glass-card border-[0.5px]">
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <CardTitle className="text-sm font-semibold text-white">Lançamentos</CardTitle>
              <div className="flex gap-2 flex-wrap">
                {["todos", "pago", "pendente", "em_atraso"].map((s) => (
                  <Button key={s} size="sm"
                    className={filtro === s ? "gradient-primary border-0 text-white text-xs" : "glass-input border-0 text-[hsl(var(--muted-foreground))] hover:text-white text-xs"}
                    onClick={() => setFiltro(s)}>
                    {s === "todos" ? "Todos" : s === "em_atraso" ? "Atrasado" : s.charAt(0).toUpperCase() + s.slice(1)}
                  </Button>
                ))}
                <Button className="gradient-primary border-0 text-white text-xs" size="sm" onClick={() => setShowNew(true)}>
                  <Plus className="w-3 h-3 mr-1" /> Novo lançamento
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-[rgba(255,255,255,0.06)]">
                  {["Descrição", "Tipo", "Valor", "Vencimento", "Cliente", "Status"].map((h) => (
                    <TableHead key={h} className="text-[11px] text-[hsl(var(--muted-foreground))]">{h}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtrados.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center text-sm text-[hsl(var(--muted-foreground))] py-8">Nenhum lançamento</TableCell></TableRow>
                ) : filtrados.map((f) => (
                  <TableRow key={f.id} className="border-[rgba(255,255,255,0.04)]">
                    <TableCell className="text-sm text-white">{f.descricao}</TableCell>
                    <TableCell>
                      <span className={`text-sm font-medium ${f.tipo === "entrada" ? "text-emerald-400" : "text-red-400"}`}>
                        {f.tipo === "entrada" ? "↑ Entrada" : "↓ Saída"}
                      </span>
                    </TableCell>
                    <TableCell className={`text-sm font-medium ${f.tipo === "entrada" ? "text-emerald-400" : "text-red-400"}`}>
                      {f.tipo === "saida" ? "- " : ""}R$ {Number(f.valor).toLocaleString("pt-BR")}
                    </TableCell>
                    <TableCell className="text-sm text-[hsl(var(--muted-foreground))]">{f.vencimento ? new Date(f.vencimento).toLocaleDateString("pt-BR") : "—"}</TableCell>
                    <TableCell className="text-sm text-[hsl(var(--muted-foreground))]">{f.clientes?.nome || "—"}</TableCell>
                    <TableCell><StatusBadge status={f.status} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>

      <Dialog open={showNew} onOpenChange={setShowNew}>
        <DialogContent className="glass-card border-[0.5px] text-white max-w-md">
          <DialogHeader><DialogTitle className="text-white">Novo Lançamento</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label className="text-xs text-[hsl(var(--muted-foreground))]">Descrição *</Label>
              <Input className="glass-input border-[rgba(255,255,255,0.1)] text-white text-sm h-9" value={form.descricao} onChange={e => setForm({ ...form, descricao: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-[hsl(var(--muted-foreground))]">Tipo</Label>
                <Select value={form.tipo} onValueChange={v => setForm({ ...form, tipo: v })}>
                  <SelectTrigger className="glass-input border-0 text-white"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entrada">Entrada</SelectItem>
                    <SelectItem value="saida">Saída</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-[hsl(var(--muted-foreground))]">Valor (R$) *</Label>
                <Input type="number" className="glass-input border-[rgba(255,255,255,0.1)] text-white text-sm h-9" value={form.valor} onChange={e => setForm({ ...form, valor: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-[hsl(var(--muted-foreground))]">Vencimento</Label>
                <Input type="date" className="glass-input border-[rgba(255,255,255,0.1)] text-white text-sm h-9" value={form.vencimento} onChange={e => setForm({ ...form, vencimento: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-[hsl(var(--muted-foreground))]">Status</Label>
                <Select value={form.status} onValueChange={v => setForm({ ...form, status: v })}>
                  <SelectTrigger className="glass-input border-0 text-white"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pendente">Pendente</SelectItem>
                    <SelectItem value="pago">Pago</SelectItem>
                    <SelectItem value="em_atraso">Em atraso</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-[hsl(var(--muted-foreground))]">Cliente</Label>
              <Select value={form.cliente_id} onValueChange={v => setForm({ ...form, cliente_id: v })}>
                <SelectTrigger className="glass-input border-0 text-white"><SelectValue placeholder="Selecione (opcional)" /></SelectTrigger>
                <SelectContent>
                  {clientes.map(c => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Button className="gradient-primary border-0 text-white w-full rounded-lg" onClick={handleSave} disabled={saving}>
              {saving ? "Salvando..." : "Salvar Lançamento"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
