import { motion } from "framer-motion";
import { CheckCircle, Zap, Users, Target } from "lucide-react";

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
      className="py-28 px-6"
      initial="hidden" 
      whileInView="show" 
      viewport={{ once: true, margin: "-100px" }} 
      variants={stagger}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div variants={fade} className="text-center max-w-4xl mx-auto mb-20">
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] px-4 py-1.5 rounded-full border border-pink-500/15 bg-pink-500/[0.06] text-pink-400/80">
            Nosso Processo
          </span>
          <h2 className="text-4xl sm:text-6xl font-black text-white/90 mt-8 leading-[0.9] tracking-tighter">
            Como <span className="gradient-text">transformamos</span><br />
            <span className="text-white/30">ideias em </span><span className="text-white/70">máquinas de clientes</span>
          </h2>
          <p className="text-lg text-white/35 mt-6 max-w-2xl mx-auto leading-relaxed">
            Um método comprovado que leva sua empresa do zero ao digital gerando resultados reais todos os dias.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {passos.map((passo, index) => (
            <motion.div
              key={index}
              variants={fade}
              className="relative"
            >
              {/* Faded number */}
              <div className="absolute -top-4 -left-4 text-8xl font-black text-white/[0.03]">
                {passo.numero}
              </div>
              
              <div className="rounded-2xl p-8 border border-white/[0.05] bg-white/[0.02] hover:border-pink-500/15 hover:bg-white/[0.04] transition-all duration-300 h-full group">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 border border-white/[0.06] bg-white/[0.03] group-hover:border-pink-500/20 transition-colors" style={{ background: 'linear-gradient(135deg, rgba(236,72,153,0.08), rgba(168,85,247,0.06))' }}>
                  <passo.icon className="w-7 h-7 text-pink-400/70 group-hover:text-pink-400 transition-colors" />
                </div>
                
                <h3 className="text-lg font-bold text-white/85 mb-4">{passo.titulo}</h3>
                <p className="text-white/35 mb-6 leading-relaxed text-sm">{passo.descricao}</p>
                
                <div className="space-y-3">
                  {passo.detalhes.map((detalhe, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <CheckCircle className="w-4 h-4 text-emerald-500/50 flex-shrink-0" />
                      <span className="text-sm text-white/50">{detalhe}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div variants={fade} className="text-center">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="#contato"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-white text-lg font-black shadow-[0_20px_50px_rgba(168,85,247,0.2)] hover:shadow-[0_25px_60px_rgba(168,85,247,0.35)] hover:scale-105 transition-all"
              style={{ background: 'linear-gradient(135deg, #a855f7, #ff3366, #ec4899)' }}
            >
              Começar Agora
            </a>
            <a 
              href="#demonstracao"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl border border-white/10 text-white/50 text-lg font-black hover:bg-white/[0.04] hover:text-white/70 transition-all"
            >
              Ver Demonstração
            </a>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}
