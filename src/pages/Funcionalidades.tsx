import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  Box,
  Layers,
  MessageCircle,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  TrendingUp,
  Zap,
} from "lucide-react";

import SEOHead from "@/components/SEOHead";
import PublicPageLayout from "@/components/site/PublicPageLayout";
import { PublicPageBackLink, PublicPageFinalCta, PublicPageStatGrid } from "@/components/site/PublicPageBlocks";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { usePublicContact } from "@/hooks/usePublicContact";

type ExtraRecord = {
  id: string;
  nome: string;
  descricao: string;
  categoria: string;
  subcategoria?: string | null;
};

const normalizeLabel = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const iconMap: Record<string, React.ReactNode> = {
  "botao whatsapp": <MessageCircle className="w-5 h-5" />,
  "seo de elite": <Search className="w-5 h-5" />,
  "checkout direto": <ShoppingBag className="w-5 h-5" />,
  "painel business": <Layers className="w-5 h-5" />,
  "ultra speed": <Zap className="w-5 h-5" />,
  "fidelidade pontos": <Star className="w-5 h-5" />,
  "crm integrado": <ShieldCheck className="w-5 h-5" />,
  cashback: <TrendingUp className="w-5 h-5" />,
  "area vip": <ShieldCheck className="w-5 h-5" />,
  "cupom desconto": <Zap className="w-5 h-5" />,
  "popup promocao": <MessageCircle className="w-5 h-5" />,
  "banner promocoes": <Layers className="w-5 h-5" />,
  default: <Box className="w-5 h-5" />,
};

const explanationMap: Record<string, string> = {
  "popup promocao": "Cria janelas de oferta para acionar urgencia e melhorar a chance de clique no momento certo.",
  "cupom desconto": "Ajuda a ativar campanhas, rastrear respostas e gerar incentivo comercial sem perder controle.",
  cashback: "Mantem o cliente voltando para comprar de novo com um motivo claro e facil de entender.",
  "area vip": "Permite criar uma camada de exclusividade para clientes recorrentes e operacoes mais premium.",
  "fidelidade pontos": "Transforma consumo recorrente em vantagem acumulada, reforcando repeticao e valor percebido.",
  "banner promocoes": "Destaca ofertas principais logo no topo da experiencia para dar foco no que voce quer empurrar agora.",
};

