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
      className="py-28 px-6"
      initial="hidden" 
      whileInView="show" 
      viewport={{ once: true, margin: "-100px" }} 
      variants={stagger}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div variants={fade} className="text-center max-w-4xl mx-auto mb-20">
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] px-4 py-1.5 rounded-full border border-purple-500/15 bg-purple-500/[0.06] text-purple-400/80">
            Nossos Serviços
          </span>
          <h2 className="text-4xl sm:text-6xl font-black text-white/90 mt-8 leading-[0.9] tracking-tighter">
            O que <span className="gradient-text">fazemos</span><br />
            <span className="text-white/30">para seu </span><span className="text-white/70">negócio</span>
          </h2>
          <p className="text-lg text-white/35 mt-6 max-w-2xl mx-auto leading-relaxed">
            Estruturas digitais completas que transformam visitantes em clientes recorrentes todos os dias.
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {servicos.map((servico, index) => (
            <motion.div
              key={index}
              variants={fade}
              className="rounded-2xl p-8 border border-white/[0.05] bg-white/[0.02] hover:border-purple-500/15 hover:bg-white/[0.04] transition-all duration-300 h-full group"
            >
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 border border-white/[0.06] bg-white/[0.03] group-hover:border-purple-500/20 transition-colors" style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.08), rgba(236,72,153,0.06))' }}>
                <servico.icon className="w-7 h-7 text-purple-400/70 group-hover:text-purple-400 transition-colors" />
              </div>
              
              <h3 className="text-lg font-bold text-white/85 mb-4">{servico.titulo}</h3>
              <p className="text-white/35 mb-6 leading-relaxed text-sm">{servico.descricao}</p>
              
              <div className="rounded-xl px-4 py-3 border border-purple-500/10 bg-purple-500/[0.04]">
                <span className="text-sm font-semibold gradient-text">{servico.resultado}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div variants={fade} className="text-center">
          <p className="text-lg text-white/35 mb-8">
            Pronto para transformar seu negócio em uma máquina de clientes?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="#contato"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-white text-lg font-black shadow-[0_20px_50px_rgba(168,85,247,0.2)] hover:shadow-[0_25px_60px_rgba(168,85,247,0.35)] hover:scale-105 transition-all"
              style={{ background: 'linear-gradient(135deg, #a855f7, #ff3366, #ec4899)' }}
            >
              Começar Agora
            </a>
            <button 
              onClick={onOpenDemo}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl border border-white/10 text-white/50 text-lg font-black hover:bg-white/[0.04] hover:text-white/70 transition-all cursor-pointer"
            >
              Ver Demonstração
            </button>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}
