import { motion } from "framer-motion";
import { ShieldCheck, Zap, Code2, Headphones, Sparkles } from "lucide-react";
import sealImg from "@/assets/novaesweb-seal-v9.png";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const pillars = [
  {
    icon: ShieldCheck,
    title: "Segurança de Elite",
    desc: "Blindagem ativa contra ataques DDoS e invasões com infraestrutura WAF.",
    color: "text-emerald-400"
  },
  {
    icon: Zap,
    title: "Performance Extrema",
    desc: "Carregamento otimizado nível Architect para máxima retenção de leads.",
    color: "text-amber-400"
  },
  {
    icon: Code2,
    title: "Clean Architecture",
    desc: "Código limpo, escalável e pronto para expansão em ecossistemas completos.",
    color: "text-blue-400"
  },
  {
    icon: Headphones,
    title: "Suporte de Engenharia",
    desc: "Acompanhamento técnico real por especialistas em engenharia de software.",
    color: "text-purple-400"
  }
];

export default function InfrastructureBadgeSection() {
  return (
    <section className="py-24 relative overflow-hidden bg-black/40">
      {/* Ambient backgrounds */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none opacity-40" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Side: The Seal */}
          <motion.div 
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={fadeUp}
            className="flex flex-col items-center justify-center text-center space-y-8"
          >
            <div className="relative group">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl group-hover:bg-primary/40 transition-all duration-700 animate-pulse" />
              
              <motion.img 
                src={sealImg} 
                alt="Selo NovaesWeb v9.0" 
                className="w-64 h-64 md:w-80 md:h-80 relative z-10 object-contain hover:scale-105 transition-transform duration-700 drop-shadow-[0_0_50px_rgba(232,51,74,0.3)]"
                animate={{ 
                  y: [0, -10, 0],
                  rotateY: [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: 6, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
              />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-3xl md:text-4xl font-black text-white tracking-tighter uppercase italic">
                Selo de Garantia <span className="gradient-text">NovaesWeb</span>
              </h2>
              <p className="text-white/40 text-sm max-w-md mx-auto font-medium tracking-wide">
                Cada projeto que entregamos carrega a certificação v9.0 Pro, garantindo autoridade técnica absoluta sobre seu ativo digital.
              </p>
            </div>
          </motion.div>

          {/* Right Side: The Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {pillars.map((pillar, idx) => (
              <motion.div
                key={pillar.title}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
                className="p-6 rounded-[2rem] bg-white/[0.03] border border-white/5 hover:border-white/10 transition-all group"
              >
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <pillar.icon className={`w-6 h-6 ${pillar.color}`} />
                </div>
                <h3 className="text-sm font-black text-white uppercase tracking-widest mb-2 flex items-center gap-2">
                  {pillar.title}
                  {idx === 0 && <Sparkles className="w-3 h-3 text-primary animate-pulse" />}
                </h3>
                <p className="text-xs text-white/40 leading-relaxed font-medium">
                  {pillar.desc}
                </p>
              </motion.div>
            ))}

            {/* CTA in the grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="sm:col-span-2 p-8 rounded-[2rem] bg-gradient-to-br from-primary/10 via-transparent to-transparent border border-primary/20 flex flex-col md:flex-row items-center justify-between gap-6"
            >
              <div>
                <p className="text-white font-bold text-lg">Sua infraestrutura merece ser de elite.</p>
                <p className="text-white/40 text-xs">Comece agora a construção do seu Ativo Digital v9.0.</p>
              </div>
              <button className="h-12 px-8 rounded-xl gradient-primary text-white font-bold text-sm shadow-lg shadow-primary/20 hover:scale-105 transition-all">
                SOLICITAR DIAGNÓSTICO
              </button>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}
