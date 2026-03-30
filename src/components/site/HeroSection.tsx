import { memo, useEffect, useRef } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { ArrowRight, ShieldCheck, Zap, Star, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCompanyCounter } from "@/hooks/useCompanyCounter";

interface HeroSectionProps {
  onOpenDemo: () => void;
}

// Simpler animated counter
function AnimatedNumber({ target, suffix = "" }: { target: number; suffix?: string }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => `${Math.round(latest)}${suffix}`);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const controls = animate(count, target, { duration: 1.5, ease: "easeOut" });
    return controls.stop;
  }, [target, count]);

  return <motion.span ref={ref}>{rounded}</motion.span>;
}

// Reduced particles — only 4 instead of 8
const particles = [
  { delay: 0, x: "10%", y: "20%", size: 5 },
  { delay: 0.8, x: "85%", y: "15%", size: 4 },
  { delay: 1.5, x: "70%", y: "70%", size: 4 },
  { delay: 2, x: "20%", y: "75%", size: 3 },
];

function HeroSection({ onOpenDemo }: HeroSectionProps) {
  const companyCount = useCompanyCounter();

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24 pb-16">
      {/* Simplified gradient background — fewer layers, smaller blur */}
      <div className="absolute inset-0 z-0" aria-hidden="true">
        <div
          className="absolute top-0 -left-32 w-[600px] h-[600px] rounded-full blur-[150px]"
          style={{ background: 'radial-gradient(circle, hsl(262 70% 45% / 0.1), transparent 70%)' }}
        />
        <div
          className="absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full blur-[150px]"
          style={{ background: 'radial-gradient(circle, hsl(330 85% 60% / 0.08), transparent 70%)' }}
        />
      </div>

      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none" aria-hidden="true">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }} />
      </div>

      {/* Reduced floating particles */}
      <div className="absolute inset-0 pointer-events-none z-[1]" aria-hidden="true">
        {particles.map((p, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              left: p.x, top: p.y, width: p.size, height: p.size,
              background: `radial-gradient(circle, hsl(var(--accent)) 0%, transparent 70%)`,
              opacity: 0.15,
            }}
            animate={{ y: [0, -20, 0], opacity: [0.1, 0.2, 0.1] }}
            transition={{ duration: 5 + i, delay: p.delay, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}
      </div>

      {/* Spotlight */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120%] h-[500px] opacity-[0.05] pointer-events-none" aria-hidden="true"
        style={{ background: 'radial-gradient(ellipse at top, hsl(var(--accent)), transparent 70%)' }}
      />

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-5xl mx-auto text-center">

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full mb-12 relative"
            style={{
              border: '1px solid hsl(var(--accent) / 0.2)',
              background: 'hsl(var(--accent) / 0.05)',
            }}
          >
            <Sparkles className="w-3.5 h-3.5" style={{ color: 'hsl(var(--accent))' }} />
            <span className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: 'hsl(var(--muted-foreground))' }}>
              Architect v10.0 — Engenharia Digital
            </span>
          </motion.div>

          {/* Title — simple fade instead of letter-by-letter */}
          <div className="mb-8">
            <h1 className="text-5xl md:text-7xl lg:text-[5.8rem] font-black tracking-tighter leading-[0.85]">
              <motion.span
                className="block text-foreground/90"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                Estruturas digitais que
              </motion.span>
              <motion.span
                className="block gradient-text mt-2"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                atraem clientes
              </motion.span>
              <motion.span
                className="block text-foreground/30 mt-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                todos os dias
              </motion.span>
            </h1>
          </div>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-lg md:text-xl mb-14 max-w-2xl mx-auto leading-relaxed font-medium"
            style={{ color: 'hsl(var(--muted-foreground) / 0.7)' }}
          >
            Criamos sites profissionais, sistemas de pedidos e automações no WhatsApp que transformam visitantes em clientes de forma automática.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.97 }}>
              <Button
                onClick={onOpenDemo}
                className="h-16 px-12 rounded-2xl text-white text-lg font-black border-0 relative overflow-hidden group"
                style={{
                  background: 'var(--gradient-primary)',
                  boxShadow: '0 20px 60px hsl(var(--accent) / 0.3), 0 0 40px hsl(var(--accent) / 0.1)',
                }}
              >
                <span className="relative z-10 flex items-center gap-2">
                  Solicitar Demonstração
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform duration-300" />
                </span>
              </Button>
            </motion.div>

            <motion.a
              href="#planos"
              whileHover={{ scale: 1.03 }}
              className="h-14 px-8 rounded-2xl text-sm font-bold inline-flex items-center gap-2 transition-colors"
              style={{
                border: '1px solid hsl(var(--border))',
                color: 'hsl(var(--muted-foreground))',
                background: 'hsl(var(--secondary) / 0.3)',
              }}
            >
              Ver Planos
              <ArrowRight className="w-4 h-4" />
            </motion.a>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1 }}
            className="mt-20 grid grid-cols-3 gap-4 max-w-xl mx-auto"
          >
            {[
              { value: companyCount, suffix: "+", label: "Empresas", icon: Star },
              { value: 100, suffix: "%", label: "Satisfação", icon: ShieldCheck },
              { value: 7, suffix: "d", label: "Prazo médio", icon: Zap },
            ].map((stat) => (
              <motion.div
                key={stat.label}
                whileHover={{ y: -4 }}
                className="relative text-center py-5 px-3 rounded-2xl overflow-hidden group cursor-default"
                style={{
                  background: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                }}
              >
                <stat.icon className="w-4 h-4 mx-auto mb-2 opacity-40" style={{ color: 'hsl(var(--accent))' }} />
                <p className="text-2xl md:text-3xl font-black gradient-text">
                  <AnimatedNumber target={stat.value} suffix={stat.suffix} />
                </p>
                <p className="text-[10px] uppercase tracking-[0.2em] font-bold mt-1.5" style={{ color: 'hsl(var(--muted-foreground) / 0.4)' }}>
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </motion.div>

          {/* Trust bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="mt-16 pt-10 flex flex-wrap justify-center items-center gap-8 md:gap-14"
            style={{ borderTop: '1px solid hsl(var(--border))' }}
          >
            {[
              { icon: ShieldCheck, label: "Segurança Total", color: 'hsl(var(--accent))' },
              { icon: Zap, label: "Alta Velocidade", color: 'hsl(var(--primary-novaesweb))' },
              { icon: Star, label: "Suporte Premium", color: 'hsl(var(--accent-novaesweb))' },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-2 opacity-30 hover:opacity-70 transition-opacity duration-500 cursor-default"
              >
                <item.icon className="w-4 h-4" style={{ color: item.color, opacity: 0.6 }} />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: 'hsl(var(--muted-foreground))' }}>
                  {item.label}
                </span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default memo(HeroSection);
