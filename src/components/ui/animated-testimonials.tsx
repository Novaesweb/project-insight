import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Testimonial {
  description: string;
  image: string;
  name: string;
  handle: string;
}

interface AnimatedTestimonialsProps {
  data: Testimonial[];
  autoplay?: boolean;
  interval?: number;
}

export function AnimatedTestimonials({ data, autoplay = true, interval = 5000 }: AnimatedTestimonialsProps) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (!autoplay) return;
    const t = setInterval(() => setActive((p) => (p + 1) % data.length), interval);
    return () => clearInterval(t);
  }, [autoplay, interval, data.length]);

  const prev = () => setActive((p) => (p - 1 + data.length) % data.length);
  const next = () => setActive((p) => (p + 1) % data.length);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
        {/* Image - only show if provided */}
        {data[active].image && (
          <div className="relative w-48 h-48 md:w-64 md:h-64 shrink-0">
            <AnimatePresence mode="wait">
              <motion.img
                key={active}
                src={data[active].image}
                alt={data[active].name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4 }}
                className="w-full h-full rounded-2xl object-cover shadow-xl"
              />
            </AnimatePresence>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 text-center md:text-left">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <p className="text-[hsl(var(--foreground))] leading-relaxed text-sm md:text-base italic mb-6">
                "{data[active].description}"
              </p>
              <p className="text-base font-bold text-[hsl(var(--foreground))]">
                {data[active].name}
              </p>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                {data[active].handle}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Controls */}
          <div className="flex items-center gap-4 mt-6 justify-center md:justify-start">
            <button
              onClick={prev}
              className="w-9 h-9 rounded-full bg-[hsl(var(--muted))] flex items-center justify-center hover:bg-[hsl(var(--primary))]/20 transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-[hsl(var(--foreground))]" />
            </button>
            <div className="flex gap-1.5">
              {data.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === active
                      ? "w-6 bg-[hsl(var(--primary))]"
                      : "w-1.5 bg-[hsl(var(--muted-foreground))]/30"
                  }`}
                />
              ))}
            </div>
            <button
              onClick={next}
              className="w-9 h-9 rounded-full bg-[hsl(var(--muted))] flex items-center justify-center hover:bg-[hsl(var(--primary))]/20 transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-[hsl(var(--foreground))]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


