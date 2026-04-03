import React, { memo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, MessageCircle, Utensils, Scissors, ShoppingBag, Building2, Sparkles, ArrowRight, ChevronDown, Check, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePublicContact } from "@/hooks/usePublicContact";
import SEOHead from "@/components/SEOHead";

const GlobalBackground = memo(function GlobalBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
      <div className="absolute inset-0" style={{
        background: 'linear-gradient(180deg, hsl(var(--background)), hsl(245 12% 5%))',
      }} />
      <div className="absolute inset-0 opacity-[0.012]" style={{
        backgroundImage: 'linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)',
        backgroundSize: '96px 96px',
      }} />
      <div className="absolute top-[10%] -left-[8%] w-[560px] h-[560px] rounded-full blur-[180px] opacity-[0.04]"
        style={{ background: 'radial-gradient(circle, hsl(var(--primary) / 0.32), transparent 72%)' }} />
      <div className="absolute top-[28%] -right-[10%] w-[520px] h-[520px] rounded-full blur-[170px] opacity-[0.045]"
        style={{ background: 'radial-gradient(circle, hsl(var(--accent) / 0.28), transparent 72%)' }} />
      <div className="absolute bottom-[-8%] left-[20%] w-[520px] h-[520px] rounded-full blur-[180px] opacity-[0.03]"
        style={{ background: 'radial-gradient(circle, hsl(var(--primary-novaesweb) / 0.24), transparent 74%)' }} />
    </div>
  );
});

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const segments = [
  {
    icon: Utensils,
    emoji: "🍔",
    title: "Alimentação e Delivery",
    description: "Desenvolvemos sites e sistemas completos para negócios de alimentação, com foco em pedidos e conversão.",
    niches: ["Hamburguerias", "Pizzarias", "Lanchonetes", "Açaí e sorveterias", "Restaurantes", "Sushi e culinária japonesa"],
    features: [
      "Cardápio digital profissional",
      "Pedidos direto no WhatsApp ou painel administrativo",
      "Sistema de pedidos organizado",
      "Layout otimizado para conversão",
    ],
    color: "hsl(var(--primary))",
  },
  {
    icon: Scissors,
    emoji: "💇",
    title: "Beleza e Estética",
    description: "Soluções digitais para atrair clientes e facilitar o agendamento de serviços.",
    niches: ["Salões de beleza", "Barbearias", "Clínicas estéticas"],
    features: [
      "Apresentação profissional dos serviços",
      "Sistema de agendamento",
      "Integração com WhatsApp",
      "Captação de novos clientes",
    ],
    color: "hsl(var(--accent))",
  },
  {
    icon: ShoppingBag,
    emoji: "🐾",
    title: "Comércio e Serviços",
    description: "Sites modernos para empresas que desejam profissionalizar sua presença digital.",
    niches: ["Pet shops", "Oficinas mecânicas", "Academias", "Lojas em geral"],
    features: [
      "Catálogo digital de produtos/serviços",
      "Layout profissional e moderno",
      "Facilidade de contato com clientes",
      "Estrutura escalável",
    ],
    color: "hsl(var(--primary))",
  },
  {
    icon: Building2,
    emoji: "🏢",
    title: "Empresas em Geral",
    description: "Criamos soluções personalizadas para qualquer tipo de negócio.",
    niches: [],
    features: [
      "Gerar mais clientes",
      "Aumentar o faturamento",
      "Fortalecer a marca",
      "Criar presença digital profissional",
    ],
    color: "hsl(var(--accent))",
  },
];

