import { motion } from "framer-motion";
import { ArrowRight, MessageCircleMore, ScanSearch, Wand2 } from "lucide-react";

const fade = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.45 } } };
const stagger = { show: { transition: { staggerChildren: 0.12 } } };

const steps = [
  {
    number: "01",
    title: "Leitura do momento do negocio",
    description: "Entendemos sua oferta, o nivel atual da marca e o que esta travando a conversao ou a operacao.",
    icon: ScanSearch,
  },
  {
    number: "02",
    title: "Desenho da estrutura ideal",
    description: "Indicamos a combinacao entre vitrine, painel, automacao e modulos que faz sentido para seu caso.",
    icon: Wand2,
  },
  {
    number: "03",
    title: "Entrega com acompanhamento",
    description: "A NovaesWeb coloca a base no ar e orienta os proximos passos para a estrutura continuar evoluindo.",
    icon: MessageCircleMore,
  },
];

export default function ComoFuncionaSection() {
  return (
    <motion.section
      id="como-funciona"
      className="site-band px-6 py-20 lg:py-24"
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-100px" }}
      variants={stagger}
    >
      <div className="max-w-6xl mx-auto">
        <motion.div variants={fade} className="mx-auto max-w-3xl text-center">
          <span className="site-badge site-badge--accent">Como funciona</span>
          <h2 className="mt-8 text-4xl sm:text-5xl font-black tracking-tighter text-white/90 leading-[0.95]">
            Um processo curto, consultivo e focado no que move a sua marca agora.
          </h2>
          <p className="mt-5 text-lg leading-relaxed site-copy-muted">
            Sem enrolação de agência e sem excesso de etapas. A ideia é entender o cenário, indicar a melhor estrutura
            e colocar a base certa para operar.
          </p>
        </motion.div>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {steps.map((step) => (
            <motion.div key={step.number} variants={fade} className="site-surface rounded-[1.8rem] p-6">
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
                  <step.icon className="h-5 w-5 text-white/82" />
                </div>
                <span className="text-4xl font-black tracking-tight text-white/[0.08]">{step.number}</span>
              </div>

              <h3 className="mt-6 text-xl font-black tracking-tight text-white/90">{step.title}</h3>
              <p className="mt-3 text-sm leading-relaxed site-copy-muted">{step.description}</p>
            </motion.div>
          ))}
        </div>

        <motion.div variants={fade} className="mt-10 text-center">
          <a
            href="#cadastro"
            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 px-7 py-3 text-xs font-black uppercase tracking-[0.18em] text-white shadow-[0_16px_38px_rgba(236,72,153,0.14)]"
            style={{ background: "linear-gradient(135deg, rgba(220,38,38,0.92), rgba(107,33,168,0.9), rgba(236,72,153,0.88))" }}
          >
            Solicitar diagnostico
            <ArrowRight className="h-4 w-4" />
          </a>
        </motion.div>
      </div>
    </motion.section>
  );
}
