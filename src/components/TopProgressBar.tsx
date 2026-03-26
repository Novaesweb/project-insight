import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export default function TopProgressBar() {
  const { pathname } = useLocation();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setLoading(true);
    setProgress(0);

    // Quick ramp to 70%
    const t1 = setTimeout(() => setProgress(70), 50);
    // Complete to 100%
    const t2 = setTimeout(() => setProgress(100), 300);
    // Hide
    const t3 = setTimeout(() => setLoading(false), 600);

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [pathname]);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          className="absolute top-0 left-0 right-0 h-[3px] z-50 overflow-hidden"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="h-full rounded-r-full"
            style={{ background: "linear-gradient(135deg, #e8334a, #c2185b, #7b1fa2)" }}
            initial={{ width: "0%" }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          />
          {/* Shimmer effect */}
          <div className="absolute inset-0 shimmer-bar" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}


