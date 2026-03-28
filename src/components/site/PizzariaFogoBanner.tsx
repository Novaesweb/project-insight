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
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 to-orange-900/20" />
      
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
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/30 text-red-400 text-sm font-medium">
                <Pizza className="w-4 h-4" />
                Projeto em Destaque
              </span>
              <h2 className="text-3xl md:text-4xl font-bold gradient-text">
                Pizzaria Fogo
              </h2>
            </div>
            
            <p className="text-lg text-white/80 leading-relaxed">
              Sistema completo para pizzaria com pedidos online, cardápio digital e painel administrativo. 
              Uma experiência moderna que aumenta vendas e organiza o atendimento.
            </p>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-red-500/20 border border-red-500/30 mb-2 mx-auto">
                  <Star className="w-6 h-6 text-red-400" />
                </div>
                <p className="text-xs text-white/60">Avaliação</p>
                <p className="text-sm font-bold text-white">4.9★</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-orange-500/20 border border-orange-500/30 mb-2 mx-auto">
                  <Clock className="w-6 h-6 text-orange-400" />
                </div>
                <p className="text-xs text-white/60">Entrega</p>
                <p className="text-sm font-bold text-white">30min</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-yellow-500/20 border border-yellow-500/30 mb-2 mx-auto">
                  <MapPin className="w-6 h-6 text-yellow-400" />
                </div>
                <p className="text-xs text-white/60">Local</p>
                <p className="text-sm font-bold text-white">SP</p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <motion.a
                href="https://pizzariafogo.novaesweb.site/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-red-500 to-orange-500 text-white font-semibold hover:from-red-600 hover:to-orange-600 transition-all duration-300 shadow-lg hover:shadow-red-500/25"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Pizza className="w-5 h-5" />
                Visitar Pizzaria
              </motion.a>
              
              <motion.a
                href="#demonstracao"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-white/20 text-white font-semibold hover:bg-white/10 transition-all duration-300"
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
            <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-red-500/20">
              <img 
                src="/assets/pizzaria-fogo-banner.jpg" 
                alt="Pizzaria Fogo - Sistema de Pedidos Online"
                className="w-full h-auto object-cover"
              />
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              
              {/* Floating Badge */}
              <motion.div 
                className="absolute top-4 right-4 px-3 py-2 rounded-full bg-green-500 text-white text-xs font-bold flex items-center gap-1"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                AO VIVO
              </motion.div>
            </div>
            
            {/* Decorative Elements */}
            <motion.div 
              className="absolute -top-4 -right-4 w-20 h-20 bg-red-500/20 rounded-full blur-xl"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
            <motion.div 
              className="absolute -bottom-4 -left-4 w-16 h-16 bg-orange-500/20 rounded-full blur-xl"
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 3, repeat: Infinity, delay: 1 }}
            />
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}
