import { motion } from "framer-motion";
import { X, CheckCircle2, TrendingUp, Zap, HelpCircle, ShieldAlert } from "lucide-react";

const comparisonData = [
  { 
    feature: "Foco Principal", 
    execution: "Apenas estética e cores.", 
    architecture: "Faturamento e conversão real.",
    icon: Zap
  },
  { 
    feature: "Engenharia", 
    execution: "Templates pesados e lentos.", 
    architecture: "Código puro e performance máxima.",
    icon: CheckCircle2
  },
  { 
    feature: "Escalabilidade", 
    execution: "Dificuldade para crescer ou mudar.", 
    architecture: "Total flexibilidade para o futuro.",
    icon: TrendingUp
  },
  { 
    feature: "Segurança", 
    execution: "Backups manuais e incertos.", 
    architecture: "Blindagem digital automática 24h.",
    icon: ShieldAlert
  },
  { 
    feature: "Percepção de Valor", 
    execution: "Gasto com 'só um site'.", 
    architecture: "Investimento em Ativo Digital.",
    icon: HelpCircle
  }
];

export default function ComparisonSection() {
  return (
    <section className="py-24 relative bg-[hsl(var(--background))]">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto mb-20 text-center">
          <motion.span 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-[10px] font-black text-primary uppercase tracking-[0.5em] mb-4 block"
          >
            A Verdade do Mercado
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-none mb-6"
          >
            Site <span className="text-white/20">Genérico</span> <br />
            vs. Arquitetura <span className="gradient-text">NovaesWeb</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-lg text-white/40 max-w-2xl mx-auto"
          >
            Pare de gastar dinheiro com "fazer bonitinho". Comece a investir em estrutura de alta performance.
          </motion.p>
        </div>

        <div className="max-w-5xl mx-auto overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-12">
            {/* Header column */}
            <div className="md:col-span-4 p-8 bg-black/40 border-b md:border-b-0 md:border-r border-white/5">
              <h3 className="text-sm font-black uppercase text-white/30 tracking-widest mb-12">Critérios de Valor</h3>
              <div className="space-y-12">
                {comparisonData.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <item.icon className="w-5 h-5 text-primary/40 shrink-0" />
                    <span className="text-sm font-bold text-white/80">{item.feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Execution column (The "Bad" way) */}
            <div className="md:col-span-4 p-8 relative overflow-hidden group border-b md:border-b-0 md:border-r border-white/5 bg-red-950/5">
              <div className="mb-12">
                <span className="text-[10px] font-black uppercase text-red-500/50 mb-2 block tracking-widest italic">Eles criam</span>
                <h4 className="text-2xl font-black text-white/50 lowercase tracking-tighter leading-none">Site Genérico</h4>
              </div>
              <div className="space-y-12">
                {comparisonData.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <X className="w-5 h-5 text-red-500/30 shrink-0 mt-1" />
                    <span className="text-sm text-white/30">{item.execution}</span>
                  </div>
                ))}
              </div>
              {/* Fade out effect for the "bad" side */}
              <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent pointer-events-none" />
            </div>

            {/* Architecture column (The "Novaes" way) */}
            <div className="md:col-span-4 p-8 bg-gradient-to-br from-primary/10 to-transparent relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4">
                  <div className="px-3 py-1 bg-primary text-white text-[10px] font-black rounded-full uppercase shadow-lg shadow-primary/40 animate-pulse">
                    Novidade
                  </div>
               </div>
              <div className="mb-12">
                <span className="text-[10px] font-black uppercase text-primary mb-2 block tracking-widest italic">Nós trazemos</span>
                <h4 className="text-2xl font-black text-white italic tracking-tighter leading-none uppercase">Novidade Digital</h4>
              </div>
              <div className="space-y-12">
                {comparisonData.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-4 group">
                    <CheckCircle2 className="w-6 h-6 text-primary shrink-0 group-hover:scale-125 transition-transform" />
                    <span className="text-sm font-bold text-white/90 leading-tight">
                      {item.architecture}
                    </span>
                  </div>
                ))}
              </div>
              
              {/* Glow effect */}
              <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-primary/20 blur-[80px] -z-10" />
            </div>
          </div>
        </div>

        {/* Closing mental shift */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <p className="text-sm font-black text-white italic tracking-tighter uppercase opacity-40">
            "Mude a linguagem. Mude a percepção. Mude o ticket."
          </p>
        </motion.div>
      </div>
    </section>
  );
}
