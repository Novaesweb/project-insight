import { motion } from "framer-motion";
import { AnimatedTestimonials } from "@/components/ui/animated-testimonials";
import { useAnimatedCounter } from "@/hooks/useAnimatedCounter";

const fade = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };
const stagger = { show: { transition: { staggerChildren: 0.08 } } };

const testimonials = [
  { description: "A Novaesweb transformou a presença digital do meu negócio. O site ficou moderno, rápido e muito mais profissional.", image: "", name: "Mariana Souza", handle: "@marianasouza" },
  { description: "Gostei muito da facilidade no atendimento e da qualidade do site entregue. Ficou bonito, responsivo e passou mais confiança para meus clientes.", image: "", name: "Lucas Ferreira", handle: "@lucasferreira" },
  { description: "A Novaesweb conseguiu criar um site que realmente representa minha empresa. Hoje recebo mais contatos e meu negócio parece muito mais valorizado.", image: "", name: "Carlos Henrique", handle: "@carlosh" },
  { description: "Além do visual bonito, o site ficou prático e fácil de usar no celular. Era exatamente isso que eu precisava para atender melhor meus clientes.", image: "", name: "Fernanda Lima", handle: "@fernandalima" },
  { description: "O diferencial da Novaesweb é unir design moderno com funcionalidade. Meu site ficou profissional e pronto para divulgar meu trabalho.", image: "", name: "Juliana Martins", handle: "@julianamartins" },
  { description: "Recomendo a Novaesweb para qualquer empresa que queira crescer no digital. O trabalho ficou excelente e trouxe mais credibilidade para minha marca.", image: "", name: "Patrícia Alves", handle: "@patriciaalves" },
];

export default function ResultadosSection() {
  const empresas = useAnimatedCounter(36, 1500);
  const satisfacao = useAnimatedCounter(100, 1200);
  const prazo = useAnimatedCounter(7, 800);
  const atendimento = useAnimatedCounter(24, 1000);

  return (
    <motion.section id="resultados" className="py-24 px-6" initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
      <div className="max-w-6xl mx-auto">
        <motion.div variants={fade} className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-semibold uppercase tracking-widest text-[hsl(var(--primary))]">Resultados</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-[hsl(var(--foreground))] mt-3">
            O que nossos clientes dizem
          </h2>
          <p className="text-[hsl(var(--muted-foreground))] mt-4">
            Estamos em fase de crescimento, já atendendo cerca de 36 empresas com foco total em qualidade e satisfação. Cada projeto é tratado como único.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-24">
          <motion.div ref={empresas.ref} variants={fade} className="glass-card rounded-[2.5rem] p-8 text-center border-white/5 info-card-hover">
            <p className="text-4xl font-black gradient-text mb-2">{empresas.count}+</p>
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-bold">Empresas atendidas</p>
          </motion.div>
          <motion.div ref={satisfacao.ref} variants={fade} className="glass-card rounded-[2.5rem] p-8 text-center border-white/5 info-card-hover">
            <p className="text-4xl font-black gradient-text mb-2">{satisfacao.count}%</p>
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-bold">Satisfação</p>
          </motion.div>
          <motion.div ref={prazo.ref} variants={fade} className="glass-card rounded-[2.5rem] p-8 text-center border-white/5 info-card-hover">
            <p className="text-4xl font-black gradient-text mb-2">{prazo.count}d</p>
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-bold">Prazo de entrega</p>
          </motion.div>
          <motion.div ref={resposta.ref} variants={fade} className="glass-card rounded-[2.5rem] p-8 text-center border-white/5 info-card-hover">
            <p className="text-4xl font-black gradient-text mb-2">{atendimento.count}h</p>
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-bold">Resposta Suporte</p>
          </motion.div>
        </div>

        <AnimatedTestimonials data={testimonials} />
      </div>
    </motion.section>
  );
}
