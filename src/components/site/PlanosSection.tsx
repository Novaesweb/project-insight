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
      whileHover={{ y: -10, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={cn(
        "site-surface relative flex flex-col rounded-xl p-5 transition-all duration-300",
        plan.popular 
          ? "border-primary/40 shadow-[0_0_40px_rgba(236,72,153,0.15)] ring-1 ring-primary/20" 
          : "border-white/5 hover:border-white/15"
      )}
      style={
        plan.popular
          ? { background: "linear-gradient(180deg, hsl(var(--primary)/0.08), hsl(var(--card)))" }
          : undefined
      }
    >
      {plan.popular && (
        <div className="absolute -top-[1px] left-[10%] right-[10%] h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
      )}
      
      {plan.popular ? (
        <motion.span 
          animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
          transition={{ duration: 5, ease: "linear", repeat: Infinity }}
          className="mb-5 inline-flex w-fit rounded-full border border-primary/30 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-white shadow-[0_0_15px_rgba(236,72,153,0.3)]"
          style={{ background: "linear-gradient(90deg, rgba(236,72,153,0.2), rgba(107,33,168,0.2), rgba(220,38,38,0.2))", backgroundSize: "200% 200%" }}
        >
          Mais indicado
        </motion.span>
      ) : (
        <span className="mb-5 inline-flex w-fit rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-white/50">
          {plan.eyebrow}
        </span>
      )}

      <div className="flex items-center gap-2.5">
        <div className={cn(
          "flex h-10 w-10 items-center justify-center rounded-xl border transition-all duration-300 group-hover:scale-110 flex-shrink-0",
          plan.popular ? "border-primary/40 bg-primary/20 text-primary-foreground" : "border-white/10 bg-white/[0.04] text-white/84"
        )}>
          <plan.icon className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <h3 className="text-lg font-black tracking-tight text-white/92">{plan.title}</h3>
          <p className="text-[9px] uppercase tracking-[0.16em] text-white/42 font-black">{plan.tag}</p>
        </div>
      </div>

      <p className="mt-4 text-xs leading-relaxed site-copy-muted">{plan.description}</p>

      <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
        <div className="rounded-lg border border-white/10 bg-white/[0.03] px-3.5 py-3">
          <p className="text-[9px] font-black uppercase tracking-[0.16em] text-white/42">Setup</p>
          <p className="mt-1.5 text-lg font-black tracking-tight text-white/92">
            {plan.id === "sob-medida" ? "Analise" : `R$ ${plan.setupPrice.toLocaleString("pt-BR")}`}
          </p>
          <p className="mt-0.5 text-[10px] text-white/45">{plan.priceSub}</p>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/[0.03] px-3.5 py-3">
          <p className="text-[9px] font-black uppercase tracking-[0.16em] text-white/42">Mensalidade</p>
          <p className="mt-1.5 text-lg font-black tracking-tight text-white/92">{monthlyDisplay}</p>
          <p className="mt-0.5 text-[10px] text-white/45">Conforme modulos.</p>
        </div>
      </div>

      {plan.idealFor ? (
        <div className="mt-4 rounded-lg border border-white/10 bg-white/[0.03] px-3.5 py-3">
          <p className="text-[9px] font-black uppercase tracking-[0.16em] text-white/42">Ideal para</p>
          <p className="mt-1.5 text-xs leading-relaxed text-white/72">{plan.idealFor}</p>
        </div>
      ) : null}

      <ul className="mt-4 space-y-2.5 flex-1">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2 text-xs leading-relaxed text-white/70">
            <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-white/62" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <div className="mt-5">
        <a href={`https://wa.me/5551981964238?text=${encodeURIComponent(plan.whatsapp)}`} target="_blank" rel="noopener noreferrer">
          <Button
            className={cn(
              "h-11 w-full rounded-lg border border-white/10 text-xs font-black uppercase tracking-[0.14em] text-white flex items-center justify-center gap-2",
              plan.popular && "shadow-[0_16px_40px_rgba(236,72,153,0.2)]"
            )}
            style={{
              background: plan.popular
                ? "linear-gradient(135deg, rgba(220,38,38,0.92), rgba(107,33,168,0.9), rgba(236,72,153,0.88))"
                : "rgba(255,255,255,0.06)",
            }}
          >
            {plan.cta}
            <ArrowRight className="h-3.5 w-3.5" />
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
      className="site-band px-4 sm:px-6 py-16 lg:py-20"
      initial="hidden"
      whileInView="show"
      viewport={{ once: true }}
      variants={stagger}
    >
      <div className="max-w-7xl mx-auto">
        <motion.div variants={fade} className="mx-auto max-w-3xl text-center">
          <span className="site-badge site-badge--primary">Planos e estrutura</span>
          <h2 className="mt-6 text-[clamp(1.75rem,6.5vw,3.5rem)] font-black tracking-tighter text-white/90 leading-[0.92]">
            Comece com o formato certo
            <span className="site-gradient-text"> para seu momento.</span>
          </h2>
          <p className="mt-4 text-sm leading-relaxed site-copy-muted max-w-2xl mx-auto">
            Entender qual base faz sentido agora e o que pode ser expandido depois sem retrabalho.
          </p>
        </motion.div>

        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {plans.map((plan) => (
            <PlanCard key={plan.id} plan={plan} />
          ))}
        </div>

        <motion.div variants={fade} className="mt-8 rounded-xl border border-white/[0.1] bg-white/[0.03] p-5 sm:p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.22em] text-white/40">O que pode entrar</p>
              <h3 className="mt-2 text-lg font-black tracking-tight text-white/92">Projeto cresce por camadas.</h3>
            </div>
            <a href="#cadastro" className="text-[10px] font-black uppercase tracking-[0.14em] text-white/66 hover:text-white">
              Solicitar diagnostico
            </a>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {addOns.map((item) => (
              <div key={item.title} className="rounded border border-white/[0.08] bg-white/[0.02] p-3.5">
                <p className="text-xs font-black tracking-tight text-white/92">{item.title}</p>
                <p className="mt-1.5 text-[10px] leading-relaxed text-white/56">{item.copy}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}
