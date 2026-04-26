import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Compass, CreditCard, Send } from "lucide-react";
import { cn } from "@/lib/utils";

export default function MobileAppNav() {
  const [activeItem, setActiveItem] = useState("inicio");

  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) element.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const updateActiveItem = () => {
      const resultsSection = document.getElementById("resultados");
      const plansSection = document.getElementById("planos");
      const budgetSection = document.getElementById("cadastro");
      const probe = window.scrollY + window.innerHeight * 0.34;

      if (window.scrollY < 120) {
        setActiveItem("inicio");
        return;
      }

      if (plansSection && probe >= plansSection.offsetTop - 80) {
        setActiveItem("planos");
        return;
      }

      if (resultsSection && probe >= resultsSection.offsetTop - 80) {
        setActiveItem("resultados");
        return;
      }

      if (budgetSection && probe >= budgetSection.offsetTop - 80) {
        setActiveItem("orcamento");
        return;
      }

      setActiveItem("inicio");
    };

    updateActiveItem();
    window.addEventListener("scroll", updateActiveItem, { passive: true });
    window.addEventListener("resize", updateActiveItem);

    return () => {
      window.removeEventListener("scroll", updateActiveItem);
      window.removeEventListener("resize", updateActiveItem);
    };
  }, []);

  const navItems = [
    { id: "inicio", label: "Inicio", icon: Compass, action: () => window.scrollTo({ top: 0, behavior: "smooth" }) },
    { id: "resultados", label: "Resultados", icon: Send, action: () => scrollTo("resultados") },
    { id: "planos", label: "Planos", icon: CreditCard, action: () => scrollTo("planos") },
  ];

  return (
    <div
      className="fixed left-1/2 z-[95] w-[94%] max-w-md -translate-x-1/2 lg:hidden"
      style={{ bottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
    >
      <div className="site-surface flex items-center justify-between rounded-[1.6rem] p-2 shadow-[0_20px_50px_rgba(0,0,0,0.45)]">
        {navItems.map((item) => (
          <motion.button
            key={item.id}
            whileTap={{ scale: 0.92 }}
            onClick={item.action}
            className={cn(
              "flex min-h-[62px] flex-1 flex-col items-center justify-center gap-1 rounded-xl py-2 transition-all",
              activeItem === item.id
                ? "border border-white/10 bg-[linear-gradient(180deg,hsl(var(--primary)/0.22),hsl(var(--accent)/0.18))] text-white shadow-lg shadow-primary/10"
                : "text-white/58 hover:text-white/88"
            )}
          >
            <item.icon className="h-5 w-5" />
            <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
