import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, MessageCircle, Star, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAnimatedCounter } from "@/hooks/useAnimatedCounter";

const fade = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };
const stagger = { show: { transition: { staggerChildren: 0.08 } } };
const heroWords = ["negócio", "futuro", "empresa", "projeto", "resultado"];

interface HeroSectionProps {
  onOpenDemo?: () => void;
}

export default function HeroSection({ onOpenDemo }: HeroSectionProps) {
  const [heroWordIndex, setHeroWordIndex] = useState(0);
  const heroWord = heroWords[heroWordIndex];

  useEffect(() => {
    const interval = setInterval(() => {
      setHeroWordIndex(prev => (prev + 1) % heroWords.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const empresas = useAnimatedCounter(36, 1500);
  const entrega = useAnimatedCounter(7, 800);
  const responsivo = useAnimatedCounter(100, 1200);
  const atendimento = useAnimatedCounter(24, 1000);

  return (
    <motion.section className="pt-32 pb-24 px-6 lg:px-8 overflow-hidden" initial="hidden" animate="show" variants={stagger}>
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Bold Typography & Main Message */}
          <div className="lg:col-span-7 space-y-8 text-left">
            <motion.div variants={fade} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              <span className="text-[10px] uppercase tracking-widest font-bold text-primary">v2.4.8 Premium Edition</span>
            </motion.div>

            <motion.h1 
              variants={fade} 
              className="text-5xl sm:text-6xl lg:text-[5rem] font-black text-white leading-[0.95] tracking-tighter"
            >
              Tecnologia que <br />
              <span className="gradient-text fx-glintReveal">transforma</span>
              <br />
              seu{" "}
              <AnimatePresence mode="wait">
                <motion.span
                  key={heroWord}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5, ease: "circOut" }}
                  className="inline-block text-white border-b-[6px] border-primary/30"
                >
                  {heroWord}
                </motion.span>
              </AnimatePresence>
            </motion.h1>

            <motion.p variants={fade} className="text-lg sm:text-xl text-white/50 leading-relaxed max-w-xl font-medium">
              Sistemas e aplicativos sob medida para empresas que não aceitam o comum. Alta performance, design exclusivo e resultados reais.
            </motion.p>

            <motion.div variants={fade} className="flex flex-col sm:flex-row gap-4 pt-4">
              <a href="#cadastro">
                <Button className="gradient-primary border-0 text-white h-14 px-10 rounded-2xl text-sm font-black uppercase tracking-widest shadow-[0_20px_40px_rgba(255,51,102,0.3)] hover:shadow-[0_25px_50px_rgba(255,51,102,0.5)] transition-all hover:-translate-y-1">
                  Iniciar Projeto <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </a>
              <div className="flex items-center gap-4">
                <a href="https://wa.me/5551981964238?text=Olá! Quero saber mais sobre a NovaesWeb." target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="glass-card border-white/10 text-white h-14 w-14 rounded-2xl p-0 hover:bg-white/5 transition-all">
                    <MessageCircle className="w-6 h-6" />
                  </Button>
                </a>
                {onOpenDemo && (
                  <Button
                    onClick={onOpenDemo}
                    variant="ghost"
                    className="text-white/60 hover:text-white font-bold text-xs uppercase tracking-widest h-14 px-6 gap-2"
                  >
                    🚀 Demonstração
                  </Button>
                )}
              </div>
            </motion.div>
          </div>

          {/* Right Column: Bento Grid Stats */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-4 h-full">
            <motion.div 
              variants={fade}
              className="col-span-2 glass-card rounded-[32px] p-8 relative overflow-hidden group border-white/5 h-[180px] flex flex-col justify-end"
            >
              <div className="absolute top-6 right-8 text-primary/20 group-hover:text-primary/40 transition-colors duration-500">
                <Star className="w-16 h-16 fill-current" />
              </div>
              <p className="text-5xl font-black text-white leading-none mb-2" ref={responsivo.ref}>{responsivo.count}%</p>
              <p className="text-xs uppercase tracking-[0.2em] text-white/40 font-bold">Performance & SEO</p>
            </motion.div>

            <motion.div 
              variants={fade}
              className="col-span-1 glass-card rounded-[32px] p-8 border-white/5 h-[220px] flex flex-col justify-between group hover:border-primary/30 transition-colors"
            >
              <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                <ArrowRight className="w-5 h-5 rotate-[-45deg]" />
              </div>
              <div>
                <p className="text-4xl font-black text-white mb-1" ref={empresas.ref}>{empresas.count}+</p>
                <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold leading-tight">Empresas <br />Escaladas</p>
              </div>
            </motion.div>

            <motion.div 
              variants={fade}
              className="col-span-1 glass-card rounded-[32px] p-8 border-white/5 h-[220px] flex flex-col justify-between bg-primary group hover:shadow-[0_20px_40px_rgba(255,51,102,0.3)] transition-all"
            >
              <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center text-white">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <p className="text-4xl font-black text-white mb-1" ref={entrega.ref}>{entrega.count}</p>
                <p className="text-[10px] uppercase tracking-widest text-white/80 font-bold leading-tight">Dias Médios <br />de Entrega</p>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </motion.section>
  );
}
