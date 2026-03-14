import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageSquare, Send, ArrowLeft } from "lucide-react";
import { tickets } from "@/lib/mock-data";
import StatusBadge from "@/components/StatusBadge";

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

export default function Suporte() {
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [filtroPrioridade, setFiltroPrioridade] = useState("todos");

  const ticket = tickets.find(t => t.id === selectedTicket);

  const filtrados = tickets.filter(t => {
    const matchStatus = filtroStatus === "todos" || t.status === filtroStatus;
    const matchPrioridade = filtroPrioridade === "todos" || t.prioridade === filtroPrioridade;
    return matchStatus && matchPrioridade;
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
                  <p className="text-xs text-[hsl(var(--muted-foreground))] font-mono">{ticket.id}</p>
                  <CardTitle className="text-lg text-white mt-1">{ticket.titulo}</CardTitle>
                  <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">{ticket.cliente}</p>
                </div>
                <div className="flex gap-2">
                  <StatusBadge status={ticket.prioridade} />
                  <StatusBadge status={ticket.status} />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-[hsl(var(--muted-foreground))] mb-6">{ticket.descricao}</p>

              {/* Chat messages */}
              <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto">
                {ticket.mensagens.map((msg, i) => {
                  const isSupport = msg.autor.includes("Suporte");
                  return (
                    <div key={i} className={`flex ${isSupport ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[80%] p-3 rounded-xl text-sm ${isSupport ? "gradient-primary text-white" : "glass-card text-white"}`}>
                        <p className="text-[10px] font-semibold mb-1 opacity-70">{msg.autor} · {msg.data}</p>
                        <p>{msg.texto}</p>
                      </div>
                    </div>
                  );
                })}
                {ticket.mensagens.length === 0 && (
                  <p className="text-center text-sm text-[hsl(var(--muted-foreground))] py-8">Nenhuma mensagem ainda</p>
                )}
              </div>

              {/* Reply */}
              <div className="flex gap-2">
                <Input placeholder="Digite sua resposta..." className="glass-input border-[rgba(255,255,255,0.1)] text-white text-sm flex-1" />
                <Button className="gradient-primary border-0 text-white rounded-lg"><Send className="w-4 h-4" /></Button>
              </div>

              <div className="flex gap-2 mt-4">
                <Button size="sm" className="gradient-primary border-0 text-white text-xs">Marcar como Resolvido</Button>
                <Button size="sm" variant="outline" className="glass-input border-0 text-[hsl(var(--muted-foreground))] hover:text-white text-xs">Em Atendimento</Button>
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
        <div className="flex gap-2 flex-wrap">
          <span className="text-xs text-[hsl(var(--muted-foreground))] self-center mr-1">Prioridade:</span>
          {["todos", "critica", "normal", "baixa"].map((s) => (
            <Button key={s} size="sm"
              className={filtroPrioridade === s ? "gradient-primary border-0 text-white text-xs" : "glass-input border-0 text-[hsl(var(--muted-foreground))] hover:text-white text-xs"}
              onClick={() => setFiltroPrioridade(s)}>
              {s === "todos" ? "Todas" : s.charAt(0).toUpperCase() + s.slice(1)}
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
                {filtrados.map((t) => (
                  <TableRow key={t.id} className="border-[rgba(255,255,255,0.04)] cursor-pointer hover:bg-[rgba(255,255,255,0.03)]" onClick={() => setSelectedTicket(t.id)}>
                    <TableCell className="text-sm font-mono gradient-text">{t.id}</TableCell>
                    <TableCell className="text-sm text-white flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-[hsl(var(--muted-foreground))]" /> {t.titulo}
                    </TableCell>
                    <TableCell className="text-sm text-[hsl(var(--muted-foreground))]">{t.cliente}</TableCell>
                    <TableCell><StatusBadge status={t.prioridade} /></TableCell>
                    <TableCell><StatusBadge status={t.status} /></TableCell>
                    <TableCell className="text-sm text-[hsl(var(--muted-foreground))]">{new Date(t.data).toLocaleDateString("pt-BR")}</TableCell>
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
