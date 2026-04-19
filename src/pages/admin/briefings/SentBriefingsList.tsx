import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Search, 
  ArrowLeft,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { useBriefings } from "@/features/briefings/hooks/useBriefings";
import { BriefingCard } from "@/features/briefings/components/BriefingCard";
import { briefingStatusMeta } from "@/lib/project-briefings";
import { cn } from "@/lib/utils";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function SentBriefingsList() {
  const navigate = useNavigate();
  const { sentBriefings, clients, loading, kpis } = useBriefings();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");

  const filtered = useMemo(() => {
    return sentBriefings.filter((b) => {
      const matchesSearch = b.titulo.toLowerCase().includes(search.toLowerCase()) ||
        (b.clientes && !Array.isArray(b.clientes) && b.clientes.nome.toLowerCase().includes(search.toLowerCase()));
      const matchesStatus = statusFilter === "todos" || b.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [sentBriefings, search, statusFilter]);

  const getClientDisplayName = (client: any) => {
    if (!client) return "Cliente não encontrado";
    const val = Array.isArray(client) ? client[0] : client;
    return val?.nome_empresa?.trim() || val?.nome?.trim() || "Cliente não encontrado";
  };

  const formatDateTime = (val: string) => {
    if (!val) return "Sem registro";
    return new Date(val).toLocaleString("pt-BR");
  };

  const stats = [
    { label: "Aguardando", count: kpis.awaitingResponse, icon: Clock, color: "text-amber-400" },
    { label: "Em preenchimento", count: kpis.partial, icon: AlertCircle, color: "text-fuchsia-400" },
    { label: "Respondidos", count: kpis.answered, icon: CheckCircle2, color: "text-emerald-400" },
    { label: "Concluídos", count: kpis.completed, icon: CheckCircle2, color: "text-cyan-400" },
  ];

  return (
    <motion.div
      className="space-y-6 pb-10"
      initial="hidden"
      animate="show"
      variants={{ show: { transition: { staggerChildren: 0.08 } } }}
    >
      <motion.div variants={fadeUp} className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <Button asChild variant="ghost" className="mb-2 -ml-2 text-white/40 hover:text-white">
            <Link to="/admin/briefings">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar ao Painel
            </Link>
          </Button>
          <h1 className="text-2xl font-black tracking-tight text-white">Briefings enviados</h1>
          <p className="text-sm text-white/55">Acompanhe as respostas e o progresso dos briefings enviados.</p>
        </div>
      </motion.div>

      <motion.div variants={fadeUp} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="border-white/10 bg-white/[0.03]">
            <CardContent className="flex items-center gap-4 p-4">
              <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl bg-black/20", s.color)}>
                <s.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-white/30">{s.label}</p>
                <p className="text-xl font-black text-white">{s.count}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      <motion.div variants={fadeUp} className="grid gap-3 md:grid-cols-[1fr_260px]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por título ou cliente..."
            className="border-white/10 bg-white/[0.03] pl-9 text-white"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="border-white/10 bg-white/[0.03] text-white">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os status</SelectItem>
            <SelectItem value="enviado">Aguardando resposta</SelectItem>
            <SelectItem value="em_preenchimento">Em preenchimento</SelectItem>
            <SelectItem value="respondido">Respondido</SelectItem>
            <SelectItem value="concluido">Concluído</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      <motion.div variants={fadeUp} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((b) => (
          <BriefingCard
            key={b.id}
            briefing={b}
            onClick={(briefing) => navigate(`/admin/briefings/enviados/${briefing.id}`)}
            getSentStatusLabel={(s) => briefingStatusMeta[s].label}
            getClientDisplayName={getClientDisplayName}
            formatDateTime={formatDateTime}
          />
        ))}
        {!loading && filtered.length === 0 && (
          <div className="col-span-full rounded-3xl border border-dashed border-white/10 py-20 text-center text-white/30">
            Nenhum briefing enviado encontrado.
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
