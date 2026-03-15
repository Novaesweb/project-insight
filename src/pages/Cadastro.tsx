import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Check, ArrowRight, ArrowLeft, MessageCircle, ChevronLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const segmentos = ["Restaurante", "Clínica", "Loja", "Escritório", "Outro"];
const servicosOpcoes = ["Site", "Loja Virtual", "App", "Marketing", "Identidade Visual", "Manutenção"];
const orcamentoOpcoes = ["Até R$500", "R$500 a R$1.500", "R$1.500 a R$3.000", "Acima de R$3.000", "Não sei ainda"];
const origemOpcoes = ["Google", "Instagram", "Indicação", "Outro"];

export default function Cadastro() {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [enviado, setEnviado] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    nome: "", email: "", whatsapp: "", cidade: "", estado: "", documento: "",
    nome_negocio: "", segmento: "", servicos: [] as string[], orcamento: "", como_conheceu: "", mensagem: "",
  });

  const updateForm = (field: string, value: string | string[]) => setForm(prev => ({ ...prev, [field]: value }));

  const toggleServico = (s: string) => {
    setForm(prev => ({
      ...prev,
      servicos: prev.servicos.includes(s) ? prev.servicos.filter(x => x !== s) : [...prev.servicos, s],
    }));
  };

  const handleSubmit = async () => {
    if (!form.nome || !form.email || !form.whatsapp) {
      toast({ title: "Preencha os campos obrigatórios", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("leads").insert({
      nome: form.nome,
      email: form.email,
      whatsapp: form.whatsapp,
      cidade: form.cidade || null,
      estado: form.estado || null,
      documento: form.documento || null,
      nome_negocio: form.nome_negocio || null,
      segmento: form.segmento || null,
      servicos: form.servicos,
      orcamento: form.orcamento || null,
      como_conheceu: form.como_conheceu || null,
      mensagem: form.mensagem || null,
    });
    setLoading(false);
    if (error) {
      toast({ title: "Erro ao enviar", description: error.message, variant: "destructive" });
    } else {
      setEnviado(true);
    }
  };

  if (enviado) {
    return (
      <div className="min-h-screen bg-[hsl(var(--background))] flex items-center justify-center p-4">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center max-w-md">
          <motion.div
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            className="w-24 h-24 rounded-full gradient-primary mx-auto flex items-center justify-center mb-6 shadow-lg shadow-red-500/30"
          >
            <Check className="w-12 h-12 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold text-white mb-3">Cadastro recebido!</h1>
          <p className="text-[hsl(var(--muted-foreground))] mb-8">
            Em breve nossa equipe vai entrar em contato pelo WhatsApp. Fique de olho!
          </p>
          <a
            href={`https://wa.me/5511999999999?text=${encodeURIComponent(`Olá! Sou ${form.nome}, acabei de me cadastrar no site.`)}`}
            target="_blank" rel="noopener noreferrer"
          >
            <Button className="bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl px-8 h-12 text-base gap-2">
              <MessageCircle className="w-5 h-5" /> Falar agora no WhatsApp
            </Button>
          </a>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Botão Voltar */}
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors mb-6">
          <ChevronLeft className="w-4 h-4" /> Voltar ao site
        </Link>
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <span className="text-white font-bold text-sm">NW</span>
            </div>
            <span className="text-xl font-bold">
              <span className="gradient-text">Novaes</span>
              <span className="text-white">Web</span>
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Vamos começar o seu projeto?</h1>
          <p className="text-[hsl(var(--muted-foreground))] text-sm">
            Preencha seus dados e nossa equipe entrará em contato em até 2 horas
          </p>
        </motion.div>

        {/* Stepper */}
        <div className="flex items-center justify-center gap-3 mb-8">
          {[1, 2].map(s => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${step >= s ? "gradient-primary text-white shadow-lg shadow-red-500/20" : "bg-[rgba(255,255,255,0.06)] text-[hsl(var(--muted-foreground))]"}`}>
                {s}
              </div>
              <span className={`text-xs font-medium hidden sm:block ${step >= s ? "text-white" : "text-[hsl(var(--muted-foreground))]"}`}>
                {s === 1 ? "Dados pessoais" : "Sobre o projeto"}
              </span>
              {s === 1 && <div className="w-12 h-0.5 bg-[rgba(255,255,255,0.1)] mx-1"><div className={`h-full transition-all ${step >= 2 ? "gradient-primary w-full" : "w-0"}`} /></div>}
            </div>
          ))}
        </div>

        <Card className="glass-card border-[0.5px]">
          <CardContent className="p-6">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-[hsl(var(--muted-foreground))]">Nome completo *</Label>
                    <Input className="glass-input border-[rgba(255,255,255,0.1)] text-white h-10" value={form.nome} onChange={e => updateForm("nome", e.target.value)} />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs text-[hsl(var(--muted-foreground))]">E-mail *</Label>
                      <Input type="email" className="glass-input border-[rgba(255,255,255,0.1)] text-white h-10" value={form.email} onChange={e => updateForm("email", e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-[hsl(var(--muted-foreground))]">WhatsApp *</Label>
                      <Input className="glass-input border-[rgba(255,255,255,0.1)] text-white h-10" placeholder="(11) 99999-9999" value={form.whatsapp} onChange={e => updateForm("whatsapp", e.target.value)} />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs text-[hsl(var(--muted-foreground))]">Cidade</Label>
                      <Input className="glass-input border-[rgba(255,255,255,0.1)] text-white h-10" value={form.cidade} onChange={e => updateForm("cidade", e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-[hsl(var(--muted-foreground))]">Estado</Label>
                      <Input className="glass-input border-[rgba(255,255,255,0.1)] text-white h-10" value={form.estado} onChange={e => updateForm("estado", e.target.value)} />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-[hsl(var(--muted-foreground))]">CPF ou CNPJ</Label>
                    <Input className="glass-input border-[rgba(255,255,255,0.1)] text-white h-10" value={form.documento} onChange={e => updateForm("documento", e.target.value)} />
                  </div>
                  <Button className="gradient-primary border-0 text-white w-full h-11 rounded-xl mt-2 gap-2" onClick={() => {
                    if (!form.nome || !form.email || !form.whatsapp) { toast({ title: "Preencha nome, e-mail e WhatsApp", variant: "destructive" }); return; }
                    setStep(2);
                  }}>
                    Próximo <ArrowRight className="w-4 h-4" />
                  </Button>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-[hsl(var(--muted-foreground))]">Nome do negócio</Label>
                    <Input className="glass-input border-[rgba(255,255,255,0.1)] text-white h-10" value={form.nome_negocio} onChange={e => updateForm("nome_negocio", e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-[hsl(var(--muted-foreground))]">Segmento</Label>
                    <Select value={form.segmento} onValueChange={v => updateForm("segmento", v)}>
                      <SelectTrigger className="glass-input border-[rgba(255,255,255,0.1)] text-white h-10"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                      <SelectContent>{segmentos.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-[hsl(var(--muted-foreground))]">O que precisa?</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {servicosOpcoes.map(s => (
                        <label key={s} className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-all text-sm ${form.servicos.includes(s) ? "border-red-500/50 bg-red-500/10 text-white" : "border-[rgba(255,255,255,0.08)] text-[hsl(var(--muted-foreground))] hover:border-[rgba(255,255,255,0.15)]"}`}>
                          <Checkbox checked={form.servicos.includes(s)} onCheckedChange={() => toggleServico(s)} />
                          {s}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-[hsl(var(--muted-foreground))]">Orçamento aproximado</Label>
                    <div className="grid grid-cols-1 gap-1.5">
                      {orcamentoOpcoes.map(o => (
                        <label key={o} className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-all text-sm ${form.orcamento === o ? "border-red-500/50 bg-red-500/10 text-white" : "border-[rgba(255,255,255,0.08)] text-[hsl(var(--muted-foreground))] hover:border-[rgba(255,255,255,0.15)]"}`}
                          onClick={() => updateForm("orcamento", o)}>
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${form.orcamento === o ? "border-red-500" : "border-[rgba(255,255,255,0.2)]"}`}>
                            {form.orcamento === o && <div className="w-2 h-2 rounded-full bg-red-500" />}
                          </div>
                          {o}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-[hsl(var(--muted-foreground))]">Como nos conheceu?</Label>
                    <Select value={form.como_conheceu} onValueChange={v => updateForm("como_conheceu", v)}>
                      <SelectTrigger className="glass-input border-[rgba(255,255,255,0.1)] text-white h-10"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                      <SelectContent>{origemOpcoes.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-[hsl(var(--muted-foreground))]">Mensagem (opcional)</Label>
                    <Textarea className="glass-input border-[rgba(255,255,255,0.1)] text-white min-h-[80px]" value={form.mensagem} onChange={e => updateForm("mensagem", e.target.value)} />
                  </div>
                  <div className="flex gap-3 mt-2">
                    <Button variant="outline" className="glass-input border-[rgba(255,255,255,0.1)] text-[hsl(var(--muted-foreground))] hover:text-white flex-1 h-11 rounded-xl gap-2" onClick={() => setStep(1)}>
                      <ArrowLeft className="w-4 h-4" /> Voltar
                    </Button>
                    <Button className="gradient-primary border-0 text-white flex-[2] h-11 rounded-xl" onClick={handleSubmit} disabled={loading}>
                      {loading ? "Enviando..." : "Enviar cadastro"}
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>

        <p className="text-center text-[hsl(var(--muted-foreground))] text-[10px] mt-6">NovaesWeb © 2025</p>
      </div>
    </div>
  );
}
