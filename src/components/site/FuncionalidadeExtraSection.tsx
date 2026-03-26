import React from "react";
import { motion } from "framer-motion";
import { Box } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function FuncionalidadeExtraSection() {
  const navigate = useNavigate();

  return (
    <motion.section 
      id="extras"
      className="py-16 sm:py-32 px-4 sm:px-6 relative" 
      initial={{ opacity: 0 }} 
      whileInView={{ opacity: 1 }} 
      viewport={{ once: true, margin: "-100px" }}
    >
      <div className="max-w-7xl mx-auto flex flex-col items-center">
          <motion.button
            type="button"
            key="reveal-trigger"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/funcionalidades")}
            className="group relative flex flex-col sm:flex-row items-center gap-6 sm:gap-8 glass-card rounded-[2.5rem] px-6 py-8 sm:px-16 sm:py-10 border border-white/10 hover:border-red-500/50 transition-all duration-500 shadow-2xl overflow-hidden w-full max-w-[90vw] sm:max-w-none text-center sm:text-left z-10 cursor-pointer"
          >
            <div className="absolute inset-0 bg-gradient-to-b sm:bg-gradient-to-r from-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            <div className="relative shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-[1.25rem] sm:rounded-[1.5rem] bg-gradient-to-br from-red-500/20 to-pink-500/20 flex items-center justify-center text-red-500 group-hover:bg-red-500 group-hover:text-white transition-all duration-500 shadow-xl group-hover:shadow-red-500/20 pointer-events-none">
              <Box className="w-8 h-8 sm:w-10 sm:h-10 animate-pulse pointer-events-none" />
            </div>
            <div className="pointer-events-none">
              <span className="block text-2xl sm:text-4xl font-black text-white tracking-tighter uppercase group-hover:text-red-500 transition-colors pointer-events-none">Funcionalidades Estratégicas</span>
              <span className="block text-xs sm:text-sm text-white/40 uppercase tracking-[0.1em] sm:tracking-[0.2em] font-black mt-2 sm:mt-2 pointer-events-none">Clique para explorar o ecossistema →</span>
            </div>
          </motion.button>
      </div>
    </motion.section>
  );
}


