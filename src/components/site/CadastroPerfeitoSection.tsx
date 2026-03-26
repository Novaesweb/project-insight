import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Check, MessageCircle, Building, Store,
  Loader2, Rocket, Zap, Globe, ShieldCheck, Mail,
  Users, Layout, Target, Package, Instagram, Search, HelpCircle, ArrowRight, ArrowLeft, Sparkles
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { sendPushToAdmins } from "@/lib/push-notifications";
import { cn } from "@/lib/utils";
import webnovaxPremiumLogo from "@/assets/webnovax-premium-logo.png";

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
  "Identificação", "E-mail", "WhatsApp", "Seu Negócio",
  "Necessidade", "Volume", "Origem", "Briefing"
];

const formatWhatsApp = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
};

const validateWhatsApp = (w: string) => { const d = w.replace(/\D/g, ""); return d.length >= 10; };

export default function CadastroPerfeitoSection() {
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
      sendPushToAdmins("🆕 Novo Lead Interativo", `${form.nome} (${form.empresa})`, "/admin/leads");
      setCurrentStep(9);
    }
  };

  const progressPercent = Math.min((currentStep / 9) * 100, 100);

  return (
    <section id="cadastro" className="relative py-24 lg:py-32 overflow-hidden" style={{ background: 'hsl(var(--background))' }}>
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          animate={{ y: [0, -20, 0], x: [0, 10, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[5%] right-[10%] w-[500px] h-[500px] rounded-full opacity-[0.07]"
          style={{ background: 'radial-gradient(circle, hsl(var(--primary)), transparent 70%)' }}
        />
        <motion.div
          animate={{ y: [0, 15, 0], x: [0, -15, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 3 }}
          className="absolute bottom-[10%] left-[5%] w-[400px] h-[400px] rounded-full opacity-[0.05]"
          style={{ background: 'radial-gradient(circle, hsl(var(--accent)), transparent 70%)' }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-bold uppercase tracking-widest mb-5">
            <Sparkles className="w-3.5 h-3.5" />
            Comece agora
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-foreground tracking-tight mb-4">
            Transforme sua{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              visão em realidade
            </span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-lg">
            Preencha o formulário inteligente e receba uma proposta personalizada em até 24h.
          </p>
        </motion.div>

        {/* Form Container */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15 }}
          className="max-w-4xl mx-auto"
        >
          <div className="rounded-3xl border border-border/50 overflow-hidden backdrop-blur-2xl relative"
            style={{
              background: 'hsl(var(--card))',
              boxShadow: '0 40px 80px -20px hsl(var(--primary) / 0.08), 0 0 0 1px hsl(var(--border) / 0.2)',
            }}
          >
            {/* Top glow line */}
            <div className="h-px w-full" style={{
              background: 'linear-gradient(90deg, transparent, hsl(var(--primary) / 0.5), hsl(var(--accent) / 0.5), transparent)',
            }} />

            {/* Progress bar */}
            <div className="h-1 w-full bg-muted/50">
              <motion.div
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="h-full rounded-r-full"
                style={{ background: 'linear-gradient(90deg, hsl(var(--primary)), hsl(var(--accent)))' }}
              />
            </div>

            {/* Step indicators (desktop) */}
            {currentStep > 0 && currentStep < 9 && (
              <div className="hidden lg:flex items-center gap-1 px-10 pt-8 pb-2">
                {STEPS_SIDEBAR.map((label, i) => {
                  const stepIdx = i + 1;
                  const isActive = currentStep === stepIdx;
                  const isCompleted = currentStep > stepIdx;
                  return (
                    <div key={i} className="flex items-center gap-1">
                      <div className={cn(
                        "flex items-center gap-2 px-2.5 py-1 rounded-full transition-all duration-300 text-[10px] font-bold uppercase tracking-wider",
                        isActive && "bg-primary/10 text-primary",
                        isCompleted && "text-primary/60",
                        !isActive && !isCompleted && "text-muted-foreground/40"
                      )}>
                        <div className={cn(
                          "w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black transition-all",
                          isActive && "bg-primary text-primary-foreground",
                          isCompleted && "bg-primary/20 text-primary",
                          !isActive && !isCompleted && "bg-muted text-muted-foreground/50"
                        )}>
                          {isCompleted ? <Check className="w-3 h-3" /> : stepIdx}
                        </div>
                        <span className="hidden xl:inline">{label}</span>
                      </div>
                      {i < STEPS_SIDEBAR.length - 1 && (
                        <div className={cn("w-4 h-px transition-colors", isCompleted ? "bg-primary/30" : "bg-border")} />
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Content Area */}
            <div className="p-8 sm:p-10 lg:p-14 min-h-[420px] flex flex-col justify-center">
              <AnimatePresence mode="wait">
                {/* STEP 0: Welcome */}
                {currentStep === 0 && (
                  <motion.div key="s0" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="text-center space-y-8">
                    <div className="relative mx-auto w-fit">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        className="absolute -inset-4 rounded-3xl opacity-40"
                        style={{ background: 'conic-gradient(from 0deg, hsl(var(--primary)), hsl(var(--accent)), hsl(var(--primary)))', filter: 'blur(12px)' }}
                      />
                      <div className="relative w-20 h-20 rounded-2xl flex items-center justify-center" style={{
                        background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))',
                      }}>
                        <Rocket className="w-10 h-10 text-white" />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-foreground leading-tight">
                        Vamos elevar seu<br />
                        <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">negócio?</span>
                      </h1>
                      <p className="text-muted-foreground text-lg max-w-md mx-auto">
                        Sua jornada para a perfeição digital começa aqui.
                      </p>
                    </div>
                    <motion.div whileTap={{ scale: 0.97 }}>
                      <Button onClick={handleNext} className="h-14 px-10 rounded-xl text-sm font-bold text-primary-foreground border-0 shadow-lg group"
                        style={{ background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))', boxShadow: '0 8px 30px -6px hsl(var(--primary) / 0.4)' }}>
                        Começar Agora <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </motion.div>
                  </motion.div>
                )}

                {/* STEPS 1-4: Text inputs */}
                {[1, 2, 3, 4].includes(currentStep) && (
                  <motion.div key={`s${currentStep}`} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }} className="space-y-6 max-w-lg mx-auto w-full">
                    <div className="space-y-2">
                      <span className="text-[11px] font-bold text-primary uppercase tracking-widest">Passo {currentStep} de 8</span>
                      <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                        {currentStep === 1 && "Qual seu nome completo?"}
                        {currentStep === 2 && "Qual seu melhor e-mail?"}
                        {currentStep === 3 && "Seu WhatsApp direto?"}
                        {currentStep === 4 && "Qual o nome do negócio?"}
                      </h2>
                    </div>
                    <div className="relative group">
                      {currentStep === 2 && <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/20 group-focus-within:text-primary/40 transition-colors" />}
                      <Input
                        autoFocus
                        className="h-16 bg-muted/30 border-border/50 rounded-xl text-xl font-semibold px-6 text-foreground focus:border-primary/40 focus:bg-muted/50 transition-all placeholder:text-muted-foreground/30"
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
                      <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-destructive text-xs font-semibold pl-2">
                        {errors[currentStep === 1 ? "nome" : currentStep === 2 ? "email" : currentStep === 3 ? "whatsapp" : "empresa"]}
                      </motion.p>
                    )}
                  </motion.div>
                )}

                {/* STEPS 5, 7: Grid selections */}
                {[5, 7].includes(currentStep) && (
                  <motion.div key={`s${currentStep}`} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="space-y-6 w-full">
                    <div className="space-y-2 text-center">
                      <span className="text-[11px] font-bold text-primary uppercase tracking-widest">Passo {currentStep} de 8</span>
                      <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                        {currentStep === 5 && "O que você precisa agora?"}
                        {currentStep === 7 && "Como nos conheceu?"}
                      </h2>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {(currentStep === 5 ? NECESSIDADES : ORIGENS).map(opt => {
                        const selected = (currentStep === 5 ? form.necessidade : form.origem) === opt.id;
                        return (
                          <motion.button
                            key={opt.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => {
                              updateForm(currentStep === 5 ? "necessidade" : "origem", opt.id);
                              setTimeout(handleNext, 350);
                            }}
                            className={cn(
                              "flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all duration-300 group",
                              selected
                                ? "bg-primary/10 border-primary shadow-lg shadow-primary/10"
                                : "bg-muted/20 border-border/30 hover:border-primary/30 hover:bg-muted/40"
                            )}
                          >
                            <opt.icon className={cn("w-8 h-8 transition-colors", selected ? "text-primary" : "text-muted-foreground/40 group-hover:text-muted-foreground/70")} />
                            <span className={cn("text-xs font-bold uppercase tracking-wider", selected ? "text-primary" : "text-muted-foreground")}>{opt.label}</span>
                          </motion.button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {/* STEP 6: Volumes */}
                {currentStep === 6 && (
                  <motion.div key="s6" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-6 max-w-lg mx-auto w-full">
                    <div className="space-y-2">
                      <span className="text-[11px] font-bold text-primary uppercase tracking-widest">Passo 6 de 8</span>
                      <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">Volume atual de pedidos?</h2>
                    </div>
                    <div className="grid grid-cols-1 gap-2.5">
                      {VOLUMES.map(opt => {
                        const selected = form.volume === opt.id;
                        return (
                          <motion.button
                            key={opt.id}
                            whileHover={{ x: 4 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                              updateForm("volume", opt.id);
                              setTimeout(handleNext, 300);
                            }}
                            className={cn(
                              "flex items-center gap-4 p-5 rounded-xl border-2 text-left transition-all duration-300 group",
                              selected
                                ? "bg-primary/10 border-primary"
                                : "bg-muted/20 border-border/30 hover:border-primary/20 hover:bg-muted/30"
                            )}
                          >
                            <div className={cn(
                              "w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all",
                              selected ? "border-primary bg-primary" : "border-muted-foreground/30"
                            )}>
                              {selected && <Check className="w-2.5 h-2.5 text-primary-foreground" />}
                            </div>
                            <span className={cn("text-sm font-bold", selected ? "text-primary" : "text-muted-foreground")}>{opt.label}</span>
                          </motion.button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {/* STEP 8: Briefing */}
                {currentStep === 8 && (
                  <motion.div key="s8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6 max-w-lg mx-auto w-full">
                    <div className="space-y-2">
                      <span className="text-[11px] font-bold text-primary uppercase tracking-widest">Passo Final</span>
                      <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">Fale mais sobre seu projeto</h2>
                    </div>
                    <Textarea
                      autoFocus
                      className="min-h-[200px] bg-muted/30 border-border/50 rounded-xl p-6 text-base font-medium text-foreground focus:border-primary/40 focus:bg-muted/50 transition-all placeholder:text-muted-foreground/30 resize-none"
                      placeholder="Quais seus objetivos, desafios ou sonhos para este projeto?"
                      value={form.mensagem}
                      onChange={(e) => updateForm("mensagem", e.target.value)}
                    />
                    {errors.mensagem && (
                      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-destructive text-xs font-semibold pl-2">
                        {errors.mensagem}
                      </motion.p>
                    )}
                  </motion.div>
                )}

                {/* STEP 9: Success */}
                {currentStep === 9 && (
                  <motion.div key="s9" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center space-y-6 flex flex-col items-center py-8">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                      className="w-20 h-20 rounded-full flex items-center justify-center"
                      style={{ background: 'linear-gradient(135deg, hsl(var(--success)), hsl(142 76% 35%))' }}
                    >
                      <Check className="w-10 h-10 text-white stroke-[3px]" />
                    </motion.div>
                    <div className="space-y-3">
                      <h2 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
                        Enviado com{" "}
                        <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">sucesso!</span>
                      </h2>
                      <p className="text-muted-foreground text-lg max-w-sm mx-auto">
                        Nossa equipe entrará em contato em breve. Prepare-se para decolar! 🚀
                      </p>
                    </div>
                    <Button onClick={() => { setCurrentStep(0); setForm({ nome: "", email: "", whatsapp: "", empresa: "", necessidade: "", volume: "", origem: "", mensagem: "" }); }}
                      variant="outline" className="h-12 px-8 rounded-xl font-bold text-sm">
                      Novo Cadastro
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Navigation Footer */}
            {currentStep > 0 && currentStep < 9 && (
              <div className="px-8 sm:px-10 lg:px-14 pb-8 flex items-center justify-between">
                <Button variant="ghost" className="h-10 text-muted-foreground hover:text-foreground font-semibold text-xs gap-2" onClick={handlePrev}>
                  <ArrowLeft className="w-3.5 h-3.5" /> Voltar
                </Button>
                <motion.div whileTap={{ scale: 0.97 }}>
                  <Button
                    onClick={handleNext}
                    disabled={loading}
                    className="h-12 px-8 rounded-xl font-bold text-sm text-primary-foreground border-0 shadow-lg group"
                    style={{
                      background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))',
                      boxShadow: '0 6px 24px -6px hsl(var(--primary) / 0.35)',
                    }}
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                      <>
                        {currentStep === 8 ? "Finalizar" : "Próximo"}
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </Button>
                </motion.div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
