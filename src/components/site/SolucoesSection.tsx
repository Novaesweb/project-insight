import { useState } from "react";
import { motion } from "framer-motion";
import { Car, UserCheck, UtensilsCrossed, Wrench, ShoppingBag, CalendarCheck, Target, Users, Rocket, ChevronRight, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const fade = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };
const stagger = { show: { transition: { staggerChildren: 0.08 } } };

const solucoes = [
  { icon: MessageCircle, titulo: "Automação WhatsApp GPT", desc: "Agente IA treinado no seu negócio que atende, vende e agenda horários 24h por dia, direto no WhatsApp oficial." },
  { icon: UtensilsCrossed, titulo: "Pedidos Delivery (Pizzaria/Açaí)", desc: "Sistema completo de pedidos online com adicionais, cálculo de entrega por bairro e integração total com seu WhatsApp." },
  { icon: UserCheck, titulo: "CRM & Gestão de Clientes", desc: "Organize leads e oportunidades. Pipeline visual, histórico de interações e follow-ups automáticos para nunca perder uma venda." },
  { icon: ShoppingBag, titulo: "Site Vitrine & Catálogo", desc: "Apresentação profissional de produtos e serviços para Profissionais Liberais (Médicos, Advogados, Psicólogos) e Lojas." },
  { icon: ShoppingBag, titulo: "Catálogo de Produtos", desc: "Vitrine digital organizada com fotos, descrições, preços e categorias. Compartilhável por link ou WhatsApp. Ideal para quem vende pelo Instagram ou redes sociais." },
  { icon: CalendarCheck, titulo: "Agendamento Online", desc: "Sistema de agenda com horários disponíveis em tempo real, confirmação automática por WhatsApp/e-mail, gestão de profissionais e relatório de atendimentos." },
  { icon: Target, titulo: "Gestão Financeira", desc: "Controle de contas a pagar e receber, fluxo de caixa, emissão de boletos, relatórios financeiros detalhados e dashboards com indicadores em tempo real." },
  { icon: Users, titulo: "Portal do Cliente", desc: "Área exclusiva onde seus clientes acompanham projetos, faturas, contratos, reuniões e abrem chamados de suporte. Tudo organizado em um painel moderno." },
  { icon: Rocket, titulo: "Painel Administrativo", desc: "Dashboard completo para gerenciar toda sua operação: clientes, pedidos, financeiro, equipe, relatórios e KPIs do negócio em um só lugar." },
];

interface SolucoesSectionProps {
  onOpenModal: (id: string) => void;
}

export default function SolucoesSection({ onOpenModal }: SolucoesSectionProps) {
  const [showAll, setShowAll] = useState(false);
  const displayedSolucoes = showAll ? solucoes : solucoes.slice(0, 4);

  return (
    <motion.section id="solucoes" className="py-24 px-6" initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
      <div className="max-w-7xl mx-auto">
        <motion.div variants={fade} className="max-w-3xl mb-24">
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary bg-primary/10 px-4 py-1.5 rounded-full">Catálogo de Possibilidades</span>
          <h2 className="text-4xl sm:text-6xl font-black text-white mt-8 leading-[0.9] tracking-tighter">
            Sistemas que <br />
            <span className="text-white/20">podemos </span> <span className="gradient-text">desenvolver</span>
          </h2>
          <p className="text-lg text-white/40 mt-8 leading-relaxed max-w-xl font-medium">
            De CRMs robustos a Dashboards analíticos, transformamos sua necessidade em uma ferramenta poderosa de gestão e escala.
          </p>
        </motion.div>

        {/* Mobile: Horizontal Scroll | Desktop: Masonry-style Grid */}
        <div className="relative">
          <div className="flex lg:grid lg:grid-cols-2 xl:grid-cols-4 gap-6 overflow-x-auto pb-8 lg:pb-0 no-scrollbar snap-x snap-mandatory lg:gap-8">
            {displayedSolucoes.map((p, i) => (
              <motion.div
                key={p.titulo}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                className={cn(
                  "min-w-[280px] sm:min-w-[320px] lg:min-w-full snap-start",
                  "glass-card rounded-[2.5rem] p-8 flex flex-col gap-6 info-card-hover border-white/5",
                  i % 2 === 0 ? "lg:translate-y-4" : "lg:-translate-y-4"
                )}
              >
                <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center shrink-0 shadow-2xl shadow-primary/20 rotate-3 group-hover:rotate-12 transition-transform duration-500">
                  <p.icon className="w-7 h-7 text-white" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-xl font-black text-white tracking-tight">{p.titulo}</h3>
                  <p className="text-sm text-white/40 leading-relaxed font-medium line-clamp-4">{p.desc}</p>
                </div>

              </motion.div>
            ))}
          </div>
          
          {/* Botão Expandir */}
          {!showAll && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-12 flex justify-center"
            >
              <Button 
                onClick={() => setShowAll(true)}
                className="h-14 px-10 rounded-2xl bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:shadow-2xl transition-all duration-300 group"
              >
                <span className="text-sm font-black uppercase tracking-widest mr-2">Ver Catálogo Completo</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>
          )}

          {showAll && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-12 flex justify-center"
            >
              <Button 
                onClick={() => setShowAll(false)}
                className="h-10 px-6 rounded-xl bg-white/5 border border-white/5 text-white/40 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest"
              >
                Recolher Catálogo
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </motion.section>
  );
}


