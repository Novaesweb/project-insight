import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Download } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useRealtimeSubscription } from "@/hooks/useRealtimeSubscription";

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };
const statusColors: Record<string, string> = { paga: "#4ade80", pendente: "#facc15", atrasada: "#ef4444" };
const statusLabels: Record<string, string> = { paga: "Paga", pendente: "Pendente", atrasada: "Atrasada" };

export default function ClienteFaturas() {
  const cliente = JSON.parse(localStorage.getItem("clienteLogado") || "{}");
  const [faturas, setFaturas] = useState<any[]>([]);

  const load = useCallback(() => {
    if (!cliente.id) return;
    supabase.from("faturas").select("*").eq("cliente_id", cliente.id).order("vencimento", { ascending: false })
      .then(({ data }) => setFaturas(data || []));
  }, [cliente.id]);

  useEffect(() => { load(); }, [load]);
  useRealtimeSubscription("faturas", load);

  const totalPendente = faturas.filter(f => f.status === "pendente").reduce((a, f) => a + Number(f.valor), 0);
  const totalAtrasado = faturas.filter(f => f.status === "atrasada").reduce((a, f) => a + Number(f.valor), 0);

  return (
    <motion.div variants={fadeUp} initial="hidden" animate="show" className="space-y-6">
      <h1 className="text-lg font-bold text-white">Minhas Faturas</h1>
      <div className="grid grid-cols-2 gap-4">
        <Card className="border-[0.5px] border-white/[0.08]" style={{ background: "rgba(255,255,255,0.04)" }}>
          <CardContent className="p-4">
            <p className="text-[10px] text-white/40">Total pendente</p>
            <p className="text-lg font-bold text-yellow-400">R$ {totalPendente.toLocaleString("pt-BR")}</p>
          </CardContent>
        </Card>
        <Card className="border-[0.5px] border-white/[0.08]" style={{ background: "rgba(255,255,255,0.04)" }}>
          <CardContent className="p-4">
            <p className="text-[10px] text-white/40">Total em atraso</p>
            <p className="text-lg font-bold text-red-400">R$ {totalAtrasado.toLocaleString("pt-BR")}</p>
          </CardContent>
        </Card>
      </div>
      <div className="space-y-3">
        {faturas.map(f => (
          <Card key={f.id} className={`border-[0.5px] ${f.status === "atrasada" ? "border-red-500/30" : "border-white/[0.08]"}`} style={{ background: "rgba(255,255,255,0.04)" }}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-white">{f.descricao}</span>
                <Badge variant="outline" className="text-[10px] border-0 px-2" style={{ backgroundColor: statusColors[f.status] + "22", color: statusColors[f.status] }}>
                  {statusLabels[f.status]}
                </Badge>
              </div>
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-4 text-[11px] text-white/40">
                  <span className="text-white font-medium">R$ {Number(f.valor).toLocaleString("pt-BR")}</span>
                  <span>Vencimento: {f.vencimento}</span>
                </div>
                <Button size="sm" variant="ghost" className="text-white/50 text-xs h-7">
                  <Download className="w-3 h-3 mr-1" /> Boleto
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {faturas.length === 0 && <p className="text-sm text-white/40 text-center py-8">Nenhuma fatura encontrada</p>}
      </div>
    </motion.div>
  );
}
