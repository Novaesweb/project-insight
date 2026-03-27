import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useRealtimeSubscription } from "@/hooks/useRealtimeSubscription";

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };
const catConfig: Record<string, { label: string; color: string; bg: string; border: string }> = {
  fixo: { label: "Único", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  intermediario: { label: "Pro", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
  mensal: { label: "Assinatura", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
};

export default function ClienteExtras() {
  const cliente = JSON.parse(localStorage.getItem("clienteLogado") || "{}");
  const [meusExtras, setMeusExtras] = useState<any[]>([]);

  const load = useCallback(() => {
    if (!cliente.id) return;
    supabase.from("extras_clientes").select("*, extras_catalogo(nome)").eq("cliente_id", cliente.id)
      .then(({ data }) => setMeusExtras(data || []));
  }, [cliente.id]);

  useEffect(() => { load(); }, [load]);
  useRealtimeSubscription("extras_clientes", load);

  const ativos = meusExtras.filter(e => e.status === "ativo");
  const totalMensal = ativos.reduce((acc, e) => acc + Number(e.preco_mensal), 0);
  const totalAtivacao = ativos.reduce((acc, e) => acc + Number(e.preco_ativacao), 0);

  return (
    <motion.div variants={fadeUp} initial="hidden" animate="show" className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-white">Meus Extras</h1>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card className="border-[0.5px] border-white/[0.08]" style={{ background: "rgba(255,255,255,0.04)" }}>
          <CardContent className="p-4">
            <p className="text-[10px] text-white/40">Total mensal recorrente</p>
            <p className="text-lg font-bold text-green-400">R$ {totalMensal.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card className="border-[0.5px] border-white/[0.08]" style={{ background: "rgba(255,255,255,0.04)" }}>
          <CardContent className="p-4">
            <p className="text-[10px] text-white/40">Total pago em ativações</p>
            <p className="text-lg font-bold text-blue-400">R$ {totalAtivacao.toFixed(2)}</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3">
        {meusExtras.map(e => (
          <Card key={e.id} className="border-[0.5px] border-white/[0.08]" style={{ background: "rgba(255,255,255,0.04)" }}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-white">{(e as any).extras_catalogo?.nome || "Extra"}</span>
                <Badge variant="outline" className="text-[10px] border-0 px-2" style={{ backgroundColor: (e.status === "ativo" ? "#4ade80" : e.status === "pausado" ? "#facc15" : "#ef4444") + "22", color: e.status === "ativo" ? "#4ade80" : e.status === "pausado" ? "#facc15" : "#ef4444" }}>
                  {e.status}
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-[11px] text-white/40">
                <Badge variant="outline" className={`text-[9px] border-0 px-1.5 ${catConfig[e.categoria]?.bg} ${catConfig[e.categoria]?.color}`}>{catConfig[e.categoria]?.label}</Badge>
                {Number(e.preco_ativacao) > 0 && <span className="text-emerald-400">Ativação: R$ {Number(e.preco_ativacao).toFixed(2)}</span>}
                {Number(e.preco_mensal) > 0 && <span className="text-amber-400">Mensal: R$ {Number(e.preco_mensal).toFixed(2)}/mês</span>}
                <span>Início: {new Date(e.created_at).toLocaleDateString("pt-BR")}</span>
              </div>
            </CardContent>
          </Card>
        ))}
        {meusExtras.length === 0 && <p className="text-sm text-white/40 text-center py-8">Nenhum extra contratado</p>}
      </div>
    </motion.div>
  );
}



