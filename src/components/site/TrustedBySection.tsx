import { motion } from "framer-motion";
import { Coffee, Pizza, Scissors, Heart, ShoppingBag, Utensils } from "lucide-react";

const logos = [
  { name: "Dom Gallo Pizzaria", icon: Pizza, accent: "var(--warning)" },
  { name: "Açaí do Porto", icon: Utensils, accent: "var(--accent)" },
  { name: "Barbearia do Clã", icon: Scissors, accent: "210 70% 55%" },
  { name: "Clínica Vitalle", icon: Heart, accent: "var(--primary)" },
  { name: "Loja Concept", icon: ShoppingBag, accent: "var(--primary-novaesweb)" },
  { name: "Café de Elite", icon: Coffee, accent: "var(--warning)" },
];

export default function TrustedBySection() {
  return (
    <section className="py-20 relative" style={{ borderTop: '1px solid hsl(var(--border))', borderBottom: '1px solid hsl(var(--border))' }}>
      <div className="max-w-7xl mx-auto px-6 text-center">
        <span
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-[0.2em] mb-12"
          style={{
            background: 'hsl(var(--secondary))',
            border: '1px solid hsl(var(--border))',
            color: 'hsl(var(--muted-foreground) / 0.5)',
          }}
        >
          Portfólio de Engenharia
        </span>

        <div className="flex flex-wrap justify-center gap-x-10 gap-y-8 items-center">
          {logos.map((logo, i) => (
            <motion.div
              key={logo.name}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ scale: 1.08, y: -3 }}
              className="flex flex-col items-center gap-2.5 opacity-40 hover:opacity-80 transition-all duration-300 cursor-default"
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all"
                style={{ background: `hsl(${logo.accent} / 0.08)`, border: `1px solid hsl(${logo.accent} / 0.12)` }}
              >
                <logo.icon className="w-6 h-6" style={{ color: `hsl(${logo.accent} / 0.7)` }} />
              </div>
              <span className="text-[10px] font-bold text-muted-foreground tracking-wide">{logo.name}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
