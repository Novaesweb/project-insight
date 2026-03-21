import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShoppingBag, Layers, ChevronRight, 
  Search, Zap, MessageSquare, ShieldCheck, 
  Box, Star, TrendingUp
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
  const [isRevealed, setIsRevealed] = useState(false);

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
      className="py-16 sm:py-32 px-4 sm:px-6 relative overflow-hidden" 
      initial={{ opacity: 0 }} 
      whileInView={{ opacity: 1 }} 
      viewport={{ once: true }}
    >
      <div className="max-w-7xl mx-auto flex flex-col items-center">
        {!isRevealed ? (
          <motion.button
            key="reveal-trigger"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsRevealed(true)}
            className="group relative flex flex-col sm:flex-row items-center gap-6 sm:gap-8 glass-card rounded-[2.5rem] px-6 py-8 sm:px-16 sm:py-10 border border-white/10 hover:border-red-500/50 transition-all duration-500 shadow-2xl overflow-hidden w-full max-w-[90vw] sm:max-w-none text-center sm:text-left"
          >
            <div className="absolute inset-0 bg-gradient-to-b sm:bg-gradient-to-r from-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-[1.25rem] sm:rounded-[1.5rem] bg-gradient-to-br from-red-500/20 to-pink-500/20 flex items-center justify-center text-red-500 group-hover:bg-red-500 group-hover:text-white transition-all duration-500 shadow-xl group-hover:shadow-red-500/20">
              <Box className="w-8 h-8 sm:w-10 sm:h-10 animate-pulse" />
            </div>
            <div>
              <span className="block text-2xl sm:text-4xl font-black text-white tracking-tighter uppercase group-hover:text-red-500 transition-colors">Funcionalidades Estratégicas</span>
              <span className="block text-xs sm:text-sm text-white/40 uppercase tracking-[0.1em] sm:tracking-[0.2em] font-black mt-2 sm:mt-2">Clique para explorar o ecossistema →</span>
            </div>
          </motion.button>
        ) : (
          <motion.div
            key="revealed-content"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ duration: 0.8, ease: "circOut" }}
            className="w-full flex flex-col items-center"
          >
            <div className="text-center mb-16 space-y-4">
              <Badge className="bg-red-500/10 text-red-500 border-red-500/20 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest">
                NovaesWeb Premium
              </Badge>
              <h2 className="text-4xl sm:text-6xl font-black text-white tracking-tighter uppercase">
                Funcionalidades <span className="gradient-text">Estratégicas</span>
              </h2>
              <p className="text-white/40 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
                Módulos de alto impacto desenvolvidos para impulsionar suas vendas e criar 
                fidelidade absoluta de forma automatizada.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
              {loading ? (
                [1,2,3,4,5,6].map(i => (
                  <div key={i} className="h-80 rounded-[3rem] bg-white/5 animate-pulse border border-white/5" />
                ))
              ) : (
                <>
                  {extras.map((m, idx) => (
                    <motion.div
                      key={m.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.1 }}
                      className="group relative h-80 glass-card rounded-[3rem] border border-white/5 hover:border-red-500/30 transition-all duration-500 flex flex-col overflow-hidden"
                    >
                      <AnimatePresence mode="wait">
                        {explainingId === m.id ? (
                          <motion.div 
                            key="explanation"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="absolute inset-0 p-8 sm:p-10 flex flex-col justify-center bg-[#0d0d12] z-20"
                          >
                            <h4 className="text-red-500 text-[10px] sm:text-xs font-black uppercase tracking-widest mb-3 sm:mb-4 italic">O segredo do sucesso:</h4>
                            <p className="text-sm sm:text-base text-white/70 leading-relaxed font-medium">
                               "{explanationMap[m.nome] || m.descricao}"
                            </p>
                            <button 
                              onClick={() => setExplainingId(null)}
                              className="mt-10 text-[10px] font-black text-white/30 hover:text-white transition-colors uppercase tracking-[0.2em]"
                            >
                              ← Voltar ao card
                            </button>
                          </motion.div>
                        ) : (
                          <motion.div 
                            key="main"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex flex-col h-full p-8 sm:p-10"
                          >
                            <div className="flex items-start justify-between">
                              <div className="relative">
                                <div className="absolute -inset-6 bg-red-500/20 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity rounded-full" />
                                <div className="relative w-16 h-16 rounded-[1.25rem] bg-white/5 flex items-center justify-center text-red-500 group-hover:bg-red-500 group-hover:text-white transition-all duration-500 shadow-xl group-hover:shadow-red-500/20">
                                  {iconMap[m.nome] || iconMap['default']}
                                </div>
                              </div>
                              <Badge className="bg-white/5 text-white/30 border-white/5 text-[9px] font-black uppercase tracking-widest">
                                {m.categoria === 'fixo' ? 'Ativação' : m.categoria === 'intermediario' ? 'Advanced' : 'Monthly'}
                              </Badge>
                            </div>
                            
                            <div className="mt-6 sm:mt-8">
                              <h3 className="text-xl sm:text-2xl font-black text-white group-hover:text-red-500 transition-colors uppercase tracking-tight leading-none">{m.nome}</h3>
                              <p className="text-[11px] sm:text-xs text-white/40 mt-3 sm:mt-4 line-clamp-2 leading-relaxed font-medium">{m.descricao}</p>
                            </div>

                            <div className="mt-auto flex flex-col gap-5">
                              <button 
                                onClick={() => setExplainingId(m.id)}
                                className="text-[10px] font-black text-red-500/50 hover:text-red-500 transition-colors uppercase tracking-widest text-left"
                              >
                                Saiba como funciona →
                              </button>
                              
                              <div className="flex items-center justify-between pt-5 border-t border-white/5">
                                <span className="text-[10px] text-white/20 font-black uppercase tracking-widest">{m.subcategoria || 'Digital Growth'}</span>
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

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="group relative h-80 rounded-[3rem] px-8 py-10 sm:p-12 bg-gradient-to-br from-red-500/10 to-transparent border border-dashed border-red-500/20 hover:border-red-500/50 transition-all duration-500 flex flex-col justify-center text-center items-center shadow-xl shadow-red-500/5"
                  >
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <h3 className="text-xl sm:text-2xl font-black text-white mb-3 sm:mb-4 tracking-tighter group-hover:scale-105 transition-transform duration-500 uppercase leading-none">
                      Engenharia <br /><span className="text-red-500">Sob Medida</span>
                    </h3>
                    <p className="text-[11px] sm:text-xs text-white/40 max-w-[240px] leading-relaxed mb-8 sm:mb-10 font-medium">
                      Tem uma ideia única? Nossa equipe de engenharia desenvolve qualquer automação exclusiva para o seu fluxo.
                    </p>
                    <button 
                      onClick={handleCustom}
                      className="px-12 py-5 rounded-full bg-red-500 text-white text-[11px] font-black uppercase tracking-[0.2em] hover:bg-red-600 transition-all active:scale-95 shadow-2xl shadow-red-500/40"
                    >
                      Solicitar Personalizado
                    </button>
                  </motion.div>
                </>
              )}
            </div>

            <motion.button 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => {
                setIsRevealed(false);
                window.scrollTo({ top: document.getElementById('extras')?.offsetTop ? document.getElementById('extras')!.offsetTop - 100 : 0, behavior: 'smooth' });
              }}
              className="mt-20 text-[10px] font-black text-white/10 hover:text-red-500 transition-colors uppercase tracking-[0.5em] flex items-center gap-4 group"
            >
              <div className="h-[1px] w-8 bg-white/5 group-hover:bg-red-500/50 transition-colors" />
              Retrair Catálogo
              <div className="h-[1px] w-8 bg-white/5 group-hover:bg-red-500/50 transition-colors" />
            </motion.button>
          </motion.div>
        )}
      </div>
    </motion.section>
  );
}
