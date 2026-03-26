import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Users, DollarSign, Wallet, ArrowUpRight, 
  Copy, Check, Share2, TrendingUp, Clock,
  ExternalLink, UserPlus, Gift
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function ResellerDashboard() {
  const { toast } = useToast();
  const [reseller, setReseller] = useState<any>(JSON.parse(localStorage.getItem("revendedorLogado") || "{}"));
  const [stats, setStats] = useState({
    totalIndicated: 0,
    activeClients: 0,
    balance: 0,
    pendingCommissions: 0
  });
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  const referralLink = `${window.location.origin}/cadastro?ref=${reseller.referral_code || "OFFICIAL"}`;

  useEffect(() => {
    loadStats();
  }, [reseller.id]);

  const loadStats = async () => {
    if (!reseller.id) return;
    setLoading(true);
    
    // Total de Leads indicados
    const { count: totalLeads } = await (supabase.from("leads").select("*", { count: 'exact', head: true }) as any).eq("coupon_code", reseller.referral_code) as any;
    
    // Comissões pendentes (fictício para o MVP)
    const { data: comissoes } = await supabase.from("comissoes" as any).select("valor").eq("revendedor_id", reseller.id).eq("status_pagamento", "pendente") as any;
    const pending = comissoes?.reduce((acc: number, val: any) => acc + val.valor, 0) || 0;

    // Buscar dados do próprio revendedor para ter termos atualizados
    const { data: revData } = await supabase.from("revendedores" as any).select("*").eq("id", reseller.id).single() as any;
    if (revData) setReseller(revData);

    setStats({
      totalIndicated: totalLeads || 0,
      activeClients: 0, 
      balance: revData?.saldo_comissao || 0,
      pendingCommissions: pending
    });
    setLoading(false);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast({ title: "Link Copiado!", description: "Compartilhe com seus contatos." });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Ponto de Venda</h1>
          <p className="text-white/40">Bem-vindo ao seu painel de parcerias, {reseller.nome.split(' ')[0]}.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-3 flex items-center gap-4">
            <div>
              <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Seu link de indicação</p>
              <p className="text-xs text-white/70 truncate max-w-[180px]">{referralLink}</p>
            </div>
            <Button size="icon" variant="ghost" onClick={copyLink} className="h-9 w-9 rounded-xl hover:bg-white/10">
              {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-white/60" />}
            </Button>
          </div>
          <Button className="h-12 px-6 rounded-2xl bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white font-bold gap-2 shadow-lg shadow-red-500/20">
            <Share2 className="w-4 h-4" /> Indicar
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <motion.div variants={item}>
          <Card className="bg-[#0c0c14] border-white/5 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
               <Users size={80} />
            </div>
            <CardHeader className="pb-2">
              <CardDescription className="text-white/40 font-medium">Total Indicados</CardDescription>
              <CardTitle className="text-3xl font-bold text-white">{stats.totalIndicated}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-1.5 text-xs text-green-500 font-medium">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+12% este mês</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="bg-[#0c0c14] border-white/5 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
               <UserPlus size={80} />
            </div>
            <CardHeader className="pb-2">
              <CardDescription className="text-white/40 font-medium">Clientes Ativos</CardDescription>
              <CardTitle className="text-3xl font-bold text-white">{stats.activeClients}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-1.5 text-xs text-white/30 font-medium">
                <Clock className="w-3.5 h-3.5" />
                <span>Aguardando ativação</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="bg-[#0c0c14] border-white/5 shadow-2xl relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
               <DollarSign size={80} />
            </div>
            <CardHeader className="pb-2">
              <CardDescription className="text-white/40 font-medium">Comissões Pendentes</CardDescription>
              <CardTitle className="text-3xl font-bold text-white">R$ {stats.pendingCommissions.toFixed(2)}</CardTitle>
            </CardHeader>
            <CardContent>
               <Progress value={45} className="h-1.5 bg-white/5" />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="bg-gradient-to-br from-red-500 to-pink-600 border-0 shadow-2xl shadow-red-500/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10">
               <Wallet size={80} className="text-white" />
            </div>
            <CardHeader className="pb-2">
              <CardDescription className="text-white/70 font-medium">Saldo Disponível</CardDescription>
              <CardTitle className="text-3xl font-bold text-white">R$ {stats.balance.toFixed(2)}</CardTitle>
            </CardHeader>
            <CardContent>
              <Button size="sm" variant="secondary" className="w-full bg-white text-red-500 hover:bg-white/90 font-bold gap-1.5">
                <ArrowUpRight className="w-3.5 h-3.5" /> Solicitar Saque
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Secondary Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
           <Card className="bg-[#0c0c14] border-white/5 shadow-2xl h-full">
             <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-white">Indicações Recentes</CardTitle>
                  <CardDescription className="text-white/40">Seus últimos parceiros indicados.</CardDescription>
                </div>
                <Button variant="ghost" size="sm" className="text-white/40 hover:text-white gap-1">
                  Ver todas <ArrowUpRight className="w-3.5 h-3.5" />
                </Button>
             </CardHeader>
             <CardContent>
                <div className="space-y-6">
                   {[1, 2, 3].map((i) => (
                     <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-all group">
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-bold text-white group-hover:bg-red-500 transition-colors">
                              {i === 1 ? 'JF' : i === 2 ? 'AL' : 'MR'}
                           </div>
                           <div>
                              <p className="font-bold text-white text-sm">Empresa do {i === 1 ? 'João' : i === 2 ? 'André' : 'Marcos'}</p>
                              <p className="text-xs text-white/40 uppercase tracking-widest">{i === 1 ? 'Landing Page' : 'E-commerce'}</p>
                           </div>
                        </div>
                        <div className="text-right">
                           <Badge variant="outline" className={cn("mb-1", i === 1 ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-yellow-500/10 text-yellow-500 border-yellow-500/20")}>
                              {i === 1 ? 'Fechado' : 'Em Negociação'}
                           </Badge>
                           <p className="text-[10px] text-white/20">21 Mar 2024</p>
                        </div>
                     </div>
                   ))}
                </div>
             </CardContent>
           </Card>
        </div>

        {/* Marketing Card */}
        <div>
          <Card className="bg-[#0c0c14] border-white/5 shadow-2xl h-full border-t-4 border-red-500">
             <CardHeader>
                <Badge className="w-fit bg-red-500 mb-2">PROMOÇÃO</Badge>
                <CardTitle className="text-white">Kit de Vendas v2.0</CardTitle>
                <CardDescription className="text-white/40">Baixe nossos materiais e venda mais.</CardDescription>
             </CardHeader>
             <CardContent className="space-y-6">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-red-500/10 to-transparent border border-red-500/10 flex items-center gap-4">
                   <div className="h-12 w-12 rounded-xl bg-red-500/20 flex items-center justify-center">
                      <Gift className="text-red-500" />
                   </div>
                   <div>
                      <h4 className="font-bold text-white text-sm">Seu Acordo de Comissão</h4>
                      <p className="text-xs text-white/40">
                        Sua comissão atual é de <strong>{reseller.tipo_comissao === 'fixo' ? `R$ ${reseller.valor_comissao}` : `${reseller.valor_comissao}%`}</strong> 
                        {reseller.metodo_pagamento === 'recorrente' ? ' (Mensal Recorrente)' : ' (Pagamento Único)'}.
                      </p>
                   </div>
                </div>

                <div className="space-y-3">
                   <Button variant="outline" className="w-full justify-between h-12 rounded-xl border-white/10 bg-white/5 text-white/60 hover:text-white hover:bg-white/10">
                      <span>Logos & Identidade NW</span>
                      <ExternalLink className="w-4 h-4" />
                   </Button>
                   <Button variant="outline" className="w-full justify-between h-12 rounded-xl border-white/10 bg-white/5 text-white/60 hover:text-white hover:bg-white/10">
                      <span>Banners para Instagram</span>
                      <ExternalLink className="w-4 h-4" />
                   </Button>
                   <Button variant="outline" className="w-full justify-between h-12 rounded-xl border-white/10 bg-white/5 text-white/60 hover:text-white hover:bg-white/10">
                      <span>Script de Abordagem</span>
                      <ExternalLink className="w-4 h-4" />
                   </Button>
                </div>
             </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}



