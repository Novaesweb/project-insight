import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  Phone, 
  Mail, 
  MapPin, 
  Building, 
  Briefcase, 
  Zap, 
  CheckCircle, 
  XCircle,
  MessageSquare,
  Sparkles,
  Calendar,
  UserPlus,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { leadService, Lead, LeadStatus } from "@/features/leads/services/lead-service";
import { useLeads } from "@/features/leads/hooks/useLeads";
import { useClients } from "@/features/clients/hooks/useClients";
import InternalNotes from "@/components/InternalNotes";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  novo: { label: "Novo Lead", color: "text-rose-400", bg: "bg-rose-500/10 border-rose-500/30", icon: Zap },
  em_contato: { label: "Em Contato", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/30", icon: Phone },
  convertido: { label: "Convertido", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/30", icon: CheckCircle },
  perdido: { label: "Perdido", color: "text-gray-400", bg: "bg-gray-500/10 border-gray-500/30", icon: XCircle },
};

export default function LeadDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [isConverting, setIsConverting] = useState(false);
  const { updateStatus } = useLeads();
  const { createClientAsync } = useClients();

  useEffect(() => {
    const loadLead = async () => {
      if (!id) return;
      try {
        const data = await leadService.getById(id);
        setLead(data);
        // Mark as viewed if new
        if (!data.visualizado) {
          await leadService.updateStatus(id, data.status);
        }
      } catch (error) {
        toast({ title: "Erro ao carregar lead", variant: "destructive" });
        navigate("/admin/leads/lista");
      } finally {
        setLoading(false);
      }
    };
    loadLead();
  }, [id, navigate, toast]);

  if (loading || !lead) return <div className="h-96 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;

  const sc = statusConfig[lead.status] || statusConfig.novo;

  const handleConvertToClient = async () => {
    if (!lead || isConverting) return;
    
    setIsConverting(true);
    try {
      // 1. Create client from lead data
      const created = await createClientAsync({
        nome: lead.nome,
        email: lead.email,
        whatsapp: lead.whatsapp,
        telefone: lead.whatsapp,
        documento: lead.documento,
        nome_empresa: lead.nome_negocio,
        cidade: lead.cidade,
        estado: lead.estado,
        status: "ativo"
      });

      // 2. Update lead status to converted
      await updateStatus({ 
        id: lead.id, 
        status: "convertido",
        extra: { visualizado: true }
      });

      toast({
        title: "Lead convertido com sucesso!",
        description: `${lead.nome} agora e um cliente oficial.`
      });

      // 3. Redirect to the new client profile
      navigate(`/admin/clientes/${created.id}`);
    } catch (error: any) {
      toast({
        title: "Erro na conversao",
        description: error.message || "Nao foi possivel converter o lead.",
        variant: "destructive"
      });
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Navigation Header */}
      <div className="flex items-center justify-between">
        <Button asChild variant="ghost" className="text-white/40 hover:text-white group">
          <Link to="/admin/leads/lista">
            <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Voltar para Lista
          </Link>
        </Button>
        <div className="flex gap-3">
           <Button variant="outline" className="border-white/10 text-white/60 hover:text-red-400 hover:bg-red-500/10">
              <Trash2 className="mr-2 h-4 w-4" />
              Excluir
           </Button>
           <Button 
             className="gradient-primary text-white font-black uppercase tracking-widest text-[10px] px-6"
             onClick={() => void handleConvertToClient()}
             disabled={isConverting || lead.status === "convertido"}
           >
              <UserPlus className="mr-2 h-4 w-4" />
              {isConverting ? "Convertendo..." : lead.status === "convertido" ? "Lead Convertido" : "Converter Cliente"}
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Sidebar: Profile Summary */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="glass-card-premium p-8 flex flex-col items-center text-center">
             <div className="h-24 w-24 rounded-3xl bg-primary/10 flex items-center justify-center text-4xl font-black text-primary border border-primary/20 mb-6 shadow-2xl shadow-primary/10">
               {lead.nome[0]}
             </div>
             <h2 className="text-2xl font-black text-white mb-1">{lead.nome}</h2>
             <p className="text-sm text-white/40 font-medium mb-6">{lead.nome_negocio || "Startup / Projeto Pessoal"}</p>
             
             <Badge variant="outline" className={cn("px-6 py-2 rounded-full font-black uppercase tracking-widest text-[10px] mb-8", sc.bg, sc.color)}>
               <sc.icon className="w-3.5 h-3.5 mr-2" />
               {sc.label}
             </Badge>

             <div className="w-full space-y-3 pt-6 border-t border-white/5">
                <Button className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-black uppercase tracking-widest text-[10px]" 
                  onClick={() => window.open(`https://wa.me/${lead.whatsapp.replace(/\D/g, "")}`, "_blank")}>
                  <Phone className="mr-2 h-4 w-4" /> Chamar no WhatsApp
                </Button>
                <Button variant="outline" className="w-full border-white/10 text-white/60"
                  onClick={() => window.location.href = `mailto:${lead.email}`}>
                  <Mail className="mr-2 h-4 w-4" /> Enviar E-mail
                </Button>
             </div>
          </Card>

          <Card className="glass-card-premium p-6">
             <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-6 px-2">Alterar Status</CardTitle>
             <div className="grid grid-cols-1 gap-2">
                {Object.keys(statusConfig).map(s => (
                  <button
                    key={s}
                    onClick={() => {
                      updateStatus({ id: lead.id, status: s as LeadStatus });
                      setLead({...lead, status: s as LeadStatus});
                    }}
                    className={cn(
                      "flex items-center justify-between px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all",
                      lead.status === s ? statusConfig[s].bg + " " + statusConfig[s].color : "bg-white/5 border-white/5 text-white/20 hover:text-white/40 hover:bg-white/10"
                    )}
                  >
                    {statusConfig[s].label}
                    {lead.status === s && <CheckCircle className="w-3.5 h-3.5" />}
                  </button>
                ))}
             </div>
          </Card>
        </div>

        {/* Main Content: Tabs */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="info" className="space-y-6">
            <TabsList className="bg-white/5 border border-white/5 p-1 rounded-2xl h-14">
              <TabsTrigger value="info" className="rounded-xl px-8 h-full data-[state=active]:bg-white/10 data-[state=active]:text-white font-black uppercase tracking-widest text-[10px]">
                Informações
              </TabsTrigger>
              <TabsTrigger value="briefing" className="rounded-xl px-8 h-full data-[state=active]:bg-white/10 data-[state=active]:text-white font-black uppercase tracking-widest text-[10px]">
                Briefing / Mensagem
              </TabsTrigger>
              <TabsTrigger value="notes" className="rounded-xl px-8 h-full data-[state=active]:bg-white/10 data-[state=active]:text-white font-black uppercase tracking-widest text-[10px]">
                Notas Internas
              </TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="space-y-6 focus-visible:outline-none">
              <Card className="glass-card-premium p-8">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <InfoSection title="Contato">
                       <InfoItem icon={Mail} label="E-mail principal" value={lead.email} />
                       <InfoItem icon={Phone} label="WhatsApp" value={lead.whatsapp} />
                       <InfoItem icon={MapPin} label="Localização" value={`${lead.cidade || "—"}/${lead.estado || "—"}`} />
                    </InfoSection>

                    <InfoSection title="Perfil do Negócio">
                       <InfoItem icon={Building} label="Nome do Negócio" value={lead.nome_negocio || "Startup / Individual"} />
                       <InfoItem icon={Briefcase} label="Segmento" value={lead.segmento || "—"} />
                       <InfoItem icon={Sparkles} label="Como Conheceu" value={lead.como_conheceu || "—"} />
                    </InfoSection>

                    <InfoSection title="Necessidades">
                       <InfoItem icon={Zap} label="Investimento Estimado" value={lead.orcamento || "Não informado"} color="text-primary" />
                       <div className="pt-2">
                          <p className="text-[9px] font-black uppercase tracking-widest text-white/20 mb-3">Serviços Interessados</p>
                          <div className="flex flex-wrap gap-2">
                            {lead.servicos?.length > 0 ? lead.servicos.map(s => (
                              <Badge key={s} className="bg-white/5 border-white/10 text-white/70 font-bold px-3 py-1">
                                {s}
                              </Badge>
                            )) : <span className="text-xs text-white/20 italic">Nenhum serviço selecionado</span>}
                          </div>
                       </div>
                    </InfoSection>

                    <InfoSection title="Datas">
                       <InfoItem icon={Calendar} label="Capturado em" value={new Date(lead.created_at).toLocaleString()} />
                       <InfoItem icon={Calendar} label="Última atualização" value={new Date(lead.updated_at).toLocaleString()} />
                    </InfoSection>
                 </div>
              </Card>
            </TabsContent>

            <TabsContent value="briefing" className="space-y-6 focus-visible:outline-none">
              <Card className="glass-card-premium p-10">
                 <div className="flex items-center gap-3 mb-8">
                   <div className="p-3 rounded-2xl bg-primary/10">
                     <MessageSquare className="text-primary w-6 h-6" />
                   </div>
                   <h3 className="text-xl font-black text-white">Mensagem de Entrada</h3>
                 </div>
                 <div className="p-8 rounded-[2.5rem] bg-white/[0.03] border border-white/5 text-xl leading-relaxed text-white/80 font-medium italic relative">
                    <span className="absolute -top-4 -left-2 text-6xl text-primary/10 font-serif">"</span>
                    {lead.mensagem || "O lead não enviou uma mensagem inicial detalhada."}
                    <span className="absolute -bottom-10 -right-2 text-6xl text-primary/10 font-serif">"</span>
                 </div>
              </Card>
            </TabsContent>

            <TabsContent value="notes" className="space-y-6 focus-visible:outline-none">
              <Card className="glass-card-premium p-8">
                <InternalNotes entityType="lead" entityId={lead.id} />
              </Card>
            </TabsContent>
          </Tabs>
        </div>

      </div>
    </div>
  );
}

function InfoSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-primary/60 border-b border-primary/10 pb-2">{title}</h4>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function InfoItem({ icon: Icon, label, value, color = "text-white/80" }: { icon: any; label: string; value: string; color?: string }) {
  return (
    <div className="flex items-start gap-4">
      <div className="h-9 w-9 rounded-xl bg-white/5 flex items-center justify-center shrink-0 border border-white/5">
        <Icon className="w-4 h-4 text-white/20" />
      </div>
      <div className="min-w-0">
        <p className="text-[9px] font-black uppercase tracking-widest text-white/20 mb-0.5">{label}</p>
        <p className={cn("text-sm font-bold truncate", color)}>{value}</p>
      </div>
    </div>
  );
}
