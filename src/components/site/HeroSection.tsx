import { memo, useEffect, useMemo, useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Loader2,
  MessageCircle,
  Send,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SiteTypewriterLine from "@/components/site/SiteTypewriterLine";
import { useToast } from "@/hooks/use-toast";
import { submitLeadCapture } from "@/lib/lead-capture";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface HeroSectionProps {
  onOpenDemo: () => void;
}

const FALLBACK_WHATSAPP = "5551991189293";

const serviceOptions = [
  { id: "site-painel", label: "Site + painel" },
  { id: "site-vitrine", label: "Site de vitrine" },
  { id: "cardapio-delivery", label: "Cardapio virtual para delivery" },
];

const proofBullets = [
  "Diagnóstico inicial em até 24h",
  "Estrutura pensada para vender e operar",
  "Site, painel e automação na mesma direção",
];

const typedMessages = [
  "Site + painel com a sua marca",
  "Site de vitrine para vender melhor",
  "Cardapio virtual para delivery",
];

const highlightCards = [
  {
    title: "Marca mais forte",
    description: "Apresentação premium para sair do improviso e passar mais confiança.",
  },
  {
    title: "Operação mais clara",
    description: "Contratos, atendimento, extras e rotina comercial alinhados em uma base própria.",
  },
  {
    title: "Captação com direção",
    description: "Uma estrutura que ajuda a gerar conversa qualificada e não só visita solta.",
  },
];

const formatWhatsApp = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
};

