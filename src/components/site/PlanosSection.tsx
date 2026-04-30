'use client';

import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, CheckCircle2, Globe, Layers, Rocket, BarChart3, MessageCircle, Zap, Boxes } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { PUBLIC_PLAN_CATALOG } from "@/lib/public-plans";
import { cn } from "@/lib/utils";

const fade = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45 } },
};

const stagger = { show: { transition: { staggerChildren: 0.12 } } };

const glowPulse = {
  animate: {
    boxShadow: [
      "0 0 20px rgba(236,72,153,0.3)",
      "0 0 40px rgba(236,72,153,0.5)",
      "0 0 20px rgba(236,72,153,0.3)"
    ],
  },
  transition: { duration: 3, repeat: Infinity }
};

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
  { 
    title: "Checkout automatico", 
    copy: "Pix, boleto e cartao com menos cobranca manual.",
    icon: BarChart3
  },
  { 
    title: "Portal do cliente", 
    copy: "Uma area propria para acompanhamento, contrato e arquivos.",
    icon: Boxes
  },
  { 
    title: "WhatsApp com automacao", 
    copy: "Fluxos para responder melhor e reduzir atrito no atendimento.",
    icon: MessageCircle
  },
  { 
    title: "Extras e modulos", 
    copy: "Seu projeto cresce por camadas sem precisar começar do zero.",
    icon: Zap
  },
];

