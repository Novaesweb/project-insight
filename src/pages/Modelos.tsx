import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, MessageCircle, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

import SEOHead from "@/components/SEOHead";
import PublicDemoGrid from "@/components/site/PublicDemoGrid";
import PublicPageLayout from "@/components/site/PublicPageLayout";
import { Button } from "@/components/ui/button";
import { usePublicContact } from "@/hooks/usePublicContact";
import { PUBLIC_DEMO_SITES } from "@/lib/public-demo-sites";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const stats = [
  { value: `${PUBLIC_DEMO_SITES.length}+`, label: "Modelos publicados" },
  { value: "100%", label: "Personalizaveis" },
  { value: "24h", label: "Ritmo inicial de resposta" },
];

export default function Modelos() {
  const { buildWhatsAppUrl } = usePublicContact();

  return (
    <PublicPageLayout>
      <SEOHead
        title="Modelos de Sites | NovaesWeb"
        description="Veja todos os modelos de sites e cardapios digitais da NovaesWeb para diferentes tipos de negocios."
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
                  Nossos Modelos
                </span>
                <h1 className="public-page-title">
                  Todos os modelos
                  <br />
                  <span className="site-gradient-text">em uma pagina so</span>
                </h1>
                <p className="public-page-description mt-6">
                  Aqui voce encontra todos os sites e cardapios digitais que usamos como
                  referencia comercial. Cada modelo pode ser adaptado com o nome, as
                  cores e as informacoes do seu negocio.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <span className="public-page-pill">Site vitrine premium</span>
                  <span className="public-page-pill">Cardapio para delivery</span>
                  <span className="public-page-pill">Layout com identidade propria</span>
                </div>
              </div>

              <div className="public-page-highlight-grid">
                <div className="public-page-highlight-card">
                  <p className="text-[10px] uppercase tracking-[0.22em] font-black text-white/45 mb-2">
                    Escolha visual
                  </p>
                  <p className="text-lg font-black text-white leading-tight">
                    Use um modelo como base e leve a estrutura para a sua marca.
                  </p>
                  <p className="text-sm site-copy-soft mt-3">
                    O objetivo aqui e facilitar a decisao, mostrar possibilidades e acelerar o
                    seu orçamento.
                  </p>
                </div>
                <div className="public-page-highlight-card">
                  <p className="text-[10px] uppercase tracking-[0.22em] font-black text-white/45 mb-2">
                    Personalizacao
                  </p>
                  <p className="text-lg font-black text-white leading-tight">
                    Nenhum modelo precisa ficar generico.
                  </p>
                  <p className="text-sm site-copy-soft mt-3">
                    A NovaesWeb ajusta o visual, o conteudo e o fluxo para combinar com o seu
                    nicho e com a forma como voce vende.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial="hidden"
            animate="show"
            variants={{ show: { transition: { staggerChildren: 0.08 } } }}
            className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-3"
          >
            {stats.map((stat) => (
              <motion.div key={stat.label} variants={fadeUp} className="public-page-stat-card">
                <span className="public-page-stat-value site-gradient-text">{stat.value}</span>
                <p className="text-xs uppercase tracking-[0.18em] font-bold text-white/40">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </motion.div>

          <PublicDemoGrid />

          <section className="public-page-section">
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} className="public-page-cta-card text-center">
              <span className="site-badge site-badge--accent mb-6">
                <MessageCircle className="w-3.5 h-3.5" />
                Proximo passo
              </span>
              <h2 className="public-page-section-title">
                Viu um estilo que combina com o seu <span className="site-gradient-text">negocio</span>?
              </h2>
              <p className="public-page-description mt-5 mx-auto">
                Fale com a NovaesWeb e diga qual modelo te chamou mais atencao. A partir
                disso, a gente ajusta a estrutura para o seu projeto.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <a
                  href={buildWhatsAppUrl("Ola! Vi a pagina de modelos da NovaesWeb e quero falar sobre um projeto parecido com um dos demos.")}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    className="h-12 px-8 rounded-2xl text-white font-bold border-0"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(220,38,38,0.92), rgba(107,33,168,0.9), rgba(236,72,153,0.88))",
                      boxShadow: "0 18px 42px rgba(236,72,153,0.16)",
                    }}
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Falar sobre um modelo
                  </Button>
                </a>
                <Link to="/cadastro">
                  <Button variant="outline" className="h-12 px-8 rounded-2xl border-[hsl(var(--border))] text-white hover:border-[hsl(var(--primary))]">
                    <ArrowRight className="w-4 h-4 mr-2" />
                    Solicitar orcamento
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
