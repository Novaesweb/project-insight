import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle, MessageCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CtaSection() {
  return (
    <section id="contato" className="py-32 px-6 relative overflow-hidden">
      {/* Subtle glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] rounded-full blur-[180px] opacity-[0.06]" style={{ background: 'radial-gradient(circle, #ff3366, transparent 70%)' }} />
      </div>

      <motion.div
        className="relative max-w-3xl mx-auto text-center"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-red-500/15 bg-red-500/[0.06] text-red-400/80 text-xs font-semibold mb-8">
          <Sparkles className="w-3.5 h-3.5" />
          Resposta em até 2 horas
        </div>

        <h2 className="text-5xl sm:text-7xl font-black text-white/90 mb-8 leading-[0.9] tracking-tighter">
          Pronto para <br />
          <span className="gradient-text">escalar?</span>
        </h2>
        <p className="text-xl text-white/30 mb-12 max-w-2xl mx-auto font-medium leading-relaxed">
          Preencha o cadastro e nossa equipe entra em contato em tempo recorde para entender seu projeto e traçar o melhor plano de ação.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
          <Link to="/cadastro">
            <Button className="relative group h-14 px-10 rounded-2xl text-white text-base font-bold border-0 shadow-2xl shadow-purple-500/20 overflow-hidden" style={{ background: 'linear-gradient(135deg, #a855f7, #ff3366, #ec4899)' }}>
              <span className="relative z-10 flex items-center gap-2">
                Solicitar orçamento
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Button>
          </Link>
          <a href="https://wa.me/5551981964238?text=Olá! Quero saber mais sobre os serviços da novaesweb." target="_blank" rel="noopener noreferrer">
            <Button className="h-14 px-10 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-white/20 text-white/70 text-base font-semibold transition-all">
              <MessageCircle className="w-5 h-5 mr-2" /> WhatsApp
            </Button>
          </a>
        </div>

        {/* Trust */}
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-white/25 text-xs">
          {["Resposta em até 2h", "Orçamento sem compromisso", "Suporte humanizado", "+36 clientes atendidos"].map(item => (
            <span key={item} className="flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-500/40" />
              {item}
            </span>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
