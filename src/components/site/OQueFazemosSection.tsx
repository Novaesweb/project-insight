import { motion } from "framer-motion";
import { Globe, ShoppingBag, MessageCircle, Layout } from "lucide-react";

const fade = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };
const stagger = { show: { transition: { staggerChildren: 0.1 } } };

const servicos = [
  {
    icon: Globe,
    titulo: "Sites Profissionais",
    descricao: "Apresentação impecável para seu negócio. Design moderno, responsivo e otimizado para converter visitantes em clientes.",
    resultado: "Mais credibilidade e contatos"
  },
  {
    icon: ShoppingBag,
    titulo: "Sistemas de Pedidos",
    descricao: "Clientes pedem online diretamente do seu site. Gestão simples de pedidos com notificações automáticas.",
    resultado: "Vendas automáticas 24/7"
  },
  {
    icon: MessageCircle,
    titulo: "Automações WhatsApp",
    descricao: "Integramos seu site com WhatsApp Business. Respostas automáticas e atendimento profissional.",
    resultado: "Atendimento sem esforço"
  },
  {
    icon: Layout,
    titulo: "Painel Administrativo",
    descricao: "Dashboard completo para gerenciar clientes, pedidos e informações. Controle total do seu negócio.",
    resultado: "Gestão simplificada"
  }
];

interface OQueFazemosProps {
  onOpenDemo?: () => void;
}

export default function OQueFazemosSection({ onOpenDemo }: OQueFazemosProps) {
  return (
    <motion.section 
      id="o-que-fazemos" 
      className="site-band py-28 px-6 relative"
      initial="hidden" 
      whileInView="show" 
      viewport={{ once: true, margin: "-100px" }} 
      variants={stagger}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div variants={fade} className="text-center max-w-4xl mx-auto mb-20">
          <span className="site-badge site-badge--accent">
            Nossos Serviços
          </span>
          <h2 className="text-4xl sm:text-6xl font-black text-white/90 mt-8 leading-[0.9] tracking-tighter">
            O que <span className="site-gradient-text">fazemos</span><br />
            <span className="site-title-muted">para seu </span><span className="text-white/80">negócio</span>
          </h2>
          <p className="text-lg site-copy-muted mt-6 max-w-2xl mx-auto leading-relaxed">
            Estruturas digitais completas que transformam visitantes em clientes recorrentes todos os dias.
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {servicos.map((servico, index) => (
            <motion.div
              key={index}
              variants={fade}
              className="site-surface rounded-[2rem] p-8 hover:border-white/10 transition-all duration-300 h-full group"
            >
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 border border-white/[0.06] bg-white/[0.03] group-hover:border-white/10 transition-colors" style={{ background: 'linear-gradient(135deg, hsl(var(--accent) / 0.12), hsl(var(--primary-novaesweb) / 0.08))' }}>
                <servico.icon className="w-7 h-7 text-white/80 transition-colors" />
              </div>
              
              <h3 className="text-lg font-bold text-white/85 mb-4">{servico.titulo}</h3>
              <p className="site-copy-muted mb-6 leading-relaxed text-sm">{servico.descricao}</p>
              
              <div className="site-soft-surface rounded-xl px-4 py-3">
                <span className="text-sm font-semibold site-gradient-text">{servico.resultado}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div variants={fade} className="text-center">
          <p className="text-lg site-copy-muted mb-8">
            Pronto para transformar seu negócio em uma máquina de clientes?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="#contato"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-white text-lg font-black shadow-[0_18px_45px_rgba(236,72,153,0.18)] hover:shadow-[0_22px_55px_rgba(236,72,153,0.24)] hover:scale-105 transition-all"
              style={{ background: 'linear-gradient(135deg, rgba(220,38,38,0.92), rgba(107,33,168,0.9), rgba(236,72,153,0.88))' }}
            >
              Começar Agora
            </a>
            <button 
              onClick={onOpenDemo}
              className="site-surface inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-white/70 text-lg font-black hover:bg-white/[0.04] hover:text-white/90 transition-all cursor-pointer"
            >
              Ver Demonstração
            </button>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}
