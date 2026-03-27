import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, MessageSquare } from "lucide-react";

interface Slide {
  title: string;
  subtitle: string;
  image: string;
  icon?: string;
}

interface Story {
  id: string;
  slides: Slide[];
}

const stories: Record<string, Story> = {
  geral: {
    id: "geral",
    slides: [
      { title: "Seu negócio online agora", subtitle: "Sites, sistemas e automações para empresas locais.", image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800", icon: "🚀" },
      { title: "webnovax", subtitle: "Construindo o Futuro Digital do seu negócio.", image: "https://images.unsplash.com/photo-1551434678-e076c223a692?q=80&w=800", icon: "💎" }
    ]
  },
  delivery: {
    id: "delivery",
    slides: [
      { title: "Sistema para Delivery", subtitle: "Painel completo: pedidos, clientes e vendas.", image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=800", icon: "🍕" },
      { title: "Ideal para seu Negócio", subtitle: "Pizzarias, hamburguerias e lanchonetes.", image: "https://images.unsplash.com/photo-1552332386-f8dd00dc2f85?q=80&w=800", icon: "🍔" }
    ]
  },
  vitrine: {
    id: "vitrine",
    slides: [
      { title: "Site Vitrine + WhatsApp", subtitle: "O cliente te encontra e fala em 1 clique.", image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?q=80&w=800", icon: "📱" },
      { title: "Design Profissional", subtitle: "Bonito, moderno e focado em conversão.", image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=800", icon: "🎨" }
    ]
  },
  automacao: {
    id: "automacao",
    slides: [
      { title: "Automação no WhatsApp", subtitle: "Atenda mais, trabalhe menos, venda sempre.", image: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800", icon: "🤖" },
      { title: "Respostas Automáticas", subtitle: "WhatsApp atendendo clientes 24h por dia.", image: "https://images.unsplash.com/photo-1573164713988-8665fc963095?q=80&w=800", icon: "⚡" }
    ]
  }
};

interface StoryViewerProps {
  storyId: string;
  onClose: () => void;
}

export default function StoryViewer({ storyId, onClose }: StoryViewerProps) {
  const story = stories[storyId] || stories.geral;
  const [currentSlide, setCurrentSlide] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          if (currentSlide < story.slides.length - 1) {
            setCurrentSlide(currentSlide + 1);
            return 0;
          } else {
            onClose();
            return 100;
          }
        }
        return prev + 1;
      });
    }, 50); // 5 segundos por slide (100 * 50ms)

    return () => clearInterval(timer);
  }, [currentSlide, story, onClose]);

  const handleNext = () => {
    if (currentSlide < story.slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
      setProgress(0);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
      setProgress(0);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center sm:p-4 bg-black/95 sm:bg-black/60 sm:backdrop-blur-xl animate-in fade-in duration-300 overflow-hidden">
      {/* Background overlay for desktop */}
      <div className="absolute inset-0 hidden sm:block pointer-events-none" onClick={onClose} />
      
      <div className="relative w-full h-[100dvh] sm:h-auto sm:max-w-[420px] sm:aspect-[9/16] bg-[#070714] sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col">
        {/* Progress Bars */}
        <div className="absolute top-4 left-4 right-4 z-20 flex gap-1.5 px-2">
          {story.slides.map((_, idx) => (
            <div key={idx} className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-300 ease-linear"
                style={{ 
                  width: idx < currentSlide ? '100%' : idx === currentSlide ? `${progress}%` : '0%' 
                }}
              />
            </div>
          ))}
        </div>

        {/* Top Header */}
        <div className="absolute top-8 left-4 right-4 z-20 flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center font-bold text-white text-xs border border-white/20">
              N
            </div>
            <div>
              <p className="text-white text-xs font-bold leading-none tracking-wide">webnovax</p>
              <p className="text-white/40 text-[10px] uppercase tracking-widest mt-0.5">Patrocinado</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 bg-black/20 backdrop-blur-md rounded-full text-white/70 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Slide Content */}
        <AnimatePresence mode="wait">
          <motion.div 
            key={currentSlide}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 relative flex flex-col"
          >
            {/* Image */}
            <div className="absolute inset-0 z-0">
              <img src={story.slides[currentSlide].image} className="w-full h-full object-cover opacity-50" alt="" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#070714] via-transparent to-transparent" />
            </div>

            {/* Content Overlay */}
            <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-8 text-center mt-20">
              {story.slides[currentSlide].icon && (
                <div className="text-6xl mb-6 animate-bounce">
                  {story.slides[currentSlide].icon}
                </div>
              )}
              <h1 className="text-3xl font-black text-white leading-tight mb-4 tracking-tighter">
                {story.slides[currentSlide].title}
              </h1>
              <p className="text-lg text-white/70 leading-relaxed font-medium">
                {story.slides[currentSlide].subtitle}
              </p>
            </div>

            {/* Bottom Section */}
            <div className="relative z-10 p-8 pb-12 flex flex-col gap-4">
              <button 
                className="w-full py-4 bg-gradient-to-r from-primary to-accent rounded-2xl text-white font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 transition-transform active:scale-95 flex items-center justify-center gap-2"
                onClick={() => window.open('https://wa.me/5511999999999', '_blank')}
              >
                <MessageSquare size={18} /> Saiba Mais
              </button>
              <p className="text-center text-white/20 text-[10px] uppercase tracking-widest">Arraste para cima para consultar</p>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Click Areas for Navigation */}
        <div className="absolute inset-0 z-10 flex">
          <div className="w-1/3 h-full cursor-w-resize" onClick={(e) => { e.stopPropagation(); handlePrev(); }} />
          <div className="w-2/3 h-full cursor-e-resize" onClick={(e) => { e.stopPropagation(); handleNext(); }} />
        </div>
      </div>

      {/* Side Navigation for Desktop */}
      <div className="hidden sm:flex absolute left-8 top-1/2 -translate-y-1/2 flex-col gap-4">
         <button onClick={handlePrev} className="p-4 bg-white/10 backdrop-blur-md rounded-full text-white/50 hover:text-white transition-colors border border-white/10">
            <ChevronLeft size={32} />
         </button>
      </div>
      <div className="hidden sm:flex absolute right-8 top-1/2 -translate-y-1/2 flex-col gap-4">
         <button onClick={handleNext} className="p-4 bg-white/10 backdrop-blur-md rounded-full text-white/50 hover:text-white transition-colors border border-white/10">
            <ChevronRight size={32} />
         </button>
      </div>
    </div>
  );
}



