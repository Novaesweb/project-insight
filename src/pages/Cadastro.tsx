import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Check, MessageCircle, ChevronLeft, Building, Store,
  AlertCircle, Loader2, Star, Rocket, Zap, Globe, ShieldCheck, Mail
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { sendPushToAdmins } from "@/lib/push-notifications";
import { cn } from "@/lib/utils";

const servicosOpcoes = ["Site", "Loja Online"];
const orcamentoOpcoes = ["Até R$300", "R$300 a R$800", "R$800 a R$1.500", "Acima de R$1.500", "Não sei ainda"];
const origemOpcoes = ["Instagram", "WhatsApp", "Indicação", "Google", "TikTok", "Outro"];

const beneficios = [
  { icon: Rocket, text: "Entrega em tempo recorde" },
  { icon: Globe, text: "Sites de alta performance" },
  { icon: ShieldCheck, text: "Suporte dedicado 24/7" },
  { icon: Zap, text: "Design moderno e responsivo" },
];

const formatWhatsApp = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
};

const validateWhatsApp = (w: string) => { const d = w.replace(/\D/g, ""); return d.length === 10 || d.length === 11; };

type FieldErrors = { [key: string]: string };

const containerVariants: any = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 }
  }
};

const itemVariants: any = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.8, ease: "easeOut" } 
  }
};

