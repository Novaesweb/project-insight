import { motion } from "framer-motion";
import { Layout, PenTool, TrendingUp, Cpu, Network, CheckCircle2 } from "lucide-react";

export default function ExperienceSection() {
  const pillars = [
    {
      icon: Network,
      title: "Estrutura",
      description: "Construímos mais que páginas; criamos ecossistemas digitais que sustentam o crescimento do seu negócio.",
      color: "from-blue-500 to-indigo-500"
    },
    {
      icon: TrendingUp,
      title: "Mudança de Valor",
      description: "Quando mudamos a linguagem, mudamos a percepção. E quando a percepção muda, o valor do seu negócio decola.",
      color: "from-primary to-accent"
    },
    {
      icon: Cpu,
      title: "Arquitetura Inteligente",
      description: "Não focamos apenas na execução visual, mas na engenharia por trás de cada interação para gerar resultados reais.",
      color: "from-emerald-500 to-teal-500"
    }
  ];

  return (
    <section className="py-24 relative overflow-hidden bg-[hsl(var(--background))]">
      {/* Background patterns */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto mb-20 text-center">
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[10px] font-black text-primary uppercase tracking-[0.5em] mb-4 block"
          >
            A Nova Mentalidade
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-none mb-8"
          >
            Não é sobre criar páginas.<br />
            É sobre <span className="gradient-text">Arquitetura de Solução</span>.
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-lg text-white/50 leading-relaxed max-w-2xl mx-auto"
          >
            Pare de buscar apenas execução. Comece a investir em estrutura e transformação. 
            Na WebNovaX, estruturamos ativos digitais que geram valor real para o seu negócio.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {pillars.map((pillar, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.2 }}
              className="glass-panel-premium border-white/5 p-8 rounded-[2rem] hover:border-primary/20 transition-all group relative overflow-hidden"
            >
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${pillar.color} flex items-center justify-center mb-6 shadow-lg shadow-black/20 group-hover:scale-110 transition-transform`}>
                <pillar.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">{pillar.title}</h3>
              <p className="text-sm text-white/40 leading-relaxed group-hover:text-white/60 transition-colors">
                {pillar.description}
              </p>
              
              {/* Decorative line */}
              <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
            </motion.div>
          ))}
        </div>

        {/* Strategic Callout */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="mt-20 p-8 md:p-12 rounded-[3rem] bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-xl relative overflow-hidden"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
            <div className="max-w-xl">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                <span className="text-xs font-bold text-white/80 uppercase tracking-widest">O Diferencial do Arquiteto</span>
              </div>
              <h4 className="text-2xl md:text-3xl font-bold text-white mb-4 tracking-tight">
                Mude a linguagem, mude a percepção, <br />
                <span className="text-primary">mude o valor do seu negócio.</span>
              </h4>
              <p className="text-white/40 text-sm leading-relaxed">
                Empresas que investem em estrutura superam quem foca apenas em estética. 
                Nossos ativos são projetados para escalar seu atendimento e suas vendas.
              </p>
            </div>
            <div className="shrink-0">
               <div className="px-6 py-6 rounded-3xl bg-primary/10 border border-primary/20 text-center flex flex-col items-center">
                  <span className="text-[10px] uppercase font-bold text-primary tracking-[0.2em] mb-2">Mentalidade</span>
                  <span className="text-3xl font-black text-white italic">PROXIMO NÍVEL</span>
               </div>
            </div>
          </div>
          
          {/* Subtle glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] -z-10" />
        </motion.div>
      </div>
    </section>
  );
}


