import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShoppingBag, Layers, ChevronRight, 
  Search, Zap, MessageSquare, ShieldCheck, 
  Box, Star
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

const iconMap: Record<string, React.ReactNode> = {
  'Botão WhatsApp': <MessageSquare className="w-5 h-5" />,
  'SEO de Elite': <Search className="w-5 h-5" />,
  'Checkout Direto': <ShoppingBag className="w-5 h-5" />,
  'Painel Business': <Layers className="w-5 h-5" />,
  'Ultra Speed': <Zap className="w-5 h-5" />,
  'Fidelidade pontos': <Star className="w-5 h-5" />,
  'CRM Integrado': <ShieldCheck className="w-5 h-5" />,
  'default': <Box className="w-5 h-5" />
};

export default function FuncionalidadeExtraSection() {
  const [extras, setExtras] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    supabase.from("extras_catalogo")
      .select("*")
      .eq("status", "ativo")
      .order("preco_ativacao", { ascending: false })
      .limit(6)
      .then(({ data }) => {
        setExtras(data || []);
        setLoading(false);
      });
  }, []);

  const handleAdd = (name: string) => {
    const msg = encodeURIComponent(`Olá! Vi no site a funcionalidade "${name}" e gostaria de saber como adicionar ao meu projeto.`);
    window.open(`https://wa.me/5511999999999?text=${msg}`, "_blank");
  };

  const handleCustom = () => {
    const msg = encodeURIComponent(`Olá! Tenho uma ideia de funcionalidade personalizada para o meu projeto e gostaria de um orçamento.`);
    window.open(`https://wa.me/5511999999999?text=${msg}`, "_blank");
  };

  return (
    <motion.section 
      id="extras"
      className="py-16 sm:py-32 px-4 sm:px-6 relative overflow-hidden" 
      initial={{ opacity: 0 }} 
      whileInView={{ opacity: 1 }} 
      viewport={{ once: true }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 space-y-4">
          <Badge className="bg-red-500/10 text-red-500 border-red-500/20 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest">
            Ecossistema NovaesWeb
          </Badge>
          <h2 className="text-4xl sm:text-6xl font-black text-white tracking-tighter">
            Turbine seu <span className="gradient-text">Projeto</span>
          </h2>
          <p className="text-white/40 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
            Escolha as funcionalidades certas para seu modelo de negócio. Tecnologia de ponta, 
            estratégica e pronta para escalar.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            [1,2,3,4,5,6].map(i => (
              <div key={i} className="h-64 rounded-[2.5rem] bg-white/5 animate-pulse border border-white/5" />
            ))
          ) : (
            <>
              {extras.map((m, idx) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="group relative h-64 glass-card rounded-[2.5rem] p-8 border border-white/5 hover:border-red-500/30 transition-all duration-500 flex flex-col justify-between overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="relative z-10">
                    <div className="flex items-start justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-red-500 group-hover:bg-red-500 group-hover:text-white transition-all duration-500 shadow-xl group-hover:shadow-red-500/20">
                        {iconMap[m.nome] || iconMap['default']}
                      </div>
                      <Badge className="bg-red-500/5 text-red-500/70 border-0 text-[8px] font-black uppercase tracking-widest">
                        {m.categoria === 'fixo' ? 'Único' : m.categoria === 'intermediario' ? 'Pro' : 'Assinatura'}
                      </Badge>
                    </div>
                    
                    <div className="mt-6">
                      <h3 className="text-xl font-bold text-white group-hover:text-red-500 transition-colors uppercase tracking-tight">{m.nome}</h3>
                      <p className="text-xs text-white/40 mt-2 line-clamp-2 leading-relaxed">{m.descricao}</p>
                    </div>
                  </div>

                  <div className="relative z-10 flex items-center justify-between pt-4 border-t border-white/5">
                    <span className="text-[10px] text-white/20 font-bold uppercase tracking-widest">{m.subcategoria || 'Digital'}</span>
                    <button 
                      onClick={() => handleAdd(m.nome)}
                      className="flex items-center gap-2 text-xs font-black text-white hover:text-red-500 transition-colors group/btn"
                    >
                      CONTRATAR <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </motion.div>
              ))}

              {/* Infinite Possibilities Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 }}
                className="group relative h-64 rounded-[2.5rem] p-8 bg-gradient-to-br from-white/5 to-transparent border border-dashed border-white/10 hover:border-red-500/50 transition-all duration-500 flex flex-col justify-center text-center items-center"
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <h3 className="text-2xl font-black text-white mb-3 tracking-tighter group-hover:scale-105 transition-transform duration-500">
                  E Muito <span className="text-red-500">Mais...</span>
                </h3>
                <p className="text-xs text-white/40 max-w-[200px] leading-relaxed mb-6">
                  Seu projeto é único. Adicionamos qualquer funcionalidade sob demanda para atender 
                  perfeitamente seu negócio.
                </p>
                <button 
                  onClick={handleCustom}
                  className="px-6 py-2.5 rounded-full bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:border-red-500 transition-all active:scale-95"
                >
                  Criar do meu jeito
                </button>
              </motion.div>
            </>
          )}
        </div>
      </div>
    </motion.section>
  );
}

