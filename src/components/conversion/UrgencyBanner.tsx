import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, X } from "lucide-react";

interface UrgencyBannerProps {
  durationHours?: number;
  durationMinutes?: number;
  storageKey?: string;
}

export default function UrgencyBanner({ 
  durationHours = 2, 
  durationMinutes = 45,
  storageKey = "novaesweb_offer_end_time"
}: UrgencyBannerProps) {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    // Check if the user closed it in this session (optional, but good for UX)
    if (sessionStorage.getItem(storageKey + "_closed")) return;

    let endTime = localStorage.getItem(storageKey);

    if (!endTime) {
      // Set end time if not exists
      const targetDate = new Date();
      targetDate.setHours(targetDate.getHours() + durationHours);
      targetDate.setMinutes(targetDate.getMinutes() + durationMinutes);
      endTime = targetDate.getTime().toString();
      localStorage.setItem(storageKey, endTime);
    }

    const calculateTimeLeft = () => {
      const difference = parseInt(endTime!) - new Date().getTime();

      if (difference <= 0) {
        setIsExpired(true);
        return { hours: 0, minutes: 0, seconds: 0 };
      }

      return {
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60)
      };
    };

    setTimeLeft(calculateTimeLeft());
    setIsVisible(true);

    const timer = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);
      if (remaining.hours === 0 && remaining.minutes === 0 && remaining.seconds === 0) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [durationHours, durationMinutes, storageKey]);

  const handleClose = () => {
    setIsVisible(false);
    sessionStorage.setItem(storageKey + "_closed", "true");
  };

  if (!isVisible) return null;

  const pad = (num: number) => num.toString().padStart(2, '0');

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative z-50 w-full bg-gradient-to-r from-red-600 via-red-500 to-rose-600 text-white shadow-lg overflow-hidden"
        >
          {/* Animated background effect */}
          <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_50%,transparent_75%,transparent_100%)] bg-[length:250px_250px] animate-[shimmer_2s_linear_infinite]" />
          
          <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 relative z-10">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse" />
              <span className="text-xs sm:text-sm font-bold tracking-wide uppercase">
                {isExpired ? "Oferta Expirada!" : "Oferta Especial por Tempo Limitado"}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <div className="bg-black/20 backdrop-blur-sm rounded px-2 py-1 min-w-[36px] text-center font-mono font-black text-sm sm:text-base">
                  {pad(timeLeft.hours)}
                </div>
                <span className="font-bold animate-pulse">:</span>
                <div className="bg-black/20 backdrop-blur-sm rounded px-2 py-1 min-w-[36px] text-center font-mono font-black text-sm sm:text-base">
                  {pad(timeLeft.minutes)}
                </div>
                <span className="font-bold animate-pulse">:</span>
                <div className="bg-black/20 backdrop-blur-sm rounded px-2 py-1 min-w-[36px] text-center font-mono font-black text-sm sm:text-base text-red-200">
                  {pad(timeLeft.seconds)}
                </div>
              </div>
            </div>

            <button 
              onClick={handleClose}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-black/10 transition-colors"
            >
              <X className="w-4 h-4 opacity-70 hover:opacity-100" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
