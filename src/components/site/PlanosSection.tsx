import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, CheckCircle, MessageCircle, Globe, Layers, Rocket, Sparkles, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

const fade = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };
const stagger = { show: { transition: { staggerChildren: 0.12 } } };

const plans = [
  {
    tag: "Express",
    tagColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    icon: Globe,
    iconColor: "bg-emerald-500/20 text-emerald-400",
    borderColor: "border-emerald-500/20 hover:border-emerald-500/40",
    title: "Arquitetura Express",
    desc: "A estrutura ágil para quem precisa de presença digital imediata e profissional.",
    promo: true,
    price: "R$180",
    priceLabel: "Valor inicial",
    monthly: "R$60",
    features: [
      "Site moderno e responsivo",
      "Página de serviços",
      "Página de contato",
      "Integração com mapa",
      "Botão WhatsApp direto",
      "Otimização para celular",
    ],
    cta: "Aproveitar promoção",
    ctaClass: "gradient-primary border-0 text-white shadow-lg shadow-primary/20",
    whatsapp: "Olá, vi a arquitetura Express da webnovax e gostaria de estruturar minha presença digital!",
    note: "A base perfeita para sua transformação digital.",
  },
  {
    tag: "Pro",
    tagColor: "text-primary bg-primary/10 border-primary/20",
    icon: Layers,
    iconColor: "bg-primary/20 text-primary",
    borderColor: "border-primary/30 hover:border-primary/50",
    title: "Arquitetura de Gestão",
    desc: "O ecossistema completo para empresas que buscam estruturar sua operação e escalar resultados.",
    popular: true,
    features: [
      "Site profissional completo",
      "Painel administrativo",
      "Cadastro de clientes",
      "Recebimento de pedidos",
      "Sistema de notificações",
      "Controle financeiro básico",
      "Histórico de informações",
    ],
    cta: "Falar com Arquiteto",
    ctaClass: "gradient-primary border-0 text-white shadow-lg shadow-primary/20",
    ctaIcon: MessageCircle,
    whatsapp: "Olá, gostaria de saber mais sobre a Arquitetura de Gestão da webnovax.",
    note: "Ideal para quem busca controle total e escala operacional.",
  },
  {
    tag: "Sob Medida",
    tagColor: "text-purple-400 bg-purple-500/10 border-purple-500/20",
    icon: Rocket,
    iconColor: "bg-purple-500/20 text-purple-400",
    borderColor: "border-purple-500/20 hover:border-purple-500/40",
    title: "Arquitetura sob Medida",
    desc: "Transformação sob demanda para projetos complexos que exigem engenharia dedicada.",
    features: [
      "Sistemas de gestão",
      "Plataformas internas",
      "Portais para clientes",
      "Sistemas de pedidos",
      "Dashboards administrativos",
      "E muito mais...",
    ],
    cta: "Solicitar Diagnóstico",
    ctaClass: "bg-purple-600 hover:bg-purple-700 border-0 text-white shadow-lg shadow-purple-600/20",
    whatsapp: "Olá, gostaria de um orçamento para uma Arquitetura Digital sob Medida.",
    note: "Engenharia estratégica focada na sua necessidade específica.",
  },
];

