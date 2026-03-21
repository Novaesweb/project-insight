import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShoppingBag, Layers, CalendarCheck, ChevronRight, 
  Rocket, Search, Zap, MessageSquare, ShieldCheck, 
  TrendingUp, Globe, Box, CheckCircle2
} from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const modules = [
  { 
    id: "seo",
    category: "marketing",
    icon: <Search className="w-5 h-5" />,
    title: "SEO de Elite",
    short: "Suba para o topo do Google.",
    desc: "Otimização técnica completa e estratégia de palavras-chave para garantir que seu site seja encontrado por quem realmente quer comprar.",
    power: 95,
    benefits: ["Indexação em 24h", "Otimização On-Page", "Monitoramento de Ranking"]
  },
  { 
    id: "wpp",
    category: "vendas",
    icon: <MessageSquare className="w-5 h-5" />,
    title: "WhatsApp Pro",
    short: "Vendas diretas e automáticas.",
    desc: "Integração inteligente que direciona leads para atendentes específicos ou automações, aumentando a conversão em até 40%.",
    power: 88,
    benefits: ["Bot de Triagem", "Múltiplos Números", "Rastreio de Origem"]
  },
  { 
    id: "checkout",
    category: "vendas",
    icon: <ShoppingBag className="w-5 h-5" />,
    title: "Checkout Direto",
    short: "Pagamentos sem sair do site.",
    desc: "Experiência de compra fluida com Pix, Cartão e Boleto integrado diretamente no seu domínio, reduzindo o abandono de carrinho.",
    power: 92,
    benefits: ["Pix Automático", "Segurança SSL", "Recuperação de Vendas"]
  },
  { 
    id: "painel",
    category: "gestao",
    icon: <Layers className="w-5 h-5" />,
    title: "Painel Business",
    short: "Controle total do seu negócio.",
    desc: "Área exclusiva para gerenciar pedidos, clientes e estoque com interface intuitiva e relatórios em tempo real.",
    power: 90,
    benefits: ["Gestão de Pedidos", "Base de Clientes", "Relatórios Financeiros"]
  },
  { 
    id: "cache",
    category: "performance",
    icon: <Zap className="w-5 h-5" />,
    title: "Ultra Speed",
    short: "Carregamento instantâneo.",
    desc: "Tecnologia de cache de borda e CDN global que faz seu site abrir em menos de 1 segundo em qualquer lugar do mundo.",
    power: 98,
    benefits: ["Google PageSpeed 90+", "CDN Cloudflare", "Imagens WebP"]
  },
  { 
    id: "crm",
    category: "gestao",
    icon: <ShieldCheck className="w-5 h-5" />,
    title: "CRM Integrado",
    short: "Nunca perca um lead.",
    desc: "Captura automática de contatos que organiza sua jornada de vendas e avisa sua equipe sobre novas oportunidades.",
    power: 85,
    benefits: ["Funil de Vendas", "Histórico de Leads", "Notificações Push"]
  }
];

const categories = [
  { id: "all", label: "Todos", icon: <Globe className="w-3.5 h-3.5" /> },
  { id: "vendas", label: "Vendas", icon: <TrendingUp className="w-3.5 h-3.5" /> },
  { id: "gestao", label: "Gestão", icon: <Box className="w-3.5 h-3.5" /> },
  { id: "marketing", label: "Growth", icon: <Rocket className="w-3.5 h-3.5" /> },
];

