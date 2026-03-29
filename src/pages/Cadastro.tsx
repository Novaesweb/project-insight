import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Check, MessageCircle, Building, Store,
  Loader2, Rocket, Globe, Mail, X,
  Users, Layout, Target, Instagram, Search, HelpCircle, ArrowRight, ArrowLeft, Sparkles
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { sendPushToAdmins } from "@/lib/push-notifications";
import { cn } from "@/lib/utils";
import novaeswebPremiumLogo from "@/assets/novaesweb-logo-admin.webp";

const NECESSIDADES = [
  { id: "site", label: "Site Profissional", icon: Globe, desc: "Presença online de alto impacto" },
  { id: "loja", label: "Loja Virtual", icon: Store, desc: "Venda online 24/7" },
  { id: "sistema", label: "Sistema Custom", icon: Layout, desc: "Solução sob medida" },
  { id: "marketing", label: "Marketing / Leads", icon: Target, desc: "Captação e conversão" },
  { id: "outros", label: "Outros", icon: MessageCircle, desc: "Conte-nos mais" },
];

const VOLUMES = [
  { id: "baixa", label: "Até 50/mês", emoji: "📦" },
  { id: "media", label: "50 a 500/mês", emoji: "📊" },
  { id: "alta", label: "500 a 1.000/mês", emoji: "🚀" },
  { id: "expert", label: "Mais de 1.000/mês", emoji: "⚡" },
  { id: "nao_sei", label: "Não sei ainda", emoji: "🤔" },
];

const ORIGENS = [
  { id: "instagram", label: "Instagram", icon: Instagram },
  { id: "google", label: "Google", icon: Search },
  { id: "indicacao", label: "Indicação", icon: Users },
  { id: "whatsapp", label: "WhatsApp", icon: MessageCircle },
  { id: "tiktok", label: "TikTok", icon: Rocket },
  { id: "outro", label: "Outro", icon: HelpCircle },
];

const STEPS_SIDEBAR = [
  "Identificação", "E-mail", "WhatsApp", "Negócio",
  "Necessidade", "Volume", "Origem", "Briefing"
];

const formatWhatsApp = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
};

const validateWhatsApp = (w: string) => w.replace(/\D/g, "").length >= 10;

