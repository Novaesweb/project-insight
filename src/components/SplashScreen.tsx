import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);
  const [text, setText] = useState("");
  const [visible, setVisible] = useState(true);
  const fullText = "Carregando seu painel...";

  useEffect(() => {
    // Typing effect
    let i = 0;
    const typeInterval = setInterval(() => {
      if (i <= fullText.length) {
        setText(fullText.slice(0, i));
        i++;
      } else {
        clearInterval(typeInterval);
      }
    }, 60);

    // Progress bar
    const start = Date.now();
    const duration = 2000;
    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - start;
      const p = Math.min((elapsed / duration) * 100, 100);
      setProgress(p);
      if (p >= 100) {
        clearInterval(progressInterval);
        setTimeout(() => {
          setVisible(false);
          setTimeout(onComplete, 400);
        }, 300);
      }
    }, 20);

    return () => {
      clearInterval(typeInterval);
      clearInterval(progressInterval);
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
          style={{ background: "#0d0d14" }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
        >
          {/* Background glow */}
          <div className="ambient-glow absolute inset-0 pointer-events-none" />
          {/* Logo */}
          <motion.h1
            className="text-3xl md:text-4xl font-bold gradient-text mb-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            NovaesWeb
          </motion.h1>

          {/* Typing text */}
          <motion.p
            className="text-sm text-white/50 mb-6 h-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {text}
            <span className="animate-pulse">|</span>
          </motion.p>

          {/* Progress bar */}
          <div className="w-64 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
            <motion.div
              className="h-full rounded-full"
              style={{
                background: "linear-gradient(135deg, #e8334a, #c2185b, #7b1fa2)",
                width: `${progress}%`,
              }}
              transition={{ ease: "linear" }}
            />
          </div>

          {/* Version */}
          <p className="absolute bottom-6 right-6 text-[10px] text-white/20">v1.0 — NovaesWeb</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
