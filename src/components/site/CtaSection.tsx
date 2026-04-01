import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle, MessageCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CtaSection() {
  return (
    <section id="contato" className="site-band py-32 px-6 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[8%] left-[15%] w-[360px] h-[360px] rounded-full blur-[140px] opacity-[0.03]" style={{ background: 'radial-gradient(circle, hsl(var(--primary) / 0.35), transparent 72%)' }} />
        <div className="absolute bottom-[0%] right-[12%] w-[420px] h-[420px] rounded-full blur-[150px] opacity-[0.03]" style={{ background: 'radial-gradient(circle, hsl(var(--accent) / 0.35), transparent 72%)' }} />
      </div>
      <motion.div
        className="site-surface relative max-w-4xl mx-auto text-center rounded-[2.75rem] px-8 py-12 md:px-16"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        {/* Badge */}
        <span className="site-badge site-badge--primary mb-8">
          <Sparkles className="w-3.5 h-3.5" />
          Resposta em até 2 horas
        </span>

        <h2 className="text-5xl sm:text-7xl font-black text-foreground/90 mb-8 leading-[0.9] tracking-tighter">
          Pronto para <br />
          <span className="site-gradient-text">escalar?</span>
        </h2>
        <p className="text-xl site-copy-muted mb-12 max-w-2xl mx-auto font-medium leading-relaxed">
          Preencha o cadastro e nossa equipe entra em contato em tempo recorde para entender seu projeto e traçar o melhor plano de ação.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-10">
          <Link to="/cadastro">
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Button
                className="h-14 px-10 rounded-2xl text-white text-base font-bold border-0 group overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, rgba(220,38,38,0.92), rgba(107,33,168,0.9), rgba(236,72,153,0.88))',
                  boxShadow: '0 15px 36px rgba(236,72,153,0.16)',
                }}
              >
                <span className="relative z-10 flex items-center gap-2">
                  Solicitar orçamento
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Button>
            </motion.div>
          </Link>
          <a href="https://wa.me/5551981964238?text=Olá! Quero saber mais sobre os serviços da novaesweb." target="_blank" rel="noopener noreferrer">
            <Button
              className="site-soft-surface h-14 px-10 rounded-2xl text-base font-semibold transition-all"
              style={{
                color: 'hsl(var(--muted-foreground) / 0.95)',
              }}
            >
              <MessageCircle className="w-5 h-5 mr-2" /> Falar no WhatsApp
            </Button>
          </a>
        </div>

        {/* Trust */}
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs text-muted-foreground/65">
          {["Resposta em até 2h", "Orçamento sem compromisso", "Suporte humanizado", "+36 clientes atendidos"].map((item) => (
            <span key={item} className="site-soft-surface flex items-center gap-1.5 rounded-full px-4 py-2">
              <CheckCircle className="w-3.5 h-3.5" style={{ color: 'hsl(var(--success) / 0.5)' }} />
              {item}
            </span>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
