import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  Code,
  MessageCircle,
  Rocket,
  Shield,
  Sparkles,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";

import SEOHead from "@/components/SEOHead";
import PublicPageLayout from "@/components/site/PublicPageLayout";
import { Button } from "@/components/ui/button";
import { usePublicContact } from "@/hooks/usePublicContact";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const stagger = { show: { transition: { staggerChildren: 0.1 } } };

const numbers = [
  { value: "36+", label: "Projetos entregues" },
  { value: "98%", label: "Satisfação percebida" },
  { value: "24h", label: "Ritmo de resposta" },
  { value: "3x", label: "Potencial de procura" },
];

const diferencials = [
  {
    icon: Rocket,
    title: "Foco em resultado",
    description: "Cada projeto nasce para gerar procura, pedidos, autoridade e crescimento real para o negócio.",
  },
  {
    icon: Shield,
    title: "Acompanhamento próximo",
    description: "A NovaesWeb combina estrutura técnica com presença humana no processo de entrega, ajuste e evolução.",
  },
  {
    icon: Code,
    title: "Tecnologia moderna",
    description: "Sites, painéis, automações e organização digital com base técnica pensada para crescer.",
  },
  {
    icon: Clock,
    title: "Execução com ritmo",
    description: "Fluxos bem definidos para reduzir demora, alinhar expectativa e manter o projeto em avanço.",
  },
];

const steps = [
  {
    step: "01",
    title: "Diagnóstico",
    description: "Entendemos o cenário do negócio, a forma de venda e o que precisa ser estruturado primeiro.",
  },
  {
    step: "02",
    title: "Arquitetura",
    description: "Definimos a combinação certa entre site, pedidos, atendimento, marketing e controlo operacional.",
  },
  {
    step: "03",
    title: "Entrega e evolução",
    description: "Colocamos o projeto no ar, acompanhamos o uso e mantemos a base pronta para crescer.",
  },
];

const authorityCards = [
  {
    icon: Target,
    title: "Mais do que um site bonito",
    description: "A nossa proposta é estruturar a presença digital para parecer forte, atender melhor e vender com mais clareza.",
  },
  {
    icon: Users,
    title: "Linguagem acessível ao cliente real",
    description: "Criamos soluções que fazem sentido para quem precisa operar o negócio no dia a dia, não só admirar o layout.",
  },
  {
    icon: TrendingUp,
    title: "Base para crescer com controlo",
    description: "O projeto já nasce com visão de evolução para painel, pedidos, automação, marketing e organização contínua.",
  },
];

