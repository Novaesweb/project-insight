import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle, MessageCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CtaSection() {
  return (
    <section id="contato" className="py-32 px-6 relative overflow-hidden">
      {/* Background radial glow — static, no blur animation */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] rounded-full bg-red-600/10 blur-[120px]" />
      </div>

      <motion.div
        className="relative max-w-3xl mx-auto text-center"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-red-500/30 bg-red-500/10 text-red-400 text-xs font-semibold mb-8">
          <Sparkles className="w-3.5 h-3.5" />
          Resposta em até 2 horas
        </div>

        <h2 className="text-5xl sm:text-7xl font-black text-white mb-8 leading-[0.9] tracking-tighter">
          Pronto para <br />
          <span className="gradient-text">escalar?</span>
        </h2>
        <p className="text-xl text-white/40 mb-12 max-w-2xl mx-auto font-medium leading-relaxed">
          Preencha o cadastro e nossa equipe entra em contato em tempo recorde para entender seu projeto e traçar o melhor plano de ação.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
          <Link to="/cadastro">
            <Button className="relative group h-14 px-10 rounded-2xl bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white text-base font-bold border-0 shadow-2xl shadow-red-500/30 overflow-hidden">
              <span className="relative z-10 flex items-center gap-2">
                Solicitar orçamento
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Button>
          </Link>
          <a href="https://wa.me/5551981964238?text=Olá! Quero saber mais sobre os serviços da webnovax." target="_blank" rel="noopener noreferrer">
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