export default function PlanosSection() {
  const [expandedPlan, setExpandedPlan] = useState<string | null>(null);

  return (
    <motion.section id="planos" className="py-28 px-6 relative overflow-hidden" initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[200px]" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div variants={fade} className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary bg-primary/10 px-4 py-1.5 rounded-full">Investimento Estratégico</span>
          <h2 className="text-4xl sm:text-6xl font-black text-foreground mt-8 leading-[0.9] tracking-tighter">
            Planos feitos para <br />
            <span className="gradient-text">escalar o seu negócio</span>
          </h2>
          <p className="text-lg text-muted-foreground mt-8 leading-relaxed max-w-xl mx-auto font-medium">
            Escolha a arquitetura ideal para o momento da sua empresa.
          </p>
        </motion.div>

        {/* Toggle button */}
        <motion.div variants={fade} className="flex justify-center mb-10">
          <button
            onClick={() => setExpanded(!expanded)}
            className="group flex items-center gap-2 px-6 py-3 rounded-full glass-card border border-primary/20 hover:border-primary/40 transition-all duration-300"
          >
            <span className="text-sm font-bold text-foreground">{expanded ? "Fechar planos" : "Ver todos os planos"}</span>
            <ChevronDown className={`w-4 h-4 text-primary transition-transform duration-300 ${expanded ? "rotate-180" : ""}`} />
          </button>
        </motion.div>

        {/* Collapsed preview — 3 mini cards */}
        <AnimatePresence mode="wait">
          {!expanded && (
            <motion.div
              key="preview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              {plans.map((plan) => (
                <div
                  key={plan.title}
                  onClick={() => setExpanded(true)}
                  className={`relative glass-card rounded-2xl p-6 border ${plan.borderColor} transition-all duration-300 cursor-pointer group`}
                >
                  {plan.popular && (
                    <div className="absolute -top-px left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent" />
                  )}
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl ${plan.iconColor} flex items-center justify-center shrink-0`}>
                      <plan.icon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <span className={`text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full border ${plan.tagColor}`}>{plan.tag}</span>
                      <h3 className="text-sm font-black text-foreground mt-1 tracking-tight truncate">{plan.title}</h3>
                    </div>
                    {plan.price && (
                      <p className="ml-auto text-lg font-black text-emerald-400 shrink-0">{plan.price}</p>
                    )}
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Expanded full cards */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              key="full"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                {plans.map((plan) => (
                  <motion.div
                    key={plan.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className={`relative glass-card rounded-[2.5rem] p-8 flex flex-col border ${plan.borderColor} transition-all duration-500 group overflow-hidden`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-px left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
                    )}
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                        <span className="text-[10px] uppercase tracking-wider font-bold text-white bg-primary px-4 py-1 rounded-full shadow-lg shadow-primary/30 flex items-center gap-1.5">
                          <Sparkles className="w-3 h-3" /> Mais popular
                        </span>
                      </div>
                    )}

                    {plan.promo && (
                      <div className="absolute top-6 right-6">
                        <span className="text-[10px] font-bold uppercase px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/20 animate-pulse">
                          Promoção
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-3 mb-6 mt-2">
                      <div className={`w-12 h-12 rounded-2xl ${plan.iconColor} flex items-center justify-center group-hover:scale-110 transition-transform duration-500`}>
                        <plan.icon className="w-6 h-6" />
                      </div>
                      <div>
                        <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full border ${plan.tagColor}`}>{plan.tag}</span>
                        <h3 className="text-lg font-black text-foreground mt-1.5 tracking-tight">{plan.title}</h3>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground leading-relaxed mb-6 font-medium">{plan.desc}</p>

                    {plan.price && (
                      <div className="flex items-center gap-4 mb-6 p-4 rounded-2xl bg-muted/30 border border-border">
                        <div className="text-center">
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">{plan.priceLabel}</p>
                          <p className="text-2xl font-black text-emerald-400">{plan.price}</p>
                        </div>
                        <div className="h-8 w-px bg-border" />
                        <div className="text-center">
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Mensalidade</p>
                          <p className="text-2xl font-black text-emerald-400">{plan.monthly}<span className="text-xs font-normal text-muted-foreground">/mês</span></p>
                        </div>
                      </div>
                    )}

                    <ul className="space-y-3 mb-6 flex-1">
                      {plan.features.map((item) => (
                        <li key={item} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                          <CheckCircle className="w-4 h-4 text-primary/60 shrink-0 mt-0.5" />
                          {item}
                        </li>
                      ))}
                    </ul>

                    <p className="text-xs text-muted-foreground/50 italic mb-4 font-medium">{plan.note}</p>

                    <a href={`https://wa.me/5551981964238?text=${encodeURIComponent(plan.whatsapp)}`} target="_blank" rel="noopener noreferrer">
                      <Button className={`w-full h-12 rounded-xl font-bold ${plan.ctaClass} group/btn`}>
                        {plan.cta}
                        {plan.ctaIcon ? <plan.ctaIcon className="w-4 h-4 ml-2" /> : <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />}
                      </Button>
                    </a>
                  </motion.div>
                ))}
              </div>

              <div className="mt-12 text-center">
                <p className="text-xs text-muted-foreground/40 max-w-2xl mx-auto leading-relaxed font-medium">
                  <span className="text-muted-foreground font-bold">Nota:</span> Cada projeto pode receber novas funcionalidades conforme o crescimento da empresa. O domínio e alguns serviços externos podem ter custos separados pagos diretamente pelo cliente.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.section>
  );
}
