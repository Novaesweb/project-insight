import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle,
  CreditCard,
  Flame,
  Globe,
  Layers,
  MessageCircle,
  Rocket,
  Sparkles,
  Star,
  Zap,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const fade = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const stagger = { show: { transition: { staggerChildren: 0.15 } } };

const founderSlots = {
  filled: 36,
  total: 50,
  remaining: 14,
  progress: 72,
};

type Plan = {
  tag: string;
  eyebrow: string;
  icon: typeof Globe;
  accentHsl: string;
  title: string;
  desc: string;
  oldPrice?: string;
  pricePrefix?: string;
  price: string;
  priceLabel: string;
  priceSub: string;
  automation?: string;
  features: string[];
  cta: string;
  whatsapp: string;
  popular?: boolean;
};

const plans: Plan[] = [
  {
    tag: "Express",
    eyebrow: "🚀 Lote fundador limitado",
    icon: Globe,
    accentHsl: "var(--warning)",
    title: "Express",
    desc: "A base sólida para colocar sua presença digital no ar com velocidade e aparência profissional.",
    oldPrice: "R$ 597",
    price: "R$ 180",
    priceLabel: "Pagamento único",
    priceSub: "Setup inicial para começar rápido",
    automation: "+ R$ 60/mês com automação de WhatsApp opcional",
    features: [
      "Design moderno e totalmente responsivo",
      "Vitrine estratégica de serviços",
      "Página de captura e contato",
      "Integração com mapas",
      "Botão flutuante de WhatsApp",
    ],
    cta: "Iniciar Projeto Express",
    whatsapp: "Olá! Quero iniciar meu Projeto Express com a NovaesWeb.",
  },
  {
    tag: "Pro",
    eyebrow: "🔥 Condição de fundador",
    icon: Layers,
    accentHsl: "var(--primary)",
    title: "Pro",
    desc: "Ecossistema desenhado para automatizar processos, organizar clientes e escalar resultados com estrutura própria.",
    oldPrice: "R$ 1.200",
    pricePrefix: "A partir de",
    price: "R$ 349",
    priceLabel: "Setup inicial",
    priceSub: "Calculado de acordo com os módulos do projeto",
    features: [
      "Tudo do plano Express +",
      "Painel administrativo exclusivo",
      "Sistema de cadastro de clientes (CRM)",
      "Módulo de recebimento de pedidos",
      "Notificações em tempo real",
    ],
    cta: "Simular Ecossistema Pro",
    whatsapp: "Olá! Quero simular meu Ecossistema Pro com a NovaesWeb.",
    popular: true,
  },
  {
    tag: "Sob Medida",
    eyebrow: "💎 Projetos complexos",
    icon: Rocket,
    accentHsl: "var(--accent)",
    title: "Sob Medida",
    desc: "Para operações que precisam de sistemas internos, dashboards, marketing de atração e estrutura técnica personalizada.",
    price: "Sob análise",
    priceLabel: "Orçamento técnico",
    priceSub: "Definido após análise do escopo",
    features: [
      "Sistemas de gestão internos",
      "Dashboards analíticos",
      "Marketing de atração para Instagram",
      "Design de alta fidelidade",
      "Consultoria técnica para expansão",
    ],
    cta: "Falar com Consultor",
    whatsapp: "Olá! Quero falar sobre um projeto sob medida com a NovaesWeb.",
  },
];

function FounderAlert() {
  return (
    <motion.div variants={fade} className="max-w-5xl mx-auto mb-10">
      <div className="plans-founder-banner rounded-[1.75rem] px-5 py-4 md:px-8 md:py-5 text-white shadow-[0_18px_50px_rgba(232,51,74,0.2)]">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <div className="relative mt-1 flex h-3.5 w-3.5 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/80 opacity-70" />
              <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-white" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.28em] font-black text-white/80">
                Alerta Projeto Fundador
              </p>
              <p className="text-sm md:text-base font-semibold mt-1 leading-relaxed">
                Já preenchemos <span className="text-[hsl(var(--gold))] font-black">{founderSlots.filled} das {founderSlots.total}</span> vagas com condição especial de custo.
              </p>
            </div>
          </div>

          <a href="#cadastro" className="shrink-0">
            <Button
              className="h-11 rounded-full px-6 text-xs font-black uppercase tracking-[0.18em] border-0 text-[hsl(var(--background))] bg-white hover:bg-[hsl(var(--gold))] hover:text-[hsl(var(--background))]"
            >
              Garantir minha vaga
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </a>
        </div>
      </div>
    </motion.div>
  );
}

