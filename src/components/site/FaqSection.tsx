import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const faqs = [
  {
    q: "O sistema é difícil de mexer?",
    a: "Não! Projetamos a interface Architect v9.0 para ser intuitiva e direta. Além disso, você tem o suporte da nossa Engenharia de Evolução sempre à disposição."
  },
  {
    q: "Como meus pedidos chegam no WhatsApp?",
    a: "Eles chegam 100% organizados com itens, adicionais escolhidos, endereço de entrega e forma de pagamento, prontos para a produção."
  },
  {
    q: "O site vira um aplicativo?",
    a: "Sim! Usamos tecnologia PWA nativa, permitindo que seu cliente instale um atalho direto na tela inicial do celular dele, sem ocupar espaço de app comum."
  },
  {
    q: "Tem limite de produtos ou pedidos?",
    a: "Zero limites. Nossa engenharia é construída para escala, suportando desde o pequeno produtor até grandes franquias com alto volume de vendas."
  },
  {
    q: "A NovaesWeb cobra taxas por venda?",
    a: "Nunca. Cobramos apenas o valor da sua engenharia e manutenção mensal. O lucro das suas vendas é 100% seu, sem porcentagem para terceiros."
  }
];

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-24 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest mb-6">
            <Sparkles className="w-3 h-3" /> Suporte Architect
          </div>
          <h2 className="text-4xl font-black text-white tracking-tighter sm:text-5xl">
            Dúvidas <span className="text-white/20">Frequentes</span>
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div 
              key={i} 
              className={cn(
                "rounded-[2rem] border transition-all duration-300 overflow-hidden",
                openIndex === i ? "bg-white/[0.03] border-white/10" : "bg-transparent border-white/5 hover:border-white/10"
              )}
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full p-8 flex items-center justify-between text-left group"
              >
                <span className="text-lg font-bold text-white/80 group-hover:text-white transition-colors tracking-tight">
                  {faq.q}
                </span>
                <ChevronDown className={cn(
                  "w-5 h-5 text-white/20 group-hover:text-primary transition-all duration-300",
                  openIndex === i && "rotate-180 text-primary"
                )} />
              </button>
              
              <AnimatePresence>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <div className="px-8 pb-8 text-sm text-white/40 leading-relaxed font-medium">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
