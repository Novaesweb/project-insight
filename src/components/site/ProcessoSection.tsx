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
        <motion.div variants={fade} className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-semibold uppercase tracking-widest text-[hsl(var(--primary))]">Como funciona</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-[hsl(var(--foreground))] mt-3">
            Do briefing à entrega em 4 etapas
          </h2>
          <p className="text-[hsl(var(--muted-foreground))] mt-4 leading-relaxed">
            Nosso processo é transparente e colaborativo. Você participa de cada etapa e acompanha tudo em tempo real pelo portal do cliente.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <motion.div key={i} variants={fade} className="relative">
              <div className="glass-card rounded-2xl p-8 h-full info-card-hover">
                <span className="text-4xl font-extrabold gradient-text opacity-30">{step.num}</span>
                <h3 className="text-lg font-semibold text-[hsl(var(--foreground))] mt-4 mb-2">{step.titulo}</h3>
                <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed mb-4">{step.desc}</p>
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[hsl(var(--primary))] bg-[hsl(var(--primary))]/10 px-3 py-1 rounded-full">
                  <Zap className="w-3 h-3" /> {step.detail}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
