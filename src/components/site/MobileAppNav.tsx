import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Home, Layout, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface MobileAppNavProps {
  onOpenModal?: (type: string) => void;
}

export default function MobileAppNav({ onOpenModal }: MobileAppNavProps) {
  const [waNumber, setWaNumber] = useState("");
  const [activeItem, setActiveItem] = useState("inicio");

  useEffect(() => {
    supabase
      .from("app_config")
      .select("value")
      .eq("key", "whatsapp_number")
      .single()
      .then(({ data }) => {
        if (data?.value) setWaNumber(data.value);
      });
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const updateActiveItem = () => {
      const servicesSection = document.getElementById("o-que-fazemos");
      const formSection = document.getElementById("cadastro");
      const probe = window.scrollY + window.innerHeight * 0.38;

      if (formSection && probe >= formSection.offsetTop - 80) {
        setActiveItem("orcamento");
        return;
      }

      if (servicesSection && probe >= servicesSection.offsetTop - 80) {
        setActiveItem("servicos");
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
    { id: "inicio", label: "Início", icon: Home, action: () => window.scrollTo({ top: 0, behavior: "smooth" }) },
    { id: "servicos", label: "Serviços", icon: Layout, action: () => scrollTo("o-que-fazemos") },
    { id: "whatsapp", label: "WhatsApp", icon: MessageCircle, action: () => {
      const msg = encodeURIComponent("Olá! Estou no site da NovaesWeb e gostaria de uma consultoria gratuita.");
      window.open(`https://wa.me/${waNumber.replace(/\D/g, "")}?text=${msg}`, "_blank");
    }},
  ];

  return (
    <div
      className="lg:hidden fixed left-1/2 -translate-x-1/2 z-[95] w-[94%] max-w-md"
      style={{ bottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
    >
      <div className="site-surface rounded-[1.6rem] p-2 shadow-[0_20px_50px_rgba(0,0,0,0.45)] flex items-center justify-between">
        {navItems.map((item) => (
          <motion.button
            key={item.id}
            whileTap={{ scale: 0.9 }}
            onClick={item.action}
            className={cn(
              "flex flex-col items-center justify-center gap-1 flex-1 py-2 rounded-xl transition-all min-h-[62px]",
              activeItem === item.id
                ? "bg-[linear-gradient(180deg,hsl(var(--primary)/0.22),hsl(var(--accent)/0.18))] text-white border border-white/10 shadow-lg shadow-primary/10"
                : "text-white/58 hover:text-white/90"
            )}
          >
            <item.icon className={cn("w-5 h-5", activeItem === item.id && "scale-105")} />
            <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
