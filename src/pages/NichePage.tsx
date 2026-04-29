import { useState } from "react";
import { ChevronDown, CheckCircle2, Layers3, MessageCircle, Sparkles, Target } from "lucide-react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";

import SEOHead from "@/components/SEOHead";
import PublicPageLayout from "@/components/site/PublicPageLayout";
import { PublicPageBackLink, PublicPageFinalCta, PublicPageStatGrid } from "@/components/site/PublicPageBlocks";
import { Button } from "@/components/ui/button";
import { usePublicContact } from "@/hooks/usePublicContact";
import { nicheData } from "@/lib/niche-data";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const stagger = { show: { transition: { staggerChildren: 0.1 } } };

const deliveryPillars = [
  {
    title: "Visual mais forte para o segmento",
    description: "A proposta e a hierarquia do site nascem pensando no jeito como esse nicho vende.",
  },
  {
    title: "Fluxo de contato mais direto",
    description: "Tudo fica desenhado para facilitar pedido, orcamento ou conversa qualificada no WhatsApp.",
  },
  {
    title: "Base pronta para crescer",
    description: "A estrutura pode evoluir depois com painel, extras, contratos e outras camadas da operacao.",
  },
];

export default function NichePage() {
  const { slug } = useParams();
  const niche = nicheData.find((item) => item.slug === slug);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const { buildWhatsAppUrl } = usePublicContact();

  if (!niche) {
    return (
      <PublicPageLayout>
        <section className="public-page-shell">
          <div className="public-page-container">
            <PublicPageBackLink to="/nichos" label="Voltar aos nichos" />
            <div className="public-page-section-card text-center">
              <span className="site-badge site-badge--accent mb-5">Pagina nao encontrada</span>
              <h1 className="public-page-section-title">Nao encontramos este nicho.</h1>
              <p className="public-page-description mt-4 mx-auto">
                Volte para a lista de segmentos e veja outras estruturas que a NovaesWeb ja desenhou.
              </p>
            </div>
          </div>
        </section>
      </PublicPageLayout>
    );
  }

  const whatsappUrl = buildWhatsAppUrl(
    `Ola! Vi a estrutura da NovaesWeb para ${niche.nome} e quero entender como ficaria para o meu negocio.`
  );

  return (
    <PublicPageLayout>
      <SEOHead
        title={`${niche.nome} | Estrutura digital da NovaesWeb`}
        description={`${niche.slogan}. ${niche.incluso.slice(0, 3).join(", ")}. Base inicial a partir de ${niche.preco}.`}
        canonicalUrl={`https://novaesweb.site/nicho/${slug}`}
      />

      <section className="public-page-shell">
        <div className="public-page-container">
          <PublicPageBackLink to="/nichos" label="Voltar aos nichos" />

          <motion.div initial="hidden" animate="show" variants={fadeUp} className="public-page-hero mb-10">
            <div className="public-page-hero-grid">
              <div>
                <span className="site-badge site-badge--primary mb-6">
                  <Sparkles className="w-3.5 h-3.5" />
                  Estrutura por nicho
                </span>
                <h1 className="public-page-title">
                  {niche.slogan}
                  <br />
                  com <span className="site-gradient-text">presenca mais forte</span>
                </h1>
                <p className="public-page-description mt-6">
                  A NovaesWeb adapta a vitrine, o fluxo de contato e os blocos de venda para o jeito como {niche.nome}
                  realmente atende, apresenta e fecha negocio.
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  {niche.items.map((item) => (
                    <span key={item} className="public-page-pill">
                      <Target className="w-4 h-4 text-[hsl(var(--primary))]" />
                      {item}
                    </span>
                  ))}
                </div>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                    <Button
                      className="h-12 w-full rounded-2xl border border-white/10 px-7 text-sm font-bold text-white shadow-[0_14px_36px_rgba(236,72,153,0.14)] sm:w-auto"
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(220,38,38,0.92), rgba(107,33,168,0.9), rgba(236,72,153,0.88))",
                      }}
                    >
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Quero esse formato
                    </Button>
                  </a>
                  <a href="#faq-nicho" className="w-full sm:w-auto">
                    <Button className="site-soft-surface h-12 w-full rounded-2xl px-7 text-sm font-bold text-white/84 sm:w-auto">
                      Ver perguntas frequentes
                    </Button>
                  </a>
                </div>
              </div>

              <div className="public-page-highlight-grid">
                <div className="public-page-highlight-card">
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/45 mb-2">Investimento inicial</p>
                  <p className="text-3xl font-black tracking-tight text-white/94">{niche.preco}</p>
                  <p className="mt-3 text-sm leading-relaxed text-white/60">
                    Ponto de partida para uma estrutura mais clara, mais forte e com espaco para crescer.
                  </p>
                </div>

                <div className="public-page-highlight-card">
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/45 mb-2">Leitura de entrega</p>
                  <p className="text-lg font-black leading-tight text-white/94">
                    Um layout pensado para vender sem parecer modelo generico.
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-white/60">
                    O desenho da experiencia acompanha o comportamento do cliente final desse segmento.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          <PublicPageStatGrid
            className="mb-10"
            items={[
              { value: `${niche.incluso.length}+`, label: "elementos incluidos" },
              { value: `${niche.faq.length}`, label: "duvidas mapeadas" },
              { value: "1", label: "estrutura pensada para o nicho" },
            ]}
          />

          <section className="public-page-section">
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger} className="public-page-section-card">
              <div className="text-center max-w-3xl mx-auto mb-8">
                <span className="site-badge site-badge--accent mb-5">
                  <Layers3 className="w-3.5 h-3.5" />
                  O que entra nesta estrutura
                </span>
                <h2 className="public-page-section-title">
                  A base ja nasce com <span className="site-gradient-text">mais clareza comercial</span>
                </h2>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {niche.incluso.map((item) => (
                  <motion.div key={item} variants={fadeUp} className="public-page-proof-card flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-[hsl(var(--primary))]" />
                    <span className="text-sm leading-relaxed text-white/72">{item}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </section>

          <section className="public-page-section">
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger} className="public-page-section-card">
              <div className="text-center max-w-3xl mx-auto mb-8">
                <span className="site-badge site-badge--primary mb-5">O que realmente muda</span>
                <h2 className="public-page-section-title">
                  Menos improviso, mais <span className="site-gradient-text">autoridade percebida</span>
                </h2>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {deliveryPillars.map((pillar) => (
                  <motion.div key={pillar.title} variants={fadeUp} className="public-page-proof-card">
                    <h3 className="text-lg font-black tracking-tight text-white/94">{pillar.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-white/60">{pillar.description}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </section>

          <section id="faq-nicho" className="public-page-section">
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger} className="public-page-section-card">
              <div className="text-center max-w-3xl mx-auto mb-8">
                <span className="site-badge site-badge--accent mb-5">Perguntas frequentes</span>
                <h2 className="public-page-section-title">
                  O que costuma surgir antes de <span className="site-gradient-text">fechar um projeto</span>
                </h2>
              </div>

              <div className="space-y-3">
                {niche.faq.map((item, index) => {
                  const isOpen = openFaq === index;

                  return (
                    <motion.div key={item.q} variants={fadeUp} className="public-page-proof-card p-0 overflow-hidden">
                      <button
                        onClick={() => setOpenFaq(isOpen ? null : index)}
                        className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left"
                      >
                        <span className="text-base font-black tracking-tight text-white/92">{item.q}</span>
                        <ChevronDown
                          className={`h-4 w-4 shrink-0 text-white/48 transition-transform ${isOpen ? "rotate-180" : ""}`}
                        />
                      </button>
                      {isOpen ? (
                        <div className="border-t border-white/6 px-5 pb-5 pt-4">
                          <p className="text-sm leading-relaxed text-white/62">{item.a}</p>
                        </div>
                      ) : null}
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </section>

          <PublicPageFinalCta
            eyebrow="Fechar o proximo passo"
            title={`Quer uma estrutura assim para ${niche.nome}?`}
            description="A NovaesWeb monta o desenho ideal para o seu nicho e mostra como site, contato e operacao podem trabalhar juntos desde o inicio."
            primaryHref="/cadastro"
            primaryLabel="Solicitar orcamento"
            secondaryHref={whatsappUrl}
            secondaryLabel="Falar no WhatsApp"
          />
        </div>
      </section>
    </PublicPageLayout>
  );
}
