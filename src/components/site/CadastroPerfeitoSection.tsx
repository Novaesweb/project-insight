import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Rocket, ArrowRight, ArrowLeft, MessageCircle, 
  User, Phone, Building, Layout, Store, HelpCircle, 
  Send, Instagram, Search, Users, CheckCircle2,
  Package, Globe, Target, Sparkles, Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { sendPushToAdmins } from "@/lib/push-notifications";
import { cn } from "@/lib/utils";

// --- Componente Typewriter Interno ---
function Typewriter({ text, className }: { text: string; className?: string }) {
  const [displayedText, setDisplayedText] = useState("");
  
  useEffect(() => {
    setDisplayedText("");
    let i = 0;
    const timer = setInterval(() => {
      setDisplayedText((prev) => prev + text.charAt(i));
      i++;
      if (i >= text.length) clearInterval(timer);
    }, 30);
    return () => clearInterval(timer);
  }, [text]);

  return <span className={className}>{displayedText}</span>;
}

// --- Tipos & Opções ---
const SEGMENTOS = [
  { id: "imobiliaria", label: "Imobiliária", icon: Building, hint: "Setor em alta para automação de leads!" },
  { id: "e-commerce", label: "E-commerce", icon: Store, hint: "Foco total em conversão e checkout fluido." },
  { id: "servicos", label: "Serviços", icon: Users, hint: "Ideal para landing pages de alta performance." },
  { id: "outros", label: "Outros", icon: HelpCircle, hint: "Construímos qualquer solução personalizada." },
];

const NECESSIDADES = [
  { id: "site", label: "Site Profissional", icon: Globe },
  { id: "loja", label: "Loja Virtual", icon: Store },
  { id: "sistema", label: "Sistema / Dashboard", icon: Layout },
  { id: "marketing", label: "Marketing / Leads", icon: Target },
];

const VOLUMES = [
  { id: "baixa", label: "Até 50/mês", icon: Package },
  { id: "media", label: "50 a 500/mês", icon: Package },
  { id: "alta", label: "Mais de 500/mês", icon: Package },
  { id: "nao_sei", label: "Não sei ainda", icon: HelpCircle },
];

const ORIGENS = [
  { id: "instagram", label: "Instagram", icon: Instagram },
  { id: "google", label: "Google / Pesquisa", icon: Search },
  { id: "indicacao", label: "Indicação", icon: Users },
  { id: "outro", label: "Outro Canal", icon: MessageCircle },
];

// --- Máscara de WhatsApp ---
const formatWhatsApp = (value: string) => {
  const v = value.replace(/\D/g, "");
  if (v.length <= 11) {
    if (v.length > 2) {
      if (v.length <= 6) return `(${v.substring(0, 2)}) ${v.substring(2)}`;
      if (v.length <= 10) return `(${v.substring(0, 2)}) ${v.substring(2, 6)}-${v.substring(6)}`;
      return `(${v.substring(0, 2)}) ${v.substring(2, 7)}-${v.substring(7, 11)}`;
    }
    return v;
  }
  return v.substring(0, 11);
};