function SegmentCard({ seg, index, ...rest }: { seg: typeof segments[0]; index: number } & React.HTMLAttributes<HTMLDivElement>) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      variants={fadeUp}
      className="glass-card rounded-2xl border border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/0.4)] transition-all duration-300 overflow-hidden cursor-pointer group"
      onClick={() => setExpanded(!expanded)}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.995 }}
    >
      <div className="p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-start gap-4">
            <motion.div
              className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center text-2xl shrink-0"
              whileHover={{ rotate: [0, -10, 10, 0], transition: { duration: 0.5 } }}
            >
              {seg.emoji}
            </motion.div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-[hsl(var(--foreground))]">{seg.title}</h2>
              <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">{seg.description}</p>
            </div>
          </div>
          <motion.div
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.3 }}
            className="shrink-0 mt-1"
          >
            <ChevronDown className="w-5 h-5 text-[hsl(var(--muted-foreground))] group-hover:text-[hsl(var(--primary))] transition-colors" />
          </motion.div>
        </div>

        {/* Niche pills always visible */}
        {seg.niches.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {seg.niches.map((n, i) => (
              <motion.span
                key={n}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="px-3 py-1.5 rounded-full text-xs font-medium bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] border border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/0.5)] hover:text-[hsl(var(--primary))] transition-colors cursor-default"
              >
                {n}
              </motion.span>
            ))}
          </div>
        )}
      </div>

      {/* Expandable features */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-6 sm:px-8 pb-6 sm:pb-8 pt-2 border-t border-[hsl(var(--border)/0.5)]">
              <p className="text-xs font-bold text-[hsl(var(--foreground)/0.6)] uppercase tracking-wider mb-4">
                {seg.niches.length > 0 ? "✨ Funcionalidades incluídas" : "🎯 Nosso foco"}
              </p>
              <div className="grid sm:grid-cols-2 gap-3">
                {seg.features.map((f, i) => (
                  <motion.div
                    key={f}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[hsl(var(--muted)/0.5)] border border-[hsl(var(--border))] hover:bg-[hsl(var(--primary)/0.05)] transition-colors"
                  >
                    <Check className="w-4 h-4 text-[hsl(var(--primary))] shrink-0" />
                    <span className="text-sm text-[hsl(var(--muted-foreground))]">{f}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

const stats = [
  { value: "36+", label: "Sites entregues" },
  { value: "15+", label: "Segmentos atendidos" },
  { value: "98%", label: "Clientes satisfeitos" },
];

export default function Nichos() {
  const { buildWhatsAppUrl } = usePublicContact();

  return (
    <div className="public-site-unified min-h-screen scroll-smooth font-sans antialiased relative" style={{ background: 'hsl(var(--background))' }}>
      <SEOHead
        title="Nichos que Atendemos | NovaesWeb"
        description="Soluções digitais para alimentação, beleza, comércio e empresas. Conheça os segmentos que a NovaesWeb atende."
      />

      <GlobalBackground />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-16">
        {/* Back */}
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> Voltar ao site
        </Link>

        {/* Header */}
        <motion.div initial="hidden" animate="show" variants={fadeUp} className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[hsl(var(--primary)/0.25)] bg-[hsl(var(--primary)/0.08)] text-[hsl(var(--primary))] text-xs font-semibold mb-5">
            <Sparkles className="w-3.5 h-3.5" />
            Soluções por Segmento
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[hsl(var(--foreground))] mb-4">
            Soluções Digitais para{" "}
            <span className="site-gradient-text">Diferentes Tipos de Negócios</span>
          </h1>
          <p className="text-[hsl(var(--muted-foreground))] max-w-2xl mx-auto leading-relaxed">
            Na NovaesWeb, desenvolvemos estruturas digitais pensadas para gerar resultados reais.
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial="hidden"
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.1 } } }}
          className="grid grid-cols-3 gap-4 mb-12"
        >
          {stats.map((s) => (
            <motion.div
              key={s.label}
              variants={fadeUp}
              className="text-center py-6 rounded-2xl glass-card border border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/0.3)] transition-all"
              whileHover={{ y: -4 }}
            >
              <p className="text-2xl sm:text-3xl font-extrabold site-gradient-text">{s.value}</p>
              <p className="text-xs sm:text-sm text-[hsl(var(--muted-foreground))] mt-1">{s.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Interactive tip */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" className="flex items-center justify-center gap-2 mb-6 text-[hsl(var(--muted-foreground))] text-sm">
          <Zap className="w-4 h-4 text-[hsl(var(--primary))]" />
          Clique em cada segmento para ver as funcionalidades
        </motion.div>

        {/* Segments */}
        <motion.div
          initial="hidden"
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.12 } } }}
          className="space-y-6"
        >
          {segments.map((seg, i) => (
            <SegmentCard key={seg.title} seg={seg} index={i} />
          ))}
        </motion.div>

        {/* Diferencial */}
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="text-center mt-16 mb-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[hsl(var(--foreground))] mb-3">
            💡 Diferencial NovaesWeb
          </h2>
          <p className="text-[hsl(var(--muted-foreground))] max-w-lg mx-auto">
            Não criamos apenas sites. Criamos estruturas digitais pensadas para transformar visitantes em clientes.
          </p>
        </motion.div>

        {/* CTA */}
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="text-center mt-12">
          <motion.div
            className="glass-card rounded-2xl p-8 sm:p-12 border border-[hsl(var(--primary)/0.2)]"
            whileHover={{ borderColor: "hsl(var(--primary) / 0.5)" }}
          >
            <p className="text-[hsl(var(--foreground))] font-semibold text-lg mb-2">
              👉 Quer ver como ficaria um site para o seu negócio?
            </p>
            <p className="text-[hsl(var(--muted-foreground))] mb-6">
              Fale com a NovaesWeb e receba uma demonstração personalizada.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href={buildWhatsAppUrl("Olá! Quero saber mais sobre as soluções para meu segmento.")} target="_blank" rel="noopener noreferrer">
                <Button className="bg-[#25D366] hover:bg-[#20bd5a] text-white h-12 px-8 rounded-xl text-sm font-bold">
                  <MessageCircle className="w-5 h-5 mr-2" /> Falar no WhatsApp
                </Button>
              </a>
              <Link to="/">
                <Button variant="outline" className="h-12 px-8 rounded-xl border-[hsl(var(--border))] text-[hsl(var(--foreground))] hover:border-[hsl(var(--primary))] text-sm font-bold">
                  <ArrowRight className="w-4 h-4 mr-2" /> Ver planos
                </Button>
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
