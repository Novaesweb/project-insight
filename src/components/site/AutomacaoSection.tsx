import { motion } from "framer-motion";
import { Bot, MessageCircle, Zap, Target, ArrowRight, CheckCircle2, Clock, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import codethioLogo from "@/assets/codethio-logo.png";

const fade = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };
const stagger = { show: { transition: { staggerChildren: 0.08 } } };

const features = [
  {
    icon: Bot,
    title: "Agente IA no WhatsApp",
    desc: "Inteligência artificial treinada no seu negócio que atende, responde e vende 24h por dia.",
    color: "from-emerald-500 to-teal-500",
  },
  {
    icon: MessageCircle,
    title: "Atendimento Automático",
    desc: "Respostas instantâneas para perguntas frequentes, boas-vindas personalizadas e direcionamento inteligente.",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Target,
    title: "Fluxos de Conversão",
    desc: "Funis automatizados que qualificam leads, agendam horários e direcionam para fechamento.",
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: TrendingUp,
    title: "Resultados Mensuráveis",
    desc: "Dashboard com métricas de atendimento, conversão e tempo de resposta em tempo real.",
    color: "from-orange-500 to-red-500",
  },
];

const results = [
  { icon: Clock, value: "< 3s", label: "Tempo de resposta" },
  { icon: Zap, value: "24/7", label: "Disponibilidade" },
  { icon: TrendingUp, value: "+40%", label: "Mais conversões" },
];

export default function AutomacaoSection() {
  return (
    <motion.section className="py-28 px-6 relative overflow-hidden" initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <motion.div variants={fade} className="max-w-3xl mb-20">
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-emerald-400 bg-emerald-500/10 px-4 py-1.5 rounded-full border border-emerald-500/20">
            Automação Inteligente
          </span>
          <h2 className="text-4xl sm:text-6xl font-black text-white mt-8 leading-[0.9] tracking-tighter">
            Automatize o <br />
            <span className="text-white/20">atendimento com </span>
            <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">IA</span>
          </h2>
          <p className="text-lg text-white/40 mt-8 leading-relaxed max-w-xl font-medium">
            Integre inteligência artificial ao seu WhatsApp. Seu negócio atende, vende e agenda automaticamente — sem perder o toque humano.
          </p>
        </motion.div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-16">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              variants={fade}
              className="glass-card rounded-[2rem] p-8 group hover:border-emerald-500/20 transition-all duration-500 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className={`relative w-14 h-14 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-500`}>
                <f.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="relative text-lg font-black text-white tracking-tight mb-3">{f.title}</h3>
              <p className="relative text-sm text-white/40 leading-relaxed font-medium">{f.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Stats + CTA row */}
        <motion.div variants={fade} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Results card */}
          <div className="glass-card rounded-[2.5rem] p-10 border-emerald-500/10">
            <div className="flex items-center gap-3 mb-8">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span className="text-xs font-black text-white uppercase tracking-widest">Resultados Comprovados</span>
            </div>
            <div className="grid grid-cols-3 gap-6">
              {results.map((r) => (
                <div key={r.label} className="text-center">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-3">
                    <r.icon className="w-5 h-5 text-emerald-400" />
                  </div>
                  <p className="text-2xl font-black text-white mb-1">{r.value}</p>
                  <p className="text-[10px] text-white/30 uppercase tracking-wider font-bold">{r.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Partnership card */}
          <div className="glass-card rounded-[2.5rem] p-10 border-emerald-500/10 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-4 mb-6">
                <img src={codethioLogo} alt="CodeThio" className="w-14 h-14 rounded-full border-2 border-emerald-500/20 p-1 bg-[hsl(var(--background))]" />
                <div>
                  <p className="text-xl font-black text-white tracking-tighter">
                    Code<span className="text-emerald-400">Thio</span>
                  </p>
                  <p className="text-[10px] text-emerald-400/60 uppercase font-black tracking-[0.2em]">Parceria Estratégica</p>
                </div>
              </div>
              <p className="text-sm text-white/40 leading-relaxed font-medium mb-6">
                A automação inteligente é desenvolvida pela CodeThio, nossa parceira especializada em IA conversacional e automação de atendimento.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <a href="https://wa.me/5551981964238?text=Olá! Quero saber sobre a automação inteligente no WhatsApp." target="_blank" rel="noopener noreferrer" className="flex-1">
                <Button className="w-full h-12 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold border-0 shadow-lg shadow-emerald-500/20 group">
                  Quero Automatizar <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </a>
              <div className="flex items-center justify-center gap-2 text-[10px] text-white/20 font-bold uppercase tracking-widest">
                <span>A partir de R$60/mês</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}
