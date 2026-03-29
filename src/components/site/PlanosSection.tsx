import { motion } from "framer-motion";
import { ArrowRight, CheckCircle, MessageCircle, Globe, Layers, Rocket, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const fade = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };
const stagger = { show: { transition: { staggerChildren: 0.15 } } };

const plans = [
  {
    tag: "Express",
    tagColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    icon: Globe,
    iconColor: "bg-emerald-500/15 text-emerald-400",
    glowColor: "rgba(16,185,129,0.08)",
    accentColor: "#10b981",
    title: "Arquitetura Express",
    desc: "Presença digital imediata e profissional.",
    promo: true,
    price: "R$180",
    priceLabel: "Valor inicial",
    monthly: "R$60",
    features: [
      "Site moderno e responsivo",
      "Página de serviços",
      "Página de contato",
      "Integração com mapa",
      "Botão WhatsApp direto",
      "Otimização para celular",
    ],
    cta: "Aproveitar promoção",
    whatsapp: "Olá, vi a arquitetura Express da novaesweb e gostaria de estruturar minha presença digital!",
    note: "A base perfeita para sua transformação digital.",
  },
  {
    tag: "Pro",
    tagColor: "text-[hsl(var(--primary))] bg-[hsl(var(--primary))]/10 border-[hsl(var(--primary))]/20",
    icon: Layers,
    iconColor: "bg-[hsl(var(--primary))]/15 text-[hsl(var(--primary))]",
    glowColor: "rgba(232,51,74,0.1)",
    accentColor: "hsl(var(--primary))",
    title: "Arquitetura de Gestão",
    desc: "Ecossistema completo para escalar resultados.",
    popular: true,
    features: [
      "Site profissional completo",
      "Painel administrativo",
      "Cadastro de clientes",
      "Recebimento de pedidos",
      "Sistema de notificações",
      "Controle financeiro básico",
      "Histórico de informações",
    ],
    cta: "Falar com Arquiteto",
    ctaIcon: MessageCircle,
    whatsapp: "Olá, gostaria de saber mais sobre a Arquitetura de Gestão da novaesweb.",
    note: "Ideal para quem busca controle total e escala.",
  },
  {
    tag: "Sob Medida",
    tagColor: "text-purple-400 bg-purple-500/10 border-purple-500/20",
    icon: Rocket,
    iconColor: "bg-purple-500/15 text-purple-400",
    glowColor: "rgba(168,85,247,0.08)",
    accentColor: "#a855f7",
    title: "Arquitetura sob Medida",
    desc: "Engenharia dedicada para projetos complexos.",
    features: [
      "Sistemas de gestão",
      "Plataformas internas",
      "Portais para clientes",
      "Sistemas de pedidos",
      "Dashboards administrativos",
      "E muito mais...",
    ],
    cta: "Solicitar Diagnóstico",
    whatsapp: "Olá, gostaria de um orçamento para uma Arquitetura Digital sob Medida.",
    note: "Engenharia estratégica focada na sua necessidade.",
  },
];