export default function SobreNos() {
  const { buildWhatsAppUrl } = usePublicContact();

  return (
    <PublicPageLayout>
      <SEOHead
        title="Sobre a NovaesWeb | Soluções Digitais para Negócios"
        description="Conheça a NovaesWeb: estrutura digital premium com foco em presença, controlo, automação e crescimento real para negócios."
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
                <span className="site-badge site-badge--accent mb-6">
                  <Sparkles className="w-3.5 h-3.5" />
                  Sobre a NovaesWeb
                </span>
                <h1 className="public-page-title">
                  Presença digital
                  <br />
                  com <span className="site-gradient-text">estrutura real</span>
                </h1>
                <p className="public-page-description mt-6">
                  A NovaesWeb nasceu para entregar algo que muitos negócios ainda não conseguem encontrar: uma presença digital com
                  visual premium, controlo operacional e foco claro em gerar clientes, pedidos e crescimento.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <span className="public-page-pill">
                    <Code className="w-4 h-4 text-[hsl(var(--primary))]" />
                    Sites, painéis e automação
                  </span>
                  <span className="public-page-pill">
                    <Target className="w-4 h-4 text-[hsl(var(--primary))]" />
                    Estratégia comercial aplicada
                  </span>
                  <span className="public-page-pill">
                    <Users className="w-4 h-4 text-[hsl(var(--primary))]" />
                    Atendimento mais humano
                  </span>
                </div>
              </div>

              <div className="public-page-highlight-grid">
                <div className="public-page-highlight-card">
                  <p className="text-[10px] uppercase tracking-[0.22em] font-black text-white/45 mb-2">Posicionamento</p>
                  <p className="text-lg font-black text-white leading-tight">
                    Estruturas que valorizam a marca e profissionalizam a operação.
                  </p>
                  <p className="text-sm site-copy-soft mt-3">
                    O objetivo é fazer o negócio parecer mais forte por fora e funcionar melhor por dentro.
                  </p>
                </div>
                <div className="public-page-highlight-card">
                  <p className="text-[10px] uppercase tracking-[0.22em] font-black text-white/45 mb-2">Projeto fundador</p>
                  <p className="text-lg font-black text-white leading-tight">
                    Tecnologia aplicada com ritmo, clareza e evolução contínua.
                  </p>
                  <p className="text-sm site-copy-soft mt-3">
                    Cada entrega serve de base para etapas maiores como pedidos, painéis e crescimento comercial.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial="hidden"
            animate="show"
            variants={{ show: { transition: { staggerChildren: 0.08 } } }}
            className="grid grid-cols-2 gap-4 md:grid-cols-4 mb-10"
          >
            {numbers.map((number) => (
              <motion.div key={number.label} variants={fadeUp} className="public-page-stat-card">
                <span className="public-page-stat-value site-gradient-text">{number.value}</span>
                <p className="text-xs uppercase tracking-[0.18em] font-bold text-white/40">{number.label}</p>
              </motion.div>
            ))}
          </motion.div>

          <section className="public-page-section">
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger} className="public-page-section-card">
              <div className="max-w-3xl mb-8">
                <span className="site-badge site-badge--primary mb-5">
                  <Rocket className="w-3.5 h-3.5" />
                  Nossa história
                </span>
                <h2 className="public-page-section-title">
                  A NovaesWeb surgiu para tornar a <span className="site-gradient-text">tecnologia útil</span> para negócios reais
                </h2>
              </div>

              <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.7fr)]">
                <div className="space-y-4 text-sm md:text-base site-copy-muted leading-relaxed">
                  <p>
                    Muitos negócios locais ainda dependem de estruturas frágeis: um site simples demais, atendimento solto no WhatsApp
                    e nenhuma organização digital clara. A NovaesWeb nasceu justamente para mudar esse cenário.
                  </p>
                  <p>
                    O nosso trabalho não é entregar só páginas bonitas. É desenhar uma base com mais autoridade, atendimento mais profissional,
                    pedidos mais organizados e espaço para crescer com painéis, automações e marketing.
                  </p>
                  <p>
                    Cada projeto é pensado para o contexto real do cliente, com linguagem acessível, visual premium e tecnologia suficiente
                    para apoiar a operação sem complicar o dia a dia.
                  </p>
                </div>

                <div className="space-y-4">
                  {authorityCards.map((card) => (
                    <div key={card.title} className="public-page-proof-card">
                      <div className="w-11 h-11 rounded-[1rem] flex items-center justify-center mb-4 bg-[linear-gradient(135deg,rgba(220,38,38,0.92),rgba(107,33,168,0.88),rgba(236,72,153,0.88))] shadow-[0_14px_34px_rgba(236,72,153,0.14)]">
                        <card.icon className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-lg font-black text-white tracking-tight">{card.title}</h3>
                      <p className="site-copy-muted text-sm leading-relaxed mt-3">{card.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </section>

          <section className="public-page-section">
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger} className="public-page-section-card">
              <div className="text-center max-w-3xl mx-auto mb-8">
                <span className="site-badge site-badge--accent mb-5">
                  <Shield className="w-3.5 h-3.5" />
                  Diferenciais
                </span>
                <h2 className="public-page-section-title">
                  Porque a <span className="site-gradient-text">NovaesWeb</span> não entrega no piloto automático
                </h2>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {diferencials.map((item) => (
                  <motion.div key={item.title} variants={fadeUp} className="public-page-proof-card">
                    <div className="w-12 h-12 rounded-[1rem] flex items-center justify-center mb-4 bg-[linear-gradient(135deg,rgba(220,38,38,0.92),rgba(107,33,168,0.88),rgba(236,72,153,0.88))] shadow-[0_14px_34px_rgba(236,72,153,0.14)]">
                      <item.icon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-black text-white tracking-tight">{item.title}</h3>
                    <p className="site-copy-muted text-sm leading-relaxed mt-3">{item.description}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </section>

          <section className="public-page-section">
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger} className="public-page-section-card">
              <div className="text-center max-w-3xl mx-auto mb-8">
                <span className="site-badge site-badge--primary mb-5">
                  <Clock className="w-3.5 h-3.5" />
                  Processo
                </span>
                <h2 className="public-page-section-title">
                  Como estruturamos um projeto com <span className="site-gradient-text">mais clareza</span>
                </h2>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {steps.map((step) => (
                  <motion.div key={step.step} variants={fadeUp} className="public-page-proof-card text-center">
                    <span className="block text-4xl font-black tracking-tighter site-gradient-text">{step.step}</span>
                    <h3 className="text-lg font-black text-white mt-3">{step.title}</h3>
                    <p className="site-copy-muted text-sm leading-relaxed mt-3">{step.description}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </section>

          <section className="public-page-section">
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} className="public-page-cta-card text-center">
              <span className="site-badge site-badge--accent mb-6">
                <MessageCircle className="w-3.5 h-3.5" />
                Próximo passo
              </span>
              <h2 className="public-page-section-title">
                Quer estruturar o seu negócio com uma presença mais <span className="site-gradient-text">premium</span>?
              </h2>
              <p className="public-page-description mt-5 mx-auto">
                Fale com a NovaesWeb e receba um direcionamento mais claro sobre site, pedidos, atendimento, automação e crescimento digital.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/cadastro">
                  <Button
                    className="h-12 px-8 rounded-2xl text-white font-bold border-0"
                    style={{
                      background: "linear-gradient(135deg, rgba(220,38,38,0.92), rgba(107,33,168,0.9), rgba(236,72,153,0.88))",
                      boxShadow: "0 18px 42px rgba(236,72,153,0.16)",
                    }}
                  >
                    Solicitar orçamento
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <a
                  href={buildWhatsAppUrl("Olá! Quero falar com a NovaesWeb sobre um projeto para o meu negócio.")}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" className="h-12 px-8 rounded-2xl border-[hsl(var(--border))] text-white hover:border-[hsl(var(--primary))]">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Falar no WhatsApp
                  </Button>
                </a>
              </div>
            </motion.div>
          </section>
        </div>
      </section>
    </PublicPageLayout>
  );
}
