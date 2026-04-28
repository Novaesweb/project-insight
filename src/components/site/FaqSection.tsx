import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const faqs = [
  {
    question: "Quanto tempo demora para meu site ficar pronto?",
    answer: "Para projetos institucionais ou landing pages de alta conversão, o prazo médio é de 10 a 15 dias úteis. Para sistemas complexos ou e-commerces, o prazo é alinhado no momento da proposta, geralmente entre 20 a 30 dias úteis.",
  },
  {
    question: "Vocês fazem apenas o design ou a programação também?",
    answer: "Entregamos a solução completa: do planejamento comercial, passando pelo design da interface (UI/UX) até a programação e publicação no seu domínio. Seu projeto já sai pronto para uso.",
  },
  {
    question: "Como funciona a manutenção depois que o site está no ar?",
    answer: "Oferecemos planos de suporte contínuo para garantir que seu site continue rápido, seguro e atualizado. Caso prefira assumir a gestão, nosso painel de controle permite que sua própria equipe faça atualizações básicas sem depender da agência.",
  },
  {
    question: "Preciso ter as fotos e textos prontos?",
    answer: "Não. Contamos com um processo guiado onde nossa equipe de copywriters e diretores de arte auxilia na estruturação de todo o conteúdo necessário, além de utilizarmos bancos de imagens premium quando fotos próprias não estão disponíveis.",
  },
];

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="site-band py-24 px-4 sm:px-6 relative">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <span className="site-badge site-badge--accent mb-4 mx-auto">Dúvidas Frequentes</span>
          <h2 className="text-[clamp(2rem,5vw,3rem)] font-black text-white/90 leading-[0.92] tracking-tighter">
            O que as empresas <span className="site-gradient-text">mais perguntam.</span>
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            
            return (
              <div 
                key={index}
                className={cn(
                  "site-surface rounded-[1.5rem] border transition-all duration-300",
                  isOpen ? "border-primary/30 bg-white/[0.04] shadow-[0_0_20px_rgba(236,72,153,0.1)]" : "border-white/5 hover:border-white/10"
                )}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="flex w-full items-center justify-between p-6 text-left"
                >
                  <h3 className={cn("text-lg font-black tracking-tight pr-8 transition-colors duration-300", isOpen ? "text-white" : "text-white/80")}>
                    {faq.question}
                  </h3>
                  <div className={cn(
                    "flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-full border transition-all duration-300",
                    isOpen ? "border-primary/40 bg-primary/20 rotate-180" : "border-white/10 bg-white/5"
                  )}>
                    <ChevronDown className={cn("w-4 h-4 transition-colors", isOpen ? "text-primary-foreground" : "text-white/60")} />
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
                      <div className="px-6 pb-6 pt-0">
                        <div className="h-[1px] w-full bg-white/5 mb-6" />
                        <p className="text-base leading-relaxed site-copy-muted">
                          {faq.answer}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
