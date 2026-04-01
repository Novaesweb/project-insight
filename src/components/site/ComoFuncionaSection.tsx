import { motion } from "framer-motion";
import { CheckCircle, Zap, Users, Target, ArrowRight } from "lucide-react";

const fade = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };
const stagger = { show: { transition: { staggerChildren: 0.12 } } };

const passos = [
  {
    numero: "01",
    titulo: "Diagnóstico Estratégico",
    descricao: "Mapeamos seu negócio, concorrentes e oportunidades para criar uma solução que realmente vende.",
    icon: Target,
    detalhes: ["Análise completa", "Identificação de oportunidades", "Planejamento estratégico"],
    accent: "var(--primary)",
  },
  {
    numero: "02",
    titulo: "Arquitetura Digital",
    descricao: "Projetamos e desenvolvemos sua estrutura digital focada em conversão e experiência do usuário.",
    icon: Zap,
    detalhes: ["Design profissional", "UX otimizada", "Performance máxima"],
    accent: "var(--accent)",
  },
  {
    numero: "03",
    titulo: "Integração Completa",
    descricao: "Conectamos todos os sistemas: WhatsApp, pagamentos, CRM e automações para funcionar 24/7.",
    icon: Users,
    detalhes: ["WhatsApp Business", "Automação de marketing", "Gestão integrada"],
    accent: "var(--primary-novaesweb)",
  },
  {
    numero: "04",
    titulo: "Resultados Comprovados",
    descricao: "Lançamos, monitoramos e otimizamos continuamente para garantir mais clientes e vendas todos os dias.",
    icon: CheckCircle,
    detalhes: ["Métricas em tempo real", "Otimização contínua", "Suporte dedicado"],
    accent: "var(--success)",
  },
];

export default function ComoFuncionaSection() {
  return (
    <motion.section
      id="como-funciona"
      className="site-band py-28 px-6 relative"
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-100px" }}
      variants={stagger}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div variants={fade} className="text-center max-w-4xl mx-auto mb-20">
          <span
            className="site-badge site-badge--accent inline-flex mb-8"
          >
            Nosso Processo
          </span>
          <h2 className="text-4xl sm:text-6xl font-black text-foreground/90 leading-[0.9] tracking-tighter">
            Como <span className="site-gradient-text">transformamos</span><br />
            <span className="site-title-muted">ideias em </span><span className="text-foreground/70">máquinas de clientes</span>
          </h2>
          <p className="text-lg site-copy-muted mt-6 max-w-2xl mx-auto leading-relaxed">
            Um método comprovado que leva sua empresa do zero ao digital gerando resultados reais todos os dias.
          </p>
        </motion.div>

        {/* Steps — timeline layout */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 mb-16">
          {passos.map((passo, index) => (
            <motion.div
              key={index}
              variants={fade}
              whileHover={{ y: -6, transition: { duration: 0.3 } }}
              className="relative group"
            >
              {/* Connector line on desktop */}
              {index < 3 && (
                <div className="hidden lg:block absolute top-12 -right-3 w-6 h-px" style={{ background: 'hsl(var(--border))' }} />
              )}

              <div
                className="site-surface rounded-2xl p-7 flex flex-col h-full transition-all duration-500"
              >
                {/* Step number + icon */}
                <div className="flex items-center gap-3 mb-5">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-500 group-hover:scale-110"
                    style={{ background: `hsl(${passo.accent} / 0.1)` }}
                  >
                    <passo.icon className="w-6 h-6" style={{ color: `hsl(${passo.accent})` }} />
                  </div>
                  <span className="text-4xl font-black text-foreground/[0.04] group-hover:text-foreground/[0.08] transition-colors">
                    {passo.numero}
                  </span>
                </div>

                <h3 className="text-base font-bold text-foreground/85 mb-3 tracking-tight">{passo.titulo}</h3>
                <p className="text-sm text-muted-foreground mb-5 leading-relaxed flex-1">{passo.descricao}</p>

                <div className="space-y-2.5">
                  {passo.detalhes.map((detalhe, idx) => (
                    <div key={idx} className="flex items-center gap-2.5">
                      <CheckCircle className="w-3.5 h-3.5 shrink-0" style={{ color: 'hsl(var(--success) / 0.5)' }} />
                      <span className="text-xs text-muted-foreground/80">{detalhe}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div variants={fade} className="text-center">
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="#contato"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-white text-base font-bold hover:scale-105 transition-all group"
              style={{ background: 'linear-gradient(135deg, rgba(220,38,38,0.92), rgba(107,33,168,0.9), rgba(236,72,153,0.88))', boxShadow: '0 15px 40px rgba(236,72,153,0.16)' }}
            >
              Começar Agora
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
            <a
              href="#planos"
              className="site-surface inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-sm font-bold transition-all hover:bg-secondary/80"
              style={{
                color: 'hsl(var(--muted-foreground) / 0.95)',
              }}
            >
              Ver Planos
            </a>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}
