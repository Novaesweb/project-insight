import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useNavigate } from "react-router-dom";
import {
  Search, UserPlus, Phone, Eye, MessageCircle,
  CheckCircle, Clock, XCircle, Users, Trash2,
  Calendar, Building, Target, Zap, Layout,
  ArrowRight, Filter, MoreHorizontal, Sparkles
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

// --- Variantes de Animação ---
const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

type Lead = {
  id: string; nome: string; email: string; whatsapp: string; cidade: string | null; estado: string | null;
  documento: string | null; nome_negocio: string | null; segmento: string | null; servicos: string[];
  orcamento: string | null; como_conheceu: string | null; mensagem: string | null; status: string;
  motivo_perda: string | null; visualizado: boolean; created_at: string; updated_at: string;
};

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  novo: { label: "Novo Lead", color: "text-rose-400", bg: "bg-rose-500/10 border-rose-500/30", icon: Zap },
  em_contato: { label: "Em Contato", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/30", icon: Phone },
  convertido: { label: "Convertido", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/30", icon: CheckCircle },
  perdido: { label: "Perdido", color: "text-gray-400", bg: "bg-gray-500/10 border-gray-500/30", icon: XCircle },
};

export default function Leads() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [convertModal, setConvertModal] = useState<Lead | null>(null);
  const [convertForm, setConvertForm] = useState({ senha: "" });
  const [criarAcesso, setCriarAcesso] = useState(true);
  const [motivoPerda, setMotivoPerda] = useState("");
  const [perdaModal, setPerdaModal] = useState<Lead | null>(null);
  const [converting, setConverting] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  const fetchLeads = async () => {
    const { data } = await supabase.from("leads").select("*").order("created_at", { ascending: false });
    if (data) setLeads(data as Lead[]);
  };

  useEffect(() => {
    fetchLeads();
    const channel = supabase.channel("leads-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "leads" }, () => fetchLeads())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const updateStatus = async (lead: Lead, status: string, extra?: Record<string, unknown>) => {
    await supabase.from("leads").update({ status, visualizado: true, ...extra }).eq("id", lead.id);
    toast({ title: `Lead atualizado para ${statusConfig[status]?.label || status}` });
    fetchLeads();
    setSelectedLead(null);
  };

  const handleDelete = async (leadId: string) => {
    if (!confirm("Excluir este lead permanentemente?")) return;
    const { error } = await supabase.from("leads").delete().eq("id", leadId);
    if (!error) {
      toast({ title: "Lead excluído" });
      fetchLeads();
    }
  };

  const handleConvert = async () => {
    if (!convertModal) return;
    setConverting(true);
    try {
      const avatar = convertModal.nome.split(" ").map(w => w[0]).join("").toUpperCase();
      const { data: cliente, error: cliError } = await supabase.from("clientes").insert({
        nome: convertModal.nome,
        email: convertModal.email,
        telefone: convertModal.whatsapp,
        status: "ativo",
        avatar: avatar.slice(0, 2),
        senha: criarAcesso ? convertForm.senha : null
      }).select().single();

      if (cliError) throw cliError;

      await updateStatus(convertModal, "convertido");
      
      toast({ title: "💎 Cliente Criado!", description: "Redirecionando para o perfil..." });
      
      setTimeout(() => {
        navigate("/admin/clientes", { state: { selectedId: cliente.id } });
      }, 1500);

      setConvertModal(null);
      setConvertForm({ senha: "" });
    } catch (error: any) {
      toast({ title: "Erro na conversão", description: error.message, variant: "destructive" });
    } finally {
      setConverting(false);
    }
  };

  const filtrados = leads.filter(l => {
    const matchBusca = l.nome.toLowerCase().includes(busca.toLowerCase()) ||
      l.email.toLowerCase().includes(busca.toLowerCase()) ||
      l.whatsapp.includes(busca);
    const matchStatus = filtroStatus === "todos" || l.status === filtroStatus;
    return matchBusca && matchStatus;
  });

  return (
    <div className="space-y-8 pb-20">
      {/* Header Interativo */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white/[0.02] p-6 rounded-[2rem] border border-white/5 shadow-2xl overflow-hidden relative">
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center shadow-lg shadow-primary/20">
            <Users className="text-white w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">Gestão de Leads</h1>
            <p className="text-sm text-white/40 font-medium">Você tem {filtrados.length} oportunidades filtradas</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 relative z-10">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-primary transition-colors" />
            <Input
              placeholder="Buscar por nome ou contato..."
              className="h-12 pl-11 pr-6 bg-white/5 border-white/5 rounded-xl w-full sm:w-80 text-white font-medium focus:ring-1 focus:ring-primary/30 transition-all"
              value={busca}
              onChange={e => setBusca(e.target.value)}
            />
          </div>

          <div className="h-10 w-px bg-white/10 mx-2 hidden lg:block" />

          <div className="flex gap-1 p-1 bg-white/5 rounded-xl border border-white/5">
            {["todos", "novo", "em_contato", "convertido", "perdido"].map(s => (
              <button
                key={s}
                onClick={() => setFiltroStatus(s)}
                className={cn(
                  "px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all",
                  filtroStatus === s
                    ? "bg-white/10 text-white shadow-inner"
                    : "text-white/30 hover:text-white/60 hover:bg-white/[0.02]"
                )}
              >
                {s === "todos" ? "Tudo" : statusConfig[s]?.label.split(" ")[0]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid de Leads Premium */}
      <AnimatePresence mode="wait">
        <motion.div
          key={filtroStatus + busca}
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
        >
          {filtrados.map(lead => {
            const sc = statusConfig[lead.status] || statusConfig.novo;
            return (
              <motion.div
                key={lead.id}
                variants={item}
                whileHover={{ y: -5 }}
                className="group h-full"
                onClick={() => setSelectedLead(lead)}
              >
                <div className={cn(
                  "glass-panel-premium h-full p-8 rounded-[2.5rem] border border-white/5 transition-all cursor-pointer relative overflow-hidden group-hover:border-primary/20",
                  !lead.visualizado && "bg-primary/[0.03] border-primary/20"
                )}>
                  {/* Status & Data */}
                  <div className="flex items-center justify-between mb-8">
                    <Badge variant="outline" className={cn("px-4 py-1.5 rounded-full border-[0.5px] uppercase tracking-tighter font-black text-[10px]", sc.bg, sc.color)}>
                      <sc.icon className="w-3 h-3 mr-2" />
                      {sc.label}
                    </Badge>
                    <span className="text-[10px] text-white/20 font-black uppercase tracking-widest flex items-center gap-2">
                      {new Date(lead.created_at).toLocaleDateString("pt-BR")}
                    </span>
                  </div>

                  {/* Nome & Avatar */}
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center text-2xl font-black text-white group-hover:gradient-primary transition-all shadow-inner">
                      {lead.nome[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-black text-white truncate leading-tight group-hover:text-primary transition-colors">{lead.nome}</h3>
                      <p className="text-sm text-white/30 font-medium truncate">{lead.email}</p>
                    </div>
                  </div>

                  <div className="space-y-4 mb-8">
                    <div className="flex items-center gap-3 text-white/60 text-sm font-medium">
                      <div className="w-8 h-8 rounded-xl bg-white/[0.02] flex items-center justify-center text-white/20">
                        <Phone className="w-4 h-4" />
                      </div>
                      {lead.whatsapp}
                    </div>
                    <div className="flex items-center gap-3 text-white/60 text-sm font-medium">
                      <div className="w-8 h-8 rounded-xl bg-white/[0.02] flex items-center justify-center text-white/20">
                        <Building className="w-4 h-4" />
                      </div>
                      {lead.nome_negocio || "Startup/Pessoa Física"}
                    </div>
                    <div className="flex items-center gap-3 text-primary text-sm font-bold">
                      <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Zap className="w-4 h-4" />
                      </div>
                      {lead.orcamento || "Ticket a definir"}
                    </div>
                  </div>

                  {/* Footer Card */}
                  <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                    <div className="flex -space-x-2">
                      {lead.servicos?.slice(0, 3).map((s, idx) => (
                        <div key={idx} className="w-8 h-8 rounded-full border border-black bg-white/10 flex items-center justify-center text-[10px] text-white font-black" title={s}>
                          {s[0]}
                        </div>
                      ))}
                    </div>
                    <Button variant="ghost" className="h-10 px-4 rounded-xl text-xs font-black uppercase tracking-widest text-primary hover:bg-primary/10 group-hover:translate-x-1 transition-all">
                      Detalhes <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </div>

                  {!lead.visualizado && (
                    <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-primary shadow-[0_0_10px_rgba(255,51,102,1)]" />
                  )}
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      </AnimatePresence>

      {filtrados.length === 0 && (
        <div className="flex flex-col items-center justify-center py-40 glass-panel-premium rounded-[3rem] border-white/5">
          <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center mb-6">
            <Filter className="w-10 h-10 text-white/10" />
          </div>
          <h3 className="text-xl font-black text-white mb-2">Sem resultados encontrados</h3>
          <p className="text-white/30 text-sm font-medium">Tente alterar seu termo de busca ou filtros.</p>
        </div>
      )}

      {/* Profile Detail Sheet */}
      <Sheet open={!!selectedLead} onOpenChange={() => setSelectedLead(null)}>
        <SheetContent className="glass-card border-l-white/5 w-full sm:max-w-xl p-0 overflow-y-auto">
          {selectedLead && (
            <div className="flex flex-col min-h-full">
              {/* Header Hero */}
              <div className="p-10 gradient-primary relative overflow-hidden">
                <div className="absolute inset-0 opacity-20 pointer-events-none">
                  <Layout className="w-96 h-96 -right-20 -bottom-20 absolute" />
                </div>

                <div className="relative z-10">
                  <div className="w-24 h-24 rounded-[2rem] bg-white/20 backdrop-blur-3xl flex items-center justify-center text-4xl font-black text-white mb-6 border border-white/20 shadow-2xl">
                    {selectedLead.nome[0]}
                  </div>
                  <h2 className="text-3xl font-black text-white tracking-tighter mb-2">{selectedLead.nome}</h2>
                  <div className="flex flex-wrap gap-3">
                    <Badge className="bg-white/20 text-white border-0 py-1.5 px-4 rounded-full font-black uppercase tracking-widest text-[9px]">
                      {statusConfig[selectedLead.status]?.label}
                    </Badge>
                    <Badge className="bg-black/20 text-white border-0 py-1.5 px-4 rounded-full font-black uppercase tracking-widest text-[9px] flex items-center gap-2">
                      <Calendar className="w-3 h-3" />
                      {new Date(selectedLead.created_at).toLocaleDateString()}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Action Bar Quick */}
              <div className="px-10 py-6 grid grid-cols-2 gap-4 border-b border-white/5 bg-white/[0.02]">
                <Button
                  onClick={() => window.open(`https://wa.me/${selectedLead.whatsapp.replace(/\D/g, "")}`, "_blank")}
                  className="bg-[#25D366] hover:bg-[#20bd5a] text-white font-black uppercase tracking-widest text-[10px] h-12 rounded-xl"
                >
                  <MessageCircle className="w-4 h-4 mr-2" /> WhatsApp
                </Button>
                <Button
                  onClick={() => { setConvertModal(selectedLead); setSelectedLead(null); }}
                  className="gradient-primary text-white font-black uppercase tracking-widest text-[10px] h-12 rounded-xl"
                >
                  <UserPlus className="w-4 h-4 mr-2" /> Converter
                </Button>
              </div>

              {/* Content Sections */}
              <div className="p-10 space-y-12">
                <div className="grid grid-cols-2 gap-10">
                  <div>
                    <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-4 block">Informações Gerais</Label>
                    <div className="space-y-6">
                      <InfoBlock label="Email" value={selectedLead.email} />
                      <InfoBlock label="Telefone" value={selectedLead.whatsapp} />
                      <InfoBlock label="Cidade/UF" value={`${selectedLead.cidade || "—"}/${selectedLead.estado || "—"}`} />
                    </div>
                  </div>
                  <div>
                    <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-4 block">Projeto & Negócio</Label>
                    <div className="space-y-6">
                      <InfoBlock label="Empresa" value={selectedLead.nome_negocio || "—"} />
                      <InfoBlock label="Segmento" value={selectedLead.segmento || "—"} />
                      <InfoBlock label="Investimento" value={selectedLead.orcamento || "—"} />
                    </div>
                  </div>
                </div>

                {selectedLead.mensagem && (
                  <div>
                    <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-4 block">Briefing / Mensagem</Label>
                    <div className="p-8 rounded-[2rem] bg-white/[0.03] border border-white/5 text-white/80 text-lg leading-relaxed font-medium italic">
                      "{selectedLead.mensagem}"
                    </div>
                  </div>
                )}

                <div>
                  <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-4 block">Status da Oportunidade</Label>
                  <div className="flex gap-2 flex-wrap">
                    {Object.keys(statusConfig).map(s => (
                      <button
                        key={s}
                        onClick={() => updateStatus(selectedLead, s)}
                        className={cn(
                          "px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border",
                          selectedLead.status === s
                            ? statusConfig[s].bg + " " + statusConfig[s].color
                            : "bg-white/5 border-white/5 text-white/20 hover:text-white/40"
                        )}
                      >
                        {statusConfig[s].label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-10 flex border-t border-white/5">
                  <Button
                    variant="ghost"
                    className="text-red-500/40 hover:text-red-500 hover:bg-red-500/10 font-black uppercase tracking-widest text-[10px] h-12 px-8 rounded-xl ml-auto"
                    onClick={() => handleDelete(selectedLead.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" /> Excluir Lead Permanentemente
                  </Button>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Convert Dialog - Estilo Premium */}
      <Dialog open={!!convertModal} onOpenChange={() => setConvertModal(null)}>
        <DialogContent className="glass-card border-white/5 rounded-[3rem] p-10 max-w-lg overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
            <Sparkles className="w-40 h-40 text-primary animate-pulse" />
          </div>
          
          <DialogHeader className="mb-8 relative z-10">
            <DialogTitle className="text-3xl font-black text-white tracking-tighter flex items-center gap-3">
              <Zap className="w-8 h-8 text-primary" /> Virar Cliente
            </DialogTitle>
            <p className="text-white/40 font-medium">Capture esta oportunidade para o seu time de sucesso.</p>
          </DialogHeader>

          {convertModal && (
            <div className="space-y-8 relative z-10">
              <div className="p-6 rounded-3xl bg-white/5 border border-white/5 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary font-black text-xl">
                    {convertModal.nome[0]}
                  </div>
                  <div>
                    <p className="text-xs font-black text-white/30 uppercase tracking-widest">Lead Selecionado</p>
                    <p className="text-lg font-bold text-white">{convertModal.nome}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-2">Defina uma senha de acesso</Label>
                <Input 
                  type="text" 
                  placeholder="Mín. 6 dígitos (ex: 123456)"
                  className="h-14 bg-white/5 border-white/10 rounded-2xl text-xl font-bold text-white px-6 focus:ring-primary/40 focus:border-primary/40 transition-all"
                  value={convertForm.senha}
                  onChange={e => setConvertForm({...convertForm, senha: e.target.value})}
                />
              </div>

              <div className="p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <p className="text-[11px] text-emerald-500/80 font-bold leading-relaxed">
                  Ao confirmar, o lead será migrado para a base de clientes e você poderá configurar o briefing completo.
                </p>
              </div>

              <div className="flex gap-4 p-2 bg-black/20 rounded-[2rem] border border-white/5">
                <Button variant="ghost" className="h-14 px-8 text-white/40 hover:text-white font-black uppercase tracking-widest text-xs" onClick={() => setConvertModal(null)}>Voltar</Button>
                <Button 
                  className="flex-1 h-14 rounded-2xl gradient-primary text-white font-black uppercase tracking-widest text-sm shadow-xl shadow-primary/20" 
                  onClick={handleConvert}
                  disabled={converting || convertForm.senha.length < 6}
                >
                  {converting ? "Migrando..." : "Confirmar Conversão"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[9px] font-black uppercase tracking-widest text-white/20 mb-1">{label}</p>
      <p className="text-base text-white font-bold leading-snug">{value}</p>
    </div>
  );
}


