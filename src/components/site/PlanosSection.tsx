import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Globe, Layers, Rocket } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PUBLIC_PLAN_CATALOG } from "@/lib/public-plans";
import { cn } from "@/lib/utils";

const fade = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45 } },
};

const stagger = { show: { transition: { staggerChildren: 0.12 } } };

type Plan = (typeof PUBLIC_PLAN_CATALOG)[number] & {
  icon: typeof Globe;
};

const visualMap: Record<string, typeof Globe> = {
  express: Globe,
  pro: Layers,
  "sob-medida": Rocket,
};

const plans: Plan[] = PUBLIC_PLAN_CATALOG.map((plan) => ({
  ...plan,
  icon: visualMap[plan.id],
}));

const addOns = [
  { title: "Checkout automatico", copy: "Pix, boleto e cartao com menos cobranca manual." },
  { title: "Portal do cliente", copy: "Uma area propria para acompanhamento, contrato e arquivos." },
  { title: "WhatsApp com automacao", copy: "Fluxos para responder melhor e reduzir atrito no atendimento." },
  { title: "Extras e modulos", copy: "Seu projeto cresce por camadas sem precisar começar do zero." },
];

function PlanCard({ plan }: { plan: Plan }) {
  const monthlyDisplay =
    plan.monthlyDisplay || (plan.monthlyPrice > 0 ? `R$ ${plan.monthlyPrice.toLocaleString("pt-BR")}/mes` : "Opcional");

  return (
    <motion.div
      variants={fade}
      className={cn(
        "site-surface relative flex flex-col rounded-[1.9rem] p-6 transition-all duration-300",
        plan.popular && "border-white/14 shadow-[0_26px_70px_-44px_rgba(236,72,153,0.28)]"
      )}
      style={
        plan.popular
          ? { background: "linear-gradient(180deg, hsl(var(--primary)/0.08), hsl(var(--card)))" }
          : undefined
      }
    >
      {plan.popular ? (
        <span className="mb-5 inline-flex w-fit rounded-full border border-white/12 bg-white/[0.06] px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-white/88">
          Mais indicado
        </span>
      ) : (
        <span className="mb-5 inline-flex w-fit rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-white/50">
          {plan.eyebrow}
        </span>
      )}

      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
          <plan.icon className="h-5 w-5 text-white/84" />
        </div>
        <div>
          <h3 className="text-2xl font-black tracking-tight text-white/92">{plan.title}</h3>
          <p className="text-xs uppercase tracking-[0.18em] text-white/42 font-black">{plan.tag}</p>
        </div>
      </div>

      <p className="mt-5 text-sm leading-relaxed site-copy-muted">{plan.description}</p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/42">Setup</p>
          <p className="mt-2 text-xl font-black tracking-tight text-white/92">
            {plan.id === "sob-medida" ? "Sob analise" : `R$ ${plan.setupPrice.toLocaleString("pt-BR")}`}
          </p>
          <p className="mt-1 text-[11px] text-white/45">{plan.priceSub}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/42">Mensalidade</p>
          <p className="mt-2 text-xl font-black tracking-tight text-white/92">{monthlyDisplay}</p>
          <p className="mt-1 text-[11px] text-white/45">Conforme os modulos da estrutura.</p>
        </div>
      </div>

      {plan.idealFor ? (
        <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/42">Ideal para</p>
          <p className="mt-2 text-sm leading-relaxed text-white/72">{plan.idealFor}</p>
        </div>
      ) : null}

      <ul className="mt-5 space-y-3 flex-1">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2.5 text-sm leading-relaxed text-white/70">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-white/62" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <div className="mt-6">
        <a href={`https://wa.me/5551981964238?text=${encodeURIComponent(plan.whatsapp)}`} target="_blank" rel="noopener noreferrer">
          <Button
            className={cn(
              "h-12 w-full rounded-2xl border border-white/10 text-xs font-black uppercase tracking-[0.16em] text-white",
              plan.popular && "shadow-[0_16px_40px_rgba(236,72,153,0.2)]"
            )}
            style={{
              background: plan.popular
                ? "linear-gradient(135deg, rgba(220,38,38,0.92), rgba(107,33,168,0.9), rgba(236,72,153,0.88))"
                : "rgba(255,255,255,0.06)",
            }}
          >
            {plan.cta}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </a>
      </div>
    </motion.div>
  );
}

export default function PlanosSection() {
  return (
    <motion.section
      id="planos"
      className="site-band px-6 py-20 lg:py-24"
      initial="hidden"
      whileInView="show"
      viewport={{ once: true }}
      variants={stagger}
    >
      <div className="max-w-7xl mx-auto">
        <motion.div variants={fade} className="mx-auto max-w-3xl text-center">
          <span className="site-badge site-badge--primary">Planos e estrutura</span>
          <h2 className="mt-8 text-4xl sm:text-6xl font-black tracking-tighter text-white/90 leading-[0.92]">
            Comece com o formato certo
            <span className="site-gradient-text"> para o seu momento.</span>
          </h2>
          <p className="mt-6 text-lg leading-relaxed site-copy-muted">
            O ponto não é te colocar em um pacote engessado. É entender qual base faz sentido agora e o que pode ser
            expandido depois sem virar retrabalho.
          </p>
        </motion.div>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {plans.map((plan) => (
            <PlanCard key={plan.id} plan={plan} />
          ))}
        </div>

        <motion.div variants={fade} className="mt-10 public-page-section-card">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-white/40">O que pode entrar depois</p>
              <h3 className="mt-3 text-2xl font-black tracking-tight text-white/92">Seu projeto cresce por camadas.</h3>
            </div>
            <a href="#cadastro" className="text-xs font-black uppercase tracking-[0.16em] text-white/66 hover:text-white">
              Solicitar diagnostico
            </a>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {addOns.map((item) => (
              <div key={item.title} className="public-page-highlight-card">
                <p className="text-sm font-black tracking-tight text-white/92">{item.title}</p>
                <p className="mt-2 text-xs leading-relaxed text-white/56">{item.copy}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}
