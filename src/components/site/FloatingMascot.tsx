import * as React from "react";
import { useState, useEffect, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

const mascotPhrases = [
  "Olá! 👋 Posso te ajudar?",
  "Criamos sites que vendem! 🚀",
  "Peça um orçamento grátis! ✨",
  "Automação no WhatsApp? Temos! 📱",
  "Seu negócio merece presença digital! 💡",
];

function RobotSVG({ isOpen }: { isOpen: boolean }) {
  return (
    <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Antenna */}
      <motion.line
        x1="28" y1="8" x2="28" y2="2"
        stroke="url(#grad1)" strokeWidth="2" strokeLinecap="round"
        animate={{ y2: isOpen ? 0 : 2 }}
      />
      <motion.circle
        cx="28" cy="2" r="2.5"
        fill="hsl(var(--accent))"
        animate={{ scale: isOpen ? [1, 1.3, 1] : 1 }}
        transition={{ duration: 1.5, repeat: isOpen ? Infinity : 0 }}
      />

      {/* Head */}
      <rect x="12" y="8" width="32" height="24" rx="6" fill="url(#grad1)" />
      
      {/* Eyes */}
      <motion.circle
        cx="21" cy="20" r="4"
        fill="white"
        animate={isOpen ? { scaleY: [1, 0.1, 1] } : {}}
        transition={{ duration: 0.3, delay: 2, repeat: Infinity, repeatDelay: 3 }}
      />
      <motion.circle
        cx="35" cy="20" r="4"
        fill="white"
        animate={isOpen ? { scaleY: [1, 0.1, 1] } : {}}
        transition={{ duration: 0.3, delay: 2, repeat: Infinity, repeatDelay: 3 }}
      />
      <circle cx="21" cy="20" r="2" fill="hsl(var(--background))" />
      <circle cx="35" cy="20" r="2" fill="hsl(var(--background))" />

      {/* Mouth */}
      <motion.path
        d={isOpen ? "M22 26 Q28 31 34 26" : "M22 26 Q28 28 34 26"}
        stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none"
        animate={isOpen ? { d: "M22 26 Q28 31 34 26" } : { d: "M22 26 Q28 28 34 26" }}
      />

      {/* Body */}
      <rect x="16" y="34" width="24" height="14" rx="4" fill="url(#grad2)" />

      {/* Arms */}
      <motion.rect
        x="6" y="36" width="8" height="4" rx="2"
        fill="hsl(var(--accent))"
        animate={isOpen ? { rotate: [0, -10, 0] } : {}}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
      <motion.rect
        x="42" y="36" width="8" height="4" rx="2"
        fill="hsl(var(--accent))"
        animate={isOpen ? { rotate: [0, 10, 0] } : {}}
        transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
      />

      {/* Body detail */}
      <circle cx="28" cy="41" r="2.5" fill="hsl(var(--accent))" opacity="0.7" />

      {/* Legs */}
      <rect x="20" y="49" width="5" height="5" rx="2" fill="hsl(var(--accent) / 0.8)" />
      <rect x="31" y="49" width="5" height="5" rx="2" fill="hsl(var(--accent) / 0.8)" />

      <defs>
        <linearGradient id="grad1" x1="12" y1="8" x2="44" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="hsl(var(--primary-novaesweb))" />
          <stop offset="1" stopColor="hsl(var(--accent))" />
        </linearGradient>
        <linearGradient id="grad2" x1="16" y1="34" x2="40" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="hsl(var(--accent) / 0.8)" />
          <stop offset="1" stopColor="hsl(var(--primary-novaesweb) / 0.8)" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function FloatingMascot() {
  const [isOpen, setIsOpen] = useState(false);
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [showBubble, setShowBubble] = useState(false);

  // Auto show bubble after 3s
  useEffect(() => {
    const timer = setTimeout(() => setShowBubble(true), 3000);
    const hideTimer = setTimeout(() => setShowBubble(false), 8000);
    return () => { clearTimeout(timer); clearTimeout(hideTimer); };
  }, []);

  // Rotate phrases when open
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setPhraseIndex((prev) => (prev + 1) % mascotPhrases.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [isOpen]);

  return (
    <div className="fixed bottom-8 left-6 z-[80] flex flex-col items-start gap-3">
      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="w-72 rounded-2xl overflow-hidden mb-2"
            style={{
              background: 'hsl(var(--card) / 0.95)',
              border: '1px solid hsl(var(--border))',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 20px 60px hsl(var(--primary-novaesweb) / 0.15)',
            }}
          >
            {/* Header */}
            <div
              className="px-4 py-3 flex items-center justify-between"
              style={{
                background: 'linear-gradient(135deg, hsl(var(--primary-novaesweb) / 0.2), hsl(var(--accent) / 0.15))',
                borderBottom: '1px solid hsl(var(--border))',
              }}
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs font-bold" style={{ color: 'hsl(var(--foreground) / 0.9)' }}>
                  NW Assistente
                </span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-3.5 h-3.5" style={{ color: 'hsl(var(--muted-foreground))' }} />
              </button>
            </div>

            {/* Messages */}
            <div className="p-4 space-y-3 min-h-[120px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={phraseIndex}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-start gap-2"
                >
                  <div className="w-8 h-8 flex-shrink-0">
                    <RobotSVG isOpen={true} />
                  </div>
                  <div
                    className="px-3 py-2 rounded-xl rounded-tl-sm text-sm"
                    style={{
                      background: 'hsl(var(--muted) / 0.5)',
                      color: 'hsl(var(--foreground) / 0.85)',
                    }}
                  >
                    {mascotPhrases[phraseIndex]}
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Quick actions */}
              <div className="flex flex-wrap gap-2 pt-2">
                {["Ver planos", "Orçamento", "WhatsApp"].map((action) => (
                  <button
                    key={action}
                    onClick={() => {
                      if (action === "Ver planos") {
                        document.getElementById("planos")?.scrollIntoView({ behavior: "smooth" });
                      } else if (action === "Orçamento") {
                        document.getElementById("cadastro")?.scrollIntoView({ behavior: "smooth" });
                      } else {
                        document.getElementById("contato")?.scrollIntoView({ behavior: "smooth" });
                      }
                      setIsOpen(false);
                    }}
                    className="px-3 py-1.5 rounded-full text-[11px] font-bold transition-all hover:scale-105"
                    style={{
                      background: 'hsl(var(--accent) / 0.15)',
                      color: 'hsl(var(--accent))',
                      border: '1px solid hsl(var(--accent) / 0.3)',
                    }}
                  >
                    {action}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Auto bubble hint */}
      <AnimatePresence>
        {showBubble && !isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, x: -10 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="px-3 py-2 rounded-xl text-xs font-bold mb-1 max-w-[180px]"
            style={{
              background: 'hsl(var(--card) / 0.9)',
              border: '1px solid hsl(var(--border))',
              color: 'hsl(var(--foreground) / 0.8)',
              backdropFilter: 'blur(12px)',
              boxShadow: '0 8px 24px hsl(var(--primary-novaesweb) / 0.1)',
            }}
          >
            Precisa de ajuda? 🤖
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mascot button */}
      <motion.button
        onClick={() => { setIsOpen(!isOpen); setShowBubble(false); }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        animate={{ y: [0, -4, 0] }}
        transition={{ y: { duration: 3, repeat: Infinity, ease: "easeInOut" } }}
        className="w-16 h-16 rounded-full flex items-center justify-center relative"
        style={{
          background: 'linear-gradient(135deg, hsl(var(--primary-novaesweb) / 0.3), hsl(var(--accent) / 0.25))',
          border: '2px solid hsl(var(--accent) / 0.4)',
          boxShadow: '0 8px 32px hsl(var(--accent) / 0.2), 0 0 20px hsl(var(--primary-novaesweb) / 0.1)',
          backdropFilter: 'blur(8px)',
        }}
        aria-label="Abrir assistente NW"
      >
        <RobotSVG isOpen={isOpen} />
        {!isOpen && (
          <span
            className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full animate-pulse"
            style={{ background: 'hsl(var(--accent))' }}
          />
        )}
      </motion.button>
    </div>
  );
}

export default memo(FloatingMascot);
