import { motion } from "framer-motion";
import { ArrowRight, CheckCircle, MessageCircle, Globe, Layers, Rocket, Sparkles, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const fade = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };
const stagger = { show: { transition: { staggerChildren: 0.15 } } };

const plans = [
  {
    tag: "Express",
    icon: Globe,
    accentHsl: "var(--success)",
    title: "Arquitetura Express",
    desc: "Presença digital imediata e profissional.",
    promo: true,
    price: "R$180",
    priceLabel: "Valor inicial",
    monthly: "R$60",
    automation: true,
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
    icon: Layers,
    accentHsl: "var(--primary)",
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
    icon: Rocket,
    accentHsl: "var(--accent)",
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
    <motion.section id="planos" className="site-band py-28 px-6 relative overflow-hidden" initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div variants={fade} className="text-center max-w-3xl mx-auto mb-16">
          <span
            className="site-badge site-badge--primary inline-flex mb-8"
          >
            Investimento Estratégico
          </span>
          <h2 className="text-4xl sm:text-6xl font-black text-foreground/90 leading-[0.9] tracking-tighter">
            Planos feitos para <br />
            <span className="site-gradient-text">escalar o seu negócio</span>
          </h2>
          <p className="text-lg site-copy-muted mt-8 leading-relaxed max-w-xl mx-auto font-medium">
            Escolha a arquitetura ideal para o momento da sua empresa.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.tag}
              variants={fade}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
              className={cn(
                "site-surface relative rounded-[1.75rem] p-6 lg:p-8 flex flex-col transition-all duration-500 group overflow-hidden",
                plan.popular && "md:scale-[1.03] md:-my-2"
              )}
              style={{
                background: plan.popular
                  ? 'linear-gradient(180deg, hsl(var(--primary) / 0.06), hsl(var(--card)))'
                  : 'linear-gradient(180deg, hsl(var(--card)), hsl(240 10% 8% / 0.84))',
                border: `1px solid ${plan.popular ? 'hsl(var(--primary) / 0.2)' : 'hsl(var(--border))'}`,
                boxShadow: plan.popular ? '0 20px 60px rgba(220, 38, 38, 0.08)' : undefined,
              }}
            >
              {/* Top accent line for popular */}
              {plan.popular && (
                <>
                  <div className="absolute -top-px left-0 right-0 h-[2px]" style={{ background: 'var(--gradient-primary)' }} />
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
                    <span className="text-[9px] uppercase tracking-wider font-bold text-white px-4 py-1 rounded-full shadow-lg flex items-center gap-1.5"
                      style={{ background: 'linear-gradient(135deg, rgba(220,38,38,0.92), rgba(107,33,168,0.9), rgba(236,72,153,0.88))' }}>
                      <Star className="w-3 h-3" /> Mais popular
                    </span>
                  </div>
                </>
              )}

              {/* Hover glow */}
              <div className="absolute inset-0 rounded-[1.75rem] overflow-hidden pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute top-0 right-0 w-40 h-40 rounded-full blur-[80px] opacity-20" style={{ background: `hsl(${plan.accentHsl})` }} />
              </div>

              {/* Header */}
              <div className="flex items-start gap-3 mb-4 mt-1 relative">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-500"
                  style={{ background: `hsl(${plan.accentHsl} / 0.1)` }}
                >
                  <plan.icon className="w-5 h-5" style={{ color: `hsl(${plan.accentHsl})` }} />
                </div>
                <div className="min-w-0">
                  <span
                    className="text-[9px] uppercase tracking-wider font-bold px-2.5 py-0.5 rounded-full"
                    style={{
                      background: `hsl(${plan.accentHsl} / 0.08)`,
                      border: `1px solid hsl(${plan.accentHsl} / 0.2)`,
                      color: `hsl(${plan.accentHsl})`,
                    }}
                  >
                    {plan.tag}
                  </span>
                  <h3 className="text-base font-extrabold text-foreground mt-1.5 tracking-tight">{plan.title}</h3>
                </div>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed mb-5 font-medium relative">{plan.desc}</p>

              {/* Promo badge */}
              {plan.promo && (
                <div className="mb-4 relative">
                  <span className="text-[9px] font-bold uppercase px-3 py-1 rounded-full"
                    style={{ background: 'hsl(var(--warning) / 0.1)', border: '1px solid hsl(var(--warning) / 0.2)', color: 'hsl(var(--warning))' }}>
                    ✨ Promoção ativa
                  </span>
                </div>
              )}

              {/* Price */}
              {plan.price && (
                <div className="mb-5 relative space-y-2.5">
                  <div className="p-3.5 rounded-xl text-center"
                    style={{ background: 'hsl(var(--secondary) / 0.55)', border: '1px solid hsl(var(--border))' }}>
                    <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold">{plan.priceLabel}</p>
                    <p className="text-xl font-black" style={{ color: `hsl(${plan.accentHsl})` }}>{plan.price}</p>
                  </div>
                  {plan.automation && (
                    <div className="flex items-center gap-2.5 p-3 rounded-xl"
                      style={{ background: 'hsl(142 71% 45% / 0.06)', border: '1px solid hsl(142 71% 45% / 0.15)' }}>
                      <Sparkles className="w-4 h-4 shrink-0 text-emerald-400" />
                      <div className="flex-1">
                        <p className="text-[10px] uppercase tracking-wider font-bold text-emerald-400/80">Com automação WhatsApp</p>
                        <p className="text-lg font-black text-emerald-400">
                          +R$60<span className="text-[10px] font-medium text-emerald-400/60">/mês</span>
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Features */}
              <ul className="space-y-2.5 mb-6 flex-1 relative">
                {plan.features.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-[13px] text-muted-foreground/90">
                    <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: `hsl(${plan.accentHsl} / 0.5)` }} />
                    {item}
                  </li>
                ))}
              </ul>

              <p className="text-[10px] text-muted-foreground/60 italic mb-4 font-medium relative">{plan.note}</p>

              {/* CTA */}
              <a href={`https://wa.me/5551981964238?text=${encodeURIComponent(plan.whatsapp)}`} target="_blank" rel="noopener noreferrer" className="relative">
                <Button className="w-full h-12 rounded-xl font-bold text-sm text-white border-0 group/btn transition-all hover:scale-[1.02]"
                  style={{
                    background: plan.popular ? 'linear-gradient(135deg, rgba(220,38,38,0.92), rgba(107,33,168,0.9), rgba(236,72,153,0.88))' : `hsl(${plan.accentHsl})`,
                    boxShadow: `0 10px 26px hsl(${plan.accentHsl} / 0.16)`,
                  }}>
                  {plan.cta}
                  {plan.ctaIcon ? <plan.ctaIcon className="w-4 h-4 ml-2" /> : <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />}
                </Button>
              </a>
            </motion.div>
          ))}
        </div>

        <motion.div variants={fade} className="mt-10 text-center">
          <p className="text-xs text-muted-foreground/60 max-w-2xl mx-auto leading-relaxed font-medium">
            <span className="text-muted-foreground font-bold">Nota:</span> Cada projeto pode receber novas funcionalidades conforme o crescimento da empresa. O domínio e alguns serviços externos podem ter custos separados pagos diretamente pelo cliente.
          </p>
        </motion.div>
      </div>
    </motion.section>
  );
}
