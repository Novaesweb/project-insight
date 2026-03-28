import { motion } from "framer-motion";
import { Bot, MessageCircle, Zap, Target, ArrowRight, CheckCircle2, Clock, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

const fade = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };
const stagger = { show: { transition: { staggerChildren: 0.08 } } };

const features = [
  { icon: Bot, title: "Agente IA no WhatsApp", desc: "Inteligência artificial treinada no seu negócio que atende, responde e vende 24h por dia.", color: "from-emerald-500 to-teal-500" },
  { icon: MessageCircle, title: "Atendimento Automático", desc: "Respostas instantâneas para perguntas frequentes, boas-vindas personalizadas e direcionamento inteligente.", color: "from-blue-500 to-cyan-500" },
  { icon: Target, title: "Fluxos de Conversão", desc: "Funis automatizados que qualificam leads, agendam horários e direcionam para fechamento.", color: "from-purple-500 to-pink-500" },
  { icon: TrendingUp, title: "Resultados Mensuráveis", desc: "Dashboard com métricas de atendimento, conversão e tempo de resposta em tempo real.", color: "from-orange-500 to-red-500" },
];

const results = [
  { icon: Clock, value: "< 3s", label: "Tempo de resposta" },
  { icon: Zap, value: "24/7", label: "Disponibilidade" },
  { icon: TrendingUp, value: "+40%", label: "Mais conversões" },
];

export default function AutomacaoSection() {
  return (
    <motion.section className="py-28 px-6 relative overflow-hidden" initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} variants={stagger}>
      {/* Background — static, no blur animation */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px]" />
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
            A NovaesWeb cria sites para delivery e automatiza seu atendimento no WhatsApp para você focar no que realmente importa: <span className="text-emerald-400 font-bold">vender.</span>
          </p>
        </motion.div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-16">
          {features.map((f) => (
            <motion.div
              key={f.title}
              variants={fade}
              className="glass-card rounded-[2rem] p-8 group hover:border-emerald-500/20 transition-colors duration-300 relative overflow-hidden"
            >
              <div className={`relative w-14 h-14 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
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

          {/* CTA card */}
          <div className="glass-card rounded-[2.5rem] p-10 border-emerald-500/10 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <p className="text-xl font-black text-foreground tracking-tighter">
                    Comece a <span className="text-emerald-400">Automatizar</span>
                  </p>
                  <p className="text-[10px] text-emerald-400/60 uppercase font-black tracking-[0.2em]">Fale com a novaesweb</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed font-medium mb-4">
                Seu WhatsApp responde automaticamente seus clientes e direciona direto para o seu site de pedidos — sem você precisar ficar online o tempo todo.
              </p>
              <div className="flex items-start gap-2 bg-emerald-500/5 border border-emerald-500/10 rounded-xl px-4 py-3 mb-3">
                <Bot className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  <span className="text-emerald-400 font-bold">💡 Automação a partir de R$60/mês</span> — seu WhatsApp responde automaticamente e direciona para o seu site de pedidos.
                </p>
              </div>
              <div className="flex items-start gap-2 bg-emerald-500/5 border border-emerald-500/10 rounded-xl px-4 py-3 mb-6">
                <Zap className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  <span className="text-emerald-400 font-bold">🚀 Soluções avançadas</span> — projetos personalizados desenvolvidos em parceria com especialistas, com valores ajustados conforme a necessidade do seu negócio.
                </p>
              </div>
            </div>
            <a href="https://wa.me/5551981964238?text=Olá! Quero saber sobre a automação inteligente no WhatsApp." target="_blank" rel="noopener noreferrer">
              <Button className="w-full h-12 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold border-0 shadow-lg shadow-emerald-500/20 group">
                Falar com a novaesweb <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </a>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}
