import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle, MessageCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CtaSection() {
  return (
    <section id="contato" className="py-32 px-6 relative overflow-hidden">
      <motion.div
        className="relative max-w-3xl mx-auto text-center"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        {/* Badge */}
        <span
          className="inline-flex items-center gap-2 text-xs font-semibold mb-8 px-4 py-1.5 rounded-full"
          style={{
            background: 'hsl(var(--primary) / 0.08)',
            border: '1px solid hsl(var(--primary) / 0.15)',
            color: 'hsl(var(--primary))',
          }}
        >
          <Sparkles className="w-3.5 h-3.5" />
          Resposta em até 2 horas
        </span>

        <h2 className="text-5xl sm:text-7xl font-black text-foreground/90 mb-8 leading-[0.9] tracking-tighter">
          Pronto para <br />
          <span className="gradient-text">escalar?</span>
        </h2>
        <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto font-medium leading-relaxed">
          Preencha o cadastro e nossa equipe entra em contato em tempo recorde para entender seu projeto e traçar o melhor plano de ação.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-10">
          <Link to="/cadastro">
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Button
                className="h-14 px-10 rounded-2xl text-white text-base font-bold border-0 group overflow-hidden"
                style={{
                  background: 'var(--gradient-primary)',
                  boxShadow: '0 15px 40px hsl(var(--accent) / 0.25)',
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
              className="h-14 px-10 rounded-2xl text-base font-semibold transition-all"
              style={{
                background: 'hsl(var(--secondary) / 0.5)',
                border: '1px solid hsl(var(--border))',
                color: 'hsl(var(--muted-foreground))',
              }}
            >
              <MessageCircle className="w-5 h-5 mr-2" /> WhatsApp
            </Button>
          </a>
        </div>

        {/* Trust */}
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs text-muted-foreground/50">
          {["Resposta em até 2h", "Orçamento sem compromisso", "Suporte humanizado", "+36 clientes atendidos"].map((item) => (
            <span key={item} className="flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5" style={{ color: 'hsl(var(--success) / 0.5)' }} />
              {item}
            </span>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
