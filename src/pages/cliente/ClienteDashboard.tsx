import { useState, useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FolderKanban, Receipt, Headphones, CalendarDays, Clock, Sparkles, ShieldCheck, Target, LayoutDashboard, Vault, Eye, Phone, Mail, IdCard, MapPin, User, Rocket } from "lucide-react";
import { OnboardingWizard } from "@/components/cliente/OnboardingWizard";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useRealtimeSubscription } from "@/hooks/useRealtimeSubscription";
import StatusBadge from "@/components/StatusBadge";
import { useToast } from "@/hooks/use-toast";
import { useBranding } from "@/hooks/useBranding";
import { getStoredClientProfile } from "@/lib/client-portal-auth";
import { evaluateContentReadiness } from "@/lib/content-validation";
import jsPDF from "jspdf";
import logoImg from "@/assets/novaesweb-logo-premium.png";

const kpiGradients = [
  "linear-gradient(135deg, #a78bfa, #7c3aed)",
  "linear-gradient(135deg, #38bdf8, #0284c7)",
  "linear-gradient(135deg, #34d399, #059669)",
  "linear-gradient(135deg, #fbbf24, #d97706)",
];
const kpiGlows = [
  "0 0 20px rgba(167,139,250,0.3)",
  "0 0 20px rgba(56,189,248,0.3)",
  "0 0 20px rgba(52,211,153,0.3)",
  "0 0 20px rgba(251,191,36,0.3)",
];

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };
const stagger = { show: { transition: { staggerChildren: 0.08 } } };

interface ProjetoAtivo {
  id: string;
  titulo: string;
  briefing?: string;
  referencias?: string;
  status: string;
}

interface BriefingResumo {
  id: string;
  titulo: string;
  status: string;
  snapshot_briefing?: string | null;
  snapshot_references?: string | null;
}

interface Atualizacao {
  id: string;
  titulo: string;
  descricao: string;
  created_at: string;
}

interface PerfilCliente {
  id: string;
  nome: string;
  email: string;
  nome_empresa?: string | null;
  whatsapp?: string | null;
  telefone?: string | null;
  endereco?: string | null;
  cidade?: string | null;
  estado?: string | null;
  instagram?: string | null;
  site_url?: string | null;
  trial_ends_at?: string;
}

interface Counts {
  projetos: number;
  faturas: number;
  tickets: number;
}

const DEFAULT_ONBOARDING_STORAGE_KEY = "onboarding_done";
const ONBOARDING_CONTRACT_STORAGE_PREFIX = "onboarding_done:";

