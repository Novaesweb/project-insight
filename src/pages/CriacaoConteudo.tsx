import { memo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  Check,
  Image as ImageIcon,
  LayoutGrid,
  Lightbulb,
  MessageCircle,
  Monitor,
  Palette,
  PenTool,
  Smartphone,
  Sparkles,
  Target,
} from "lucide-react";

import SEOHead from "@/components/SEOHead";
import PublicPageLayout from "@/components/site/PublicPageLayout";
import { Button } from "@/components/ui/button";
import { usePublicContact } from "@/hooks/usePublicContact";
import marketingImg from "@/assets/area-marketing-novaesweb.jpeg";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const tabs = [
  {
    id: "imagens",
    label: "Imagens Profissionais",
    icon: Camera,
    description: "Criamos peças visuais para o seu negócio se apresentar com mais impacto, qualidade e consistência.",
    items: [
      "Imagens promocionais para produtos e serviços",
      "Banners e campanhas para datas especiais",
      "Artes para redes sociais com aparência mais premium",
      "Visual alinhado ao nicho e à proposta comercial",
    ],
  },
  {
    id: "conteudo",
    label: "Conteúdo Social",
    icon: Smartphone,
    description: "Além da parte visual, ajudamos a estruturar textos e chamadas com foco em divulgação e venda.",
    items: [
      "Legendas para Instagram",
      "Textos de promoção e ativação",
      "Chamadas para venda e captação",
      "Ideias de campanhas para manter a marca viva",
    ],
  },
  {
    id: "identidade",
    label: "Identidade Visual",
    icon: Palette,
    description: "Refinamos o visual do negócio para criar coerência entre site, redes sociais, campanhas e materiais.",
    items: [
      "Direção visual da marca",
      "Paleta de cores e presença mais profissional",
      "Padrões para redes sociais e divulgação",
      "Materiais que reforçam a percepção da marca",
    ],
  },
];

const benefits = [
  { text: "Mais profissionalismo nas redes sociais", icon: PenTool },
  { text: "Mais consistência visual na divulgação", icon: Target },
  { text: "Mais chances de gerar pedidos e procura", icon: Sparkles },
  { text: "Mais facilidade para manter a marca ativa", icon: ImageIcon },
];

const differentials = [
  { icon: Monitor, label: "Site + Sistema" },
  { icon: Camera, label: "Visuais promocionais" },
  { icon: Smartphone, label: "Conteúdo para divulgação" },
];

const marketingMetrics = [
  { value: "1", label: "Estrutura mais completa" },
  { value: "3", label: "Frentes de marketing" },
  { value: "∞", label: "Possibilidades de campanha" },
];

const imageMotion = {
  hidden: { opacity: 0, scale: 0.96 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.55 } },
};

