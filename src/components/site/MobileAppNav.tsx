import { motion } from "framer-motion";
import { Home, Layout, UserPlus, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileAppNavProps {
  onOpenModal?: (type: string) => void;
}

export default function MobileAppNav({ onOpenModal }: MobileAppNavProps) {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const navItems = [
    { id: "hero", label: "Início", icon: Home, action: () => window.scrollTo({ top: 0, behavior: "smooth" }) },
    { id: "demos", label: "Demos", icon: Layout, action: () => scrollTo("demonstracao") },
    { id: "cadastro", label: "Começar", icon: UserPlus, action: () => scrollTo("cadastro"), highlight: true },
    { id: "whatsapp", label: "Suporte", icon: MessageCircle, action: () => window.open("https://wa.me/5511999999999", "_blank") }, // Placeholder WHATSAPP
  ];

  return (
    <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-[92%] max-w-lg">
      <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-2 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center justify-between">
        {navItems.map((item) => (
          <motion.button
            key={item.id}
            whileTap={{ scale: 0.9 }}
            onClick={item.action}
            className={cn(
              "flex flex-col items-center justify-center gap-1 flex-1 py-1.5 rounded-xl transition-all",
              item.highlight ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-600/20" : "text-white/60 hover:text-white"
            )}
          >
            <item.icon className={cn("w-5 h-5", item.highlight && "w-6 h-6 animate-pulse")} />
            <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
