import { useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Check, MessageCircle, Building, Store,
  Loader2, Rocket, Globe, Mail, X,
  Users, Layout, Target, Instagram, Search, HelpCircle,
  ArrowRight, ArrowLeft, Sparkles, Phone, User, Briefcase, ChevronRight
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { submitLeadCapture } from "@/lib/lead-capture";
import { cn } from "@/lib/utils";
import PublicAmbientBackground from "@/components/site/PublicAmbientBackground";

const NECESSIDADES = [
  { id: "site-painel", label: "Site + Painel", icon: Layout, desc: "Vitrine com operação integrada" },
  { id: "site-vitrine", label: "Site de Vitrine", icon: Globe, desc: "Presença profissional para apresentar a marca" },
  { id: "cardapio-delivery", label: "Cardapio Delivery", icon: Store, desc: "Estrutura para pedidos e delivery" },
];

const VOLUMES = [
  { id: "baixa", label: "Até 50/mês", emoji: "📦", desc: "Começando agora" },
  { id: "media", label: "50 a 500/mês", emoji: "📊", desc: "Em crescimento" },
  { id: "alta", label: "500 a 1.000/mês", emoji: "🚀", desc: "Alta escala" },
  { id: "expert", label: "Mais de 1.000/mês", emoji: "⚡", desc: "Enterprise" },
  { id: "nao_sei", label: "Não sei ainda", emoji: "🤔", desc: "Sem problema" },
];

const ORIGENS = [
  { id: "instagram", label: "Instagram", icon: Instagram },
  { id: "google", label: "Google", icon: Search },
  { id: "indicacao", label: "Indicação", icon: Users },
  { id: "whatsapp", label: "WhatsApp", icon: MessageCircle },
  { id: "tiktok", label: "TikTok", icon: Rocket },
  { id: "outro", label: "Outro", icon: HelpCircle },
];

const STEPS_META = [
  { num: 1, label: "Nome", icon: User },
  { num: 2, label: "E-mail", icon: Mail },
  { num: 3, label: "WhatsApp", icon: Phone },
  { num: 4, label: "Negócio", icon: Briefcase },
  { num: 5, label: "Necessidade", icon: Target },
  { num: 6, label: "Volume", icon: Rocket },
  { num: 7, label: "Origem", icon: Search },
  { num: 8, label: "Briefing", icon: MessageCircle },
];

const formatWhatsApp = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
};

const validateWhatsApp = (w: string) => w.replace(/\D/g, "").length >= 10;

const slideVariants = {
  enter: (direction: number) => ({ x: direction > 0 ? 80 : -80, opacity: 0, filter: "blur(4px)" }),
  center: { x: 0, opacity: 1, filter: "blur(0px)" },
  exit: (direction: number) => ({ x: direction > 0 ? -80 : 80, opacity: 0, filter: "blur(4px)" }),
};