export default function PlanosSection() {
  return (
    <motion.section id="planos" className="py-28 px-6 relative overflow-hidden" initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[hsl(var(--primary))]/5 rounded-full blur-[200px]" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div variants={fade} className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[hsl(var(--primary))] bg-[hsl(var(--primary))]/10 px-4 py-1.5 rounded-full">Investimento Estratégico</span>
          <h2 className="text-4xl sm:text-6xl font-black text-foreground mt-8 leading-[0.9] tracking-tighter">
            Planos feitos para <br />
            <span className="gradient-text">escalar o seu negócio</span>
          </h2>
          <p className="text-lg text-muted-foreground mt-8 leading-relaxed max-w-xl mx-auto font-medium">
            Escolha a arquitetura ideal para o momento da sua empresa.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.tag}
              variants={fade}
              className={cn(
                "relative rounded-[1.75rem] p-6 lg:p-8 flex flex-col border transition-all duration-500 group overflow-hidden",
                plan.popular
                  ? "border-[hsl(var(--primary))]/30 bg-white/[0.04] md:scale-[1.03] md:-my-2 shadow-2xl shadow-[hsl(var(--primary))]/10"
                  : "border-white/[0.06] bg-white/[0.02] hover:border-white/15 hover:bg-white/[0.04]"
              )}
            >
              {/* Top glow for popular */}
              {plan.popular && (
                <>
                  <div className="absolute -top-px left-0 right-0 h-[2px]" style={{ background: "linear-gradient(90deg, transparent, hsl(var(--primary)), hsl(var(--accent)), transparent)" }} />
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                    <span className="text-[9px] uppercase tracking-wider font-bold text-white bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] px-4 py-1 rounded-full shadow-lg flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3" /> Mais popular
                    </span>
                  </div>
                </>
              )}

              {/* Background ambient */}
              <div className="absolute top-0 right-0 w-40 h-40 rounded-full blur-[80px] opacity-30 pointer-events-none" style={{ background: plan.glowColor }} />

              {/* Header */}
              <div className="flex items-start gap-3 mb-4 mt-1">
                <div className={`w-11 h-11 rounded-xl ${plan.iconColor} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-500`}>
                  <plan.icon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <span className={`text-[9px] uppercase tracking-wider font-bold px-2.5 py-0.5 rounded-full border ${plan.tagColor}`}>{plan.tag}</span>
                  <h3 className="text-base font-extrabold text-foreground mt-1.5 tracking-tight">{plan.title}</h3>
                </div>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed mb-5 font-medium">{plan.desc}</p>

              {/* Promo badge */}
              {plan.promo && (
                <div className="mb-4">
                  <span className="text-[9px] font-bold uppercase px-3 py-1 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/20">
                    ✨ Promoção ativa
                  </span>
                </div>
              )}

              {/* Price */}
              {plan.price && (
                <div className="flex items-center gap-3 mb-5 p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <div className="text-center flex-1">
                    <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold">{plan.priceLabel}</p>
                    <p className="text-xl font-black text-emerald-400">{plan.price}</p>
                  </div>
                  <div className="h-8 w-px bg-white/[0.08]" />
                  <div className="text-center flex-1">
                    <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold">Mensal</p>
                    <p className="text-xl font-black text-emerald-400">{plan.monthly}<span className="text-[10px] font-medium text-muted-foreground">/mês</span></p>
                  </div>
                </div>
              )}

              {/* Features */}
              <ul className="space-y-2.5 mb-6 flex-1">
                {plan.features.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-[13px] text-muted-foreground">
                    <CheckCircle className="w-4 h-4 text-[hsl(var(--primary))]/50 shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>

              <p className="text-[10px] text-muted-foreground/40 italic mb-4 font-medium">{plan.note}</p>

              {/* CTA */}
              <a href={`https://wa.me/5551981964238?text=${encodeURIComponent(plan.whatsapp)}`} target="_blank" rel="noopener noreferrer">
                <Button className={cn(
                  "w-full h-12 rounded-xl font-bold text-sm group/btn border-0 text-white transition-all",
                  plan.popular
                    ? "shadow-lg shadow-[hsl(var(--primary))]/20"
                    : ""
                )} style={{
                  background: plan.popular
                    ? "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))"
                    : i === 0
                      ? "linear-gradient(135deg, #10b981, #059669)"
                      : "linear-gradient(135deg, #a855f7, #7c3aed)"
                }}>
                  {plan.cta}
                  {plan.ctaIcon ? <plan.ctaIcon className="w-4 h-4 ml-2" /> : <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />}
                </Button>
              </a>
            </motion.div>
          ))}
        </div>

        <motion.div variants={fade} className="mt-10 text-center">
          <p className="text-xs text-muted-foreground/40 max-w-2xl mx-auto leading-relaxed font-medium">
            <span className="text-muted-foreground font-bold">Nota:</span> Cada projeto pode receber novas funcionalidades conforme o crescimento da empresa. O domínio e alguns serviços externos podem ter custos separados pagos diretamente pelo cliente.
          </p>
        </motion.div>
      </div>
    </motion.section>
  );
}
