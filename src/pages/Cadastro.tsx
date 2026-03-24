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

// --- Opções de Seleção ---
const SEGMENTOS = [
  { id: "imobiliaria", label: "Imobiliária", icon: Building },
  { id: "e-commerce", label: "E-commerce", icon: Store },
  { id: "servicos", label: "Serviços", icon: Users },
  { id: "tecnologia", label: "Tecnologia", icon: Zap },
  { id: "varejo", label: "Varejo", icon: Package },
  { id: "saude", label: "Saúde / Clínicas", icon: ShieldCheck },
  { id: "outros", label: "Outros", icon: HelpCircle },
];

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
  "Segmento", "Necessidade", "Volume", "Origem", "Briefing"
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
    nome: "", email: "", whatsapp: "", empresa: "", segmento: "",
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
    if (step === 5 && !form.segmento) errs.segmento = "Selecione uma opção";
    if (step === 6 && !form.necessidade) errs.necessidade = "Selecione uma opção";
    if (step === 7 && !form.volume) errs.volume = "Selecione uma opção";
    if (step === 8 && !form.origem) errs.origem = "Selecione uma opção";
    if (step === 9 && !form.mensagem.trim()) errs.mensagem = "Conte-nos um pouco mais";

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (currentStep === 0 || validateStep(currentStep)) {
      if (currentStep < 10) setCurrentStep(prev => prev + 1);
      if (currentStep === 9) handleSubmit();
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
      segmento: form.segmento, 
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
        body: { ...form, nome_negocio: form.empresa, tipo_negocio: form.segmento, servicos: [form.necessidade], orcamento: form.volume }
      });
      sendPushToAdmins("🆕 Novo Lead Premium", `${form.nome} (${form.empresa})`, "/admin/leads");
      setCurrentStep(10);
    }
  };

  const StepIndicator = ({ stepIdx }: { stepIdx: number }) => {
    const isActive = currentStep === stepIdx + 1;
    const isCompleted = currentStep > stepIdx + 1;
    return (
      <div className={cn("flex items-center gap-4 transition-all duration-300", 
        isActive ? "opacity-100 translate-x-1" : isCompleted ? "opacity-60" : "opacity-30")}>
        <div className={cn("w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] font-black",
          isActive ? "border-white bg-white text-secondary-novaes" : 
          isCompleted ? "border-white bg-white text-secondary-novaes" : "border-white/20 text-white")}>
          {isCompleted ? <Check className="w-3 h-3 stroke-[4px]" /> : stepIdx + 1}
        </div>
        <span className={cn("text-[11px] uppercase tracking-widest font-bold", isActive ? "text-white" : "text-white/70")}>
          {STEPS_SIDEBAR[stepIdx]}
        </span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-novaes-gradient flex items-center justify-center p-4 lg:p-0 font-sans text-white overflow-hidden">
      <div className="w-full max-w-[940px] h-full lg:h-[620px] glass-card-novaes rounded-[2.5rem] flex flex-col lg:flex-row shadow-2xl overflow-hidden relative border border-white/10">
        
        {/* --- SIDEBAR ESQUERDA (DESKTOP) --- */}
        <div className="hidden lg:flex w-[280px] sidebar-novaes-gradient p-10 flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10 pointer-events-none" />
          <div className="z-10 relative">
            <Link to="/" className="flex flex-col gap-1 mb-12 group">
              <span className="text-2xl font-black tracking-tighter uppercase">Novaes Web</span>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 group-hover:opacity-100 transition-opacity">Cadastro rápido</span>
            </Link>
            
            <div className="space-y-6">
              {STEPS_SIDEBAR.map((_, i) => <StepIndicator key={i} stepIdx={i} />)}
            </div>
          </div>
          
          <div className="z-10 relative text-[10px] font-black uppercase tracking-widest opacity-40">
            © 2025 Novaes Web
          </div>
        </div>

        {/* --- CONTEÚDO PRINCIPAL --- */}
        <div className="flex-1 flex flex-col relative bg-[#111116]/40">
          
          {/* Barra de Progresso Mobile */}
          <div className="lg:hidden h-1.5 w-full bg-white/5 overflow-hidden">
            <motion.div animate={{ width: `${(currentStep / 10) * 100}%` }} className="h-full sidebar-novaes-gradient" />
          </div>

          <div className="flex-1 p-8 lg:p-14 flex flex-col justify-center relative overflow-hidden">
            <AnimatePresence mode="wait">
              {/* STEP 0: BOAS-VINDAS */}
              {currentStep === 0 && (
                <motion.div key="s0" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="text-center lg:text-left space-y-8">
                  <div className="w-20 h-20 rounded-3xl sidebar-novaes-gradient mx-auto lg:mx-0 flex items-center justify-center shadow-xl mb-4">
                    <Rocket className="w-10 h-10 text-white" />
                  </div>
                  <div className="space-y-4">
                    <h1 className="text-4xl lg:text-6xl font-black tracking-tighter font-space leading-[0.9]">VAMOS <br /> <span className="opacity-30">DECOLAR SEU</span> <br /> PROJETO?</h1>
                    <p className="text-white/40 text-lg font-medium max-w-sm">Conte-nos sobre sua ideia e nossa equipe transformará em realidade digital.</p>
                  </div>
                  <Button onClick={handleNext} className="h-16 px-12 rounded-2xl sidebar-novaes-gradient font-black uppercase tracking-widest text-sm hover:scale-105 transition-all shadow-xl group">
                    Começar agora <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-2 transition-transform" />
                  </Button>
                </motion.div>
              )}

              {/* STEPS 1-4: INPUTS */}
              {[1, 2, 3, 4].includes(currentStep) && (
                <motion.div key={`s${currentStep}`} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                   <div className="space-y-2">
                    <h2 className="text-sm font-black text-primary-novaes uppercase tracking-[0.3em]">Passo {currentStep} de 9</h2>
                    <h1 className="text-3xl lg:text-4xl font-black font-space tracking-tight">
                      {currentStep === 1 && "Qual seu nome completo?"}
                      {currentStep === 2 && "Qual seu melhor e-mail?"}
                      {currentStep === 3 && "Seu WhatsApp direto?"}
                      {currentStep === 4 && "Qual o nome do negócio?"}
                    </h1>
                  </div>
                  <div className="relative group">
                    {currentStep === 2 && <Mail className="absolute right-6 top-1/2 -translate-y-1/2 w-6 h-6 text-white/10 group-focus-within:text-primary-novaes transition-colors" />}
                    <Input 
                      autoFocus
                      className="h-20 lg:h-24 bg-white/5 border-white/5 rounded-3xl text-2xl lg:text-3xl font-bold px-8 focus:border-primary-novaes/50 transition-all placeholder:text-white/5"
                      placeholder={currentStep === 1 ? "Nome da pessoa..." : currentStep === 2 ? "seu@gmail.com" : currentStep === 3 ? "(00) 00000-0000" : "Nome da startup/empresa"}
                      value={currentStep === 1 ? form.nome : currentStep === 2 ? form.email : currentStep === 3 ? form.whatsapp : form.empresa}
                      onChange={(e) => {
                        const v = e.target.value;
                        if (currentStep === 1) updateForm("nome", v);
                        if (currentStep === 2) updateForm("email", v);
                        if (currentStep === 3) updateForm("whatsapp", formatWhatsApp(v));
                        if (currentStep === 4) updateForm("empresa", v);
                      }}
                    />
                  </div>
                </motion.div>
              )}

              {/* STEPS 5, 6, 8: GRIDS COM ÍCONES */}
              {[5, 6, 8].includes(currentStep) && (
                <motion.div key={`s${currentStep}`} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }} className="space-y-8">
                   <div className="space-y-2 text-center lg:text-left">
                    <h2 className="text-sm font-black text-primary-novaes uppercase tracking-[0.3em]">Passo {currentStep} de 9</h2>
                    <h1 className="text-3xl lg:text-4xl font-black font-space">
                      {currentStep === 5 && "O negócio é de qual segmento?"}
                      {currentStep === 6 && "O que você precisa agora?"}
                      {currentStep === 8 && "Como nos conheceu?"}
                    </h1>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {(currentStep === 5 ? SEGMENTOS : currentStep === 6 ? NECESSIDADES : ORIGENS).map(opt => (
                      <button 
                        key={opt.id} 
                        onClick={() => {
                          updateForm(currentStep === 5 ? "segmento" : currentStep === 6 ? "necessidade" : "origem", opt.id);
                          setTimeout(handleNext, 300);
                        }}
                        className={cn("flex flex-col items-center justify-center p-6 rounded-3xl border-2 transition-all gap-3 group relative overflow-hidden",
                          (currentStep === 5 ? form.segmento : currentStep === 6 ? form.necessidade : form.origem) === opt.id 
                            ? "bg-white/10 border-primary-novaes shadow-lg shadow-primary-novaes/20" 
                            : "bg-white/5 border-white/5 hover:border-white/20"
                        )}
                      >
                        <opt.icon className={cn("w-8 h-8 transition-transform group-hover:scale-110", 
                          (currentStep === 5 ? form.segmento : currentStep === 6 ? form.necessidade : form.origem) === opt.id ? "text-primary-novaes" : "text-white/20")} 
                        />
                        <span className="text-[10px] font-black uppercase tracking-widest leading-tight">{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* STEP 7: VOLUMES (TEXT ONLY) */}
              {currentStep === 7 && (
                <motion.div key="s7" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                   <div className="space-y-2">
                    <h2 className="text-sm font-black text-primary-novaes uppercase tracking-[0.3em]">Passo 7 de 9</h2>
                    <h1 className="text-3xl lg:text-4xl font-black font-space">Qual seu volume atual de pedidos?</h1>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    {VOLUMES.map(opt => (
                      <button 
                        key={opt.id} 
                        onClick={() => {
                          updateForm("volume", opt.id);
                          setTimeout(handleNext, 300);
                        }}
                        className={cn("p-6 rounded-2xl border-2 text-left transition-all text-sm font-bold uppercase tracking-widest",
                          form.volume === opt.id ? "bg-white/10 border-primary-novaes" : "bg-white/5 border-white/5 hover:bg-white/10"
                        )}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* STEP 9: DESCRIÇÃO */}
              {currentStep === 9 && (
                <motion.div key="s9" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">
                   <div className="space-y-2">
                    <h2 className="text-sm font-black text-primary-novaes uppercase tracking-[0.3em]">Passo Final</h2>
                    <h1 className="text-3xl lg:text-4xl font-black font-space">Fale um pouco mais sobre o projeto...</h1>
                  </div>
                  <Textarea 
                    autoFocus
                    className="min-h-[220px] bg-white/5 border-white/5 rounded-3xl p-8 text-lg font-medium focus:border-primary-novaes/50 transition-all placeholder:text-white/5 leading-relaxed"
                    placeholder="Quais seus objetivos, desafios ou sonhos para este projeto?"
                    value={form.mensagem}
                    onChange={(e) => updateForm("mensagem", e.target.value)}
                  />
                </motion.div>
              )}

              {/* STEP 10: SUCESSO */}
              {currentStep === 10 && (
                <motion.div key="s10" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center space-y-8 flex flex-col items-center">
                  <div className="w-24 h-24 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center mb-4">
                    <Check className="w-12 h-12 text-emerald-500 stroke-[3px]" />
                  </div>
                  <div className="space-y-4">
                    <h1 className="text-5xl font-black font-space tracking-tight">ENVIADO COM <br /> <span className="text-primary-novaes italic">PERFEIÇÃO!</span></h1>
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

          {/* RODAPÉ DE NAVEGAÇÃO */}
          {currentStep > 0 && currentStep < 10 && (
            <div className="p-8 lg:p-14 pt-0 flex items-center justify-between mt-auto">
              <Button variant="ghost" className="h-12 text-white/30 hover:text-white font-black uppercase tracking-[0.3em] text-[10px] p-0" onClick={handlePrev}>
                ◄ Voltar
              </Button>
              <Button 
                onClick={handleNext} 
                disabled={loading}
                className={cn("h-16 px-10 rounded-2xl sidebar-novaes-gradient font-black uppercase tracking-widest text-xs shadow-xl transition-all flex items-center gap-3",
                  loading && "opacity-50")}
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  currentStep === 9 ? "Finalizar Agora" : "Próximo Passo ►"
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