export default function Cadastro() {
  const { toast } = useToast();
  const [enviado, setEnviado] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;
  const [errors, setErrors] = useState<FieldErrors>({});
  const [form, setForm] = useState({
    nome: "", email: "", whatsapp: "", nome_negocio: "", tipo_negocio: "",
    servicos: [] as string[], orcamento: "", como_conheceu: "", mensagem: "",
  });

  const updateForm = (field: string, value: string | string[]) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
  };

  const toggleServico = (s: string) => setForm(prev => ({
    ...prev, servicos: prev.servicos.includes(s) ? prev.servicos.filter(x => x !== s) : [...prev.servicos, s],
  }));

  const validateStep = (step: number): boolean => {
    const errs: FieldErrors = {};
    
    if (step === 1) {
      if (!form.nome.trim()) errs.nome = "Nome é obrigatório";
      if (!form.email.trim() || !form.email.includes("@")) errs.email = "E-mail inválido";
      if (!form.whatsapp.trim() || !validateWhatsApp(form.whatsapp)) errs.whatsapp = "WhatsApp inválido";
    }
    
    if (step === 2) {
      if (!form.nome_negocio.trim()) errs.nome_negocio = "Nome do negócio é obrigatório";
      if (!form.tipo_negocio.trim()) errs.tipo_negocio = "Tipo de negócio é obrigatório";
    }
    
    if (step === 3) {
      if (form.servicos.length === 0) errs.servicos = "Selecione o que você precisa";
    }

    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      toast({ title: "Atenção", description: "Preencha os campos obrigatórios para continuar", variant: "destructive" });
      return false;
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      if (currentStep < totalSteps) setCurrentStep(prev => prev + 1);
      else handleSubmit();
    }
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    const { error } = await supabase.from("leads").insert({
      nome: form.nome.trim(),
      email: form.email.trim(),
      whatsapp: form.whatsapp.replace(/\D/g, ""),
      nome_negocio: form.nome_negocio.trim(),
      segmento: form.tipo_negocio.trim(), 
      servicos: form.servicos,
      orcamento: form.orcamento || null,
      como_conheceu: form.como_conheceu || null,
      mensagem: form.mensagem || null,
    } as any);

    setLoading(false);
    if (error) {
      toast({ title: "Erro ao enviar", description: error.message, variant: "destructive" });
    } else {
      setEnviado(true);
      
      // Enviar e-mail via Edge Function
      supabase.functions.invoke("send-lead-email", {
        body: { ...form, whatsapp: form.whatsapp.replace(/\D/g, "") }
      });

      sendPushToAdmins("🆕 Novo Cadastro Perfeito", `${form.nome} está interessado em ${form.servicos.join(", ")}`, "/admin/leads");
    }
  };

  const FieldError = ({ field }: { field: string }) => errors[field] ? (
    <motion.p initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }} className="text-[10px] text-primary flex items-center gap-1.5 mt-1.5 font-bold uppercase tracking-wider">
      <AlertCircle className="w-3 h-3" /> {errors[field]}
    </motion.p>
  ) : null;

  const inputClass = (field?: string) =>
    cn(
      "glass-input text-white h-12 sm:h-14 rounded-2xl text-base px-6 placeholder:text-white/20 transition-all font-medium",
      "focus:ring-2 focus:ring-primary/20",
      field && errors[field] ? "border-primary/50 ring-1 ring-primary/20" : "border-white/5 focus:border-primary/30 shadow-[0_0_0_0_rgba(255,51,102,0)] focus:shadow-[0_0_20px_rgba(255,51,102,0.1)]"
    );

  const labelClass = "text-[11px] font-black uppercase tracking-[0.2em] text-white/30 ml-1 mb-2 block";

  if (enviado) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden ambient-glow">
        <div className="ultra-premium-bg" />
        <div className="ambient-rays-unified" />
        
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }} 
          animate={{ scale: 1, opacity: 1 }} 
          className="text-center max-w-lg glass-panel-premium p-12 rounded-[2.5rem] border-white/5 relative z-10 shadow-2xl"
        >
          <motion.div
            initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.2 }}
            className="w-24 h-24 rounded-3xl gradient-primary mx-auto flex items-center justify-center mb-8 shadow-xl"
          >
            <Check className="w-12 h-12 text-white stroke-[3px]" />
          </motion.div>
          
          <h1 className="text-4xl font-black text-white mb-6 tracking-tighter leading-tight">
            Cadastro enviado <br />
            <span className="gradient-text">com sucesso! 🚀</span>
          </h1>
          <div className="space-y-4 text-white/60 mb-10 text-lg font-medium leading-relaxed">
            <p>Recebemos suas informações e já vamos analisar seu projeto com atenção.</p>
            <p className="text-primary font-black uppercase tracking-widest text-sm animate-pulse">👉 Fique atento, vamos te chamar em breve!</p>
          </div>
          
          <div className="flex flex-col gap-4">
            <Button className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-2xl h-14 text-base font-black gap-3 shadow-lg uppercase tracking-widest"
              onClick={() => window.open(`https://wa.me/5551981964238?text=${encodeURIComponent(`Olá! Sou ${form.nome}, acabei de me cadastrar no site da NovaesWeb.`)}`, "_blank")}>
              <MessageCircle className="w-6 h-6" /> Falar agora no WhatsApp
            </Button>
            <Link to="/">
              <Button variant="ghost" className="w-full text-white/40 hover:text-white font-bold h-12">
                Voltar para a página inicial
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 lg:p-8 relative overflow-hidden ambient-glow">
      <div className="ultra-premium-bg" />
      <div className="ambient-rays-unified" />

      <div className="w-full max-w-4xl relative z-10 flex flex-col items-center">
        {/* HEADER / LOGO */}
        <div className="mb-8 flex flex-col items-center gap-4 text-center">
          <Link to="/" className="inline-flex items-center gap-3 mb-2 group">
            <motion.div whileHover={{ rotate: 10, scale: 1.1 }} className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center shadow-lg">
              <Zap className="text-white w-6 h-6 fill-current" />
            </motion.div>
            <span className="text-2xl font-black tracking-tighter">
              <span className="gradient-text">Novaes</span>
              <span className="text-white">Web</span>
            </span>
          </Link>
          <div className="space-y-1">
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tighter">
              Plano de <span className="gradient-text">Aceleração</span>
            </h1>
            <p className="text-white/30 font-medium text-sm">Responda o briefing e receba seu orçamento em tempo recorde.</p>
          </div>
        </div>

        {/* WIZARD CARD */}
        <motion.div 
          initial="hidden" 
          animate="visible" 
          variants={containerVariants}
          className="w-full glass-panel-premium rounded-[3.5rem] p-8 sm:p-16 border-white/5 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 blur-[120px] rounded-full" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-accent/10 blur-[120px] rounded-full" />
          
          <div className="space-y-12 relative z-10">
            {/* ─ PROGRESS BAR ─ */}
            <div className="flex flex-col gap-5">
              <div className="flex justify-between items-end">
                <div className="space-y-1">
                  <span className="text-[11px] font-black uppercase tracking-[0.4em] text-primary animate-pulse flex items-center gap-2">
                    <Rocket className="w-3 h-3" /> Jornada: Passo {currentStep} de {totalSteps}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-white/40 text-[10px] font-black uppercase tracking-widest">Completo:</span>
                  <span className="text-white text-sm font-black tracking-widest">{Math.round((currentStep / totalSteps) * 100)}%</span>
                </div>
              </div>
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden p-[2px] border border-white/5">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
                  className="h-full gradient-primary rounded-full shadow-[0_0_20px_rgba(255,51,102,0.4)] relative"
                >
                   <div className="absolute inset-0 bg-white/20 animate-pulse" />
                </motion.div>
              </div>
            </div>

            {/* ─ STEP CONTENT ─ */}
            <div className="min-h-[350px] flex flex-col justify-start relative">
              <AnimatePresence mode="wait">
                {currentStep === 1 && (
                  <motion.div 
                    key="step1"
                    initial={{ opacity: 0, scale: 0.98, y: 10 }} 
                    animate={{ opacity: 1, scale: 1, y: 0 }} 
                    exit={{ opacity: 0, scale: 1.02, y: -10 }} 
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-8"
                  >
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <Label className={labelClass}>Seu nome completo <span className="text-primary">*</span></Label>
                        <div className="relative">
                          <Input className={inputClass("nome")} value={form.nome} onChange={e => updateForm("nome", e.target.value)} placeholder="Como podemos te chamar?" />
                        </div>
                        <FieldError field="nome" />
                      </div>
                      <div className="space-y-3">
                        <Label className={labelClass}>E-mail / Gmail <span className="text-primary">*</span></Label>
                        <div className="relative group">
                          <Mail className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/10 group-focus-within:text-primary transition-colors" />
                          <Input type="email" className={cn(inputClass("email"), "pr-14")} value={form.email} onChange={e => updateForm("email", e.target.value)} placeholder="seu@gmail.com" />
                        </div>
                        <FieldError field="email" />
                      </div>
                    </div>
                    
                    <div className="flex flex-col justify-center gap-6">
                      <div className="space-y-3">
                        <Label className={labelClass}>WhatsApp Direto <span className="text-primary">*</span></Label>
                        <div className="relative">
                          <Input className={inputClass("whatsapp")} placeholder="(00) 00000-0000" value={form.whatsapp} onChange={e => updateForm("whatsapp", formatWhatsApp(e.target.value))} />
                        </div>
                        <FieldError field="whatsapp" />
                      </div>
                      <div className="p-4 rounded-3xl bg-primary/5 border border-primary/10">
                        <p className="text-[10px] text-primary/60 font-medium leading-relaxed uppercase tracking-wider">
                          <ShieldCheck className="w-4 h-4 inline mr-2" /> 
                          Seus dados estão protegidos pela NovaesWeb Encryption.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {currentStep === 2 && (
                  <motion.div 
                    key="step2"
                    initial={{ opacity: 0, scale: 0.98, y: 10 }} 
                    animate={{ opacity: 1, scale: 1, y: 0 }} 
                    exit={{ opacity: 0, scale: 1.02, y: -10 }} 
                    transition={{ duration: 0.4 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-8"
                  >
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <Label className={labelClass}>Nome do negócio / Startup <span className="text-primary">*</span></Label>
                        <Input className={inputClass("nome_negocio")} value={form.nome_negocio} onChange={e => updateForm("nome_negocio", e.target.value)} placeholder="Ex: NovaesWeb Solutions" />
                        <FieldError field="nome_negocio" />
                      </div>
                      <div className="space-y-3">
                        <Label className={labelClass}>Segmento de Atuação <span className="text-primary">*</span></Label>
                        <Input className={inputClass("tipo_negocio")} value={form.tipo_negocio} onChange={e => updateForm("tipo_negocio", e.target.value)} placeholder="Ex: Tecnologia, Varejo, Serviços..." />
                        <FieldError field="tipo_negocio" />
                      </div>
                    </div>
                    <div className="bg-white/5 rounded-3xl p-8 flex flex-col items-center justify-center text-center gap-4 border border-white/5">
                      <Building className="w-16 h-16 text-white/10" />
                      <p className="text-white/30 text-xs font-medium italic">"Conhecer seu nicho nos ajuda a aplicar as estratégias de conversão corretas."</p>
                    </div>
                  </motion.div>
                )}

                {currentStep === 3 && (
                  <motion.div 
                    key="step3"
                    initial={{ opacity: 0, scale: 0.98, y: 10 }} 
                    animate={{ opacity: 1, scale: 1, y: 0 }} 
                    exit={{ opacity: 0, scale: 1.02, y: -10 }} 
                    transition={{ duration: 0.4 }}
                    className="space-y-10"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                      <div className="space-y-6">
                        <Label className={labelClass}>O que você precisa hoje? <span className="text-primary">*</span></Label>
                        <div className="grid grid-cols-1 gap-4">
                          {servicosOpcoes.map(s => (
                            <label key={s} className={cn(
                              "flex items-center gap-4 p-6 rounded-[2rem] border-2 cursor-pointer transition-all text-sm font-black uppercase tracking-widest group",
                              form.servicos.includes(s) ? "border-primary bg-primary/10 text-white shadow-xl shadow-primary/20" : "border-white/5 bg-white/5 text-white/20 hover:border-white/20"
                            )}>
                              <Checkbox checked={form.servicos.includes(s)} onCheckedChange={() => toggleServico(s)} className="w-6 h-6 border-white/10 rounded-lg group-hover:scale-110 transition-transform" />
                              <span className="flex-1">{s}</span>
                              {s === "Loja Online" ? <Store className="w-5 h-5 opacity-20" /> : <Globe className="w-5 h-5 opacity-20" />}
                            </label>
                          ))}
                        </div>
                        <FieldError field="servicos" />
                      </div>

                      <div className="space-y-6">
                        <Label className={labelClass}>Expectativa de Investimento</Label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {orcamentoOpcoes.map(o => (
                            <button key={o} onClick={() => updateForm("orcamento", o)} className={cn(
                              "p-4 rounded-2xl border transition-all text-[10px] font-black tracking-[0.2em] uppercase text-left",
                              form.orcamento === o ? "border-primary bg-primary text-white shadow-lg shadow-primary/30" : "border-white/5 bg-white/5 text-white/30 hover:bg-white/10"
                            )}>
                              {o}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {currentStep === 4 && (
                  <motion.div 
                    key="step4"
                    initial={{ opacity: 0, scale: 0.98, y: 10 }} 
                    animate={{ opacity: 1, scale: 1, y: 0 }} 
                    exit={{ opacity: 0, scale: 1.02, y: -10 }} 
                    transition={{ duration: 0.4 }}
                    className="space-y-8"
                  >
                    <div className="space-y-4">
                      <Label className={labelClass}>Resumo do Projeto / Briefing</Label>
                      <Textarea
                        className="glass-input border-white/5 text-white rounded-[2.5rem] text-lg min-h-[180px] p-10 focus:border-primary/30 placeholder:text-white/10 leading-relaxed shadow-inner"
                        value={form.mensagem} onChange={e => updateForm("mensagem", e.target.value)}
                        placeholder="Quais seus objetivos, desafios ou sonhos para este projeto?"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
                      <div className="space-y-4">
                        <Label className={labelClass}>Como nos conheceu?</Label>
                        <div className="flex flex-wrap gap-2">
                          {origemOpcoes.map(o => (
                            <button key={o} onClick={() => updateForm("como_conheceu", o)} className={cn(
                              "px-5 py-3 rounded-full border text-[10px] font-bold uppercase tracking-widest transition-all",
                              form.como_conheceu === o ? "border-primary bg-primary/20 text-white" : "border-white/5 bg-white/5 text-white/20 hover:text-white/40"
                            )}>{o}</button>
                          ))}
                        </div>
                      </div>
                      <div className="flex justify-end p-2">
                        <p className="text-[10px] text-white/20 font-black uppercase tracking-[0.3em] flex items-center gap-3">
                          <Zap className="w-4 h-4 text-primary animate-pulse" /> IA Analisando Dados em Real-time
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ─ FOOTER / ACTIONS ─ */}
            <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-white/5">
              <div className="flex-1 flex gap-3">
                {currentStep > 1 && (
                  <Button variant="ghost" className="h-16 px-10 rounded-2xl text-white/30 hover:text-white hover:bg-white/5 font-black uppercase tracking-[0.3em] text-xs transition-all flex items-center gap-3 group" onClick={prevStep}>
                    <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> Voltar
                  </Button>
                )}
              </div>
              <Button className={cn("h-18 px-12 rounded-[2rem] font-black text-sm uppercase tracking-[0.3em] shadow-2xl transition-all group relative overflow-hidden flex items-center gap-4", currentStep === totalSteps ? "w-full sm:w-auto gradient-primary" : "w-full sm:w-80")} onClick={nextStep} disabled={loading}>
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                  currentStep === totalSteps ? (
                    <>🚀 Enviar Briefing e Finalizar</>
                  ) : (
                    <>Continuar <Rocket className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /></>
                  )
                )}
              </Button>
            </div>
          </div>
        </motion.div>

        {/* FOOTER INFO */}
        <div className="mt-8 flex flex-wrap justify-center gap-8 opacity-20 text-[9px] font-black uppercase tracking-[0.5em] text-white">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-3 h-3" /> SSL Seguro
          </div>
          <div className="flex items-center gap-2">
             <Star className="w-3 h-3" /> Top Rated 2024
          </div>
          <div className="flex items-center gap-2">
             <Check className="w-3 h-3" /> Privacidade Garantida
          </div>
        </div>
      </div>
    </div>
  );
}
