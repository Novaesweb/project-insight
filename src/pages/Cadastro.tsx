import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Check, MessageCircle, ChevronLeft, Building, Store,
  AlertCircle, Loader2, Star, Rocket, Zap, Globe, ShieldCheck, Mail,
  Users, Layout, Target, Package, Instagram, Search, HelpCircle, Send, ArrowRight
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { sendPushToAdmins } from "@/lib/push-notifications";
import { cn } from "@/lib/utils";
import webnovaxPremiumLogo from "@/assets/webnovax-logo-premium.png";

// --- Opções de Seleção ---
const NECESSIDADES = [
  { id: "site", label: "Site Profissional", icon: Globe },
  { id: "loja", label: "Loja Virtual", icon: Store },
  { id: "sistema", label: "Sistema Custom", icon: Layout },
  { id: "marketing", label: "Marketing / Leads", icon: Target },
  { id: "outros", label: "Outros", icon: MessageCircle },
];

const VOLUMES = [
  { id: "baixa", label: "Até 50/mês" },
  { id: "media", label: "50 a 500/mês" },
  { id: "alta", label: "500 a 1.000/mês" },
  { id: "expert", label: "Mais de 1.000/mês" },
  { id: "nao_sei", label: "Não sei ainda" },
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
  "Identificação", "E-mail / Gmail", "WhatsApp", "Seu Negócio",
  "Necessidade", "Volume", "Origem", "Briefing"
];

// --- Utilitários ---
const formatWhatsApp = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
};

const validateWhatsApp = (w: string) => { const d = w.replace(/\D/g, ""); return d.length >= 10; };

