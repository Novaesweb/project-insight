import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import SiteNavbar from "@/components/site/SiteNavbar";
import SiteFooter from "@/components/site/SiteFooter";
import WhatsAppFloat from "@/components/site/WhatsAppFloat";
import SEOHead from "@/components/SEOHead";
import { CheckCircle, Rocket, Users, Target, Code, Zap, ArrowRight, Shield, Clock, TrendingUp } from "lucide-react";
import { usePublicContact } from "@/hooks/usePublicContact";

const fadeUp = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };
const stagger = { show: { transition: { staggerChildren: 0.1 } } };

const diferenciais = [
  { icon: Rocket, title: "Foco em Resultados", desc: "Cada projeto é pensado para gerar clientes, vendas e crescimento real para o seu negócio." },
  { icon: Shield, title: "Suporte Dedicado", desc: "Acompanhamento próximo com painel exclusivo, suporte por ticket e WhatsApp direto." },
  { icon: Code, title: "Tecnologia Moderna", desc: "Usamos as melhores tecnologias do mercado para criar sites rápidos, seguros e escaláveis." },
  { icon: Clock, title: "Entrega Ágil", desc: "Processos bem definidos para entregar seu projeto no prazo, sem enrolação." },
];

const numeros = [
  { value: "36+", label: "Projetos Entregues" },
  { value: "98%", label: "Satisfação" },
  { value: "24h", label: "Tempo de Resposta" },
  { value: "3x", label: "Mais Clientes" },
];

const etapas = [
  { step: "01", title: "Briefing", desc: "Entendemos o seu negócio, público-alvo e objetivos para criar a melhor estratégia." },
  { step: "02", title: "Desenvolvimento", desc: "Criamos o design e desenvolvemos sua solução digital com tecnologia de ponta." },
  { step: "03", title: "Entrega & Suporte", desc: "Publicamos, treinamos e acompanhamos os resultados com suporte contínuo." },
];

export default function SobreNos() {
  const navigate = useNavigate();
  const { buildWhatsAppUrl } = usePublicContact();

  return (
    <div className="min-h-screen bg-[#08080f] text-white">
      <SEOHead
        title="Sobre a NovaesWeb | Soluções Digitais para Negócios"
        description="Conheça a NovaesWeb: estruturas digitais pensadas para transformar visitantes em clientes. Sites, sistemas e automações para o seu negócio crescer."
      />
      <SiteNavbar onOpenModal={() => {}} />

      {/* Hero */}
      <section className="relative pt-28 pb-16 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <motion.div className="max-w-4xl mx-auto text-center relative z-10" initial="hidden" animate="show" variants={stagger}>
          <motion.h1 variants={fadeUp} className="text-3xl md:text-5xl font-bold leading-tight">
            Transformamos negócios com <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-red-400">presença digital real</span>
          </motion.h1>
          <motion.p variants={fadeUp} className="mt-4 text-base md:text-lg text-white/50 max-w-2xl mx-auto">
            Na NovaesWeb, não criamos apenas sites. Criamos estruturas digitais completas pensadas para gerar clientes, vendas e crescimento.
          </motion.p>
        </motion.div>
      </section>

      {/* História */}
      <section className="py-16 px-4">
        <motion.div className="max-w-3xl mx-auto" initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
          <motion.h2 variants={fadeUp} className="text-2xl font-bold text-center mb-6">Nossa História</motion.h2>
          <motion.div variants={fadeUp} className="space-y-4 text-sm text-white/60 leading-relaxed">
            <p>
              A NovaesWeb nasceu da necessidade de oferecer soluções digitais acessíveis e de alto impacto para pequenos e médios negócios. 
              Percebemos que a maioria das empresas locais não tinha acesso a ferramentas profissionais que realmente gerassem resultados.
            </p>
            <p>
              Desde então, desenvolvemos uma metodologia própria focada em conversão: cada elemento do site, cada funcionalidade e cada automação 
              é projetada para transformar visitantes em clientes e clientes em fãs da sua marca.
            </p>
          </motion.div>
        </motion.div>
      </section>

      {/* Números */}
      <section className="py-16 px-4 bg-white/[0.02]">
        <motion.div className="max-w-4xl mx-auto" initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
          <motion.h2 variants={fadeUp} className="text-2xl font-bold text-center mb-10">Nossos Números</motion.h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {numeros.map((n) => (
              <motion.div key={n.label} variants={fadeUp} className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-red-400">{n.value}</p>
                <p className="text-xs text-white/40 mt-1">{n.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Diferenciais */}
      <section className="py-16 px-4">
        <motion.div className="max-w-5xl mx-auto" initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
          <motion.h2 variants={fadeUp} className="text-2xl font-bold text-center mb-10">Por que a NovaesWeb?</motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {diferenciais.map((d) => (
              <motion.div key={d.title} variants={fadeUp} className="p-5 rounded-2xl border border-white/5 bg-white/[0.02] flex gap-4">
                <div className="p-3 rounded-xl bg-primary/10 h-fit">
                  <d.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{d.title}</h3>
                  <p className="text-xs text-white/50 mt-1">{d.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Processo */}
      <section className="py-16 px-4 bg-white/[0.02]">
        <motion.div className="max-w-4xl mx-auto" initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
          <motion.h2 variants={fadeUp} className="text-2xl font-bold text-center mb-10">Como Trabalhamos</motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {etapas.map((e) => (
              <motion.div key={e.step} variants={fadeUp} className="text-center p-6 rounded-2xl border border-white/5 bg-white/[0.02]">
                <span className="text-3xl font-bold text-primary/30">{e.step}</span>
                <h3 className="text-sm font-bold text-white mt-2">{e.title}</h3>
                <p className="text-xs text-white/50 mt-2">{e.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <motion.div className="max-w-3xl mx-auto text-center" initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
          <motion.h2 variants={fadeUp} className="text-2xl md:text-3xl font-bold">
            Pronto para transformar seu negócio?
          </motion.h2>
          <motion.p variants={fadeUp} className="text-white/50 mt-3 text-sm">
            Fale com a NovaesWeb e receba uma demonstração personalizada para o seu segmento.
          </motion.p>
          <motion.div variants={fadeUp} className="mt-6 flex flex-wrap gap-3 justify-center">
            <Button className="gradient-primary border-0 text-white gap-2" onClick={() => navigate("/cadastro")}>
              Solicitar Orçamento <ArrowRight className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              className="border-white/10 text-white hover:bg-white/5"
              onClick={() => window.open(buildWhatsAppUrl("Olá! Quero falar com a NovaesWeb sobre um projeto para o meu negócio."), "_blank")}
            >
              Falar no WhatsApp
            </Button>
          </motion.div>
        </motion.div>
      </section>

      <SiteFooter onOpenModal={() => {}} />
      <WhatsAppFloat />
    </div>
  );
}
