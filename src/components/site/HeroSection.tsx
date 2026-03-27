import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Zap, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeroSectionProps {
  onOpenDemo: () => void;
}

export default function HeroSection({ onOpenDemo }: HeroSectionProps) {
  return (
    <section id="home" className="relative min-h-[95vh] flex items-center justify-center overflow-hidden pt-20 pb-12">
      {/* Background Effects - GPU promoted */}
      <div className="absolute inset-0 z-0" aria-hidden="true">
        <div className="absolute top-1/4 -left-20 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px]" style={{ willChange: 'transform', transform: 'translateZ(0)' }} />
        <div className="absolute bottom-1/4 -right-20 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[120px]" style={{ willChange: 'transform', transform: 'translateZ(0)' }} />
      </div>

      {/* Dot grid pattern */}
      <div className="absolute inset-0 opacity-[0.015] pointer-events-none">
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, hsl(var(--foreground)) 1px, transparent 0)', backgroundSize: '32px 32px' }} />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-5xl mx-auto text-center">

          {/* Architect badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-[10px] font-black uppercase tracking-[0.3em] mb-8"
          >
            <Zap className="w-3 h-3" />
            Architect v10.0 — Engenharia Digital
          </motion.div>

          {/* Main Title */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl lg:text-[5.5rem] font-black mb-8 tracking-tighter leading-[0.85] text-white"
          >
            <span className="block">Sua Empresa com</span>
            <span className="gradient-text block">DNA Tecnológico</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-lg md:text-xl text-white/50 mb-14 max-w-2xl mx-auto leading-relaxed font-medium"
          >
            Não entregamos apenas código. Estruturamos a base digital que escala o seu lucro e transforma sua operação em um ativo de alto valor.
          </motion.p>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button
              onClick={onOpenDemo}
              className="h-16 px-12 rounded-2xl gradient-primary text-white text-lg font-black shadow-[0_20px_50px_rgba(255,51,102,0.3)] hover:shadow-[0_25px_60px_rgba(255,51,102,0.5)] hover:scale-105 transition-all group border-0 relative overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                Solicitar Demonstração
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
              </span>
            </Button>
          </motion.div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-20 grid grid-cols-3 gap-6 max-w-lg mx-auto"
          >
            {[
              { value: "36+", label: "Empresas" },
              { value: "100%", label: "Satisfação" },
              { value: "7d", label: "Prazo médio" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl md:text-3xl font-black gradient-text">{stat.value}</p>
                <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-bold mt-1">{stat.label}</p>
              </div>
            ))}
          </motion.div>

          {/* Trust Elements */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="mt-16 pt-10 border-t border-white/5 flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-30 hover:opacity-80 transition-opacity duration-500"
          >
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-primary/60" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Segurança Total</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary/60" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Alta Velocidade</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-primary/60" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Suporte Premium</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
