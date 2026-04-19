import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  UserPlus, 
  MoreHorizontal, 
  Mail, 
  Phone, 
  ArrowRight,
  ShieldCheck,
  Building,
  Filter
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useClients } from "@/features/clients/hooks/useClients";
import { cn } from "@/lib/utils";

export default function ClientsList() {
  const navigate = useNavigate();
  const { clients, loading } = useClients();
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("todos");

  const filtrados = useMemo(() => {
    return clients.filter((client) => {
      const matchBusca = client.nome.toLowerCase().includes(busca.toLowerCase()) ||
        client.email.toLowerCase().includes(busca.toLowerCase()) ||
        (client.nome_negocio && client.nome_negocio.toLowerCase().includes(busca.toLowerCase()));
      const matchStatus = filtroStatus === "todos" || client.status === filtroStatus;
      return matchBusca && matchStatus;
    });
  }, [clients, busca, filtroStatus]);

  return (
    <div className="space-y-8 pb-20">
      {/* Header Premium */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-white">Base de Clientes</h1>
          <p className="max-w-2xl text-sm text-white/55 mt-1">
            Gerenciamento centralizado de contas, acessos e faturamento.
          </p>
        </div>
        <Button className="gradient-primary text-white font-black uppercase tracking-widest text-[10px] px-6 h-12 rounded-2xl shadow-lg shadow-primary/20">
          <UserPlus className="mr-2 h-4 w-4" />
          Novo Cliente
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between glass-card-premium p-4 rounded-3xl">
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-primary transition-colors" />
          <Input
            placeholder="Nome, e-mail ou empresa..."
            className="h-11 pl-11 bg-white/5 border-white/5 rounded-2xl text-white focus:ring-1 focus:ring-primary/20"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          {["todos", "ativo", "inativo", "bloqueado"].map(s => (
            <button
              key={s}
              onClick={() => setFiltroStatus(s)}
              className={cn(
                "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border",
                filtroStatus === s
                  ? "bg-primary/10 border-primary/30 text-white"
                  : "bg-white/5 border-white/5 text-white/30 hover:text-white/60"
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de Clientes */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filtrados.map((client) => (
            <motion.div
              key={client.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <Card 
                className="glass-card-premium h-full transition-all hover:scale-[1.02] cursor-pointer group"
                onClick={() => navigate(`/admin/clientes/${client.id}`)}
              >
                <CardContent className="p-8">
                  <div className="flex justify-between items-start mb-6">
                    <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-2xl font-black text-primary border border-primary/20 shadow-xl shadow-primary/5 group-hover:bg-primary/20 transition-all">
                      {client.nome[0]}
                    </div>
                    <Badge variant="outline" className={cn(
                      "px-3 py-1 rounded-full text-[9px] font-black uppercase",
                      client.status === "ativo" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" : "bg-rose-500/10 text-rose-400 border-rose-500/30"
                    )}>
                      {client.status}
                    </Badge>
                  </div>

                  <div className="space-y-1 mb-6">
                    <h3 className="text-xl font-black text-white truncate group-hover:text-primary transition-colors">{client.nome}</h3>
                    <div className="flex items-center gap-2 text-xs text-white/40 font-medium">
                      <Building size={14} />
                      {client.nome_negocio || "Startup / Sem Empresa"}
                    </div>
                  </div>

                  <div className="space-y-3 pt-6 border-t border-white/5 mb-8">
                     <div className="flex items-center gap-3 text-xs text-white/60">
                       <Mail size={14} className="text-white/20" />
                       {client.email}
                     </div>
                     <div className="flex items-center gap-3 text-xs text-white/60">
                       <Phone size={14} className="text-white/20" />
                       {client.whatsapp || "N/A"}
                     </div>
                  </div>

                  <div className="flex items-center justify-between">
                     <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">
                       Membro desde {new Date(client.created_at).getFullYear()}
                     </span>
                     <Button variant="ghost" className="h-9 px-4 text-xs font-black uppercase tracking-widest text-primary group-hover:translate-x-1 transition-all">
                       Ver Perfil <ArrowRight size={14} className="ml-2" />
                     </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
