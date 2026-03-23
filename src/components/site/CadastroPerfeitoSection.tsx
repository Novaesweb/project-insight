import { useState } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Check, MessageCircle, AlertCircle, Loader2, Rocket, Zap
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { sendPushToAdmins } from "@/lib/push-notifications";
import { cn } from "@/lib/utils";

const servicosOpcoes = ["Site", "Loja Online"];
const orcamentoOpcoes = ["Até R$300", "R$300 a R$800", "R$800 a R$1.500", "Acima de R$1.500", "Não sei ainda"];
const origemOpcoes = ["Instagram", "WhatsApp", "Indicação", "Google", "TikTok", "Outro"];

const formatWhatsApp = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
};

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

export default function CadastroPerfeitoSection() {
  const { toast } = useToast();
  const [enviado, setEnviado] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [form, setForm] = useState({
    nome: "", whatsapp: "", nome_negocio: "", tipo_negocio: "",
    servicos: [] as string[], orcamento: "", como_conheceu: "", mensagem: "",
  });

  const updateForm = (field: string, value: string | string[]) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
  };

  const toggleServico = (s: string) => {
    const next = form.servicos.includes(s) ? form.servicos.filter(i => i !== s) : [...form.servicos, s];
    updateForm("servicos", next);
  };

  const validate = () => {
    const e: FieldErrors = {};
    if (!form.nome.trim()) e.nome = "Nome é obrigatório";
    if (!form.whatsapp.trim()) e.whatsapp = "WhatsApp é obrigatório";
    if (!form.nome_negocio.trim()) e.nome_negocio = "Nome do negócio é obrigatório";
    if (!form.tipo_negocio.trim()) e.tipo_negocio = "Tipo de negócio é obrigatório";
    if (form.servicos.length === 0) e.servicos = "Selecione ao menos um serviço";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);

    const { error } = await supabase.from("leads").insert({
      nome: form.nome.trim(),
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
      sendPushToAdmins("🆕 Novo Cadastro Perfeito (Home)", `${form.nome} está interessado em ${form.servicos.join(", ")}`, "/admin/leads");
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
      <section id="cadastro" className="py-24 px-6 relative overflow-hidden">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }} 
          animate={{ scale: 1, opacity: 1 }} 
          className="text-center max-w-lg mx-auto glass-panel-premium p-12 rounded-[2.5rem] border-white/5 relative z-10 shadow-2xl"
        >
          <motion.div
            initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.2 }}
            className="w-20 h-20 rounded-3xl gradient-primary mx-auto flex items-center justify-center mb-8 shadow-xl"
          >
            <Check className="w-10 h-10 text-white stroke-[3px]" />
          </motion.div>
          
          <h2 className="text-3xl font-black text-white mb-6 tracking-tighter leading-tight">
            Cadastro enviado <br />
            <span className="gradient-text">com sucesso! 🚀</span>
          </h2>
          <p className="text-white/40 mb-10 text-base font-medium leading-relaxed">
            Recebemos suas informações e vamos te chamar em breve no WhatsApp!
          </p>
          
          <Button className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-2xl h-14 text-base font-black gap-3 shadow-lg uppercase tracking-widest"
            onClick={() => window.open(`https://wa.me/5551981964238?text=${encodeURIComponent(`Olá! Sou ${form.nome}, acabei de me cadastrar no site.`)}`, "_blank")}>
            <MessageCircle className="w-6 h-6" /> Falar no WhatsApp
          </Button>
        </motion.div>
      </section>
    );
  }

  return (
    <section id="cadastro" className="py-24 px-6 relative overflow-hidden">
      {/* Background elements to match parent site design */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] rounded-full bg-primary/5 blur-[120px]" />
      </div>

      <div className="max-w-4xl mx-auto">
        <motion.div 
          initial="hidden" 
          whileInView="visible" 
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
          className="glass-panel-premium rounded-[3rem] p-8 sm:p-16 border-white/5 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 blur-[100px] rounded-full" />
          
          <div className="space-y-12 relative z-10">
            <motion.div variants={itemVariants} className="text-center">
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary bg-primary/10 px-4 py-1.5 rounded-full mb-6 inline-block">🚀 Projeto Customizado</span>
              <h2 className="text-4xl sm:text-6xl font-black text-white tracking-tighter mb-4 leading-none">Crie seu site <br /><span className="gradient-text">profissional agora</span></h2>
              <p className="text-white/30 text-lg font-medium">Leva menos de 1 minuto 👇</p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Left Column Fields */}
              <div className="space-y-8">
                <motion.div variants={itemVariants} className="space-y-6">
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 block">👤 Básico</span>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className={labelClass}>Seu nome <span className="text-primary">*</span></Label>
                      <Input className={inputClass("nome")} value={form.nome} onChange={e => updateForm("nome", e.target.value)} placeholder="Nome completo" />
                      <FieldError field="nome" />
                    </div>
                    <div className="space-y-2">
                      <Label className={labelClass}>WhatsApp <span className="text-primary">*</span></Label>
                      <Input className={inputClass("whatsapp")} placeholder="(00) 00000-0000" value={form.whatsapp} onChange={e => updateForm("whatsapp", formatWhatsApp(e.target.value))} />
                      <FieldError field="whatsapp" />
                    </div>
                  </div>
                </motion.div>

                <motion.div variants={itemVariants} className="space-y-6">
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 block">🏢 Negócio</span>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className={labelClass}>Seu negócio <span className="text-primary">*</span></Label>
                      <Input className={inputClass("nome_negocio")} value={form.nome_negocio} onChange={e => updateForm("nome_negocio", e.target.value)} placeholder="Ex: Pizzaria do Zé" />
                      <FieldError field="nome_negocio" />
                    </div>
                    <div className="space-y-2">
                      <Label className={labelClass}>Tipo <span className="text-primary">*</span></Label>
                      <Input className={inputClass("tipo_negocio")} value={form.tipo_negocio} onChange={e => updateForm("tipo_negocio", e.target.value)} placeholder="loja, açaí, barbearia..." />
                      <FieldError field="tipo_negocio" />
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Right Column Fields */}
              <div className="space-y-8">
                <motion.div variants={itemVariants} className="space-y-6">
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 block">📊 Demanda</span>
                  <div className="space-y-4">
                    <Label className={labelClass}>O que você precisa? <span className="text-primary">*</span></Label>
                    <div className="grid grid-cols-2 gap-3">
                      {servicosOpcoes.map(s => (
                        <label key={s} className={cn(
                          "flex items-center gap-3 p-4 rounded-2xl border cursor-pointer transition-all text-[10px] font-bold uppercase tracking-widest",
                          form.servicos.includes(s) ? "border-primary/50 bg-primary/10 text-white" : "border-white/5 bg-white/5 text-white/30"
                        )}>
                          <Checkbox checked={form.servicos.includes(s)} onCheckedChange={() => toggleServico(s)} className="border-white/20" />
                          {s}
                        </label>
                      ))}
                    </div>
                    <FieldError field="servicos" />
                  </div>
                </motion.div>

                <motion.div variants={itemVariants} className="space-y-6">
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 block">🧠 Diferencial</span>
                  <div className="space-y-2">
                    <Label className={labelClass}>Conte-nos mais</Label>
                    <Textarea
                      className="glass-input border-white/5 text-white rounded-[1.5rem] text-sm min-h-[140px] p-6 focus:border-primary/30"
                      value={form.mensagem} onChange={e => updateForm("mensagem", e.target.value)}
                      placeholder="Descreva rapidamente sua ideia..."
                    />
                  </div>
                </motion.div>
              </div>
            </div>

            <motion.div variants={itemVariants} className="pt-8 flex flex-col items-center gap-6">
              <Button className="w-full max-w-md h-20 rounded-[1.5rem] gradient-primary text-white border-0 font-black text-sm uppercase tracking-[0.2em] shadow-2xl hover:scale-[1.02] active:scale-95 transition-all group overflow-hidden relative"
                onClick={handleSubmit} disabled={loading}>
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <>🚀 Enviar agora <Zap className="ml-3 w-6 h-6 fill-current" /></>}
              </Button>
              <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest flex items-center gap-2">
                <Check className="w-3 h-3 text-primary" /> Sem compromisso · <Check className="w-3 h-3 text-primary" /> Resposta em 2h
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