export default function Cadastro() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    nome: "", email: "", whatsapp: "", empresa: "",
    necessidade: "", volume: "", origem: "", mensagem: "", _fax: ""
  });

  const updateForm = useCallback((field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
  }, [errors]);

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
      setDirection(1);
      if (currentStep < 9) setCurrentStep(prev => prev + 1);
      if (currentStep === 8) handleSubmit();
    } else {
      toast({ title: "Atenção", description: "Preencha o campo para continuar.", variant: "destructive" });
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    if (form._fax) { setTimeout(() => { setLoading(false); setCurrentStep(9); }, 1500); return; }

    const now = Date.now();
    const rateLimitStr = localStorage.getItem("cadastro_rate_limit");
    let rateData = rateLimitStr ? JSON.parse(rateLimitStr) : { count: 0, firstAt: now };
    if (now - rateData.firstAt > 10 * 60 * 1000) rateData = { count: 1, firstAt: now };
    else rateData.count += 1;
    localStorage.setItem("cadastro_rate_limit", JSON.stringify(rateData));

    if (rateData.count > 3) {
      toast({ title: "Limite excedido", description: "Por favor, aguarde alguns minutos antes de reenviar.", variant: "destructive" });
      setLoading(false);
      return;
    }

    let error: Error | null = null;
    try {
      await submitLeadCapture({
        nome: form.nome,
        email: form.email.trim(),
        whatsapp: form.whatsapp.replace(/\D/g, ""),
        nome_negocio: form.empresa,
        servicos: [form.necessidade],
        orcamento: form.volume,
        mensagem: form.mensagem,
        source: "cadastro-page",
        origin: window.location.pathname,
        _fax: form._fax,
      });
    } catch (err) {
      error = err instanceof Error ? err : new Error("Falha ao capturar lead");
    }
    setLoading(false);
    if (error) {
      toast({ title: "Erro ao enviar", description: error.message, variant: "destructive" });
    } else {
      setCurrentStep(9);
    }
  };

  const progress = currentStep === 0 ? 0 : Math.min((currentStep / 9) * 100, 100);

  return (
    <div
      className="public-site-unified public-funnel-shell min-h-screen overflow-x-hidden font-sans text-foreground relative"
      style={{ background: "hsl(var(--background))" }}
    >
      <PublicAmbientBackground />
      <div className="relative z-10 min-h-screen flex overflow-hidden">
      {/* Close button */}
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
        onClick={() => navigate(-1)}
        className="fixed top-5 right-5 z-50 w-10 h-10 rounded-full flex items-center justify-center transition-all group"
        style={{ background: 'hsl(var(--secondary))', border: '1px solid hsl(var(--border))' }}
        aria-label="Fechar"
      >
        <X className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
      </motion.button>

      {/* LEFT PANEL — Brand & Progress */}
      <div className="hidden lg:flex w-[400px] shrink-0 flex-col relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, hsl(var(--background)) 0%, hsl(260 20% 6%) 100%)" }}>
        
        {/* Decorative gradient orbs */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <motion.div
            className="absolute top-[10%] left-[15%] w-[350px] h-[350px] rounded-full blur-[140px] opacity-[0.08]"
            style={{ background: 'radial-gradient(circle, hsl(var(--primary)), transparent 70%)' }}
            animate={{ scale: [1, 1.15, 1], opacity: [0.06, 0.1, 0.06] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-[15%] right-[5%] w-[280px] h-[280px] rounded-full blur-[120px] opacity-[0.06]"
            style={{ background: 'radial-gradient(circle, hsl(var(--accent)), transparent 70%)' }}
            animate={{ scale: [1, 1.1, 1], opacity: [0.04, 0.08, 0.04] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        {/* Right edge line */}
        <div className="absolute top-0 bottom-0 right-0 w-px"
          style={{ background: 'linear-gradient(180deg, transparent, hsl(var(--border)), transparent)' }} />

        <div className="relative z-10 flex flex-col h-full p-8 pt-10">
          {/* Logo area */}
          <div className="mb-8">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute -inset-1 rounded-xl blur-lg opacity-20 group-hover:opacity-40 transition-opacity"
                  style={{ background: 'var(--gradient-primary)' }} />
                <div className="w-10 h-10 rounded-xl flex items-center justify-center relative"
                  style={{ background: 'var(--gradient-primary)' }}>
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
              </div>
              <div>
                <h2 className="text-base font-extrabold tracking-tight text-foreground leading-none">novaesweb</h2>
                <p className="text-[8px] font-bold uppercase tracking-[0.4em] text-muted-foreground mt-0.5">Engenharia Digital</p>
              </div>
            </Link>
          </div>

          {/* Dynamic motivational text based on step */}
          <div className="mb-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-xl font-extrabold tracking-tight leading-snug text-foreground/90 mb-2">
                  {currentStep === 0 && <>Transforme sua presença<br /><span className="gradient-text">digital hoje mesmo.</span></>}
                  {currentStep === 1 && <>Prazer em conhecer<br /><span className="gradient-text">você!</span></>}
                  {currentStep === 2 && <>Vamos manter<br /><span className="gradient-text">contato por e-mail.</span></>}
                  {currentStep === 3 && <>Atendimento rápido<br /><span className="gradient-text">pelo WhatsApp.</span></>}
                  {currentStep === 4 && <>Cada negócio é<br /><span className="gradient-text">único e especial.</span></>}
                  {currentStep === 5 && <>Entender sua necessidade<br /><span className="gradient-text">é o primeiro passo.</span></>}
                  {currentStep === 6 && <>Dimensionamos a solução<br /><span className="gradient-text">ideal para você.</span></>}
                  {currentStep === 7 && <>Obrigado por nos<br /><span className="gradient-text">encontrar!</span></>}
                  {currentStep === 8 && <>Estamos quase lá,<br /><span className="gradient-text">conte-nos tudo!</span></>}
                  {currentStep === 9 && <>Missão<br /><span className="gradient-text">cumprida! 🎉</span></>}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {currentStep === 0 && "Sua empresa precisa de um site e nós temos a solução para criar a melhor estrutura, do jeito que o seu estabelecimento merece."}
                  {currentStep === 1 && "Queremos te chamar pelo nome e oferecer um atendimento personalizado."}
                  {currentStep === 2 && "Enviaremos propostas e novidades exclusivas para você."}
                  {currentStep === 3 && "Respondemos em até 5 minutos durante horário comercial."}
                  {currentStep === 4 && "Entender sua marca nos ajuda a criar a solução perfeita."}
                  {currentStep === 5 && "Temos soluções sob medida para cada tipo de demanda."}
                  {currentStep === 6 && "Criamos projetos que escalam junto com o seu crescimento."}
                  {currentStep === 7 && "Isso nos ajuda a melhorar cada vez mais."}
                  {currentStep === 8 && "Quanto mais detalhes, mais assertiva será nossa proposta."}
                  {currentStep === 9 && "Nossa equipe já está preparando algo especial para você."}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Testimonial quote */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mb-8 p-4 rounded-2xl relative"
            style={{ background: 'hsl(var(--secondary) / 0.5)', border: '1px solid hsl(var(--border))' }}
          >
            <p className="text-xs text-muted-foreground italic leading-relaxed">
              "Desde que contratamos a NovaesWeb, nosso faturamento online cresceu 300%. O site ficou incrível e profissional!"
            </p>
            <div className="flex items-center gap-2 mt-3">
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-bold text-white"
                style={{ background: 'var(--gradient-primary)' }}>M</div>
              <div>
                <p className="text-[10px] font-bold text-foreground/80">Marina Silva</p>
                <p className="text-[9px] text-muted-foreground">Dona da Bella Massa</p>
              </div>
            </div>
          </motion.div>

          {/* Step navigator */}
          <div className="flex-1">
            <div className="space-y-0.5">
              {STEPS_META.map((step) => {
                const isActive = currentStep === step.num;
                const isCompleted = currentStep > step.num;
                const isFuture = currentStep < step.num;
                return (
                  <motion.div
                    key={step.num}
                    initial={false}
                    animate={{
                      backgroundColor: isActive ? 'hsl(var(--secondary))' : 'transparent',
                    }}
                    className="flex items-center gap-3 py-2 px-3 rounded-xl transition-all duration-300 cursor-default"
                  >
                    <div className={cn(
                      "w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black transition-all duration-400 shrink-0",
                      isActive && "shadow-lg",
                      isCompleted && "text-emerald-400",
                      isFuture && "text-muted-foreground/40"
                    )}
                      style={
                        isActive ? { background: 'var(--gradient-primary)' } :
                        isCompleted ? { background: 'hsl(var(--success) / 0.1)' } :
                        { background: 'hsl(var(--secondary))', border: '1px solid hsl(var(--border))' }
                      }
                    >
                      {isCompleted ? <Check className="w-3 h-3 stroke-[3px]" /> :
                        isActive ? <step.icon className="w-3 h-3 text-white" /> :
                        <span>{step.num}</span>}
                    </div>
                    <span className={cn(
                      "text-[11px] font-semibold tracking-wide transition-all duration-300",
                      isActive ? "text-foreground" : isCompleted ? "text-muted-foreground" : "text-muted-foreground/40"
                    )}>
                      {step.label}
                    </span>
                    {isActive && (
                      <motion.div layoutId="step-indicator" className="ml-auto">
                        <ChevronRight className="w-3 h-3 text-primary" />
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Progress bar */}
          <div className="space-y-2 pt-4">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-muted-foreground">Progresso</span>
              <span className="text-[11px] font-black text-foreground/60">{Math.round(progress)}%</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'hsl(var(--secondary))' }}>
              <motion.div
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="h-full rounded-full"
                style={{ background: 'var(--gradient-primary)' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL — Form content */}
      <div className="flex-1 flex flex-col relative">
        {/* Mobile header */}
        <div className="lg:hidden">
          <div className="h-1 w-full" style={{ background: 'hsl(var(--secondary))' }}>
            <motion.div animate={{ width: `${progress}%` }} transition={{ duration: 0.5 }}
              className="h-full rounded-r-full" style={{ background: 'var(--gradient-primary)' }} />
          </div>
          {currentStep > 0 && currentStep < 9 && (
            <div className="flex items-center justify-between px-5 pt-4 pb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" style={{ color: 'hsl(var(--primary))' }} />
                <span className="text-xs font-extrabold text-foreground">novaesweb</span>
              </div>
              <div className="flex items-center gap-1.5">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className={cn("h-1 rounded-full transition-all duration-300",
                    i < currentStep ? "w-5" : "w-1.5")}
                    style={{ background: i < currentStep ? 'hsl(var(--primary))' : 'hsl(var(--secondary))' }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Form area */}
        <div className="flex-1 flex items-center justify-center px-6 sm:px-10 lg:px-16 py-10 lg:py-14 relative">
          {/* Honeypot */}
          <input type="text" name="_fax" tabIndex={-1} aria-hidden="true" autoComplete="none" className="opacity-0 absolute -z-10 w-0 h-0" value={form._fax} onChange={(e) => updateForm("_fax", e.target.value)} />

          <AnimatePresence mode="wait" custom={direction}>
            {/* Step 0: Welcome */}
            {currentStep === 0 && (
              <motion.div
                key="welcome"
                custom={direction}
                variants={slideVariants}
                initial="enter" animate="center" exit="exit"
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="w-full max-w-lg space-y-8"
              >
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="w-20 h-20 rounded-3xl flex items-center justify-center relative"
                  style={{ background: 'var(--gradient-primary)' }}
                >
                  <div className="absolute inset-0 rounded-3xl blur-2xl opacity-30" style={{ background: 'var(--gradient-primary)' }} />
                  <Rocket className="w-10 h-10 text-white relative z-10" />
                </motion.div>

                <div className="space-y-4">
                  <h1 className="text-4xl lg:text-5xl font-black tracking-tight leading-[1.05] text-foreground">
                    Vamos construir<br />
                    <span className="gradient-text">algo incrível?</span>
                  </h1>
                  <p className="text-base lg:text-lg text-muted-foreground font-medium leading-relaxed max-w-md">
                    Sua empresa precisa de um site e nós temos a solução para criar a melhor estrutura, do jeito que o seu estabelecimento merece.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-start gap-3">
                  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                    <Button onClick={handleNext}
                      className="h-14 px-10 rounded-2xl font-bold text-white border-0 group flex items-center gap-3 text-base"
                      style={{ background: 'var(--gradient-primary)', boxShadow: '0 15px 40px -10px hsl(var(--primary) / 0.35)' }}>
                      <Sparkles className="w-4 h-4" />
                      Começar agora
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </motion.div>
                </div>

                <div className="flex items-center gap-6 pt-4" style={{ color: 'hsl(var(--muted-foreground) / 0.5)' }}>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider">
                    <Check className="w-3 h-3" /> Gratuito
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider">
                    <Check className="w-3 h-3" /> 2 min
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider">
                    <Check className="w-3 h-3" /> Sem compromisso
                  </div>
                </div>
              </motion.div>
            )}

            {/* Steps 1-4: Input fields */}
            {[1, 2, 3, 4].includes(currentStep) && (
              <InputStep
                key={`input-${currentStep}`}
                step={currentStep}
                form={form}
                errors={errors}
                updateForm={updateForm}
                onNext={handleNext}
                direction={direction}
              />
            )}

            {/* Step 5 & 7: Card selection */}
            {[5, 7].includes(currentStep) && (
              <motion.div
                key={`select-${currentStep}`}
                custom={direction}
                variants={slideVariants}
                initial="enter" animate="center" exit="exit"
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="w-full max-w-xl space-y-8"
              >
                <StepHeader step={currentStep} label={currentStep === 5 ? "O que você precisa agora?" : "Como nos conheceu?"} />
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {(currentStep === 5 ? NECESSIDADES : ORIGENS).map((opt, idx) => {
                    const selected = (currentStep === 5 ? form.necessidade : form.origem) === opt.id;
                    return (
                      <motion.button
                        key={opt.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        whileHover={{ scale: 1.03, y: -2 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => { updateForm(currentStep === 5 ? "necessidade" : "origem", opt.id); setTimeout(handleNext, 300); }}
                        className={cn(
                          "flex flex-col items-center justify-center p-5 rounded-2xl transition-all duration-300 gap-2.5 group relative overflow-hidden",
                          selected
                            ? "shadow-lg"
                            : "hover:bg-secondary/80"
                        )}
                        style={{
                          background: selected ? 'hsl(var(--primary) / 0.1)' : 'hsl(var(--secondary))',
                          border: `1px solid ${selected ? 'hsl(var(--primary) / 0.4)' : 'hsl(var(--border))'}`,
                          boxShadow: selected ? '0 8px 30px hsl(var(--primary) / 0.15)' : undefined,
                        }}
                      >
                        <opt.icon className={cn("w-6 h-6 transition-all duration-300",
                          selected ? "text-primary" : "text-muted-foreground/40 group-hover:text-muted-foreground")} />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-center leading-tight">
                          {opt.label}
                        </span>
                        {"desc" in opt && <span className="text-[8px] text-muted-foreground/50 font-medium">{(opt as any).desc}</span>}
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Step 6: Volume */}
            {currentStep === 6 && (
              <motion.div
                key="volume"
                custom={direction}
                variants={slideVariants}
                initial="enter" animate="center" exit="exit"
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="w-full max-w-xl space-y-8"
              >
                <StepHeader step={6} label="Qual seu volume atual de pedidos?" />
                <div className="space-y-2">
                  {VOLUMES.map((opt, idx) => (
                    <motion.button
                      key={opt.id}
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.06 }}
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => { updateForm("volume", opt.id); setTimeout(handleNext, 300); }}
                      className={cn(
                        "w-full p-4 rounded-2xl text-left transition-all duration-300 flex items-center gap-4 group relative overflow-hidden",
                      )}
                      style={{
                        background: form.volume === opt.id ? 'hsl(var(--primary) / 0.08)' : 'hsl(var(--secondary))',
                        border: `1px solid ${form.volume === opt.id ? 'hsl(var(--primary) / 0.4)' : 'hsl(var(--border))'}`,
                        boxShadow: form.volume === opt.id ? '0 4px 20px hsl(var(--primary) / 0.1)' : undefined,
                      }}
                    >
                      <span className="text-2xl">{opt.emoji}</span>
                      <div>
                        <span className="text-sm font-bold tracking-wide block">{opt.label}</span>
                        <span className="text-[10px] text-muted-foreground">{opt.desc}</span>
                      </div>
                      <ChevronRight className={cn("w-4 h-4 ml-auto transition-all",
                        form.volume === opt.id ? "text-primary opacity-100" : "text-muted-foreground/20 opacity-0 group-hover:opacity-100"
                      )} />
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 8: Briefing */}
            {currentStep === 8 && (
              <motion.div
                key="briefing"
                custom={direction}
                variants={slideVariants}
                initial="enter" animate="center" exit="exit"
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="w-full max-w-xl space-y-6"
              >
                <StepHeader step={8} label="Fale mais sobre seu projeto..." isLast />
                <Textarea
                  autoFocus
                  className="min-h-[180px] lg:min-h-[220px] rounded-2xl p-6 text-base lg:text-lg font-medium leading-relaxed resize-none transition-all"
                  style={{
                    background: 'hsl(var(--secondary))',
                    border: '1px solid hsl(var(--border))',
                    color: 'hsl(var(--foreground))',
                  }}
                  placeholder="Quais seus objetivos, desafios ou sonhos para este projeto?"
                  value={form.mensagem}
                  onChange={(e) => updateForm("mensagem", e.target.value)}
                />
                {errors.mensagem && (
                  <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                    className="text-destructive text-xs font-bold tracking-wider pl-2">
                    {errors.mensagem}
                  </motion.p>
                )}
              </motion.div>
            )}

            {/* Step 9: Success */}
            {currentStep === 9 && (
              <motion.div
                key="success"
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, type: "spring", stiffness: 150 }}
                className="text-center space-y-8 flex flex-col items-center max-w-md mx-auto"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="relative"
                >
                  <div className="absolute inset-0 rounded-full blur-3xl opacity-20" style={{ background: 'hsl(var(--success))' }} />
                  <div className="w-24 h-24 rounded-full flex items-center justify-center relative"
                    style={{ background: 'hsl(var(--success) / 0.1)', border: '2px solid hsl(var(--success) / 0.4)' }}>
                    <Check className="w-12 h-12 stroke-[3px]" style={{ color: 'hsl(var(--success))' }} />
                  </div>
                </motion.div>
                <div className="space-y-3">
                  <h1 className="text-3xl lg:text-4xl font-black tracking-tight text-foreground">
                    Enviado com <span className="gradient-text">sucesso!</span>
                  </h1>
                  <p className="text-muted-foreground text-base font-medium leading-relaxed">
                    Um membro da equipe já vai entrar em contato.<br />Prepare-se para decolar! 🚀
                  </p>
                </div>
                <Button onClick={() => window.location.href = "/"}
                  className="h-12 px-8 rounded-xl font-bold text-xs uppercase tracking-widest transition-all"
                  style={{
                    background: 'hsl(var(--secondary))',
                    border: '1px solid hsl(var(--border))',
                    color: 'hsl(var(--muted-foreground))',
                  }}>
                  Voltar ao início
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation buttons */}
        {currentStep > 0 && currentStep < 9 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-6 sm:px-10 lg:px-16 pb-8 flex items-center justify-between"
          >
            <Button variant="ghost" onClick={handlePrev}
              className="h-10 text-muted-foreground hover:text-foreground font-semibold text-xs tracking-wider gap-2 px-0 hover:bg-transparent">
              <ArrowLeft className="w-3.5 h-3.5" /> Voltar
            </Button>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button onClick={handleNext} disabled={loading}
                className={cn("h-12 lg:h-14 px-8 rounded-xl font-bold text-sm tracking-wider text-white border-0 flex items-center gap-2.5 group",
                  loading && "opacity-50")}
                style={{ background: 'var(--gradient-primary)', boxShadow: '0 10px 30px -8px hsl(var(--primary) / 0.3)' }}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                  <>
                    {currentStep === 8 ? "Finalizar" : "Próximo"}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </motion.div>
          </motion.div>
        )}
      </div>
      </div>
    </div>
  );
}

/* ===================== Sub-components ===================== */

function InputStep({ step, form, errors, updateForm, onNext, direction, ...rest }: {
  step: number;
  form: Record<string, string>;
  errors: Record<string, string>;
  updateForm: (f: string, v: string) => void;
  onNext: () => void;
  direction: number;
  [key: string]: any;
}) {
  const config: Record<number, { field: string; placeholder: string; label: string; subtitle: string; icon: typeof Mail }> = {
    1: { field: "nome", placeholder: "Nome e Sobrenome", label: "Qual seu nome?", subtitle: "Como devemos te chamar", icon: User },
    2: { field: "email", placeholder: "seu@email.com", label: "Seu melhor e-mail?", subtitle: "Para envio da proposta", icon: Mail },
    3: { field: "whatsapp", placeholder: "(00) 00000-0000", label: "Seu WhatsApp direto?", subtitle: "Para contato rápido", icon: Phone },
    4: { field: "empresa", placeholder: "Marca / Empresa", label: "Nome do negócio?", subtitle: "Ou projeto que deseja criar", icon: Building },
  };
  const c = config[step];
  if (!c) return null;
  const val = form[c.field];

  return (
    <motion.div
      key={`input-${step}`}
      custom={direction}
      variants={slideVariants}
      initial="enter" animate="center" exit="exit"
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-xl space-y-6"
    >
      <StepHeader step={step} label={c.label} subtitle={c.subtitle} />
      <div className="relative group">
        <c.icon className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/30 group-focus-within:text-primary transition-colors duration-300" />
        <Input
          autoFocus
          className="h-16 lg:h-[72px] rounded-2xl text-xl lg:text-2xl font-bold pl-14 pr-6 transition-all placeholder:text-muted-foreground/20"
          style={{
            background: 'hsl(var(--secondary))',
            border: '1px solid hsl(var(--border))',
            color: 'hsl(var(--foreground))',
          }}
          placeholder={c.placeholder}
          value={val}
          onChange={(e) => {
            const v = e.target.value;
            updateForm(c.field, step === 3 ? formatWhatsApp(v) : v);
          }}
          onKeyDown={(e) => e.key === "Enter" && onNext()}
        />
      </div>
      {errors[c.field] && (
        <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
          className="text-destructive text-xs font-bold tracking-wider pl-2">
          {errors[c.field]}
        </motion.p>
      )}
      <p className="text-[10px] text-muted-foreground/40 font-medium pl-2">
        Pressione <kbd className="px-1.5 py-0.5 rounded text-[9px] font-bold" style={{ background: 'hsl(var(--secondary))', border: '1px solid hsl(var(--border))' }}>Enter ↵</kbd> para continuar
      </p>
    </motion.div>
  );
}

function StepHeader({ step, label, subtitle, isLast }: { step: number; label: string; subtitle?: string; isLast?: boolean }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="h-px w-6" style={{ background: 'var(--gradient-primary)' }} />
        <span className="text-[10px] font-black uppercase tracking-[0.3em] gradient-text">
          {isLast ? "Passo Final" : `Passo ${step} de 8`}
        </span>
      </div>
      <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight leading-tight text-foreground">
        {label}
      </h1>
      {subtitle && (
        <p className="text-sm text-muted-foreground font-medium">{subtitle}</p>
      )}
    </div>
  );
}
