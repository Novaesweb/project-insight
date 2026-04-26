import { motion } from "framer-motion";
import { ArrowRight, Bot, BriefcaseBusiness, LayoutDashboard, MessageCircle, Sparkles } from "lucide-react";

const fade = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };
const stagger = { show: { transition: { staggerChildren: 0.12 } } };

const solutions = [
  {
    icon: BriefcaseBusiness,
    title: "Vitrine comercial",
    description: "Um site com cara de marca premium, orientado a posicionamento, autoridade e contato qualificado.",
    result: "Mais percepção de valor na primeira visita.",
  },
  {
    icon: LayoutDashboard,
    title: "Operação em base própria",
    description: "Painel, contratos, extras, histórico e organização para a empresa operar com mais clareza.",
    result: "Menos improviso e mais controle no dia a dia.",
  },
  {
    icon: Bot,
    title: "Automação que ajuda a vender",
    description: "Fluxos, WhatsApp e etapas automáticas para o atendimento não depender só da memória da equipe.",
    result: "Conversas mais rápidas e melhores encaminhamentos.",
  },
];

interface OQueFazemosProps {
  onOpenDemo?: () => void;
}

export default function OQueFazemosSection({ onOpenDemo }: OQueFazemosProps) {
  return (
    <motion.section
      id="o-que-fazemos"
      className="site-band px-6 py-20 lg:py-24"
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-100px" }}
      variants={stagger}
    >
      <div className="max-w-7xl mx-auto">
        <motion.div variants={fade} className="max-w-3xl">
          <span className="site-badge site-badge--accent">Solucoes NovaesWeb</span>
          <h2 className="mt-8 text-4xl sm:text-6xl font-black tracking-tighter text-white/90 leading-[0.92]">
            Uma estrutura mais enxuta no layout,
            <span className="site-gradient-text"> mais forte na percepcao.</span>
          </h2>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed site-copy-muted">
            Em vez de empilhar ferramentas soltas, a NovaesWeb organiza marca, captação e operação em um mesmo
            ecossistema. O objetivo é parecer mais profissional e trabalhar com mais fluidez.
          </p>
        </motion.div>

        <div className="mt-12 grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
          <motion.div variants={fade} className="grid gap-5 md:grid-cols-3">
            {solutions.map((solution) => (
              <div key={solution.title} className="site-surface rounded-[1.8rem] p-6">
                <div
                  className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]"
                  style={{ background: "linear-gradient(135deg, rgba(220,38,38,0.12), rgba(107,33,168,0.12), rgba(236,72,153,0.08))" }}
                >
                  <solution.icon className="h-5 w-5 text-white/82" />
                </div>
                <h3 className="text-lg font-black tracking-tight text-white/90">{solution.title}</h3>
                <p className="mt-3 text-sm leading-relaxed site-copy-muted">{solution.description}</p>
                <p className="mt-5 text-xs font-black uppercase tracking-[0.18em] text-white/50">{solution.result}</p>
              </div>
            ))}
          </motion.div>

          <motion.div variants={fade} className="site-surface rounded-[1.9rem] p-6 sm:p-8">
            <div className="site-badge site-badge--primary mb-5">
              <Sparkles className="h-3.5 w-3.5" />
              O que muda na pratica
            </div>

            <h3 className="text-2xl font-black tracking-tight text-white/92">
              Menos cara de “site isolado”, mais cara de empresa organizada.
            </h3>
            <p className="mt-4 text-sm leading-relaxed text-white/64">
              A entrega não termina na página. Ela pode crescer com painel, cláusulas, contratos, extras, checkout e
              automação conforme o seu momento de operação.
            </p>

            <div className="mt-6 space-y-3">
              {[
                "Proposta comercial mais clara desde o primeiro contato",
                "Atendimento com menos ruído entre lead, cliente e operação",
                "Base pronta para crescer por módulos sem refazer tudo depois",
              ].map((item) => (
                <div key={item} className="public-page-proof-card">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 h-2.5 w-2.5 rounded-full bg-white/70" />
                    <p className="text-sm leading-relaxed text-white/72">{item}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <a
                href="#planos"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 px-6 py-3 text-xs font-black uppercase tracking-[0.16em] text-white shadow-[0_16px_38px_rgba(236,72,153,0.14)]"
                style={{ background: "linear-gradient(135deg, rgba(220,38,38,0.92), rgba(107,33,168,0.9), rgba(236,72,153,0.88))" }}
              >
                Ver estruturas
                <ArrowRight className="h-4 w-4" />
              </a>
              <button
                onClick={onOpenDemo}
                className="site-soft-surface inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3 text-xs font-black uppercase tracking-[0.16em] text-white/78 transition-all hover:text-white"
              >
                <MessageCircle className="h-4 w-4" />
                Ver demonstracao
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}
