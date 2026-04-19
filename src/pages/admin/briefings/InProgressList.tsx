import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Search, 
  Plus, 
  ArrowLeft,
  Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useBriefings } from "@/features/briefings/hooks/useBriefings";
import { BriefingCard } from "@/features/briefings/components/BriefingCard";
import { briefingStatusMeta } from "@/lib/project-briefings";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function InProgressList() {
  const navigate = useNavigate();
  const { draftBriefings, clients, loading } = useBriefings();
  const [search, setSearch] = useState("");
  const [clientFilter, setClientFilter] = useState("todos");

  const filtered = useMemo(() => {
    return draftBriefings.filter((b) => {
      const matchesSearch = b.titulo.toLowerCase().includes(search.toLowerCase()) ||
        (b.clientes && !Array.isArray(b.clientes) && b.clientes.nome.toLowerCase().includes(search.toLowerCase()));
      const matchesClient = clientFilter === "todos" || b.cliente_id === clientFilter;
      return matchesSearch && matchesClient;
    });
  }, [draftBriefings, search, clientFilter]);

  const getClientDisplayName = (client: any) => {
    if (!client) return "Cliente não encontrado";
    const val = Array.isArray(client) ? client[0] : client;
    return val?.nome_empresa?.trim() || val?.nome?.trim() || "Cliente não encontrado";
  };

  const formatDateTime = (val: string) => {
    if (!val) return "Sem registro";
    return new Date(val).toLocaleString("pt-BR");
  };

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
          <h1 className="text-2xl font-black tracking-tight text-white">Briefings em andamento</h1>
          <p className="text-sm text-white/55">Monte e prepare os briefings antes do envio ao cliente.</p>
        </div>

        <Button asChild className="border-0 text-white" style={{ background: "var(--gradient-primary)" }}>
          <Link to="/admin/briefings/em-andamento/novo">
            <Plus className="mr-2 h-4 w-4" />
            Novo Briefing
          </Link>
        </Button>
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
        <Select value={clientFilter} onValueChange={setClientFilter}>
          <SelectTrigger className="border-white/10 bg-white/[0.03] text-white">
            <SelectValue placeholder="Filtrar por cliente" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os clientes</SelectItem>
            {clients.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.nome_empresa || c.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </motion.div>

      <motion.div variants={fadeUp} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((b) => (
          <BriefingCard
            key={b.id}
            briefing={b}
            onClick={(briefing) => navigate(`/admin/briefings/em-andamento/${briefing.id}`)}
            getSentStatusLabel={(s) => briefingStatusMeta[s].label}
            getClientDisplayName={getClientDisplayName}
            formatDateTime={formatDateTime}
          />
        ))}
        {!loading && filtered.length === 0 && (
          <div className="col-span-full rounded-3xl border border-dashed border-white/10 py-20 text-center text-white/30">
            Nenhum briefing em construção encontrado.
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
