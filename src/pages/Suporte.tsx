import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, Send, ArrowLeft, CheckCircle2 } from "lucide-react";
import StatusBadge from "@/components/StatusBadge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { sendPushToClient } from "@/lib/push-notifications";
import { useRealtimeSubscription } from "@/hooks/useRealtimeSubscription";

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

export default function Suporte() {
  const { toast } = useToast();
  const [tickets, setTickets] = useState<any[]>([]);
  const [mensagens, setMensagens] = useState<any[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [texto, setTexto] = useState("");
  const [sending, setSending] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  const loadTickets = useCallback(async () => {
    const { data } = await supabase.from("tickets").select("*, clientes(nome)").order("created_at", { ascending: false });
    setTickets(data || []);
  }, []);

  const loadMessages = useCallback(async (ticketId: string) => {
    const { data } = await supabase.from("ticket_mensagens").select("*").eq("ticket_id", ticketId).order("created_at", { ascending: true });
    setMensagens(data || []);
  }, []);

  useEffect(() => { loadTickets(); }, [loadTickets]);

  const ticket = tickets.find(t => t.id === selectedTicket);

  const refreshSelectedMessages = useCallback(() => {
    if (!selectedTicket) return;
    loadMessages(selectedTicket);
  }, [selectedTicket, loadMessages]);

  useEffect(() => {
    if (selectedTicket) loadMessages(selectedTicket);
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

  const enviarMensagem = async () => {
    if (!texto.trim() || !selectedTicket) return;
    setSending(true);
    const { data, error } = await supabase.from("ticket_mensagens").insert({
      ticket_id: selectedTicket,
      remetente: "admin",
      nome: "Engenharia WebNovaX",
      texto: texto.trim(),
    }).select().single();
    setSending(false);
    if (error) { toast({ title: "Inconsistência Técnica", description: error.message, variant: "destructive" }); return; }
    if (data) setMensagens(prev => [...prev, data]);
    setTexto("");

    // Notify client via push + in-app notification
    const clienteId = ticket?.cliente_id;
    if (clienteId) {
      sendPushToClient(clienteId, "⚙️ Evolução Tecnológica", `Dossiê ${ticket.codigo}: ${texto.trim().slice(0, 60)}`, "/cliente/suporte");
      supabase.from("notifications").insert({
        title: "Evolução Tecnológica",
        body: `Dossiê ${ticket.codigo}: ${texto.trim().slice(0, 80)}`,
        user_id: clienteId,
        user_type: "cliente",
        url: "/cliente/suporte",
      }).then(() => {});
    }

    // Acionar o n8n informando que o Admin respondeu
    fetch("https://lucasalencar.app.n8n.cloud/webhook-test/7315698c-b037-4e83-82c2-1f3c193fea88", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        evento: "admin_respondeu_ticket",
        ticket_id: selectedTicket,
        codigo_ticket: ticket?.codigo,
        cliente_id: clienteId,
        mensagem_admin: texto.trim()
      })
    }).catch(err => console.error("Erro no webhook n8n admin:", err));

    // Auto update ticket status to em_atendimento if aberto
    if (ticket?.status === "aberto") {
      await supabase.from("tickets").update({ status: "em_atendimento" }).eq("id", selectedTicket);
      setTickets(prev => prev.map(t => t.id === selectedTicket ? { ...t, status: "em_atendimento" } : t));
    }
  };

  const changeStatus = async (newStatus: string) => {
    if (!selectedTicket) return;
    const { error } = await supabase.from("tickets").update({ status: newStatus }).eq("id", selectedTicket);
    if (error) { toast({ title: "Falha na Sincronização", description: error.message, variant: "destructive" }); return; }
    setTickets(prev => prev.map(t => t.id === selectedTicket ? { ...t, status: newStatus } : t));
    toast({ title: "Parâmetro de Evolução Atualizado!" });
  };

  const filtrados = tickets.filter(t => {
    return filtroStatus === "todos" || t.status === filtroStatus;
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
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-[hsl(var(--muted-foreground))] font-mono">{ticket.codigo}</p>
                  <CardTitle className="text-lg text-white mt-1">{ticket.titulo}</CardTitle>
                  <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">{ticket.clientes?.nome}</p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={ticket.prioridade} />
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
                        const clienteId = ticket?.cliente_id;
                        if (clienteId) {
                          sendPushToClient(clienteId, "✅ Ticket Resolvido", `Seu ticket ${ticket.codigo} foi marcado como resolvido.`, "/cliente/suporte");
                        }
                      }}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Finalizar Otimização
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {ticket.descricao && (
                <p className="text-sm text-[hsl(var(--muted-foreground))] mb-4 p-3 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)]">{ticket.descricao}</p>
              )}
              <div ref={chatRef} className="space-y-4 mb-6 max-h-[400px] overflow-y-auto pr-2">
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
                {mensagens.length === 0 && <p className="text-center text-sm text-[hsl(var(--muted-foreground))] py-8">Nenhuma mensagem ainda</p>}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Digite sua resposta..."
                  className="glass-input border-[rgba(255,255,255,0.1)] text-white text-sm flex-1"
                  value={texto}
                  onChange={e => setTexto(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && enviarMensagem()}
                />
                <Button
                  className="gradient-primary border-0 text-white rounded-lg"
                  onClick={enviarMensagem}
                  disabled={sending || !texto.trim()}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div className="space-y-6" initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.08 } } }}>
      <motion.div className="flex flex-col sm:flex-row gap-3 justify-between" variants={fadeUp}>
        <div className="flex gap-2 flex-wrap">
          <span className="text-xs text-[hsl(var(--muted-foreground))] self-center mr-1">Status:</span>
          {["todos", "aberto", "em_atendimento", "resolvido"].map((s) => (
            <Button key={s} size="sm"
              className={filtroStatus === s ? "gradient-primary border-0 text-white text-xs" : "glass-input border-0 text-[hsl(var(--muted-foreground))] hover:text-white text-xs"}
              onClick={() => setFiltroStatus(s)}>
              {s === "todos" ? "Todos" : s === "em_atendimento" ? "Em atend." : s.charAt(0).toUpperCase() + s.slice(1)}
            </Button>
          ))}
        </div>
      </motion.div>

      <motion.div variants={fadeUp}>
        <Card className="glass-card border-[0.5px]">
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow className="border-[rgba(255,255,255,0.06)]">
                  {["ID", "Título", "Cliente", "Prioridade", "Status", "Data"].map((h) => (
                    <TableHead key={h} className="text-[11px] text-[hsl(var(--muted-foreground))]">{h}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtrados.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center text-sm text-[hsl(var(--muted-foreground))] py-8">Nenhum ticket</TableCell></TableRow>
                ) : filtrados.map((t) => (
                  <TableRow key={t.id} className="border-[rgba(255,255,255,0.04)] cursor-pointer hover:bg-[rgba(255,255,255,0.03)]" onClick={() => setSelectedTicket(t.id)}>
                    <TableCell className="text-sm font-mono text-primary italic font-bold tracking-tighter">{t.codigo}</TableCell>
                    <TableCell className="text-sm text-white flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-primary" /> {t.titulo}
                    </TableCell>
                    <TableCell className="text-sm text-[hsl(var(--muted-foreground))]">{t.clientes?.nome || "—"}</TableCell>
                    <TableCell><StatusBadge status={t.prioridade} /></TableCell>
                    <TableCell><StatusBadge status={t.status} /></TableCell>
                    <TableCell className="text-sm text-[hsl(var(--muted-foreground))]">{new Date(t.created_at).toLocaleDateString("pt-BR")}</TableCell>
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


