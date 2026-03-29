import { motion } from "framer-motion";
import { Eye, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DemoButtonSectionProps {
  onOpenDemo: () => void;
}

export default function DemoButtonSection({ onOpenDemo }: DemoButtonSectionProps) {
  return (
    <section id="demonstracao" className="py-16 px-6 relative">
      <div className="max-w-3xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-purple-500/25 bg-purple-500/8 text-purple-400 text-xs font-semibold mb-5">
            <Sparkles className="w-3.5 h-3.5" />
            Portfólio de Sites
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">
            Veja nossos{" "}
            <span className="bg-gradient-to-r from-purple-400 via-red-400 to-pink-400 bg-clip-text text-transparent">
              sites de demonstração
            </span>
          </h3>
          <p className="text-white/40 mb-8 max-w-md mx-auto leading-relaxed text-sm">
            Temos estes e muitos outros projetos que já criamos para nossos clientes. Conheça na prática o que desenvolvemos para pizzarias, barbearias, lojas e diversos outros segmentos.
          </p>
          
          <Button
            onClick={onOpenDemo}
            className="h-14 px-10 rounded-2xl text-white text-base font-bold border-0 shadow-[0_15px_40px_rgba(168,85,247,0.25)] hover:shadow-[0_20px_50px_rgba(168,85,247,0.4)] hover:scale-105 transition-all group"
            style={{ background: 'linear-gradient(135deg, #a855f7, #ff3366, #ec4899)' }}
          >
            <Eye className="w-5 h-5 mr-2" />
            Ver Demonstrações
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
