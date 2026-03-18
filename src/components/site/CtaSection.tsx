import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const fade = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

export default function CtaSection() {
  return (
    <section id="contato" className="py-24 px-6">
      <motion.div
        className="max-w-4xl mx-auto rounded-3xl gradient-primary p-12 sm:p-16 text-center shadow-2xl shadow-[hsl(var(--primary))]/20"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        variants={fade}
      >
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
          Pronto para transformar seu negócio?
        </h2>
        <p className="text-white/80 mb-8 max-w-xl mx-auto">
          Preencha o cadastro e nossa equipe entra em contato em até 2 horas para entender seu projeto. Sem compromisso — é só conversar.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Link to="/cadastro">
            <Button className="bg-white text-[hsl(var(--primary))] hover:bg-white/90 h-12 px-10 rounded-xl text-base font-semibold shadow-lg">
              Solicitar orçamento <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
          <a href="https://wa.me/5551981964238?text=Olá! Quero saber mais sobre os serviços da NovaesWeb." target="_blank" rel="noopener noreferrer">
            <Button className="bg-white/20 text-white hover:bg-white/30 border border-white/30 h-12 px-10 rounded-xl text-base font-semibold">
              <MessageCircle className="w-5 h-5 mr-2" /> WhatsApp
            </Button>
          </a>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-white/60 text-xs">
          <span className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5" /> Resposta em até 2h</span>
          <span className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5" /> Orçamento sem compromisso</span>
          <span className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5" /> Suporte humanizado</span>
        </div>
      </motion.div>
    </section>
  );
}