function SlotsHighlight() {
  return (
    <motion.div variants={fade} className="max-w-2xl mx-auto mb-14">
      <div
        className="site-surface rounded-[1.75rem] p-5 md:p-6"
        style={{
          border: "1px solid hsl(var(--primary) / 0.22)",
          boxShadow: "0 20px 60px rgba(220, 38, 38, 0.08)",
        }}
      >
        <div className="flex items-end justify-between gap-4 mb-3">
          <div>
            <p className="text-[10px] uppercase tracking-[0.24em] font-black text-primary mb-1">
              Status das vagas
            </p>
            <h3 className="text-base md:text-lg font-black text-foreground flex items-center gap-2">
              <Flame className="w-4 h-4 text-primary" />
              Projeto Fundador
            </h3>
          </div>
          <div className="text-right">
            <span className="text-3xl font-black text-primary">{founderSlots.filled}</span>
            <span className="text-muted-foreground/70 text-lg">/{founderSlots.total}</span>
          </div>
        </div>

        <div className="h-3 rounded-full overflow-hidden bg-white/5 border border-white/5">
          <div
            className="h-full rounded-full relative"
            style={{
              width: `${founderSlots.progress}%`,
              background: "linear-gradient(90deg, rgba(107,33,168,0.95), rgba(236,72,153,0.96), rgba(255,184,0,0.95))",
            }}
          >
            <div className="absolute inset-y-0 right-0 w-5 bg-white/45 blur-[4px]" />
          </div>
        </div>

        <p className="text-center text-[11px] md:text-xs uppercase tracking-[0.22em] font-black text-muted-foreground/70 mt-4">
          Restam apenas <span className="text-[hsl(var(--gold))]">{founderSlots.remaining} vagas</span> com desconto de custo
        </p>
      </div>
    </motion.div>
  );
}

