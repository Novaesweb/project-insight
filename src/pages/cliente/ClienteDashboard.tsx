import { motion } from "framer-motion";
import { FolderKanban, Plus, Receipt, Headphones, CalendarDays, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { projetos, extrasClientes, faturas, tickets, reunioes, notificacoes, projetoAtualizacoes, statusReuniaoLabels, statusReuniaoColors, tipoReuniaoLabels } from "@/lib/mock-data";

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

export default function ClienteDashboard() {
  const cliente = JSON.parse(localStorage.getItem("clienteLogado") || "{}");
  const cId = cliente.id;

  const meusProjetos = projetos.filter(p => p.clienteId === cId && p.status !== "cancelado");
  const meusExtras = extrasClientes.filter(e => e.clienteId === cId && e.status === "ativo");
  const minhasFaturas = faturas.filter(f => f.clienteId === cId && f.status !== "paga");
  const meusTickets = tickets.filter(t => t.clienteId === cId && t.status !== "resolvido");
  const proximaReuniao = reunioes.find(r => r.clienteId === cId && (r.status === "confirmada" || r.status === "agendada"));

  const atualizacoesRecentes = projetoAtualizacoes
    .filter(a => {
      const proj = projetos.find(p => p.id === a.projetoId);
      return proj?.clienteId === cId && a.visivelCliente;
    })
    .sort((a, b) => b.data.localeCompare(a.data))
    .slice(0, 5);

  const kpis = [
    { label: "Projetos ativos", value: meusProjetos.length, icon: FolderKanban, color: "text-blue-400" },
    { label: "Extras contratados", value: meusExtras.length, icon: Plus, color: "text-green-400" },
    { label: "Faturas pendentes", value: minhasFaturas.length, icon: Receipt, color: minhasFaturas.length > 0 ? "text-yellow-400" : "text-green-400" },
    { label: "Tickets abertos", value: meusTickets.length, icon: Headphones, color: "text-purple-400" },
  ];

  return (
    <motion.div variants={fadeUp} initial="hidden" animate="show" className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Olá, {cliente.nome?.split(" ")[0]}! 👋</h1>
        <p className="text-sm text-white/50">Bem-vindo ao seu portal</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(kpi => (
          <Card key={kpi.label} className="border-[0.5px] border-white/[0.08]" style={{ background: "rgba(255,255,255,0.04)" }}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.06)" }}>
                <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
              </div>
              <div>
                <p className={`text-xl font-bold ${kpi.color}`}>{kpi.value}</p>
                <p className="text-[11px] text-white/40">{kpi.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        {/* Timeline */}
        <Card className="border-[0.5px] border-white/[0.08]" style={{ background: "rgba(255,255,255,0.04)" }}>
          <CardContent className="p-5">
            <h2 className="text-sm font-semibold text-white mb-4">Últimas atualizações</h2>
            {atualizacoesRecentes.length === 0 ? (
              <p className="text-xs text-white/40 text-center py-6">Nenhuma atualização recente</p>
            ) : (
              <div className="space-y-4">
                {atualizacoesRecentes.map((a, i) => {
                  const proj = projetos.find(p => p.id === a.projetoId);
                  return (
                    <div key={a.id} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-2.5 h-2.5 rounded-full mt-1" style={{ background: "linear-gradient(135deg, #e8334a, #7b1fa2)" }} />
                        {i < atualizacoesRecentes.length - 1 && <div className="w-px flex-1 bg-white/10 mt-1" />}
                      </div>
                      <div className="pb-4">
                        <p className="text-xs font-medium text-white">{a.descricao}</p>
                        <p className="text-[10px] text-white/40 mt-0.5">{proj?.titulo} · {a.data}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Próxima reunião */}
        <Card className="border-[0.5px] border-white/[0.08]" style={{ background: "rgba(255,255,255,0.04)" }}>
          <CardContent className="p-5 space-y-4">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <CalendarDays className="w-4 h-4" /> Próxima reunião
            </h2>
            {proximaReuniao ? (
              <div className="p-4 rounded-xl space-y-2" style={{ background: "rgba(255,255,255,0.04)", border: "0.5px solid rgba(255,255,255,0.08)" }}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-white">{tipoReuniaoLabels[proximaReuniao.tipo]}</span>
                  <Badge variant="outline" className="text-[10px] border-0 px-2" style={{ backgroundColor: statusReuniaoColors[proximaReuniao.status] + "33", color: statusReuniaoColors[proximaReuniao.status] }}>
                    {statusReuniaoLabels[proximaReuniao.status]}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-white/50 text-xs">
                  <CalendarDays className="w-3 h-3" /> {proximaReuniao.data}
                </div>
                <div className="flex items-center gap-2 text-white/50 text-xs">
                  <Clock className="w-3 h-3" /> {proximaReuniao.horaInicio} — {proximaReuniao.horaFim}
                </div>
                {proximaReuniao.link && (
                  <a href={proximaReuniao.link} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:underline block mt-1">
                    Entrar na reunião →
                  </a>
                )}
              </div>
            ) : (
              <p className="text-xs text-white/40 text-center py-6">Nenhuma reunião agendada</p>
            )}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
