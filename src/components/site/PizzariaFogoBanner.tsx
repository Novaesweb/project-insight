import { motion } from "framer-motion";
import { Pizza, Star, Clock, MapPin } from "lucide-react";

export default function PizzariaFogoBanner() {
  return (
    <motion.section 
      className="relative py-16 px-4 overflow-hidden"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
    >      
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          
          {/* Text Content */}
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="space-y-2">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-red-500/15 bg-red-500/[0.06] text-red-400/80 text-sm font-medium">
                <Pizza className="w-4 h-4" />
                Projeto em Destaque
              </span>
              <h2 className="text-3xl md:text-4xl font-bold gradient-text">
                Pizzaria Fogo
              </h2>
            </div>
            
            <p className="text-lg text-white/45 leading-relaxed">
              Sistema completo para pizzaria com pedidos online, cardápio digital e painel administrativo. 
              Uma experiência moderna que aumenta vendas e organiza o atendimento.
            </p>
            
            <div className="grid grid-cols-3 gap-4">
              {[
                { icon: Star, label: "Avaliação", value: "4.9★", color: "red" },
                { icon: Clock, label: "Entrega", value: "30min", color: "pink" },
                { icon: MapPin, label: "Local", value: "SP", color: "purple" },
              ].map((item) => (
                <div key={item.label} className="text-center">
                  <div className="flex items-center justify-center w-12 h-12 rounded-lg border border-white/[0.06] bg-white/[0.03] mb-2 mx-auto">
                    <item.icon className="w-6 h-6 text-white/40" />
                  </div>
                  <p className="text-xs text-white/30">{item.label}</p>
                  <p className="text-sm font-bold text-white/70">{item.value}</p>
                </div>
              ))}
            </div>
            
            <div className="flex gap-4">
              <motion.a
                href="https://pizzariafogo.novaesweb.site/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold transition-all duration-300 shadow-lg shadow-purple-500/15 hover:scale-105"
                style={{ background: 'linear-gradient(135deg, #a855f7, #ff3366, #ec4899)' }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Pizza className="w-5 h-5" />
                Visitar Pizzaria
              </motion.a>
              
              <motion.a
                href="#demonstracao"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-white/10 text-white/50 font-semibold hover:bg-white/[0.04] transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Ver Demonstração
              </motion.a>
            </div>
          </motion.div>
          
          {/* Image */}
          <motion.div 
            className="relative"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-purple-500/10">
              <img 
                src="/assets/pizzaria-fogo-banner.jpg" 
                alt="Pizzaria Fogo - Sistema de Pedidos Online"
                className="w-full h-auto object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <motion.div 
                className="absolute top-4 right-4 px-3 py-2 rounded-full text-white text-xs font-bold flex items-center gap-1"
                style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                AO VIVO
              </motion.div>
            </div>
            
            <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full blur-[40px] opacity-[0.15]" style={{ background: '#a855f7' }} />
            <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full blur-[40px] opacity-[0.12]" style={{ background: '#ec4899' }} />
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}
