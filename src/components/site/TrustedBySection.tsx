import { motion } from "framer-motion";
import { Coffee, Pizza, Scissors, Heart, ShoppingBag, Utensils } from "lucide-react";
import { cn } from "@/lib/utils";

const logos = [
  { name: "Dom Gallo Pizzaria", icon: Pizza, color: "text-orange-500", glow: "rgba(249,115,22,0.15)" },
  { name: "Açaí do Porto", icon: Utensils, color: "text-purple-500", glow: "rgba(168,85,247,0.15)" },
  { name: "Barbearia do Clã", icon: Scissors, color: "text-blue-400", glow: "rgba(96,165,250,0.15)" },
  { name: "Clínica Vitalle", icon: Heart, color: "text-rose-500", glow: "rgba(244,63,94,0.15)" },
  { name: "Loja Concept", icon: ShoppingBag, color: "text-pink-500", glow: "rgba(236,72,153,0.15)" },
  { name: "Café de Elite", icon: Coffee, color: "text-amber-500", glow: "rgba(245,158,11,0.15)" },
];

export default function TrustedBySection() {
  return (
    <section className="py-24 border-y border-white/[0.04] bg-white/[0.01]">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-[10px] uppercase font-bold tracking-[0.2em] text-white/30 mb-12">
          Portfólio de Engenharia
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {logos.map((logo, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              viewport={{ once: true }}
              className="flex flex-col items-center justify-center gap-4 group cursor-default"
            >
              <div className="relative">
                {/* Glow effect */}
                <div 
                  className="absolute inset-0 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ backgroundColor: logo.glow }}
                />
                
                <div className="relative w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center group-hover:scale-110 group-hover:border-white/20 transition-all duration-500 shadow-xl overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <logo.icon className={cn("w-7 h-7 transition-all duration-500", logo.color)} />
                </div>
              </div>
              
              <div className="flex flex-col gap-0.5">
                <span className="text-[11px] font-black text-white/60 tracking-tight group-hover:text-white transition-colors">{logo.name}</span>
                <div className="h-0.5 w-0 group-hover:w-full bg-gradient-to-r from-transparent via-purple-500 to-transparent transition-all duration-500 mx-auto" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
