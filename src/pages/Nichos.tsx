import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  ChevronDown,
  LayoutGrid,
  MessageCircle,
  Scissors,
  ShoppingBag,
  Sparkles,
  Target,
  Utensils,
  Zap,
} from "lucide-react";

import SEOHead from "@/components/SEOHead";
import PublicPageLayout from "@/components/site/PublicPageLayout";
import { Button } from "@/components/ui/button";
import { usePublicContact } from "@/hooks/usePublicContact";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const stagger = { show: { transition: { staggerChildren: 0.12 } } };

const segments = [
  {
    icon: Utensils,
    title: "Alimentação e Delivery",
    description:
      "Estruturas digitais para restaurantes, hamburguerias, pizzarias e operações que precisam vender, organizar pedidos e ganhar velocidade no atendimento.",
    niches: ["Hamburguerias", "Pizzarias", "Açaí e sorveterias", "Restaurantes", "Sushi e delivery"],
    features: [
      "Cardápio digital premium",
      "Pedidos com mais organização no WhatsApp ou painel",
      "Apresentação de combos, ofertas e categorias",
      "Fluxo pensado para conversão e repetição de compra",
    ],
  },
  {
    icon: Scissors,
    title: "Beleza e Estética",
    description:
      "Posicionamento mais premium para salões, clínicas e barbearias que querem atrair clientes e deixar o atendimento mais profissional.",
    niches: ["Salões de beleza", "Barbearias", "Clínicas estéticas"],
    features: [
      "Apresentação elegante dos serviços",
      "Captação de leads e pedidos de agendamento",
      "Contato rápido com WhatsApp integrado",
      "Estrutura visual para passar confiança e autoridade",
    ],
  },
  {
    icon: ShoppingBag,
    title: "Comércio e Serviços",
    description:
      "Soluções para lojas, oficinas, pet shops e empresas locais que precisam profissionalizar a presença digital e gerar mais procura.",
    niches: ["Pet shops", "Oficinas", "Academias", "Lojas em geral"],
    features: [
      "Catálogo digital de produtos e serviços",
      "Layout mais forte para credibilidade",
      "Canais de contacto e pedido bem destacados",
      "Base preparada para crescer com novos módulos",
    ],
  },
  {
    icon: Building2,
    title: "Empresas em Geral",
    description:
      "Projetos mais flexíveis para operações que precisam de presença digital, organização e comunicação mais forte com o cliente.",
    niches: ["Consultorias", "Prestadores de serviço", "Empresas locais", "Projetos personalizados"],
    features: [
      "Site profissional com foco comercial",
      "Painéis e organização operacional conforme o cenário",
      "Estrutura de contacto, orçamento e atendimento",
      "Base evolutiva para marketing, pedidos e controlo",
    ],
  },
];

const stats = [
  { value: "36+", label: "Projetos com entrega real" },
  { value: "15+", label: "Segmentos já atendidos" },
  { value: "98%", label: "Percepção de satisfação" },
];

const proofPillars = [
  {
    icon: LayoutGrid,
    title: "Estrutura certa para cada operação",
    description: "Não entregamos páginas genéricas. Cada nicho recebe uma arquitetura pensada para o jeito como ele vende.",
  },
  {
    icon: MessageCircle,
    title: "Comunicação mais profissional",
    description: "O visual, o fluxo de contacto e a apresentação são ajustados para passar mais confiança ao cliente final.",
  },
  {
    icon: Target,
    title: "Conversão como prioridade",
    description: "Cada bloco é pensado para transformar visita em pedido, orçamento ou contacto com mais clareza.",
  },
];

type Segment = (typeof segments)[number];

