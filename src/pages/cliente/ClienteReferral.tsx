import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Check,
  Copy,
  Gift,
  Heart,
  Share2,
  ShieldCheck,
  TrendingUp,
  Zap,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { getStoredClientProfile } from "@/lib/client-portal-auth";
import { cn } from "@/lib/utils";

export default function ClienteReferral() {
  const { toast } = useToast();
  const [cliente, setCliente] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void loadCliente();
  }, []);

  const loadCliente = async () => {
    const portalProfile = getStoredClientProfile();
    if (!portalProfile?.id) {
      setCliente(null);
      setLoading(false);
      return;
    }

    const { data, error } = await (supabase
      .from("clientes")
      .select("id, nome, referral_code")
      .eq("id", portalProfile.id)
      .maybeSingle() as any);

    if (error) {
      toast({
        title: "Nao foi possivel carregar seu codigo",
        description: "Tente novamente em instantes.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    if (!data) {
      setCliente(null);
      setLoading(false);
      return;
    }

    if (!data.referral_code) {
      const newCode = `${data.nome.split(" ")[0]}${Math.floor(1000 + Math.random() * 9000)}`.toUpperCase();
      const { error: updateError } = await (supabase
        .from("clientes")
        .update({ referral_code: newCode } as any)
        .eq("id", portalProfile.id) as any);

      if (!updateError) {
        setCliente({ ...data, referral_code: newCode });
      } else {
        setCliente(data);
      }
    } else {
      setCliente(data);
    }

    setLoading(false);
  };

  const referralLink = cliente ? `${window.location.origin}/cadastro?ref=${cliente.referral_code}` : "";

  const copyLink = () => {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast({ title: "Link copiado!", description: "Agora e so enviar para seus amigos." });
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <div className="p-8 text-center text-white/40">Carregando...</div>;

  return (
    <div className="space-y-8 pb-12">
      <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-red-500 to-pink-600 p-8 text-white md:p-12">
        <div className="absolute right-0 top-0 -mr-32 -mt-32 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="relative z-10 max-w-2xl">
          <Badge className="mb-4 border-0 bg-white/20 px-3 py-1 text-white hover:bg-white/30">
            PROGRAMA INDIQUE & GANHE
          </Badge>
          <h1 className="mb-4 text-4xl font-black leading-tight md:text-5xl">
            Ganhe ate 15% de desconto por cada amigo!
          </h1>
          <p className="mb-8 text-lg text-white/80">
            Compartilhe a novaesweb com sua rede. Quando seu indicado fechar um projeto, voce ganha
            credito na sua proxima fatura e ele ganha um bonus de boas-vindas.
          </p>

          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <div className="flex w-full items-center justify-between rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-md sm:flex-1">
              <span className="mr-4 truncate text-sm font-medium opacity-70">{referralLink}</span>
              <Button size="icon" variant="ghost" onClick={copyLink} className="shrink-0 text-white hover:bg-white/10">
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <Button className="h-14 w-full rounded-2xl bg-white px-8 font-bold text-red-500 shadow-xl shadow-black/10 hover:bg-white/90 sm:w-auto">
              Compartilhar <Share2 className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card className="group border-white/10 bg-white/5 backdrop-blur-sm transition-all hover:border-red-500/50">
          <CardHeader>
            <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10 text-red-500 transition-transform group-hover:scale-110">
              <Zap className="h-6 w-6" />
            </div>
            <CardTitle className="text-white">Para voce</CardTitle>
            <CardDescription className="text-white/40">
              10% de desconto recorrente ou 15% em credito unico na proxima fatura.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="group border-white/10 bg-white/5 backdrop-blur-sm transition-all hover:border-red-500/50">
          <CardHeader>
            <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500 transition-transform group-hover:scale-110">
              <Gift className="h-6 w-6" />
            </div>
            <CardTitle className="text-white">Para o amigo</CardTitle>
            <CardDescription className="text-white/40">
              Desconto exclusivo de R$ 100,00 no primeiro projeto contratado.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="group border-white/10 bg-white/5 backdrop-blur-sm transition-all hover:border-red-500/50">
          <CardHeader>
            <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/10 text-green-500 transition-transform group-hover:scale-110">
              <Heart className="h-6 w-6" />
            </div>
            <CardTitle className="text-white">Sem limites</CardTitle>
            <CardDescription className="text-white/40">
              Indique quantos amigos quiser. Seus descontos sao acumulativos.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card className="overflow-hidden border-white/5 bg-[#0c0c14] shadow-2xl">
            <CardHeader className="border-b border-white/5 bg-white/5">
              <CardTitle className="flex items-center gap-2 text-lg text-white">
                <TrendingUp className="h-5 w-5 text-red-500" /> Suas estatisticas
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
                <div className="text-center">
                  <p className="mb-1 text-[10px] uppercase tracking-widest text-white/40">Total indicados</p>
                  <p className="text-3xl font-black text-white">0</p>
                </div>
                <div className="border-x border-white/5 text-center">
                  <p className="mb-1 text-[10px] uppercase tracking-widest text-white/40">Creditos ganhos</p>
                  <p className="text-3xl font-black text-green-500">R$ 0,00</p>
                </div>
                <div className="text-center">
                  <p className="mb-1 text-[10px] uppercase tracking-widest text-white/40">Desconto ativo</p>
                  <p className="text-3xl font-black text-blue-500">0%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/5 bg-[#0c0c14]">
            <CardHeader>
              <CardTitle className="text-lg text-white">Como funciona?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { t: "1. Compartilhe seu link", d: "Envie seu link exclusivo para um amigo que precisa de um site ou sistema." },
                { t: "2. Ele solicita um orcamento", d: "Ao acessar seu link, o cupom e ativado automaticamente no cadastro dele." },
                { t: "3. Projeto fechado", d: "Assim que ele fechar o contrato e pagar a primeira parcela, seu bonus e liberado." },
                { t: "4. Use seu credito", d: "O valor sera descontado automaticamente na sua proxima fatura da novaesweb." },
              ].map((step, idx) => (
                <div key={idx} className="group flex gap-4 rounded-xl border border-white/5 bg-white/5 p-4 transition-all hover:border-white/10">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-red-500/20 bg-red-500/10 text-xs font-bold text-red-500">
                    {idx + 1}
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-white">{step.t}</h4>
                    <p className="text-xs leading-relaxed text-white/40">{step.d}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <Card className="sticky top-24 h-fit border-2 border-red-500/20 bg-gradient-to-br from-[#1a0b16] to-[#08080f]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <ShieldCheck className="h-5 w-5 text-red-500" /> Suporte VIP
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-sm leading-relaxed text-white/60">
              Tem uma indicacao de grande porte ou precisa de um material personalizado para apresentar a novaesweb? Fale com nosso time comercial.
            </p>
            <Button variant="outline" className="h-12 w-full rounded-xl border-red-500/50 font-bold text-red-500 hover:bg-red-500 hover:text-white">
              Falar com consultor
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        className,
      )}
    >
      {children}
    </div>
  );
}
