import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Filter, 
  MoreHorizontal, 
  Trash2, 
  ArrowRight, 
  Phone, 
  Zap, 
  CheckCircle, 
  XCircle,
  Users
} from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLeads } from "@/features/leads/hooks/useLeads";
import { cn } from "@/lib/utils";
import { DeleteConfirmDialog, useDeleteConfirm } from "@/components/DeleteConfirmDialog";

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  novo: { label: "Novo Lead", color: "text-rose-400", bg: "bg-rose-500/10 border-rose-500/30", icon: Zap },
  em_contato: { label: "Em Contato", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/30", icon: Phone },
  convertido: { label: "Convertido", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/30", icon: CheckCircle },
  perdido: { label: "Perdido", color: "text-gray-400", bg: "bg-gray-500/10 border-gray-500/30", icon: XCircle },
};

export default function LeadsList() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { leads, loading, deleteLead } = useLeads();
  const [busca, setBusca] = useState(searchParams.get("q") || "");
  const [filtroStatus, setFiltroStatus] = useState(searchParams.get("status") || "todos");
  const { requestDelete, dialogProps } = useDeleteConfirm();

  const filtrados = useMemo(() => {
    return leads.filter((lead) => {
      const matchBusca = lead.nome.toLowerCase().includes(busca.toLowerCase()) ||
        lead.email.toLowerCase().includes(busca.toLowerCase()) ||
        lead.whatsapp.includes(busca);
      const matchStatus = filtroStatus === "todos" || lead.status === filtroStatus;
      return matchBusca && matchStatus;
    });
  }, [leads, busca, filtroStatus]);

  const handleDelete = (id: string) => {
    requestDelete(async () => {
      deleteLead(id);
    }, "Excluir Lead", "Tem certeza que deseja remover este lead permanentemente?");
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between glass-card-premium p-4 rounded-3xl">
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-primary transition-colors" />
          <Input
            placeholder="Buscar leads..."
            className="h-11 pl-11 bg-white/5 border-white/5 rounded-2xl text-white focus:ring-1 focus:ring-primary/20"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto">
          {["todos", "novo", "em_contato", "convertido", "perdido"].map(s => (
            <button
              key={s}
              onClick={() => setFiltroStatus(s)}
              className={cn(
                "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border",
                filtroStatus === s
                  ? "bg-primary/10 border-primary/30 text-white"
                  : "bg-white/5 border-white/5 text-white/30 hover:text-white/60"
              )}
            >
              {s === "todos" ? "Todos" : statusConfig[s]?.label.split(" ")[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de Leads */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filtrados.map((lead) => {
            const sc = statusConfig[lead.status] || statusConfig.novo;
            return (
              <motion.div
                key={lead.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="group"
              >
                <Card className={cn(
                  "glass-card-premium h-full transition-all hover:scale-[1.02] cursor-pointer relative overflow-hidden",
                  !lead.visualizado && "border-primary/20 bg-primary/[0.02]"
                )} onClick={() => navigate(`/admin/leads/${lead.id}`)}>
                  <CardContent className="p-8">
                    <div className="flex justify-between items-start mb-6">
                      <Badge variant="outline" className={cn("px-3 py-1 rounded-full uppercase text-[9px] font-black", sc.bg, sc.color)}>
                        {sc.label}
                      </Badge>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDelete(lead.id); }}
                        className="p-2 rounded-xl hover:bg-red-500/10 text-white/10 hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="flex items-center gap-4 mb-6">
                      <div className="h-14 w-14 rounded-2xl bg-white/5 flex items-center justify-center text-xl font-black text-white group-hover:bg-primary/20 transition-all">
                        {lead.nome[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-black text-white truncate group-hover:text-primary transition-colors">{lead.nome}</h3>
                        <p className="text-xs text-white/30 truncate font-medium">{lead.nome_negocio || "Sem empresa definida"}</p>
                      </div>
                    </div>

                    <div className="space-y-3 mb-8">
                       <div className="flex items-center gap-3 text-xs text-white/60">
                         <Phone size={14} className="text-white/20" />
                         {lead.whatsapp}
                       </div>
                       <div className="flex items-center gap-3 text-xs text-white/60">
                         <Users size={14} className="text-white/20" />
                         {lead.segmento || "Não informado"}
                       </div>
                    </div>

                    <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                       <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">
                         {new Date(lead.created_at).toLocaleDateString()}
                       </span>
                       <Button variant="ghost" className="h-9 px-4 text-xs font-black uppercase tracking-widest text-primary group-hover:translate-x-1 transition-all">
                         Ver Perfil <ArrowRight size={14} className="ml-2" />
                       </Button>
                    </div>

                    {!lead.visualizado && (
                      <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(255,51,102,0.5)]" />
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <DeleteConfirmDialog {...dialogProps} />
    </div>
  );
}
