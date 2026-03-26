import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Zap, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

const particles = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 3 + 1,
  duration: Math.random() * 5 + 4,
  delay: Math.random() * 3,
}));

interface HeroSectionProps {
  onOpenDemo: () => void;
}

export default function HeroSection({ onOpenDemo }: HeroSectionProps) {
  return (
    <section id="home" className="relative min-h-[95vh] flex items-center justify-center overflow-hidden pt-20 pb-12">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 -left-20 w-[600px] h-[600px] bg-primary/15 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute bottom-1/4 -right-20 w-[600px] h-[600px] bg-accent/15 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[200px]" />
      </div>

      {/* Dot grid pattern */}
      <div className="absolute inset-0 opacity-[0.015] pointer-events-none">
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, hsl(var(--foreground)) 1px, transparent 0)', backgroundSize: '32px 32px' }} />
      </div>

      {/* Floating particles */}
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-primary/20 pointer-events-none"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size }}
          animate={{ y: [0, -30, 0], opacity: [0.1, 0.5, 0.1] }}
          transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: "easeInOut" }}
        />
      ))}

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

          {/* Main Title with word animation */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl lg:text-[5.5rem] font-black mb-8 tracking-tighter leading-[0.85] text-white"
          >
            <motion.span
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="block"
            >
              Sua Empresa com
            </motion.span>
            <motion.span
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="gradient-text block"
            >
              DNA Tecnológico
            </motion.span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="text-lg md:text-xl text-white/50 mb-14 max-w-2xl mx-auto leading-relaxed font-medium"
          >
            Não entregamos apenas código. Estruturamos a base digital que escala o seu lucro e transforma sua operação em um ativo de alto valor.
          </motion.p>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
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
              <motion.div
                className="absolute inset-0 bg-white/10"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              />
            </Button>
          </motion.div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="mt-20 grid grid-cols-3 gap-6 max-w-lg mx-auto"
          >
            {[
              { value: "36+", label: "Empresas" },
              { value: "100%", label: "Satisfação" },
              { value: "7d", label: "Prazo médio" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1 + i * 0.15 }}
                className="text-center"
              >
                <p className="text-2xl md:text-3xl font-black gradient-text">{stat.value}</p>
                <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-bold mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Trust Elements */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.3 }}
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

      {/* Bottom glow */}
      <div className="absolute -bottom-1/2 left-1/2 -translate-x-1/2 w-[120%] aspect-square bg-primary/5 rounded-full blur-[150px] -z-10" />
    </section>
  );
}
