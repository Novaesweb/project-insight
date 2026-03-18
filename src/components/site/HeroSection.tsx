import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, MessageCircle, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAnimatedCounter } from "@/hooks/useAnimatedCounter";

const fade = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };
const stagger = { show: { transition: { staggerChildren: 0.08 } } };
const heroWords = ["negócio", "futuro", "empresa", "projeto", "resultado"];

export default function HeroSection() {
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
    <motion.section className="pt-12 pb-24 px-6" initial="hidden" animate="show" variants={stagger}>
      <div className="max-w-5xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <motion.div variants={fade} className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card text-xs text-[hsl(var(--muted-foreground))] font-medium mb-6">
              <Star className="w-3.5 h-3.5 text-[hsl(var(--primary))]" />
              Soluções digitais para empresas
            </motion.div>
            <motion.h1 variants={fade} className="text-4xl sm:text-5xl lg:text-[3.5rem] font-extrabold text-[hsl(var(--foreground))] leading-[1.1] tracking-tight">
              Tecnologia que{" "}
              <span className="gradient-text fx-glintReveal">transforma</span>
              {" "}seu{" "}
              <AnimatePresence mode="wait">
                <motion.span
                  key={heroWord}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4 }}
                  className="inline-block gradient-text"
                >
                  {heroWord}
                </motion.span>
              </AnimatePresence>
            </motion.h1>
            <motion.p variants={fade} className="text-base text-[hsl(var(--muted-foreground))] mt-6 leading-relaxed max-w-lg">
              Desenvolvemos sites, sistemas e aplicativos sob medida para empresas que buscam organização, presença digital e resultados reais.
            </motion.p>
            <motion.div variants={fade} className="flex flex-col sm:flex-row gap-3 mt-8">
              <Link to="/cadastro">
                <Button className="gradient-primary border-0 text-white h-12 px-8 rounded-xl text-sm font-semibold shadow-lg shadow-[hsl(var(--primary))]/20">
                  Começar meu projeto <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <a href="https://wa.me/5551981964238?text=Olá! Quero saber mais sobre os serviços da NovaesWeb." target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="glass-card border-[hsl(var(--border))] text-[hsl(var(--foreground))] h-12 px-8 rounded-xl text-sm hover:bg-[hsl(var(--muted))]">
                  <MessageCircle className="w-4 h-4 mr-2" /> WhatsApp
                </Button>
              </a>
            </motion.div>
          </div>
          <motion.div variants={fade} className="hidden lg:grid grid-cols-2 gap-4">
            <div ref={empresas.ref} className="glass-card rounded-2xl p-6 text-center info-card-hover cursor-default">
              <p className="text-2xl font-bold gradient-text">{empresas.count}+</p>
              <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1 font-medium">Empresas atendidas</p>
            </div>
            <div ref={entrega.ref} className="glass-card rounded-2xl p-6 text-center info-card-hover cursor-default">
              <p className="text-2xl font-bold gradient-text">{entrega.count}</p>
              <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1 font-medium">Dias de entrega</p>
            </div>
            <div ref={responsivo.ref} className="glass-card rounded-2xl p-6 text-center info-card-hover cursor-default">
              <p className="text-2xl font-bold gradient-text">{responsivo.count}%</p>
              <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1 font-medium">Responsivo</p>
            </div>
            <div ref={atendimento.ref} className="glass-card rounded-2xl p-6 text-center info-card-hover cursor-default">
              <p className="text-2xl font-bold gradient-text">{atendimento.count}h</p>
              <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1 font-medium">Atendimento rápido</p>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}