const priorityNames = [
  "cashback",
  "area vip",
  "cupom desconto",
  "fidelidade pontos",
  "popup promocao",
  "banner promocoes",
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const stagger = { show: { transition: { staggerChildren: 0.1 } } };

const categoryLabelMap: Record<string, string> = {
  fixo: "Ativacao",
  intermediario: "Pro",
  mensal: "Recorrencia",
};

export default function Funcionalidades() {
  const [extras, setExtras] = useState<ExtraRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [explainingId, setExplainingId] = useState<string | null>(null);
  const { buildWhatsAppUrl } = usePublicContact();

  useEffect(() => {
    supabase
      .from("extras_catalogo")
      .select("id, nome, descricao, categoria, subcategoria")
      .eq("status", "ativo")
      .then(({ data }) => {
        const normalized =
          (data as ExtraRecord[] | null)?.sort((a, b) => {
            const normalizedA = normalizeLabel(a.nome);
            const normalizedB = normalizeLabel(b.nome);
            const indexA = priorityNames.indexOf(normalizedA);
            const indexB = priorityNames.indexOf(normalizedB);

            if (indexA !== -1 && indexB !== -1) return indexA - indexB;
            if (indexA !== -1) return -1;
            if (indexB !== -1) return 1;
            return a.nome.localeCompare(b.nome);
          }) ?? [];

        setExtras(normalized.slice(0, 6));
        setLoading(false);
      });
  }, []);

  const recurringCount = useMemo(
    () => extras.filter((item) => item.categoria === "mensal").length.toString(),
    [extras]
  );

  const strategicCount = useMemo(
    () => extras.filter((item) => item.categoria === "intermediario").length.toString(),
    [extras]
  );

  return (
    <PublicPageLayout>
      <SEOHead
        title="Funcionalidades e modulos | NovaesWeb"
        description="Veja alguns dos modulos estrategicos da NovaesWeb para estruturar venda, fidelizacao, contato e operacao digital."
      />

      <section className="public-page-shell">
        <div className="public-page-container">
          <PublicPageBackLink label="Voltar ao site" />

          <motion.div initial="hidden" animate="show" variants={fadeUp} className="public-page-hero mb-10">
            <div className="public-page-hero-grid">
              <div>
                <span className="site-badge site-badge--accent mb-6">
                  <Sparkles className="w-3.5 h-3.5" />
                  Modulos estrategicos
                </span>
                <h1 className="public-page-title">
                  Recursos para vender, fidelizar e operar com uma
                  <span className="site-gradient-text"> base mais inteligente</span>
                </h1>
                <p className="public-page-description mt-6">
                  A NovaesWeb trabalha por camadas. Primeiro a estrutura principal. Depois os modulos entram para dar
                  mais leitura comercial, mais retorno de cliente e mais controle operacional.
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  {["Cashback", "Area VIP", "Cupom desconto"].map((item) => (
                    <span key={item} className="public-page-pill">
                      <BadgeCheck className="w-4 h-4 text-[hsl(var(--primary))]" />
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div className="public-page-highlight-grid">
                <div className="public-page-highlight-card">
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/45 mb-2">Leitura premium</p>
                  <p className="text-lg font-black leading-tight text-white/94">
                    Modulos pensados como camadas de negocio, nao como lista tecnica perdida.
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-white/60">
                    Cada recurso entra para reforcar conversao, recorrencia ou clareza na operacao.
                  </p>
                </div>
                <div className="public-page-highlight-card">
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/45 mb-2">Crescimento modular</p>
                  <p className="text-lg font-black leading-tight text-white/94">
                    Voce comeca certo e expande sem precisar reconstruir tudo depois.
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-white/60">
                    O projeto nasce preparado para receber novas frentes conforme o momento da empresa.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          <PublicPageStatGrid
            className="mb-10"
            items={[
              { value: `${extras.length}`, label: "modulos em destaque" },
              { value: recurringCount, label: "camadas recorrentes" },
              { value: strategicCount, label: "frentes pro para escalar" },
            ]}
          />

          <motion.div initial="hidden" animate="show" variants={fadeUp} className="public-page-section-card mb-10">
            <div className="flex items-center gap-3 mb-4">
              <Layers className="w-5 h-5 text-[hsl(var(--primary))]" />
              <p className="text-sm font-bold text-white">
                Estes modulos entram para deixar a estrutura mais comercial, mais lucrativa e mais propria.
              </p>
            </div>
            <p className="site-copy-muted leading-relaxed">
              Em vez de parecer uma lista de extras, eles funcionam como decisao de posicionamento: o que reforca venda,
              o que melhora recorrencia e o que cria mais controle no dia a dia.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            animate="show"
            variants={stagger}
            className="grid gap-5 md:grid-cols-2 xl:grid-cols-3"
          >
            {loading
              ? [1, 2, 3, 4, 5, 6].map((item) => (
                  <div key={item} className="public-page-proof-card min-h-[320px] animate-pulse" />
                ))
              : extras.map((item) => {
                  const isOpen = explainingId === item.id;
                  const categoryLabel = categoryLabelMap[item.categoria] ?? "Modulo";
                  const normalizedName = normalizeLabel(item.nome);

                  return (
                    <motion.div
                      key={item.id}
                      variants={fadeUp}
                      className="public-page-proof-card min-h-[320px] overflow-hidden"
                    >
                      <AnimatePresence mode="wait">
                        {isOpen ? (
                          <motion.div
                            key="explanation"
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -16 }}
                            transition={{ duration: 0.24 }}
                            className="flex h-full flex-col justify-between gap-6"
                          >
                            <div>
                              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/42">
                                Porque este modulo importa
                              </p>
                              <h3 className="mt-3 text-xl font-black tracking-tight text-white/94">{item.nome}</h3>
                              <p className="mt-4 text-sm leading-relaxed text-white/64">
                                {explanationMap[normalizedName] || item.descricao}
                              </p>
                            </div>

                            <button
                              onClick={() => setExplainingId(null)}
                              className="text-left text-[10px] font-black uppercase tracking-[0.22em] text-white/54 hover:text-white"
                            >
                              Voltar ao card
                            </button>
                          </motion.div>
                        ) : (
                          <motion.div
                            key="main"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex h-full flex-col"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-white/82">
                                {iconMap[normalizedName] || iconMap.default}
                              </div>
                              <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-white/48">
                                {categoryLabel}
                              </span>
                            </div>

                            <div className="mt-6">
                              <h3 className="text-xl font-black tracking-tight text-white/94">{item.nome}</h3>
                              <p className="mt-3 text-sm leading-relaxed text-white/60">{item.descricao}</p>
                            </div>

                            <div className="mt-auto pt-6">
                              <button
                                onClick={() => setExplainingId(item.id)}
                                className="text-[10px] font-black uppercase tracking-[0.22em] text-white/58 hover:text-white"
                              >
                                Entender o impacto
                              </button>

                              <div className="mt-5 flex items-center justify-between border-t border-white/6 pt-5">
                                <span className="text-[10px] font-black uppercase tracking-[0.18em] text-white/32">
                                  {item.subcategoria || "Estrutura NovaesWeb"}
                                </span>
                                <a
                                  href={buildWhatsAppUrl(
                                    `Ola! Vi a funcionalidade "${item.nome}" e quero entender como ela entraria no meu projeto.`
                                  )}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <Button className="site-soft-surface h-10 rounded-xl px-4 text-[11px] font-black uppercase tracking-[0.14em] text-white/84">
                                    Contratar
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                  </Button>
                                </a>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
          </motion.div>

          <PublicPageFinalCta
            className="mt-10"
            eyebrow="Planejar a proxima camada"
            title="Quer descobrir quais modulos fazem sentido para o seu negocio?"
            description="A NovaesWeb indica o que realmente agrega para o seu momento e monta a combinacao certa sem empilhar recurso inutil."
            primaryHref="/cadastro"
            primaryLabel="Solicitar diagnostico"
            secondaryHref={buildWhatsAppUrl("Ola! Quero entender quais modulos da NovaesWeb fazem mais sentido para o meu projeto.")}
            secondaryLabel="Falar no WhatsApp"
          />
        </div>
      </section>
    </PublicPageLayout>
  );
}
