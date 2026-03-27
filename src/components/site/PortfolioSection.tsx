import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ExternalLink, ChevronRight, Sparkles, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import acaiDemo from "@/assets/acai-demo.webp";
import barbeariaDemo from "@/assets/barbearia-demo.webp";
import bellaMassaDemo from "@/assets/bella-massa-demo.webp";
import pizzariaDemo from "@/assets/pizzaria-webnovax-demo.png";

const demos = [
  {
    id: "barbearia",
    label: "✂️ Barbearia / Salão",
    nome: "Barbearia Urban",
    img: barbeariaDemo,
    link: "https://barber00.vercel.app/",
    descricao: "Site moderno com agendamento online integrado. Seus clientes marcam horário 24h por dia, sem precisar ligar.",
    recursos: ["Agendamento online", "Galeria de cortes", "Equipe de profissionais", "Avaliações de clientes"],
    prazo: "até 5 dias",
    tag: "Alta conversão",
  },
  {
    id: "loja",
    label: "🛍️ Loja / E-commerce",
    nome: "Açaí Premium",
    img: acaiDemo,
    link: "https://demoacai.vercel.app/",
    descricao: "Loja virtual completa com catálogo, carrinho, checkout e pagamentos integrados (Pix, cartão, boleto).",
    recursos: ["Catálogo de produtos", "Carrinho de compras", "Pagamento online", "Controle de estoque"],
    prazo: "até 7 dias",
    tag: "Venda 24h",
  },
  {
    id: "alimentacao",
    label: "🍝 Alimentação",
    nome: "Bella Massa",
    img: bellaMassaDemo,
    link: "https://bellamassa0.vercel.app/",
    descricao: "Site elegante para restaurantes com reservas online, cardápio interativo e integração com delivery.",
    recursos: ["Reserva de mesas", "Cardápio online", "Delivery integrado", "Programa de fidelidade"],
    prazo: "até 5 dias",
    tag: "Reservas online",
  },
];

export default function PortfolioSection() {
  const [selected, setSelected] = useState(0);
  const demo = demos[selected];

  return (
    <section id="portfolio" className="py-28 px-6 relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[600px] h-[400px] rounded-full bg-red-600/5 blur-[100px]" />
      </div>

      <div className="max-w-7xl mx-auto relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-red-500/25 bg-red-500/8 text-red-400 text-xs font-semibold mb-5">
            <Sparkles className="w-3.5 h-3.5" />
            Escolha o modelo do seu negócio
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight mb-4">
            Como ficaria o{" "}
            <span className="bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent">
              seu site?
            </span>
          </h2>
          <p className="text-white/50 max-w-xl mx-auto leading-relaxed">
            Selecione o segmento que mais se parece com o seu negócio e veja uma demonstração real. 
            <strong className="text-white/70"> Personalizamos tudo para você.</strong>
          </p>
        </motion.div>

        {/* Segment selector pills */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ delay: 0.1 }}
          className="flex flex-wrap justify-center gap-2 mb-12"
        >
          {demos.map((d, i) => (
            <button
              key={d.id}
              onClick={() => setSelected(i)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                selected === i
                  ? "bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-lg shadow-red-500/25 scale-105"
                  : "bg-white/5 text-white/60 border border-white/10 hover:bg-white/10 hover:text-white hover:border-white/20"
              }`}
            >
              {d.label}
            </button>
          ))}
        </motion.div>

        {/* Demo preview + info */}
        <AnimatePresence mode="wait">
          <motion.div
            key={demo.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35 }}
            className="grid lg:grid-cols-2 gap-10 items-center"
          >
            {/* Browser mockup */}
            <a 
              href={demo.link} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="group relative block"
            >
              {/* Tag badge */}
              <div className="absolute -top-3 -right-3 z-10 px-3 py-1 rounded-full bg-gradient-to-r from-red-500 to-pink-600 text-white text-[10px] font-bold shadow-lg shadow-red-500/30 transition-transform group-hover:scale-110">
                {demo.tag}
              </div>

              <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-black/50 group-hover:border-red-500/30 transition-all group-hover:-translate-y-1 duration-500">
                {/* Browser chrome */}
                <div className="flex items-center gap-2 px-4 py-3 bg-white/6 border-b border-white/8">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/70" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                    <div className="w-3 h-3 rounded-full bg-green-500/70" />
                  </div>
                  <div className="flex-1 mx-3 h-6 rounded-md bg-white/6 flex items-center px-3 gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500/60" />
                    <span className="text-[10px] text-white/30 truncate">
                      {demo.link.replace("https://", "").replace("/", "")}
                    </span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-white/40 group-hover:text-red-400 transition-colors" />
                </div>
                {/* Screenshot */}
                <div className="relative overflow-hidden h-72">
                  <img
                    src={demo.img}
                    alt={demo.nome}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
                  />
                  {/* Hover overlay indicator */}
                  <div className="absolute inset-0 bg-red-600/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 text-white text-xs font-semibold flex items-center gap-2">
                       Acessar demonstração <ExternalLink className="w-3 h-3" />
                    </div>
                  </div>
                  {/* Gradient overlay at bottom */}
                  <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-xs text-white/80 font-medium">Site no ar — Ver demonstração</span>
                  </div>
                </div>
              </div>
            </a>

            {/* Info panel */}
            <div className="space-y-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-red-400 mb-2">Modelo {demo.nome}</p>
                <h3 className="text-2xl font-bold text-white leading-tight mb-3">
                  Tudo que o seu negócio<br />precisa para vender mais
                </h3>
                <p className="text-white/60 leading-relaxed">{demo.descricao}</p>
              </div>

              {/* Features */}
              <ul className="space-y-2.5">
                {demo.recursos.map((r) => (
                  <li key={r} className="flex items-center gap-3 text-sm text-white/80">
                    <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    {r}
                  </li>
                ))}
              </ul>

              {/* Social proof */}
              <div className="flex items-center gap-3 p-4 rounded-xl bg-white/4 border border-white/8">
                <div className="flex -space-x-2">
                  {["C", "A", "M"].map((l, i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-pink-600 border-2 border-[#08080f] flex items-center justify-center text-white text-xs font-bold">
                      {l}
                    </div>
                  ))}
                </div>
                <div>
                  <p className="text-xs text-white font-semibold">+36 negócios já cresceram</p>
                  <p className="text-[11px] text-white/40">Entregamos em {demo.prazo} úteis</p>
                </div>
              </div>

              {/* CTA */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Link to="/cadastro" className="flex-1">
                  <Button className="w-full h-12 rounded-xl bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white border-0 font-bold shadow-lg shadow-red-500/20 gap-2 group">
                    Quero um site assim
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </Button>
                </Link>
                <a
                  href={demo.link}
                  target="_blank" rel="noopener noreferrer"
                  className="flex-1"
                >
                  <Button variant="outline" className="w-full h-12 rounded-xl border-white/15 bg-white/5 text-white/70 hover:text-white hover:bg-white/10 gap-2 group">
                    <ExternalLink className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    Ver site ao vivo
                  </Button>
                </a>
              </div>

              <p className="text-xs text-white/25 text-center">✓ Sem taxa de setup · ✓ Hospedagem inclusa · ✓ Suporte após entrega</p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}



