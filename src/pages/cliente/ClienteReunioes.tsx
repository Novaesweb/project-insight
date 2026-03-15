import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CalendarDays, Clock, Video, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { statusReuniaoLabels, statusReuniaoColors, tipoReuniaoLabels, type TipoReuniao, type StatusReuniao } from "@/lib/mock-data";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

export default function ClienteReunioes() {
  const cliente = JSON.parse(localStorage.getItem("clienteLogado") || "{}");
  const { toast } = useToast();
  const [showModal, setShowModal] = useState(false);
  const [reunioes, setReunioes] = useState<any[]>([]);

  useEffect(() => {
    if (!cliente.id) return;
    supabase.from("reunioes").select("*").eq("cliente_id", cliente.id).order("data", { ascending: false })
      .then(({ data }) => setReunioes(data || []));
  }, [cliente.id]);

  const proximas = reunioes.filter(r => r.status === "agendada" || r.status === "confirmada" || r.status === "aguardando");
  const passadas = reunioes.filter(r => r.status === "realizada" || r.status === "cancelada");

  return (
    <motion.div variants={fadeUp} initial="hidden" animate="show" className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-white">Minhas Reuniões</h1>
        <Button className="border-0 text-white text-xs" style={{ background: "linear-gradient(135deg, #e8334a, #c2185b, #7b1fa2)" }} onClick={() => setShowModal(true)}>
          <Plus className="w-3 h-3 mr-1" /> Solicitar reunião
        </Button>
      </div>

      {proximas.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xs font-semibold text-white/50 uppercase tracking-wider">Próximas</h2>
          {proximas.map(r => (
            <Card key={r.id} className="border-[0.5px] border-white/[0.08]" style={{ background: "rgba(255,255,255,0.04)" }}>
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-white">{tipoReuniaoLabels[r.tipo as TipoReuniao]}</span>
                  <Badge variant="outline" className="text-[10px] border-0 px-2" style={{ backgroundColor: statusReuniaoColors[r.status as StatusReuniao] + "33", color: statusReuniaoColors[r.status as StatusReuniao] }}>
                    {statusReuniaoLabels[r.status as StatusReuniao]}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-xs text-white/40">
                  <span className="flex items-center gap-1"><CalendarDays className="w-3 h-3" /> {r.data}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {r.hora_inicio} — {r.hora_fim}</span>
                </div>
                {r.link && (
                  <a href={r.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-blue-400 hover:underline">
                    <Video className="w-3 h-3" /> Entrar na reunião →
                  </a>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {passadas.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xs font-semibold text-white/50 uppercase tracking-wider">Histórico</h2>
          {passadas.map(r => (
            <Card key={r.id} className="border-[0.5px] border-white/[0.08] opacity-60" style={{ background: "rgba(255,255,255,0.02)" }}>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <span className="text-sm text-white/70">{tipoReuniaoLabels[r.tipo as TipoReuniao]}</span>
                  <span className="text-xs text-white/30 ml-3">{r.data} · {r.hora_inicio}</span>
                </div>
                <Badge variant="outline" className="text-[10px] border-0 px-2" style={{ backgroundColor: statusReuniaoColors[r.status as StatusReuniao] + "22", color: statusReuniaoColors[r.status as StatusReuniao] }}>
                  {statusReuniaoLabels[r.status as StatusReuniao]}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {reunioes.length === 0 && <p className="text-sm text-white/40 text-center py-8">Nenhuma reunião encontrada</p>}

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="text-white max-w-md" style={{ background: "#0d0d14", border: "0.5px solid rgba(255,255,255,0.08)" }}>
          <DialogHeader><DialogTitle>Solicitar Reunião</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-xs text-white/50">Tipo de reunião</Label>
              <Select>
                <SelectTrigger className="border-0 text-white" style={{ background: "rgba(255,255,255,0.06)" }}><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {(Object.entries(tipoReuniaoLabels) as [TipoReuniao, string][]).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-white/50">Data preferida</Label>
                <Input type="date" className="border-0 text-white" style={{ background: "rgba(255,255,255,0.06)" }} />
              </div>
              <div>
                <Label className="text-xs text-white/50">Horário preferido</Label>
                <Input type="time" className="border-0 text-white" style={{ background: "rgba(255,255,255,0.06)" }} />
              </div>
            </div>
            <div>
              <Label className="text-xs text-white/50">Mensagem</Label>
              <Textarea placeholder="Descreva o assunto..." className="border-0 text-white placeholder:text-white/30 min-h-[80px]" style={{ background: "rgba(255,255,255,0.06)" }} />
            </div>
            <Button className="w-full border-0 text-white" style={{ background: "linear-gradient(135deg, #e8334a, #c2185b, #7b1fa2)" }}
              onClick={() => { setShowModal(false); toast({ title: "Solicitação enviada!", description: "Aguarde a confirmação da equipe." }); }}>
              Enviar solicitação
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
