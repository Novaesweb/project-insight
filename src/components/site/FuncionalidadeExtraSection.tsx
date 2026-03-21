import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShoppingBag, Layers, ChevronRight, 
  Search, Zap, MessageSquare, ShieldCheck, 
  Box, Star, TrendingUp
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
  'Cashback': <TrendingUp className="w-5 h-5" />,
  'Área VIP': <ShieldCheck className="w-5 h-5" />,
  'Cupom desconto': <Zap className="w-5 h-5" />,
  'Popup promoção': <MessageSquare className="w-5 h-5" />,
  'Banner promoções': <Layers className="w-5 h-5" />,
  'default': <Box className="w-5 h-5" />
};

const explanationMap: Record<string, string> = {
  'Popup promoção': 'Gere senso de urgência instantâneo com janelas de ofertas relâmpago que aumentam a conversão em até 35%.',
  'Cupom desconto': 'Sistema completo para criar códigos promocionais estratégicos e rastrear o sucesso das suas campanhas.',
  'Cashback': 'Fidelize seus clientes devolvendo uma porcentagem da compra em créditos para o próximo pedido, garantindo o retorno.',
  'Área VIP': 'Crie um clube exclusivo com conteúdos, preços e vantagens apenas para seus melhores clientes, gerando recorrência mensal.',
  'Fidelidade pontos': 'Gamifique o consumo transformando cada real gasto em pontos que o cliente troca por brindes ou descontos reais.',
  'Banner promoções': 'Banners dinâmicos e profissionais que destacam suas principais ofertas logo no topo da sua plataforma.'
};

export default function FuncionalidadeExtraSection() {
  const [extras, setExtras] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [explainingId, setExplainingId] = useState<string | null>(null);

  React.useEffect(() => {
    // Prioritize the requested items
    const priorityNames = [
      'Cashback', 'Área VIP', 'Cupom desconto', 
      'Fidelidade pontos', 'Popup promoção', 'Banner promoções'
    ];

    supabase.from("extras_catalogo")
      .select("*")
      .eq("status", "ativo")
      .in("nome", priorityNames)
      .then(({ data }) => {
        // Sort according to priorityNames order
        const sortedData = data?.sort((a, b) => 
          priorityNames.indexOf(a.nome) - priorityNames.indexOf(b.nome)
        ) || [];
        setExtras(sortedData);
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
      className="py-16 sm:py-32 px-4 sm:px-6 relative overflow-hidden bg-gradient-to-b from-transparent via-red-500/5 to-transparent" 
      initial={{ opacity: 0 }} 
      whileInView={{ opacity: 1 }} 
      viewport={{ once: true }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 space-y-4">
          <Badge className="bg-red-500/10 text-red-500 border-red-500/20 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest">
            Aumente suas Conversões
          </Badge>
          <h2 className="text-4xl sm:text-6xl font-black text-white tracking-tighter">
            Funcionalidades <span className="gradient-text">Estratégicas</span>
          </h2>
          <p className="text-white/40 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
            Módulos premium desenvolvidos para escalar seu faturamento e fidelizar seus clientes 
            de forma automática e inteligente.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            [1,2,3,4,5,6].map(i => (
              <div key={i} className="h-72 rounded-[2.5rem] bg-white/5 animate-pulse border border-white/5" />
            ))
          ) : (
            <>
              {extras.map((m, idx) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="group relative h-80 glass-card rounded-[2.5rem] border border-white/5 hover:border-red-500/30 transition-all duration-500 flex flex-col overflow-hidden"
                >
                  <AnimatePresence mode="wait">
                    {explainingId === m.id ? (
                      <motion.div 
                        key="explanation"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="absolute inset-0 p-8 flex flex-col justify-center bg-[#0d0d12] z-20"
                      >
                        <h4 className="text-red-500 text-[10px] font-black uppercase tracking-widest mb-4">Como funciona?</h4>
                        <p className="text-sm text-white/70 leading-relaxed italic">
                           "{explanationMap[m.nome] || m.descricao}"
                        </p>
                        <button 
                          onClick={() => setExplainingId(null)}
                          className="mt-8 text-[10px] font-black text-white/40 hover:text-white transition-colors uppercase tracking-widest"
                        >
                          Voltar ao card
                        </button>
                      </motion.div>
                    ) : (
                      <motion.div 
                        key="main"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col h-full p-8"
                      >
                        <div className="flex items-start justify-between">
                          <div className="relative">
                            <div className="absolute -inset-4 bg-red-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity rounded-full" />
                            <div className="relative w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-red-500 group-hover:bg-red-500 group-hover:text-white transition-all duration-500 shadow-xl group-hover:shadow-red-500/20">
                              {iconMap[m.nome] || iconMap['default']}
                            </div>
                          </div>
                          <Badge className="bg-red-500/5 text-red-500/70 border-white/5 text-[8px] font-black uppercase tracking-widest">
                            {m.categoria === 'fixo' ? 'Único' : m.categoria === 'intermediario' ? 'Pro' : 'Assinatura'}
                          </Badge>
                        </div>
                        
                        <div className="mt-8">
                          <h3 className="text-2xl font-black text-white group-hover:text-red-500 transition-colors uppercase tracking-tight">{m.nome}</h3>
                          <p className="text-xs text-white/40 mt-3 line-clamp-2 leading-relaxed">{m.descricao}</p>
                        </div>

                        <div className="mt-auto flex flex-col gap-4">
                          <button 
                            onClick={() => setExplainingId(m.id)}
                            className="text-[10px] font-black text-white/30 hover:text-red-500 transition-colors uppercase tracking-widest text-left"
                          >
                            Saiba como funciona →
                          </button>
                          
                          <div className="flex items-center justify-between pt-4 border-t border-white/5">
                            <span className="text-[10px] text-white/20 font-bold uppercase tracking-widest">{m.subcategoria || 'Estratégico'}</span>
                            <button 
                              onClick={() => handleAdd(m.nome)}
                              className="flex items-center gap-2 text-xs font-black text-white hover:text-red-500 transition-colors group/btn"
                            >
                              CONTRATAR <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}

              {/* Custom Creation Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 }}
                className="group relative h-80 rounded-[2.5rem] p-10 bg-gradient-to-br from-red-500/10 to-transparent border border-dashed border-red-500/20 hover:border-red-500/50 transition-all duration-500 flex flex-col justify-center text-center items-center"
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <h3 className="text-2xl font-black text-white mb-4 tracking-tighter group-hover:scale-105 transition-transform duration-500 uppercase">
                  Desenvolvimento <span className="text-red-500">Sob Medida</span>
                </h3>
                <p className="text-xs text-white/40 max-w-[240px] leading-relaxed mb-8">
                  Precisa de algo específico para seu modelo de negócio? Nossa equipe de engenharia 
                  cria qualquer automação para você.
                </p>
                <button 
                  onClick={handleCustom}
                  className="px-10 py-4 rounded-full bg-red-500 text-white text-[11px] font-black uppercase tracking-widest hover:bg-red-600 transition-all active:scale-95 shadow-lg shadow-red-500/20"
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

