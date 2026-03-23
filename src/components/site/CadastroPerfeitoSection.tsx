import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Rocket, ArrowRight, ArrowLeft, MessageCircle, 
  User, Phone, Building, Layout, Store, HelpCircle, 
  Send, Instagram, Search, Users, CheckCircle2,
  Package, Globe, Target
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { sendPushToAdmins } from "@/lib/push-notifications";
import { cn } from "@/lib/utils";

// --- Tipos & Opções ---
const SEGMENTOS = [
  { id: "imobiliaria", label: "Imobiliária", icon: Building },
  { id: "e-commerce", label: "E-commerce", icon: Store },
  { id: "servicos", label: "Serviços", icon: Users },
  { id: "outros", label: "Outros", icon: HelpCircle },
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

  return (
    <section id="cadastro" className="py-24 relative min-h-[900px] flex items-center justify-center overflow-hidden ambient-glow">
      <div className="ultra-premium-bg" />
      <div className="ambient-rays-unified opacity-40" />

      <div className="container max-w-2xl relative z-10 px-4">
        {/* Barra de Progresso */}
        <div className="mb-8 px-4">
          <div className="flex justify-between items-end mb-2">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Análise do Projeto</span>
            <span className="text-sm font-black text-primary">{Math.round(progress)}%</span>
          </div>
          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full gradient-primary shadow-[0_0_15px_rgba(255,51,102,0.5)]"
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* TELA 1: BOAS-VINDAS */}
          {step === 1 && (
            <motion.div key="step1" variants={cardVariants} initial="initial" animate="animate" exit="exit" className="glass-panel-premium rounded-[2.5rem] p-12 text-center border-white/5 shadow-2xl">
              <div className="w-24 h-24 rounded-3xl gradient-primary mx-auto flex items-center justify-center mb-8 shadow-xl">
                <Rocket className="w-12 h-12 text-white animate-bounce" />
              </div>
              <h1 className="text-4xl font-black text-white mb-6 leading-tight tracking-tighter">
                Pronto para <br />
                <span className="gradient-text">decolar seu projeto?</span>
              </h1>
              <p className="text-white/40 mb-10 text-lg font-medium leading-relaxed">
                Responda algumas perguntas rápidas e receba uma consultoria exclusiva para sua tecnologia.
              </p>
              <Button onClick={nextStep} className="h-16 px-12 rounded-2xl gradient-primary text-white font-black uppercase tracking-widest text-sm hover:scale-105 transition-all shadow-lg group">
                Começar Jornada <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-2 transition-transform" />
              </Button>
            </motion.div>
          )}

          {/* TELA 2: NOME */}
          {step === 2 && (
            <motion.div key="step2" variants={cardVariants} initial="initial" animate="animate" exit="exit" className="glass-panel-premium rounded-[2.5rem] p-12 border-white/5 shadow-2xl relative">
              <h2 className="text-sm font-black text-primary uppercase tracking-[0.3em] mb-4">Passo 01/09</h2>
              <h1 className="text-4xl font-black text-white mb-8 leading-tight tracking-tighter">
                Primeiro, como podemos <br />
                <span className="gradient-text">te chamar?</span>
              </h1>
              <div className="relative mb-12">
                <User className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-white/20" />
                <Input 
                  autoFocus
                  placeholder="Seu nome completo" 
                  value={formData.nome}
                  onChange={(e) => setFormData({...formData, nome: e.target.value})}
                  className="h-16 pl-16 pr-8 bg-white/5 border-white/5 rounded-2xl text-xl font-bold text-white focus:border-primary/50 transition-all placeholder:text-white/10"
                />
              </div>
              <div className="flex gap-4">
                <Button onClick={prevStep} variant="ghost" className="h-14 px-6 text-white/40 hover:text-white font-black uppercase tracking-widest text-xs"><ArrowLeft className="mr-2 w-4 h-4" /> Voltar</Button>
                <Button disabled={!isStepValid()} onClick={nextStep} className="flex-1 h-14 rounded-2xl gradient-primary text-white font-black uppercase tracking-widest text-xs shadow-lg disabled:opacity-20 transition-all">Próximo</Button>
              </div>
            </motion.div>
          )}

          {/* TELA 3: WHATSAPP */}
          {step === 3 && (
            <motion.div key="step3" variants={cardVariants} initial="initial" animate="animate" exit="exit" className="glass-panel-premium rounded-[2.5rem] p-12 border-white/5 shadow-2xl relative">
              <h2 className="text-sm font-black text-primary uppercase tracking-[0.3em] mb-4">Passo 02/09</h2>
              <h1 className="text-4xl font-black text-white mb-8 leading-tight tracking-tighter">
                Prazer, {formData.nome.split(' ')[0]}! <br />
                <span className="gradient-text">Qual seu WhatsApp?</span>
              </h1>
              <div className="relative mb-12">
                <Phone className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-white/20" />
                <Input 
                  autoFocus
                  type="tel"
                  placeholder="(00) 00000-0000" 
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({...formData, whatsapp: formatWhatsApp(e.target.value)})}
                  className="h-16 pl-16 pr-8 bg-white/5 border-white/5 rounded-2xl text-2xl font-black text-white tracking-widest focus:border-primary/50 transition-all placeholder:text-white/10"
                />
              </div>
              <div className="flex gap-4">
                <Button onClick={prevStep} variant="ghost" className="h-14 px-6 text-white/40 hover:text-white font-black uppercase tracking-widest text-xs"><ArrowLeft className="mr-2 w-4 h-4" /> Voltar</Button>
                <Button disabled={!isStepValid()} onClick={nextStep} className="flex-1 h-14 rounded-2xl gradient-primary text-white font-black uppercase tracking-widest text-xs shadow-lg disabled:opacity-20 transition-all">Quase lá!</Button>
              </div>
            </motion.div>
          )}

          {/* TELA 4: NEGÓCIO */}
          {step === 4 && (
            <motion.div key="step4" variants={cardVariants} initial="initial" animate="animate" exit="exit" className="glass-panel-premium rounded-[2.5rem] p-12 border-white/5 shadow-2xl relative">
              <h2 className="text-sm font-black text-primary uppercase tracking-[0.3em] mb-4">Passo 03/09</h2>
              <h1 className="text-4xl font-black text-white mb-8 leading-tight tracking-tighter">
                E o nome do seu <br />
                <span className="gradient-text">negócio ou empresa?</span>
              </h1>
              <p className="text-white/30 mb-8 font-medium">Não se preocupe se for apenas uma ideia inicial.</p>
              <div className="relative mb-12">
                <Building className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-white/20" />
                <Input 
                  autoFocus
                  placeholder="Ex: Minha Startup Premium" 
                  value={formData.empresa}
                  onChange={(e) => setFormData({...formData, empresa: e.target.value})}
                  className="h-16 pl-16 pr-8 bg-white/5 border-white/5 rounded-2xl text-xl font-bold text-white focus:border-primary/50 transition-all placeholder:text-white/10"
                />
              </div>
              <div className="flex gap-4">
                <Button onClick={prevStep} variant="ghost" className="h-14 px-6 text-white/40 hover:text-white font-black uppercase tracking-widest text-xs"><ArrowLeft className="mr-2 w-4 h-4" /> Voltar</Button>
                <Button disabled={!isStepValid()} onClick={nextStep} className="flex-1 h-14 rounded-2xl gradient-primary text-white font-black uppercase tracking-widest text-xs shadow-lg disabled:opacity-20 transition-all">Próximo</Button>
              </div>
            </motion.div>
          )}

          {/* TELA 5: SEGMENTO */}
          {step === 5 && (
            <motion.div key="step5" variants={cardVariants} initial="initial" animate="animate" exit="exit" className="glass-panel-premium rounded-[2.5rem] p-12 border-white/5 shadow-2xl relative">
              <h2 className="text-sm font-black text-primary uppercase tracking-[0.3em] mb-4">Passo 04/09</h2>
              <h1 className="text-4xl font-black text-white mb-8 leading-tight tracking-tighter">
                Qual o <span className="gradient-text">segmento</span> da <br />
                {formData.empresa}?
              </h1>
              <div className="grid grid-cols-2 gap-4 mb-10 text-xs text-center">
                {SEGMENTOS.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setFormData({ ...formData, segmento: item.id })}
                    className={cn(
                      "flex flex-col items-center justify-center p-6 rounded-3xl border-2 transition-all gap-4 group",
                      formData.segmento === item.id 
                        ? "bg-primary/10 border-primary text-white shadow-lg shadow-primary/20" 
                        : "bg-white/5 border-white/5 text-white/40 hover:bg-white/10 hover:border-white/10"
                    )}
                  >
                    <item.icon className={cn("w-8 h-8", formData.segmento === item.id ? "text-primary" : "text-white/20 group-hover:text-white/40")} />
                    <span className="font-black uppercase tracking-widest">{item.label}</span>
                  </button>
                ))}
              </div>
              <div className="flex gap-4">
                <Button onClick={prevStep} variant="ghost" className="h-14 px-6 text-white/40 hover:text-white font-black uppercase tracking-widest text-xs">Voltar</Button>
                <Button disabled={!isStepValid()} onClick={nextStep} className="flex-1 h-14 rounded-2xl gradient-primary text-white font-black uppercase tracking-widest text-xs shadow-lg disabled:opacity-20">Continuar</Button>
              </div>
            </motion.div>
          )}

          {/* TELA 6: NECESSIDADE */}
          {step === 6 && (
            <motion.div key="step6" variants={cardVariants} initial="initial" animate="animate" exit="exit" className="glass-panel-premium rounded-[2.5rem] p-12 border-white/5 shadow-2xl relative">
              <h2 className="text-sm font-black text-primary uppercase tracking-[0.3em] mb-4">Passo 05/09</h2>
              <h1 className="text-4xl font-black text-white mb-8 leading-tight tracking-tighter">
                O que você <br />
                <span className="gradient-text">quer construir?</span>
              </h1>
              <div className="grid grid-cols-2 gap-4 mb-10 text-xs text-center">
                {NECESSIDADES.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setFormData({ ...formData, necessidade: item.id })}
                    className={cn(
                      "flex flex-col items-center justify-center p-6 rounded-3xl border-2 transition-all gap-4 group",
                      formData.necessidade === item.id 
                        ? "bg-primary/10 border-primary text-white shadow-lg shadow-primary/20" 
                        : "bg-white/5 border-white/5 text-white/40 hover:bg-white/10 hover:border-white/10"
                    )}
                  >
                    <item.icon className={cn("w-8 h-8", formData.necessidade === item.id ? "text-primary" : "text-white/20 group-hover:text-white/40")} />
                    <span className="font-black uppercase tracking-widest leading-tight">{item.label}</span>
                  </button>
                ))}
              </div>
              <div className="flex gap-4">
                <Button onClick={prevStep} variant="ghost" className="h-14 px-6 text-white/40 hover:text-white font-black uppercase tracking-widest text-xs">Voltar</Button>
                <Button disabled={!isStepValid()} onClick={nextStep} className="flex-1 h-14 rounded-2xl gradient-primary text-white font-black uppercase tracking-widest text-xs shadow-lg disabled:opacity-20">Próximo</Button>
              </div>
            </motion.div>
          )}

          {/* TELA 7: VOLUMES */}
          {step === 7 && (
            <motion.div key="step7" variants={cardVariants} initial="initial" animate="animate" exit="exit" className="glass-panel-premium rounded-[2.5rem] p-12 border-white/5 shadow-2xl relative">
              <h2 className="text-sm font-black text-primary uppercase tracking-[0.3em] mb-4">Passo 06/09</h2>
              <h1 className="text-4xl font-black text-white mb-8 leading-tight tracking-tighter text-center">
                Qual seu volume de <br />
                <span className="gradient-text">pedidos atuais?</span>
              </h1>
              <div className="grid grid-cols-2 gap-4 mb-10 text-xs text-center">
                {VOLUMES.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setFormData({ ...formData, pedidos: item.id })}
                    className={cn(
                      "flex flex-col items-center justify-center p-6 rounded-3xl border-2 transition-all gap-4 group",
                      formData.pedidos === item.id 
                        ? "bg-primary/10 border-primary text-white shadow-lg shadow-primary/20" 
                        : "bg-white/5 border-white/5 text-white/40 hover:bg-white/10 hover:border-white/10"
                    )}
                  >
                    <item.icon className={cn("w-8 h-8", formData.pedidos === item.id ? "text-primary" : "text-white/20 group-hover:text-white/40")} />
                    <span className="font-black uppercase tracking-widest">{item.label}</span>
                  </button>
                ))}
              </div>
              <div className="flex gap-4">
                <Button onClick={prevStep} variant="ghost" className="h-14 px-6 text-white/40 hover:text-white font-black uppercase tracking-widest text-xs">Voltar</Button>
                <Button disabled={!isStepValid()} onClick={nextStep} className="flex-1 h-14 rounded-2xl gradient-primary text-white font-black uppercase tracking-widest text-xs shadow-lg disabled:opacity-20">Continuar</Button>
              </div>
            </motion.div>
          )}

          {/* TELA 8: ORIGEM */}
          {step === 8 && (
            <motion.div key="step8" variants={cardVariants} initial="initial" animate="animate" exit="exit" className="glass-panel-premium rounded-[2.5rem] p-12 border-white/5 shadow-2xl relative">
              <h2 className="text-sm font-black text-primary uppercase tracking-[0.3em] mb-4">Passo 07/09</h2>
              <h1 className="text-4xl font-black text-white mb-8 leading-tight tracking-tighter text-center">
                Como você <br />
                <span className="gradient-text">nos conheceu?</span>
              </h1>
              <div className="grid grid-cols-2 gap-4 mb-10 text-xs text-center">
                {ORIGENS.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setFormData({ ...formData, origem: item.id })}
                    className={cn(
                      "flex flex-col items-center justify-center p-6 rounded-3xl border-2 transition-all gap-4 group",
                      formData.origem === item.id 
                        ? "bg-primary/10 border-primary text-white shadow-lg shadow-primary/20" 
                        : "bg-white/5 border-white/5 text-white/40 hover:bg-white/10 hover:border-white/10"
                    )}
                  >
                    <item.icon className={cn("w-8 h-8", formData.origem === item.id ? "text-primary" : "text-white/20 group-hover:text-white/40")} />
                    <span className="font-black uppercase tracking-widest">{item.label}</span>
                  </button>
                ))}
              </div>
              <div className="flex gap-4">
                <Button onClick={prevStep} variant="ghost" className="h-14 px-6 text-white/40 hover:text-white font-black uppercase tracking-widest text-xs">Voltar</Button>
                <Button disabled={!isStepValid()} onClick={nextStep} className="flex-1 h-14 rounded-2xl gradient-primary text-white font-black uppercase tracking-widest text-xs shadow-lg disabled:opacity-20">Última etapa!</Button>
              </div>
            </motion.div>
          )}

          {/* TELA 9: DESCRIÇÃO */}
          {step === 9 && (
            <motion.div key="step9" variants={cardVariants} initial="initial" animate="animate" exit="exit" className="glass-panel-premium rounded-[2.5rem] p-12 border-white/5 shadow-2xl relative">
              <h2 className="text-sm font-black text-primary uppercase tracking-[0.3em] mb-4">Passo 08/09</h2>
              <h1 className="text-4xl font-black text-white mb-8 leading-tight tracking-tighter">
                Fale um pouco mais <br />
                <span className="gradient-text">sobre seu projeto:</span>
              </h1>
              <div className="relative mb-12">
                <Textarea 
                  autoFocus
                  placeholder="Quais seus objetivos, desafios ou sonhos para este projeto?" 
                  value={formData.descricao}
                  onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                  className="min-h-[180px] p-8 bg-white/5 border-white/5 rounded-3xl text-lg font-medium text-white focus:border-primary/50 transition-all placeholder:text-white/10 leading-relaxed"
                />
              </div>
              <div className="flex gap-4">
                <Button onClick={prevStep} variant="ghost" className="h-14 px-6 text-white/40 hover:text-white font-black uppercase tracking-widest text-xs">Voltar</Button>
                <Button disabled={!isStepValid() || loading} onClick={handleFinish} className="flex-1 h-14 rounded-2xl gradient-primary text-white font-black uppercase tracking-widest text-xs shadow-lg disabled:opacity-20 flex items-center justify-center gap-3">
                  {loading ? "Processando..." : <>Finalizar e Enviar <Send className="w-4 h-4" /></>}
                </Button>
              </div>
            </motion.div>
          )}

          {/* TELA 10: SUCESSO */}
          {step === 10 && (
            <motion.div key="step10" variants={cardVariants} initial="initial" animate="animate" exit="exit" className="glass-panel-premium rounded-[2.5rem] p-12 text-center border-white/5 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                <CheckCircle2 className="w-64 h-64 text-primary" />
              </div>
              
              <div className="w-24 h-24 rounded-3xl gradient-primary mx-auto flex items-center justify-center mb-8 shadow-xl relative z-10">
                <Rocket className="w-12 h-12 text-white" />
              </div>
              
              <h1 className="text-5xl font-black text-white mb-6 leading-tight tracking-tighter relative z-10">
                Tudo pronto, <br />
                <span className="gradient-text">{formData.nome.split(' ')[0]}!</span>
              </h1>
              <p className="text-white/60 mb-10 text-xl font-medium leading-relaxed relative z-10">
                Nossa equipe de especialistas já recebeu seu briefing e entrará em contato em breve.
              </p>
              
              <div className="flex flex-col gap-4 max-w-sm mx-auto relative z-10">
                <Button 
                  onClick={() => window.open(`https://wa.me/5551981964238?text=${encodeURIComponent(`Olá! Acabei de preencher o quiz do projeto para a ${formData.empresa}. Meu nome é ${formData.nome}.`)}`, "_blank")}
                  className="h-16 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-black uppercase tracking-widest text-sm shadow-xl flex items-center justify-center gap-3"
                >
                  <MessageCircle className="w-6 h-6 border-r border-white/20 pr-3 mr-1" /> Chamar no WhatsApp
                </Button>
                <Button variant="ghost" onClick={() => window.location.href = "/"} className="h-14 text-white/40 hover:text-white font-black uppercase tracking-widest text-xs">
                  Voltar para o Início
                </Button>
              </div>
              
              <div className="mt-12 flex items-center justify-center gap-2 opacity-30">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Análise Prioritária Ativada</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
