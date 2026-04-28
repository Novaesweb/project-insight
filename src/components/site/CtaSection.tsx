import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, MessageCircle, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

const FALLBACK_NUMBER = "5551991189293";

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

  const whatsappUrl = useMemo(
    () =>
      `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
        "Ola! Quero entender a melhor estrutura da NovaesWeb para o meu negocio."
      )}`,
    [whatsappNumber]
  );

  return (
    <section id="contato" className="site-band px-4 sm:px-6 pb-24 pt-16 lg:pb-28 lg:pt-20">
      <motion.div
        className="public-page-cta-card max-w-5xl mx-auto"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <div className="mx-auto max-w-3xl text-center">
          <span className="site-badge site-badge--primary mb-7">
            <Sparkles className="h-3.5 w-3.5" />
            Proximo passo
          </span>

          <h2 className="text-4xl sm:text-5xl font-black tracking-tighter text-white/92 leading-[0.92]">
            Se a sua marca precisa parecer mais forte, este e o momento de estruturar direito.
          </h2>

          <p className="mt-5 text-lg leading-relaxed text-white/64">
            A NovaesWeb monta o diagnóstico inicial, indica o formato ideal e desenha uma base digital com mais clareza
            comercial e operacional.
          </p>

          <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:flex-wrap">
            {[
              "Sem compromisso para analisar",
              "Resposta consultiva em ate 24h",
              "Orientacao alinhada ao seu momento",
            ].map((item) => (
              <span key={item} className="site-soft-surface inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-full px-4 py-2 text-[11px] font-bold text-white/72">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300/80" />
                {item}
              </span>
            ))}
          </div>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <a href="#cadastro" className="w-full sm:w-auto">
              <Button
                className="h-12 w-full rounded-2xl border border-white/10 px-8 text-sm font-black uppercase tracking-[0.16em] text-white shadow-[0_18px_40px_rgba(236,72,153,0.18)]"
                style={{ background: "linear-gradient(135deg, rgba(220,38,38,0.92), rgba(107,33,168,0.9), rgba(236,72,153,0.88))" }}
              >
                Solicitar orcamento
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </a>
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
              <Button className="site-soft-surface h-12 w-full rounded-2xl px-8 text-sm font-bold text-white/84">
                <MessageCircle className="mr-2 h-4 w-4" />
                Falar no WhatsApp
              </Button>
            </a>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
