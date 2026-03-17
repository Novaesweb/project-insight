import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isSameMonth, isSameDay, addMonths, subMonths, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Plus, Clock, Video, ExternalLink, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { tipoReuniaoLabels, statusReuniaoLabels, statusReuniaoColors, type StatusReuniao, type TipoReuniao } from "@/lib/mock-data";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };
const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

interface Reuniao { id: string; cliente_id: string; tipo: string; data: string; hora_inicio: string; hora_fim: string; link?: string; observacoes?: string; status: string; clientes?: { nome_empresa: string }; }

export default function Agenda() {
  const { toast } = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [view, setView] = useState<"mensal" | "semanal">("mensal");
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");
  const [showModal, setShowModal] = useState(false);
  const [reunioes, setReunioes] = useState<Reuniao[]>([]);
  const [clientes, setClientes] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ cliente_id: "", tipo: "alinhamento", data: "", hora_inicio: "", hora_fim: "", link: "", observacoes: "" });

  const load = async () => {
    const [r, c] = await Promise.all([
      supabase.from("reunioes").select("*, clientes(nome)").order("data", { ascending: true }),
      supabase.from("clientes").select("id, nome").eq("status", "ativo"),
    ]);
    setReunioes((r.data || []) as Reuniao[]);
    setClientes(c.data || []);
  };

  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    if (!form.cliente_id || !form.data || !form.hora_inicio || !form.hora_fim) {
      toast({ title: "Preencha os campos obrigatórios", variant: "destructive" });
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("reunioes").insert({
      cliente_id: form.cliente_id,
      tipo: form.tipo,
      data: form.data,
      hora_inicio: form.hora_inicio,
      hora_fim: form.hora_fim,
      link: form.link || null,
      observacoes: form.observacoes || null,
    });
    setSaving(false);
    if (error) { toast({ title: "Erro", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Reunião agendada!" });
    setShowModal(false);
    setForm({ cliente_id: "", tipo: "alinhamento", data: "", hora_inicio: "", hora_fim: "", link: "", observacoes: "" });
    load();
  };

  const filtered = useMemo(() => reunioes.filter(r => filtroStatus === "todos" || r.status === filtroStatus), [reunioes, filtroStatus]);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calStart = startOfWeek(monthStart);
  const calEnd = endOfWeek(monthEnd);
  const calDays = eachDayOfInterval({ start: calStart, end: calEnd });

  const getReunioesDia = (date: Date) => filtered.filter(r => isSameDay(parseISO(r.data), date));
  const reunioesHoje = getReunioesDia(selectedDate || new Date());

  return (
    <motion.div variants={fadeUp} initial="hidden" animate="show" className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Tabs value={view} onValueChange={(v) => setView(v as any)}>
          <TabsList className="glass-card border-[0.5px] border-[hsl(var(--border))]">
            <TabsTrigger value="mensal">Mensal</TabsTrigger>
            <TabsTrigger value="semanal">Semanal</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setCurrentDate(subMonths(currentDate, 1))}><ChevronLeft className="w-4 h-4" /></Button>
          <span className="text-sm font-medium text-white min-w-[140px] text-center capitalize">{format(currentDate, "MMMM yyyy", { locale: ptBR })}</span>
          <Button variant="ghost" size="icon" onClick={() => setCurrentDate(addMonths(currentDate, 1))}><ChevronRight className="w-4 h-4" /></Button>
        </div>
        <Select value={filtroStatus} onValueChange={setFiltroStatus}>
          <SelectTrigger className="w-[160px] glass-input border-0"><Filter className="w-4 h-4 mr-2" /><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="agendada">Agendada</SelectItem>
            <SelectItem value="confirmada">Confirmada</SelectItem>
            <SelectItem value="realizada">Realizada</SelectItem>
            <SelectItem value="cancelada">Cancelada</SelectItem>
          </SelectContent>
        </Select>
        <Button className="ml-auto gradient-primary border-0 text-white" onClick={() => setShowModal(true)}><Plus className="w-4 h-4 mr-1.5" /> Nova reunião</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        <Card className="glass-card border-[0.5px] border-[hsl(var(--border))]">
          <CardContent className="p-4">
            <div className="grid grid-cols-7 gap-px mb-2">
              {weekDays.map(d => (<div key={d} className="text-center text-xs font-medium text-[hsl(var(--muted-foreground))] py-2">{d}</div>))}
            </div>
            <div className="grid grid-cols-7 gap-px">
              {calDays.map((day) => {
                const dayReunioes = getReunioesDia(day);
                const isToday = isSameDay(day, new Date());
                const isSelected = selectedDate && isSameDay(day, selectedDate);
                return (
                  <button key={day.toISOString()} onClick={() => setSelectedDate(day)}
                    className={`min-h-[80px] p-1.5 rounded-lg text-left transition-all ${isSelected ? "ring-2 ring-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.1)]" : isToday ? "bg-[hsl(var(--accent))]" : "hover:bg-[hsl(var(--accent)/0.5)]"} ${!isSameMonth(day, currentDate) ? "opacity-30" : ""}`}>
                    <span className={`text-xs font-medium ${isToday ? "text-[hsl(var(--primary))]" : "text-white"}`}>{format(day, "d")}</span>
                    <div className="mt-1 space-y-0.5">
                      {dayReunioes.slice(0, 3).map(r => (
                        <div key={r.id} className="text-[10px] px-1.5 py-0.5 rounded truncate text-white font-medium" style={{ backgroundColor: statusReuniaoColors[r.status] + "cc" }}>
                          {r.hora_inicio} {r.clientes?.nome?.split(" ")[0]}
                        </div>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-[0.5px] border-[hsl(var(--border))]">
          <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-white">{selectedDate ? format(selectedDate, "dd 'de' MMMM", { locale: ptBR }) : "Hoje"}</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {reunioesHoje.length === 0 ? (
              <p className="text-xs text-[hsl(var(--muted-foreground))] text-center py-4">Nenhuma reunião</p>
            ) : reunioesHoje.map(r => (
              <div key={r.id} className="p-3 rounded-xl bg-[hsl(var(--accent)/0.3)] border border-[hsl(var(--border))] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">{r.clientes?.nome}</span>
                  <Badge variant="outline" className="text-[10px] border-0 px-2" style={{ backgroundColor: statusReuniaoColors[r.status] + "33", color: statusReuniaoColors[r.status] }}>
                    {statusReuniaoLabels[r.status]}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-[hsl(var(--muted-foreground))]"><Clock className="w-3 h-3" />{r.hora_inicio} — {r.hora_fim}</div>
                <div className="text-[11px] text-[hsl(var(--muted-foreground))]">{tipoReuniaoLabels[r.tipo as TipoReuniao] || r.tipo}</div>
                {r.link && <a href={r.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[11px] text-blue-400 hover:underline"><Video className="w-3 h-3" /> Entrar <ExternalLink className="w-3 h-3" /></a>}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="glass-card border-[hsl(var(--border))] text-white max-w-lg">
          <DialogHeader><DialogTitle>Nova Reunião</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-[hsl(var(--muted-foreground))]">Cliente *</Label>
              <Select value={form.cliente_id} onValueChange={v => setForm({ ...form, cliente_id: v })}>
                <SelectTrigger className="glass-input border-0"><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>{clientes.map(c => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-[hsl(var(--muted-foreground))]">Tipo</Label>
              <Select value={form.tipo} onValueChange={v => setForm({ ...form, tipo: v })}>
                <SelectTrigger className="glass-input border-0"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="alinhamento">Alinhamento</SelectItem>
                  <SelectItem value="apresentacao">Apresentação</SelectItem>
                  <SelectItem value="kickoff">Kickoff</SelectItem>
                  <SelectItem value="entrega">Entrega</SelectItem>
                  <SelectItem value="suporte">Suporte</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-[hsl(var(--muted-foreground))]">Data *</Label>
                <Input type="date" className="glass-input border-0 text-white" value={form.data} onChange={e => setForm({ ...form, data: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-[hsl(var(--muted-foreground))]">Início *</Label>
                <Input type="time" className="glass-input border-0 text-white" value={form.hora_inicio} onChange={e => setForm({ ...form, hora_inicio: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-[hsl(var(--muted-foreground))]">Fim *</Label>
                <Input type="time" className="glass-input border-0 text-white" value={form.hora_fim} onChange={e => setForm({ ...form, hora_fim: e.target.value })} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-[hsl(var(--muted-foreground))]">Link da reunião</Label>
              <Input className="glass-input border-0 text-white" placeholder="https://meet.google.com/..." value={form.link} onChange={e => setForm({ ...form, link: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-[hsl(var(--muted-foreground))]">Observações</Label>
              <Textarea className="glass-input border-0 text-white min-h-[60px]" value={form.observacoes} onChange={e => setForm({ ...form, observacoes: e.target.value })} />
            </div>
            <Button className="w-full gradient-primary border-0 text-white" onClick={handleSave} disabled={saving}>
              {saving ? "Salvando..." : "Agendar Reunião"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