function PlanCard({ plan, featured }: { plan: Plan; featured?: boolean }) {
  const monthlyDisplay =
    plan.monthlyDisplay || (plan.monthlyPrice > 0 ? `R$ ${plan.monthlyPrice.toLocaleString("pt-BR")}/mes` : "Opcional");

  return (
    <motion.div
      variants={fade}
      whileHover={{ y: featured ? -8 : -4, scale: featured ? 1.01 : 1.01 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={cn(
        "site-surface relative flex flex-col rounded-xl sm:rounded-2xl p-4 sm:p-5 transition-all duration-300 overflow-hidden group",
        featured 
          ? "border-primary/60 ring-2 ring-primary/30 md:col-span-2 md:row-span-1" 
          : "border-white/5 hover:border-white/15"
      )}
      style={
        featured
          ? { background: "linear-gradient(135deg, hsl(var(--primary)/0.12), hsl(var(--card)))" }
          : { background: "linear-gradient(135deg, hsl(var(--card)/0.8), hsl(var(--card)))" }
      }
      {...(featured && glowPulse)}
    >
      {featured && (
        <>
          <div className="absolute -top-[50%] -right-[20%] w-64 sm:w-96 h-64 sm:h-96 rounded-full bg-gradient-to-b from-primary/10 to-transparent blur-3xl opacity-20 sm:opacity-40 group-hover:opacity-50 transition-opacity duration-500" />
          <div className="absolute -bottom-[30%] -left-[20%] w-56 sm:w-80 h-56 sm:h-80 rounded-full bg-gradient-to-t from-primary/8 to-transparent blur-3xl opacity-15 sm:opacity-30 group-hover:opacity-40 transition-opacity duration-500" />
        </>
      )}
      
      <div className="relative z-10">
        {featured ? (
          <motion.span 
            animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
            transition={{ duration: 5, ease: "linear", repeat: Infinity }}
            className="mb-3 sm:mb-4 inline-flex w-fit rounded-full border border-primary/50 px-3 sm:px-4 py-1 sm:py-2 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-white"
            style={{ 
              background: "linear-gradient(90deg, rgba(236,72,153,0.25), rgba(107,33,168,0.25), rgba(236,72,153,0.25))",
              backgroundSize: "200% 200%",
              boxShadow: "0 0 20px rgba(236,72,153,0.3)"
            }}
          >
            ✨ Mais indicado
          </motion.span>
        ) : (
          <span className="mb-3 sm:mb-4 inline-flex w-fit rounded-full border border-white/10 bg-white/[0.03] px-2.5 sm:px-3 py-0.5 sm:py-1 text-[8px] sm:text-[10px] font-black uppercase tracking-[0.18em] text-white/50">
            {plan.eyebrow}
          </span>
        )}

        <div className="flex items-start sm:items-center gap-2 sm:gap-3">
          <motion.div 
            className={cn(
              "flex h-10 sm:h-12 w-10 sm:w-12 items-center justify-center rounded-lg sm:rounded-xl border transition-all duration-300 shrink-0",
              featured ? "border-primary/50 bg-gradient-to-br from-primary/30 to-primary/10 text-primary-foreground" : "border-white/10 bg-white/[0.04] text-white/84"
            )}
            whileHover={{ scale: 1.1, rotate: 5 }}
          >
            <plan.icon className="h-5 sm:h-6 w-5 sm:w-6" />
          </motion.div>
          <div className="min-w-0">
            <h3 className={cn(
              "font-black tracking-tight text-white/92 line-clamp-2",
              featured ? "text-lg sm:text-xl" : "text-base sm:text-lg"
            )}>
              {plan.title}
            </h3>
            <p className="text-[9px] sm:text-xs uppercase tracking-[0.15em] text-white/42 font-black">{plan.tag}</p>
          </div>
        </div>

        <p className={cn(
          "leading-relaxed site-copy-muted mt-3 sm:mt-4 line-clamp-2",
          featured ? "text-xs sm:text-sm" : "text-xs"
        )}>
          {plan.description}
        </p>

        <div className={cn(
          "gap-2 sm:gap-3 mt-3 sm:mt-4",
          featured ? "grid grid-cols-2 gap-2 sm:gap-3" : "grid grid-cols-2 gap-2 sm:gap-3"
        )}>
          <motion.div 
            className="rounded-lg sm:rounded-xl border border-white/10 bg-white/[0.03] px-2.5 sm:px-3 py-2.5 sm:py-3 hover:border-white/20 transition-colors"
            whileHover={{ y: -2 }}
          >
            <p className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.15em] text-white/42">Setup</p>
            <p className={cn(
              "mt-1 font-black tracking-tight text-white/92",
              featured ? "text-sm sm:text-base" : "text-xs sm:text-sm"
            )}>
              {plan.id === "sob-medida" ? "Sob analise" : `R$ ${plan.setupPrice.toLocaleString("pt-BR")}`}
            </p>
            <p className="mt-0.5 text-[8px] text-white/45">{plan.priceSub}</p>
          </motion.div>
          <motion.div 
            className="rounded-lg sm:rounded-xl border border-white/10 bg-white/[0.03] px-2.5 sm:px-3 py-2.5 sm:py-3 hover:border-white/20 transition-colors"
            whileHover={{ y: -2 }}
          >
            <p className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.15em] text-white/42">Mensalidade</p>
            <p className={cn(
              "mt-1 font-black tracking-tight text-white/92",
              featured ? "text-sm sm:text-base" : "text-xs sm:text-sm"
            )}>
              {monthlyDisplay}
            </p>
            <p className="mt-0.5 text-[8px] text-white/45">Conforme módulos.</p>
          </motion.div>
        </div>

        {plan.idealFor ? (
          <motion.div 
            className="mt-3 sm:mt-4 rounded-lg sm:rounded-xl border border-white/10 bg-white/[0.03] px-2.5 sm:px-3 py-2.5 sm:py-3 hover:border-primary/30 transition-colors"
            whileHover={{ y: -2 }}
          >
            <p className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.15em] text-white/42">Ideal para</p>
            <p className={cn(
              "mt-1 leading-relaxed text-white/72",
              featured ? "text-xs sm:text-sm line-clamp-2" : "text-xs line-clamp-2"
            )}>
              {plan.idealFor}
            </p>
          </motion.div>
        ) : null}

        <ul className={cn(
          "space-y-2 sm:space-y-2.5 flex-1 mt-3 sm:mt-4",
          featured ? "max-h-32 sm:max-h-40 overflow-y-auto" : "max-h-24 sm:max-h-28 overflow-y-auto"
        )}>
          {plan.features.slice(0, featured ? 4 : 3).map((feature, idx) => (
            <motion.li 
              key={feature} 
              className="flex items-start gap-1.5 sm:gap-2 text-xs sm:text-xs leading-snug text-white/70"
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              viewport={{ once: true }}
            >
              <CheckCircle2 className={cn(
                "shrink-0 text-white/62 mt-0.5",
                featured ? "h-4 w-4" : "h-3.5 w-3.5"
              )} />
              <span className="line-clamp-1">{feature}</span>
            </motion.li>
          ))}
          {plan.features.length > (featured ? 4 : 3) && (
            <p className="text-[7px] sm:text-[8px] text-white/50 mt-1">+ {plan.features.length - (featured ? 4 : 3)} recursos</p>
          )}
        </ul>

        <div className={cn(
          "mt-4 sm:mt-5"
        )}>
          <a href={`https://wa.me/5551981964238?text=${encodeURIComponent(plan.whatsapp)}`} target="_blank" rel="noopener noreferrer">
            <Button
              className={cn(
                "h-10 sm:h-11 w-full rounded-lg sm:rounded-xl border text-[10px] sm:text-xs font-black uppercase tracking-[0.15em] text-white relative overflow-hidden group/btn transition-all duration-300",
                featured ? "h-11 sm:h-12" : "h-10 sm:h-11"
              )}
              style={{
                background: featured
                  ? "linear-gradient(135deg, rgba(220,38,38,0.92), rgba(107,33,168,0.9), rgba(236,72,153,0.88))"
                  : "rgba(255,255,255,0.06)",
                boxShadow: featured ? "0 0 30px rgba(236,72,153,0.4), 0 10px 30px rgba(236,72,153,0.2)" : "none",
                border: featured ? "1px solid rgba(236,72,153,0.5)" : "1px solid rgba(255,255,255,0.1)"
              }}
            >
              <span className="relative z-10 flex items-center justify-center gap-1 sm:gap-2 w-full">
                {plan.cta}
                <ArrowRight className="h-3.5 sm:h-4 w-3.5 sm:w-4 transition-transform group-hover/btn:translate-x-0.5" />
              </span>
              {featured && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300 transform -translate-x-full group-hover/btn:translate-x-full" 
                  style={{ animation: "shimmer 2s infinite" }} 
                />
              )}
            </Button>
          </a>
        </div>
      </div>
    </motion.div>
  );
}