export default function ClienteDashboard() {
  const cliente: PerfilCliente = (getStoredClientProfile() as PerfilCliente | null) || { id: "", nome: "", email: "" };
  const cId = cliente.id;
  const [counts, setCounts] = useState<Counts>({ projetos: 0, faturas: 0, tickets: 0 });
  const [proximaReuniao, setProximaReuniao] = useState<any>(null);
  const [atualizacoes, setAtualizacoes] = useState<Atualizacao[]>([]);
  const [perfil, setPerfil] = useState<PerfilCliente>(cliente);
  const [projetoAtivo, setProjetoAtivo] = useState<ProjetoAtivo | null>(null);
  const [briefingAtual, setBriefingAtual] = useState<BriefingResumo | null>(null);
  const [briefing, setBriefing] = useState("");
  const [referencias, setReferencias] = useState("");
  const [showOnboarding, setShowOnboarding] = useState(() => !localStorage.getItem(DEFAULT_ONBOARDING_STORAGE_KEY));
  const [onboardingStorageKey, setOnboardingStorageKey] = useState(DEFAULT_ONBOARDING_STORAGE_KEY);

  const load = useCallback(() => {
    if (!cId) return;
    Promise.all([
      supabase.from("projetos").select("id", { count: "exact", head: true }).eq("cliente_id", cId).neq("status", "cancelado"),
      supabase
        .from("financeiro")
        .select("id", { count: "exact", head: true })
        .eq("cliente_id", cId)
        .eq("tipo", "entrada")
        .in("status", ["pendente", "em_atraso"]),
      supabase.from("tickets").select("id", { count: "exact", head: true }).eq("cliente_id", cId).neq("status", "resolvido"),
    ]).then(([p, f, t]) => setCounts({ projetos: p.count || 0, faturas: f.count || 0, tickets: t.count || 0 }));

    Promise.all([
      supabase
        .from("projetos")
        .select("*")
        .eq("cliente_id", cId)
        .neq("status", "cancelado")
        .order("created_at", { ascending: false })
        .limit(1),
      (supabase.from("client_briefings" as never)
        .select("id, titulo, status, snapshot_briefing, snapshot_references")
        .eq("cliente_id", cId)
        .order("updated_at", { ascending: false })
        .limit(1) as Promise<{ data: BriefingResumo[] | null }>),
    ]).then(([projectResponse, briefingResponse]) => {
      const project = (projectResponse.data?.[0] as ProjetoAtivo | undefined) || null;
      const latestBriefing = briefingResponse.data?.[0] || null;

      setProjetoAtivo(project);
      setBriefingAtual(latestBriefing);

      if (project?.briefing?.trim()) {
        setBriefing(project.briefing);
        setReferencias(project.referencias || "");
        return;
      }

      if (latestBriefing) {
        setBriefing(latestBriefing.snapshot_briefing || "");
        setReferencias(latestBriefing.snapshot_references || "");
        return;
      }

      setBriefing("");
      setReferencias("");
    });

    supabase.from("reunioes").select("*").eq("cliente_id", cId).in("status", ["agendada", "confirmada"]).order("data", { ascending: true }).limit(1)
      .then(({ data }) => setProximaReuniao(data?.[0] || null));

    supabase.from("projeto_atualizacoes").select("*, projetos!inner(titulo, cliente_id)").eq("projetos.cliente_id", cId).eq("visivel_cliente", true)
      .order("created_at", { ascending: false }).limit(5)
      .then(({ data }) => setAtualizacoes((data as unknown as Atualizacao[]) || []));

    supabase.from("clientes").select("*").eq("id", cId).single()
      .then(({ data }) => { if (data) setPerfil(data as PerfilCliente); });

    supabase
      .from("contratos")
      .select("id, titulo, status, onboarding_started_at, data_assinatura")
      .eq("cliente_id", cId)
      .eq("modelo", "novaesweb-contrato-mestre")
      .eq("status", "assinado")
      .not("onboarding_started_at", "is", null)
      .order("data_assinatura", { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        const contractId = data?.id || null;
        const nextStorageKey = contractId
          ? `${ONBOARDING_CONTRACT_STORAGE_PREFIX}${contractId}`
          : DEFAULT_ONBOARDING_STORAGE_KEY;

        setOnboardingStorageKey(nextStorageKey);

        if (contractId) {
          setShowOnboarding(!localStorage.getItem(nextStorageKey));
          return;
        }

        setShowOnboarding(!localStorage.getItem(DEFAULT_ONBOARDING_STORAGE_KEY));
      });
  }, [cId]);

  const { toast } = useToast();
  const branding = useBranding();

  const exportarPDF = () => {
    if (!projetoAtivo && !briefingAtual && !briefing.trim() && !referencias.trim()) return;
    
    const doc = new jsPDF();
    const title = branding.nome || "Briefing do Site";
    const projName = projetoAtivo?.titulo || briefingAtual?.titulo || "briefing-cliente";
    
    doc.setFontSize(22);
    doc.setTextColor(123, 31, 162);
    doc.text(title, 20, 20);
    
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text(`Contexto: ${projName}`, 20, 35);
    doc.text(`Cliente: ${cliente.nome}`, 20, 45);
    
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 50, 190, 50);
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Resumo de Necessidades:", 20, 65);
    
    doc.setFont("helvetica", "normal");
    const splitBriefing = doc.splitTextToSize(briefing || "Nenhuma informação fornecida.", 170);
    doc.text(splitBriefing, 20, 75);
    
    const yValue = 75 + (splitBriefing.length * 7);
    
    doc.setFont("helvetica", "bold");
    doc.text("Referências:", 20, yValue + 15);
    
    doc.setFont("helvetica", "normal");
    const splitRefs = doc.splitTextToSize(referencias || "Nenhum link ou referência fornecida.", 170);
    doc.text(splitRefs, 20, yValue + 25);
    
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text(`Documento gerado em ${new Date().toLocaleDateString("pt-BR")} via Portal do Cliente`, 20, 280);
    
    doc.save(`briefing-${projName.toLowerCase().replace(/\s+/g, "-")}.pdf`);
    toast({ title: "PDF Gerado!", description: "Seu briefing foi baixado com sucesso." });
  };

  useEffect(() => { load(); }, [load]);
  useRealtimeSubscription("projetos", load);
  useRealtimeSubscription("client_briefings", load);
  useRealtimeSubscription("financeiro", load);
  useRealtimeSubscription("tickets", load);
  useRealtimeSubscription("reunioes", load);
  useRealtimeSubscription("projeto_atualizacoes", load);

  const kpis = [
    { label: "Soluções Ativas", value: counts.projetos, icon: FolderKanban },
    { label: "Faturas em Aberto", value: counts.faturas, icon: Receipt },
    { label: "Dossiês de Evolução", value: counts.tickets, icon: Headphones },
  ];

  const isTrialExpired = perfil?.trial_ends_at && new Date() > new Date(perfil.trial_ends_at);
  const hasBriefingContext = Boolean(projetoAtivo || briefingAtual || briefing.trim() || referencias.trim());
  const briefingContextLabel = projetoAtivo?.titulo || briefingAtual?.titulo || "Briefing em andamento";
  const contentValidation = useMemo(
    () =>
      evaluateContentReadiness({
        client: perfil,
        summaryText: briefing,
        referenceText: referencias,
      }),
    [briefing, perfil, referencias],
  );
  const onboardingSteps = useMemo(() => {
    const briefingStatus = briefingAtual?.status;
    const projectStatus = projetoAtivo?.status;

    return [
      {
        title: "Briefing enviado",
        description: briefingStatus ? "O pacote estratégico já está no seu portal." : "A equipe ainda vai liberar o briefing no seu portal.",
        state: briefingStatus ? "done" : "current",
      },
      {
        title: "Seus dados do briefing",
        description: contentValidation.missing.length === 0 ? "Base recebida. O time já consegue seguir sem depender de pendências críticas." : "Ainda existem dados importantes para você completar.",
        state: contentValidation.missing.length === 0 ? "done" : briefingStatus ? "current" : "pending",
      },
      {
        title: "Análise estratégica NovaesWeb",
        description: briefingStatus === "respondido" || briefingStatus === "concluido" ? "A equipe já está convertendo as respostas em direção técnica." : "Esta etapa começa após o envio final do briefing.",
        state: briefingStatus === "respondido" || briefingStatus === "concluido" ? (projectStatus ? "done" : "current") : "pending",
      },
      {
        title: "Projeto em produção",
        description: projectStatus ? `Status atual: ${projectStatus}.` : "O projeto será aberto depois da análise estratégica.",
        state: projectStatus ? "current" : "pending",
      },
    ] as const;
  }, [briefingAtual?.status, contentValidation.missing.length, projetoAtivo?.status]);

  return (
    <>
    <AnimatePresence>
      {showOnboarding && (
        <OnboardingWizard 
          clienteName={perfil.nome?.split(" ")[0] || "Cliente"} 
          storageKey={onboardingStorageKey}
          onComplete={() => setShowOnboarding(false)} 
        />
      )}
    </AnimatePresence>
    <motion.div variants={fadeUp} initial="hidden" animate="show" className="space-y-6 min-h-screen pb-10">
      {isTrialExpired && (
        <Card className="overflow-hidden relative border-0" style={{ background: "linear-gradient(135deg, rgba(123,31,162,0.15), rgba(232,51,74,0.1))", borderLeft: "3px solid #e8334a" }}>
          <div className="absolute top-0 right-0 p-4 opacity-10"><Sparkles className="w-12 h-12" /></div>
          <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center md:text-left">
              <h2 className="text-xl font-bold text-white flex items-center justify-center md:justify-start gap-2">
                 Período de Teste Finalizado! ⏳
              </h2>
              <p className="text-sm text-white/60 max-w-lg">
                Seu acesso aos recursos premium expirou. Continue acelerando seu negócio assinando um de nossos planos.
              </p>
            </div>
            <Button className="h-12 px-8 font-bold shadow-lg whitespace-nowrap border-0 text-white" style={{ background: "linear-gradient(135deg, #7b1fa2, #c2185b, #e8334a)" }}>
               ESCOLHER MEU PLANO
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            Olá, {perfil.nome?.split(" ")[0]}! <motion.span animate={{ rotate: [0, 20, 0] }} transition={{ repeat: Infinity, duration: 2 }}>👋</motion.span>
          </h1>
          <p className="text-sm text-white/50">Seu Ecossistema Digital está sendo potencializado.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center bg-white/5 p-1.5 rounded-xl border border-white/10 mr-1 sm:mr-2 shadow-inner">
            <img src={logoImg} alt="Novaes Web" className="h-7 sm:h-8 w-auto object-contain" />
          </div>
          <span className="px-2 sm:px-3 py-1.5 rounded-full border border-white/10 text-[8px] sm:text-[9px] font-black text-white uppercase tracking-[0.10em] sm:tracking-[0.15em]" style={{ background: "linear-gradient(135deg, rgba(123,31,162,0.2), rgba(255,215,0,0.1))" }}>
            <span style={{ background: "linear-gradient(90deg, #c084fc, #FFD700)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>v10.0 ARCHITECT PRO</span>
          </span>
        </div>
      </div>

      {/* KPI Cards with gradient borders */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => (
          <Card key={kpi.label} className="border-0 overflow-hidden group relative" style={{ background: "rgba(13,11,18,0.8)" }}>
            <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: kpiGradients[idx] }} />
            <CardContent className="p-4 flex items-center gap-3 relative">
              <div className="absolute -right-4 -top-4 w-16 h-16 rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity" style={{ background: kpiGradients[idx] }} />
              <div className="w-10 h-10 rounded-xl flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform duration-500" style={{ background: kpiGradients[idx], boxShadow: kpiGlows[idx] }}>
                <kpi.icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xl font-bold text-white">{kpi.value}</p>
                <p className="text-[10px] uppercase tracking-wider text-white/40 font-semibold">{kpi.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[220px_1fr_1fr]">
        <Card className="overflow-hidden border-0" style={{ background: "linear-gradient(135deg, rgba(138,43,226,0.16), rgba(255,0,0,0.08), rgba(255,0,127,0.14))" }}>
          <CardContent className="p-5 text-center">
            <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">Prontidão do conteúdo</p>
            <div className="mt-4 text-5xl font-black text-white">{contentValidation.score}%</div>
            <p className="mt-3 text-xs text-white/45">{contentValidation.completed} de {contentValidation.total} blocos críticos entregues</p>
          </CardContent>
        </Card>

        <Card className="border-0 overflow-hidden" style={{ background: "rgba(13,11,18,0.82)" }}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-bold text-white">O que falta de você</h2>
              <Badge variant="outline" className="border-white/10 text-white/40">{contentValidation.missing.length} pendências</Badge>
            </div>
            <div className="mt-4 space-y-2">
              {contentValidation.missing.length === 0 && (
                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
                  Sua base está completa. A NovaesWeb já consegue seguir com briefing, design e estrutura do projeto.
                </div>
              )}
              {contentValidation.missing.slice(0, 4).map((issue) => (
                <div key={issue.id} className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                  <p className="text-sm font-semibold text-white">{issue.label}</p>
                  <p className="mt-1 text-xs text-white/50">{issue.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 overflow-hidden" style={{ background: "rgba(13,11,18,0.82)" }}>
          <CardContent className="p-5">
            <h2 className="text-sm font-bold text-white">O que a NovaesWeb está fazendo</h2>
            <div className="mt-4 space-y-3">
              {onboardingSteps.map((step, index) => (
                <div key={step.title} className="flex gap-3">
                  <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-[11px] font-black"
                    style={
                      step.state === "done"
                        ? { borderColor: "rgba(16,185,129,0.4)", background: "rgba(16,185,129,0.14)", color: "#a7f3d0" }
                        : step.state === "current"
                          ? { borderColor: "rgba(194,24,91,0.4)", background: "rgba(194,24,91,0.16)", color: "#f9a8d4" }
                          : { borderColor: "rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.55)" }
                    }
                  >
                    {index + 1}
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 flex-1">
                    <p className="text-sm font-semibold text-white">{step.title}</p>
                    <p className="mt-1 text-xs text-white/50">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <div className="space-y-3">
        <h2 className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-bold px-1">Atalhos rápidos</h2>
        <motion.div variants={stagger} className="flex gap-3 overflow-x-auto pb-4 scrollbar-none">
          {[
            { to: "/cliente/projetos", label: "Engenharia de Soluções", icon: FolderKanban, grad: "linear-gradient(135deg, #FFB800, #FFD700)" },
            { to: "/cliente/extras", label: "Módulos Extras", icon: Rocket, grad: "linear-gradient(135deg, #7b1fa2, #c2185b)" },
            { to: "/cliente/faturas", label: "Fluxo de Valor", icon: Receipt, grad: "linear-gradient(135deg, #c2185b, #e8334a)" },
          ].map((item, idx) => (
            <Button key={idx} asChild className="flex-shrink-0 border border-white/5 text-white rounded-2xl h-24 w-32 flex flex-col items-center justify-center gap-2 transition-all hover:-translate-y-1 active:scale-95 shadow-xl shadow-black/20 group cursor-pointer overflow-hidden text-center" style={{ background: "rgba(13,11,18,0.8)" }}>
              <Link to={item.to}>
                <div className="p-2.5 rounded-xl group-hover:scale-110 transition-all z-10 mx-auto" style={{ background: item.grad }}><item.icon className="w-5 h-5 text-white" /></div>
                <span className="text-xs font-semibold z-10">{item.label}</span>
              </Link>
            </Button>
          ))}
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-6">
          {/* Briefing Card */}
          <Card className="border-white/5 overflow-hidden border-0 relative" style={{ background: "rgba(13,11,18,0.8)" }}>
            <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: "linear-gradient(90deg, #7b1fa2, #c2185b, #FFD700)" }} />
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4" style={{ color: "#FFD700" }} /> Briefing & Referências
                </h2>
                {hasBriefingContext && <Badge variant="outline" className="text-[10px] border-white/10 text-white/40">{briefingContextLabel}</Badge>}
              </div>

              {hasBriefingContext ? (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <p className="text-[11px] font-semibold text-white/40 uppercase tracking-wider">Resumo atual do briefing</p>
                    <div className="min-h-[100px] rounded-xl border border-white/10 bg-white/5 p-4 text-sm leading-relaxed text-white/75">
                      {briefing || "Nenhuma resposta consolidada ainda. Use a página Dados do Site para preencher o briefing."}
                    </div>
                  </div>
                  {referencias && (
                    <div className="space-y-1.5">
                      <p className="text-[11px] font-semibold text-white/40 uppercase tracking-wider">Referências registradas</p>
                      <div className="min-h-[60px] rounded-xl border border-white/10 bg-white/5 p-4 text-sm leading-relaxed text-white/70 whitespace-pre-wrap">
                        {referencias}
                      </div>
                    </div>
                  )}
                  <div className="flex gap-3">
                    <Button asChild className="flex-1 text-white border-0 h-10 rounded-xl shadow-lg" style={{ background: "linear-gradient(135deg, #7b1fa2, #c2185b, #e8334a)" }}>
                      <Link to="/cliente/dados">
                        Abrir Dados do Site
                      </Link>
                    </Button>
                    <Button 
                      variant="outline"
                      className="border-white/10 text-white/60 h-10 rounded-xl hover:bg-white/5"
                      onClick={exportarPDF}
                    >
                      PDF
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <p className="text-xs text-white/40">Seu briefing aparecerá aqui assim que a NovaesWeb enviar os dados do site para preenchimento.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Blueprint */}
          <Card className="overflow-hidden border-0 relative" style={{ background: "linear-gradient(135deg, rgba(123,31,162,0.1), rgba(13,11,18,0.9))" }}>
            <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: "linear-gradient(90deg, #FFD700, #FFB800, #c2185b)" }} />
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <Target className="w-4 h-4" style={{ color: "#FFD700" }} /> Blueprint de Escala Técnica
                </h2>
                <Badge className="border-0 text-[9px] font-bold text-white" style={{ background: "linear-gradient(135deg, rgba(255,184,0,0.2), rgba(255,215,0,0.1))", color: "#FFD700" }}>PLANILHA ESTRATÉGICA ATIVA</Badge>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 group hover:border-purple-500/30 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #7b1fa2, #c2185b)" }}><LayoutDashboard className="w-4 h-4 text-white" /></div>
                      <div>
                        <p className="text-xs font-bold text-white">Arquitetura PWA & App Nativo</p>
                        <p className="text-[10px] text-white/40">Transformar site em Ativo de Instalação Direta</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[9px] border-white/10 text-white/60">Disponível</Badge>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white/5 border border-white/10 group hover:border-yellow-500/30 transition-all opacity-60">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #FFB800, #FFD700)" }}><Vault className="w-4 h-4 text-white" /></div>
                      <div>
                        <p className="text-xs font-bold text-white">Blindagem WAF & Segurança Militar</p>
                        <p className="text-[10px] text-white/40">Proteção avançada de infraestrutura contra ataques</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[9px] border-white/10 text-white/60">Agendado</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card className="border-white/5 overflow-hidden border-0 relative" style={{ background: "rgba(13,11,18,0.8)" }}>
            <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: "linear-gradient(90deg, #9c27b0, #c2185b, #e8334a)" }} />
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-purple-400" /> Timeline de Acompanhamento
                </h2>
                <Badge variant="outline" className="text-[9px] border-emerald-500/20 text-emerald-400 bg-emerald-500/5">SISTEMA OPERACIONAL</Badge>
              </div>
              
              {atualizacoes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center border-t border-white/5 mt-4">
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4">
                    <Clock className="w-6 h-6 text-white/20" />
                  </div>
                  <p className="text-xs text-white/40">Iniciando os trabalhos... As atualizações aparecerão aqui.</p>
                </div>
              ) : (
                <div className="space-y-0 relative ml-2">
                  <div className="absolute left-[5px] top-2 bottom-6 w-px" style={{ background: "linear-gradient(180deg, #7b1fa2, #c2185b, #FFD700, transparent)" }} />
                  {atualizacoes.map((a: Record<string, any>) => (
                    <div key={a.id} className="flex gap-4 pb-6 last:pb-0 relative group">
                      <div className="relative z-10">
                        <div className="w-3 h-3 rounded-full shadow-lg group-hover:scale-125 transition-transform mt-1" style={{ background: "linear-gradient(135deg, #7b1fa2, #e8334a)", boxShadow: "0 0 8px rgba(123,31,162,0.4)" }} />
                      </div>
                      <div className="flex-1 -mt-0.5 p-3 rounded-xl hover:bg-white/[0.02] transition-colors border border-transparent hover:border-white/5">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-xs font-bold text-white">{a.titulo}</h4>
                          <span className="text-[10px] text-white/30">{new Date(a.created_at).toLocaleDateString("pt-BR")}</span>
                        </div>
                        <p className="text-[11px] text-white/40 leading-relaxed">{a.descricao}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Reunião */}
          <Card className="border-0 overflow-hidden relative" style={{ background: "rgba(13,11,18,0.8)" }}>
            <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: "linear-gradient(90deg, #FFD700, #FFB800)" }} />
            <CardContent className="p-5">
              <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold mb-4 flex items-center gap-2" style={{ color: "#FFD700" }}>
                <CalendarDays className="w-4 h-4" /> Próxima Reunião
              </h3>
              {proximaReuniao ? (
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-xs font-bold text-white">{new Date(proximaReuniao.data).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}</p>
                    <p className="text-[10px] text-white/40 mt-1">{proximaReuniao.horario} · {proximaReuniao.tipo || 'Reunião'}</p>
                    <div className="mt-2"><StatusBadge status={proximaReuniao.status} /></div>
                  </div>
                  {proximaReuniao.link && (
                    <a href={proximaReuniao.link} target="_blank" rel="noreferrer" className="block text-center text-xs font-bold py-2.5 rounded-xl text-white border-0" style={{ background: "linear-gradient(135deg, #7b1fa2, #c2185b)" }}>
                      Entrar na Reunião →
                    </a>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center py-8 text-center">
                  <CalendarDays className="w-8 h-8 text-white/10 mb-3" />
                  <p className="text-[11px] text-white/40">Nenhuma reunião agendada.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Perfil */}
          <Card className="border-0 overflow-hidden relative" style={{ background: "rgba(13,11,18,0.8)" }}>
            <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: "linear-gradient(90deg, #7b1fa2, #c2185b)" }} />
            <CardContent className="p-5">
              <h3 className="text-[10px] uppercase tracking-[0.2em] text-purple-400 font-bold mb-4">Meu Perfil</h3>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white text-lg font-black shrink-0 relative overflow-hidden group" style={{ background: "linear-gradient(135deg, #7b1fa2, #c2185b)", boxShadow: "0 8px 20px -5px rgba(123,31,162,0.5)" }}>
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="relative z-10">{perfil?.nome?.charAt(0) || "?"}</span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-black text-white truncate leading-tight uppercase tracking-tight">{perfil?.nome}</p>
                  <p className="text-[10px] text-white/30 truncate font-medium">{perfil?.email}</p>
                </div>
              </div>
              {/* Dados do site agora ficam na rota dedicada /cliente/dados */}
            </CardContent>
          </Card>

          {/* Status bar */}
          <div className="p-4 rounded-2xl border border-white/5 relative overflow-hidden" style={{ background: "linear-gradient(135deg, rgba(123,31,162,0.1), rgba(255,215,0,0.05))" }}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Sistema Online</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-[10px]">
                <span className="text-white/40">Uptime</span>
                <span className="text-white font-bold">99.9%</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span className="text-white/40">Velocidade</span>
                <span className="text-white font-bold">Premium</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span className="text-white/40">SSL</span>
                <span className="text-emerald-400 font-bold">Ativo ✓</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
    </>
  );
}
