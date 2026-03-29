import { motion } from "framer-motion";
import { AnimatedTestimonials } from "@/components/ui/animated-testimonials";
import { useAnimatedCounter } from "@/hooks/useAnimatedCounter";

const fade = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };
const stagger = { show: { transition: { staggerChildren: 0.08 } } };

const testimonials = [
  { description: "A novaesweb transformou a presença digital do meu negócio. O site ficou moderno, rápido e muito mais profissional.", image: "", name: "Mariana Souza", handle: "@marianasouza" },
  { description: "Gostei muito da facilidade no atendimento e da qualidade do site entregue. Ficou bonito, responsivo e passou mais confiança para meus clientes.", image: "", name: "Lucas Ferreira", handle: "@lucasferreira" },
  { description: "A novaesweb conseguiu criar um site que realmente representa minha empresa. Hoje recebo mais contatos e meu negócio parece muito mais valorizado.", image: "", name: "Carlos Henrique", handle: "@carlosh" },
  { description: "Além do visual bonito, o site ficou prático e fácil de usar no celular. Era exatamente isso que eu precisava para atender melhor meus clientes.", image: "", name: "Fernanda Lima", handle: "@fernandalima" },
  { description: "O diferencial da novaesweb é unir design moderno com funcionalidade. Meu site ficou profissional e pronto para divulgar meu trabalho.", image: "", name: "Juliana Martins", handle: "@julianamartins" },
  { description: "Recomendo a novaesweb para qualquer empresa que queira crescer no digital. O trabalho ficou excelente e trouxe mais credibilidade para minha marca.", image: "", name: "Patrícia Alves", handle: "@patriciaalves" },
];

export default function ResultadosSection() {
  const empresas = useAnimatedCounter(36, 1500);
  const satisfacao = useAnimatedCounter(100, 1200);
  const prazo = useAnimatedCounter(7, 800);
  const atendimento = useAnimatedCounter(24, 1000);

  return (
    <motion.section id="resultados" className="py-24 px-6" initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
      <div className="max-w-6xl mx-auto">
        <motion.div variants={fade} className="text-left max-w-3xl mb-24">
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] px-4 py-1.5 rounded-full border border-red-500/15 bg-red-500/[0.06] text-red-400/80">Prova Social & Impacto</span>
          <h2 className="text-4xl sm:text-6xl font-black text-white/90 mt-8 leading-[0.9] tracking-tighter">
            O que nossos <br />
            <span className="text-white/20">parceiros </span> <span className="gradient-text">dizem</span>
          </h2>
          <p className="text-lg text-white/30 mt-8 leading-relaxed max-w-xl font-medium">
            Atendemos empresas que buscam excelência. Veja os números e depoimentos de quem já escalou com a novaesweb.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-24">
          {[
            { ref: empresas.ref, count: empresas.count, suffix: "+", label: "Empresas atendidas" },
            { ref: satisfacao.ref, count: satisfacao.count, suffix: "%", label: "Satisfação" },
            { ref: prazo.ref, count: prazo.count, suffix: "d", label: "Prazo de entrega" },
            { ref: atendimento.ref, count: atendimento.count, suffix: "h", label: "Resposta Suporte" },
          ].map((stat) => (
            <motion.div key={stat.label} ref={stat.ref} variants={fade} className="rounded-[2.5rem] p-8 text-center border border-white/[0.05] bg-white/[0.02] hover:border-purple-500/10 hover:bg-white/[0.04] transition-all info-card-hover">
              <p className="text-4xl font-black gradient-text mb-2">{stat.count}{stat.suffix}</p>
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/25 font-bold">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <AnimatedTestimonials data={testimonials} />
      </div>
    </motion.section>
  );
}
