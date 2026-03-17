import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { nicheData } from "@/lib/niche-data";

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

export default function NicheCarousel() {
  const [current, setCurrent] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(3);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const maxIndex = Math.max(0, nicheData.length - itemsPerView);

  useEffect(() => {
    const updateView = () => {
      if (window.innerWidth < 640) setItemsPerView(1);
      else if (window.innerWidth < 1024) setItemsPerView(2);
      else setItemsPerView(3);
    };
    updateView();
    window.addEventListener("resize", updateView);
    return () => window.removeEventListener("resize", updateView);
  }, []);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCurrent((prev) => (prev >= maxIndex ? 0 : prev + 1));
    }, 3000);
  }, [maxIndex]);

  useEffect(() => {
    resetTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [resetTimer]);

  const go = (dir: "prev" | "next") => {
    setCurrent((prev) => dir === "prev" ? Math.max(0, prev - 1) : Math.min(maxIndex, prev + 1));
    resetTimer();
  };

  const totalDots = maxIndex + 1;

  return (
    <motion.div className="py-20 px-4" style={{ background: "#0a0a11" }} initial="hidden" whileInView="show" viewport={{ once: true }} variants={{ show: { transition: { staggerChildren: 0.1 } } }}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div variants={fadeUp} className="text-center mb-12">
          <span className="inline-block px-3 py-1 rounded-full glass-card text-xs text-[hsl(var(--muted-foreground))] font-medium mb-3">
            Para todo tipo de negócio
          </span>
          <h2 className="text-3xl font-bold text-[hsl(var(--foreground))]">Atendemos seu segmento com expertise</h2>
          <p className="text-[hsl(var(--muted-foreground))] mt-2">Do restaurante ao consultório, criamos soluções digitais para negócios locais de todo tipo</p>
        </motion.div>

        {/* Carousel */}
        <motion.div variants={fadeUp} className="relative">
          {/* Arrows */}
          <button onClick={() => go("prev")} className="absolute -left-4 lg:-left-6 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full flex items-center justify-center bg-[rgba(255,255,255,0.06)] border border-[hsl(var(--border))] hover:border-[hsl(var(--primary))] transition-colors">
            <ChevronLeft className="w-5 h-5 text-[hsl(var(--foreground))]" />
          </button>
          <button onClick={() => go("next")} className="absolute -right-4 lg:-right-6 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full flex items-center justify-center bg-[rgba(255,255,255,0.06)] border border-[hsl(var(--border))] hover:border-[hsl(var(--primary))] transition-colors">
            <ChevronRight className="w-5 h-5 text-[hsl(var(--foreground))]" />
          </button>

          {/* Cards Container */}
          <div className="overflow-hidden mx-4">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${current * (100 / itemsPerView)}%)` }}
            >
              {nicheData.map((niche) => (
                <div key={niche.slug} className="shrink-0 px-2" style={{ width: `${100 / itemsPerView}%` }}>
                  <div className="glass-card rounded-2xl p-6 h-full group hover:border-[hsl(var(--primary))] transition-all duration-300">
                    <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center mb-4 text-2xl">
                      {niche.emoji}
                    </div>
                    <h3 className="text-base font-semibold text-[hsl(var(--foreground))] mb-3">{niche.nome}</h3>
                    <ul className="space-y-1.5 mb-5">
                      {niche.items.map((item, i) => (
                        <li key={i} className="text-xs text-[hsl(var(--muted-foreground))] flex items-start gap-2">
                          <span className="w-1 h-1 rounded-full bg-[hsl(var(--primary))] mt-1.5 shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                    <Link to={`/nicho/${niche.slug}`}>
                      <Button variant="outline" size="sm" className="w-full glass-card border-[hsl(var(--border))] text-[hsl(var(--foreground))] hover:border-[hsl(var(--primary))] text-xs rounded-lg">
                        Ver exemplo
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dots */}
          <div className="flex justify-center gap-2 mt-6">
            {Array.from({ length: totalDots }).map((_, i) => (
              <button
                key={i}
                onClick={() => { setCurrent(i); resetTimer(); }}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${i === current ? "w-6 gradient-primary" : "bg-[hsl(var(--muted))]"}`}
              />
            ))}
          </div>
        </motion.div>

        {/* Bottom CTA */}
        <motion.div variants={fadeUp} className="text-center mt-12">
          <p className="text-[hsl(var(--muted-foreground))] mb-4">
            Não encontrou seu segmento? A gente atende qualquer tipo de negócio local.
          </p>
          <a href="https://wa.me/5500000000000?text=Olá! Quero um site para meu negócio." target="_blank" rel="noopener noreferrer">
            <Button className="bg-[#25D366] hover:bg-[#20bd5a] text-white h-11 px-6 rounded-xl text-sm font-semibold">
              <MessageCircle className="w-5 h-5 mr-2" /> Falar no WhatsApp
            </Button>
          </a>
        </motion.div>
      </div>
    </motion.div>
  );
}
