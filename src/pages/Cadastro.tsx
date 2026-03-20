import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Check, ArrowRight, ArrowLeft, MessageCircle, ChevronLeft,
  AlertCircle, Loader2, Star, Rocket, Globe, ShieldCheck, Zap,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { sendPushToAdmins } from "@/lib/push-notifications";

const segmentos = ["Restaurante", "Clínica", "Loja", "Escritório", "Outro"];
const servicosOpcoes = ["Site", "Loja Virtual", "App", "Identidade Visual"];
const orcamentoOpcoes = ["Até R$500/mês", "R$500 a R$1.500/mês", "R$1.500 a R$3.000/mês", "Acima de R$3.000/mês", "Não sei ainda"];
const origemOpcoes = ["Google", "Instagram", "Indicação", "Outro"];

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

const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
const validateWhatsApp = (w: string) => { const d = w.replace(/\D/g, ""); return d.length === 10 || d.length === 11; };

type FieldErrors = { [key: string]: string };

export default function Cadastro() {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [enviado, setEnviado] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [cepLoading, setCepLoading] = useState(false);
  const [form, setForm] = useState({
    nome: "", email: "", whatsapp: "", cep: "", rua: "", numero: "", cidade: "", estado: "", documento: "",
    nome_negocio: "", segmento: "", servicos: [] as string[], orcamento: "", como_conheceu: "", mensagem: "",
  });

  const updateForm = (field: string, value: string | string[]) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
  };

  const handleCepChange = async (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 8);
    const fmt = digits.length <= 5 ? digits : `${digits.slice(0, 5)}-${digits.slice(5)}`;
    updateForm("cep", fmt);
    if (digits.length === 8) {
      setCepLoading(true);
      try {
        const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
        const data = await res.json();
        if (!data.erro) setForm(prev => ({ ...prev, cep: fmt, rua: data.logradouro || prev.rua, cidade: data.localidade || prev.cidade, estado: data.uf || prev.estado }));
      } catch { /* ignore */ }
      setCepLoading(false);
    }
  };

  const toggleServico = (s: string) => setForm(prev => ({
    ...prev, servicos: prev.servicos.includes(s) ? prev.servicos.filter(x => x !== s) : [...prev.servicos, s],
  }));

  const validateStep1 = (): boolean => {
    const errs: FieldErrors = {};
    if (!form.nome.trim() || form.nome.trim().length < 3) errs.nome = "Nome deve ter pelo menos 3 caracteres";
    if (!form.email.trim() || !validateEmail(form.email)) errs.email = "Digite um e-mail válido";
    if (!form.whatsapp.trim() || !validateWhatsApp(form.whatsapp)) errs.whatsapp = "Número inválido. Use (DD) 99999-9999";
    setErrors(errs);
    if (Object.keys(errs).length > 0) { toast({ title: "Corrija os campos destacados", variant: "destructive" }); return false; }
    return true;
  };

  const handleSubmit = async () => {
    setLoading(true);
    const { error } = await supabase.from("leads").insert({
      nome: form.nome.trim(), email: form.email.trim().toLowerCase(),
      whatsapp: form.whatsapp.replace(/\D/g, ""),
      cidade: form.cidade || null, estado: form.estado || null, documento: form.documento || null,
      nome_negocio: form.nome_negocio || null, segmento: form.segmento || null,
      servicos: form.servicos, orcamento: form.orcamento || null,
      como_conheceu: form.como_conheceu || null, mensagem: form.mensagem || null,
    });
    setLoading(false);
    if (error) {
      toast({ title: "Erro ao enviar", description: error.message, variant: "destructive" });
    } else {
      setEnviado(true);
      sendPushToAdmins("🆕 Novo Cadastro", `${form.nome} se cadastrou pelo site!`, "/admin/leads");
    }
  };

  const FieldError = ({ field }: { field: string }) => errors[field] ? (
    <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-red-400 flex items-center gap-1 mt-1">
      <AlertCircle className="w-3 h-3" /> {errors[field]}
    </motion.p>
  ) : null;

  const inputClass = (field?: string) =>
    `bg-white/5 border text-white h-10 rounded-xl text-sm placeholder:text-white/30 focus:ring-1 focus:ring-red-500/40 ${field && errors[field] ? "border-red-500/60" : "border-white/10 focus:border-white/20"}`;

  // --- SUCCESS SCREEN ---
  if (enviado) {
    return (
      <div className="min-h-screen bg-[#08080f] flex items-center justify-center p-4">
        <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center max-w-md">
          <motion.div
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            className="w-24 h-24 rounded-full bg-gradient-to-br from-red-500 to-pink-600 mx-auto flex items-center justify-center mb-6 shadow-2xl shadow-red-500/40"
          >
            <Check className="w-12 h-12 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold text-white mb-3">Cadastro recebido! 🎉</h1>
          <p className="text-white/60 mb-8">Nossa equipe vai entrar em contato em breve pelo WhatsApp.</p>
          <a href={`https://wa.me/5551981964238?text=${encodeURIComponent(`Olá! Sou ${form.nome}, acabei de me cadastrar no site da NovaesWeb.`)}`} target="_blank" rel="noopener noreferrer">
            <Button className="bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl px-8 h-12 text-base gap-2 shadow-lg shadow-green-500/20">
              <MessageCircle className="w-5 h-5" /> Falar agora no WhatsApp
            </Button>
          </a>
        </motion.div>
      </div>
    );
  }

  // --- MAIN LAYOUT ---
  return (
    <div className="min-h-screen bg-[#08080f] flex lg:flex-row flex-col">

      {/* ── LEFT PANEL ───────────────────────────────── */}
      <div className="relative lg:w-5/12 bg-gradient-to-br from-[#12091d] via-[#0e0a1a] to-[#08080f] flex flex-col justify-between p-8 lg:p-12 overflow-hidden lg:min-h-screen">
        {/* Decorative orbs */}
        <div className="absolute top-[-80px] left-[-80px] w-[300px] h-[300px] rounded-full bg-red-600/20 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-[-60px] right-[-60px] w-[250px] h-[250px] rounded-full bg-purple-600/15 blur-[80px] pointer-events-none" />

        <div className="relative z-10">
          {/* Logo */}
          <Link to="/" className="inline-flex items-center gap-2 mb-12">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center shadow-lg shadow-red-500/30">
              <span className="text-white font-bold text-sm">NW</span>
            </div>
            <span className="text-lg font-bold">
              <span className="bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent">Novaes</span>
              <span className="text-white">Web</span>
            </span>
          </Link>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <h1 className="text-3xl lg:text-4xl font-bold text-white leading-tight mb-4">
              Vamos começar<br />
              <span className="bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent">o seu projeto?</span>
            </h1>
            <p className="text-white/50 text-sm leading-relaxed mb-10">
              Preencha o formulário e nossa equipe entrará em contato em até 2 horas com uma proposta personalizada.
            </p>

            <div className="space-y-4">
              {beneficios.map((b, i) => (
                <motion.div key={b.text} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.08 }}
                  className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                    <b.icon className="w-4 h-4 text-red-400" />
                  </div>
                  <span className="text-white/70 text-sm">{b.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Testimonial */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          className="relative z-10 mt-10 lg:mt-0 p-5 rounded-2xl bg-white/5 border border-white/8">
          <div className="flex gap-0.5 mb-3">
            {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />)}
          </div>
          <p className="text-white/70 text-sm leading-relaxed italic mb-3">
            "A NovaesWeb transformou nosso negócio. Site entregue em menos de uma semana e as vendas dobraram!"
          </p>
          <p className="text-white/40 text-xs">— Carlos M., Restaurante São Paulo</p>
        </motion.div>
      </div>

      {/* ── RIGHT PANEL (form) ───────────────────────── */}
      <div className="flex-1 flex flex-col justify-center p-6 lg:p-12 xl:p-20">
        <div className="w-full max-w-md mx-auto">
          {/* Mobile back link */}
          <Link to="/" className="inline-flex items-center gap-1 text-sm text-white/40 hover:text-white/70 transition-colors mb-6 lg:hidden">
            <ChevronLeft className="w-4 h-4" /> Voltar ao site
          </Link>

          {/* Stepper */}
          <div className="flex items-center gap-3 mb-8">
            {[1, 2].map(s => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${step >= s ? "bg-gradient-to-br from-red-500 to-pink-600 text-white shadow-lg shadow-red-500/20" : "bg-white/5 text-white/30 border border-white/10"}`}>
                  {step > s ? <Check className="w-4 h-4" /> : s}
                </div>
                <span className={`text-xs font-medium hidden sm:block transition-colors ${step >= s ? "text-white/80" : "text-white/30"}`}>
                  {s === 1 ? "Seus dados" : "Sobre o projeto"}
                </span>
                {s === 1 && (
                  <div className="w-10 h-0.5 bg-white/10 mx-1 rounded overflow-hidden">
                    <div className={`h-full bg-gradient-to-r from-red-500 to-pink-600 transition-all duration-500 ${step >= 2 ? "w-full" : "w-0"}`} />
                  </div>
                )}
              </div>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {/* ─ STEP 1 ─ */}
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }} className="space-y-4">
                <div>
                  <p className="text-white font-semibold text-lg mb-1">Seus dados de contato</p>
                  <p className="text-white/40 text-sm">Vamos precisar disso para entrar em contato.</p>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs text-white/50">Nome completo <span className="text-red-400">*</span></Label>
                  <Input className={inputClass("nome")} value={form.nome} onChange={e => updateForm("nome", e.target.value)} placeholder="Seu nome completo" />
                  <FieldError field="nome" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-white/50">E-mail <span className="text-red-400">*</span></Label>
                    <Input type="email" className={inputClass("email")} value={form.email} onChange={e => updateForm("email", e.target.value)} placeholder="seu@email.com" />
                    <FieldError field="email" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-white/50">WhatsApp <span className="text-red-400">*</span></Label>
                    <Input className={inputClass("whatsapp")} placeholder="(51) 99999-9999" value={form.whatsapp} onChange={e => updateForm("whatsapp", formatWhatsApp(e.target.value))} />
                    <FieldError field="whatsapp" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-white/50">CEP</Label>
                    <div className="relative">
                      <Input className={inputClass()} placeholder="00000-000" value={form.cep} onChange={e => handleCepChange(e.target.value)} />
                      {cepLoading && <Loader2 className="w-4 h-4 animate-spin absolute right-3 top-3 text-white/30" />}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-white/50">Estado</Label>
                    <Input className={inputClass()} placeholder="UF" value={form.estado} onChange={e => updateForm("estado", e.target.value)} />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs text-white/50">Cidade</Label>
                  <Input className={inputClass()} value={form.cidade} onChange={e => updateForm("cidade", e.target.value)} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-white/50">Rua</Label>
                    <Input className={inputClass()} value={form.rua} onChange={e => updateForm("rua", e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-white/50">Número</Label>
                    <Input className={inputClass()} placeholder="123" value={form.numero} onChange={e => updateForm("numero", e.target.value)} />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs text-white/50">CPF ou CNPJ</Label>
                  <Input className={inputClass()} value={form.documento} onChange={e => updateForm("documento", e.target.value)} />
                </div>

                <Button
                  className="w-full h-11 rounded-xl bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white border-0 font-semibold gap-2 shadow-lg shadow-red-500/20 mt-2"
                  onClick={() => { if (validateStep1()) setStep(2); }}
                >
                  Próximo <ArrowRight className="w-4 h-4" />
                </Button>
              </motion.div>
            )}

            {/* ─ STEP 2 ─ */}
            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} className="space-y-4">
                <div>
                  <p className="text-white font-semibold text-lg mb-1">Sobre o seu projeto</p>
                  <p className="text-white/40 text-sm">Nos conte mais para prepararmos a melhor proposta.</p>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs text-white/50">Nome do negócio</Label>
                  <Input className={inputClass()} value={form.nome_negocio} onChange={e => updateForm("nome_negocio", e.target.value)} placeholder="Ex: Restaurante São Paulo" />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs text-white/50">Segmento</Label>
                  <Select value={form.segmento} onValueChange={v => updateForm("segmento", v)}>
                    <SelectTrigger className={inputClass()}>
                      <SelectValue placeholder="Selecione o segmento..." />
                    </SelectTrigger>
                    <SelectContent>{segmentos.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-white/50">O que você precisa?</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {servicosOpcoes.map(s => (
                      <label key={s} className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-all text-sm ${form.servicos.includes(s) ? "border-red-500/50 bg-red-500/10 text-white" : "border-white/8 text-white/50 hover:border-white/20"}`}>
                        <Checkbox checked={form.servicos.includes(s)} onCheckedChange={() => toggleServico(s)} className="border-white/20 data-[state=checked]:bg-red-500 data-[state=checked]:border-red-500" />
                        {s}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-white/50">Orçamento aproximado</Label>
                  <div className="space-y-1.5">
                    {orcamentoOpcoes.map(o => (
                      <label key={o} onClick={() => updateForm("orcamento", o)}
                        className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all text-sm ${form.orcamento === o ? "border-red-500/50 bg-red-500/10 text-white" : "border-white/8 text-white/50 hover:border-white/20"}`}>
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${form.orcamento === o ? "border-red-500" : "border-white/20"}`}>
                          {form.orcamento === o && <div className="w-2 h-2 rounded-full bg-red-500" />}
                        </div>
                        {o}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs text-white/50">Como nos conheceu?</Label>
                  <Select value={form.como_conheceu} onValueChange={v => updateForm("como_conheceu", v)}>
                    <SelectTrigger className={inputClass()}>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>{origemOpcoes.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs text-white/50">Mensagem <span className="text-white/25">(opcional)</span></Label>
                  <Textarea
                    className="bg-white/5 border border-white/10 text-white rounded-xl text-sm placeholder:text-white/30 focus:ring-1 focus:ring-red-500/40 min-h-[80px]"
                    value={form.mensagem} onChange={e => updateForm("mensagem", e.target.value)}
                    placeholder="Conte mais sobre o seu projeto..."
                  />
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1 h-11 rounded-xl border-white/10 bg-white/5 text-white/60 hover:text-white hover:bg-white/8 gap-2" onClick={() => setStep(1)}>
                    <ArrowLeft className="w-4 h-4" /> Voltar
                  </Button>
                  <Button
                    className="flex-[2] h-11 rounded-xl bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white border-0 font-semibold shadow-lg shadow-red-500/20"
                    onClick={handleSubmit} disabled={loading}
                  >
                    {loading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Enviando...</> : "Enviar cadastro"}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <p className="text-center text-white/20 text-[10px] mt-8">NovaesWeb © {new Date().getFullYear()} · Todos os direitos reservados</p>
        </div>
      </div>
    </div>
  );
}
