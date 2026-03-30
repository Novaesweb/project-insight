import { useState, useEffect, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, CheckCircle, Smartphone, Layout, ShoppingCart, Globe } from "lucide-react";

const LEADS = [
  { name: "Ricardo", city: "São Paulo", action: "iniciou um projeto", service: "Arquitetura Express", icon: Globe },
  { name: "Letícia", city: "Curitiba", action: "solicitou orçamento", service: "Arquitetura de Gestão", icon: ShoppingCart },
  { name: "Marcos", city: "Belo Horizonte", action: "ativou o módulo", service: "Automação WhatsApp", icon: Zap },
  { name: "Ana Paula", city: "Rio de Janeiro", action: "acaba de fechar", service: "Arquitetura sob Medida", icon: Layout },
  { name: "Bruno", city: "Salvador", action: "recebeu proposta de", service: "Arquitetura de Gestão", icon: Smartphone },
  { name: "Fernanda", city: "Porto Alegre", action: "iniciou um projeto", service: "Arquitetura Express", icon: Globe },
  { name: "Gustavo", city: "Brasília", action: "ativou o módulo", service: "Gestão de Leads", icon: CheckCircle },
  { name: "Camila", city: "Fortaleza", action: "solicitou orçamento", service: "Arquitetura sob Medida", icon: Layout },
];

function FloatingSocialProof() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Delay initial display to avoid blocking initial render
    const initialTimer = setTimeout(() => setVisible(true), 8000);

    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % LEADS.length);
        setVisible(true);
      }, 800);
    }, 12000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, []);

  const lead = LEADS[index];
  const Icon = lead.icon;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, x: -40, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: -40, scale: 0.9 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-24 lg:bottom-10 left-6 z-[90] max-w-[260px]"
        >
          <div className="rounded-2xl p-3.5 flex items-center gap-3 overflow-hidden"
            style={{
              background: 'hsl(var(--background) / 0.85)',
              backdropFilter: 'blur(16px)',
              border: '1px solid hsl(var(--border))',
              boxShadow: '0 8px 32px hsl(var(--background) / 0.5)',
            }}
          >
            <div className="w-10 h-10 shrink-0 rounded-xl flex items-center justify-center"
              style={{
                background: 'hsl(var(--accent) / 0.1)',
                border: '1px solid hsl(var(--accent) / 0.15)',
              }}
            >
              <Icon className="w-5 h-5" style={{ color: 'hsl(var(--accent))' }} />
            </div>

            <div className="space-y-0.5">
              <p className="text-[11px] font-black text-foreground leading-tight">
                {lead.name} de {lead.city}
              </p>
              <p className="text-[10px] text-muted-foreground font-medium">
                {lead.action} <span className="font-bold" style={{ color: 'hsl(var(--accent))' }}>{lead.service}</span>
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default memo(FloatingSocialProof);
