import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import acaiDemo from "@/assets/acai-demo.png";
import barbeariaDemo from "@/assets/barbearia-demo.png";
import bellaMassaDemo from "@/assets/bella-massa-demo.png";
import pizzariaDemo from "@/assets/pizzaria-novaes-demo.png";

const fade = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };
const stagger = { show: { transition: { staggerChildren: 0.1 } } };

const projetos = [
  { img: acaiDemo, nome: "Açaí Premium", categoria: "Loja Virtual", cor: "from-purple-500 to-pink-500" },
  { img: barbeariaDemo, nome: "Barbearia Urban", categoria: "Site + Agendamento", cor: "from-slate-500 to-zinc-500" },
  { img: bellaMassaDemo, nome: "Bella Massa", categoria: "Cardápio Digital", cor: "from-orange-500 to-amber-500" },
  { img: pizzariaDemo, nome: "Pizzaria NovaesWeb", categoria: "E-commerce", cor: "from-red-500 to-orange-500" },
];

function BrowserMockup({ img, nome, categoria, cor }: { img: string; nome: string; categoria: string; cor: string }) {
  return (
    <motion.div variants={fade} className="group relative">
      <div className="rounded-2xl overflow-hidden border border-white/10 bg-white/3 shadow-2xl shadow-black/40 transition-all duration-500 group-hover:shadow-red-500/10 group-hover:border-white/20 group-hover:-translate-y-2">
        {/* Browser chrome */}
        <div className="flex items-center gap-2 px-4 py-3 bg-white/5 border-b border-white/8">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/70" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
            <div className="w-3 h-3 rounded-full bg-green-500/70" />
          </div>
          <div className="flex-1 mx-3 h-6 rounded-md bg-white/5 flex items-center px-3">
            <span className="text-[10px] text-white/30 truncate">novaesweb.vercel.app/{nome.toLowerCase().replace(/ /g, "-")}</span>
          </div>
          <ExternalLink className="w-3.5 h-3.5 text-white/20" />
        </div>
        {/* Screenshot */}
        <div className="relative overflow-hidden h-48">
          <img src={img} alt={nome} className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700" />
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
            <span className="text-xs text-white font-medium">Ver projeto →</span>
          </div>
        </div>
      </div>
      {/* Label */}
      <div className="mt-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-white">{nome}</p>
          <p className="text-xs text-white/40 mt-0.5">{categoria}</p>
        </div>
        <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full bg-gradient-to-r ${cor} bg-clip-text text-transparent border border-white/10`}>
          {categoria}
        </span>
      </div>
    </motion.div>
  );
}

export default function PortfolioSection() {
  return (
    <motion.section id="portfolio" className="py-28 px-6" initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
      <div className="max-w-7xl mx-auto">
        <motion.div variants={fade} className="text-center mb-16">
          <span className="text-xs font-semibold uppercase tracking-widest text-[hsl(var(--primary))]">Portfólio</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mt-3 leading-tight">
            Projetos que fizemos <span className="gradient-text">brilhar</span>
          </h2>
          <p className="text-white/50 mt-4 max-w-lg mx-auto leading-relaxed">
            Cada projeto é único. Veja alguns trabalhos que entregamos com design moderno e alta performance.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {projetos.map((p, i) => (
            <BrowserMockup key={i} {...p} />
          ))}
        </div>
      </div>
    </motion.section>
  );
}
