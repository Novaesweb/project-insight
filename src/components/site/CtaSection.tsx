import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle, MessageCircle, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const FALLBACK_NUMBER = "5551991189293";

const nextSteps = [
  "Voce envia o contexto do seu negocio e do que quer melhorar.",
  "A NovaesWeb analisa o melhor formato para sua estrutura digital.",
  "Voce recebe uma orientacao comercial clara com proximos passos.",
];

export default function CtaSection() {
  const [whatsappNumber, setWhatsappNumber] = useState(FALLBACK_NUMBER);

  useEffect(() => {
    supabase
      .from("app_config")
      .select("value")
      .eq("key", "whatsapp_number")
      .single()
      .then(({ data }) => {
        if (data?.value) setWhatsappNumber(data.value.replace(/\D/g, ""));
      });
  }, []);

  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    "Ola! Quero um diagnostico da NovaesWeb para entender a melhor estrutura para meu negocio."
  )}`;

  return (
    <section id="contato" className="site-band py-32 px-6 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-[8%] left-[15%] w-[360px] h-[360px] rounded-full blur-[140px] opacity-[0.03]"
          style={{ background: "radial-gradient(circle, hsl(var(--primary) / 0.35), transparent 72%)" }}
        />
        <div
          className="absolute bottom-[0%] right-[12%] w-[420px] h-[420px] rounded-full blur-[150px] opacity-[0.03]"
          style={{ background: "radial-gradient(circle, hsl(var(--accent) / 0.35), transparent 72%)" }}
        />
      </div>

      <motion.div
        className="site-surface relative max-w-5xl mx-auto text-center rounded-[2.75rem] px-8 py-12 md:px-16"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="absolute inset-0 pointer-events-none opacity-80" style={{ background: "radial-gradient(circle at top center, rgba(236, 72, 153, 0.12), transparent 35%)" }} />
        <div className="absolute inset-x-10 top-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(220,38,38,0.65), rgba(107,33,168,0.6), rgba(236,72,153,0.65), transparent)" }} />

        <span className="site-badge site-badge--primary mb-8">
          <Sparkles className="w-3.5 h-3.5" />
          Diagnostico comercial sem compromisso
        </span>

        <h2 className="text-5xl sm:text-7xl font-black text-foreground/90 mb-8 leading-[0.9] tracking-tighter">
          Vamos desenhar a <br />
          <span className="site-gradient-text">sua proxima estrutura digital?</span>
        </h2>
        <p className="text-xl site-copy-muted mb-12 max-w-2xl mx-auto font-medium leading-relaxed">
          Se voce quer captar melhor, apresentar a marca com mais forca e organizar a operacao com cara de sistema
          profissional, este e o proximo passo.
        </p>

        <div className="grid gap-4 md:grid-cols-3 max-w-4xl mx-auto mb-10">
          {nextSteps.map((step, index) => (
            <div key={step} className="public-page-highlight-card text-left">
              <p className="text-[10px] uppercase tracking-[0.22em] font-black text-white/45 mb-2">Passo {index + 1}</p>
              <p className="text-base font-black text-white leading-relaxed">{step}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-10">
          <Link to="/cadastro">
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Button
                className="h-14 px-10 rounded-2xl text-white text-base font-bold border-0 group overflow-hidden"
                style={{
                  background: "linear-gradient(135deg, rgba(220,38,38,0.92), rgba(107,33,168,0.9), rgba(236,72,153,0.88))",
                  boxShadow: "0 15px 36px rgba(236,72,153,0.16)",
                }}
              >
                <span className="relative z-10 flex items-center gap-2">
                  Solicitar diagnostico
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Button>
            </motion.div>
          </Link>
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
            <Button
              className="site-soft-surface h-14 px-10 rounded-2xl text-base font-semibold transition-all"
              style={{ color: "hsl(var(--muted-foreground) / 0.95)" }}
            >
              <MessageCircle className="w-5 h-5 mr-2" /> Falar no WhatsApp
            </Button>
          </a>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs text-muted-foreground/65">
          {[
            "Resposta consultiva em ate 24h",
            "Sem compromisso para analisar",
            "Projeto alinhado ao seu momento",
            "Time humano no atendimento",
          ].map((item) => (
            <span key={item} className="site-soft-surface flex items-center gap-1.5 rounded-full px-4 py-2">
              <CheckCircle className="w-3.5 h-3.5" style={{ color: "hsl(var(--success) / 0.5)" }} />
              {item}
            </span>
          ))}
        </div>

        <div className="mt-8 rounded-[1.8rem] border border-white/10 bg-white/[0.03] px-5 py-4 max-w-2xl mx-auto">
          <div className="flex items-center justify-center gap-2 mb-2">
            <ShieldCheck className="w-4 h-4 text-white/75" />
            <p className="text-[10px] uppercase tracking-[0.2em] font-black text-white/50">Direcao antes da execucao</p>
          </div>
          <p className="text-sm text-white/72 leading-relaxed">
            A proposta aqui nao e empurrar um pacote. E entender o seu negocio e indicar a estrutura que realmente faz
            sentido para vender, operar e crescer.
          </p>
        </div>
      </motion.div>
    </section>
  );
}
