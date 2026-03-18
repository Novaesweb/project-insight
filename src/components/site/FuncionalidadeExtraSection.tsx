import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ShoppingBag, Layers, CalendarCheck, ChevronRight, Rocket } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

const fade = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };
const stagger = { show: { transition: { staggerChildren: 0.08 } } };

const extrasSlides = [
  { emoji: "🛒", title: "Sistema de Pedidos", desc: "Receba pedidos online organizados no painel." },
  { emoji: "📊", title: "Painel Administrativo", desc: "Controle total do seu negócio em um só lugar." },
  { emoji: "⭐", title: "Avaliação de Clientes", desc: "Seus clientes avaliam e você melhora sempre." },
  { emoji: "🎁", title: "Programa Fidelidade", desc: "Fidelize clientes com recompensas automáticas." },
];

function ExtrasCarousel() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx(p => (p + 1) % extrasSlides.length), 3000);
    return () => clearInterval(t);
  }, []);
  return (
    <div>
      <div className="overflow-hidden rounded-xl">
        <div className="flex transition-transform duration-500 ease-in-out" style={{ transform: `translateX(-${idx * 100}%)` }}>
          {extrasSlides.map((s, i) => (
            <div key={i} className="min-w-full px-2">
              <div className="glass-card rounded-xl p-8 text-center">
                <span className="text-5xl mb-4 block">{s.emoji}</span>
                <h4 className="font-bold text-[hsl(var(--foreground))] mb-2">{s.title}</h4>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-center gap-2 mt-4">
        {extrasSlides.map((_, i) => (
          <button key={i} onClick={() => setIdx(i)} className={`w-2 h-2 rounded-full transition-all duration-300 ${i === idx ? "w-6 gradient-primary" : "bg-[hsl(var(--muted))]"}`} />
        ))}
      </div>
      <p className="text-center text-sm text-[hsl(var(--muted-foreground))] mt-4 font-medium">Entre muitos outros recursos disponíveis</p>
    </div>
  );
}

export default function FuncionalidadeExtraSection() {
  return (
    <motion.section className="py-16 sm:py-24 px-4 sm:px-6" initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
      <div className="max-w-4xl mx-auto text-center">
        <motion.div variants={fade}>
          <Dialog>
            <DialogTrigger asChild>
              <button className="group inline-flex items-center gap-2 sm:gap-3 glass-card rounded-2xl px-5 sm:px-8 py-4 sm:py-5 border border-[hsl(var(--border))] hover:border-[hsl(var(--primary))] transition-all duration-300 cursor-pointer">
                <span className="text-2xl sm:text-3xl">⚙️</span>
                <span className="text-base sm:text-xl font-bold text-[hsl(var(--foreground))] group-hover:gradient-text transition-all">Funcionalidade Extra</span>
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-[hsl(var(--muted-foreground))] group-hover:text-[hsl(var(--primary))] transition-colors" />
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-[95vw] sm:max-w-4xl max-h-[85vh] overflow-y-auto bg-[hsl(var(--background))] border-[hsl(var(--border))] p-4 sm:p-8 rounded-2xl">
              <div className="text-center mb-5 sm:mb-8">
                <span className="text-3xl sm:text-4xl mb-2 sm:mb-3 block">⚙️</span>
                <h2 className="text-xl sm:text-2xl font-bold text-[hsl(var(--foreground))] mb-1 sm:mb-2">Funcionalidade Extra</h2>
                <p className="text-sm sm:text-base text-[hsl(var(--primary))] font-medium">Personalize seu site conforme a necessidade do seu negócio</p>
                <p className="text-xs sm:text-sm text-[hsl(var(--muted-foreground))] mt-1 sm:mt-2">Ferramenta que permite adicionar novas funções ao seu site conforme sua empresa cresce.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
                {[
                  { icon: <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />, title: "Sistema de Pedidos", desc: "Permite que seus clientes façam pedidos diretamente pelo site, organizando tudo no painel administrativo." },
                  { icon: <Layers className="w-4 h-4 sm:w-5 sm:h-5 text-[hsl(var(--primary))]" />, title: "Painel Administrativo", desc: "Gerencie produtos, pedidos, clientes e informações do site de forma simples e organizada." },
                  { icon: <CalendarCheck className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />, title: "Reservas e Agendamentos", desc: "Ideal para restaurantes, pizzarias e serviços que precisam organizar horários e reservas." },
                ].map((item, i) => (
                  <div key={i} className="glass-card rounded-xl p-4 sm:p-5 text-left">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-[hsl(var(--muted))]/50 flex items-center justify-center mb-2 sm:mb-3">{item.icon}</div>
                    <h4 className="font-semibold text-[hsl(var(--foreground))] mb-1 text-xs sm:text-sm">{item.title}</h4>
                    <p className="text-[10px] sm:text-xs text-[hsl(var(--muted-foreground))] leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>

              <div className="mb-4 sm:mb-6">
                <ExtrasCarousel />
              </div>

              <div className="glass-card rounded-xl p-4 sm:p-6 text-center">
                <Rocket className="w-6 h-6 sm:w-8 sm:h-8 text-[hsl(var(--primary))] mx-auto mb-2 sm:mb-3" />
                <h4 className="font-bold text-[hsl(var(--foreground))] mb-1 sm:mb-2 text-sm sm:text-base">Seu site evolui com o seu negócio</h4>
                <p className="text-xs sm:text-sm text-[hsl(var(--muted-foreground))]">Você pode adicionar novos recursos sempre que precisar, construindo o site de acordo com a ideia e necessidade da sua empresa.</p>
              </div>
            </DialogContent>
          </Dialog>
        </motion.div>
      </div>
    </motion.section>
  );
}
