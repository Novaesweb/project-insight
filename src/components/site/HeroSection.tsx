import { memo, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import {
  ArrowRight,
  ShieldCheck,
  Zap,
  Sparkles,
  Briefcase,
  Target,
  Layout,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { useCompanyCounter } from "@/hooks/useCompanyCounter";

interface HeroSectionProps {
  onOpenDemo: () => void;
}

function AnimatedNumber({ target, suffix = "" }: { target: number; suffix?: string }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => `${Math.round(latest)}${suffix}`);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const controls = animate(count, target, { duration: 1.5, ease: "easeOut" });
    return controls.stop;
  }, [target, count]);

  return <motion.span ref={ref}>{rounded}</motion.span>;
}

const particles = [
  { delay: 0, x: "10%", y: "20%", size: 5 },
  { delay: 0.8, x: "85%", y: "15%", size: 4 },
  { delay: 1.5, x: "70%", y: "70%", size: 4 },
  { delay: 2, x: "20%", y: "75%", size: 3 },
];

function HeroSection({ onOpenDemo }: HeroSectionProps) {
  const companyCount = useCompanyCounter();
  const navigate = useNavigate();

  const featureCards = [
    {
      eyebrow: "Posicionamento por nicho",
      title: "Estruturas para diferentes mercados",
      description:
        "Veja como adaptamos site, oferta e fluxo comercial para servicos, loja, clinica e operacoes locais.",
      icon: Briefcase,
      action: () => navigate("/nichos"),
      cta: "Ver nichos",
    },
    {
      eyebrow: "Campanhas e criativos",
      title: "Marketing com direcao comercial",
      description:
        "Landing pages, criativos e campanhas para trazer mais conversas qualificadas para a sua operacao.",
      icon: Target,
      action: () => navigate("/criacao-conteudo"),
      cta: "Explorar marketing",
    },
    {
      eyebrow: "Operacao organizada",
      title: "Painel, contratos e acompanhamento",
      description:
        "Uma base para vender melhor, acompanhar clientes e operar com mais clareza em um so lugar.",
      icon: Layout,
      action: onOpenDemo,
      cta: "Ver demonstracao",
    },
  ];

  const scrollToCadastro = () => {
    const section = document.getElementById("cadastro");
    section?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="home" className="relative overflow-hidden pt-28 pb-20 lg:pt-32 lg:pb-24">
      <div className="absolute inset-0 z-0" aria-hidden="true">
        <div
          className="absolute top-0 -left-32 w-[620px] h-[620px] rounded-full blur-[160px]"
          style={{ background: "radial-gradient(circle, hsl(var(--accent) / 0.18), transparent 72%)" }}
        />
        <div
          className="absolute -bottom-32 -right-32 w-[540px] h-[540px] rounded-full blur-[160px]"
          style={{ background: "radial-gradient(circle, hsl(var(--primary-novaesweb) / 0.14), transparent 72%)" }}
        />
      </div>

      <div className="absolute inset-0 opacity-[0.018] pointer-events-none" aria-hidden="true">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)",
            backgroundSize: "72px 72px",
          }}
        />
      </div>

      <div className="absolute inset-0 pointer-events-none z-[1]" aria-hidden="true">
        {particles.map((particle, index) => (
          <motion.div
            key={index}
            className="absolute rounded-full"
            style={{
              left: particle.x,
              top: particle.y,
              width: particle.size,
              height: particle.size,
              background: "radial-gradient(circle, hsl(var(--accent)) 0%, transparent 70%)",
              opacity: 0.15,
            }}
            animate={{ y: [0, -20, 0], opacity: [0.1, 0.2, 0.1] }}
            transition={{
              duration: 5 + index,
              delay: particle.delay,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[120%] h-[500px] opacity-[0.05] pointer-events-none"
        aria-hidden="true"
        style={{ background: "radial-gradient(ellipse at top, hsl(var(--accent) / 0.22), transparent 72%)" }}
      />

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="hero-editorial-grid">
            <div className="hero-editorial-copy">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="site-badge site-badge--accent hero-tech-badge mb-8 relative"
              >
                <Sparkles className="w-3.5 h-3.5" style={{ color: "hsl(var(--accent))" }} />
                <span
                  className="text-[10px] font-black uppercase tracking-[0.3em]"
                  style={{ color: "hsl(var(--muted-foreground) / 0.86)" }}
                >
                  NovaesWeb Studio
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-5xl md:text-7xl xl:text-[5.4rem] font-black tracking-tighter leading-[0.88]"
              >
                <span className="block text-foreground/92">Seu negocio precisa de</span>
                <span className="block site-gradient-text mt-2">mais que um site.</span>
                <span className="block text-foreground/55 mt-2">Precisa de uma estrutura para vender.</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.24 }}
                className="text-lg md:text-xl mt-8 max-w-3xl leading-relaxed font-medium site-copy-muted"
              >
                A NovaesWeb cria uma base digital para atrair contatos, organizar atendimento e fechar com mais
                clareza. Site, painel, contratos, extras e automacao trabalhando na mesma direcao.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="mt-5 flex flex-wrap gap-3"
              >
                {[
                  "Site profissional com foco em conversao",
                  "Painel para operar e acompanhar",
                  "WhatsApp e fluxo comercial alinhados",
                ].map((item) => (
                  <span
                    key={item}
                    className="site-soft-surface rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-white/70"
                  >
                    {item}
                  </span>
                ))}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.36 }}
                className="mt-6 max-w-3xl w-full"
              >
                <div className="hero-founder-card rounded-[1.8rem] px-5 py-5 sm:px-6 sm:py-6 text-left">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.28em] font-black text-[hsl(var(--gold))]">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Estrutura recomendada
                      </div>
                      <p className="text-sm sm:text-base text-white/82 font-semibold leading-relaxed">
                        Indicamos a combinacao ideal entre vitrine, operacao e automacao para voce captar melhor e
                        organizar o crescimento sem improviso.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2.5 shrink-0">
                      <span className="hero-founder-pill">Site + painel</span>
                      <span className="hero-founder-pill">Proposta mais clara</span>
                      <span className="hero-founder-pill hero-founder-pill--warning">Acompanhamento consultivo</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.48 }}
                className="mt-8 flex flex-col sm:flex-row items-stretch gap-4 max-w-3xl w-full justify-center"
              >
                <motion.div whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }} className="w-full sm:w-auto">
                  <Button
                    onClick={scrollToCadastro}
                    className="h-16 w-full sm:w-auto px-10 sm:px-12 rounded-2xl text-white text-lg font-black border-0 relative overflow-hidden group"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(220,38,38,0.94), rgba(107,33,168,0.9), rgba(236,72,153,0.88))",
                      boxShadow: "0 18px 52px rgba(236,72,153,0.18), 0 0 28px rgba(236,72,153,0.08)",
                    }}
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      Solicitar diagnostico
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform duration-300" />
                    </span>
                  </Button>
                </motion.div>

                <motion.button
                  type="button"
                  onClick={onOpenDemo}
                  whileHover={{ scale: 1.02, y: -2 }}
                  className="site-surface h-16 px-8 rounded-2xl text-sm font-bold inline-flex items-center justify-center gap-2 transition-colors w-full sm:w-auto"
                  style={{ color: "hsl(var(--muted-foreground) / 0.92)" }}
                >
                  Ver demonstracao
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </motion.div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.62 }}
            className="hero-proof-strip max-w-5xl mx-auto"
          >
            <div className="hero-proof-card">
              <Zap className="w-4 h-4 text-white/70" />
              <div>
                <p className="text-2xl md:text-3xl font-black site-gradient-text">
                  <AnimatedNumber target={companyCount} suffix="+" />
                </p>
                <p className="text-[10px] uppercase tracking-[0.22em] font-bold text-white/40">bases entregues</p>
              </div>
            </div>
            <div className="hero-proof-card">
              <Layout className="w-4 h-4 text-white/70" />
              <div>
                <p className="text-xl md:text-2xl font-black text-white">3 frentes</p>
                <p className="text-[10px] uppercase tracking-[0.22em] font-bold text-white/40">site, operacao e conversao</p>
              </div>
            </div>
            <div className="hero-proof-card">
              <ShieldCheck className="w-4 h-4 text-white/70" />
              <div>
                <p className="text-xl md:text-2xl font-black text-white">7 dias</p>
                <p className="text-[10px] uppercase tracking-[0.22em] font-bold text-white/40">prazo medio para colocar a base no ar</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.74 }}
            className="hero-feature-grid max-w-6xl mx-auto"
          >
            {featureCards.map((card) => (
              <motion.button
                key={card.title}
                type="button"
                onClick={card.action}
                whileHover={{ y: -4, scale: 1.01 }}
                className="hero-feature-card"
              >
                <div className="hero-feature-card__icon">
                  <card.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.24em] font-black text-white/40">{card.eyebrow}</p>
                  <h3 className="text-lg font-black text-white mt-2 tracking-tight">{card.title}</h3>
                  <p className="text-sm site-copy-muted leading-relaxed mt-3">{card.description}</p>
                  <span className="hero-feature-card__cta">
                    {card.cta}
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </motion.button>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default memo(HeroSection);
