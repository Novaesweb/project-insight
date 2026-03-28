import { motion, AnimatePresence } from "framer-motion";
import { ANIMATION_CONFIG } from "@/lib/constants";

interface AdminMainContentProps {
  children: React.ReactNode;
  pathname: string;
}

export default function AdminMainContent({ children, pathname }: AdminMainContentProps) {
  return (
    <section className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-10">
      <div className="ambient-glow" />
      <AnimatePresence mode="wait">
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ 
            duration: ANIMATION_CONFIG.duration.normal, 
            ease: ANIMATION_CONFIG.easing.easeOut 
          }}
          className="relative z-10 max-w-7xl mx-auto"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