export default function Cadastro() {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0); // 0 a 10
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

  const handlePrev = () => {
    if (currentStep > 0) setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    const { error } = await supabase.from("leads").insert({
      nome: form.nome,
      email: form.email.trim(),
      whatsapp: form.whatsapp.replace(/\D/g, ""),
      nome_negocio: form.empresa,
      servicos: [form.necessidade],
      orcamento: form.volume,
      como_conheceu: form.origem,
      mensagem: form.mensagem,
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

  const StepIndicator = ({ stepIdx }: { stepIdx: number }) => {
    const isActive = currentStep === stepIdx + 1;
    const isCompleted = currentStep > stepIdx + 1;
    return (
      <div className={cn("flex items-center gap-4 transition-all duration-300", 
        isActive ? "opacity-100 translate-x-1" : isCompleted ? "opacity-60" : "opacity-30")}>
        <div className={cn("w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] font-black",
          isActive ? "border-white bg-white text-secondary-webnovax" : 
          isCompleted ? "border-white bg-white text-secondary-webnovax" : "border-white/20 text-white")}>
          {isCompleted ? <Check className="w-3 h-3 stroke-[4px]" /> : stepIdx + 1}
        </div>
        <span className={cn("text-[11px] uppercase tracking-widest font-bold", isActive ? "text-white" : "text-white/70")}>
          {STEPS_SIDEBAR[stepIdx]}
        </span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-webnovax-bg flex items-center justify-center p-4 lg:p-8 font-inter text-white overflow-hidden relative">
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary-webnovax/5 rounded-full blur-[150px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-accent-webnovax/5 rounded-full blur-[150px]" />

      <div className="w-full max-w-5xl min-h-[600px] h-auto lg:h-[680px] bg-black/20 backdrop-blur-[40px] rounded-[32px] flex flex-col lg:flex-row shadow-[0_50px_100px_rgba(0,0,0,0.4)] overflow-hidden relative border border-white/5 z-10">
        <div className="hidden lg:flex w-[300px] sidebar-webnovax-gradient p-10 flex-col justify-between relative overflow-hidden shadow-[25px_0_50px_rgba(0,0,0,0.3)] shrink-0">
          <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px] pointer-events-none" />
          <div className="z-10 relative">
            <div className="flex flex-col items-center justify-center mb-10 group pt-4">
              <div className="relative group-hover:scale-110 transition-transform duration-500">
                <div className="absolute inset-0 bg-primary-webnovax/20 blur-[30px] rounded-full animate-pulse" />
                <div className="w-28 h-28 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center p-1 shadow-2xl overflow-hidden relative backdrop-blur-xl">
                  <img src={webnovaxPremiumLogo} alt="Logo Premium" className="w-full h-full object-cover" />
                </div>
              </div>
              <div className="mt-6 flex flex-col items-center text-center">
                <span className="text-2xl font-black tracking-[0.2em] leading-none text-white">webnovax<span className="text-primary-webnovax">WEB</span></span>
                <span className="text-[10px] font-black uppercase tracking-[0.6em] opacity-40 mt-2">Elite CRM</span>
              </div>
            </div>
            <div className="space-y-6">
              {STEPS_SIDEBAR.map((_, i) => <StepIndicator key={i} stepIdx={i} />)}
            </div>
          </div>
          <div className="z-10 relative text-[10px] font-black uppercase tracking-[0.5em] opacity-30">
            Design Version v3.3.0
          </div>
        </div>

        <div className="flex-1 flex flex-col relative bg-[#0a0a0f]/40">
          <div className="lg:hidden h-2 w-full bg-white/5 overflow-hidden">
            <motion.div animate={{ width: `${(currentStep / 9) * 100}%` }} className="h-full sidebar-webnovax-gradient shadow-[0_0_20px_rgba(255,51,102,0.5)]" />
          </div>

          <div className="flex-1 p-8 lg:p-14 flex flex-col justify-center relative overflow-hidden">
            <AnimatePresence mode="wait">
              {currentStep === 0 && (
                <motion.div key="s0" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} className="text-center lg:text-left space-y-8">
                  <div className="w-20 h-20 rounded-[1.5rem] sidebar-webnovax-gradient mx-auto lg:mx-0 flex items-center justify-center shadow-2xl mb-6 group overflow-hidden">
                    <Rocket className="w-10 h-10 text-white group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="space-y-4">
                    <h1 className="text-4xl lg:text-6xl font-black tracking-tighter font-space leading-[0.85]">VAMOS <br /> <span className="opacity-20 italic">DECOLAR SEU</span> <br /> PROJETO?</h1>
                    <p className="text-white/40 text-lg font-medium max-w-sm leading-relaxed">Sua jornada rumo ao topo do mercado digital começa com estas poucas perguntas.</p>
                  </div>
                  <Button onClick={handleNext} className="h-16 px-12 rounded-2xl sidebar-webnovax-gradient font-black uppercase tracking-widest text-sm hover:scale-105 active:scale-95 transition-all shadow-2xl group flex items-center gap-4">
                    COMEÇAR AGORA <ArrowRight className="w-5 h-5 group-hover:translate-x-3 transition-transform" />
                  </Button>
                </motion.div>
              )}

              {[1, 2, 3, 4].includes(currentStep) && (
                <motion.div key={`s${currentStep}`} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} className="space-y-8 w-full max-w-2xl">
                   <div className="space-y-4">
                    <h2 className="text-xs font-black text-primary-webnovax uppercase tracking-[0.5em] opacity-80 pl-2 border-l-4 border-primary-webnovax/50">Passo {currentStep} de 8</h2>
                    <h1 className="text-4xl lg:text-5xl font-black font-space tracking-tight leading-[1]">
                      {currentStep === 1 && "Qual seu nome completo?"}
                      {currentStep === 2 && "Qual seu melhor e-mail?"}
                      {currentStep === 3 && "Seu WhatsApp direto?"}
                      {currentStep === 4 && "Qual o nome do negócio?"}
                    </h1>
                  </div>
                  <div className="relative group">
                    {currentStep === 2 && <Mail className="absolute right-6 top-1/2 -translate-y-1/2 w-6 h-6 text-white/5 group-focus-within:text-primary-webnovax/50 transition-colors" />}
                    <Input 
                      autoFocus
                      className="h-20 lg:h-24 bg-white/[0.02] border-white/5 rounded-2xl text-2xl lg:text-3xl font-black px-8 focus:border-primary-webnovax/30 focus:bg-white/[0.05] transition-all placeholder:text-white/[0.02] shadow-inner"
                      placeholder={currentStep === 1 ? "Nome e Sobrenome" : currentStep === 2 ? "seu@email.com" : currentStep === 3 ? "(00) 00000-0000" : "Marca / Empresa"}
                      value={currentStep === 1 ? form.nome : currentStep === 2 ? form.email : currentStep === 3 ? form.whatsapp : form.empresa}
                      onChange={(e) => {
                        const v = e.target.value;
                        if (currentStep === 1) updateForm("nome", v);
                        if (currentStep === 2) updateForm("email", v);
                        if (currentStep === 3) updateForm("whatsapp", formatWhatsApp(v));
                        if (currentStep === 4) updateForm("empresa", v);
                      }}
                      onKeyDown={(e) => e.key === "Enter" && handleNext()}
                    />
                  </div>
                  {errors[currentStep === 1 ? "nome" : currentStep === 2 ? "email" : currentStep === 3 ? "whatsapp" : "empresa"] && (
                    <p className="text-red-400 text-xs font-black uppercase tracking-widest pl-4 animate-pulse">
                      {errors[currentStep === 1 ? "nome" : currentStep === 2 ? "email" : currentStep === 3 ? "whatsapp" : "empresa"]}
                    </p>
                  )}
                </motion.div>
              )}

              {[5, 7].includes(currentStep) && (
                <motion.div key={`s${currentStep}`} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.1 }} className="space-y-8 w-full">
                   <div className="space-y-3">
                    <h2 className="text-xs font-black text-primary-webnovax uppercase tracking-[0.5em] opacity-80">Passo {currentStep} de 8</h2>
                    <h1 className="text-4xl lg:text-5xl font-black font-space tracking-tight leading-[1]">
                      {currentStep === 5 && "O que você precisa agora?"}
                      {currentStep === 7 && "Como nos conheceu?"}
                    </h1>
                  </div>
                  <div className="grid grid-cols-2 gap-4 lg:gap-6">
                    {(currentStep === 5 ? NECESSIDADES : ORIGENS).map(opt => (
                      <button 
                        key={opt.id} 
                        onClick={() => {
                          updateForm(currentStep === 5 ? "necessidade" : "origem", opt.id);
                          setTimeout(handleNext, 300);
                        }}
                        className={cn("flex flex-col items-center justify-center p-6 rounded-3xl border-2 transition-all gap-3 group relative overflow-hidden",
                          (currentStep === 5 ? form.necessidade : form.origem) === opt.id 
                            ? "bg-white/10 border-primary-webnovax shadow-lg shadow-primary-webnovax/20" 
                            : "bg-white/5 border-white/5 hover:border-white/20"
                        )}
                      >
                        <opt.icon className={cn("w-8 h-8 transition-transform group-hover:scale-110", 
                          (currentStep === 5 ? form.necessidade : form.origem) === opt.id ? "text-primary-webnovax" : "text-white/20")} 
                        />
                        <span className="text-[10px] font-black uppercase tracking-widest leading-tight">{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {currentStep === 6 && (
                <motion.div key="s6" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} className="space-y-8">
                   <div className="space-y-4">
                    <h2 className="text-xs font-black text-primary-webnovax uppercase tracking-[0.5em] opacity-80 pl-2 border-l-4 border-primary-webnovax/50">Passo 6 de 8</h2>
                    <h1 className="text-4xl lg:text-5xl font-black font-space tracking-tight leading-[1]">Qual seu volume atual de pedidos?</h1>
                  </div>
                  <div className="grid grid-cols-1 gap-3 lg:gap-4">
                    {VOLUMES.map(opt => (
                      <button 
                        key={opt.id} 
                        onClick={() => {
                          updateForm("volume", opt.id);
                          setTimeout(handleNext, 300);
                        }}
                        className={cn("p-6 lg:p-8 rounded-2xl border-2 text-left transition-all text-lg lg:text-xl font-black uppercase tracking-widest relative group overflow-hidden",
                          form.volume === opt.id 
                            ? "bg-white/10 border-primary-webnovax text-white" 
                            : "bg-white/[0.03] border-white/5 text-white/40 hover:bg-white/5 hover:border-white/20"
                        )}
                      >
                        <span className="relative z-10">{opt.label}</span>
                        {form.volume === opt.id && (
                          <motion.div layoutId="vol-glow" className="absolute inset-0 bg-primary-webnovax/10 blur-2xl -z-10" />
                        )}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {currentStep === 8 && (
                <motion.div key="s8" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -40 }} className="space-y-8 w-full max-w-3xl">
                   <div className="space-y-4">
                    <h2 className="text-xs font-black text-primary-webnovax uppercase tracking-[0.5em] opacity-80 pl-2 border-l-4 border-primary-webnovax/50">Passo Final</h2>
                    <h1 className="text-4xl lg:text-5xl font-black font-space tracking-tight leading-[1]">Fale um pouco mais sobre o projeto...</h1>
                  </div>
                  <div className="relative group">
                    <Textarea 
                      autoFocus
                      className="min-h-[180px] lg:min-h-[220px] bg-white/[0.03] border-white/5 rounded-2xl p-8 text-xl lg:text-2xl font-medium focus:border-primary-webnovax/50 transition-all placeholder:text-white/5 leading-relaxed shadow-inner"
                      placeholder="Quais seus objetivos, desafios ou sonhos para este projeto?"
                      value={form.mensagem}
                      onChange={(e) => updateForm("mensagem", e.target.value)}
                    />
                  </div>
                </motion.div>
              )}

              {currentStep === 9 && (
                <motion.div key="s10" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center space-y-8 flex flex-col items-center">
                  <div className="w-24 h-24 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center mb-4">
                    <Check className="w-12 h-12 text-emerald-500 stroke-[3px]" />
                  </div>
                  <div className="space-y-4">
                    <h1 className="text-5xl font-black font-space tracking-tight">ENVIADO COM <br /> <span className="text-primary-webnovax italic">PERFEIÇÃO!</span></h1>
                    <p className="text-white/50 text-xl font-medium max-w-sm mx-auto leading-relaxed">
                      Um membro da nossa equipe já vai entrar em contato com você. Prepare-se! 🚀
                    </p>
                  </div>
                  <Button onClick={() => window.location.href = "/"} className="h-16 px-12 rounded-2xl bg-white/5 border border-white/10 font-black uppercase tracking-widest text-xs hover:bg-white/10 transition-all">
                    Recomeçar
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {currentStep > 0 && currentStep < 9 && (
            <div className="p-8 lg:p-14 pt-0 flex items-center justify-between mt-auto">
              <Button variant="ghost" className="h-10 text-white/30 hover:text-white font-black uppercase tracking-[0.3em] text-[10px] p-0" onClick={handlePrev}>
                ◄ Voltar
              </Button>
              <Button 
                onClick={handleNext} 
                disabled={loading}
                className={cn("h-14 lg:h-16 px-8 lg:px-10 rounded-xl sidebar-webnovax-gradient font-black uppercase tracking-widest text-[10px] shadow-2xl transition-all flex items-center gap-3 group hover:scale-[1.02] active:scale-[0.98]",
                  loading && "opacity-50")}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                  <>
                    {currentStep === 8 ? "Finalizar Agora" : "Próximo Passo"}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}



