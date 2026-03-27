import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { CalendarDays, Clock, Video } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { statusReuniaoLabels, statusReuniaoColors, tipoReuniaoLabels, type TipoReuniao, type StatusReuniao } from "@/lib/constants";
import { supabase } from "@/integrations/supabase/client";
import { useRealtimeSubscription } from "@/hooks/useRealtimeSubscription";

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

export default function ClienteReunioes() {
  const cliente = JSON.parse(localStorage.getItem("clienteLogado") || "{}");
  const [reunioes, setReunioes] = useState<any[]>([]);

  const load = useCallback(() => {
    if (!cliente.id) return;
    supabase.from("reunioes").select("*").eq("cliente_id", cliente.id).order("data", { ascending: false })
      .then(({ data }) => setReunioes(data || []));
  }, [cliente.id]);

  useEffect(() => { load(); }, [load]);
  useRealtimeSubscription("reunioes", load);

  const proximas = reunioes.filter(r => r.status === "agendada" || r.status === "confirmada" || r.status === "aguardando");
  const passadas = reunioes.filter(r => r.status === "realizada" || r.status === "cancelada");

  return (
    <motion.div variants={fadeUp} initial="hidden" animate="show" className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-white">Minhas Reuniões</h1>
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
    </motion.div>
  );
}