function AddOnCard({ addon }: { addon: typeof addOns[0] }) {
  const Icon = addon.icon;
  
  return (
    <motion.div 
      className="public-page-highlight-card group relative overflow-hidden"
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <motion.div 
        className="flex h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 items-center justify-center rounded-lg sm:rounded-lg md:rounded-xl border border-primary/30 bg-primary/10 text-primary mb-2 sm:mb-3 relative z-10"
        whileHover={{ rotate: 12, scale: 1.1 }}
      >
        <Icon className="h-4 w-4 sm:h-4.5 sm:w-4.5 md:h-5 md:w-5" />
      </motion.div>
      
      <p className="text-xs sm:text-sm font-black tracking-tight text-white/92 relative z-10">{addon.title}</p>
      <p className="mt-1 sm:mt-2 text-[11px] sm:text-xs leading-relaxed text-white/56 relative z-10 line-clamp-2">{addon.copy}</p>
      
      <motion.div 
        className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          top: 0,
          left: "-100%",
          width: "200%",
          animation: "slideGlow 3s infinite"
        }}
      />
    </motion.div>
  );
}

export default function PlanosSection() {
  const [showComparison, setShowComparison] = useState(false);
  const proPlan = plans.find(p => p.popular);
  const otherPlans = plans.filter(p => !p.popular);

  return (
    <motion.section
      id="planos"
      className="site-band px-3 sm:px-4 md:px-6 py-12 sm:py-16 md:py-20 lg:py-24"
      initial="hidden"
      whileInView="show"
      viewport={{ once: true }}
      variants={stagger}
    >
      <div className="max-w-6xl mx-auto">
        <motion.div variants={fade} className="mx-auto max-w-2xl text-center">
          <span className="site-badge site-badge--primary">Planos e estrutura</span>
          <h2 className="mt-4 sm:mt-6 md:mt-8 text-[clamp(1.5rem,6vw,2.5rem)] font-black tracking-tighter text-white/90 leading-[1]">
            Comece com o formato certo
            <span className="site-gradient-text"> para o seu momento.</span>
          </h2>
          <p className="mt-3 sm:mt-4 md:mt-5 text-xs sm:text-sm md:text-base leading-relaxed site-copy-muted">
            O ponto não é te colocar em um pacote engessado. É entender qual base faz sentido agora e o que pode ser
            expandido depois sem virar retrabalho.
          </p>
        </motion.div>

        {/* Toggle Comparação */}
        <motion.div variants={fade} className="mt-6 sm:mt-8 md:mt-10 flex justify-center">
          <motion.button
            onClick={() => setShowComparison(!showComparison)}
            className="relative px-6 py-3 rounded-full border border-primary/40 bg-gradient-to-r from-primary/5 to-primary/10 text-sm font-black uppercase tracking-[0.16em] text-primary transition-all duration-300 hover:border-primary/60 hover:shadow-[0_0_20px_rgba(236,72,153,0.3)]"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {showComparison ? "Voltar à visão destacada" : "Ver comparação de planos"}
            <motion.span
              className="ml-2 inline-block"
              animate={{ rotate: showComparison ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              ↔
            </motion.span>
          </motion.button>
        </motion.div>

        {/* Vista Padrão - Layout Assimétrico */}
        <AnimatePresence mode="wait">
          {!showComparison ? (
            <motion.div
              key="asymmetric"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="mt-8 sm:mt-10 grid gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-3 lg:gap-6"
            >
              {proPlan && (
                <div className="md:col-span-2 md:row-span-1">
                  <PlanCard plan={proPlan} featured={true} />
                </div>
              )}
              <div className="flex flex-col gap-4 sm:gap-5 md:col-span-2 lg:col-span-1 lg:row-span-1">
                {otherPlans.map((plan) => (
                  <PlanCard key={plan.id} plan={plan} featured={false} />
                ))}
              </div>
            </motion.div>
          ) : (
            /* Vista Comparativa - Lado a Lado */
            <motion.div
              key="comparison"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="mt-8 sm:mt-10 grid gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-3 lg:gap-6"
            >
              {plans.map((plan) => (
                <PlanCard key={plan.id} plan={plan} featured={plan.popular} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Add-ons Section */}
        <motion.div variants={fade} className="mt-10 sm:mt-12 md:mt-14 lg:mt-16 public-page-section-card">
          <div className="flex flex-col gap-2 sm:gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.2em] text-white/40">O que pode entrar depois</p>
              <h3 className="mt-2 sm:mt-3 text-lg sm:text-xl md:text-2xl font-black tracking-tight text-white/92">Seu projeto cresce por camadas.</h3>
            </div>
            <motion.a 
              href="#cadastro" 
              className="text-[9px] sm:text-xs font-black uppercase tracking-[0.15em] text-white/66 hover:text-white transition-colors whitespace-nowrap"
              whileHover={{ x: 4 }}
            >
              Solicitar diagnostico →
            </motion.a>
          </div>

          <div className="mt-5 sm:mt-6 md:mt-7 grid gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-4">
            {addOns.map((addon) => (
              <AddOnCard key={addon.title} addon={addon} />
            ))}
          </div>
        </motion.div>
      </div>

      <style>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        @keyframes slideGlow {
          0% {
            left: -100%;
          }
          100% {
            left: 100%;
          }
        }
      `}</style>
    </motion.section>
  );
}
