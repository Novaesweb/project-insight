import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Users, Gift, Share2, Copy, Check, 
  TrendingUp, DollarSign, ArrowUpRight,
  ShieldCheck, Zap, Heart
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

export default function ClienteReferral() {
  const { toast } = useToast();
  const [cliente, setCliente] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalIndicados: 0,
    creditosGanhos: 0,
    descontoProxima: 0
  });

  useEffect(() => {
    loadCliente();
  }, []);

  const loadCliente = async () => {
    const sessionStr = localStorage.getItem("clienteSessao");
    if (!sessionStr) return;
    const session = JSON.parse(sessionStr);
    
    const { data } = await supabase.from("clientes").select("*").eq("id", session.id).single() as any;
    if (data) {
      setCliente(data);
      if (!data.referral_code) {
        // Gerar código se não existir
        const newCode = (data.nome.split(' ')[0] + Math.floor(1000 + Math.random() * 9000)).toUpperCase();
        await supabase.from("clientes").update({ referral_code: newCode } as any).eq("id", data.id);
        setCliente({ ...data, referral_code: newCode });
      }
    }
    setLoading(false);
  };

  const referralLink = cliente ? `${window.location.origin}/cadastro?ref=${cliente.referral_code}` : "";

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast({ title: "Link Copiado!", description: "Agora é só enviar para seus amigos." });
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <div className="p-8 text-center text-white/40">Carregando...</div>;

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-red-500 to-pink-600 p-8 md:p-12 text-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32" />
        <div className="relative z-10 max-w-2xl">
          <Badge className="bg-white/20 hover:bg-white/30 text-white border-0 mb-4 px-3 py-1">PROGRAMA INDIQUE & GANHE</Badge>
          <h1 className="text-4xl md:text-5xl font-black mb-4 leading-tight">Ganhe até 15% de desconto por cada amigo!</h1>
          <p className="text-white/80 text-lg mb-8">
            Compartilhe a novaesweb com sua rede. Quando seu indicado fechar um projeto, você ganha crédito na sua próxima fatura e ele ganha um bônus de boas-vindas.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-4">
             <div className="w-full sm:flex-1 bg-white/10 backdrop-blur-md rounded-2xl p-4 flex items-center justify-between border border-white/20">
                <span className="text-sm font-medium opacity-70 truncate mr-4">{referralLink}</span>
                <Button size="icon" variant="ghost" onClick={copyLink} className="hover:bg-white/10 text-white shrink-0">
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
             </div>
             <Button className="w-full sm:w-auto h-14 px-8 rounded-2xl bg-white text-red-500 hover:bg-white/90 font-bold shadow-xl shadow-black/10">
                Compartilhar <Share2 className="ml-2 w-4 h-4" />
             </Button>
          </div>
        </div>
      </div>

      {/* Benefits Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white/5 border-white/10 backdrop-blur-sm group hover:border-red-500/50 transition-all">
          <CardHeader>
            <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500 mb-2 group-hover:scale-110 transition-transform">
              <Zap className="w-6 h-6" />
            </div>
            <CardTitle className="text-white">Para Você</CardTitle>
            <CardDescription className="text-white/40">10% de desconto recorrente ou 15% em crédito único na próxima fatura.</CardDescription>
          </CardHeader>
        </Card>

        <Card className="bg-white/5 border-white/10 backdrop-blur-sm group hover:border-red-500/50 transition-all">
          <CardHeader>
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 mb-2 group-hover:scale-110 transition-transform">
              <Gift className="w-6 h-6" />
            </div>
            <CardTitle className="text-white">Para o Amigo</CardTitle>
            <CardDescription className="text-white/40">Desconto exclusivo de R$ 100,00 no primeiro projeto contratado.</CardDescription>
          </CardHeader>
        </Card>

        <Card className="bg-white/5 border-white/10 backdrop-blur-sm group hover:border-red-500/50 transition-all">
          <CardHeader>
            <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500 mb-2 group-hover:scale-110 transition-transform">
              <Heart className="w-6 h-6" />
            </div>
            <CardTitle className="text-white">Sem Limites</CardTitle>
            <CardDescription className="text-white/40">Indique quantos amigos quiser. Seus descontos são acumulativos.</CardDescription>
          </CardHeader>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Stats */}
        <div className="lg:col-span-2 space-y-6">
           <Card className="bg-[#0c0c14] border-white/5 shadow-2xl overflow-hidden">
             <CardHeader className="bg-white/5 border-b border-white/5">
                <CardTitle className="text-white text-lg flex items-center gap-2">
                   <TrendingUp className="w-5 h-5 text-red-500" /> Suas Estatísticas
                </CardTitle>
             </CardHeader>
             <CardContent className="p-8">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                   <div className="text-center">
                      <p className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Total Indicados</p>
                      <p className="text-3xl font-black text-white">0</p>
                   </div>
                   <div className="text-center border-x border-white/5">
                      <p className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Créditos Ganhos</p>
                      <p className="text-3xl font-black text-green-500">R$ 0,00</p>
                   </div>
                   <div className="text-center">
                      <p className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Desconto Ativo</p>
                      <p className="text-3xl font-black text-blue-500">0%</p>
                   </div>
                </div>
             </CardContent>
           </Card>

           <Card className="bg-[#0c0c14] border-white/5">
             <CardHeader>
                <CardTitle className="text-white text-lg">Como Funciona?</CardTitle>
             </CardHeader>
             <CardContent className="space-y-4">
                {[
                  { t: "1. Compartilhe seu link", d: "Envie seu link exclusivo para um amigo que precisa de um site ou sistema." },
                  { t: "2. Ele solicita um orçamento", d: "Ao acessar seu link, o cupom é ativado automaticamente no cadastro dele." },
                  { t: "3. Projeto Fechado", d: "Assim que ele fechar o contrato e pagar a primeira parcela, seu bônus é liberado." },
                  { t: "4. Use seu Crédito", d: "O valor será descontado automaticamente na sua próxima fatura da novaesweb." }
                ].map((step, idx) => (
                  <div key={idx} className="flex gap-4 p-4 rounded-xl bg-white/5 border border-white/5 group hover:border-white/10 transition-all">
                     <span className="flex-shrink-0 w-8 h-8 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center text-xs font-bold border border-red-500/20">{idx+1}</span>
                     <div>
                        <h4 className="font-bold text-white text-sm">{step.t}</h4>
                        <p className="text-xs text-white/40 leading-relaxed">{step.d}</p>
                     </div>
                  </div>
                ))}
             </CardContent>
           </Card>
        </div>

        {/* Sidebar help */}
        <Card className="h-fit bg-gradient-to-br from-[#1a0b16] to-[#08080f] border-red-500/20 border-2 sticky top-24">
           <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                 <ShieldCheck className="text-red-500 w-5 h-5" /> Suporte VIP
              </CardTitle>
           </CardHeader>
           <CardContent className="space-y-6">
              <p className="text-sm text-white/60 leading-relaxed">
                 Tem uma indicação de grande porte ou precisa de um material personalizado para apresentar a novaesweb? Fale com nosso time comercial.
              </p>
              <Button variant="outline" className="w-full border-red-500/50 text-red-500 hover:bg-red-500 hover:text-white rounded-xl h-12 font-bold">
                 Falar com Consultor
              </Button>
           </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Badge({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2", className)}>
      {children}
    </div>
  );
}



