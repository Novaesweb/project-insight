import { useState, useEffect, useRef, useCallback, useMemo, type ReactNode } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  MessageSquare,
  Send,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Clock3,
  Search,
  TimerReset,
  UserRound,
} from "lucide-react";
import StatusBadge from "@/components/StatusBadge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { sendPushToClient } from "@/lib/push-notifications";
import InternalNotes from "@/components/InternalNotes";
import { useRealtimeSubscription } from "@/hooks/useRealtimeSubscription";
import {
  SLA_PRESETS,
  getSlaLabel,
  isTicketOverdue,
  loadSupportTicketMeta,
  resolveTicketSla,
  updateSupportTicketMeta,
  type SupportTicketMetaEntry,
  type SupportTicketMetaMap,
} from "@/lib/support-ticket-meta";

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

interface AssigneeOption {
  id: string;
  nome: string;
  email: string;
}

export default function Suporte() {
  const { toast } = useToast();
  const [tickets, setTickets] = useState<any[]>([]);
  const [assignees, setAssignees] = useState<AssigneeOption[]>([]);
  const [ticketMeta, setTicketMeta] = useState<SupportTicketMetaMap>({});
  const [mensagens, setMensagens] = useState<any[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [filtroResponsavel, setFiltroResponsavel] = useState("todos");
  const [busca, setBusca] = useState("");
  const [texto, setTexto] = useState("");
  const [sending, setSending] = useState(false);
  const [metaSaving, setMetaSaving] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  const loadTickets = useCallback(async () => {
    const { data } = await supabase
      .from("tickets")
      .select("*, clientes(nome)")
      .order("created_at", { ascending: false });
    setTickets(data || []);
  }, []);

  const loadSupportContext = useCallback(async () => {
    try {
      const [usersResponse, meta] = await Promise.all([
        supabase.from("usuarios").select("id, nome, email").eq("status", "ativo").order("nome"),
        loadSupportTicketMeta(),
      ]);

      setAssignees((usersResponse.data || []) as AssigneeOption[]);
      setTicketMeta(meta);
    } catch (error) {
      console.error("Support context error:", error);
      toast({
        title: "Falha ao carregar suporte",
        description: "Não foi possível montar os dados de SLA e responsáveis agora.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const loadMessages = useCallback(async (ticketId: string) => {
    const { data } = await supabase
      .from("ticket_mensagens")
      .select("*")
      .eq("ticket_id", ticketId)
      .order("created_at", { ascending: true });
    setMensagens(data || []);
  }, []);

  useEffect(() => {
    void loadTickets();
    void loadSupportContext();
  }, [loadSupportContext, loadTickets]);

  const refreshSelectedMessages = useCallback(() => {
    if (!selectedTicket) return;
    void loadMessages(selectedTicket);
  }, [selectedTicket, loadMessages]);

  useEffect(() => {
    if (selectedTicket) void loadMessages(selectedTicket);
  }, [selectedTicket, loadMessages]);

  useRealtimeSubscription("tickets", loadTickets);
  useRealtimeSubscription("ticket_mensagens", refreshSelectedMessages);

  useEffect(() => {
    if (!selectedTicket) return;
    const interval = setInterval(refreshSelectedMessages, 5000);
    return () => clearInterval(interval);
  }, [selectedTicket, refreshSelectedMessages]);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [mensagens.length]);

  const ticketsEnriquecidos = useMemo(() => {
    return tickets.map((ticket) => {
      const meta = ticketMeta[ticket.id];
      const { slaHours, dueAt } = resolveTicketSla(ticket, meta);
      const overdue = isTicketOverdue(ticket.status, dueAt);
      return {
        ...ticket,
        supportMeta: meta,
        slaHours,
        dueAt,
        overdue,
      };
    });
  }, [ticketMeta, tickets]);

  const ticket = ticketsEnriquecidos.find((item) => item.id === selectedTicket);

  const summary = useMemo(() => {
    const pending = ticketsEnriquecidos.filter((item) => item.status !== "resolvido");
    return {
      pending: pending.length,
      overdue: pending.filter((item) => item.overdue).length,
      unassigned: pending.filter((item) => !item.supportMeta?.assignedToEmail).length,
    };
  }, [ticketsEnriquecidos]);

  const filtrados = useMemo(() => {
    const query = busca.trim().toLowerCase();

    return ticketsEnriquecidos.filter((ticketItem) => {
      const matchesStatus = filtroStatus === "todos" || ticketItem.status === filtroStatus;
      const matchesAssignee =
        filtroResponsavel === "todos" ||
        (filtroResponsavel === "sem_responsavel"
          ? !ticketItem.supportMeta?.assignedToEmail
          : ticketItem.supportMeta?.assignedToEmail === filtroResponsavel);

      const matchesSearch =
        !query ||
        [ticketItem.codigo, ticketItem.titulo, ticketItem.clientes?.nome || "", ticketItem.supportMeta?.assignedToName || ""]
          .join(" ")
          .toLowerCase()
          .includes(query);

      return matchesStatus && matchesAssignee && matchesSearch;
    });
  }, [busca, filtroResponsavel, filtroStatus, ticketsEnriquecidos]);

  const persistMeta = async (ticketId: string, patch: SupportTicketMetaEntry) => {
    setMetaSaving(true);

    try {
      const updated = await updateSupportTicketMeta(ticketId, patch);
      setTicketMeta(updated);
    } catch (error: any) {
      toast({
        title: "Falha ao salvar atendimento",
        description: error.message || "Não foi possível atualizar responsável e SLA agora.",
        variant: "destructive",
      });
    } finally {
      setMetaSaving(false);
    }
  };

  const handleAssignOwner = async (value: string) => {
    if (!ticket) return;
    if (value === "sem_responsavel") {
      await persistMeta(ticket.id, { assignedToUserId: null });
      return;
    }

    const assignee = assignees.find((item) => item.email === value);
    await persistMeta(ticket.id, {
      assignedToUserId: assignee?.id ?? null,
    });
  };

  const handleChangeSla = async (value: string) => {
    if (!ticket) return;
    const slaHours = Number(value);
    const dueAt = new Date();
    dueAt.setHours(dueAt.getHours() + slaHours);
    await persistMeta(ticket.id, { slaHours, dueAt: dueAt.toISOString() });
  };

  const enviarMensagem = async () => {
    if (!texto.trim() || !selectedTicket) return;
    setSending(true);
    const currentText = texto.trim();

    const { data, error } = await supabase
      .from("ticket_mensagens")
      .insert({
        ticket_id: selectedTicket,
        remetente: "admin",
        nome: "Engenharia novaesweb",
        texto: currentText,
      })
      .select()
      .single();

    setSending(false);
    if (error) {
      toast({ title: "Inconsistência técnica", description: error.message, variant: "destructive" });
      return;
    }
    if (data) setMensagens((prev) => [...prev, data]);
    setTexto("");

    const clienteId = ticket?.cliente_id;
    if (clienteId) {
      sendPushToClient(clienteId, "⚙️ Evolução Tecnológica", `Dossiê ${ticket.codigo}: ${currentText.slice(0, 60)}`, "/cliente/suporte");
      supabase.from("notifications").insert({
        title: "Evolução Tecnológica",
        body: `Dossiê ${ticket.codigo}: ${currentText.slice(0, 80)}`,
        user_id: clienteId,
        user_type: "cliente",
        url: "/cliente/suporte",
      }).then(() => {});
    }

    fetch("https://lucasalencar.app.n8n.cloud/webhook-test/7315698c-b037-4e83-82c2-1f3c193fea88", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        evento: "admin_respondeu_ticket",
        ticket_id: selectedTicket,
        codigo_ticket: ticket?.codigo,
        cliente_id: clienteId,
        mensagem_admin: currentText,
      }),
    }).catch((err) => console.error("Erro no webhook n8n admin:", err));

    if (ticket?.status === "aberto") {
      await supabase.from("tickets").update({ status: "em_atendimento" }).eq("id", selectedTicket);
      setTickets((prev) => prev.map((item) => (item.id === selectedTicket ? { ...item, status: "em_atendimento" } : item)));
    }
  };

  const changeStatus = async (newStatus: string) => {
    if (!selectedTicket) return;
    const { error } = await supabase.from("tickets").update({ status: newStatus }).eq("id", selectedTicket);
    if (error) {
      toast({ title: "Falha na sincronização", description: error.message, variant: "destructive" });
      return;
    }
    setTickets((prev) => prev.map((item) => (item.id === selectedTicket ? { ...item, status: newStatus } : item)));
    toast({ title: "Parâmetro de evolução atualizado!" });
  };

  const formatDueDate = (value: string) =>
    new Date(value).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });

  if (ticket) {
    return (
      <motion.div className="space-y-6" initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.08 } } }}>
        <motion.div variants={fadeUp}>
          <Button variant="ghost" className="text-[hsl(var(--muted-foreground))] hover:text-white mb-2" onClick={() => setSelectedTicket(null)}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
          </Button>
          <Card className="glass-card border-[0.5px]">
            <CardHeader>
              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div>
                  <p className="text-xs text-[hsl(var(--muted-foreground))] font-mono">{ticket.codigo}</p>
                  <CardTitle className="text-lg text-white mt-1">{ticket.titulo}</CardTitle>
                  <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">{ticket.clientes?.nome}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={ticket.prioridade} />
                  {ticket.overdue && (
                    <BadgeAlert label="SLA atrasado" tone="danger" />
                  )}
                  <Select value={ticket.status} onValueChange={changeStatus}>
                    <SelectTrigger className="w-[150px] h-8 glass-input border-0 text-xs text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="aberto">Aberto</SelectItem>
                      <SelectItem value="em_atendimento">Em atendimento</SelectItem>
                      <SelectItem value="resolvido">Resolvido</SelectItem>
                    </SelectContent>
                  </Select>
                  {ticket.status !== "resolvido" && (
                    <Button
                      size="sm"
                      className="h-8 text-xs bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-lg gap-1.5"
                      onClick={async () => {
                        await changeStatus("resolvido");
                        const clienteId = ticket.cliente_id;
                        if (clienteId) {
                          sendPushToClient(clienteId, "✅ Ticket Resolvido", `Seu ticket ${ticket.codigo} foi marcado como resolvido.`, "/cliente/suporte");
                        }
                      }}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Finalizar otimização
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              {ticket.descricao && (
                <p className="text-sm text-[hsl(var(--muted-foreground))] p-3 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)]">
                  {ticket.descricao}
                </p>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <SupportInfoCard
                  icon={<UserRound className="w-4 h-4 text-primary" />}
                  label="Responsável interno"
                  value={ticket.supportMeta?.assignedToName || "Sem responsável"}
                  helper={ticket.supportMeta?.assignedToEmail || "Distribua o atendimento para ganhar velocidade."}
                >
                  <Select
                    value={ticket.supportMeta?.assignedToEmail || "sem_responsavel"}
                    onValueChange={handleAssignOwner}
                    disabled={metaSaving}
                  >
                    <SelectTrigger className="h-9 glass-input border-0 text-xs text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sem_responsavel">Sem responsável</SelectItem>
                      {assignees.map((assignee) => (
                        <SelectItem key={assignee.email} value={assignee.email}>
                          {assignee.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </SupportInfoCard>

                <SupportInfoCard
                  icon={<TimerReset className="w-4 h-4 text-amber-400" />}
                  label="SLA"
                  value={getSlaLabel(ticket.slaHours)}
                  helper="Ao mudar o SLA, o prazo é recalculado a partir de agora."
                >
                  <Select value={String(ticket.slaHours)} onValueChange={handleChangeSla} disabled={metaSaving}>
                    <SelectTrigger className="h-9 glass-input border-0 text-xs text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SLA_PRESETS.map((hours) => (
                        <SelectItem key={hours} value={String(hours)}>
                          {getSlaLabel(hours)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </SupportInfoCard>

                <SupportInfoCard
                  icon={<Clock3 className="w-4 h-4 text-emerald-400" />}
                  label="Prazo final"
                  value={formatDueDate(ticket.dueAt)}
                  helper={ticket.overdue ? "Esse ticket já passou do prazo esperado." : "Dentro da janela de resposta prevista."}
                >
                  <div className="flex items-center gap-2 text-xs">
                    {ticket.overdue ? (
                      <BadgeAlert label="Atrasado" tone="danger" />
                    ) : (
                      <BadgeAlert label="No prazo" tone="success" />
                    )}
                  </div>
                </SupportInfoCard>
              </div>

              <div ref={chatRef} className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                {mensagens.map((msg: any) => {
                  const isAdmin = msg.remetente === "admin";
                  return (
                    <div key={msg.id} className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[75%] p-3 rounded-2xl text-sm ${isAdmin ? "rounded-br-md gradient-primary text-white" : "rounded-bl-md glass-card text-white"}`}>
                        <p className="text-[10px] font-semibold mb-1 opacity-60">{msg.nome}</p>
                        <p>{msg.texto}</p>
                        <p className="text-[9px] opacity-40 mt-1">{new Date(msg.created_at).toLocaleString("pt-BR")}</p>
                      </div>
                    </div>
                  );
                })}
                {mensagens.length === 0 && (
                  <p className="text-center text-sm text-[hsl(var(--muted-foreground))] py-8">Nenhuma mensagem ainda</p>
                )}
              </div>

              <div className="flex gap-2">
                <Input
                  placeholder="Digite sua resposta..."
                  className="glass-input border-[rgba(255,255,255,0.1)] text-white text-sm flex-1"
                  value={texto}
                  onChange={(e) => setTexto(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && enviarMensagem()}
                />
                <Button className="gradient-primary border-0 text-white rounded-lg" onClick={enviarMensagem} disabled={sending || !texto.trim()}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={fadeUp}>
          <Card className="glass-card border-[0.5px]">
            <CardContent className="p-5">
              <InternalNotes entityType="ticket" entityId={selectedTicket!} />
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div className="space-y-6" initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.08 } } }}>
      <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-3" variants={fadeUp}>
        <SummaryCard label="Tickets em aberto" value={summary.pending} helper="pedem leitura ou resposta do time." tone="primary" />
        <SummaryCard label="SLA atrasado" value={summary.overdue} helper="já passaram do prazo combinado." tone="danger" />
        <SummaryCard label="Sem responsável" value={summary.unassigned} helper="precisam de dono definido." tone="warning" />
      </motion.div>

      <motion.div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between" variants={fadeUp}>
        <div className="relative w-full xl:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <Input
            value={busca}
            onChange={(event) => setBusca(event.target.value)}
            placeholder="Buscar por ticket, cliente ou responsável"
            className="glass-input border-[rgba(255,255,255,0.1)] text-white text-sm h-10 pl-10"
          />
        </div>

        <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
          <div className="flex gap-2 flex-wrap">
            <span className="text-xs text-[hsl(var(--muted-foreground))] self-center mr-1">Status:</span>
            {["todos", "aberto", "em_atendimento", "resolvido"].map((status) => (
              <Button
                key={status}
                size="sm"
                className={
                  filtroStatus === status
                    ? "gradient-primary border-0 text-white text-xs"
                    : "glass-input border-0 text-[hsl(var(--muted-foreground))] hover:text-white text-xs"
                }
                onClick={() => setFiltroStatus(status)}
              >
                {status === "todos" ? "Todos" : status === "em_atendimento" ? "Em atend." : status.charAt(0).toUpperCase() + status.slice(1)}
              </Button>
            ))}
          </div>

          <Select value={filtroResponsavel} onValueChange={setFiltroResponsavel}>
            <SelectTrigger className="w-full xl:w-[230px] h-10 glass-input border-0 text-xs text-white">
              <SelectValue placeholder="Filtrar responsável" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os responsáveis</SelectItem>
              <SelectItem value="sem_responsavel">Sem responsável</SelectItem>
              {assignees.map((assignee) => (
                <SelectItem key={assignee.email} value={assignee.email}>
                  {assignee.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      <motion.div variants={fadeUp}>
        <Card className="glass-card border-[0.5px]">
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow className="border-[rgba(255,255,255,0.06)]">
                  {["ID", "Título", "Cliente", "Prioridade", "Responsável", "SLA", "Prazo", "Status"].map((header) => (
                    <TableHead key={header} className="text-[11px] text-[hsl(var(--muted-foreground))]">
                      {header}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtrados.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-sm text-[hsl(var(--muted-foreground))] py-8">
                      Nenhum ticket encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filtrados.map((ticketItem) => (
                    <TableRow
                      key={ticketItem.id}
                      className={`border-[rgba(255,255,255,0.04)] cursor-pointer hover:bg-[rgba(255,255,255,0.03)] ${ticketItem.overdue ? "bg-red-500/5" : ""}`}
                      onClick={() => setSelectedTicket(ticketItem.id)}
                    >
                      <TableCell className="text-sm font-mono text-primary italic font-bold tracking-tighter">
                        {ticketItem.codigo}
                      </TableCell>
                      <TableCell className="text-sm text-white">
                        <div className="flex items-center gap-2">
                          {ticketItem.overdue ? (
                            <AlertTriangle className="w-4 h-4 text-red-400" />
                          ) : (
                            <MessageSquare className="w-4 h-4 text-primary" />
                          )}
                          <span>{ticketItem.titulo}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-[hsl(var(--muted-foreground))]">{ticketItem.clientes?.nome || "—"}</TableCell>
                      <TableCell><StatusBadge status={ticketItem.prioridade} /></TableCell>
                      <TableCell className="text-sm text-[hsl(var(--muted-foreground))]">
                        {ticketItem.supportMeta?.assignedToName || "Sem responsável"}
                      </TableCell>
                      <TableCell className="text-sm text-white">{getSlaLabel(ticketItem.slaHours)}</TableCell>
                      <TableCell className="text-sm text-[hsl(var(--muted-foreground))]">
                        <div className="space-y-1">
                          <p>{formatDueDate(ticketItem.dueAt)}</p>
                          {ticketItem.overdue ? (
                            <span className="text-[10px] uppercase tracking-widest text-red-400">Atrasado</span>
                          ) : (
                            <span className="text-[10px] uppercase tracking-widest text-emerald-400">No prazo</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell><StatusBadge status={ticketItem.status} /></TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

function SummaryCard({
  label,
  value,
  helper,
  tone,
}: {
  label: string;
  value: number;
  helper: string;
  tone: "primary" | "danger" | "warning";
}) {
  const toneClass =
    tone === "danger"
      ? "text-red-400"
      : tone === "warning"
        ? "text-amber-400"
        : "text-primary";

  return (
    <Card className="glass-card border-[0.5px]">
      <CardContent className="p-5">
        <p className="text-[10px] uppercase tracking-[0.22em] font-black text-[hsl(var(--muted-foreground))]">{label}</p>
        <p className={`text-3xl font-black mt-2 ${toneClass}`}>{value}</p>
        <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">{helper}</p>
      </CardContent>
    </Card>
  );
}

function SupportInfoCard({
  icon,
  label,
  value,
  helper,
  children,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  helper: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-4 space-y-3">
      <div className="flex items-center gap-2">
        {icon}
        <p className="text-[10px] uppercase tracking-[0.2em] font-black text-[hsl(var(--muted-foreground))]">{label}</p>
      </div>
      <div>
        <p className="text-sm font-semibold text-white">{value}</p>
        <p className="text-[11px] text-[hsl(var(--muted-foreground))] mt-1 leading-relaxed">{helper}</p>
      </div>
      {children}
    </div>
  );
}

function BadgeAlert({ label, tone }: { label: string; tone: "danger" | "success" }) {
  const styles =
    tone === "danger"
      ? "border-red-500/20 bg-red-500/10 text-red-400"
      : "border-emerald-500/20 bg-emerald-500/10 text-emerald-400";

  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] uppercase tracking-widest border ${styles}`}>{label}</span>;
}
