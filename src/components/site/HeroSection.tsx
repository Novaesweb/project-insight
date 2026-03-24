import { motion } from "framer-motion";
import { ArrowRight, Play, Star, ShieldCheck, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeroSectionProps {
  onOpenDemo: () => void;
  onOpenStory: (id: string) => void;
}

export default function HeroSection({ onOpenDemo, onOpenStory }: HeroSectionProps) {
  return (
    <section id="home" className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-20 pb-12">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 -left-20 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 -right-20 w-[500px] h-[500px] bg-accent/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8"
          >
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <span className="text-[10px] font-bold text-white/80 uppercase tracking-[0.2em]">Especialistas em Alta Performance Digital</span>
          </motion.div>

          {/* Main Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-7xl lg:text-8xl font-black mb-8 tracking-tighter leading-[0.9] text-white"
          >
            Sua Empresa com <br />
            <span className="gradient-text">DNA Tecnológico</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-white/60 mb-12 max-w-2xl mx-auto leading-relaxed"
          >
            Desenvolvemos sites, sistemas e automações inteligentes que transformam a operação e multiplicam os resultados do seu negócio local.
          </motion.p>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button 
              onClick={onOpenDemo}
              className="h-16 px-10 rounded-2xl gradient-primary text-white text-lg font-black shadow-[0_20px_40px_rgba(255,51,102,0.3)] hover:scale-105 transition-all group border-0"
            >
              Solicitar Demonstração <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
            </Button>

            <Button 
              variant="outline"
              onClick={() => onOpenStory("geral")}
              className="h-16 px-10 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 text-white text-lg font-bold backdrop-blur-md transition-all group"
            >
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
                <Play className="w-4 h-4 text-primary fill-primary ml-0.5" />
              </div>
              Veja nossa história
            </Button>
          </motion.div>

          {/* Trust Elements */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="mt-20 pt-12 border-t border-white/5 flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-40 hover:opacity-100 transition-opacity"
          >
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-widest">Segurança Total</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-widest">Alta Velocidade</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-widest">Suporte Premium</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Hero Image / Abstract Shape */}
      <div className="absolute -bottom-1/2 left-1/2 -translate-x-1/2 w-[120%] aspect-square bg-[#ff3366]/5 rounded-full blur-[150px] -z-10" />
    </section>
  );
}
