import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Send, Plus, MessageSquare } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useRealtimeSubscription } from "@/hooks/useRealtimeSubscription";
import { sendPushToAdmins } from "@/lib/push-notifications";

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };
const statusColors: Record<string, string> = { aberto: "#60a5fa", em_atendimento: "#facc15", resolvido: "#4ade80" };
const statusLabels: Record<string, string> = { aberto: "Aberto", em_atendimento: "Em atendimento", resolvido: "Resolvido" };

interface Msg { id: string; ticket_id: string; remetente: string; nome: string; texto: string; created_at: string; }

export default function ClienteSuporte() {
  const cliente = JSON.parse(localStorage.getItem("clienteLogado") || "{}");
  const { toast } = useToast();
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [showNovoTicket, setShowNovoTicket] = useState(false);
  const [novoTitulo, setNovoTitulo] = useState("");
  const [novoDescricao, setNovoDescricao] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [tickets, setTickets] = useState<any[]>([]);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const chatRef = useRef<HTMLDivElement>(null);

  const loadTickets = useCallback(() => {
    if (!cliente.id) return;
    supabase.from("tickets").select("*").eq("cliente_id", cliente.id).order("created_at", { ascending: false })
      .then(({ data }) => setTickets(data || []));
  }, [cliente.id]);

  const loadMsgs = useCallback(() => {
    if (!selectedTicket) return;
    supabase.from("ticket_mensagens").select("*").eq("ticket_id", selectedTicket).order("created_at", { ascending: true })
      .then(({ data }) => setMsgs(data || []));
  }, [selectedTicket]);

  useEffect(() => { loadTickets(); }, [loadTickets]);
  useEffect(() => { loadMsgs(); }, [loadMsgs]);
  useEffect(() => { if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight; }, [msgs.length]);

  useRealtimeSubscription("tickets", loadTickets);
  useRealtimeSubscription("ticket_mensagens", loadMsgs);

  const ticketAtivo = tickets.find(t => t.id === selectedTicket);

  const enviarMensagem = async () => {
    if (!mensagem.trim() || !selectedTicket) return;
    const nova = { ticket_id: selectedTicket, remetente: "cliente", nome: cliente.nome, texto: mensagem };
    const { data } = await supabase.from("ticket_mensagens").insert(nova).select().single();
    if (data) setMsgs(prev => [...prev, data]);
    setMensagem("");
  };

  const criarTicket = async () => {
    if (!novoTitulo.trim()) return;
    const codigo = `TK-${Date.now().toString().slice(-6)}`;
    const { error } = await supabase.from("tickets").insert({
      titulo: novoTitulo,
      descricao: novoDescricao || null,
      cliente_id: cliente.id,
      codigo,
    });
    if (!error) {
      toast({ title: "Ticket criado!", description: "Sua solicitação foi aberta com sucesso." });
      sendPushToAdmins("🎫 Novo Ticket de Suporte", `${novoTitulo} — aberto por ${cliente.nome}`, "/admin/suporte");
      setShowNovoTicket(false);
      setNovoTitulo("");
      setNovoDescricao("");
      loadTickets();
    }
  };

  if (selectedTicket && ticketAtivo) {
    return (
      <motion.div variants={fadeUp} initial="hidden" animate="show" className="space-y-4 h-full flex flex-col">
        <div className="flex items-center justify-between">
          <div>
            <Button variant="ghost" size="sm" className="text-white/50 text-xs mb-1" onClick={() => setSelectedTicket(null)}>← Voltar</Button>
            <h2 className="text-sm font-bold text-white">{ticketAtivo.titulo}</h2>
            <p className="text-[11px] text-white/40">{ticketAtivo.codigo}</p>
          </div>
          <Badge variant="outline" className="text-[10px] border-0 px-2" style={{ backgroundColor: statusColors[ticketAtivo.status] + "33", color: statusColors[ticketAtivo.status] }}>
            {statusLabels[ticketAtivo.status]}
          </Badge>
        </div>

        <div ref={chatRef} className="flex-1 overflow-y-auto space-y-3 min-h-[300px] max-h-[500px] p-4 rounded-xl" style={{ background: "rgba(255,255,255,0.02)", border: "0.5px solid rgba(255,255,255,0.06)" }}>
          {msgs.map(m => (
            <div key={m.id} className={`flex ${m.remetente === "cliente" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${m.remetente === "cliente" ? "rounded-br-md" : "rounded-bl-md"}`}
                style={{ background: m.remetente === "cliente" ? "linear-gradient(135deg, #e8334a, #c2185b, #7b1fa2)" : "rgba(255,255,255,0.06)" }}>
                <p className="text-[10px] font-medium text-white/60 mb-0.5">{m.nome}</p>
                <p className="text-xs text-white">{m.texto}</p>
                <p className="text-[9px] text-white/30 mt-1">{new Date(m.created_at).toLocaleString("pt-BR")}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <Input value={mensagem} onChange={e => setMensagem(e.target.value)} onKeyDown={e => e.key === "Enter" && enviarMensagem()} placeholder="Digite sua mensagem..." className="flex-1 border-0 text-white placeholder:text-white/30" style={{ background: "rgba(255,255,255,0.06)" }} />
          <Button onClick={enviarMensagem} className="border-0 text-white shrink-0" style={{ background: "linear-gradient(135deg, #e8334a, #7b1fa2)" }}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div variants={fadeUp} initial="hidden" animate="show" className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-white">Suporte</h1>
        <Button className="border-0 text-white text-xs" style={{ background: "linear-gradient(135deg, #e8334a, #c2185b, #7b1fa2)" }} onClick={() => setShowNovoTicket(true)}>
          <Plus className="w-3 h-3 mr-1" /> Novo atendimento
        </Button>
      </div>

      <div className="space-y-3">
        {tickets.map(t => (
          <Card key={t.id} className="border-[0.5px] border-white/[0.08] cursor-pointer hover:border-white/20 transition-all" style={{ background: "rgba(255,255,255,0.04)" }}
            onClick={() => setSelectedTicket(t.id)}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-white/40" />
                  <span className="text-sm font-medium text-white">{t.titulo}</span>
                </div>
                <Badge variant="outline" className="text-[10px] border-0 px-2" style={{ backgroundColor: statusColors[t.status] + "33", color: statusColors[t.status] }}>
                  {statusLabels[t.status]}
                </Badge>
              </div>
              <p className="text-xs text-white/40">{t.descricao}</p>
              <p className="text-[10px] text-white/30 mt-2">{t.codigo} · {new Date(t.created_at).toLocaleDateString("pt-BR")}</p>
            </CardContent>
          </Card>
        ))}
        {tickets.length === 0 && <p className="text-sm text-white/40 text-center py-8">Nenhum ticket de suporte</p>}
      </div>

      <Dialog open={showNovoTicket} onOpenChange={setShowNovoTicket}>
        <DialogContent className="text-white max-w-md" style={{ background: "#0d0d14", border: "0.5px solid rgba(255,255,255,0.08)" }}>
          <DialogHeader><DialogTitle>Novo Atendimento</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-xs text-white/50">Título</Label>
              <Input value={novoTitulo} onChange={e => setNovoTitulo(e.target.value)} placeholder="Resumo do problema" className="border-0 text-white placeholder:text-white/30" style={{ background: "rgba(255,255,255,0.06)" }} />
            </div>
            <div>
              <Label className="text-xs text-white/50">Descrição</Label>
              <Textarea value={novoDescricao} onChange={e => setNovoDescricao(e.target.value)} placeholder="Descreva detalhadamente..." className="border-0 text-white placeholder:text-white/30 min-h-[100px]" style={{ background: "rgba(255,255,255,0.06)" }} />
            </div>
            <Button className="w-full border-0 text-white" style={{ background: "linear-gradient(135deg, #e8334a, #c2185b, #7b1fa2)" }} onClick={criarTicket}>
              Abrir ticket
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
