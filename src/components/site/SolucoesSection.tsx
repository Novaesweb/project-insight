import { useState } from "react";
import { motion } from "framer-motion";
import { Car, UserCheck, UtensilsCrossed, Wrench, ShoppingBag, CalendarCheck, Target, Users, Rocket, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const fade = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };
const stagger = { show: { transition: { staggerChildren: 0.08 } } };

const solucoes = [
  { icon: Car, titulo: "Controle de Aluguel", desc: "Gerencie aluguel de carros, motos ou imóveis com controle completo de contratos, pagamentos, vencimentos, multas e histórico de clientes." },
  { icon: UserCheck, titulo: "CRM - Gestão de Clientes", desc: "Organize clientes, leads e oportunidades de negócio. Pipeline de vendas visual, histórico de interações, follow-ups automáticos e relatórios de conversão." },
  { icon: UtensilsCrossed, titulo: "Pedidos para Restaurantes", desc: "Cardápio digital interativo, pedidos online com personalização, integração com delivery, controle de mesa e cozinha, e relatórios de vendas por período." },
  { icon: Wrench, titulo: "Gestão para Oficinas", desc: "Ordens de serviço digitais, agendamentos, controle de estoque de peças, histórico de veículos, orçamentos automáticos e notificação para clientes." },
  { icon: ShoppingBag, titulo: "Catálogo de Produtos", desc: "Vitrine digital organizada com fotos, descrições, preços e categorias. Compartilhável por link ou WhatsApp. Ideal para quem vende pelo Instagram ou redes sociais." },
  { icon: CalendarCheck, titulo: "Agendamento Online", desc: "Sistema de agenda com horários disponíveis em tempo real, confirmação automática por WhatsApp/e-mail, gestão de profissionais e relatório de atendimentos." },
  { icon: Target, titulo: "Gestão Financeira", desc: "Controle de contas a pagar e receber, fluxo de caixa, emissão de boletos, relatórios financeiros detalhados e dashboards com indicadores em tempo real." },
  { icon: Users, titulo: "Portal do Cliente", desc: "Área exclusiva onde seus clientes acompanham projetos, faturas, contratos, reuniões e abrem chamados de suporte. Tudo organizado em um painel moderno." },
  { icon: Rocket, titulo: "Painel Administrativo", desc: "Dashboard completo para gerenciar toda sua operação: clientes, pedidos, financeiro, equipe, relatórios e KPIs do negócio em um só lugar." },
];

export default function SolucoesSection() {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? solucoes : solucoes.slice(0, 2);

  return (
    <motion.section id="solucoes" className="py-24 px-6" initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
      <div className="max-w-7xl mx-auto">
        <motion.div variants={fade} className="max-w-2xl mb-16">
          <span className="text-xs font-semibold uppercase tracking-widest text-[hsl(var(--primary))]">Soluções</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-[hsl(var(--foreground))] mt-3 leading-tight">
            Sistemas que podemos desenvolver para você
          </h2>
          <p className="text-[hsl(var(--muted-foreground))] mt-4 leading-relaxed">
            Cada negócio tem suas necessidades. Desenvolvemos soluções personalizadas com tecnologia de ponta, sempre focando em usabilidade e resultados reais.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {visible.map((p, i) => (
            <motion.div
              key={p.titulo}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i >= 2 && showAll ? (i - 2) * 0.08 : i * 0.08 }}
              className="glass-card rounded-2xl p-6 flex gap-4 items-start info-card-hover"
            >
              <div className="w-11 h-11 rounded-xl gradient-primary flex items-center justify-center shrink-0 shadow-lg shadow-[hsl(var(--primary))]/15">
                <p.icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-[hsl(var(--foreground))] mb-1">{p.titulo}</h3>
                <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">{p.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-8">
          <Button
            variant="outline"
            onClick={() => setShowAll(!showAll)}
            className="glass-card border-[hsl(var(--border))] text-[hsl(var(--foreground))] rounded-xl px-8 h-11 hover:bg-[hsl(var(--muted))]"
          >
            {showAll ? "Ver menos" : `Ver todas as soluções (${solucoes.length - 2} mais)`}
            <ChevronRight className={`w-4 h-4 ml-2 ${showAll ? "rotate-90" : ""}`} />
          </Button>
        </div>
      </div>
    </motion.section>
  );
}
