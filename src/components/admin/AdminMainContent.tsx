import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface AdminMainContentProps {
  children: React.ReactNode;
  pathname: string;
}

export default function AdminMainContent({ children, pathname }: AdminMainContentProps) {
  return (
    <section className="flex-1 overflow-y-auto custom-scrollbar">
      <div className="p-5 lg:p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 max-w-[1400px] mx-auto"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
