import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, MessageCircle, Camera, Smartphone, Target, Lightbulb, Monitor, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePublicContact } from "@/hooks/usePublicContact";
import SEOHead from "@/components/SEOHead";
import { memo } from "react";
import marketingImg from "@/assets/marketing-social-novaesweb.jpg";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const stagger = { show: { transition: { staggerChildren: 0.12 } } };

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

const services = [
  {
    icon: Camera,
    emoji: "📸",
    title: "Criação de Imagens Profissionais",
    description: "Criamos imagens personalizadas para o seu negócio, ideais para redes sociais e campanhas.",
    items: [
      "Imagens de produtos (hambúrguer, pizza, açaí, etc.)",
      "Banners promocionais",
      "Artes para Instagram",
      "Imagens com aparência profissional",
    ],
  },
  {
    icon: Smartphone,
    emoji: "📱",
    title: "Conteúdo para Redes Sociais",
    description: "Além das imagens, também criamos textos prontos para você postar.",
    items: [
      "Legendas para Instagram",
      "Textos de promoção",
      "Chamadas para venda",
      "Ideias de campanhas",
    ],
  },
];

const benefits = [
  "Mais profissionalismo nas redes sociais",
  "Mais engajamento com clientes",
  "Mais pedidos e vendas",
  "Facilidade na divulgação diária",
];

const differentials = [
  { icon: Monitor, label: "Site + Sistema" },
  { icon: Camera, label: "Imagens profissionais" },
  { icon: Smartphone, label: "Conteúdo para divulgação" },
];

export default function CriacaoConteudo() {
  const { buildWhatsAppUrl } = usePublicContact();

  return (
    <div className="public-site-unified min-h-screen scroll-smooth font-sans antialiased relative" style={{ background: 'hsl(var(--background))' }}>
      <SEOHead
        title="Criação de Imagens e Conteúdo | NovaesWeb"
        description="Imagens profissionais e conteúdo para redes sociais. A NovaesWeb entrega uma estrutura completa para divulgar seu negócio."
      />

      <GlobalBackground />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-16">
        {/* Back */}
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> Voltar ao site
        </Link>

        {/* Header */}
        <motion.div initial="hidden" animate="show" variants={fadeUp} className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[hsl(var(--primary)/0.25)] bg-[hsl(var(--primary)/0.08)] text-[hsl(var(--primary))] text-xs font-semibold mb-5">
            <Sparkles className="w-3.5 h-3.5" />
            Divulgação Profissional
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[hsl(var(--foreground))] mb-4">
            Criação de Imagens e{" "}
            <span className="site-gradient-text">Conteúdo para Divulgação</span>
          </h1>
          <p className="text-[hsl(var(--muted-foreground))] max-w-2xl mx-auto leading-relaxed">
            Na NovaesWeb, não entregamos apenas sites. Também ajudamos você a divulgar seu negócio com imagens e conteúdos profissionais prontos para uso.
          </p>
        </motion.div>

        {/* Marketing Image Banner */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" className="mb-16">
          <div className="relative rounded-2xl overflow-hidden border border-[hsl(var(--border))] shadow-2xl group">
            <img
              src={marketingImg}
              alt="NovaesWeb - Artes para Redes Sociais - Criamos conteúdo profissional para seu estabelecimento"
              className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-[1.02]"
              width={1024}
              height={1024}
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <p className="text-white/90 text-sm sm:text-base font-medium drop-shadow-lg">
                ✨ Criamos artes profissionais também para o <strong>seu estabelecimento</strong>
              </p>
            </div>
          </div>
        </motion.div>

        {/* Services */}
        <motion.div initial="hidden" animate="show" variants={stagger} className="space-y-8">
          {services.map((svc) => (
            <motion.div
              key={svc.title}
              variants={fadeUp}
              className="glass-card rounded-2xl p-6 sm:p-8 border border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/0.4)] transition-all duration-300"
            >
              <div className="flex items-start gap-4 mb-5">
                <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center text-2xl shrink-0">
                  {svc.emoji}
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-[hsl(var(--foreground))]">{svc.title}</h2>
                  <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">{svc.description}</p>
                </div>
              </div>
              <ul className="space-y-2">
                {svc.items.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-[hsl(var(--muted-foreground))]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--primary))] mt-1.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>

        {/* Benefits */}
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="mt-16">
          <div className="glass-card rounded-2xl p-6 sm:p-8 border border-[hsl(var(--border))]">
            <div className="flex items-center gap-3 mb-6">
              <Target className="w-6 h-6 text-[hsl(var(--primary))]" />
              <h2 className="text-xl sm:text-2xl font-bold text-[hsl(var(--foreground))]">Benefícios para o seu negócio</h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {benefits.map((b) => (
                <div key={b} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[hsl(var(--muted)/0.5)] border border-[hsl(var(--border))]">
                  <span className="w-2 h-2 rounded-full bg-[hsl(var(--primary))] shrink-0" />
                  <span className="text-sm text-[hsl(var(--muted-foreground))]">{b}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Diferencial */}
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="text-center mt-16 mb-8">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Lightbulb className="w-6 h-6 text-[hsl(var(--accent))]" />
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[hsl(var(--foreground))]">
              Diferencial NovaesWeb
            </h2>
          </div>
          <p className="text-[hsl(var(--muted-foreground))] max-w-lg mx-auto mb-8">
            Enquanto outras empresas criam apenas o site, a NovaesWeb entrega uma estrutura completa para você:
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            {differentials.map((d) => (
              <div key={d.label} className="flex items-center gap-2 px-5 py-3 rounded-xl glass-card border border-[hsl(var(--border))]">
                <d.icon className="w-5 h-5 text-[hsl(var(--primary))]" />
                <span className="text-sm font-semibold text-[hsl(var(--foreground))]">{d.label}</span>
              </div>
            ))}
          </div>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-4">
            Tudo pensado para gerar mais resultados.
          </p>
        </motion.div>

        {/* CTA */}
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="text-center mt-12">
          <p className="text-[hsl(var(--foreground))] font-semibold text-lg mb-2">
            👉 Quer ter tudo isso no seu negócio?
          </p>
          <p className="text-[hsl(var(--muted-foreground))] mb-6">
            Fale com a NovaesWeb e veja como aplicar agora mesmo.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href={buildWhatsAppUrl("Olá! Quero saber mais sobre criação de imagens e conteúdo.")} target="_blank" rel="noopener noreferrer">
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
      </div>
    </div>
  );
}
