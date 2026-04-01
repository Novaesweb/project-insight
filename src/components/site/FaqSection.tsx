import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Sparkles, Plus, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

const faqs = [
  {
    q: "O sistema é difícil de mexer?",
    a: "Não! Projetamos a interface Architect v10.0 para ser intuitiva e direta. Além disso, você tem o suporte da nossa Engenharia de Evolução sempre à disposição.",
  },
  {
    q: "Como meus pedidos chegam no WhatsApp?",
    a: "Eles chegam 100% organizados com itens, adicionais escolhidos, endereço de entrega e forma de pagamento, prontos para a produção.",
  },
  {
    q: "O App no iPhone funciona sem barra de navegador?",
    a: "Com certeza! Ao adicionar à tela inicial, o sistema abre em modo 'Standalone' (Tela Cheia). O usuário nem percebe que é um site; ele navega como se fosse um aplicativo baixado na Apple Store.",
  },
  {
    q: "Tem limite de produtos ou pedidos?",
    a: "Zero limites. Nossa engenharia é construída para escala, suportando desde o pequeno produtor até grandes franquias com alto volume de vendas.",
  },
  {
    q: "A novaesweb cobra taxas por venda?",
    a: "Nunca. Cobramos apenas o valor da sua engenharia e manutenção mensal. O lucro das suas vendas é 100% seu, sem porcentagem para terceiros.",
  },
];

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="site-band py-28 px-6 relative">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="site-badge site-badge--primary mb-8">
            <Sparkles className="w-3 h-3" /> Suporte
          </span>
          <h2 className="text-4xl sm:text-5xl font-black text-foreground/90 tracking-tighter">
            Dúvidas <span className="site-title-muted">Frequentes</span>
          </h2>
          <p className="text-base site-copy-muted mt-4 max-w-lg mx-auto">
            Tudo que você precisa saber antes de começar.
          </p>
        </motion.div>

        {/* FAQ items */}
        <div className="space-y-3">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="site-surface rounded-2xl overflow-hidden transition-all duration-300"
                style={{
                  background: isOpen ? 'linear-gradient(180deg, hsl(var(--primary) / 0.05), hsl(var(--card)))' : 'linear-gradient(180deg, hsl(var(--card)), hsl(240 10% 8% / 0.84))',
                  border: `1px solid ${isOpen ? 'hsl(var(--primary) / 0.14)' : 'hsl(var(--border))'}`,
                }}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="w-full p-6 flex items-center justify-between text-left group"
                >
                  <span className={cn(
                    "text-base font-bold tracking-tight transition-colors",
                    isOpen ? "text-foreground" : "text-foreground/70 group-hover:text-foreground"
                  )}>
                    {faq.q}
                  </span>
                  <div
                    className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ml-4 transition-all duration-300",
                    )}
                    style={{
                      background: isOpen ? 'hsl(var(--primary) / 0.1)' : 'hsl(var(--secondary))',
                      border: `1px solid ${isOpen ? 'hsl(var(--primary) / 0.2)' : 'hsl(var(--border))'}`,
                    }}
                  >
                    {isOpen ? (
                      <Minus className="w-3.5 h-3.5" style={{ color: 'hsl(var(--primary))' }} />
                    ) : (
                      <Plus className="w-3.5 h-3.5 text-muted-foreground" />
                    )}
                  </div>
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <div className="px-6 pb-6 text-sm text-muted-foreground leading-relaxed font-medium">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