export default function CriacaoConteudo() {
  const { buildWhatsAppUrl } = usePublicContact();
  const [activeTab, setActiveTab] = useState("imagens");
  const activeService = tabs.find((tab) => tab.id === activeTab) || tabs[0];

  return (
    <PublicPageLayout>
      <SEOHead
        title="Área do Marketing | NovaesWeb"
        description="Veja exemplos reais da Área do Marketing da NovaesWeb com imagens profissionais, campanhas visuais e conteúdo para divulgar seu negócio."
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
                  Área do Marketing
                </span>
                <h1 className="public-page-title">
                  Comunicação visual
                  <br />
                  com <span className="site-gradient-text">mais impacto</span>
                </h1>
                <p className="public-page-description mt-6">
                  A NovaesWeb não trabalha só o site. Também ajuda o negócio a comunicar melhor no digital com visuais, campanhas,
                  identidade e materiais que deixam a marca mais profissional.
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <span className="public-page-pill">
                    <Camera className="w-4 h-4 text-[hsl(var(--primary))]" />
                    Imagens para campanhas
                  </span>
                  <span className="public-page-pill">
                    <Palette className="w-4 h-4 text-[hsl(var(--primary))]" />
                    Identidade mais forte
                  </span>
                  <span className="public-page-pill">
                    <Smartphone className="w-4 h-4 text-[hsl(var(--primary))]" />
                    Conteúdo para divulgar
                  </span>
                </div>
              </div>

              <motion.div variants={imageMotion} className="public-page-highlight-card p-3">
                <div className="relative overflow-hidden rounded-[1.4rem] border border-white/10">
                  <img
                    src={marketingImg}
                    alt="Exemplos visuais da Área do Marketing da NovaesWeb"
                    className="w-full h-auto object-cover"
                    width={640}
                    height={640}
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <div className="absolute left-4 right-4 bottom-4">
                    <p className="text-sm text-white font-semibold leading-relaxed">
                      Alguns exemplos reais do que a NovaesWeb pode criar para deixar um negócio mais forte visualmente.
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          <motion.div
            initial="hidden"
            animate="show"
            variants={{ show: { transition: { staggerChildren: 0.08 } } }}
            className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-10"
          >
            {marketingMetrics.map((metric) => (
              <motion.div key={metric.label} variants={fadeUp} className="public-page-stat-card">
                <span className="public-page-stat-value site-gradient-text">{metric.value}</span>
                <p className="text-xs uppercase tracking-[0.18em] font-bold text-white/40">{metric.label}</p>
              </motion.div>
            ))}
          </motion.div>

          <motion.div variants={fadeUp} initial="hidden" animate="show" className="public-page-section-card mb-10">
            <div className="flex items-center gap-3 mb-4">
              <LayoutGrid className="w-5 h-5 text-[hsl(var(--primary))]" />
              <p className="text-sm font-bold text-white">A Área do Marketing funciona como extensão premium do seu projeto digital.</p>
            </div>
            <p className="site-copy-muted leading-relaxed">
              Em vez de separar site, apresentação e divulgação, a NovaesWeb conecta tudo numa estrutura visual mais coerente.
              O resultado é uma marca mais forte para vender, anunciar e aparecer com mais autoridade.
            </p>
          </motion.div>

          <section className="public-page-section">
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} className="public-page-section-card">
              <div className="text-center max-w-3xl mx-auto mb-8">
                <span className="site-badge site-badge--primary mb-5">
                  <Target className="w-3.5 h-3.5" />
                  Estrutura de entrega
                </span>
                <h2 className="public-page-section-title">
                  O que a <span className="site-gradient-text">Área do Marketing</span> pode incluir
                </h2>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
                {tabs.map((tab) => (
                  <motion.button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    whileHover={{ y: -2, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`public-page-pill ${activeTab === tab.id ? "hero-service-chip--active" : ""}`}
                  >
                    <tab.icon className="w-4 h-4 text-[hsl(var(--primary))]" />
                    {tab.label}
                  </motion.button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeService.id}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -14 }}
                  transition={{ duration: 0.25 }}
                  className="public-page-proof-card"
                >
                  <div className="flex items-start gap-4 mb-5">
                    <div className="w-12 h-12 rounded-[1rem] flex items-center justify-center bg-[linear-gradient(135deg,rgba(220,38,38,0.92),rgba(107,33,168,0.88),rgba(236,72,153,0.88))] shadow-[0_16px_40px_rgba(236,72,153,0.15)]">
                      <activeService.icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-white tracking-tight">{activeService.label}</h3>
                      <p className="site-copy-muted text-sm leading-relaxed mt-2">{activeService.description}</p>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {activeService.items.map((item) => (
                      <div key={item} className="public-page-proof-card flex items-center gap-3 p-4">
                        <Check className="w-4 h-4 shrink-0 text-[hsl(var(--primary))]" />
                        <span className="text-sm site-copy-muted">{item}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </section>

          <section className="public-page-section">
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} className="public-page-section-card">
              <div className="flex items-center gap-3 mb-6">
                <Target className="w-6 h-6 text-[hsl(var(--primary))]" />
                <h2 className="public-page-section-title">Benefícios para o seu negócio</h2>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {benefits.map((benefit) => (
                  <div key={benefit.text} className="public-page-proof-card flex items-center gap-3">
                    <benefit.icon className="w-4 h-4 shrink-0 text-[hsl(var(--primary))]" />
                    <span className="text-sm site-copy-muted">{benefit.text}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </section>

          <section className="public-page-section">
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} className="public-page-section-card text-center">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Lightbulb className="w-6 h-6 text-[hsl(var(--accent))]" />
                <h2 className="public-page-section-title">Diferencial NovaesWeb</h2>
              </div>
              <p className="public-page-description mx-auto mb-8">
                Enquanto muitas empresas entregam só a parte visual, a NovaesWeb conecta comunicação, site, estrutura digital e organização operacional.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-4">
                {differentials.map((item) => (
                  <div key={item.label} className="public-page-pill">
                    <item.icon className="w-4 h-4 text-[hsl(var(--primary))]" />
                    {item.label}
                  </div>
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
                Quer aplicar esta <span className="site-gradient-text">estrutura visual</span> ao seu negócio?
              </h2>
              <p className="public-page-description mt-5 mx-auto">
                Fale com a NovaesWeb e veja como a Área do Marketing pode complementar o site, os pedidos, o atendimento e o posicionamento da sua marca.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <a
                  href={buildWhatsAppUrl("Olá! Quero saber mais sobre a Área do Marketing da NovaesWeb.")}
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
                    Falar no WhatsApp
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
