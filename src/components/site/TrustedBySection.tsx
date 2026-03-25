import { motion } from "framer-motion";
import { Coffee, Pizza, Scissors, Heart, ShoppingBag, Utensils } from "lucide-react";

const logos = [
  { name: "Dom Gallo Pizzaria", icon: Pizza },
  { name: "Açaí do Porto", icon: Utensils },
  { name: "Barbearia do Clã", icon: Scissors },
  { name: "Clínica Vitalle", icon: Heart },
  { name: "Loja Concept", icon: ShoppingBag },
  { name: "Café de Elite", icon: Coffee },
];

export default function TrustedBySection() {
  return (
    <section className="py-20 border-y border-white/5 bg-white/[0.01]">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <p className="text-[10px] uppercase tracking-[0.3em] text-white/20 font-bold mb-12">
          Empresas que confiam na Engenharia NovaesWeb
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 opacity-40 hover:opacity-80 transition-opacity duration-500 grayscale hover:grayscale-0">
          {logos.map((logo, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="flex flex-col items-center justify-center gap-3 group"
            >
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                <logo.icon className="w-6 h-6 text-white" />
              </div>
              <span className="text-[11px] font-bold text-white/60 tracking-tight">{logo.name}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