export default function Cadastro() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    nome: "", email: "", whatsapp: "", empresa: "",
    necessidade: "", volume: "", origem: "", mensagem: ""
  });

  const updateForm = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
  };

  const validateStep = (step: number): boolean => {
    const errs: Record<string, string> = {};
    if (step === 1 && !form.nome.trim()) errs.nome = "Campo obrigatório";
    if (step === 2 && (!form.email.trim() || !form.email.includes("@"))) errs.email = "E-mail inválido";
    if (step === 3 && !validateWhatsApp(form.whatsapp)) errs.whatsapp = "WhatsApp inválido";
    if (step === 4 && !form.empresa.trim()) errs.empresa = "Campo obrigatório";
    if (step === 5 && !form.necessidade) errs.necessidade = "Selecione uma opção";
    if (step === 6 && !form.volume) errs.volume = "Selecione uma opção";
    if (step === 7 && !form.origem) errs.origem = "Selecione uma opção";
    if (step === 8 && !form.mensagem.trim()) errs.mensagem = "Conte-nos um pouco mais";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (currentStep === 0 || validateStep(currentStep)) {
      if (currentStep < 9) setCurrentStep(prev => prev + 1);
      if (currentStep === 8) handleSubmit();
    } else {
      toast({ title: "Atenção", description: "Preencha o campo para continuar.", variant: "destructive" });
    }
  };

  const handlePrev = () => { if (currentStep > 0) setCurrentStep(prev => prev - 1); };

  const handleSubmit = async () => {
    setLoading(true);
    const { error } = await supabase.from("leads").insert({
      nome: form.nome, email: form.email.trim(),
      whatsapp: form.whatsapp.replace(/\D/g, ""),
      nome_negocio: form.empresa, servicos: [form.necessidade],
      orcamento: form.volume, como_conheceu: form.origem, mensagem: form.mensagem,
    } as any);
    setLoading(false);
    if (error) {
      toast({ title: "Erro ao enviar", description: error.message, variant: "destructive" });
    } else {
      supabase.functions.invoke("send-lead-email", {
        body: { ...form, nome_negocio: form.empresa, servicos: [form.necessidade], orcamento: form.volume }
      });
      sendPushToAdmins("🆕 Novo Lead Premium", `${form.nome} (${form.empresa})`, "/admin/leads");
      setCurrentStep(9);
    }
  };

  const inputField = (step: number) => {
    const config: Record<number, { field: string; placeholder: string; label: string; icon?: typeof Mail }> = {
      1: { field: "nome", placeholder: "Nome e Sobrenome", label: "Qual seu nome completo?" },
      2: { field: "email", placeholder: "seu@email.com", label: "Qual seu melhor e-mail?", icon: Mail },
      3: { field: "whatsapp", placeholder: "(00) 00000-0000", label: "Seu WhatsApp direto?" },
      4: { field: "empresa", placeholder: "Marca / Empresa", label: "Qual o nome do negócio?", icon: Building },
    };
    const c = config[step];
    if (!c) return null;
    const val = form[c.field as keyof typeof form];
    return (
      <motion.div key={`s${step}`} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.4, ease: "easeOut" }} className="space-y-6 w-full max-w-xl">
        <StepHeader step={step} label={c.label} />
        <div className="relative group">
          {c.icon && <c.icon className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/10 group-focus-within:text-[hsl(var(--primary))]/60 transition-colors duration-300" />}
          <Input
            autoFocus
            className="h-16 lg:h-20 bg-white/[0.03] border-white/[0.08] rounded-2xl text-xl lg:text-2xl font-bold px-6 focus:border-[hsl(var(--primary))]/40 focus:bg-white/[0.05] transition-all placeholder:text-white/10 text-white"
            placeholder={c.placeholder}
            value={val}
            onChange={(e) => {
              const v = e.target.value;
              updateForm(c.field, step === 3 ? formatWhatsApp(v) : v);
            }}
            onKeyDown={(e) => e.key === "Enter" && handleNext()}
          />
        </div>
        {errors[c.field] && (
          <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-red-400 text-xs font-bold tracking-wider pl-2">
            {errors[c.field]}
          </motion.p>
        )}
      </motion.div>
    );
  };

  const progress = currentStep === 0 ? 0 : Math.min((currentStep / 9) * 100, 100);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 lg:p-8 font-sans text-white overflow-hidden relative" style={{ background: "linear-gradient(145deg, #07060a 0%, #0d0a1a 40%, #1a0a12 70%, #0a0a0f 100%)" }}>
      {/* Close / Exit button */}
      <button
        onClick={() => navigate(-1)}
        className="fixed top-5 right-5 z-50 p-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all group"
        aria-label="Fechar"
      >
        <X className="w-5 h-5 text-white/50 group-hover:text-white transition-colors" />
      </button>

      {/* Ambient orbs */}
      <div className="absolute top-[-30%] left-[-15%] w-[600px] h-[600px] rounded-full opacity-[0.07] blur-[150px]" style={{ background: "radial-gradient(circle, hsl(var(--primary)), transparent 70%)" }} />
      <div className="absolute bottom-[-25%] right-[-10%] w-[500px] h-[500px] rounded-full opacity-[0.05] blur-[130px]" style={{ background: "radial-gradient(circle, hsl(var(--accent)), transparent 70%)" }} />
      <div className="absolute top-[50%] left-[60%] w-[300px] h-[300px] rounded-full opacity-[0.04] blur-[100px]" style={{ background: "radial-gradient(circle, #FFD700, transparent 70%)" }} />

      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />

      <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }}
        className="w-full max-w-[1100px] min-h-[640px] flex flex-col lg:flex-row rounded-[28px] overflow-hidden relative z-10 border border-white/[0.06]"
        style={{ background: "linear-gradient(160deg, rgba(255,255,255,0.03), rgba(10,10,15,0.8))", boxShadow: "0 40px 100px -20px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)" }}
      >
        {/* Sidebar */}
        <div className="hidden lg:flex w-[280px] flex-col justify-between p-8 relative overflow-hidden shrink-0"
          style={{ background: "linear-gradient(180deg, rgba(232,51,74,0.12) 0%, rgba(123,31,162,0.12) 50%, rgba(10,10,15,0.95) 100%)" }}>
          <div className="absolute inset-0 backdrop-blur-sm" />
          <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)" }} />
          <div className="absolute top-0 bottom-0 right-0 w-px" style={{ background: "linear-gradient(180deg, rgba(232,51,74,0.2), rgba(123,31,162,0.1), transparent)" }} />
          
          <div className="relative z-10 space-y-8">
            {/* Logo */}
            <div className="flex flex-col items-center text-center pt-2">
              <div className="relative mb-4">
                <div className="absolute inset-0 rounded-2xl blur-2xl opacity-30" style={{ background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))" }} />
                <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center p-0.5 overflow-hidden relative backdrop-blur-xl">
                  <img src={novaeswebPremiumLogo} alt="novaesweb" className="w-full h-full object-cover rounded-xl" />
                </div>
              </div>
              <span className="text-lg font-extrabold tracking-[0.15em] text-white">novaesweb</span>
              <span className="text-[9px] font-bold uppercase tracking-[0.5em] text-white/25 mt-1">Elite CRM</span>
            </div>

            {/* Steps */}
            <div className="space-y-3">
              {STEPS_SIDEBAR.map((label, i) => {
                const stepNum = i + 1;
                const isActive = currentStep === stepNum;
                const isCompleted = currentStep > stepNum;
                return (
                  <div key={i} className={cn("flex items-center gap-3 py-1.5 px-2 rounded-xl transition-all duration-400",
                    isActive ? "bg-white/[0.06]" : "")}>
                    <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black transition-all duration-400 shrink-0",
                      isActive ? "bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--accent))] text-white shadow-lg shadow-[hsl(var(--primary))]/20" :
                      isCompleted ? "bg-white/10 text-white" : "bg-white/[0.03] text-white/20 border border-white/[0.06]")}>
                      {isCompleted ? <Check className="w-3.5 h-3.5 stroke-[3px]" /> : stepNum}
                    </div>
                    <span className={cn("text-[11px] font-semibold tracking-wide transition-all duration-400",
                      isActive ? "text-white" : isCompleted ? "text-white/50" : "text-white/20")}>
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="relative z-10 text-[9px] font-bold uppercase tracking-[0.4em] text-white/15 text-center">
            v3.4.0
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col relative">
          {/* Mobile progress bar */}
          <div className="lg:hidden h-1 w-full bg-white/[0.04]">
            <motion.div animate={{ width: `${progress}%` }} transition={{ duration: 0.5, ease: "easeOut" }}
              className="h-full rounded-r-full" style={{ background: "linear-gradient(90deg, hsl(var(--primary)), hsl(var(--accent)))" }} />
          </div>

          {/* Mobile step counter */}
          {currentStep > 0 && currentStep < 9 && (
            <div className="lg:hidden flex items-center justify-between px-6 pt-4">
              <span className="text-[10px] font-bold text-white/30 tracking-wider">{currentStep} / 8</span>
              <div className="flex gap-1">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className={cn("h-1 rounded-full transition-all duration-300",
                    i < currentStep ? "w-4 bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))]" : "w-1.5 bg-white/10")} />
                ))}
              </div>
            </div>
          )}

          <div className="flex-1 px-8 lg:px-14 py-10 lg:py-14 flex flex-col justify-center">
            <AnimatePresence mode="wait">
              {/* Step 0: Welcome */}
              {currentStep === 0 && (
                <motion.div key="s0" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.5 }}
                  className="space-y-8 max-w-lg">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center relative"
                    style={{ background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))" }}>
                    <div className="absolute inset-0 rounded-2xl blur-xl opacity-40" style={{ background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))" }} />
                    <Rocket className="w-8 h-8 text-white relative z-10" />
                  </div>
                  <div className="space-y-3">
                    <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.05]">
                      Vamos <span className="italic text-white/20">decolar</span><br />seu projeto?
                    </h1>
                    <p className="text-white/35 text-base lg:text-lg font-medium max-w-sm leading-relaxed">
                      Responda algumas perguntas rápidas e nossa equipe entra em contato com a solução ideal.
                    </p>
                  </div>
                  <Button onClick={handleNext}
                    className="h-14 px-10 rounded-2xl font-bold text-sm text-white border-0 hover:scale-[1.03] active:scale-[0.97] transition-all group flex items-center gap-3"
                    style={{ background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))", boxShadow: "0 15px 40px -10px rgba(232,51,74,0.3)" }}>
                    <Sparkles className="w-4 h-4" />
                    Começar agora
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </motion.div>
              )}

              {/* Steps 1-4: Input fields */}
              {[1, 2, 3, 4].includes(currentStep) && inputField(currentStep)}

              {/* Step 5 & 7: Card selection */}
              {[5, 7].includes(currentStep) && (
                <motion.div key={`s${currentStep}`} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4 }} className="space-y-6 w-full max-w-xl">
                  <StepHeader step={currentStep} label={currentStep === 5 ? "O que você precisa agora?" : "Como nos conheceu?"} />
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                    {(currentStep === 5 ? NECESSIDADES : ORIGENS).map(opt => {
                      const selected = (currentStep === 5 ? form.necessidade : form.origem) === opt.id;
                      return (
                        <button key={opt.id} onClick={() => { updateForm(currentStep === 5 ? "necessidade" : "origem", opt.id); setTimeout(handleNext, 350); }}
                          className={cn("flex flex-col items-center justify-center p-5 rounded-2xl border transition-all duration-300 gap-2.5 group relative overflow-hidden",
                            selected ? "bg-white/[0.08] border-[hsl(var(--primary))]/50 shadow-lg shadow-[hsl(var(--primary))]/10" :
                            "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.05] hover:border-white/15")}>
                          {selected && <div className="absolute inset-0 opacity-10 rounded-2xl" style={{ background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))" }} />}
                          <opt.icon className={cn("w-6 h-6 transition-all duration-300 relative z-10",
                            selected ? "text-[hsl(var(--primary))]" : "text-white/20 group-hover:text-white/40")} />
                          <span className="text-[10px] font-bold uppercase tracking-wider text-center leading-tight relative z-10">
                            {opt.label}
                          </span>
                          {"desc" in opt && <span className="text-[8px] text-white/25 font-medium relative z-10">{(opt as any).desc}</span>}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* Step 6: Volume */}
              {currentStep === 6 && (
                <motion.div key="s6" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
                  transition={{ duration: 0.4 }} className="space-y-6 w-full max-w-xl">
                  <StepHeader step={6} label="Qual seu volume atual de pedidos?" />
                  <div className="space-y-2.5">
                    {VOLUMES.map(opt => (
                      <button key={opt.id} onClick={() => { updateForm("volume", opt.id); setTimeout(handleNext, 350); }}
                        className={cn("w-full p-5 rounded-2xl border text-left transition-all duration-300 flex items-center gap-4 group relative overflow-hidden",
                          form.volume === opt.id
                            ? "bg-white/[0.08] border-[hsl(var(--primary))]/50 shadow-lg shadow-[hsl(var(--primary))]/10"
                            : "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.05] hover:border-white/15")}>
                        {form.volume === opt.id && <div className="absolute inset-0 opacity-10 rounded-2xl" style={{ background: "linear-gradient(90deg, hsl(var(--primary)), transparent)" }} />}
                        <span className="text-xl relative z-10">{opt.emoji}</span>
                        <span className="text-sm font-bold tracking-wide relative z-10">{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Step 8: Briefing */}
              {currentStep === 8 && (
                <motion.div key="s8" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }}
                  transition={{ duration: 0.4 }} className="space-y-6 w-full max-w-xl">
                  <StepHeader step={8} label="Fale mais sobre seu projeto..." isLast />
                  <Textarea
                    autoFocus
                    className="min-h-[160px] lg:min-h-[200px] bg-white/[0.03] border-white/[0.08] rounded-2xl p-6 text-base lg:text-lg font-medium focus:border-[hsl(var(--primary))]/40 transition-all placeholder:text-white/10 leading-relaxed text-white resize-none"
                    placeholder="Quais seus objetivos, desafios ou sonhos para este projeto?"
                    value={form.mensagem}
                    onChange={(e) => updateForm("mensagem", e.target.value)}
                  />
                  {errors.mensagem && (
                    <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-red-400 text-xs font-bold tracking-wider pl-2">
                      {errors.mensagem}
                    </motion.p>
                  )}
                </motion.div>
              )}

              {/* Step 9: Success */}
              {currentStep === 9 && (
                <motion.div key="s9" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5, ease: "easeOut" }}
                  className="text-center space-y-6 flex flex-col items-center max-w-md mx-auto">
                  <div className="relative">
                    <div className="absolute inset-0 rounded-full blur-2xl opacity-30" style={{ background: "radial-gradient(circle, #22c55e, transparent 70%)" }} />
                    <div className="w-20 h-20 rounded-full bg-emerald-500/15 border-2 border-emerald-500/50 flex items-center justify-center relative">
                      <Check className="w-10 h-10 text-emerald-400 stroke-[3px]" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight">
                      Enviado com <span style={{ background: "linear-gradient(90deg, hsl(var(--primary)), hsl(var(--accent)))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>sucesso!</span>
                    </h1>
                    <p className="text-white/40 text-base font-medium leading-relaxed">
                      Um membro da equipe já vai entrar em contato. Prepare-se para decolar! 🚀
                    </p>
                  </div>
                  <Button onClick={() => window.location.href = "/"}
                    className="h-12 px-8 rounded-xl bg-white/5 border border-white/10 font-bold text-xs uppercase tracking-widest text-white/70 hover:bg-white/10 hover:text-white transition-all">
                    Voltar ao início
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Navigation buttons */}
          {currentStep > 0 && currentStep < 9 && (
            <div className="px-8 lg:px-14 pb-8 flex items-center justify-between">
              <Button variant="ghost" onClick={handlePrev}
                className="h-10 text-white/25 hover:text-white/60 font-semibold text-xs tracking-wider gap-2 px-0 hover:bg-transparent">
                <ArrowLeft className="w-3.5 h-3.5" /> Voltar
              </Button>
              <Button onClick={handleNext} disabled={loading}
                className={cn("h-12 lg:h-14 px-8 rounded-xl font-bold text-xs tracking-wider text-white border-0 flex items-center gap-2.5 group hover:scale-[1.02] active:scale-[0.98] transition-all",
                  loading && "opacity-50")}
                style={{ background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))", boxShadow: "0 10px 30px -8px rgba(232,51,74,0.25)" }}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                  <>
                    {currentStep === 8 ? "Finalizar" : "Próximo"}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function StepHeader({ step, label, isLast }: { step: number; label: string; isLast?: boolean }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="h-px flex-1 max-w-[24px]" style={{ background: "linear-gradient(90deg, hsl(var(--primary)), transparent)" }} />
        <span className="text-[10px] font-bold uppercase tracking-[0.3em]"
          style={{ background: "linear-gradient(90deg, hsl(var(--primary)), hsl(var(--accent)))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          {isLast ? "Passo Final" : `Passo ${step} de 8`}
        </span>
      </div>
      <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight leading-tight text-white">
        {label}
      </h1>
    </div>
  );
}