function PlanCard({ plan }: { plan: Plan }) {
  return (
    <motion.div
      variants={fade}
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
      className={cn(
        "site-surface relative rounded-[1.9rem] p-6 lg:p-8 flex flex-col transition-all duration-500 group overflow-hidden",
        plan.popular && "md:-translate-y-4"
      )}
      style={{
        background: plan.popular
          ? "linear-gradient(180deg, hsl(var(--primary) / 0.08), hsl(var(--card)))"
          : "linear-gradient(180deg, hsl(var(--card)), hsl(240 10% 8% / 0.86))",
        border: `1px solid ${plan.popular ? "hsl(var(--primary) / 0.32)" : "hsl(var(--border))"}`,
        boxShadow: plan.popular ? "0 20px 60px rgba(220, 38, 38, 0.1)" : undefined,
      }}
    >
      {plan.popular ? (
        <>
          <div className="absolute inset-x-0 top-0 h-[2px]" style={{ background: "var(--gradient-primary)" }} />
          <div className="absolute top-0 right-0 bg-primary text-white text-[10px] font-black px-3 py-1.5 rounded-bl-2xl">
            Mais popular
          </div>
        </>
      ) : null}

      <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div
          className="absolute top-0 right-0 w-44 h-44 rounded-full blur-[90px] opacity-20"
          style={{ background: `hsl(${plan.accentHsl})` }}
        />
      </div>

      <div className="relative flex items-start gap-3 mb-5">
        <div
          className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
          style={{ background: `hsl(${plan.accentHsl} / 0.12)` }}
        >
          <plan.icon className="w-5 h-5" style={{ color: `hsl(${plan.accentHsl})` }} />
        </div>
        <div>
          <span
            className="inline-flex text-[10px] uppercase tracking-[0.18em] font-black px-3 py-1 rounded-full"
            style={{
              background: `hsl(${plan.accentHsl} / 0.08)`,
              border: `1px solid hsl(${plan.accentHsl} / 0.2)`,
              color: `hsl(${plan.accentHsl})`,
            }}
          >
            {plan.eyebrow}
          </span>
          <h3 className="text-2xl font-black text-foreground mt-3">{plan.title}</h3>
        </div>
      </div>

      <p className="text-sm text-muted-foreground leading-relaxed mb-6 min-h-[70px]">{plan.desc}</p>

      <div className="mb-6 pb-6 border-b border-white/10 space-y-2">
        <div className="min-h-[18px]">
          {plan.oldPrice ? (
            <p className="text-sm text-muted-foreground/55 line-through">De: {plan.oldPrice}</p>
          ) : (
            <p className="text-sm text-transparent select-none">Espaço</p>
          )}
        </div>

        <div className="flex items-end gap-2 flex-wrap">
          {plan.pricePrefix ? (
            <span className="text-xs uppercase tracking-[0.14em] font-black text-muted-foreground/65 mb-1">
              {plan.pricePrefix}
            </span>
          ) : null}
          <span className="text-4xl md:text-5xl font-black text-white leading-none">{plan.price}</span>
        </div>

        <p className="text-[11px] font-black uppercase tracking-[0.18em]" style={{ color: `hsl(${plan.accentHsl})` }}>
          {plan.priceLabel}
        </p>
        <p className="text-xs text-muted-foreground/65">{plan.priceSub}</p>

        {plan.automation ? (
          <div
            className="rounded-2xl px-4 py-3 flex items-start gap-3 mt-4"
            style={{
              background: "hsl(142 71% 45% / 0.06)",
              border: "1px solid hsl(142 71% 45% / 0.16)",
            }}
          >
            <Sparkles className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
            <p className="text-xs font-semibold text-emerald-300 leading-relaxed">{plan.automation}</p>
          </div>
        ) : null}
      </div>

      <ul className="space-y-3 mb-8 flex-1">
        {plan.features.map((item) => (
          <li key={item} className="flex items-start gap-2.5 text-sm text-muted-foreground/90">
            <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: `hsl(${plan.accentHsl} / 0.7)` }} />
            <span>{item}</span>
          </li>
        ))}
      </ul>

      <a
        href={`https://wa.me/5551981964238?text=${encodeURIComponent(plan.whatsapp)}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        <Button
          className={cn(
            "w-full h-12 rounded-2xl font-black text-sm text-white border-0 transition-all hover:scale-[1.02]",
            plan.popular ? "shadow-[0_16px_40px_rgba(220,38,38,0.22)]" : ""
          )}
          style={{
            background: plan.popular
              ? "linear-gradient(135deg, rgba(220,38,38,0.92), rgba(107,33,168,0.9), rgba(236,72,153,0.88))"
              : `hsl(${plan.accentHsl})`,
          }}
        >
          {plan.cta}
          {plan.popular ? <MessageCircle className="w-4 h-4 ml-2" /> : <ArrowRight className="w-4 h-4 ml-2" />}
        </Button>
      </a>
    </motion.div>
  );
}

function CheckoutHighlight() {
  return (
    <motion.div variants={fade} className="mt-16 max-w-4xl mx-auto relative">
      <div
        className="relative rounded-[2rem] p-8 md:p-10 overflow-hidden"
        style={{
          background: "linear-gradient(135deg, hsl(var(--primary) / 0.04), hsl(var(--accent) / 0.06), hsl(var(--card)))",
          border: "1px solid hsl(var(--primary) / 0.15)",
          boxShadow: "0 24px 64px rgba(220, 38, 38, 0.06)",
        }}
      >
        <div className="absolute -top-px left-0 right-0 h-[2px]" style={{ background: "linear-gradient(90deg, hsl(var(--primary)), hsl(var(--accent)), hsl(var(--primary)))" }} />
        <div className="absolute top-0 right-0 w-60 h-60 rounded-full blur-[120px] opacity-[0.08] pointer-events-none" style={{ background: "hsl(var(--primary))" }} />
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full blur-[100px] opacity-[0.06] pointer-events-none" style={{ background: "hsl(var(--accent))" }} />

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-6">
            <span
              className="text-[10px] uppercase tracking-wider font-bold text-white px-4 py-1.5 rounded-full shadow-lg flex items-center gap-1.5"
              style={{ background: "linear-gradient(135deg, rgba(220,38,38,0.92), rgba(107,33,168,0.9), rgba(236,72,153,0.88))" }}
            >
              <Zap className="w-3.5 h-3.5" /> Superpoder Extra
            </span>
          </div>

          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: "hsl(var(--primary) / 0.1)" }}>
                  <CreditCard className="w-6 h-6" style={{ color: "hsl(var(--primary))" }} />
                </div>
                <h3 className="text-2xl md:text-3xl font-black text-foreground tracking-tight">
                  Checkout Automático
                </h3>
              </div>

              <p className="text-muted-foreground leading-relaxed text-sm md:text-base mb-6 max-w-xl font-medium">
                Pare de cobrar manualmente e transforme sua operação em uma <span className="text-foreground font-semibold">máquina de vendas mais automática</span>. A integração com o <span className="text-foreground font-semibold">Asaas</span> permite receber via Pix, boleto e cartão com emissão e baixa automáticas.
              </p>

              <ul className="space-y-2 mb-6">
                {[
                  "Receba via Pix, boleto e cartão de crédito",
                  "Emissão e baixa automáticas de cobranças",
                  "Disponível para qualquer plano da NovaesWeb",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground/90">
                    <CheckCircle className="w-4 h-4 shrink-0" style={{ color: "hsl(var(--primary) / 0.6)" }} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="w-full md:w-72 shrink-0 space-y-3">
              <div className="p-4 rounded-xl text-center" style={{ background: "hsl(var(--secondary) / 0.6)", border: "1px solid hsl(var(--border))" }}>
                <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold">Ativação</p>
                <p className="text-2xl font-black" style={{ color: "hsl(var(--primary))" }}>R$80</p>
                <p className="text-[10px] text-muted-foreground/60">Taxa única de setup</p>
              </div>

              <div className="p-4 rounded-xl text-center" style={{ background: "hsl(var(--secondary) / 0.6)", border: "1px solid hsl(var(--border))" }}>
                <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold">Manutenção</p>
                <p className="text-2xl font-black" style={{ color: "hsl(var(--primary))" }}>
                  R$40<span className="text-xs font-medium text-muted-foreground/60">/mês</span>
                </p>
              </div>

              <a
                href="https://wa.me/5551981964238?text=Olá!%20Quero%20adicionar%20o%20Checkout%20Automático%20ao%20meu%20projeto!"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  className="w-full h-12 rounded-xl font-bold text-sm text-white border-0 mt-2 hover:scale-[1.02] transition-all"
                  style={{
                    background: "linear-gradient(135deg, rgba(220,38,38,0.92), rgba(107,33,168,0.9), rgba(236,72,153,0.88))",
                    boxShadow: "0 10px 30px rgba(220, 38, 38, 0.18)",
                  }}
                >
                  Quero Checkout Automático
                  <Zap className="w-4 h-4 ml-2" />
                </Button>
              </a>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function PlanosSection() {
  return (
    <motion.section
      id="planos"
      className="site-band py-28 px-6 relative overflow-hidden"
      initial="hidden"
      whileInView="show"
      viewport={{ once: true }}
      variants={stagger}
    >
      <div className="max-w-7xl mx-auto relative z-10">
        <FounderAlert />

        <motion.div variants={fade} className="text-center max-w-3xl mx-auto mb-10">
          <span className="site-badge site-badge--primary inline-flex mb-8">
            Projeto Fundador
          </span>
          <h2 className="text-4xl sm:text-6xl font-black text-foreground/90 leading-[0.9] tracking-tighter">
            Escolha o seu <br />
            <span className="site-gradient-text">Ecossistema</span>
          </h2>
          <p className="text-lg site-copy-muted mt-8 leading-relaxed max-w-2xl mx-auto font-medium">
            Soluções de elite para transformar sua presença digital em uma estrutura que atrai clientes, organiza a operação e acelera o crescimento.
          </p>
        </motion.div>

        <SlotsHighlight />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-start">
          {plans.map((plan) => (
            <PlanCard key={plan.tag} plan={plan} />
          ))}
        </div>

        <CheckoutHighlight />

        <motion.div variants={fade} className="mt-10 text-center">
          <p className="text-xs text-muted-foreground/60 max-w-2xl mx-auto leading-relaxed font-medium">
            <span className="text-muted-foreground font-bold">Nota:</span> cada projeto pode receber novos módulos e funcionalidades conforme o crescimento da empresa. Domínio e serviços externos podem ter custos separados pagos diretamente pelo cliente.
          </p>
        </motion.div>
      </div>
    </motion.section>
  );
}
