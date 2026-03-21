import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShoppingBag, Layers, ChevronRight, 
  Search, Zap, MessageSquare, ShieldCheck, 
  Box, Star, TrendingUp, ArrowLeft
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import SiteNavbar from "@/components/site/SiteNavbar";
import SiteFooter from "@/components/site/SiteFooter";
import SiteModals from "@/components/site/SiteModals";
import { useNavigate } from "react-router-dom";

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

export default function Funcionalidades() {
  const [extras, setExtras] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [explainingId, setExplainingId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
    // Fetch ALL active modules, but prioritize these specific ones at the top
    const priorityNames = [
      'Cashback', 'Área VIP', 'Cupom desconto', 
      'Fidelidade pontos', 'Popup promoção', 'Banner promoções'
    ];

    supabase.from("extras_catalogo")
      .select("*")
      .eq("status", "ativo")
      .then(({ data }) => {
        const sortedData = data?.sort((a, b) => {
          const indexA = priorityNames.indexOf(a.nome);
          const indexB = priorityNames.indexOf(b.nome);
          
          if (indexA !== -1 && indexB !== -1) return indexA - indexB; // Both are priority
          if (indexA !== -1) return -1; // Only A is priority
          if (indexB !== -1) return 1;  // Only B is priority
          return a.nome.localeCompare(b.nome); // Neither is priority, sort alphabetically
        }) || [];
        
        setExtras(sortedData);
        setLoading(false);
      });
  }, []);

  const handleAdd = (name: string) => {
    const msg = encodeURIComponent(`Olá! Vi no site a funcionalidade "${name}" e gostaria de saber como adicionar ao meu projeto.`);
    window.open(`https://wa.me/5511999999999?text=${msg}`, "_blank");
  };

  const handleCustom = () => {
    const msg = encodeURIComponent(`Quero meu site personalizado`);
    window.open(`https://wa.me/5511999999999?text=${msg}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] scroll-smooth ambient-glow">
      <SiteNavbar onOpenModal={setModalOpen} />
      
      <main className="pt-40 pb-16 sm:pt-48 sm:pb-32 px-4 sm:px-6 relative">
        <div className="max-w-7xl mx-auto flex flex-col items-center">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate(-1)}
            className="self-start mb-8 text-white/50 hover:text-white flex items-center gap-2 text-sm font-bold uppercase tracking-widest transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar
          </motion.button>

          <motion.div
            key="revealed-content"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "circOut" }}
            className="w-full flex flex-col items-center"
          >
            <div className="text-center mb-16 space-y-4">
              <Badge className="bg-red-500/10 text-red-500 border-red-500/20 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest">
                NovaesWeb Premium
              </Badge>
              <h2 className="text-4xl sm:text-6xl font-black text-white tracking-tighter uppercase">
                Funcionalidades <span className="gradient-text">Estratégicas</span>
              </h2>
              <p className="text-white/40 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed mb-8">
                Módulos de alto impacto desenvolvidos para impulsionar suas vendas e criar 
                fidelidade absoluta de forma automatizada.
              </p>
              
              <button 
                onClick={handleCustom}
                className="mt-8 px-8 py-4 rounded-full bg-red-500 text-white text-xs sm:text-sm font-black uppercase tracking-widest hover:bg-red-600 transition-all active:scale-95 shadow-xl shadow-red-500/30"
              >
                Quero meu site personalizado
              </button>
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
                      Quero meu site personalizado
                    </button>
                  </motion.div>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </main>

      <SiteModals modalOpen={modalOpen} onClose={() => setModalOpen(null)} />
      <SiteFooter onOpenModal={setModalOpen} />
    </div>
  );
}