export default function FuncionalidadeExtraSection() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedModule, setSelectedModule] = useState(modules[0]);

  const filteredModules = modules.filter(m => activeCategory === "all" || m.category === activeCategory);

  return (
    <motion.section 
      className="py-16 sm:py-24 px-4 sm:px-6" 
      initial={{ opacity: 0 }} 
      whileInView={{ opacity: 1 }} 
      viewport={{ once: true }}
    >
      <div className="max-w-4xl mx-auto text-center">
        <Dialog>
          <DialogTrigger asChild>
            <motion.button 
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="group relative inline-flex items-center gap-4 glass-card rounded-[2rem] px-8 py-5 border border-white/10 hover:border-red-500/50 transition-all duration-500 shadow-2xl overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500/20 to-pink-500/20 flex items-center justify-center text-red-500">
                <Box className="w-6 h-6 animate-pulse" />
              </div>
              <div className="text-left">
                <span className="block text-xl font-bold text-white group-hover:text-red-500 transition-colors">Funcionalidade Extra</span>
                <span className="block text-xs text-white/40 uppercase tracking-widest font-medium">Personalize seu ecossistema</span>
              </div>
              <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-red-500 transition-all group-hover:translate-x-1" />
            </motion.button>
          </DialogTrigger>

          <DialogContent className="max-w-[95vw] lg:max-w-5xl h-[90vh] lg:h-auto overflow-hidden bg-[#0a0a0f] border-white/5 p-0 rounded-[2.5rem] shadow-[0_0_50px_-12px_rgba(232,51,74,0.3)] gap-0">
            <div className="flex flex-col lg:flex-row h-full">
              {/* Left Side: Navigation and Modules List */}
              <div className="w-full lg:w-2/5 p-6 lg:p-8 space-y-6 border-r border-white/5 bg-white/[0.01]">
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                    Catálogo de Módulos <Badge variant="outline" className="text-[10px] uppercase border-red-500/30 text-red-500">Premium</Badge>
                  </h2>
                  <p className="text-sm text-white/40 leading-relaxed">Turbine sua plataforma com tecnologia de ponta desenvolvida pela NovaesWeb.</p>
                </div>

                {/* Categories */}
                <div className="flex flex-wrap gap-2">
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border",
                        activeCategory === cat.id 
                          ? "bg-red-500 border-red-500 text-white shadow-lg shadow-red-500/20" 
                          : "bg-white/5 border-white/10 text-white/40 hover:text-white hover:bg-white/10"
                      )}
                    >
                      {cat.icon}
                      {cat.label}
                    </button>
                  ))}
                </div>

                {/* Modules List */}
                <div className="grid grid-cols-1 gap-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                  <AnimatePresence mode="popLayout">
                    {filteredModules.map((m) => (
                      <motion.div
                        layout
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        key={m.id}
                        onClick={() => setSelectedModule(m)}
                        className={cn(
                          "cursor-pointer p-4 rounded-2xl border transition-all group",
                          selectedModule.id === m.id
                            ? "bg-white/5 border-red-500/30 shadow-[0_0_20px_rgba(232,51,74,0.1)]"
                            : "bg-white/[0.02] border-white/5 hover:border-white/10"
                        )}
                      >
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                            selectedModule.id === m.id ? "bg-red-500 text-white" : "bg-white/5 text-white/30 group-hover:text-white"
                          )}>
                            {m.icon}
                          </div>
                          <div className="text-left">
                            <h4 className={cn("text-sm font-bold transition-colors", selectedModule.id === m.id ? "text-white" : "text-white/60")}>{m.title}</h4>
                            <p className="text-[10px] text-white/30 uppercase tracking-wider">{m.short}</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>

              {/* Right Side: Detailed Preview */}
              <div className="flex-1 p-6 lg:p-10 bg-gradient-to-br from-red-500/[0.02] to-transparent relative overflow-y-auto">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedModule.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="h-full flex flex-col justify-center"
                  >
                    <div className="space-y-8">
                      <div className="w-16 h-16 rounded-[1.25rem] bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center text-white shadow-xl shadow-red-500/20">
                        {cloneIcon(selectedModule.icon, { className: "w-8 h-8" })}
                      </div>
                      
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                           <Badge className="bg-red-500/10 text-red-500 border-0 text-[10px] font-black uppercase tracking-widest">{selectedModule.category}</Badge>
                           <div className="h-px bg-white/10 flex-1" />
                        </div>
                        <h3 className="text-4xl font-black text-white leading-tight">{selectedModule.title}</h3>
                        <p className="text-lg text-white/50 leading-relaxed font-medium">{selectedModule.desc}</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                         <div className="space-y-4">
                            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider">
                               <span className="text-white/40">Potencial Business Power</span>
                               <span className="text-red-500">{selectedModule.power}%</span>
                            </div>
                            <Progress value={selectedModule.power} className="h-2 bg-white/5" />
                            <p className="text-[10px] text-white/30 italic">Impacto calculado baseado em KPIs de conversão e eficiência operacional.</p>
                         </div>

                         <div className="space-y-3">
                            <span className="text-xs font-bold text-white/40 uppercase tracking-wider block">Principais Entregáveis:</span>
                            <div className="space-y-2">
                               {selectedModule.benefits.map((benef, b) => (
                                 <div key={b} className="flex items-center gap-2 text-sm text-white/70 font-medium">
                                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                                    {benef}
                                 </div>
                               ))}
                            </div>
                         </div>
                      </div>

                      <div className="pt-8 mt-8 border-t border-white/5">
                         <button className="w-full h-14 rounded-2xl bg-white text-black font-black text-sm uppercase tracking-widest hover:bg-white/90 transition-all active:scale-95 shadow-xl shadow-white/5">
                            Adicionar ao Meu Projeto
                         </button>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </motion.section>
  );
}

function cloneIcon(icon: React.ReactNode, props: any) {
  if (React.isValidElement(icon)) {
    return React.cloneElement(icon as React.ReactElement, props);
  }
  return icon;
}
