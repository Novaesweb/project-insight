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

export default function OQueFazemosSection() {
  return (
    <motion.section 
      id="o-que-fazemos" 
      className="py-28 px-6 bg-gradient-to-b from-black to-gray-900"
      initial="hidden" 
      whileInView="show" 
      viewport={{ once: true, margin: "-100px" }} 
      variants={stagger}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div variants={fade} className="text-center max-w-4xl mb-20">
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-purple-400 bg-purple-900/20 px-4 py-1.5 rounded-full">
            Nossos Serviços
          </span>
          <h2 className="text-4xl sm:text-6xl font-black text-white mt-8 leading-[0.9] tracking-tighter">
            O que <span className="text-purple-400">fazemos</span><br />
            <span className="text-white/60">para seu </span><span className="text-red-400">negócio</span>
          </h2>
          <p className="text-lg text-white/60 mt-6 max-w-2xl mx-auto leading-relaxed">
            Estruturas digitais completas que transformam visitantes em clientes recorrentes todos os dias.
          </p>
        </motion.div>

        {/* Serviços */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {servicos.map((servico, index) => (
            <motion.div
              key={index}
              variants={fade}
              className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8 hover:border-purple-500/30 transition-all duration-300 h-full"
            >
              {/* Icon */}
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 via-red-500/20 to-pink-500/20 rounded-2xl flex items-center justify-center mb-6">
                <servico.icon className="w-8 h-8 text-purple-400" />
              </div>
              
              {/* Conteúdo */}
              <h3 className="text-xl font-bold text-white mb-4">{servico.titulo}</h3>
              <p className="text-white/60 mb-6 leading-relaxed flex-grow">{servico.descricao}</p>
              
              {/* Resultado */}
              <div className="bg-gradient-to-r from-purple-900/30 to-red-900/30 rounded-xl px-4 py-3 border border-purple-500/20">
                <span className="text-sm font-semibold text-purple-300">{servico.resultado}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div variants={fade} className="text-center">
          <p className="text-lg text-white/60 mb-8">
            Pronto para transformar seu negócio em uma máquina de clientes?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="#contato"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-600 via-red-600 to-pink-600 hover:from-purple-700 hover:via-red-700 hover:to-pink-700 text-white text-lg font-black shadow-[0_20px_50px_rgba(139,92,246,0.3)] hover:shadow-[0_25px_60px_rgba(139,92,246,0.5)] hover:scale-105 transition-all"
            >
              Começar Agora
            </a>
            <a 
              href="#demonstracao"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl border border-purple-500/30 text-purple-300 text-lg font-black hover:bg-purple-500/10 transition-all"
            >
              Ver Demonstração
            </a>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}
