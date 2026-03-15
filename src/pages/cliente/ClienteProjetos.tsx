import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import StatusBadge from "@/components/StatusBadge";
import { useRealtimeSubscription } from "@/hooks/useRealtimeSubscription";

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };
const etapas = ["Briefing", "Desenvolvimento", "Revisão", "Entregue"];

function getEtapaAtual(progresso: number) {
  if (progresso >= 100) return 3;
  if (progresso >= 70) return 2;
  if (progresso >= 20) return 1;
  return 0;
}

export default function ClienteProjetos() {
  const cliente = JSON.parse(localStorage.getItem("clienteLogado") || "{}");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [projetos, setProjetos] = useState<any[]>([]);
  const [atualizacoes, setAtualizacoes] = useState<any[]>([]);

  const loadProjetos = useCallback(() => {
    if (!cliente.id) return;
    supabase.from("projetos").select("*").eq("cliente_id", cliente.id).order("created_at", { ascending: false })
      .then(({ data }) => setProjetos(data || []));
  }, [cliente.id]);

  const loadAtualizacoes = useCallback(() => {
    if (!selectedId) return;
    supabase.from("projeto_atualizacoes").select("*").eq("projeto_id", selectedId).eq("visivel_cliente", true).order("created_at", { ascending: false })
      .then(({ data }) => setAtualizacoes(data || []));
  }, [selectedId]);

  useEffect(() => { loadProjetos(); }, [loadProjetos]);
  useEffect(() => { loadAtualizacoes(); }, [loadAtualizacoes]);

  useRealtimeSubscription("projetos", loadProjetos);
  useRealtimeSubscription("projeto_atualizacoes", loadAtualizacoes);

  const selected = projetos.find(p => p.id === selectedId);

  if (selected) {
    const progresso = selected.progresso || 0;
    const etapaAtual = getEtapaAtual(progresso);

    return (
      <motion.div variants={fadeUp} initial="hidden" animate="show" className="space-y-6">
        <Button variant="ghost" onClick={() => setSelectedId(null)} className="text-white/50 hover:text-white">
          <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
        </Button>
        <div>
          <h1 className="text-lg font-bold text-white">{selected.titulo}</h1>
          <p className="text-sm text-white/50">{selected.descricao}</p>
        </div>
        <Card className="border-[0.5px] border-white/[0.08]" style={{ background: "rgba(255,255,255,0.04)" }}>
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-white">Progresso</span>
              <span className="text-xs font-bold text-white">{progresso}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-white/10">
              <div className="h-full rounded-full" style={{ width: `${progresso}%`, background: "linear-gradient(135deg, #e8334a, #c2185b, #7b1fa2)" }} />
            </div>
            <div className="flex justify-between mt-4">
              {etapas.map((e, i) => (
                <div key={e} className="flex flex-col items-center gap-1">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${i <= etapaAtual ? "text-white" : "text-white/30 bg-white/10"}`}
                    style={i <= etapaAtual ? { background: "linear-gradient(135deg, #e8334a, #7b1fa2)" } : {}}>
                    {i + 1}
                  </div>
                  <span className={`text-[10px] ${i <= etapaAtual ? "text-white" : "text-white/30"}`}>{e}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <div className="grid grid-cols-2 gap-4">
          <Card className="border-[0.5px] border-white/[0.08]" style={{ background: "rgba(255,255,255,0.04)" }}>
            <CardContent className="p-4">
              <p className="text-[10px] text-white/40">Prazo</p>
              <p className="text-sm text-white font-medium">{selected.prazo || "—"}</p>
            </CardContent>
          </Card>
          <Card className="border-[0.5px] border-white/[0.08]" style={{ background: "rgba(255,255,255,0.04)" }}>
            <CardContent className="p-4">
              <p className="text-[10px] text-white/40">Status</p>
              <StatusBadge status={selected.status} />
            </CardContent>
          </Card>
        </div>
        <Card className="border-[0.5px] border-white/[0.08]" style={{ background: "rgba(255,255,255,0.04)" }}>
          <CardContent className="p-5">
            <h2 className="text-sm font-semibold text-white mb-4">Atualizações</h2>
            {atualizacoes.length === 0 ? (
              <p className="text-xs text-white/40 text-center py-4">Nenhuma atualização</p>
            ) : (
              <div className="space-y-3">
                {atualizacoes.map(a => (
                  <div key={a.id} className="flex gap-3">
                    <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ background: "linear-gradient(135deg, #e8334a, #7b1fa2)" }} />
                    <div>
                      <p className="text-xs text-white">{a.descricao}</p>
                      <p className="text-[10px] text-white/40 mt-0.5">{new Date(a.created_at).toLocaleDateString("pt-BR")}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div variants={fadeUp} initial="hidden" animate="show" className="space-y-6">
      <h1 className="text-lg font-bold text-white">Meus Projetos</h1>
      <div className="space-y-3">
        {projetos.map(p => (
          <Card key={p.id} className="border-[0.5px] border-white/[0.08] cursor-pointer hover:border-white/20 transition-all" style={{ background: "rgba(255,255,255,0.04)" }}
            onClick={() => setSelectedId(p.id)}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-white">{p.titulo}</span>
                <StatusBadge status={p.status} />
              </div>
              <p className="text-xs text-white/40 mb-3">{p.descricao}</p>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-1.5 rounded-full bg-white/10">
                  <div className="h-full rounded-full" style={{ width: `${p.progresso || 0}%`, background: "linear-gradient(135deg, #e8334a, #7b1fa2)" }} />
                </div>
                <span className="text-[10px] text-white/50 font-medium">{p.progresso || 0}%</span>
              </div>
              <p className="text-[10px] text-white/30 mt-2">Prazo: {p.prazo || "—"}</p>
            </CardContent>
          </Card>
        ))}
        {projetos.length === 0 && <p className="text-sm text-white/40 text-center py-8">Nenhum projeto encontrado</p>}
      </div>
    </motion.div>
  );
}
