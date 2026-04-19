import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ConfettiPieceProps {
  color: string;
}

const ConfettiPiece = ({ color }: ConfettiPieceProps) => {
  const randomX = Math.random() * 100;
  const randomDelay = Math.random() * 2;
  const randomDuration = 2 + Math.random() * 3;

  return (
    <motion.div
      initial={{ y: -20, x: `${randomX}vw`, opacity: 1, rotate: 0 }}
      animate={{ 
        y: "110vh", 
        rotate: 360,
        opacity: [1, 1, 0]
      }}
      transition={{ 
        duration: randomDuration, 
        delay: randomDelay,
        ease: "linear"
      }}
      className="fixed z-[9999] w-3 h-3 rounded-sm"
      style={{ backgroundColor: color }}
    />
  );
};

export const SuccessCelebration = ({ active, onComplete }: { active: boolean, onComplete: () => void }) => {
  const colors = ["#ff3366", "#00f2fe", "#4facfe", "#f093fb", "#f5576c"];
  
  useEffect(() => {
    if (active) {
      const timer = setTimeout(() => {
        onComplete();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [active, onComplete]);

  if (!active) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      {Array.from({ length: 50 }).map((_, i) => (
        <ConfettiPiece key={i} color={colors[i % colors.length]} />
      ))}
      <motion.div 
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1.2, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="fixed inset-0 flex items-center justify-center"
      >
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 px-8 py-4 rounded-3xl shadow-2xl">
          <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Tarefa Concluída! 🚀</h2>
        </div>
      </motion.div>
    </div>
  );
};
