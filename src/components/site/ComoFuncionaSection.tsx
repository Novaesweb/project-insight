import { motion } from "framer-motion";
import { ArrowRight, CheckCircle, Zap, Users, Target } from "lucide-react";

const fade = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };
const stagger = { show: { transition: { staggerChildren: 0.1 } } };

const passos = [
  {
    numero: "01",
    titulo: "Diagnóstico Estratégico",
    descricao: "Mapeamos seu negócio, concorrentes e oportunidades para criar uma solução que realmente vende.",
    icon: Target,
    detalhes: ["Análise completa", "Identificação de oportunidades", "Planejamento estratégico"]
  },
  {
    numero: "02", 
    titulo: "Arquitetura Digital",
    descricao: "Projetamos e desenvolvemos sua estrutura digital focada em conversão e experiência do usuário.",
    icon: Zap,
    detalhes: ["Design profissional", "UX otimizada", "Performance máxima"]
  },
  {
    numero: "03",
    titulo: "Integração Completa",
    descricao: "Conectamos todos os sistemas: WhatsApp, pagamentos, CRM e automações para funcionar 24/7.",
    icon: Users,
    detalhes: ["WhatsApp Business", "Automação de marketing", "Gestão integrada"]
  },
  {
    numero: "04",
    titulo: "Resultados Comprovados",
    descricao: "Lançamos, monitoramos e otimizamos continuamente para garantir mais clientes e vendas todos os dias.",
    icon: CheckCircle,
    detalhes: ["Métricas em tempo real", "Otimização contínua", "Suporte dedicado"]
  }
];

export default function ComoFuncionaSection() {
  return (
    <motion.section 
      id="como-funciona" 
      className="py-28 px-6 bg-gradient-to-b from-gray-900 to-black"
      initial="hidden" 
      whileInView="show" 
      viewport={{ once: true, margin: "-100px" }} 
      variants={stagger}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div variants={fade} className="text-center max-w-4xl mb-20">
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-purple-400 bg-purple-900/20 px-4 py-1.5 rounded-full">
            Nosso Processo
          </span>
          <h2 className="text-4xl sm:text-6xl font-black text-white mt-8 leading-[0.9] tracking-tighter">
            Como <span className="text-purple-400">transformamos</span><br />
            <span className="text-white/60">ideias em </span><span className="text-red-400">máquinas de clientes</span>
          </h2>
          <p className="text-lg text-white/60 mt-6 max-w-2xl mx-auto leading-relaxed">
            Um método comprovado que leva sua empresa do zero ao digital gerando resultados reais todos os dias.
          </p>
        </motion.div>

        {/* Passos */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {passos.map((passo, index) => (
            <motion.div
              key={index}
              variants={fade}
              className="relative"
            >
              {/* Número */}
              <div className="absolute -top-4 -left-4 text-8xl font-black text-purple-400 opacity-20">
                {passo.numero}
              </div>
              
              {/* Card */}
              <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8 hover:border-purple-500/30 transition-all duration-300 h-full">
                {/* Icon */}
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 via-red-500/20 to-pink-500/20 rounded-2xl flex items-center justify-center mb-6">
                  <passo.icon className="w-8 h-8 text-purple-400" />
                </div>
                
                {/* Conteúdo */}
                <h3 className="text-xl font-bold text-white mb-4">{passo.titulo}</h3>
                <p className="text-white/60 mb-6 leading-relaxed">{passo.descricao}</p>
                
                {/* Detalhes */}
                <div className="space-y-3">
                  {passo.detalhes.map((detalhe, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm text-white/80">{detalhe}</span>
                    </div>
                  ))}
                </div>
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
