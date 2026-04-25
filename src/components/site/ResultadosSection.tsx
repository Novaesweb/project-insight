import { motion } from "framer-motion";
import { BadgeCheck, Briefcase, Clock3, Layout, MessageCircleMore, ShieldCheck, Sparkles } from "lucide-react";

import { AnimatedTestimonials } from "@/components/ui/animated-testimonials";
import { useAnimatedCounter } from "@/hooks/useAnimatedCounter";
import { useCompanyCounter } from "@/hooks/useCompanyCounter";

const fade = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const stagger = { show: { transition: { staggerChildren: 0.08 } } };

const sectorChips = [
  "Restaurantes",
  "Clinicas",
  "Servicos",
  "Lojas locais",
  "Imobiliarias",
  "Operacoes digitais",
];

const caseHighlights = [
  {
    title: "Mais presenca profissional",
    description: "Empresas que queriam sair da dependencia do Instagram e apresentar a marca de um jeito mais forte.",
    icon: Briefcase,
  },
  {
    title: "Mais clareza na operacao",
    description: "Bases organizadas com painel, fluxo comercial e acompanhamento para reduzir retrabalho no dia a dia.",
    icon: Layout,
  },
  {
    title: "Mais conversas prontas para fechar",
    description: "Contato mais rapido, proposta mais clara e caminho de conversao mais objetivo no WhatsApp.",
    icon: MessageCircleMore,
  },
];

const testimonials = [
  {
    description:
      "A NovaesWeb deixou nossa apresentacao muito mais profissional. Hoje o cliente entende melhor o que oferecemos e chega para conversar com mais confianca.",
    image: "",
    name: "Mariana Souza",
    handle: "Operacao local de alimentacao",
  },
  {
    description:
      "O que mais fez diferenca foi a clareza. Antes eu tinha um site solto. Agora tenho estrutura para mostrar servicos, captar e acompanhar tudo melhor.",
    image: "",
    name: "Lucas Ferreira",
    handle: "Barbearia premium",
  },
  {
    description:
      "A entrega ficou com cara de marca organizada. Melhorou a imagem do negocio, facilitou o atendimento e deixou o processo comercial mais profissional.",
    image: "",
    name: "Carlos Henrique",
    handle: "Clinica de estetica",
  },
];

export default function ResultadosSection() {
  const companyCount = useCompanyCounter();
  const entregas = useAnimatedCounter(companyCount, 1500);
  const retorno = useAnimatedCounter(24, 1000);
  const prazo = useAnimatedCounter(7, 900);
  const frentes = useAnimatedCounter(3, 800);

  return (
    <motion.section
      id="resultados"
      className="site-band py-24 px-6 relative overflow-hidden"
      initial="hidden"
      whileInView="show"
      viewport={{ once: true }}
      variants={stagger}
    >
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-0 left-[8%] w-[420px] h-[420px] rounded-full blur-[150px] opacity-[0.03]"
          style={{ background: "radial-gradient(circle, hsl(var(--accent) / 0.35), transparent 72%)" }}
        />
      </div>

      <div className="max-w-6xl mx-auto">
        <motion.div variants={fade} className="text-center max-w-3xl mx-auto mb-16">
          <span className="site-badge site-badge--primary">Prova social que sustenta a oferta</span>
          <h2 className="text-4xl sm:text-6xl font-black text-white/90 mt-8 leading-[0.9] tracking-tighter">
            Mais que um site bonito. <br />
            <span className="site-gradient-text">Uma estrutura que passa confianca.</span>
          </h2>
          <p className="text-lg site-copy-muted mt-8 leading-relaxed max-w-2xl mx-auto font-medium">
            O cliente sente quando a marca esta bem apresentada. Por isso nossas entregas juntam posicionamento,
            organizacao e conversao em uma mesma base.
          </p>
        </motion.div>

        <motion.div variants={fade} className="public-page-section-card mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="site-badge site-badge--accent">Quem ja atendemos</span>
          </div>
          <div className="flex flex-wrap gap-3">
            {sectorChips.map((chip) => (
              <span key={chip} className="site-soft-surface rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-white/70">
                {chip}
              </span>
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
          {[
            { ref: entregas.ref, count: entregas.count, suffix: "+", label: "bases entregues", icon: BadgeCheck },
            { ref: frentes.ref, count: frentes.count, suffix: "", label: "frentes integradas", icon: Sparkles },
            { ref: prazo.ref, count: prazo.count, suffix: " dias", label: "partida media", icon: ShieldCheck },
            { ref: retorno.ref, count: retorno.count, suffix: "h", label: "retorno comercial", icon: Clock3 },
          ].map((stat) => (
            <motion.div key={stat.label} ref={stat.ref} variants={fade} className="public-page-stat-card hover:border-[hsl(var(--primary)/0.24)] transition-all info-card-hover">
              <div className="flex items-center justify-between gap-3 mb-3">
                <stat.icon className="w-4 h-4 text-white/55" />
                <p className="text-3xl font-black site-gradient-text">
                  {stat.count}
                  {stat.suffix}
                </p>
              </div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/45 font-bold">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-5 mb-14">
          {caseHighlights.map((item) => (
            <motion.div key={item.title} variants={fade} className="site-surface rounded-[1.8rem] p-6">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 bg-white/[0.03] border border-white/10">
                <item.icon className="w-5 h-5 text-white/80" />
              </div>
              <h3 className="text-lg font-black text-white/90 tracking-tight mb-3">{item.title}</h3>
              <p className="text-sm site-copy-muted leading-relaxed">{item.description}</p>
            </motion.div>
          ))}
        </div>

        <AnimatedTestimonials data={testimonials} />
      </div>
    </motion.section>
  );
}
