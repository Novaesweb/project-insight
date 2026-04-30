import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Bot, BriefcaseBusiness, LayoutDashboard, MessageCircle, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

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
  const [activeIndex, setActiveIndex] = useState(0);
  return (
    <motion.section
      id="o-que-fazemos"
      className="site-band px-4 sm:px-6 py-20 lg:py-24"
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-100px" }}
      variants={stagger}
    >
      <div className="max-w-7xl mx-auto">
        <motion.div variants={fade} className="max-w-3xl">
          <span className="site-badge site-badge--accent">Solucoes NovaesWeb</span>
          <h2 className="mt-8 text-[clamp(2rem,7vw,3.75rem)] font-black tracking-tighter text-white/90 leading-[0.92]">
            Uma estrutura mais enxuta no layout,
            <span className="site-gradient-text"> mais forte na percepcao.</span>
          </h2>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed site-copy-muted">
            Em vez de empilhar ferramentas soltas, a NovaesWeb organiza marca, captação e operação em um mesmo
            ecossistema. O objetivo é parecer mais profissional e trabalhar com mais fluidez.
          </p>
        </motion.div>

        <div className="mt-12 grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
          <motion.div variants={fade} className="grid gap-4">
            {solutions.map((solution, index) => {
              const isActive = activeIndex === index;
              return (
                <motion.div 
                  key={solution.title}
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.4 }}
                  className={cn(
                    "site-surface rounded-[2rem] overflow-hidden transition-all duration-400 cursor-pointer border group",
                    isActive 
                      ? "border-primary/40 shadow-[0_0_40px_rgba(236,72,153,0.15)] scale-[1.01]" 
                      : "border-white/8 hover:border-white/20 hover:shadow-[0_8px_24px_rgba(0,0,0,0.4)]"
                  )}
                  onClick={() => setActiveIndex(index)}
                  whileHover={{ y: isActive ? 0 : -2 }}
                >
                    <div className="p-6 sm:p-7 flex items-center gap-5">
                    <motion.div
                      className={cn(
                        "flex h-14 w-14 items-center justify-center rounded-2xl border transition-all duration-400 flex-shrink-0",
                        isActive 
                          ? "border-primary/50 bg-primary/25 shadow-[0_0_24px_rgba(236,72,153,0.2)]" 
                          : "border-white/15 bg-white/[0.05] group-hover:border-white/25 group-hover:bg-white/[0.08]"
                      )}
                      animate={isActive ? { scale: [1, 1.1, 1], rotate: [0, 5, 0] } : {}}
                      transition={{ duration: 0.6, ease: "easeInOut" }}
                      style={!isActive ? { background: "linear-gradient(135deg, rgba(220,38,38,0.14), rgba(107,33,168,0.14), rgba(236,72,153,0.1))" } : {}}
                    >
                      <motion.div
                        animate={isActive ? { y: [0, -2, 0] } : {}}
                        transition={{ duration: 0.6, ease: "easeInOut" }}
                      >
                        <solution.icon className={cn("h-6 w-6 transition-colors duration-300", isActive ? "text-white" : "text-white/72 group-hover:text-white/88")} />
                      </motion.div>
                    </motion.div>
                    <h3 className={cn("text-lg font-black tracking-tight transition-colors duration-300 flex-1", isActive ? "text-white" : "text-white/72 group-hover:text-white/88")}>
                      {solution.title}
                    </h3>
                    <motion.div
                      animate={isActive ? { x: 4 } : {}}
                      transition={{ duration: 0.3 }}
                    >
                      <ArrowRight className={cn("h-5 w-5 transition-colors duration-300", isActive ? "text-primary" : "text-white/30")} />
                    </motion.div>
                  </div>
                  
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                      >
                          <div className="px-5 pb-5 pt-0 sm:px-6 sm:pb-6">
                          <p className="text-sm leading-relaxed site-copy-muted">{solution.description}</p>
                          <p className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-emerald-400/90">
                            <ArrowRight className="w-3 h-3" />
                            {solution.result}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </motion.div>

          <motion.div 
            variants={fade}
            className="site-surface rounded-[2.2rem] p-6 sm:p-8 border border-white/[0.1] sticky top-32"
            style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(236,72,153,0.02))" }}
          >
            <motion.div 
              className="site-badge site-badge--primary mb-6"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              <Sparkles className="h-3.5 w-3.5" />
              O que muda
            </motion.div>

            <motion.h3 
              className="text-2xl font-black tracking-tight text-white/94"
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.4 }}
            >
              Menos "site isolado", mais empresa organizada.
            </motion.h3>
            <motion.p 
              className="mt-4 text-sm leading-relaxed text-white/68"
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
            >
              A entrega cresce com painel, contratos, extras e automação conforme seu ritmo.
            </motion.p>

            <div className="mt-7 space-y-3">
              {[
                "Proposta comercial clara desde o primeiro contato",
                "Menos ruído entre lead, cliente e operação",
                "Base pronta para crescer por módulos",
              ].map((item, idx) => (
                <motion.div 
                  key={item} 
                  className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-3.5 backdrop-blur-sm hover:border-white/[0.15] hover:bg-white/[0.06] transition-all"
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35 + idx * 0.08, duration: 0.3 }}
                >
                  <div className="flex items-start gap-3">
                    <motion.div 
                      className="mt-1 h-2 w-2 rounded-full bg-gradient-to-r from-red-500 via-purple-500 to-pink-500 flex-shrink-0"
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ duration: 2, repeat: Infinity, delay: idx * 0.2 }}
                    />
                    <p className="text-sm leading-relaxed text-white/74">{item}</p>
                  </div>
                </motion.div>
              ))}
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

            <motion.div 
              className="mt-8 flex flex-col gap-3 sm:flex-row"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.4 }}
            >
              <motion.div
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="relative group w-full sm:w-auto"
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-red-600 via-purple-600 to-pink-600 rounded-2xl blur-sm opacity-35 group-hover:opacity-55 transition-opacity" />
                <a
                  href="#planos"
                  className="relative inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl border border-white/10 px-7 py-3 text-xs font-black uppercase tracking-[0.18em] text-white shadow-[0_18px_42px_rgba(236,72,153,0.16)]"
                  style={{ background: "linear-gradient(135deg, rgba(220,38,38,0.94), rgba(107,33,168,0.92), rgba(236,72,153,0.9))" }}
                >
                  Ver estruturas
                  <ArrowRight className="h-4 w-4" />
                </a>
              </motion.div>
              <motion.button
                onClick={onOpenDemo}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="site-soft-surface inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl px-7 py-3 text-xs font-black uppercase tracking-[0.18em] text-white/82 transition-all hover:text-white hover:shadow-[0_12px_32px_rgba(255,255,255,0.08)]"
              >
                <MessageCircle className="h-4 w-4" />
                Demonstração
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}
