import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, Circle, Clock, CalendarDays, Flag } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import StatusBadge from "@/components/StatusBadge";
import { useRealtimeSubscription } from "@/hooks/useRealtimeSubscription";

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };
const stagger = { show: { transition: { staggerChildren: 0.08 } } };

const etapas = [
  { label: "Briefing", desc: "Levantamento de requisitos e definição do escopo", icon: CalendarDays },
  { label: "Desenvolvimento", desc: "Construção e programação do projeto", icon: Clock },
  { label: "Revisão", desc: "Ajustes finais e aprovação do cliente", icon: Flag },
  { label: "Entregue", desc: "Projeto finalizado e entregue", icon: CheckCircle2 },
];

function getEtapaAtual(progresso: number) {
  if (progresso >= 100) return 3;
  if (progresso >= 70) return 2;
  if (progresso >= 20) return 1;
  return 0;
}

function getEtapaDate(progresso: number, etapaIndex: number, createdAt: string, prazo: string | null) {
  const etapaAtual = getEtapaAtual(progresso);
  if (etapaIndex > etapaAtual) return null;
  if (etapaIndex === 0) return new Date(createdAt);
  if (etapaIndex === 3 && prazo && progresso >= 100) return new Date(prazo);
  // Estimate intermediate dates
  const start = new Date(createdAt).getTime();
  const end = prazo ? new Date(prazo).getTime() : start + 30 * 24 * 60 * 60 * 1000;
  const fraction = etapaIndex / 3;
  return new Date(start + (end - start) * fraction);
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
      <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">
        <motion.div variants={fadeUp}>
          <Button variant="ghost" onClick={() => setSelectedId(null)} className="text-white/50 hover:text-white">
            <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
          </Button>
        </motion.div>

        <motion.div variants={fadeUp}>
          <h1 className="text-lg font-bold text-white">{selected.titulo}</h1>
          <p className="text-sm text-white/50 mt-1">{selected.descricao}</p>
        </motion.div>

        {/* Progress bar */}
        <motion.div variants={fadeUp}>
          <Card className="border-[0.5px] border-white/[0.08]" style={{ background: "rgba(255,255,255,0.04)" }}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-white">Progresso geral</span>
                <span className="text-sm font-bold gradient-text">{progresso}%</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-white/[0.06]">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: "linear-gradient(135deg, #e8334a, #c2185b, #7b1fa2)" }}
                  initial={{ width: 0 }}
                  animate={{ width: `${progresso}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Timeline */}
        <motion.div variants={fadeUp}>
          <Card className="border-[0.5px] border-white/[0.08]" style={{ background: "rgba(255,255,255,0.04)" }}>
            <CardContent className="p-5">
              <h2 className="text-sm font-semibold text-white mb-6">Linha do Tempo</h2>
              <div className="relative">
                {etapas.map((etapa, i) => {
                  const isCompleted = i < etapaAtual;
                  const isCurrent = i === etapaAtual;
                  const isPending = i > etapaAtual;
                  const date = getEtapaDate(progresso, i, selected.created_at, selected.prazo);
                  const Icon = etapa.icon;

                  return (
                    <motion.div
                      key={etapa.label}
                      className="relative flex gap-4 pb-8 last:pb-0"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.15, duration: 0.4 }}
                    >
                      {/* Vertical line */}
                      {i < etapas.length - 1 && (
                        <div className="absolute left-[17px] top-[36px] w-[2px] h-[calc(100%-28px)]"
                          style={{
                            background: isCompleted
                              ? "linear-gradient(180deg, #e8334a, #7b1fa2)"
                              : "rgba(255,255,255,0.08)"
                          }}
                        />
                      )}

                      {/* Node */}
                      <div className="relative z-10 shrink-0">
                        {isCompleted ? (
                          <div className="w-[36px] h-[36px] rounded-full flex items-center justify-center"
                            style={{ background: "linear-gradient(135deg, #e8334a, #7b1fa2)" }}>
                            <CheckCircle2 className="w-4 h-4 text-white" />
                          </div>
                        ) : isCurrent ? (
                          <div className="w-[36px] h-[36px] rounded-full flex items-center justify-center border-2"
                            style={{ borderColor: "#e8334a", background: "rgba(232,51,74,0.15)" }}>
                            <motion.div
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ repeat: Infinity, duration: 2 }}
                            >
                              <Icon className="w-4 h-4" style={{ color: "#e8334a" }} />
                            </motion.div>
                          </div>
                        ) : (
                          <div className="w-[36px] h-[36px] rounded-full flex items-center justify-center bg-white/[0.06] border border-white/10">
                            <Circle className="w-4 h-4 text-white/20" />
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 pt-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <h3 className={`text-sm font-semibold ${isPending ? "text-white/30" : "text-white"}`}>
                            {etapa.label}
                          </h3>
                          {isCurrent && (
                            <span className="text-[9px] px-2 py-0.5 rounded-full font-medium"
                              style={{ background: "rgba(232,51,74,0.15)", color: "#e8334a" }}>
                              Em andamento
                            </span>
                          )}
                          {isCompleted && (
                            <span className="text-[9px] px-2 py-0.5 rounded-full font-medium bg-emerald-500/10 text-emerald-400">
                              Concluído
                            </span>
                          )}
                        </div>
                        <p className={`text-[11px] ${isPending ? "text-white/20" : "text-white/40"}`}>
                          {etapa.desc}
                        </p>
                        {date && (
                          <p className="text-[10px] text-white/30 mt-1 flex items-center gap-1">
                            <CalendarDays className="w-3 h-3" />
                            {date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Info cards */}
        <motion.div variants={fadeUp} className="grid grid-cols-2 gap-4">
          <Card className="border-[0.5px] border-white/[0.08]" style={{ background: "rgba(255,255,255,0.04)" }}>
            <CardContent className="p-4">
              <p className="text-[10px] text-white/40 uppercase tracking-wider">Início</p>
              <p className="text-sm text-white font-medium mt-0.5">
                {selected.inicio ? new Date(selected.inicio).toLocaleDateString("pt-BR") : new Date(selected.created_at).toLocaleDateString("pt-BR")}
              </p>
            </CardContent>
          </Card>
          <Card className="border-[0.5px] border-white/[0.08]" style={{ background: "rgba(255,255,255,0.04)" }}>
            <CardContent className="p-4">
              <p className="text-[10px] text-white/40 uppercase tracking-wider">Prazo</p>
              <p className="text-sm text-white font-medium mt-0.5">
                {selected.prazo ? new Date(selected.prazo).toLocaleDateString("pt-BR") : "—"}
              </p>
            </CardContent>
          </Card>
          <Card className="border-[0.5px] border-white/[0.08]" style={{ background: "rgba(255,255,255,0.04)" }}>
            <CardContent className="p-4">
              <p className="text-[10px] text-white/40 uppercase tracking-wider">Status</p>
              <div className="mt-1"><StatusBadge status={selected.status} /></div>
            </CardContent>
          </Card>
          <Card className="border-[0.5px] border-white/[0.08]" style={{ background: "rgba(255,255,255,0.04)" }}>
            <CardContent className="p-4">
              <p className="text-[10px] text-white/40 uppercase tracking-wider">Etapa atual</p>
              <p className="text-sm font-medium mt-0.5 gradient-text">{etapas[etapaAtual].label}</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Updates timeline */}
        <motion.div variants={fadeUp}>
          <Card className="border-[0.5px] border-white/[0.08]" style={{ background: "rgba(255,255,255,0.04)" }}>
            <CardContent className="p-5">
              <h2 className="text-sm font-semibold text-white mb-4">Atualizações do Projeto</h2>
              {atualizacoes.length === 0 ? (
                <p className="text-xs text-white/40 text-center py-4">Nenhuma atualização ainda</p>
              ) : (
                <div className="relative space-y-0">
                  {atualizacoes.map((a, i) => (
                    <motion.div
                      key={a.id}
                      className="relative flex gap-4 pb-5 last:pb-0"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05, duration: 0.3 }}
                    >
                      {/* Line */}
                      {i < atualizacoes.length - 1 && (
                        <div className="absolute left-[5px] top-[14px] w-[2px] h-[calc(100%-6px)] bg-white/[0.06]" />
                      )}
                      {/* Dot */}
                      <div className="relative z-10 shrink-0 mt-1">
                        <div className="w-3 h-3 rounded-full border-2" style={{ borderColor: "#e8334a", background: "rgba(232,51,74,0.3)" }} />
                      </div>
                      {/* Content */}
                      <div className="flex-1 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                        <p className="text-xs text-white leading-relaxed">{a.descricao}</p>
                        <p className="text-[10px] text-white/30 mt-1.5 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(a.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}
                          {" às "}
                          {new Date(a.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    );
  }

  // Project list
  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">
      <motion.h1 variants={fadeUp} className="text-lg font-bold text-white">Meus Projetos</motion.h1>
      <div className="space-y-3">
        {projetos.map((p, i) => {
          const progresso = p.progresso || 0;
          const etapaAtual = getEtapaAtual(progresso);
          return (
            <motion.div key={p.id} variants={fadeUp}>
              <Card
                className="border-[0.5px] border-white/[0.08] cursor-pointer hover:border-white/20 transition-all"
                style={{ background: "rgba(255,255,255,0.04)" }}
                onClick={() => setSelectedId(p.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-white">{p.titulo}</span>
                    <StatusBadge status={p.status} />
                  </div>
                  <p className="text-xs text-white/40 mb-3">{p.descricao}</p>

                  {/* Mini timeline */}
                  <div className="flex items-center gap-1 mb-3">
                    {etapas.map((e, idx) => (
                      <div key={e.label} className="flex items-center gap-1">
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold ${idx <= etapaAtual ? "text-white" : "text-white/20 bg-white/[0.06]"}`}
                          style={idx <= etapaAtual ? { background: "linear-gradient(135deg, #e8334a, #7b1fa2)" } : {}}
                        >
                          {idx < etapaAtual ? "✓" : idx + 1}
                        </div>
                        {idx < etapas.length - 1 && (
                          <div className={`w-4 h-[2px] rounded-full ${idx < etapaAtual ? "bg-gradient-to-r from-[#e8334a] to-[#7b1fa2]" : "bg-white/[0.08]"}`} />
                        )}
                      </div>
                    ))}
                    <span className="text-[9px] text-white/30 ml-2">{etapas[etapaAtual].label}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-1.5 rounded-full bg-white/[0.06]">
                      <div className="h-full rounded-full" style={{ width: `${progresso}%`, background: "linear-gradient(135deg, #e8334a, #7b1fa2)" }} />
                    </div>
                    <span className="text-[10px] text-white/50 font-medium">{progresso}%</span>
                  </div>
                  <p className="text-[10px] text-white/30 mt-2">Prazo: {p.prazo ? new Date(p.prazo).toLocaleDateString("pt-BR") : "—"}</p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
        {projetos.length === 0 && (
          <motion.p variants={fadeUp} className="text-sm text-white/40 text-center py-8">Nenhum projeto encontrado</motion.p>
        )}
      </div>
    </motion.div>
  );
}
