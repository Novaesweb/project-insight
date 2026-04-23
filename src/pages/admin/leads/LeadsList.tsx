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
  novo: { label: "Novo Lead", color: "text-rose-500", bg: "bg-rose-50 border-rose-100", icon: Zap },
  em_contato: { label: "Em Contato", color: "text-amber-600", bg: "bg-amber-50 border-amber-100", icon: Phone },
  convertido: { label: "Convertido", color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-100", icon: CheckCircle },
  perdido: { label: "Perdido", color: "text-slate-400", bg: "bg-slate-50 border-slate-100", icon: XCircle },
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
      <div className="flex flex-col gap-2 px-2">
        <h1 className="text-5xl font-light tracking-tight text-slate-900 md:text-6xl" style={{ fontFamily: "'Playfair Display', serif" }}>
          Fluxo de <span className="text-brand-gradient italic">Leads</span>
        </h1>
        <p className="mt-2 max-w-2xl text-base text-slate-500 leading-relaxed">
          Monitoramento de novas oportunidades e conversão em tempo real.
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between glass-premium p-4 rounded-[32px] border-slate-200">
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-[#EC4899] transition-colors" />
          <Input
            placeholder="Buscar leads..."
            className="h-11 pl-11 bg-white/50 border-slate-100 rounded-2xl text-slate-900 focus:ring-1 focus:ring-[#7C3AED]/20 shadow-sm"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto px-1">
          {["todos", "novo", "em_contato", "convertido", "perdido"].map(s => (
            <button
              key={s}
              onClick={() => setFiltroStatus(s)}
              className={cn(
                "px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border shadow-sm",
                filtroStatus === s
                  ? "bg-brand-gradient border-transparent text-white scale-105"
                  : "bg-white border-slate-100 text-slate-400 hover:text-slate-600 hover:bg-slate-50"
              )}
            >
              {s === "todos" ? "Todos" : statusConfig[s]?.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de Leads */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 px-1">
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
                  "glass-premium h-full transition-all hover:scale-[1.02] cursor-pointer relative overflow-hidden border-slate-200 bg-white/80 shadow-sm",
                  !lead.visualizado && "border-[#7C3AED]/30 bg-[#7C3AED]/[0.02]"
                )} onClick={() => navigate(`/admin/leads/${lead.id}`)}>
                  <CardContent className="p-8">
                    <div className="flex justify-between items-start mb-6">
                      <Badge variant="outline" className={cn("px-3 py-1 rounded-full uppercase text-[9px] font-black tracking-wider", sc.bg, sc.color)}>
                        {sc.label}
                      </Badge>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDelete(lead.id); }}
                        className="p-2 rounded-xl hover:bg-rose-50 text-slate-300 hover:text-rose-500 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="flex items-center gap-4 mb-6">
                      <div className="h-14 w-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-xl font-black text-slate-900 group-hover:bg-brand-gradient group-hover:text-white group-hover:border-transparent transition-all shadow-sm">
                        {lead.nome[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-black text-slate-900 truncate group-hover:text-[#EC4899] transition-colors">{lead.nome}</h3>
                        <p className="text-xs text-slate-400 truncate font-medium">{lead.nome_negocio || "Sem empresa definida"}</p>
                      </div>
                    </div>

                    <div className="space-y-3 mb-8">
                       <div className="flex items-center gap-3 text-xs text-slate-500">
                         <Phone size={14} className="text-slate-300" />
                         {lead.whatsapp}
                       </div>
                       <div className="flex items-center gap-3 text-xs text-slate-500">
                         <Users size={14} className="text-slate-300" />
                         {lead.segmento || "Não informado"}
                       </div>
                    </div>

                    <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                       <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                         {new Date(lead.created_at).toLocaleDateString()}
                       </span>
                       <Button variant="ghost" className="h-9 px-4 text-xs font-black uppercase tracking-widest text-[#7C3AED] group-hover:translate-x-1 transition-all hover:bg-[#7C3AED]/5">
                         Ver Perfil <ArrowRight size={14} className="ml-2" />
                       </Button>
                    </div>

                    {!lead.visualizado && (
                      <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-[#EC4899] animate-pulse shadow-[0_0_10px_rgba(236,72,153,0.5)]" />
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
