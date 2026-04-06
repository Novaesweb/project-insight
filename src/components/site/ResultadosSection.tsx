import { motion } from "framer-motion";
import { AnimatedTestimonials } from "@/components/ui/animated-testimonials";
import { useAnimatedCounter } from "@/hooks/useAnimatedCounter";

const fade = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };
const stagger = { show: { transition: { staggerChildren: 0.08 } } };

const testimonials = [
  { description: "A novaesweb transformou a presença digital do meu negócio. O site ficou moderno, rápido e muito mais profissional. Hoje recebo clientes novos toda semana.", image: "", name: "Mariana Souza", handle: "Dona de Restaurante" },
  { description: "Gostei muito da facilidade no atendimento e da qualidade do site entregue. Ficou bonito, responsivo e passou mais confiança para meus clientes.", image: "", name: "Lucas Ferreira", handle: "Barbearia Premium" },
  { description: "A novaesweb conseguiu criar um site que realmente representa minha empresa. Hoje recebo mais contatos e meu negócio parece muito mais valorizado.", image: "", name: "Carlos Henrique", handle: "Clínica de Estética" },
];

export default function ResultadosSection() {
  const empresas = useAnimatedCounter(36, 1500);
  const satisfacao = useAnimatedCounter(100, 1200);
  const prazo = useAnimatedCounter(7, 800);
  const atendimento = useAnimatedCounter(24, 1000);

  return (
    <motion.section id="resultados" className="site-band py-24 px-6 relative overflow-hidden" initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-[8%] w-[420px] h-[420px] rounded-full blur-[150px] opacity-[0.03]" style={{ background: 'radial-gradient(circle, hsl(var(--accent) / 0.35), transparent 72%)' }} />
      </div>
      <div className="max-w-6xl mx-auto">
        <motion.div variants={fade} className="text-center max-w-3xl mx-auto mb-20">
          <span className="site-badge site-badge--primary">Prova Social & Impacto</span>
          <h2 className="text-4xl sm:text-6xl font-black text-white/90 mt-8 leading-[0.9] tracking-tighter">
            O que nossos <br />
            <span className="site-title-muted">parceiros </span> <span className="site-gradient-text">dizem</span>
          </h2>
          <p className="text-lg site-copy-muted mt-8 leading-relaxed max-w-xl mx-auto font-medium">
            Atendemos empresas que buscam excelência. Veja os números e depoimentos de quem já escalou com a novaesweb.
          </p>
        </motion.div>

        <motion.div variants={fade} className="public-page-section-card mb-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="site-badge site-badge--accent">
              Destaque premium
            </span>
          </div>
          <p className="site-copy-muted text-base leading-relaxed max-w-3xl">
            Cada entrega é pensada para fortalecer a imagem da empresa, melhorar o atendimento e criar uma estrutura digital que realmente parece mais profissional no mercado.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-24">
          {[
            { ref: empresas.ref, count: empresas.count, suffix: "+", label: "Empresas atendidas" },
            { ref: satisfacao.ref, count: satisfacao.count, suffix: "%", label: "Satisfação" },
            { ref: prazo.ref, count: prazo.count, suffix: "d", label: "Prazo de entrega" },
            { ref: atendimento.ref, count: atendimento.count, suffix: "h", label: "Resposta Suporte" },
          ].map((stat) => (
            <motion.div key={stat.label} ref={stat.ref} variants={fade} className="public-page-stat-card hover:border-[hsl(var(--primary)/0.24)] transition-all info-card-hover">
              <p className="text-4xl font-black site-gradient-text mb-2">{stat.count}{stat.suffix}</p>
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/45 font-bold">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <AnimatedTestimonials data={testimonials} />
      </div>
    </motion.section>
  );
}
