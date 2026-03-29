import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, CheckCircle, Smartphone, Layout, ShoppingCart, Globe } from "lucide-react";

const LEADS = [
  { name: "Ricardo", city: "São Paulo", action: "iniciou um projeto", service: "Site Profissional", icon: Globe },
  { name: "Letícia", city: "Curitiba", action: "solicitou orçamento", service: "Loja Virtual", icon: ShoppingCart },
  { name: "Marcos", city: "Belo Horizonte", action: "ativou o módulo", service: "Automação WhatsApp", icon: Zap },
  { name: "Ana Paula", city: "Rio de Janeiro", action: "acaba de fechar", service: "Sistema Customizado", icon: Layout },
  { name: "Bruno", city: "Salvador", action: "recebeu proposta de", service: "Aplicativo Mobile", icon: Smartphone },
  { name: "Fernanda", city: "Porto Alegre", action: "iniciou um projeto", service: "Landing Page High-Ticket", icon: Globe },
  { name: "Gustavo", city: "Brasília", action: "ativou o módulo", service: "Gestão de Leads", icon: CheckCircle },
];

export default function FloatingSocialProof() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Exibir após 5 segundos da página carregar
    const initialTimer = setTimeout(() => setVisible(true), 5000);

    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % LEADS.length);
        setVisible(true);
      }, 1000);
    }, 15000); // Muda a cada 15 segs

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, []);

  const lead = LEADS[index];

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, x: -50, y: 50, scale: 0.8 }}
          animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
          exit={{ opacity: 0, x: -50, scale: 0.8 }}
          className="fixed bottom-24 lg:bottom-10 left-6 z-[90] max-w-[280px]"
        >
          <div className="bg-black/60 backdrop-blur-2xl border border-white/10 rounded-2xl p-4 shadow-2xl flex items-center gap-4 overflow-hidden group">
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-purple-500/50 to-transparent" />
            
            <div className="w-12 h-12 shrink-0 rounded-xl bg-gradient-to-br from-purple-600/20 to-pink-600/20 flex items-center justify-center border border-white/10 relative">
              <div className="absolute inset-0 bg-purple-500/20 blur-lg rounded-full animate-pulse" />
              <lead.icon className="w-6 h-6 text-purple-400 relative z-10" />
            </div>

            <div className="space-y-0.5 relative z-10">
              <p className="text-[11px] font-black text-white leading-tight">
                {lead.name} de {lead.city}
              </p>
              <p className="text-[10px] text-white/60 font-medium">
                {lead.action} <span className="text-purple-400 font-bold">{lead.service}</span>
              </p>
            </div>

            <div className="absolute -right-2 -bottom-2 opacity-5">
               <lead.icon className="w-12 h-12 text-white" />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
