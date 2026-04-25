import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle,
  CreditCard,
  Globe,
  Layers,
  MessageCircle,
  Rocket,
  Sparkles,
  Zap,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { PUBLIC_PLAN_CATALOG } from "@/lib/public-plans";
import { cn } from "@/lib/utils";

const fade = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const stagger = { show: { transition: { staggerChildren: 0.15 } } };

type Plan = (typeof PUBLIC_PLAN_CATALOG)[number] & {
  icon: typeof Globe;
  accentHsl: string;
};

const planVisualMap: Record<string, { icon: typeof Globe; accentHsl: string }> = {
  express: { icon: Globe, accentHsl: "var(--warning)" },
  pro: { icon: Layers, accentHsl: "var(--primary)" },
  "sob-medida": { icon: Rocket, accentHsl: "var(--accent)" },
};

const plans: Plan[] = PUBLIC_PLAN_CATALOG.map((plan) => ({
  ...plan,
  ...planVisualMap[plan.id],
}));

function CommercialGuideBanner() {
  return (
    <motion.div variants={fade} className="max-w-5xl mx-auto mb-10">
      <div className="plans-founder-banner rounded-[1.75rem] px-5 py-4 md:px-8 md:py-5 text-white shadow-[0_18px_50px_rgba(232,51,74,0.18)]">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <div className="relative mt-1 flex h-3.5 w-3.5 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/80 opacity-70" />
              <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-white" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.28em] font-black text-white/80">Escolha com clareza</p>
              <p className="text-sm md:text-base font-semibold mt-1 leading-relaxed">
                Se voce ainda nao sabe qual estrutura faz mais sentido, a NovaesWeb faz o diagnostico inicial e indica o
                melhor caminho para o seu momento.
              </p>
            </div>
          </div>

          <a href="#cadastro" className="shrink-0">
            <Button
              className="h-11 rounded-full px-6 text-xs font-black uppercase tracking-[0.18em] border-0 text-[hsl(var(--background))] bg-white hover:bg-[hsl(var(--gold))] hover:text-[hsl(var(--background))]"
            >
              Solicitar diagnostico
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </a>
        </div>
      </div>
    </motion.div>
  );
}

