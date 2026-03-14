import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isSameMonth, isSameDay, addMonths, subMonths, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarDays, ChevronLeft, ChevronRight, Plus, Clock, Video, ExternalLink, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { reunioes as reunioesData, clientes, tipoReuniaoLabels, statusReuniaoLabels, statusReuniaoColors, type Reuniao, type StatusReuniao, type TipoReuniao } from "@/lib/mock-data";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };
const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export default function Agenda() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [view, setView] = useState<"mensal" | "semanal">("mensal");
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");
  const [showModal, setShowModal] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [reunioesState] = useState<Reuniao[]>(reunioesData);

  const filtered = useMemo(() => {
    return reunioesState.filter(r => filtroStatus === "todos" || r.status === filtroStatus);
  }, [reunioesState, filtroStatus]);

  // Calendar grid
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calStart = startOfWeek(monthStart);
  const calEnd = endOfWeek(monthEnd);
  const calDays = eachDayOfInterval({ start: calStart, end: calEnd });

  // Week view
  const weekStart = startOfWeek(selectedDate || new Date());
  const weekEnd = endOfWeek(selectedDate || new Date());
  const weekDaysArr = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const getReunioesDia = (date: Date) =>
    filtered.filter(r => isSameDay(parseISO(r.data), date));

  const reunioesHoje = getReunioesDia(selectedDate || new Date());

  const todayCount = reunioesState.filter(r => r.data === format(new Date(), "yyyy-MM-dd")).length;
  const aguardandoCount = reunioesState.filter(r => r.status === "aguardando").length;
  const confirmadasCount = reunioesState.filter(r => r.status === "confirmada").length;
  const semanaCount = reunioesState.filter(r => {
    const d = parseISO(r.data);
    return d >= weekStart && d <= weekEnd;
  }).length;

  const hours = Array.from({ length: 10 }, (_, i) => i + 8); // 8h to 17h

  return (
    <motion.div variants={fadeUp} initial="hidden" animate="show" className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Reuniões hoje", value: todayCount, color: "text-blue-400" },
          { label: "Aguardando confirmação", value: aguardandoCount, color: "text-yellow-400" },
          { label: "Confirmadas", value: confirmadasCount, color: "text-green-400" },
          { label: "Esta semana", value: semanaCount, color: "text-purple-400" },
        ].map((kpi) => (
          <Card key={kpi.label} className="glass-card border-[0.5px] border-[hsl(var(--border))]">
            <CardContent className="p-4">
              <p className="text-xs text-[hsl(var(--muted-foreground))]">{kpi.label}</p>
              <p className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <Tabs value={view} onValueChange={(v) => setView(v as "mensal" | "semanal")}>
          <TabsList className="glass-card border-[0.5px] border-[hsl(var(--border))]">
            <TabsTrigger value="mensal">Mensal</TabsTrigger>
            <TabsTrigger value="semanal">Semanal</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setCurrentDate(subMonths(currentDate, 1))}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm font-medium text-white min-w-[140px] text-center capitalize">
            {format(currentDate, "MMMM yyyy", { locale: ptBR })}
          </span>
          <Button variant="ghost" size="icon" onClick={() => setCurrentDate(addMonths(currentDate, 1))}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        <Select value={filtroStatus} onValueChange={setFiltroStatus}>
          <SelectTrigger className="w-[160px] glass-input border-0">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="agendada">Agendada</SelectItem>
            <SelectItem value="confirmada">Confirmada</SelectItem>
            <SelectItem value="realizada">Realizada</SelectItem>
            <SelectItem value="cancelada">Cancelada</SelectItem>
            <SelectItem value="aguardando">Aguardando</SelectItem>
          </SelectContent>
        </Select>

        <div className="ml-auto flex gap-2">
          <Button variant="outline" className="glass-input border-0" onClick={() => setShowConfig(true)}>
            Disponibilidade
          </Button>
          <Button className="gradient-primary border-0 text-white" onClick={() => setShowModal(true)}>
            <Plus className="w-4 h-4 mr-1.5" /> Nova reunião
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        {/* Calendar */}
        <Card className="glass-card border-[0.5px] border-[hsl(var(--border))]">
          <CardContent className="p-4">
            {view === "mensal" ? (
              <>
                <div className="grid grid-cols-7 gap-px mb-2">
                  {weekDays.map(d => (
                    <div key={d} className="text-center text-xs font-medium text-[hsl(var(--muted-foreground))] py-2">{d}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-px">
                  {calDays.map((day) => {
                    const dayReunioes = getReunioesDia(day);
                    const isToday = isSameDay(day, new Date());
                    const isSelected = selectedDate && isSameDay(day, selectedDate);
                    const isCurrentMonth = isSameMonth(day, currentDate);
                    return (
                      <button
                        key={day.toISOString()}
                        onClick={() => setSelectedDate(day)}
                        className={`min-h-[80px] p-1.5 rounded-lg text-left transition-all ${
                          isSelected ? "ring-2 ring-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.1)]" :
                          isToday ? "bg-[hsl(var(--accent))]" : "hover:bg-[hsl(var(--accent)/0.5)]"
                        } ${!isCurrentMonth ? "opacity-30" : ""}`}
                      >
                        <span className={`text-xs font-medium ${isToday ? "text-[hsl(var(--primary))]" : "text-white"}`}>
                          {format(day, "d")}
                        </span>
                        <div className="mt-1 space-y-0.5">
                          {dayReunioes.slice(0, 3).map(r => (
                            <div
                              key={r.id}
                              className="text-[10px] px-1.5 py-0.5 rounded truncate text-white font-medium"
                              style={{ backgroundColor: statusReuniaoColors[r.status] + "cc" }}
                            >
                              {r.horaInicio} {r.cliente.split(" ")[0]}
                            </div>
                          ))}
                          {dayReunioes.length > 3 && (
                            <span className="text-[10px] text-[hsl(var(--muted-foreground))]">+{dayReunioes.length - 3}</span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </>
            ) : (
              /* Weekly view */
              <div className="overflow-x-auto">
                <div className="grid grid-cols-[60px_repeat(7,1fr)] min-w-[700px]">
                  <div />
                  {weekDaysArr.map(day => (
                    <div key={day.toISOString()} className={`text-center py-2 text-xs font-medium border-b border-[hsl(var(--border))] ${isSameDay(day, new Date()) ? "text-[hsl(var(--primary))]" : "text-[hsl(var(--muted-foreground))]"}`}>
                      {format(day, "EEE d", { locale: ptBR })}
                    </div>
                  ))}
                  {hours.map(hour => (
                    <div key={hour} className="contents">
                      <div className="text-[10px] text-[hsl(var(--muted-foreground))] pr-2 text-right py-3 border-r border-[hsl(var(--border))]">
                        {String(hour).padStart(2, "0")}:00
                      </div>
                      {weekDaysArr.map(day => {
                        const dayReunioes = getReunioesDia(day).filter(r => parseInt(r.horaInicio) === hour);
                        return (
                          <div key={day.toISOString() + hour} className="border-b border-r border-[hsl(var(--border)/0.3)] p-0.5 min-h-[48px]">
                            {dayReunioes.map(r => (
                              <div
                                key={r.id}
                                className="text-[10px] px-1.5 py-1 rounded text-white font-medium truncate"
                                style={{ backgroundColor: statusReuniaoColors[r.status] + "cc" }}
                              >
                                {r.horaInicio} - {r.cliente.split(" ")[0]}
                              </div>
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sidebar: Today's meetings */}
        <div className="space-y-4">
          <Card className="glass-card border-[0.5px] border-[hsl(var(--border))]">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-white">
                {selectedDate ? format(selectedDate, "dd 'de' MMMM", { locale: ptBR }) : "Hoje"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {reunioesHoje.length === 0 ? (
                <p className="text-xs text-[hsl(var(--muted-foreground))] text-center py-4">Nenhuma reunião</p>
              ) : (
                reunioesHoje.map(r => (
                  <div key={r.id} className="p-3 rounded-xl bg-[hsl(var(--accent)/0.3)] border border-[hsl(var(--border))] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{r.cliente}</span>
                      <Badge
                        variant="outline"
                        className="text-[10px] border-0 px-2"
                        style={{ backgroundColor: statusReuniaoColors[r.status] + "33", color: statusReuniaoColors[r.status] }}
                      >
                        {statusReuniaoLabels[r.status]}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-[hsl(var(--muted-foreground))]">
                      <Clock className="w-3 h-3" />
                      {r.horaInicio} — {r.horaFim}
                    </div>
                    <div className="text-[11px] text-[hsl(var(--muted-foreground))]">
                      {tipoReuniaoLabels[r.tipo]}
                    </div>
                    {r.link && (
                      <a href={r.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[11px] text-blue-400 hover:underline">
                        <Video className="w-3 h-3" /> Entrar na reunião <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    {r.observacoes && (
                      <p className="text-[10px] text-[hsl(var(--muted-foreground))] italic">{r.observacoes}</p>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* New Meeting Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="glass-card border-[hsl(var(--border))] text-white max-w-lg">
          <DialogHeader>
            <DialogTitle>Nova Reunião</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-xs">Cliente</Label>
              <Select>
                <SelectTrigger className="glass-input border-0"><SelectValue placeholder="Selecione o cliente" /></SelectTrigger>
                <SelectContent>
                  {clientes.filter(c => c.status === "ativo").map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Tipo de reunião</Label>
              <Select>
                <SelectTrigger className="glass-input border-0"><SelectValue placeholder="Selecione o tipo" /></SelectTrigger>
                <SelectContent>
                  {(Object.entries(tipoReuniaoLabels) as [TipoReuniao, string][]).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="text-xs">Data</Label>
                <Input type="date" className="glass-input border-0" />
              </div>
              <div>
                <Label className="text-xs">Início</Label>
                <Input type="time" className="glass-input border-0" />
              </div>
              <div>
                <Label className="text-xs">Fim</Label>
                <Input type="time" className="glass-input border-0" />
              </div>
            </div>
            <div>
              <Label className="text-xs">Link da reunião (Google Meet / Zoom)</Label>
              <Input placeholder="https://meet.google.com/..." className="glass-input border-0" />
            </div>
            <div>
              <Label className="text-xs">Observações</Label>
              <Textarea placeholder="Anotações sobre a reunião..." className="glass-input border-0 min-h-[80px]" />
            </div>
            <Button className="w-full gradient-primary border-0 text-white" onClick={() => setShowModal(false)}>
              Agendar reunião
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Config Modal */}
      <Dialog open={showConfig} onOpenChange={setShowConfig}>
        <DialogContent className="glass-card border-[hsl(var(--border))] text-white max-w-lg">
          <DialogHeader>
            <DialogTitle>Configuração de Disponibilidade</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-xs">Duração padrão</Label>
              <Select defaultValue="60">
                <SelectTrigger className="glass-input border-0"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 minutos</SelectItem>
                  <SelectItem value="60">1 hora</SelectItem>
                  <SelectItem value="90">1h 30min</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Intervalo entre reuniões</Label>
              <Select defaultValue="60">
                <SelectTrigger className="glass-input border-0"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 min</SelectItem>
                  <SelectItem value="30">30 min</SelectItem>
                  <SelectItem value="60">1 hora</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Horários por dia da semana</Label>
              {["Segunda", "Terça", "Quarta", "Quinta", "Sexta"].map(dia => (
                <div key={dia} className="flex items-center gap-3">
                  <span className="text-xs text-[hsl(var(--muted-foreground))] w-16">{dia}</span>
                  <Input type="time" defaultValue="09:00" className="glass-input border-0 w-24 text-xs" />
                  <span className="text-xs text-[hsl(var(--muted-foreground))]">às</span>
                  <Input type="time" defaultValue="18:00" className="glass-input border-0 w-24 text-xs" />
                </div>
              ))}
            </div>
            <div>
              <Label className="text-xs">Dias bloqueados (feriados, férias)</Label>
              <Input type="date" className="glass-input border-0" />
              <p className="text-[10px] text-[hsl(var(--muted-foreground))] mt-1">Adicione datas que não devem ter agendamento</p>
            </div>
            <Button className="w-full gradient-primary border-0 text-white" onClick={() => setShowConfig(false)}>
              Salvar configurações
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
