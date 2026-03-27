import { motion } from "framer-motion";
import { Globe, ShoppingBag, Layers, Smartphone, Shield, Zap, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const fade = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };
const stagger = { show: { transition: { staggerChildren: 0.09 } } };

const servicos = [
  { icon: Globe, titulo: "Arquitetura de Presença", desc: "Estruturamos portais de alta fidelidade que posicionam sua marca no topo. Mais que um site, uma base sólida para sua autoridade digital.", color: "from-blue-500 to-cyan-500" },
  { icon: ShoppingBag, titulo: "Ecossistemas de Vendas", desc: "Lojas inteligentes projetadas para escala. Integramos todo o fluxo de conversão, estoque e pagamentos em um único ativo gerador de lucro.", color: "from-purple-500 to-pink-500" },
  { icon: Layers, titulo: "Engenharia de Operação", desc: "Sistemas web sob medida que automatizam sua rotina. Transformamos processos complexos em fluxos simples e lucrativos na nuvem.", color: "from-orange-500 to-red-500" },
  { icon: Smartphone, titulo: "Máquinas de Leads", desc: "Landing Pages de altíssima conversão. Estruturamos o funil perfeito para capturar e converter visitantes em clientes reais.", color: "from-emerald-500 to-teal-500" },
  { icon: Shield, titulo: "Blindagem & Evolução", desc: "Segurança total e monitoramento contínuo. Garantimos que sua estrutura digital continue evoluindo e performando 24h por dia.", color: "from-yellow-500 to-orange-500" },
  { icon: Zap, titulo: "Conectividade Estratégica", desc: "Integramos seu ecossistema ao WhatsApp e IA. Criamos pontes inteligentes que automatizam o atendimento e multiplicam resultados.", color: "from-red-500 to-pink-500" },
];

interface ServicosSectionProps {
  onOpenModal: (id: string) => void;
}

export default function ServicosSection({ onOpenModal }: ServicosSectionProps) {
  return (
    <motion.section id="servicos" className="py-28 px-6" initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} variants={stagger}>
      <div className="max-w-7xl mx-auto">
        <motion.div variants={fade} className="max-w-3xl mb-24">
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary bg-primary/10 px-4 py-1.5 rounded-full">Explore Nossas Expertise</span>
          <h2 className="text-4xl sm:text-6xl font-black text-white mt-8 leading-[0.9] tracking-tighter">
            Soluções digitais que <br />
            <span className="text-white/20">escalam o seu </span> <span className="gradient-text">negócio</span>
          </h2>
          <p className="text-lg text-white/40 mt-8 leading-relaxed max-w-xl font-medium">
            Não entregamos apenas código. Entregamos vantagem competitiva através de design estratégico e engenharia de ponta.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8">
          {servicos.map((s, i) => (
            <motion.div 
              key={i} 
              variants={fade}
              className={cn(
                "md:col-span-6 lg:col-span-4",
                i === 0 && "lg:col-span-8 lg:row-span-1",
                i === 3 && "lg:col-span-7",
                i === 4 && "lg:col-span-5",
                i === 5 && "lg:col-span-12"
              )}
            >
              <div className="glass-card rounded-2xl p-8 group cursor-default transition-colors duration-200 hover:border-white/15">
                <div className="flex flex-col h-full">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-6 shadow-2xl group-hover:scale-110 transition-transform duration-300`}>
                    <s.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className={cn(
                    "font-black text-white mb-4 tracking-tight",
                    (i === 0 || i === 5) ? "text-2xl sm:text-3xl" : "text-xl"
                  )}>{s.titulo}</h3>
                  <p className={cn(
                    "text-white/40 leading-relaxed font-medium",
                    (i === 0 || i === 5) ? "text-base max-w-2xl" : "text-sm"
                  )}>{s.desc}</p>
                  
                  { (i === 0 || i === 5) && (
                    <button 
                      onClick={() => onOpenModal(i === 5 ? "conectividade" : "demonstracao")}
                      className="mt-8 pt-6 border-t border-white/5 flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-primary hover:text-white transition-colors group/btn"
                    >
                      Saiba mais sobre este serviço 
                      <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
