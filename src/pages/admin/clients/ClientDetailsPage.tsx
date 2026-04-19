import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  Building, 
  FolderKanban, 
  DollarSign, 
  ShieldCheck, 
  FileText,
  Clock,
  TrendingUp,
  Settings,
  ShieldAlert,
  CreditCard,
  Briefcase
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useClientDetails, useClients } from "@/features/clients/hooks/useClients";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export default function ClientDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { client, stats, loading } = useClientDetails(id);
  const { updateClient } = useClients();

  if (loading || !client) return <div className="h-96 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;

  return (
    <div className="space-y-8 pb-20">
      {/* Navigation Header */}
      <div className="flex items-center justify-between">
        <Button asChild variant="ghost" className="text-white/40 hover:text-white group">
          <Link to="/admin/clientes">
            <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Voltar para Clientes
          </Link>
        </Button>
        <div className="flex gap-3">
           <Button variant="outline" className="border-white/10 text-white/60 hover:text-white hover:bg-white/5">
              <Settings className="mr-2 h-4 w-4" />
              Configurações de Conta
           </Button>
           <Button className="gradient-primary text-white font-black uppercase tracking-widest text-[10px] px-6">
              <PlusIcon className="mr-2 h-4 w-4" />
              Criar Projeto
           </Button>
        </div>
      </div>

      {/* Profile Summary Header */}
      <Card className="glass-card-premium p-8 overflow-hidden relative">
         <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
            <User size={180} />
         </div>
         <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
            <div className="h-28 w-28 rounded-[2.5rem] bg-primary/10 flex items-center justify-center text-4xl font-black text-primary border-2 border-primary/20 shadow-2xl shadow-primary/10">
              {client.nome[0]}
            </div>
            <div className="flex-1 text-center md:text-left">
               <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-2">
                 <h1 className="text-3xl font-black text-white">{client.nome}</h1>
                 <Badge className={cn(
                   "px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest",
                   client.status === "ativo" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-rose-500/10 text-rose-400"
                 )}>
                   {client.status}
                 </Badge>
               </div>
               <p className="text-sm text-white/40 font-medium mb-6 flex items-center justify-center md:justify-start gap-2">
                 <Building size={14} className="text-white/20" />
                 {client.nome_negocio || "Startup / Projeto Pessoal"}
               </p>
               
               <div className="flex flex-wrap justify-center md:justify-start gap-6 pt-6 border-t border-white/5">
                  <StatItem label="Projetos Ativos" value={stats?.activeProjects || 0} icon={FolderKanban} />
                  <StatItem label="Investimento Total" value={`R$ ${stats?.totalSpent?.toLocaleString() || "0"}`} icon={DollarSign} color="text-emerald-400" />
                  <StatItem label="Contratos" value={stats?.contractsCount || 0} icon={ShieldCheck} />
               </div>
            </div>
         </div>
      </Card>

      {/* Content Tabs */}
      <Tabs defaultValue="perfil" className="space-y-8">
         <TabsList className="bg-white/5 border border-white/5 p-1 rounded-2xl h-14 w-fit">
            <TabsTrigger value="perfil" className="rounded-xl px-8 h-full data-[state=active]:bg-white/10 data-[state=active]:text-white font-black uppercase tracking-widest text-[10px]">
              Perfil & Dados
            </TabsTrigger>
            <TabsTrigger value="projetos" className="rounded-xl px-8 h-full data-[state=active]:bg-white/10 data-[state=active]:text-white font-black uppercase tracking-widest text-[10px]">
              Projetos Vinculados
            </TabsTrigger>
            <TabsTrigger value="financeiro" className="rounded-xl px-8 h-full data-[state=active]:bg-white/10 data-[state=active]:text-white font-black uppercase tracking-widest text-[10px]">
              Financeiro
            </TabsTrigger>
            <TabsTrigger value="seguranca" className="rounded-xl px-8 h-full data-[state=active]:bg-white/10 data-[state=active]:text-white font-black uppercase tracking-widest text-[10px]">
              Segurança & Acesso
            </TabsTrigger>
         </TabsList>

         <TabsContent value="perfil" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <Card className="glass-card-premium p-8">
                  <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-8">Informações de Contato</CardTitle>
                  <div className="space-y-6">
                     <DetailItem label="E-mail Principal" value={client.email} icon={Mail} />
                     <DetailItem label="WhatsApp / Telefone" value={client.whatsapp || "Não cadastrado"} icon={Phone} />
                     <DetailItem label="Nome do Negócio" value={client.nome_negocio || "Não informado"} icon={Building} />
                     <DetailItem label="ID do Sistema" value={client.id} icon={ShieldCheck} />
                  </div>
               </Card>

               <Card className="glass-card-premium p-8">
                  <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-8">Resumo de Atividade</CardTitle>
                  <div className="space-y-6">
                     <DetailItem label="Membro desde" value={new Date(client.created_at).toLocaleDateString()} icon={Clock} />
                     <DetailItem label="Total em Projetos" value={`${stats?.projectsCount || 0} projetos criados`} icon={FolderKanban} />
                     <DetailItem label="Saúde da Conta" value={client.status === "ativo" ? "Saudável / Ativo" : "Bloqueado"} icon={TrendingUp} />
                  </div>
               </Card>
            </div>
         </TabsContent>

         <TabsContent value="projetos">
            <Card className="glass-card-premium p-10 flex flex-col items-center justify-center min-h-[400px] text-center">
               <div className="p-6 rounded-3xl bg-white/5 mb-6">
                 <FolderKanban className="w-12 h-12 text-white/10" />
               </div>
               <h3 className="text-xl font-black text-white">Projetos do Cliente</h3>
               <p className="text-sm text-white/40 max-w-sm mt-2">
                 Em breve você poderá visualizar e gerenciar os projetos deste cliente diretamente por aqui.
               </p>
               <Button asChild variant="outline" className="mt-8 border-white/10 text-white/60">
                  <Link to={`/admin/projetos?client=${client.id}`}>Ver no Módulo de Projetos</Link>
               </Button>
            </Card>
         </TabsContent>

         <TabsContent value="financeiro">
            <Card className="glass-card-premium p-10">
               <div className="flex items-center justify-between mb-10">
                  <div>
                     <h3 className="text-xl font-black text-white">Histórico de Faturamento</h3>
                     <p className="text-sm text-white/40">Faturas, pagamentos e cobranças pendentes.</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                     <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-1">Total Pago</p>
                     <p className="text-2xl font-black text-white">R$ {stats?.totalSpent?.toLocaleString()}</p>
                  </div>
               </div>
               <div className="h-40 border-2 border-dashed border-white/5 rounded-[2.5rem] flex items-center justify-center text-white/10 font-black uppercase tracking-widest text-xs">
                  Sem faturas registradas no momento
               </div>
            </Card>
         </TabsContent>

         <TabsContent value="seguranca">
            <Card className="glass-card-premium p-8">
               <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-400 mb-8">Zona de Risco</CardTitle>
               <div className="p-6 rounded-3xl bg-rose-500/5 border border-rose-500/10 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                     <div className="p-3 rounded-2xl bg-rose-500/10">
                        <ShieldAlert className="text-rose-400 w-6 h-6" />
                     </div>
                     <div>
                        <p className="text-sm font-bold text-white">Redefinir Senha do Cliente</p>
                        <p className="text-xs text-white/40">Isso enviará um e-mail de redefinição para o endereço cadastrado.</p>
                     </div>
                  </div>
                  <Button variant="outline" className="border-rose-500/20 text-rose-400 hover:bg-rose-500/10">Enviar E-mail</Button>
               </div>
            </Card>
         </TabsContent>
      </Tabs>
    </div>
  );
}

function StatItem({ label, value, icon: Icon, color = "text-white" }: { label: string; value: string | number; icon: any; color?: string }) {
  return (
    <div className="flex items-center gap-4">
      <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
        <Icon size={18} className="text-white/20" />
      </div>
      <div>
        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20 leading-none mb-1">{label}</p>
        <p className={cn("text-lg font-black leading-none", color)}>{value}</p>
      </div>
    </div>
  );
}

function DetailItem({ label, value, icon: Icon }: { label: string; value: string; icon: any }) {
  return (
    <div className="flex items-center gap-4">
      <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-white/20" />
      </div>
      <div className="min-w-0">
        <p className="text-[9px] font-black uppercase tracking-widest text-white/20 mb-0.5">{label}</p>
        <p className="text-sm font-bold text-white truncate">{value}</p>
      </div>
    </div>
  );
}

function PlusIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}
