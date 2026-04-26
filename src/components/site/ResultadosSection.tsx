import { motion } from "framer-motion";
import { ArrowUpRight, BadgeCheck, BriefcaseBusiness, LayoutDashboard, MessageCircleMore } from "lucide-react";

import { AnimatedTestimonials } from "@/components/ui/animated-testimonials";
import { useAnimatedCounter } from "@/hooks/useAnimatedCounter";
import { useCompanyCounter } from "@/hooks/useCompanyCounter";

const fade = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45 } },
};

const stagger = { show: { transition: { staggerChildren: 0.1 } } };

const proofCards = [
  {
    title: "Mais clareza no comercial",
    description: "Empresas que precisavam apresentar melhor a oferta, organizar proposta e conduzir o contato com mais confiança.",
    icon: BriefcaseBusiness,
  },
  {
    title: "Mais leitura de operação",
    description: "Marcas que saíram de páginas soltas para uma base com painel, histórico, módulos e acompanhamento real.",
    icon: LayoutDashboard,
  },
  {
    title: "Mais conversa pronta para fechar",
    description: "Fluxo mais rápido entre descoberta, WhatsApp e continuidade do atendimento, sem depender só de improviso.",
    icon: MessageCircleMore,
  },
];

const testimonials = [
  {
    description:
      "A entrega elevou a percepção da marca. O cliente entra no site e já entende melhor o nosso posicionamento antes de chamar no WhatsApp.",
    image: "",
    name: "Mariana Souza",
    handle: "Clinica de estetica",
  },
  {
    description:
      "O que mais mudou foi a organização. Deixou de ser só uma página e virou uma estrutura mais séria para apresentar serviços e acompanhar o comercial.",
    image: "",
    name: "Lucas Ferreira",
    handle: "Operacao local de servicos",
  },
  {
    description:
      "A NovaesWeb conseguiu transformar nossa presença digital em algo mais premium e mais claro para vender. A conversa já começa em outro nível.",
    image: "",
    name: "Carlos Henrique",
    handle: "Barbearia premium",
  },
];

export default function ResultadosSection() {
  const companyCount = useCompanyCounter();
  const bases = useAnimatedCounter(companyCount, 1400);
  const retorno = useAnimatedCounter(24, 900);
  const frentes = useAnimatedCounter(3, 800);

  return (
    <motion.section
      id="resultados"
      className="site-band px-6 py-20 lg:py-24"
      initial="hidden"
      whileInView="show"
      viewport={{ once: true }}
      variants={stagger}
    >
      <div className="max-w-6xl mx-auto">
        <motion.div variants={fade} className="mx-auto max-w-3xl text-center">
          <span className="site-badge site-badge--primary">Resultados e prova social</span>
          <h2 className="mt-8 text-4xl sm:text-6xl font-black tracking-tighter text-white/90 leading-[0.92]">
            Mais que um visual bonito.
            <span className="site-gradient-text"> Uma estrutura que eleva a percepção da marca.</span>
          </h2>
          <p className="mt-6 text-lg leading-relaxed site-copy-muted">
            Quando a empresa parece organizada, o atendimento ganha mais força. Por isso a NovaesWeb trabalha imagem,
            processo e captação como uma mesma experiência.
          </p>
        </motion.div>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {[
            { ref: bases.ref, count: bases.count, suffix: "+", label: "bases entregues" },
            { ref: frentes.ref, count: frentes.count, suffix: "", label: "frentes alinhadas" },
            { ref: retorno.ref, count: retorno.count, suffix: "h", label: "retorno consultivo" },
          ].map((stat) => (
            <motion.div key={stat.label} ref={stat.ref} variants={fade} className="public-page-stat-card text-left">
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-white/40">{stat.label}</p>
              <p className="mt-4 flex items-end gap-2 text-4xl font-black tracking-tight text-white/92">
                {stat.count}
                <span className="site-gradient-text">{stat.suffix}</span>
              </p>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          {proofCards.map((card) => (
            <motion.div key={card.title} variants={fade} className="site-surface rounded-[1.8rem] p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
                  <card.icon className="h-5 w-5 text-white/82" />
                </div>
                <ArrowUpRight className="h-4 w-4 text-white/32" />
              </div>
              <h3 className="mt-5 text-lg font-black tracking-tight text-white/92">{card.title}</h3>
              <p className="mt-3 text-sm leading-relaxed site-copy-muted">{card.description}</p>
            </motion.div>
          ))}
        </div>

        <motion.div variants={fade} className="mt-8 public-page-section-card">
          <div className="flex items-center gap-2 mb-4">
            <BadgeCheck className="h-4 w-4 text-white/72" />
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-white/40">O que costuma melhorar</p>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {[
              "Apresentação mais segura para o cliente entender o valor da empresa.",
              "Fluxo mais claro entre descoberta, atendimento e próximos passos.",
              "Base pronta para crescer depois com contratos, extras, financeiro e portal.",
            ].map((item) => (
              <div key={item} className="public-page-highlight-card">
                <p className="text-sm leading-relaxed text-white/74">{item}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div variants={fade} className="mt-10">
          <AnimatedTestimonials data={testimonials} />
        </motion.div>
      </div>
    </motion.section>
  );
}