function SegmentCard({ segment }: { segment: Segment }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      variants={fadeUp}
      className="site-surface rounded-[1.9rem] overflow-hidden border border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/0.28)] transition-all duration-300"
      whileHover={{ y: -4 }}
    >
      <button className="w-full text-left p-6 sm:p-8" onClick={() => setExpanded((current) => !current)}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-[1.15rem] flex items-center justify-center shrink-0 bg-[linear-gradient(135deg,rgba(220,38,38,0.92),rgba(107,33,168,0.88),rgba(236,72,153,0.88))] shadow-[0_16px_40px_rgba(236,72,153,0.15)]">
              <segment.icon className="w-6 h-6 text-white" />
            </div>
            <div className="space-y-3">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-[hsl(var(--foreground))] tracking-tight">{segment.title}</h2>
                <p className="text-sm sm:text-base site-copy-muted mt-2 max-w-2xl leading-relaxed">{segment.description}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                {segment.niches.map((niche) => (
                  <span key={niche} className="public-page-pill">
                    <Sparkles className="w-3.5 h-3.5 text-[hsl(var(--primary))]" />
                    {niche}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <motion.div
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.25 }}
            className="mt-1 shrink-0 text-[hsl(var(--muted-foreground))]"
          >
            <ChevronDown className="w-5 h-5" />
          </motion.div>
        </div>
      </button>

      <AnimatePresence>
        {expanded ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-6 sm:px-8 pb-7 sm:pb-8 pt-2 border-t border-white/5">
              <p className="text-[10px] uppercase tracking-[0.22em] font-black text-white/45 mb-4">
                O que costuma fazer mais sentido para este nicho
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {segment.features.map((feature, index) => (
                  <motion.div
                    key={feature}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="public-page-proof-card flex items-center gap-3"
                  >
                    <Check className="w-4 h-4 shrink-0 text-[hsl(var(--primary))]" />
                    <span className="text-sm site-copy-muted">{feature}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
}

export default function Nichos() {
  const { buildWhatsAppUrl } = usePublicContact();

  return (
    <PublicPageLayout>
      <SEOHead
        title="Nichos que Atendemos | NovaesWeb"
        description="Soluções digitais da NovaesWeb para alimentação, beleza, comércio e empresas. Descubra como estruturamos cada nicho para vender melhor."
      />

      <section className="public-page-shell">
        <div className="public-page-container">
          <Link to="/" className="public-page-backlink mb-8">
            <ArrowLeft className="w-4 h-4" />
            Voltar ao site
          </Link>

          <motion.div initial="hidden" animate="show" variants={fadeUp} className="public-page-hero mb-10">
            <div className="public-page-hero-grid">
              <div>
                <span className="site-badge site-badge--primary mb-6">
                  <Sparkles className="w-3.5 h-3.5" />
                  Soluções por segmento
                </span>
                <h1 className="public-page-title">
                  Estruturas digitais
                  <br />
                  <span className="site-gradient-text">para nichos reais</span>
                </h1>
                <p className="public-page-description mt-6">
                  A NovaesWeb adapta site, apresentação, pedidos, atendimento e organização de acordo com o tipo de negócio.
                  O objetivo é simples: fazer a operação parecer mais forte e vender melhor.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <span className="public-page-pill">
                    <LayoutGrid className="w-4 h-4 text-[hsl(var(--primary))]" />
                    Sites e painéis por nicho
                  </span>
                  <span className="public-page-pill">
                    <MessageCircle className="w-4 h-4 text-[hsl(var(--primary))]" />
                    Atendimento mais profissional
                  </span>
                  <span className="public-page-pill">
                    <Target className="w-4 h-4 text-[hsl(var(--primary))]" />
                    Mais foco em conversão
                  </span>
                </div>
              </div>

              <div className="public-page-highlight-grid">
                <div className="public-page-highlight-card">
                  <p className="text-[10px] uppercase tracking-[0.22em] font-black text-white/45 mb-2">Direção comercial</p>
                  <p className="text-lg font-black text-white leading-tight">
                    O nicho certo pede uma estrutura certa.
                  </p>
                  <p className="text-sm site-copy-soft mt-3">
                    Ajustamos a experiência conforme o tipo de produto, serviço e forma de contacto do negócio.
                  </p>
                </div>
                <div className="public-page-highlight-card">
                  <p className="text-[10px] uppercase tracking-[0.22em] font-black text-white/45 mb-2">Mais controlo</p>
                  <p className="text-lg font-black text-white leading-tight">
                    Visual premium com operação mais organizada.
                  </p>
                  <p className="text-sm site-copy-soft mt-3">
                    Site, pedido, atendimento e captação passam a trabalhar juntos como uma estrutura comercial.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial="hidden"
            animate="show"
            variants={{ show: { transition: { staggerChildren: 0.08 } } }}
            className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-10"
          >
            {stats.map((stat) => (
              <motion.div key={stat.label} variants={fadeUp} className="public-page-stat-card">
                <span className="public-page-stat-value site-gradient-text">{stat.value}</span>
                <p className="text-xs uppercase tracking-[0.18em] font-bold text-white/40">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>

          <motion.div variants={fadeUp} initial="hidden" animate="show" className="public-page-section-card mb-10">
            <div className="flex items-center gap-3 mb-4">
              <Zap className="w-5 h-5 text-[hsl(var(--primary))]" />
              <p className="text-sm font-bold text-white">Cada segmento recebe uma leitura própria de estrutura, oferta e contacto.</p>
            </div>
            <p className="site-copy-muted leading-relaxed">
              Em vez de aplicar um modelo igual para todo mundo, a NovaesWeb ajusta a hierarquia, os blocos de venda e os pontos de contato de acordo com o que o cliente final espera daquele nicho.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            animate="show"
            variants={stagger}
            className="space-y-6"
          >
            {segments.map((segment) => (
              <SegmentCard key={segment.title} segment={segment} />
            ))}
          </motion.div>

          <section className="public-page-section">
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger} className="public-page-section-card">
              <div className="text-center max-w-3xl mx-auto mb-8">
                <span className="site-badge site-badge--accent mb-5">
                  <Target className="w-3.5 h-3.5" />
                  Autoridade NovaesWeb
                </span>
                <h2 className="public-page-section-title">
                  O que mantemos em qualquer <span className="site-gradient-text">segmento</span>
                </h2>
                <p className="public-page-description mt-5 mx-auto">
                  Mesmo quando o nicho muda, a lógica continua: posicionamento mais forte, estrutura mais inteligente e experiência mais clara para quem compra.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {proofPillars.map((pillar) => (
                  <motion.div key={pillar.title} variants={fadeUp} className="public-page-proof-card">
                    <div className="w-12 h-12 rounded-[1rem] flex items-center justify-center mb-4 bg-[linear-gradient(135deg,rgba(220,38,38,0.92),rgba(107,33,168,0.88),rgba(236,72,153,0.88))] shadow-[0_16px_42px_rgba(236,72,153,0.14)]">
                      <pillar.icon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-black text-white tracking-tight">{pillar.title}</h3>
                    <p className="site-copy-muted text-sm leading-relaxed mt-3">{pillar.description}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </section>

          <section className="public-page-section">
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} className="public-page-cta-card text-center">
              <span className="site-badge site-badge--primary mb-6">
                <MessageCircle className="w-3.5 h-3.5" />
                Próximo passo
              </span>
              <h2 className="public-page-section-title">
                Quer ver como isso ficaria no <span className="site-gradient-text">seu segmento</span>?
              </h2>
              <p className="public-page-description mt-5 mx-auto">
                A NovaesWeb pode indicar a estrutura ideal para o seu negócio e mostrar qual combinação de site, pedidos, painel e atendimento faz mais sentido para a sua operação.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <a
                  href={buildWhatsAppUrl("Olá! Quero entender qual estrutura da NovaesWeb faz mais sentido para o meu segmento.")}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    className="h-12 px-8 rounded-2xl text-white font-bold border-0"
                    style={{
                      background: "linear-gradient(135deg, rgba(220,38,38,0.92), rgba(107,33,168,0.9), rgba(236,72,153,0.88))",
                      boxShadow: "0 18px 42px rgba(236,72,153,0.16)",
                    }}
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Falar sobre o meu nicho
                  </Button>
                </a>
                <Link to="/cadastro">
                  <Button variant="outline" className="h-12 px-8 rounded-2xl border-[hsl(var(--border))] text-white hover:border-[hsl(var(--primary))]">
                    <ArrowRight className="w-4 h-4 mr-2" />
                    Solicitar orçamento
                  </Button>
                </Link>
              </div>
            </motion.div>
          </section>
        </div>
      </section>
    </PublicPageLayout>
  );
}
