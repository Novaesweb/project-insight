import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  ShoppingBag, Layers, Search, Zap, 
  MessageSquare, Star, TrendingUp, ShieldCheck, 
  Box, Smartphone, Code2, Cpu, Rocket
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const iconMap: Record<string, React.ReactNode> = {
  'Botão WhatsApp': <MessageSquare className="w-8 h-8 text-primary" />,
  'SEO de Elite': <Search className="w-8 h-8 text-primary" />,
  'Checkout Direto': <ShoppingBag className="w-8 h-8 text-primary" />,
  'Painel Business': <Layers className="w-8 h-8 text-primary" />,
  'Ultra Speed': <Zap className="w-8 h-8 text-primary" />,
  'Fidelidade pontos': <Star className="w-8 h-8 text-primary" />,
  'CRM Integrado': <ShieldCheck className="w-8 h-8 text-primary" />,
  'Cashback': <TrendingUp className="w-8 h-8 text-primary" />,
  'Área VIP': <ShieldCheck className="w-8 h-8 text-primary" />,
  'Cupom desconto': <Zap className="w-8 h-8 text-primary" />,
  'Popup promoção': <MessageSquare className="w-8 h-8 text-primary" />,
  'Banner promoções': <Layers className="w-8 h-8 text-primary" />,
  'default': <Box className="w-8 h-8 text-primary" />
};

const colorMap = [
  "from-pink-500/20 to-purple-500/20",
  "from-blue-500/20 to-cyan-500/20",
  "from-indigo-500/20 to-purple-500/20",
  "from-orange-500/20 to-red-500/20",
  "from-rose-500/20 to-pink-500/20",
  "from-emerald-500/20 to-teal-500/20",
];

export default function BentoFeatures() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchModules = async () => {
      const priorityNames = [
        'Cashback', 'Área VIP', 'Cupom desconto',
        'Fidelidade pontos', 'Popup promoção', 'Banner promoções'
      ];

      const { data } = await supabase.from("extras_catalogo")
        .select("*")
        .eq("status", "ativo");

      if (data) {
        const sorted = data.sort((a, b) => {
          const indexA = priorityNames.indexOf(a.nome);
          const indexB = priorityNames.indexOf(b.nome);
          if (indexA !== -1 && indexB !== -1) return indexA - indexB;
          if (indexA !== -1) return -1;
          if (indexB !== -1) return 1;
          return a.nome.localeCompare(b.nome);
        });
        setItems(sorted.slice(0, 6));
      }
      setLoading(false);
    };

    fetchModules();
  }, []);

  return (
    <section id="servicos" className="py-24 px-6 relative overflow-hidden bg-background/50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <motion.h2 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="text-4xl md:text-6xl font-black mb-6 tracking-tight"
          >
            Nossas <span className="gradient-text">Engrenagens</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground max-w-2xl mx-auto text-lg md:text-xl font-medium"
          >
            Módulos estratégicos desenvolvidos para acelerar o crescimento e a eficiência do seu negócio.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            [...Array(6)].map((_, i) => (
              <div key={i} className="bg-white/5 animate-pulse rounded-[2rem] h-[220px]" />
            ))
          ) : (
            items.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
                whileHover={{ 
                  scale: 1.02, 
                  transition: { duration: 0.2 }
                }}
                className="glass-panel-premium rounded-[2rem] p-7 relative overflow-hidden group hover:border-primary/40 transition-all border border-white/5 flex flex-col shadow-xl min-h-[220px]"
              >
                <div className={`absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br ${colorMap[idx % colorMap.length]} blur-[60px] opacity-20 group-hover:opacity-40 transition-opacity duration-700`} />
                
                <div className="relative z-10 flex flex-col h-full">
                  <div className="p-3 bg-white/5 rounded-xl w-fit mb-5 group-hover:bg-primary/10 transition-all duration-300">
                    <div className="[&>svg]:w-6 [&>svg]:h-6">
                      {iconMap[item.nome] || iconMap['default']}
                    </div>
                  </div>
                  <h3 className="text-lg font-bold mb-2 text-white tracking-tight uppercase">{item.nome}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed font-medium line-clamp-4">
                    {item.descricao}
                  </p>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}



