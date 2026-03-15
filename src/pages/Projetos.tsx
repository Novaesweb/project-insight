import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Plus, List, LayoutGrid, Calendar, User, ArrowLeft, Send, Clock } from "lucide-react";
import StatusBadge from "@/components/StatusBadge";
import { supabase } from "@/integrations/supabase/client";
import { sendPushToClient } from "@/lib/push-notifications";
import { useToast } from "@/hooks/use-toast";

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

const kanbanColumns = [
  { key: "em_aberto", label: "Em aberto", color: "border-amber-500/50" },
  { key: "em_andamento", label: "Em andamento", color: "border-blue-500/50" },
  { key: "em_revisao", label: "Em revisão", color: "border-violet-500/50" },
  { key: "concluido", label: "Concluído", color: "border-emerald-500/50" },
  { key: "cancelado", label: "Cancelado", color: "border-red-500/50" },
];

const statusLabels: Record<string, string> = {
  em_aberto: "Em aberto", em_andamento: "Em andamento", em_revisao: "Em revisão", concluido: "Concluído", cancelado: "Cancelado",
};

function ProjetoDetalhes({ projetoId, onBack }: { projetoId: string; onBack: () => void }) {
  const { toast } = useToast();
  const [projeto, setProjeto] = useState<any>(null);
  const [atualizacoes, setAtualizacoes] = useState<any[]>([]);
  const [novaAtualizacao, setNovaAtualizacao] = useState("");
  const [visivelCliente, setVisivelCliente] = useState(true);
  const [sending, setSending] = useState(false);

  const loadProjeto = async () => {
    const { data } = await supabase.from("projetos").select("*, clientes(nome)").eq("id", projetoId).single();
    setProjeto(data);
  };

  const loadAtualizacoes = async () => {
    const { data } = await supabase.from("projeto_atualizacoes").select("*").eq("projeto_id", projetoId).order("created_at", { ascending: false });
    setAtualizacoes(data || []);
  };

  useEffect(() => { loadProjeto(); loadAtualizacoes(); }, [projetoId]);

  const updateStatus = async (newStatus: string) => {
    const { error } = await supabase.from("projetos").update({ status: newStatus }).eq("id", projetoId);
    if (error) { toast({ title: "Erro", description: error.message, variant: "destructive" }); return; }
    setProjeto((prev: any) => ({ ...prev, status: newStatus }));
    toast({ title: "Status atualizado!" });
  };

  const handleProgressChange = (value: number[]) => {
    setProjeto((prev: any) => ({ ...prev, progresso: value[0] }));
  };

  const saveProgresso = async (value: number[]) => {
    const progresso = value[0];
    const { error } = await supabase.from("projetos").update({ progresso }).eq("id", projetoId);
    if (error) toast({ title: "Erro", description: error.message, variant: "destructive" });
    else toast({ title: `Progresso atualizado para ${progresso}%` });
  };

  const enviarAtualizacao = async () => {
    if (!novaAtualizacao.trim()) return;
    setSending(true);
    const { error } = await supabase.from("projeto_atualizacoes").insert({
      projeto_id: projetoId,
      descricao: novaAtualizacao.trim(),
      visivel_cliente: visivelCliente,
    });
    setSending(false);
    if (error) { toast({ title: "Erro", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Atualização registrada!" });
    setNovaAtualizacao("");
    loadAtualizacoes();
  };

  if (!projeto) return <p className="text-white">Carregando...</p>;

  return (
    <motion.div className="space-y-6" initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.08 } } }}>
      <motion.div variants={fadeUp}>
        <Button variant="ghost" className="text-[hsl(var(--muted-foreground))] hover:text-white mb-3" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
        </Button>

        <Card className="glass-card border-[0.5px]">
          <CardContent className="p-5">
            <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white">{projeto.titulo}</h2>
                <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">{projeto.clientes?.nome || "Sem cliente"}</p>
                {projeto.descricao && <p className="text-xs text-[hsl(var(--muted-foreground))] mt-2">{projeto.descricao}</p>}
              </div>
              <div className="flex items-center gap-3">
                <Select value={projeto.status} onValueChange={updateStatus}>
                  <SelectTrigger className="w-[180px] glass-input border-0 text-white text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {kanbanColumns.map(col => (
                      <SelectItem key={col.key} value={col.key}>{col.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
              <div>
                <p className="text-[10px] text-[hsl(var(--muted-foreground))] uppercase tracking-wider">Responsável</p>
                <p className="text-sm text-white font-medium mt-0.5">{projeto.responsavel || "—"}</p>
              </div>
              <div>
                <p className="text-[10px] text-[hsl(var(--muted-foreground))] uppercase tracking-wider">Valor</p>
                <p className="text-sm text-white font-medium mt-0.5">R$ {Number(projeto.valor).toLocaleString("pt-BR")}</p>
              </div>
              <div>
                <p className="text-[10px] text-[hsl(var(--muted-foreground))] uppercase tracking-wider">Início</p>
                <p className="text-sm text-white font-medium mt-0.5">{projeto.inicio ? new Date(projeto.inicio).toLocaleDateString("pt-BR") : "—"}</p>
              </div>
              <div>
                <p className="text-[10px] text-[hsl(var(--muted-foreground))] uppercase tracking-wider">Prazo</p>
                <p className="text-sm text-white font-medium mt-0.5">{projeto.prazo ? new Date(projeto.prazo).toLocaleDateString("pt-BR") : "—"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Progresso */}
      <motion.div variants={fadeUp}>
        <Card className="glass-card border-[0.5px]">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-white">Progresso</p>
              <span className="text-lg font-bold gradient-text">{projeto.progresso}%</span>
            </div>
            <Slider
              value={[projeto.progresso]}
              onValueChange={handleProgressChange}
              onValueCommit={saveProgresso}
              max={100}
              step={5}
              className="w-full"
            />
            <div className="flex justify-between mt-1 text-[10px] text-[hsl(var(--muted-foreground))]">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Nova atualização */}
      <motion.div variants={fadeUp}>
        <Card className="glass-card border-[0.5px]">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-white">Registrar Atualização</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Textarea
              value={novaAtualizacao}
              onChange={e => setNovaAtualizacao(e.target.value)}
              placeholder="Descreva o andamento do projeto..."
              className="glass-input border-[rgba(255,255,255,0.1)] text-white text-sm min-h-[80px]"
            />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Switch checked={visivelCliente} onCheckedChange={setVisivelCliente} />
                <span className="text-xs text-[hsl(var(--muted-foreground))]">Visível para o cliente</span>
              </div>
              <Button
                className="gradient-primary border-0 text-white text-xs"
                onClick={enviarAtualizacao}
                disabled={sending || !novaAtualizacao.trim()}
              >
                <Send className="w-3 h-3 mr-1.5" /> {sending ? "Enviando..." : "Registrar"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Histórico */}
      <motion.div variants={fadeUp}>
        <Card className="glass-card border-[0.5px]">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-white">Histórico de Atualizações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {atualizacoes.length === 0 ? (
              <p className="text-sm text-[hsl(var(--muted-foreground))] text-center py-6">Nenhuma atualização registrada</p>
            ) : atualizacoes.map((a) => (
              <div key={a.id} className="p-3 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)]">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2 text-[10px] text-[hsl(var(--muted-foreground))]">
                    <Clock className="w-3 h-3" />
                    {new Date(a.created_at).toLocaleString("pt-BR")}
                  </div>
                  {a.visivel_cliente ? (
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400">Visível ao cliente</span>
                  ) : (
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-[rgba(255,255,255,0.06)] text-[hsl(var(--muted-foreground))]">Interno</span>
                  )}
                </div>
                <p className="text-sm text-white">{a.descricao}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

export default function Projetos() {
  const { toast } = useToast();
  const [view, setView] = useState<"lista" | "kanban">("kanban");
  const [projetos, setProjetos] = useState<any[]>([]);
  const [clientes, setClientes] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedProjeto, setSelectedProjeto] = useState<string | null>(null);
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

  if (selectedProjeto) {
    return <ProjetoDetalhes projetoId={selectedProjeto} onBack={() => { setSelectedProjeto(null); load(); }} />;
  }

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
            <DialogHeader><DialogTitle>Novo Projeto</DialogTitle></DialogHeader>
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
                  <Card key={p.id} className="glass-card border-[0.5px] hover:border-[rgba(255,255,255,0.15)] transition-all cursor-pointer" onClick={() => setSelectedProjeto(p.id)}>
                    <CardContent className="p-4 space-y-3">
                      <p className="font-semibold text-sm text-white">{p.titulo}</p>
                      <p className="text-[11px] text-[hsl(var(--muted-foreground))] line-clamp-2">{p.descricao}</p>
                      {/* Progress bar */}
                      <div>
                        <div className="flex justify-between text-[10px] text-[hsl(var(--muted-foreground))] mb-1">
                          <span>Progresso</span>
                          <span className="gradient-text font-semibold">{p.progresso}%</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-[rgba(255,255,255,0.06)]">
                          <div className="h-full rounded-full gradient-primary transition-all" style={{ width: `${p.progresso}%` }} />
                        </div>
                      </div>
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
                    {["Título", "Cliente", "Progresso", "Responsável", "Prazo", "Valor", "Status"].map((h) => (
                      <TableHead key={h} className="text-[11px] text-[hsl(var(--muted-foreground))]">{h}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projetos.length === 0 ? (
                    <TableRow><TableCell colSpan={7} className="text-center text-sm text-[hsl(var(--muted-foreground))] py-8">Nenhum projeto</TableCell></TableRow>
                  ) : projetos.map((p) => (
                    <TableRow key={p.id} className="border-[rgba(255,255,255,0.04)] cursor-pointer hover:bg-[rgba(255,255,255,0.02)]" onClick={() => setSelectedProjeto(p.id)}>
                      <TableCell className="text-sm font-medium text-white">{p.titulo}</TableCell>
                      <TableCell className="text-sm text-[hsl(var(--muted-foreground))]">{p.clientes?.nome || "—"}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 rounded-full bg-[rgba(255,255,255,0.06)]">
                            <div className="h-full rounded-full gradient-primary" style={{ width: `${p.progresso}%` }} />
                          </div>
                          <span className="text-[11px] text-[hsl(var(--muted-foreground))]">{p.progresso}%</span>
                        </div>
                      </TableCell>
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
