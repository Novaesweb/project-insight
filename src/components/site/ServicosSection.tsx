import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Globe, ShoppingBag, Layers, Smartphone, Shield, Zap } from "lucide-react";

const fade = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };
const stagger = { show: { transition: { staggerChildren: 0.09 } } };

const servicos = [
  { icon: Globe, titulo: "Sites Profissionais", desc: "Sites rápidos, modernos e otimizados para SEO. Design responsivo, domínio, SSL, hospedagem e painel de gestão incluso.", color: "from-blue-500 to-cyan-500" },
  { icon: ShoppingBag, titulo: "Lojas Virtuais", desc: "E-commerce completo com catálogo, carrinho, checkout seguro e integração com Pix, cartão e boleto. Controle de estoque incluso.", color: "from-purple-500 to-pink-500" },
  { icon: Layers, titulo: "Sistemas Web", desc: "Sistemas sob medida para clientes, pedidos, agendamentos, financeiro e relatórios. 100% na nuvem, acesso de qualquer lugar.", color: "from-orange-500 to-red-500" },
  { icon: Smartphone, titulo: "Landing Pages", desc: "Páginas de alta conversão para campanhas de marketing. Design focado em capturar leads com formulários inteligentes.", color: "from-emerald-500 to-teal-500" },
  { icon: Shield, titulo: "Manutenção e Suporte", desc: "Suporte técnico contínuo, atualizações de segurança, backups automáticos e monitoramento 24h.", color: "from-yellow-500 to-orange-500" },
  { icon: Zap, titulo: "Automação e Integrações", desc: "Conecte seu site ao WhatsApp, e-mail marketing, redes sociais, Google Analytics e outras ferramentas que potencializam resultados.", color: "from-red-500 to-pink-500" },
];

function Card3D({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState({});

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 16;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -16;
    setStyle({ transform: `perspective(600px) rotateX(${y}deg) rotateY(${x}deg) scale(1.02)` });
  };

  const reset = () => setStyle({ transform: "perspective(600px) rotateX(0deg) rotateY(0deg) scale(1)", transition: "transform 0.4s ease" });

  return (
    <div ref={ref} style={style} onMouseMove={handleMove} onMouseLeave={reset}
      className="glass-card rounded-2xl p-8 group cursor-default transition-all duration-200 hover:border-white/15 will-change-transform">
      {children}
    </div>
  );
}

export default function ServicosSection() {
  return (
    <motion.section id="servicos" className="py-28 px-6" initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
      <div className="max-w-7xl mx-auto">
        <motion.div variants={fade} className="max-w-2xl mb-16">
          <span className="text-xs font-semibold uppercase tracking-widest text-[hsl(var(--primary))]">Serviços</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-[hsl(var(--foreground))] mt-3 leading-tight">
            Soluções digitais completas<br />para o seu negócio
          </h2>
          <p className="text-[hsl(var(--muted-foreground))] mt-4 leading-relaxed">
            Do planejamento à entrega, cuidamos de cada etapa para garantir a melhor presença digital possível.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-5">
          {servicos.map((s, i) => (
            <motion.div key={i} variants={fade}>
              <Card3D>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-5 shadow-lg group-hover:scale-105 transition-transform`}>
                  <s.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-[hsl(var(--foreground))] mb-3">{s.titulo}</h3>
                <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">{s.desc}</p>
              </Card3D>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
