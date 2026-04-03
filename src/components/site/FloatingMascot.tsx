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

function NWRobotSVG({ isOpen, size = 56 }: { isOpen: boolean; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 140" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Glow behind */}
      <motion.ellipse
        cx="60" cy="130" rx="30" ry="6"
        fill="rgba(168,85,247,0.25)"
        animate={{ rx: isOpen ? [28, 34, 28] : 30 }}
        transition={{ duration: 2, repeat: Infinity }}
      />

      {/* Stars / sparkles on helmet */}
      <motion.path
        d="M38 18 L40 14 L42 18 L38 18 Z"
        fill="#60a5fa"
        animate={{ opacity: [0.4, 1, 0.4], scale: [0.8, 1.2, 0.8] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      <motion.path
        d="M76 12 L78 8 L80 12 L76 12 Z"
        fill="#a78bfa"
        animate={{ opacity: [0.5, 1, 0.5], scale: [0.9, 1.3, 0.9] }}
        transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
      />

      {/* Helmet (astronaut head) */}
      <ellipse cx="60" cy="42" rx="30" ry="32" fill="#1a1a2e" stroke="#334155" strokeWidth="2" />
      <ellipse cx="60" cy="42" rx="27" ry="29" fill="#0f0f23" />
      
      {/* Helmet visor glass effect */}
      <ellipse cx="60" cy="42" rx="24" ry="26" fill="url(#visorGrad)" opacity="0.15" />

      {/* NW Logo on face - N */}
      <motion.path
        d="M42 34 L42 52 L48 34 L48 52"
        stroke="url(#nwGrad)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none"
        animate={isOpen ? { filter: ["drop-shadow(0 0 4px #ec4899)", "drop-shadow(0 0 8px #ec4899)", "drop-shadow(0 0 4px #ec4899)"] } : {}}
        transition={{ duration: 2, repeat: Infinity }}
      />
      {/* NW Logo - W */}
      <motion.path
        d="M54 34 L57 52 L60 40 L63 52 L66 34"
        stroke="url(#nwGrad)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"
        animate={isOpen ? { filter: ["drop-shadow(0 0 4px #a855f7)", "drop-shadow(0 0 8px #a855f7)", "drop-shadow(0 0 4px #a855f7)"] } : {}}
        transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
      />

      {/* Headphones/ears */}
      <circle cx="30" cy="42" r="7" fill="#1e293b" stroke="#475569" strokeWidth="1.5" />
      <circle cx="30" cy="42" r="4" fill="#334155" />
      <circle cx="90" cy="42" r="7" fill="#1e293b" stroke="#475569" strokeWidth="1.5" />
      <circle cx="90" cy="42" r="4" fill="#334155" />

      {/* Body */}
      <path d="M40 72 L40 100 Q40 108 48 108 L72 108 Q80 108 80 100 L80 72 Q80 66 60 66 Q40 66 40 72 Z" fill="#1a1a2e" stroke="#334155" strokeWidth="1.5" />

      {/* NW on body (smaller) */}
      <path d="M52 82 L52 94 L56 82 L56 94" stroke="url(#nwGrad)" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.6" />
      <path d="M60 82 L62 94 L64 86 L66 94 L68 82" stroke="url(#nwGrad)" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.6" />

      {/* Left arm */}
      <motion.g
        animate={isOpen ? { rotate: [0, -15, 0] } : {}}
        transition={{ duration: 1.5, repeat: Infinity }}
        style={{ transformOrigin: "40px 78px" }}
      >
        <rect x="22" y="75" width="18" height="8" rx="4" fill="#1e293b" stroke="#475569" strokeWidth="1" />
        <circle cx="22" cy="79" r="5" fill="#1e293b" stroke="#475569" strokeWidth="1" />
        {/* Finger segments */}
        <rect x="14" y="76" width="8" height="3" rx="1.5" fill="#334155" />
        <rect x="14" y="80" width="6" height="2.5" rx="1.25" fill="#334155" />
      </motion.g>

      {/* Right arm - pointing up like in the image */}
      <motion.g
        animate={isOpen ? { rotate: [0, 10, 0] } : { rotate: -30 }}
        transition={{ duration: 1.5, repeat: isOpen ? Infinity : 0, delay: 0.3 }}
        style={{ transformOrigin: "80px 78px" }}
      >
        <rect x="80" y="75" width="18" height="8" rx="4" fill="#1e293b" stroke="#475569" strokeWidth="1" />
        <circle cx="98" cy="79" r="5" fill="#1e293b" stroke="#475569" strokeWidth="1" />
        {/* Pointing finger */}
        <rect x="96" y="70" width="3" height="10" rx="1.5" fill="#334155" />
        <rect x="100" y="74" width="3" height="7" rx="1.5" fill="#334155" />
      </motion.g>

      {/* Legs */}
      <rect x="44" y="108" width="10" height="14" rx="3" fill="#1e293b" stroke="#475569" strokeWidth="1" />
      <rect x="66" y="108" width="10" height="14" rx="3" fill="#1e293b" stroke="#475569" strokeWidth="1" />

      {/* Boots */}
      <path d="M42 119 L42 126 Q42 130 46 130 L56 130 Q58 130 58 128 L58 119 Z" fill="#0f172a" stroke="#475569" strokeWidth="1" />
      <path d="M62 119 L62 126 Q62 130 66 130 L76 130 Q78 130 78 128 L78 119 Z" fill="#0f172a" stroke="#475569" strokeWidth="1" />

      <defs>
        <linearGradient id="nwGrad" x1="42" y1="34" x2="66" y2="52" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ec4899" />
          <stop offset="0.5" stopColor="#a855f7" />
          <stop offset="1" stopColor="#6366f1" />
        </linearGradient>
        <radialGradient id="visorGrad" cx="60" cy="36" r="26" gradientUnits="userSpaceOnUse">
          <stop stopColor="#a855f7" stopOpacity="0.3" />
          <stop offset="1" stopColor="#1e1b4b" stopOpacity="0" />
        </radialGradient>
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
                    <NWRobotSVG isOpen={true} size={32} />
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
