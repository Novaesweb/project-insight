import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Check, MessageCircle, ChevronLeft,
  AlertCircle, Loader2, Star, Rocket, Zap, Globe, ShieldCheck
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

  const validate = (): boolean => {
    const errs: FieldErrors = {};
    if (!form.nome.trim()) errs.nome = "Nome é obrigatório";
    if (!form.email.trim() || !form.email.includes("@")) errs.email = "E-mail inválido";
    if (!form.whatsapp.trim() || !validateWhatsApp(form.whatsapp)) errs.whatsapp = "WhatsApp inválido";
    if (!form.nome_negocio.trim()) errs.nome_negocio = "Nome do negócio é obrigatório";
    if (!form.tipo_negocio.trim()) errs.tipo_negocio = "Tipo de negócio é obrigatório";
    if (form.servicos.length === 0) errs.servicos = "Selecione o que você precisa";
    
    setErrors(errs);
    if (Object.keys(errs).length > 0) { 
      toast({ title: "Preencha os campos obrigatórios", variant: "destructive" }); 
      return false; 
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    
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
    <div className="min-h-screen bg-background flex lg:flex-row flex-col relative overflow-hidden ambient-glow">
      <div className="ultra-premium-bg" />
      <div className="ambient-rays-unified" />

      {/* ── LEFT PANEL ── */}
      <div className="relative lg:w-5/12 flex flex-col justify-between p-8 lg:p-16 overflow-hidden lg:min-h-screen z-10">
        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-3 mb-16 group">
            <motion.div whileHover={{ rotate: 10, scale: 1.1 }} className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-lg">
              <Zap className="text-white w-5 h-5 fill-current" />
            </motion.div>
            <span className="text-xl font-black tracking-tighter">
              <span className="gradient-text">Novaes</span>
              <span className="text-white">Web</span>
            </span>
          </Link>

          <motion.div 
            initial={{ opacity: 0, x: -50 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h1 className="text-4xl lg:text-7xl font-black text-white leading-[0.85] tracking-tighter mb-8">
              O início do <br />
              <span className="text-white/20">seu melhor </span> <br />
              <span className="gradient-text">projeto.</span>
            </h1>
            <p className="text-white/40 text-lg leading-relaxed mb-12 max-w-sm font-medium">
              Não entregamos apenas código. Entregamos vantagem competitiva através de design estratégico e engenharia de ponta.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {beneficios.map((b, i) => (
                <div key={b.text} className="glass-card rounded-[1.5rem] p-5 flex flex-col gap-4 border-white/5 hover:border-white/10 transition-colors group cursor-default">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <b.icon className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-white/70 text-xs font-bold uppercase tracking-wider leading-tight">{b.text}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.6 }}
          className="relative z-10 mt-16 lg:mt-0 p-8 rounded-[2rem] glass-panel-premium border-white/5"
        >
          <div className="flex gap-1 mb-4">
            {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-primary text-primary" />)}
          </div>
          <p className="text-white/80 text-lg leading-relaxed italic mb-4 font-medium">
            "A NovaesWeb transformou nosso negócio. Site entregue em menos de uma semana e as vendas dobraram!"
          </p>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-black">CM</div>
            <div>
              <p className="text-white text-xs font-black uppercase tracking-widest">Carlos M.</p>
              <p className="text-white/30 text-[10px] uppercase font-bold tracking-widest">Restaurante S.P</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── RIGHT PANEL (form) ── */}
      <div className="flex-1 flex flex-col justify-center p-6 lg:p-12 xl:p-24 relative z-20">
        <div className="w-full max-w-xl mx-auto">
          <Link to="/" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/20 hover:text-primary transition-colors mb-12">
            <ChevronLeft className="w-5 h-5" /> Voltar ao site
          </Link>

          <motion.div 
            initial="hidden" 
            animate="visible" 
            variants={containerVariants}
            className="glass-panel-premium rounded-[3rem] p-8 sm:p-12 border-white/5 shadow-2xl relative overflow-hidden"
          >
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 blur-[100px] rounded-full" />
            
            <div className="space-y-12 relative z-10">
              <motion.div variants={itemVariants}>
                <h2 className="text-4xl font-black text-white tracking-tighter mb-2">Crie seu site profissional agora</h2>
                <p className="text-white/30 text-lg font-medium">Leva menos de 1 minuto 👇</p>
              </motion.div>

              {/* ─ BASIC INFO ─ */}
              <motion.div variants={itemVariants} className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="h-px flex-1 bg-white/5" />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">👤 Informações básicas</span>
                  <div className="h-px flex-1 bg-white/5" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className={labelClass}>Seu nome <span className="text-primary">*</span></Label>
                    <Input className={inputClass("nome")} value={form.nome} onChange={e => updateForm("nome", e.target.value)} placeholder="Nome completo" />
                    <FieldError field="nome" />
                  </div>
                  <div className="space-y-2">
                    <Label className={labelClass}>E-mail / Gmail <span className="text-primary">*</span></Label>
                    <Input type="email" className={inputClass("email")} value={form.email} onChange={e => updateForm("email", e.target.value)} placeholder="seu@email.com" />
                    <FieldError field="email" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className={labelClass}>WhatsApp direto <span className="text-primary">*</span></Label>
                    <Input className={inputClass("whatsapp")} placeholder="(00) 00000-0000" value={form.whatsapp} onChange={e => updateForm("whatsapp", formatWhatsApp(e.target.value))} />
                    <FieldError field="whatsapp" />
                  </div>
                   <div className="hidden sm:block" />
                </div>
              </motion.div>

              {/* ─ BUSINESS INFO ─ */}
              <motion.div variants={itemVariants} className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="h-px flex-1 bg-white/5" />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">🏢 Sobre o negócio</span>
                  <div className="h-px flex-1 bg-white/5" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className={labelClass}>Nome do negócio <span className="text-primary">*</span></Label>
                    <Input className={inputClass("nome_negocio")} value={form.nome_negocio} onChange={e => updateForm("nome_negocio", e.target.value)} placeholder="Ex: Pizzaria do Zé" />
                    <FieldError field="nome_negocio" />
                  </div>
                  <div className="space-y-2">
                    <Label className={labelClass}>Tipo de negócio <span className="text-primary">*</span></Label>
                    <Input className={inputClass("tipo_negocio")} value={form.tipo_negocio} onChange={e => updateForm("tipo_negocio", e.target.value)} placeholder="pizzaria, açaí, loja, barbearia…" />
                    <FieldError field="tipo_negocio" />
                  </div>
                </div>
              </motion.div>

              {/* ─ QUALIFICATION ─ */}
              <motion.div variants={itemVariants} className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="h-px flex-1 bg-white/5" />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">📊 Qualificação</span>
                  <div className="h-px flex-1 bg-white/5" />
                </div>
                <div className="space-y-6">
                  <div className="space-y-4">
                    <Label className={labelClass}>O que você precisa? <span className="text-primary">*</span></Label>
                    <div className="grid grid-cols-2 gap-3">
                      {servicosOpcoes.map(s => (
                        <label key={s} className={cn(
                          "flex items-center gap-3 p-4 rounded-2xl border cursor-pointer transition-all text-xs font-bold uppercase tracking-widest",
                          form.servicos.includes(s) ? "border-primary/50 bg-primary/10 text-white" : "border-white/5 bg-white/5 text-white/30"
                        )}>
                          <Checkbox checked={form.servicos.includes(s)} onCheckedChange={() => toggleServico(s)} className="border-white/20" />
                          {s}
                        </label>
                      ))}
                    </div>
                    <FieldError field="servicos" />
                  </div>
                  <div className="space-y-4">
                    <Label className={labelClass}>Investimento aproximado</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {orcamentoOpcoes.map(o => (
                        <label key={o} onClick={() => updateForm("orcamento", o)} className={cn(
                          "flex items-center gap-4 p-4 rounded-2xl border cursor-pointer transition-all text-[10px] font-bold tracking-widest uppercase",
                          form.orcamento === o ? "border-primary/50 bg-primary/10 text-white" : "border-white/5 bg-white/5 text-white/30"
                        )}>
                          <div className={cn("w-4 h-4 rounded-full border-2 flex items-center justify-center", form.orcamento === o ? "border-primary" : "border-white/20")}>
                            {form.orcamento === o && <div className="w-2 h-2 rounded-full bg-primary" />}
                          </div>
                          {o}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* ─ DIFFERENTIAL ─ */}
              <motion.div variants={itemVariants} className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="h-px flex-1 bg-white/5" />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">🧠 Diferencial</span>
                  <div className="h-px flex-1 bg-white/5" />
                </div>
                <div className="space-y-2">
                  <Label className={labelClass}>Descreva o que você precisa</Label>
                  <Textarea
                    className="glass-input border-white/5 text-white rounded-[2rem] text-sm min-h-[150px] p-8 focus:border-primary/30"
                    value={form.mensagem} onChange={e => updateForm("mensagem", e.target.value)}
                    placeholder="Ex: Quero um site para pedidos de açaí..."
                  />
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="pt-8">
                <Button className="w-full h-20 rounded-[1.5rem] gradient-primary text-white border-0 font-black text-sm uppercase tracking-[0.2em] shadow-2xl hover:scale-[1.02] active:scale-95 transition-all group overflow-hidden relative"
                  onClick={handleSubmit} disabled={loading}>
                  {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <>👉 Enviar formulário <Rocket className="ml-3 w-6 h-6" /></>}
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
