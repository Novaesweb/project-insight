import { motion } from "framer-motion";
import { Zap } from "lucide-react";

const fade = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };
const stagger = { show: { transition: { staggerChildren: 0.08 } } };

const steps = [
  { num: "01", titulo: "Entendimento", desc: "Reunião inicial para entender seu negócio, público-alvo, concorrentes e objetivos. Definimos juntos o escopo, funcionalidades e prazo do projeto.", detail: "Duração: 1-2 dias" },
  { num: "02", titulo: "Desenvolvimento", desc: "Criamos o layout e desenvolvemos todas as funcionalidades com design moderno, responsivo e performance otimizada. Você recebe atualizações diárias.", detail: "Duração: 3-5 dias" },
  { num: "03", titulo: "Entrega e Testes", desc: "Você testa o projeto completo, valida cada funcionalidade e solicita ajustes ilimitados até ficar 100% satisfeito com o resultado final.", detail: "Duração: 1-2 dias" },
  { num: "04", titulo: "Evolução Contínua", desc: "Após a entrega, seu projeto continua evoluindo. Novas funcionalidades, melhorias e acompanhamento contínuo conforme sua empresa cresce.", detail: "Pós-entrega" },
];

export default function ProcessoSection() {
  return (
    <motion.section id="processo" className="py-24 px-6" initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
      <div className="max-w-7xl mx-auto">
        <motion.div variants={fade} className="max-w-3xl mb-24">
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary bg-primary/10 px-4 py-1.5 rounded-full">Metodologia novaesweb</span>
          <h2 className="text-4xl sm:text-6xl font-black text-white mt-8 leading-[0.9] tracking-tighter">
            Do briefing à entrega <br />
            <span className="text-white/20">em </span> <span className="gradient-text">4 etapas</span>
          </h2>
          <p className="text-lg text-white/40 mt-8 leading-relaxed max-w-xl font-medium">
            Nosso processo é transparente e colaborativo. Você participa de cada etapa e acompanha tudo em tempo real pelo portal do cliente.
          </p>
        </motion.div>

        <div className="relative space-y-12 lg:space-y-0 lg:flex lg:gap-8">
          {/* Decorative Progress Line (Desktop) */}
          <div className="hidden lg:block absolute top-[44px] left-0 w-full h-0.5 bg-white/5 overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              whileInView={{ width: "100%" }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              className="h-full bg-gradient-to-r from-primary to-accent"
            />
          </div>

          {steps.map((step, i) => (
            <motion.div 
              key={i} 
              variants={fade} 
              className="relative lg:flex-1"
            >
              {/* Step Marker */}
              <div className="flex items-center gap-4 lg:flex-col lg:items-start lg:gap-8">
                <div className="relative z-10 flex h-16 w-16 shrink-0 items-center justify-center rounded-[20px] bg-[#09090b] border border-white/10 shadow-2xl group-hover:border-primary/50 transition-colors">
                  <span className="text-2xl font-black gradient-text">{step.num}</span>
                  <div className="absolute -inset-2 bg-primary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">{step.titulo}</h3>
                  <p className="text-sm text-white/40 leading-relaxed font-medium max-w-xs">{step.desc}</p>
                  <div className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/5 border border-primary/10 px-4 py-1.5 rounded-full">
                    <Zap className="w-3.5 h-3.5" /> {step.detail}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}