function PlanCard({ plan }: { plan: Plan }) {
  const monthlyDisplay =
    plan.monthlyDisplay || (plan.monthlyPrice > 0 ? `R$ ${plan.monthlyPrice.toLocaleString("pt-BR")}/mes` : "Nao inclusa");

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
            Mais indicado
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

      <p className="text-sm text-muted-foreground leading-relaxed mb-4 min-h-[70px]">{plan.description}</p>

      {plan.idealFor ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 mb-5">
          <p className="text-[10px] uppercase tracking-[0.16em] font-black text-white/45 mb-2">Ideal para</p>
          <p className="text-sm text-white/76 leading-relaxed">{plan.idealFor}</p>
        </div>
      ) : null}

      <div className="mb-6 pb-6 border-b border-white/10 space-y-4">
        <div className="min-h-[18px]">
          {plan.oldPrice ? (
            <p className="text-sm text-muted-foreground/55 line-through">De: R$ {plan.oldPrice.toLocaleString("pt-BR")}</p>
          ) : (
            <p className="text-sm text-transparent select-none">Espaco</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4">
            <p className="text-[10px] uppercase tracking-[0.18em] font-black text-white/45 mb-1">Ativacao</p>
            <p className="text-xl font-black text-white">
              {plan.id === "sob-medida" ? "Sob analise" : `R$ ${plan.setupPrice.toLocaleString("pt-BR")}`}
            </p>
            <p className="text-[11px] text-muted-foreground/65 mt-1">{plan.priceSub}</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4">
            <p className="text-[10px] uppercase tracking-[0.18em] font-black text-white/45 mb-1">Mensalidade</p>
            <p className="text-xl font-black text-white">{monthlyDisplay}</p>
            <p className="text-[11px] text-muted-foreground/65 mt-1">Conforme a estrutura escolhida.</p>
          </div>
        </div>

        {plan.monthlyNote ? (
          <div
            className="rounded-2xl px-4 py-3 flex items-start gap-3"
            style={{
              background: "hsl(142 71% 45% / 0.06)",
              border: "1px solid hsl(142 71% 45% / 0.16)",
            }}
          >
            <Sparkles className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
            <p className="text-xs font-semibold text-emerald-300 leading-relaxed">{plan.monthlyNote}</p>
          </div>
        ) : null}
      </div>

      <ul className="space-y-3 mb-6 flex-1">
        {plan.features.map((item) => (
          <li key={item} className="flex items-start gap-2.5 text-sm text-muted-foreground/90">
            <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: `hsl(${plan.accentHsl} / 0.7)` }} />
            <span>{item}</span>
          </li>
        ))}
      </ul>

      {plan.outcome ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 mb-6">
          <p className="text-[10px] uppercase tracking-[0.18em] font-black text-white/45 mb-2">O que melhora</p>
          <p className="text-sm text-white/76 leading-relaxed">{plan.outcome}</p>
        </div>
      ) : null}

      <a href={`https://wa.me/5551981964238?text=${encodeURIComponent(plan.whatsapp)}`} target="_blank" rel="noopener noreferrer">
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
        <div
          className="absolute -top-px left-0 right-0 h-[2px]"
          style={{ background: "linear-gradient(90deg, hsl(var(--primary)), hsl(var(--accent)), hsl(var(--primary)))" }}
        />
        <div className="absolute top-0 right-0 w-60 h-60 rounded-full blur-[120px] opacity-[0.08] pointer-events-none" style={{ background: "hsl(var(--primary))" }} />
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full blur-[100px] opacity-[0.06] pointer-events-none" style={{ background: "hsl(var(--accent))" }} />

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-6">
            <span
              className="text-[10px] uppercase tracking-wider font-bold text-white px-4 py-1.5 rounded-full shadow-lg flex items-center gap-1.5"
              style={{ background: "linear-gradient(135deg, rgba(220,38,38,0.92), rgba(107,33,168,0.9), rgba(236,72,153,0.88))" }}
            >
              <Zap className="w-3.5 h-3.5" /> Receita recorrente
            </span>
          </div>

          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: "hsl(var(--primary) / 0.1)" }}>
                  <CreditCard className="w-6 h-6" style={{ color: "hsl(var(--primary))" }} />
                </div>
                <h3 className="text-2xl md:text-3xl font-black text-foreground tracking-tight">Checkout Automatico</h3>
              </div>

              <p className="text-muted-foreground leading-relaxed text-sm md:text-base mb-6 max-w-xl font-medium">
                Se o seu negocio precisa cobrar com mais organizacao, voce pode adicionar a camada de pagamento e automacao
                para receber via Pix, boleto e cartao sem depender de cobranca manual.
              </p>

              <ul className="space-y-2 mb-6">
                {[
                  "Receba via Pix, boleto e cartao de credito",
                  "Emissao e baixa automaticas de cobrancas",
                  "Disponivel como modulo complementar da estrutura",
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
                <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold">Ativacao</p>
                <p className="text-2xl font-black" style={{ color: "hsl(var(--primary))" }}>
                  R$80
                </p>
                <p className="text-[10px] text-muted-foreground/60">Taxa unica de setup</p>
              </div>

              <div className="p-4 rounded-xl text-center" style={{ background: "hsl(var(--secondary) / 0.6)", border: "1px solid hsl(var(--border))" }}>
                <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold">Manutencao</p>
                <p className="text-2xl font-black" style={{ color: "hsl(var(--primary))" }}>
                  R$40<span className="text-xs font-medium text-muted-foreground/60">/mes</span>
                </p>
              </div>

              <a
                href="https://wa.me/5551981964238?text=Ola! Quero adicionar o Checkout Automatico ao meu projeto."
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
                  Quero esse modulo
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
        <CommercialGuideBanner />

        <motion.div variants={fade} className="text-center max-w-3xl mx-auto mb-10">
          <span className="site-badge site-badge--primary inline-flex mb-8">Estruturas comerciais</span>
          <h2 className="text-4xl sm:text-6xl font-black text-foreground/90 leading-[0.9] tracking-tighter">
            Escolha a estrutura certa <br />
            <span className="site-gradient-text">para o seu momento</span>
          </h2>
          <p className="text-lg site-copy-muted mt-8 leading-relaxed max-w-2xl mx-auto font-medium">
            Da vitrine profissional ao ecossistema com painel e automacao, cada plano foi organizado para ficar mais
            claro, mais comercial e mais facil de evoluir.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-start">
          {plans.map((plan) => (
            <PlanCard key={plan.tag} plan={plan} />
          ))}
        </div>

        <CheckoutHighlight />

        <motion.div variants={fade} className="mt-10 text-center">
          <p className="text-xs text-muted-foreground/60 max-w-3xl mx-auto leading-relaxed font-medium">
            O projeto pode crescer por camadas: site, painel, contratos, portal do cliente, pedidos, extras, checkout,
            automacao e campanhas. A estrutura entra no ritmo do seu negocio sem te prender a uma solucao engessada.
          </p>
        </motion.div>
      </div>
    </motion.section>
  );
}