function HeroSection({ onOpenDemo }: HeroSectionProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [whatsappNumber, setWhatsappNumber] = useState(FALLBACK_WHATSAPP);
  const [form, setForm] = useState({
    nome: "",
    email: "",
    whatsapp: "",
    empresa: "",
    necessidade: serviceOptions[0].id,
    _fax: "",
  });

  useEffect(() => {
    supabase
      .from("app_config")
      .select("value")
      .eq("key", "whatsapp_number")
      .single()
      .then(({ data }) => {
        if (data?.value) {
          setWhatsappNumber(data.value.replace(/\D/g, "") || FALLBACK_WHATSAPP);
        }
      });
  }, []);

  const whatsappUrl = useMemo(
    () =>
      `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
        "Ola! Quero entender qual estrutura da NovaesWeb faz mais sentido para o meu negocio."
      )}`,
    [whatsappNumber]
  );

  const updateField = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    if (errors[field]) {
      setErrors((current) => {
        const next = { ...current };
        delete next[field];
        return next;
      });
    }
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};

    if (!form.nome.trim()) nextErrors.nome = "Informe seu nome.";
    if (!form.empresa.trim()) nextErrors.empresa = "Informe o nome do negocio.";
    if (!form.email.trim() || !form.email.includes("@")) nextErrors.email = "Informe um e-mail valido.";
    if (form.whatsapp.replace(/\D/g, "").length < 10) nextErrors.whatsapp = "Informe um WhatsApp valido.";
    if (!form.necessidade) nextErrors.necessidade = "Escolha a estrutura que mais combina com seu momento.";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validate()) {
      toast({
        title: "Preencha os campos principais",
        description: "Precisamos de alguns dados para montar seu orçamento inicial.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    if (form._fax) {
      setLoading(false);
      setSubmitted(true);
      return;
    }

    const now = Date.now();
    const rateLimitRaw = localStorage.getItem("hero_lead_rate_limit");
    let rateLimit = rateLimitRaw ? JSON.parse(rateLimitRaw) : { count: 0, firstAt: now };

    if (now - rateLimit.firstAt > 10 * 60 * 1000) {
      rateLimit = { count: 1, firstAt: now };
    } else {
      rateLimit.count += 1;
    }

    localStorage.setItem("hero_lead_rate_limit", JSON.stringify(rateLimit));

    if (rateLimit.count > 3) {
      setLoading(false);
      toast({
        title: "Limite excedido",
        description: "Aguarde alguns minutos antes de tentar novamente.",
        variant: "destructive",
      });
      return;
    }

    let error: Error | null = null;

    try {
      await submitLeadCapture({
        nome: form.nome.trim(),
        email: form.email.trim(),
        whatsapp: form.whatsapp.replace(/\D/g, ""),
        nome_negocio: form.empresa.trim(),
        servicos: [form.necessidade],
        orcamento: "A definir no diagnostico inicial",
        mensagem: "Lead captado pelo formulario curto do hero editorial.",
        source: "site-hero-form",
        origin: window.location.pathname,
        _fax: form._fax,
      });
    } catch (submitError) {
      error = submitError instanceof Error ? submitError : new Error("Falha ao enviar seu contato.");
    }

    setLoading(false);

    if (error) {
      toast({
        title: "Nao foi possivel enviar agora",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setSubmitted(true);
  };

  return (
    <section id="cadastro" className="relative overflow-hidden px-4 sm:px-6 pb-16 pt-28 lg:pb-20 lg:pt-32">
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div
          className="absolute left-[-8%] top-0 h-[520px] w-[520px] rounded-full blur-[180px] opacity-[0.08]"
          style={{ background: "radial-gradient(circle, rgba(220,38,38,0.36), transparent 72%)" }}
        />
        <div
          className="absolute bottom-[-10%] right-[-8%] h-[540px] w-[540px] rounded-full blur-[180px] opacity-[0.09]"
          style={{ background: "radial-gradient(circle, rgba(236,72,153,0.24), transparent 72%)" }}
        />
        {/* Animated Background Grid */}
        <motion.div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
          }}
          animate={{
            backgroundPosition: ['0px 0px', '0px 64px'],
          }}
          transition={{
            repeat: Infinity,
            duration: 5,
            ease: "linear"
          }}
        />
      </div>

      <div className="public-page-container">
        <div className="public-page-hero">
          <div className="public-page-hero-grid gap-8 lg:gap-10">
            <div className="flex flex-col justify-center">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="site-badge site-badge--accent mb-6 w-fit"
              >
                <Sparkles className="h-3.5 w-3.5" />
                NovaesWeb Studio
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.08 }}
                className="public-page-title"
              >
                Sua proxima fase digital precisa vender, organizar e valorizar a sua marca.
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.16 }}
                className="public-page-description mt-6"
              >
                A NovaesWeb desenha uma estrutura digital premium para empresas que querem sair do improviso e operar
                com mais clareza: site, painel, contratos, extras e automação com a mesma linguagem comercial.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.24 }}
                className="mt-6"
              >
                <SiteTypewriterLine messages={typedMessages} />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.3 }}
                className="mt-7 flex flex-wrap gap-3"
              >
                {proofBullets.map((item) => (
                  <span
                    key={item}
                    className="site-soft-surface rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-white/72"
                  >
                    {item}
                  </span>
                ))}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.38 }}
                className="mt-8 grid gap-4 md:grid-cols-3"
              >
                {highlightCards.map((card) => (
                  <div key={card.title} className="public-page-highlight-card">
                    <p className="text-sm font-black tracking-tight text-white/92">{card.title}</p>
                    <p className="mt-2 text-xs leading-relaxed text-white/58">{card.description}</p>
                  </div>
                ))}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.46 }}
                className="mt-8 flex flex-col gap-3 sm:flex-row"
              >
                  <Button onClick={onOpenDemo} className="site-soft-surface h-12 rounded-2xl px-7 text-sm font-bold text-white/82 transition-all hover:text-white">
                  Ver demonstracao
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                  <Button
                    className="h-12 rounded-2xl border border-white/10 px-7 text-sm font-bold text-white shadow-[0_14px_36px_rgba(236,72,153,0.14)]"
                    style={{ background: "linear-gradient(135deg, rgba(220,38,38,0.92), rgba(107,33,168,0.9), rgba(236,72,153,0.88))" }}
                  >
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Falar no WhatsApp
                  </Button>
                </a>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.18 }}
              className="site-surface rounded-[2rem] p-5 sm:p-6"
            >
              {!submitted ? (
                <>
                  <div className="mb-5">
                    <div className="site-badge site-badge--primary mb-4">Solicitar orcamento</div>
                    <h2 className="text-2xl font-black tracking-tight text-white/92">Receba um diagnostico inicial.</h2>
                    <p className="mt-2 text-sm leading-relaxed text-white/62">
                      Preencha o essencial e a NovaesWeb retorna com o formato mais indicado para sua estrutura.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                      type="text"
                      name="_fax"
                      tabIndex={-1}
                      autoComplete="none"
                      className="absolute -z-10 h-0 w-0 opacity-0"
                      value={form._fax}
                      onChange={(event) => updateField("_fax", event.target.value)}
                    />

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.18em] text-white/45">
                          Nome
                        </label>
                        <Input
                          value={form.nome}
                          onChange={(event) => updateField("nome", event.target.value)}
                          placeholder="Seu nome"
                          className={cn(
                            "h-12 rounded-2xl border-white/10 bg-white/[0.03] text-sm text-white placeholder:text-white/26",
                            errors.nome && "border-destructive/60"
                          )}
                        />
                        {errors.nome ? <p className="mt-2 text-xs font-semibold text-red-300">{errors.nome}</p> : null}
                      </div>

                      <div>
                        <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.18em] text-white/45">
                          Negocio
                        </label>
                        <Input
                          value={form.empresa}
                          onChange={(event) => updateField("empresa", event.target.value)}
                          placeholder="Marca ou empresa"
                          className={cn(
                            "h-12 rounded-2xl border-white/10 bg-white/[0.03] text-sm text-white placeholder:text-white/26",
                            errors.empresa && "border-destructive/60"
                          )}
                        />
                        {errors.empresa ? <p className="mt-2 text-xs font-semibold text-red-300">{errors.empresa}</p> : null}
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.18em] text-white/45">
                          E-mail
                        </label>
                        <Input
                          value={form.email}
                          onChange={(event) => updateField("email", event.target.value)}
                          placeholder="voce@email.com"
                          className={cn(
                            "h-12 rounded-2xl border-white/10 bg-white/[0.03] text-sm text-white placeholder:text-white/26",
                            errors.email && "border-destructive/60"
                          )}
                        />
                        {errors.email ? <p className="mt-2 text-xs font-semibold text-red-300">{errors.email}</p> : null}
                      </div>

                      <div>
                        <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.18em] text-white/45">
                          WhatsApp
                        </label>
                        <Input
                          value={form.whatsapp}
                          onChange={(event) => updateField("whatsapp", formatWhatsApp(event.target.value))}
                          placeholder="(51) 99999-9999"
                          className={cn(
                            "h-12 rounded-2xl border-white/10 bg-white/[0.03] text-sm text-white placeholder:text-white/26",
                            errors.whatsapp && "border-destructive/60"
                          )}
                        />
                        {errors.whatsapp ? (
                          <p className="mt-2 text-xs font-semibold text-red-300">{errors.whatsapp}</p>
                        ) : null}
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.18em] text-white/45">
                        O que voce busca agora
                      </label>
                      <select
                        value={form.necessidade}
                        onChange={(event) => updateField("necessidade", event.target.value)}
                        className={cn(
                          "h-12 w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 text-sm text-white outline-none transition-all focus:border-primary/40",
                          errors.necessidade && "border-destructive/60"
                        )}
                      >
                        {serviceOptions.map((option) => (
                          <option key={option.id} value={option.id} className="bg-[hsl(var(--background))] text-white">
                            {option.label}
                          </option>
                        ))}
                      </select>
                      {errors.necessidade ? (
                        <p className="mt-2 text-xs font-semibold text-red-300">{errors.necessidade}</p>
                      ) : null}
                    </div>

                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full relative group"
                    >
                      <div className="absolute -inset-1 bg-gradient-to-r from-red-600 via-purple-600 to-pink-600 rounded-2xl blur opacity-30 group-hover:opacity-70 transition duration-500 animate-pulse"></div>
                      <Button
                        type="submit"
                        disabled={loading}
                        className="relative h-12 w-full rounded-2xl border border-white/10 text-sm font-black uppercase tracking-[0.16em] text-white shadow-[0_18px_42px_rgba(236,72,153,0.18)]"
                        style={{ background: "linear-gradient(135deg, rgba(220,38,38,0.92), rgba(107,33,168,0.9), rgba(236,72,153,0.88))" }}
                      >
                        {loading ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="mr-2 h-4 w-4" />
                        )}
                        Solicitar orcamento inicial
                      </Button>
                    </motion.div>
                  </form>

                  <div className="mt-5 rounded-[1.4rem] border border-white/10 bg-white/[0.03] px-4 py-4">
                    <div className="flex items-start gap-3">
                      <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-white/74" />
                      <p className="text-xs leading-relaxed text-white/58">
                        Sem compromisso: usamos essas informacoes apenas para montar um primeiro direcionamento comercial
                        e indicar a estrutura mais coerente para o seu momento.
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="flex min-h-[420px] flex-col items-center justify-center text-center"
                >
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 10, delay: 0.1 }}
                    className="flex h-20 w-20 items-center justify-center rounded-full border border-emerald-400/25 bg-emerald-400/12"
                  >
                    <CheckCircle2 className="h-10 w-10 text-emerald-300" />
                  </motion.div>
                  <motion.h2 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mt-6 text-3xl font-black tracking-tight text-white/92"
                  >
                    Diagnostico solicitado com sucesso.
                  </motion.h2>
                  <motion.p 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mt-3 max-w-sm text-sm leading-relaxed text-white/62"
                  >
                    Recebemos seu contato e vamos analisar a melhor estrutura para o seu negócio. Se quiser acelerar, também
                    podemos continuar pelo WhatsApp.
                  </motion.p>
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="mt-6 flex flex-col gap-3 sm:flex-row"
                  >
                    <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                      <Button
                        className="h-12 rounded-2xl border border-white/10 px-6 text-sm font-bold text-white"
                        style={{ background: "linear-gradient(135deg, rgba(220,38,38,0.92), rgba(107,33,168,0.9), rgba(236,72,153,0.88))" }}
                      >
                        <MessageCircle className="mr-2 h-4 w-4" />
                        Continuar no WhatsApp
                      </Button>
                    </a>
                    <Button
                      onClick={onOpenDemo}
                      className="site-soft-surface h-12 rounded-2xl px-6 text-sm font-bold text-white/84"
                    >
                      Ver demonstracao
                    </Button>
                  </motion.div>
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default memo(HeroSection);
