import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Star, CheckCircle2, MapPin } from "lucide-react";

// Fake data for demonstration
const fakePurchases = [
  { name: "João Silva", location: "São Paulo, SP", action: "acaba de contratar o plano Premium", time: "agora mesmo", icon: Star },
  { name: "Maria Oliveira", location: "Rio de Janeiro, RJ", action: "adicionou Checkout Direto ao projeto", time: "há 2 minutos", icon: ShoppingBag },
  { name: "Carlos e Santos", location: "Belo Horizonte, MG", action: "contratou a Área VIP", time: "há 5 minutos", icon: Star },
  { name: "Ana Costa", location: "Curitiba, PR", action: "assinou o plano Advanced", time: "agora mesmo", icon: CheckCircle2 },
  { name: "Pedro Almeida", location: "Porto Alegre, RS", action: "comprou o módulo de Cashback", time: "há 12 minutos", icon: ShoppingBag },
  { name: "Luciana Freitas", location: "Salvador, BA", action: "começou um projeto sob medida", time: "há 1 hora", icon: CheckCircle2 },
];

export default function SocialProofPopup({
  intervalMs = 25000, 
  visibleMs = 5000,
  maxDisplays = 10,
  position = "bottom-left"
}: { 
  intervalMs?: number; 
  visibleMs?: number;
  maxDisplays?: number;
  position?: "bottom-left" | "bottom-right";
}) {
  const [currentPurchase, setCurrentPurchase] = useState<typeof fakePurchases[0] | null>(null);
  const [displayCount, setDisplayCount] = useState(0);

  useEffect(() => {
    // Initial delay so it doesn't pop up immediately
    const initialDelay = setTimeout(() => {
      showRandomPurchase();
    }, 5000);

    const interval = setInterval(() => {
      showRandomPurchase();
    }, intervalMs);

    return () => {
      clearTimeout(initialDelay);
      clearInterval(interval);
    };
  }, [displayCount, maxDisplays, intervalMs]);

  const showRandomPurchase = () => {
    if (displayCount >= maxDisplays) return;
    
    // Pick a random purchase that is different from the current one
    let randomIndex;
    do {
      randomIndex = Math.floor(Math.random() * fakePurchases.length);
    } while (fakePurchases[randomIndex] === currentPurchase && fakePurchases.length > 1);
    
    setCurrentPurchase(fakePurchases[randomIndex]);
    setDisplayCount(prev => prev + 1);

    // Hide it after visibleMs
    setTimeout(() => {
      setCurrentPurchase(null);
    }, visibleMs);
  };

  const positionClasses = position === "bottom-left" 
    ? "left-4 sm:left-6 bottom-4 sm:bottom-6" 
    : "right-4 sm:right-6 bottom-4 sm:bottom-6";

  return (
    <AnimatePresence>
      {currentPurchase && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className={`fixed z-40 ${positionClasses} max-w-[320px] w-full`}
        >
          <div className="bg-[#0f0f13]/95 backdrop-blur-md border border-white/10 rounded-2xl p-4 shadow-[0_8px_30px_rgb(0,0,0,0.5)] flex items-start gap-4 hover:border-red-500/30 transition-colors cursor-default group">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500/20 to-rose-500/10 flex items-center justify-center shrink-0 border border-red-500/20 group-hover:bg-red-500/30 transition-colors">
              <currentPurchase.icon className="w-5 h-5 text-red-500" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="font-bold text-white text-sm truncate">{currentPurchase.name}</span>
                <span className="text-[10px] text-white/40 whitespace-nowrap">{currentPurchase.time}</span>
              </div>
              <p className="text-xs text-white/70 leading-relaxed">
                {currentPurchase.action}
              </p>
              <div className="flex items-center gap-1 mt-2 text-white/30">
                <MapPin className="w-3 h-3" />
                <span className="text-[10px] uppercase font-bold tracking-wider">{currentPurchase.location}</span>
                <div className="ml-auto flex items-center gap-1 text-[9px] text-red-500/60 font-medium">
                  <CheckCircle2 className="w-3 h-3" /> Verificado
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