export default function CadastroPerfeitoSection() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    nome: "",
    whatsapp: "",
    empresa: "",
    segmento: "",
    necessidade: "",
    pedidos: "",
    origem: "",
    descricao: "",
  });

  const nextStep = () => setStep(p => p + 1);
  const prevStep = () => setStep(p => p - 1);

  const isStepValid = () => {
    if (step === 2) return formData.nome.trim().length >= 3;
    if (step === 3) return formData.whatsapp.replace(/\D/g, "").length >= 10;
    if (step === 4) return formData.empresa.trim().length >= 2;
    if (step === 5) return !!formData.segmento;
    if (step === 6) return !!formData.necessidade;
    if (step === 7) return !!formData.pedidos;
    if (step === 8) return !!formData.origem;
    if (step === 9) return formData.descricao.trim().length >= 5;
    return true;
  };

  const handleFinish = async () => {
    setLoading(true);
    const { error } = await supabase.from("leads").insert({
      nome: formData.nome,
      email: `${formData.nome.toLowerCase().replace(/\s/g, "")}@lead.novaesweb.com.br`,
      whatsapp: formData.whatsapp.replace(/\D/g, ""),
      mensagem: `[MULTI-STEP QUIZ]
Segmento: ${formData.segmento}
Necessidade: ${formData.necessidade}
Volume/Pedidos: ${formData.pedidos}
Origem: ${formData.origem}
Descrição: ${formData.descricao}
Empresa: ${formData.empresa}`,
      status: "novo",
    });

    if (error) {
      toast({ title: "Erro ao enviar", description: error.message, variant: "destructive" });
      setLoading(false);
    } else {
      sendPushToAdmins("🚀 Novo Cadastro Interativo", `${formData.nome} (${formData.empresa}) finalizou o quiz de projeto.`, "/admin/leads");
      nextStep();
      setLoading(false);
    }
  };

  const progress = (step / 10) * 100;

  const cardVariants = {
    initial: { opacity: 0, x: 20, scale: 0.98 },
    animate: { opacity: 1, x: 0, scale: 1, transition: { duration: 0.5, ease: "easeOut" } },
    exit: { opacity: 0, x: -20, scale: 0.98, transition: { duration: 0.3 } }
  };

  const nomeCurto = formData.nome.split(' ')[0];

  return (
    <section id="cadastro" className="py-24 relative min-h-[900px] flex items-center justify-center overflow-hidden ambient-glow">
      <div className="ultra-premium-bg" />
      <div className="ambient-rays-unified opacity-40" />

      <div className="container max-w-2xl relative z-10 px-4">
        {/* Barra de Progresso Premium */}
        <div className="mb-12 px-4">
          <div className="flex justify-between items-end mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3 h-3 text-primary animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30">Análise de IA NovaesWeb</span>
            </div>
            <span className="text-xs font-black text-primary bg-primary/10 px-3 py-1 rounded-full">{Math.round(progress)}%</span>
          </div>
          <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 p-[1px]">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full gradient-primary rounded-full relative"
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse" />
            </motion.div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* TELA 1: BOAS-VINDAS */}
          {step === 1 && (
            <motion.div key="step1" variants={cardVariants} initial="initial" animate="animate" exit="exit" className="glass-panel-premium rounded-[3rem] p-16 text-center border-white/5 shadow-2xl relative overflow-hidden group">
              <div className="absolute -top-24 -left-24 w-64 h-64 bg-primary/10 rounded-full blur-[80px] group-hover:bg-primary/20 transition-all" />
              <div className="w-28 h-28 rounded-3xl gradient-primary mx-auto flex items-center justify-center mb-10 shadow-xl relative z-10">
                <Rocket className="w-14 h-14 text-white animate-bounce" />
              </div>
              <h1 className="text-5xl font-black text-white mb-6 leading-[1.1] tracking-tighter relative z-10">
                Pronto para <br />
                <Typewriter text="decolar seu projeto?" className="gradient-text" />
              </h1>
              <p className="text-white/40 mb-12 text-xl font-medium leading-relaxed relative z-10">
                Responda este quiz rápido e receba uma proposta exclusiva feita por nossos engenheiros.
              </p>
              <Button onClick={nextStep} className="h-18 px-16 rounded-[2rem] gradient-primary text-white font-black uppercase tracking-widest text-sm hover:scale-105 transition-all shadow-2xl group relative z-10">
                Começar Jornada <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-2 transition-transform" />
              </Button>
            </motion.div>
          )}

          {/* TELA 2: NOME */}
          {step === 2 && (
            <motion.div key="step2" variants={cardVariants} initial="initial" animate="animate" exit="exit" className="glass-panel-premium rounded-[3rem] p-12 border-white/5 shadow-2xl relative">
              <h2 className="text-xs font-black text-primary uppercase tracking-[0.4em] mb-6 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary" /> Passo 01/09
              </h2>
              <h1 className="text-4xl font-black text-white mb-8 leading-tight tracking-tighter">
                Primeiro, como podemos <br />
                <Typewriter text="te chamar?" className="gradient-text" />
              </h1>
              <div className="relative mb-12">
                <User className="absolute left-7 top-1/2 -translate-y-1/2 w-6 h-6 text-white/20" />
                <Input 
                  autoFocus
                  placeholder="Seu nome completo" 
                  value={formData.nome}
                  onChange={(e) => setFormData({...formData, nome: e.target.value})}
                  className="h-20 pl-20 pr-8 bg-white/5 border-white/5 rounded-[2rem] text-2xl font-bold text-white focus:border-primary/50 transition-all placeholder:text-white/10"
                />
              </div>
              <div className="flex gap-4">
                <Button onClick={prevStep} variant="ghost" className="h-16 px-8 text-white/40 hover:text-white font-black uppercase tracking-widest text-xs">Voltar</Button>
                <Button disabled={!isStepValid()} onClick={nextStep} className="flex-1 h-16 rounded-2xl gradient-primary text-white font-black uppercase tracking-widest text-xs shadow-lg disabled:opacity-20 transition-all">Próximo</Button>
              </div>
            </motion.div>
          )}

          {/* TELA 3: WHATSAPP */}
          {step === 3 && (
            <motion.div key="step3" variants={cardVariants} initial="initial" animate="animate" exit="exit" className="glass-panel-premium rounded-[3rem] p-12 border-white/5 shadow-2xl relative">
              <h2 className="text-xs font-black text-primary uppercase tracking-[0.4em] mb-6 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary" /> Passo 02/09
              </h2>
              <h1 className="text-4xl font-black text-white mb-4 leading-tight tracking-tighter">
                Prazer, {nomeCurto}! <br />
                <Typewriter text="Qual seu WhatsApp?" className="gradient-text" />
              </h1>
              <p className="text-white/30 mb-8 font-medium">Prometemos não enviar spam, apenas o necessário.</p>
              <div className="relative mb-12">
                <Phone className="absolute left-7 top-1/2 -translate-y-1/2 w-6 h-6 text-white/20" />
                <Input 
                  autoFocus
                  type="tel"
                  placeholder="(00) 00000-0000" 
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({...formData, whatsapp: formatWhatsApp(e.target.value)})}
                  className="h-20 pl-20 pr-8 bg-white/5 border-white/5 rounded-[2rem] text-3xl font-black text-white tracking-widest focus:border-primary/50 transition-all placeholder:text-white/10"
                />
              </div>
              <div className="flex gap-4">
                <Button onClick={prevStep} variant="ghost" className="h-16 px-8 text-white/40 hover:text-white font-black uppercase tracking-widest text-xs">Voltar</Button>
                <Button disabled={!isStepValid()} onClick={nextStep} className="flex-1 h-16 rounded-2xl gradient-primary text-white font-black uppercase tracking-widest text-xs shadow-lg disabled:opacity-20 transition-all">Continuar</Button>
              </div>
            </motion.div>
          )}

          {/* TELA 4: NEGÓCIO */}
          {step === 4 && (
            <motion.div key="step4" variants={cardVariants} initial="initial" animate="animate" exit="exit" className="glass-panel-premium rounded-[3rem] p-12 border-white/5 shadow-2xl relative">
              <h2 className="text-xs font-black text-primary uppercase tracking-[0.4em] mb-6 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary" /> Passo 03/09
              </h2>
              <h1 className="text-4xl font-black text-white mb-8 leading-tight tracking-tighter">
                E o nome do seu <br />
                <Typewriter text="negócio ou empresa?" className="gradient-text" />
              </h1>
              <div className="relative mb-12">
                <Building className="absolute left-7 top-1/2 -translate-y-1/2 w-6 h-6 text-white/20" />
                <Input 
                  autoFocus
                  placeholder="Ex: Minha Startup Premium" 
                  value={formData.empresa}
                  onChange={(e) => setFormData({...formData, empresa: e.target.value})}
                  className="h-20 pl-20 pr-8 bg-white/5 border-white/5 rounded-[2rem] text-2xl font-bold text-white focus:border-primary/50 transition-all placeholder:text-white/10"
                />
              </div>
              <div className="flex gap-4">
                <Button onClick={prevStep} variant="ghost" className="h-16 px-8 text-white/40 hover:text-white font-black uppercase tracking-widest text-xs">Voltar</Button>
                <Button disabled={!isStepValid()} onClick={nextStep} className="flex-1 h-16 rounded-2xl gradient-primary text-white font-black uppercase tracking-widest text-xs shadow-lg disabled:opacity-20 transition-all">Próximo</Button>
              </div>
            </motion.div>
          )}

          {/* TELA 5: SEGMENTO */}
          {step === 5 && (
            <motion.div key="step5" variants={cardVariants} initial="initial" animate="animate" exit="exit" className="glass-panel-premium rounded-[3rem] p-12 border-white/5 shadow-2xl relative">
              <h2 className="text-xs font-black text-primary uppercase tracking-[0.4em] mb-6 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary" /> Passo 04/09
              </h2>
              <h1 className="text-4xl font-black text-white mb-10 leading-tight tracking-tighter">
                Qual o <Typewriter text="segmento" className="gradient-text" /> da <br />
                {formData.empresa}?
              </h1>
              <div className="grid grid-cols-2 gap-6 mb-12 text-xs text-center">
                {SEGMENTOS.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setFormData({ ...formData, segmento: item.id })}
                    className={cn(
                      "flex flex-col items-center justify-center p-8 rounded-[2rem] border-2 transition-all gap-5 group relative overflow-hidden",
                      formData.segmento === item.id 
                        ? "bg-primary/10 border-primary text-white shadow-xl shadow-primary/20" 
                        : "bg-white/5 border-white/5 text-white/30 hover:bg-white/10 hover:border-white/20"
                    )}
                  >
                    {formData.segmento === item.id && (
                      <motion.div layoutId="seg-glow" className="absolute inset-0 bg-primary/5 blur-xl pointer-events-none" />
                    )}
                    <item.icon className={cn("w-10 h-10 transition-transform group-hover:scale-110", formData.segmento === item.id ? "text-primary" : "text-white/10")} />
                    <span className="font-black uppercase tracking-widest leading-tight">{item.label}</span>
                    {formData.segmento === item.id && (
                      <p className="text-[9px] text-primary/60 font-medium absolute bottom-3">{item.hint}</p>
                    )}
                  </button>
                ))}
              </div>
              <div className="flex gap-4">
                <Button onClick={prevStep} variant="ghost" className="h-16 px-8 text-white/40 hover:text-white font-black uppercase tracking-widest text-xs">Voltar</Button>
                <Button disabled={!isStepValid()} onClick={nextStep} className="flex-1 h-16 rounded-2xl gradient-primary text-white font-black uppercase tracking-widest text-xs shadow-lg disabled:opacity-20">Continuar</Button>
              </div>
            </motion.div>
          )}

          {/* TELA 6: NECESSIDADE */}
          {step === 6 && (
            <motion.div key="step6" variants={cardVariants} initial="initial" animate="animate" exit="exit" className="glass-panel-premium rounded-[3rem] p-12 border-white/5 shadow-2xl relative">
              <h2 className="text-xs font-black text-primary uppercase tracking-[0.4em] mb-6 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary" /> Passo 05/09
              </h2>
              <h1 className="text-4xl font-black text-white mb-4 leading-tight tracking-tighter">
                O que você <br />
                <Typewriter text="quer construir?" className="gradient-text" />
              </h1>
              <p className="text-white/30 mb-10 font-medium">Escolha a opção que melhor define sua prioridade atual.</p>
              <div className="grid grid-cols-2 gap-6 mb-12 text-xs text-center">
                {NECESSIDADES.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setFormData({ ...formData, necessidade: item.id })}
                    className={cn(
                      "flex flex-col items-center justify-center p-8 rounded-[2rem] border-2 transition-all gap-5 group",
                      formData.necessidade === item.id 
                        ? "bg-primary/10 border-primary text-white shadow-xl shadow-primary/20" 
                        : "bg-white/5 border-white/5 text-white/30 hover:bg-white/10 hover:border-white/20"
                    )}
                  >
                    <item.icon className={cn("w-10 h-10", formData.necessidade === item.id ? "text-primary" : "text-white/10")} />
                    <span className="font-black uppercase tracking-widest leading-tight">{item.label}</span>
                  </button>
                ))}
              </div>
              <div className="flex gap-4">
                <Button onClick={prevStep} variant="ghost" className="h-16 px-8 text-white/40 hover:text-white font-black uppercase tracking-widest text-xs">Voltar</Button>
                <Button disabled={!isStepValid()} onClick={nextStep} className="flex-1 h-16 rounded-2xl gradient-primary text-white font-black uppercase tracking-widest text-xs shadow-lg disabled:opacity-20">Próximo</Button>
              </div>
            </motion.div>
          )}

          {/* TELA 7: VOLUMES */}
          {step === 7 && (
            <motion.div key="step7" variants={cardVariants} initial="initial" animate="animate" exit="exit" className="glass-panel-premium rounded-[3rem] p-12 border-white/5 shadow-2xl relative">
              <h2 className="text-xs font-black text-primary uppercase tracking-[0.4em] mb-6 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary" /> Passo 06/09
              </h2>
              <h1 className="text-4xl font-black text-white mb-10 leading-tight tracking-tighter text-center">
                Qual seu volume de <br />
                <Typewriter text="pedidos atuais?" className="gradient-text" />
              </h1>
              <div className="grid grid-cols-2 gap-6 mb-12 text-xs text-center">
                {VOLUMES.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setFormData({ ...formData, pedidos: item.id })}
                    className={cn(
                      "flex flex-col items-center justify-center p-8 rounded-[2rem] border-2 transition-all gap-5 group",
                      formData.pedidos === item.id 
                        ? "bg-primary/10 border-primary text-white shadow-xl shadow-primary/20" 
                        : "bg-white/5 border-white/5 text-white/30 hover:bg-white/10 hover:border-white/20"
                    )}
                  >
                    <item.icon className={cn("w-10 h-10", formData.pedidos === item.id ? "text-primary" : "text-white/10")} />
                    <span className="font-black uppercase tracking-widest">{item.label}</span>
                  </button>
                ))}
              </div>
              <div className="flex gap-4">
                <Button onClick={prevStep} variant="ghost" className="h-16 px-8 text-white/40 hover:text-white font-black uppercase tracking-widest text-xs">Voltar</Button>
                <Button disabled={!isStepValid()} onClick={nextStep} className="flex-1 h-16 rounded-2xl gradient-primary text-white font-black uppercase tracking-widest text-xs shadow-lg disabled:opacity-20">Quase lá!</Button>
              </div>
            </motion.div>
          )}

          {/* TELA 8: ORIGEM */}
          {step === 8 && (
            <motion.div key="step8" variants={cardVariants} initial="initial" animate="animate" exit="exit" className="glass-panel-premium rounded-[3rem] p-12 border-white/5 shadow-2xl relative text-center">
              <h2 className="text-xs font-black text-primary uppercase tracking-[0.4em] mb-6 flex items-center justify-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary" /> Passo 07/09
              </h2>
              <h1 className="text-4xl font-black text-white mb-10 leading-tight tracking-tighter">
                Como você <br />
                <Typewriter text="nos conheceu?" className="gradient-text" />
              </h1>
              <div className="grid grid-cols-2 gap-6 mb-12 text-xs">
                {ORIGENS.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setFormData({ ...formData, origem: item.id })}
                    className={cn(
                      "flex flex-col items-center justify-center p-8 rounded-[2rem] border-2 transition-all gap-5 group",
                      formData.origem === item.id 
                        ? "bg-primary/10 border-primary text-white shadow-xl shadow-primary/20" 
                        : "bg-white/5 border-white/5 text-white/30 hover:bg-white/10 hover:border-white/20"
                    )}
                  >
                    <item.icon className={cn("w-10 h-10", formData.origem === item.id ? "text-primary" : "text-white/10")} />
                    <span className="font-black uppercase tracking-widest">{item.label}</span>
                  </button>
                ))}
              </div>
              <div className="flex gap-4">
                <Button onClick={prevStep} variant="ghost" className="h-16 px-8 text-white/40 hover:text-white font-black uppercase tracking-widest text-xs">Voltar</Button>
                <Button disabled={!isStepValid()} onClick={nextStep} className="flex-1 h-16 rounded-2xl gradient-primary text-white font-black uppercase tracking-widest text-xs shadow-lg disabled:opacity-20">Última etapa!</Button>
              </div>
            </motion.div>
          )}

          {/* TELA 9: DESCRIÇÃO */}
          {step === 9 && (
            <motion.div key="step9" variants={cardVariants} initial="initial" animate="animate" exit="exit" className="glass-panel-premium rounded-[3rem] p-12 border-white/5 shadow-2xl relative">
              <h2 className="text-xs font-black text-primary uppercase tracking-[0.4em] mb-6 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary" /> Passo 08/09
              </h2>
              <h1 className="text-4xl font-black text-white mb-6 leading-tight tracking-tighter">
                Fale um pouco mais <br />
                <Typewriter text="sobre seu projeto:" className="gradient-text" />
              </h1>
              <p className="text-white/30 mb-8 font-medium italic">"Queremos entender sua visão em detalhes para superar expectativas."</p>
              <div className="relative mb-12">
                <Textarea 
                  autoFocus
                  placeholder="Quais seus objetivos, desafios ou sonhos para este projeto?" 
                  value={formData.descricao}
                  onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                  className="min-h-[220px] p-10 bg-white/5 border-white/5 rounded-[2.5rem] text-xl font-medium text-white focus:border-primary/50 transition-all placeholder:text-white/10 leading-relaxed"
                />
              </div>
              <div className="flex gap-4">
                <Button onClick={prevStep} variant="ghost" className="h-16 px-8 text-white/40 hover:text-white font-black uppercase tracking-widest text-xs">Voltar</Button>
                <Button disabled={!isStepValid() || loading} onClick={handleFinish} className="flex-1 h-16 rounded-3xl gradient-primary text-white font-black uppercase tracking-widest text-xs shadow-2xl disabled:opacity-20 flex items-center justify-center gap-4 group">
                  {loading ? "Processando seu Projeto..." : <>Finalizar e Enviar <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /></>}
                </Button>
              </div>
            </motion.div>
          )}

          {/* TELA 10: SUCESSO */}
          {step === 10 && (
            <motion.div key="step10" variants={cardVariants} initial="initial" animate="animate" exit="exit" className="glass-panel-premium rounded-[3rem] p-16 text-center border-white/5 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                <CheckCircle2 className="w-80 h-80 text-primary" />
              </div>
              
              <motion.div 
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", damping: 10, stiffness: 100 }}
                className="w-28 h-28 rounded-[2.5rem] gradient-primary mx-auto flex items-center justify-center mb-10 shadow-2xl relative z-10"
              >
                <Rocket className="w-14 h-14 text-white" />
              </motion.div>
              
              <h1 className="text-5xl font-black text-white mb-6 leading-tight tracking-tighter relative z-10">
                Lançamento <br />
                <span className="gradient-text italic">confirmado, {nomeCurto}!</span>
              </h1>
              
              <div className="max-w-md mx-auto mb-12 space-y-6 relative z-10">
                <p className="text-white/50 text-xl font-medium leading-relaxed">
                  Nossa IA e especialistas já estão analisando seu briefing. Prepare-se para algo extraordinário.
                </p>
                <div className="flex flex-col gap-4 text-left p-6 bg-white/5 rounded-[2rem] border border-white/5">
                  <div className="flex items-center gap-4 text-emerald-400">
                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                    <span className="text-xs font-black uppercase tracking-widest">Lead Capturado com Sucesso</span>
                  </div>
                  <div className="flex items-center gap-4 text-amber-400">
                    <Zap className="w-5 h-5 shrink-0" />
                    <span className="text-xs font-black uppercase tracking-widest">Análise de Prioridade Ativada</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col gap-4 max-w-sm mx-auto relative z-10">
                <Button 
                  onClick={() => window.open(`https://wa.me/5551981964238?text=${encodeURIComponent(`Olá! Acabei de completar o quiz do projeto para a ${formData.empresa}. Gostaria de acelerar o atendimento!`)}`, "_blank")}
                  className="h-18 rounded-[2rem] bg-[#25D366] hover:bg-[#20bd5a] text-white font-black uppercase tracking-widest text-sm shadow-2xl flex items-center justify-center gap-4 group"
                >
                  <MessageCircle className="w-7 h-7" /> Acelerar no WhatsApp
                </Button>
                <Button variant="ghost" onClick={() => window.location.href = "/"} className="h-16 text-white/30 hover:text-white font-black uppercase tracking-widest text-[10px]">
                  Retornar ao Porto Seguro
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
