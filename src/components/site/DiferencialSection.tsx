import { motion } from "framer-motion";
import { Zap, Shield, Target, TrendingUp, Award, Users } from "lucide-react";

const fade = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };
const stagger = { show: { transition: { staggerChildren: 0.1 } } };

const diferenciais = [
  {
    icon: Target,
    titulo: "Foco Total em Resultado",
    descricao: "Não criamos sites por criar. Construímos estruturas que geram clientes todos os dias. Cada decisão é pensada para aumentar suas conversões.",
    resultado: "+300% mais contatos"
  },
  {
    icon: Zap,
    titulo: "Ecossistema Integrado",
    descricao: "Tudo conectado: site, WhatsApp, CRM, pagamentos. Sem gargalos, fluxo contínuo do lead até o cliente fechado.",
    resultado: "24/7 automatizado"
  },
  {
    icon: Shield,
    titulo: "Tecnologia que Escala",
    descricao: "Usamos stack moderno e arquitetura robusta. Sua estrutura digital cresce junto com seu negócio sem limitações.",
    resultado: "Crescimento ilimitado"
  },
  {
    icon: TrendingUp,
    titulo: "Métricas em Tempo Real",
    descricao: "Dashboard completo com leads, conversões, vendas. Você sabe exatamente o que está funcionando e onde otimizar.",
    resultado: "Decisões baseadas em dados"
  },
  {
    icon: Award,
    titulo: "Experiência Comprovada",
    descricao: "36+ empresas transformadas, 100% satisfação. Não é teoria, é metodologia testada e validada no mercado.",
    resultado: "Casos de sucesso reais"
  },
  {
    icon: Users,
    titulo: "Parceria de Longo Prazo",
    descricao: "Não entregamos e somos. Acompanhamos, otimizamos e evoluímos sua estrutura digital continuamente.",
    resultado: "Suporte dedicado"
  }
];

export default function DiferencialSection() {
  return (
    <motion.section 
      id="diferencial" 
      className="py-28 px-6 bg-black"
      initial="hidden" 
      whileInView="show" 
      viewport={{ once: true, margin: "-100px" }} 
      variants={stagger}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div variants={fade} className="text-center max-w-4xl mb-20">
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary bg-primary/10 px-4 py-1.5 rounded-full">
            Nosso Diferencial
          </span>
          <h2 className="text-4xl sm:text-6xl font-black text-white mt-8 leading-[0.9] tracking-tighter">
            Por que <span className="gradient-text">NovaesWeb</span><br />
            <span className="text-white/20">é diferente de </span><span className="gradient-text">tudo?</span>
          </h2>
          <p className="text-lg text-white/60 mt-6 max-w-2xl mx-auto leading-relaxed">
            Não somos mais uma agência. Somos parceiros estratégicos que transformam seu negócio digital em uma máquina de clientes.
          </p>
        </motion.div>

        {/* Diferenciais */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {diferenciais.map((item, index) => (
            <motion.div
              key={index}
              variants={fade}
              className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8 hover:border-primary/50 transition-all duration-300 h-full"
            >
              {/* Icon */}
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center mb-6">
                <item.icon className="w-8 h-8 text-white" />
              </div>
              
              {/* Conteúdo */}
              <h3 className="text-xl font-bold text-white mb-4">{item.titulo}</h3>
              <p className="text-white/60 mb-6 leading-relaxed flex-grow">{item.descricao}</p>
              
              {/* Resultado */}
              <div className="bg-gradient-to-r from-primary/20 to-accent/20 rounded-xl px-4 py-3 border border-primary/30">
                <span className="text-sm font-bold gradient-text">{item.resultado}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Banner Estratégico */}
        <motion.div 
          variants={fade}
          className="bg-gradient-to-r from-primary via-accent to-primary rounded-3xl p-12 text-center relative overflow-hidden"
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{ 
              backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px)',
              backgroundSize: '40px 40px'
            }} />
          </div>
          
          <div className="relative z-10">
            <h3 className="text-3xl md:text-4xl font-black text-white mb-4 leading-tight">
              "Não criamos apenas sites.<br />
              <span className="text-yellow-300">Criamos máquinas de clientes.</span>"
            </h3>
            <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
              Cada projeto é uma estrutura estratégica pensada para atrair, converter e fidelizar clientes automaticamente.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="#contato"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-white text-primary text-lg font-bold hover:bg-gray-100 transition-all"
              >
                Quero minha máquina
                <Zap className="w-5 h-5" />
              </a>
              <a 
                href="#demonstracao"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl border-2 border-white text-white text-lg font-bold hover:bg-white/10 transition-all"
              >
                Ver como funciona
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}
