import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle, MessageCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const particles = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 3 + 1,
  duration: Math.random() * 4 + 3,
  delay: Math.random() * 3,
}));

export default function CtaSection() {
  return (
    <section id="contato" className="py-32 px-6 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] rounded-full bg-red-600/10 blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[300px] rounded-full bg-pink-600/8 blur-[80px]" />
      </div>

      {/* Floating particles */}
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-red-500/30 pointer-events-none"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size }}
          animate={{ y: [0, -20, 0], opacity: [0.2, 0.6, 0.2] }}
          transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: "easeInOut" }}
        />
      ))}

      <motion.div
        className="relative max-w-3xl mx-auto text-center"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        {/* Badge */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-red-500/30 bg-red-500/10 text-red-400 text-xs font-semibold mb-8"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Resposta em até 2 horas
        </motion.div>

        <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-6 leading-tight">
          Pronto para transformar<br />
          <span className="bg-gradient-to-r from-red-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
            o seu negócio?
          </span>
        </h2>
        <p className="text-white/50 mb-10 text-lg max-w-xl mx-auto leading-relaxed">
          Preencha o cadastro e nossa equipe entra em contato para entender seu projeto. Sem compromisso — é só conversar.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
          <Link to="/cadastro">
            <Button className="relative group h-14 px-10 rounded-2xl bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white text-base font-bold border-0 shadow-2xl shadow-red-500/30 overflow-hidden">
              <span className="relative z-10 flex items-center gap-2">
                Solicitar orçamento
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
              <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
            </Button>
          </Link>
          <a href="https://wa.me/5551981964238?text=Olá! Quero saber mais sobre os serviços da NovaesWeb." target="_blank" rel="noopener noreferrer">
            <Button className="h-14 px-10 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/15 hover:border-white/25 text-white text-base font-semibold transition-all">
              <MessageCircle className="w-5 h-5 mr-2" /> WhatsApp
            </Button>
          </a>
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-white/30 text-xs">
          {["Resposta em até 2h", "Orçamento sem compromisso", "Suporte humanizado", "+36 clientes atendidos"].map(item => (
            <span key={item} className="flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-500/60" />
              {item}
            </span>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
