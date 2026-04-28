import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Star, Quote } from "lucide-react";
import { cn } from "@/lib/utils";

const testimonials = [
  {
    id: 1,
    name: "Carlos Eduardo",
    company: "Restaurante Sabor & Arte",
    text: "O site e o cardápio digital mudaram nossa operação. Antes perdíamos muito tempo no WhatsApp anotando pedidos. Agora, o cliente entra, escolhe, e já chega tudo mastigado pra gente. Fantástico!",
    rating: 5,
    image: "https://i.pravatar.cc/150?u=carlos",
  },
  {
    id: 2,
    name: "Mariana Souza",
    company: "Clínica Bem Estar",
    text: "A presença digital da clínica estava muito defasada. A NovaesWeb entregou uma landing page belíssima, super rápida no celular e que passa muita credibilidade para os nossos pacientes.",
    rating: 5,
    image: "https://i.pravatar.cc/150?u=mariana",
  },
  {
    id: 3,
    name: "Roberto Almeida",
    company: "Almeida Imóveis",
    text: "Tivemos um aumento significativo nos contatos via WhatsApp depois que lançamos o novo site. A automação ajudou a não deixar nenhum cliente sem resposta.",
    rating: 5,
    image: "https://i.pravatar.cc/150?u=roberto",
  },
];

export default function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isHovered) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isHovered]);

  const handleNext = () => setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  const handlePrev = () => setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);

  return (
    <section id="depoimentos" className="site-band py-28 px-4 sm:px-6 relative overflow-hidden">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <span className="site-badge site-badge--accent mb-4">Experiência Comprovada</span>
          <h2 className="text-[clamp(2rem,7vw,3.75rem)] font-black text-white/90 leading-[0.92] tracking-tighter">
            O que nossos <span className="site-gradient-text">clientes</span> dizem
          </h2>
        </div>

        <div 
          className="relative"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="overflow-hidden rounded-[2rem] p-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 50, filter: "blur(4px)" }}
                animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, x: -50, filter: "blur(4px)" }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="site-surface rounded-[2rem] p-8 md:p-12 relative border border-white/5"
              >
                <Quote className="absolute top-8 right-8 w-16 h-16 text-white/5" />
                
                <div className="flex gap-1 mb-6">
                  {Array.from({ length: testimonials[currentIndex].rating }).map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-500 text-yellow-500" />
                  ))}
                </div>
                
                <p className="text-xl md:text-2xl text-white/80 font-medium leading-relaxed mb-8 relative z-10">
                  "{testimonials[currentIndex].text}"
                </p>
                
                <div className="flex items-center gap-4">
                  <img 
                    src={testimonials[currentIndex].image} 
                    alt={testimonials[currentIndex].name}
                    className="w-14 h-14 rounded-full border-2 border-white/10"
                    loading="lazy"
                  />
                  <div>
                    <h4 className="text-white/90 font-bold text-lg">{testimonials[currentIndex].name}</h4>
                    <p className="text-white/50 text-sm">{testimonials[currentIndex].company}</p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex justify-center items-center gap-6 mt-8">
            <button 
              onClick={handlePrev}
              className="w-12 h-12 rounded-full flex items-center justify-center site-surface border border-white/10 text-white/70 hover:text-white hover:border-white/30 transition-all hover:-translate-x-1"
              aria-label="Depoimento anterior"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={cn(
                    "w-2.5 h-2.5 rounded-full transition-all duration-300",
                    i === currentIndex ? "bg-primary w-8" : "bg-white/20 hover:bg-white/40"
                  )}
                  aria-label={`Ir para depoimento ${i + 1}`}
                />
              ))}
            </div>
            <button 
              onClick={handleNext}
              className="w-12 h-12 rounded-full flex items-center justify-center site-surface border border-white/10 text-white/70 hover:text-white hover:border-white/30 transition-all hover:translate-x-1"
              aria-label="Próximo depoimento"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
