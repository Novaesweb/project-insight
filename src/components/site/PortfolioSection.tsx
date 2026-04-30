import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

import PublicDemoGrid from "@/components/site/PublicDemoGrid";
import { Button } from "@/components/ui/button";

export default function PortfolioSection() {
  return (
    <section id="portfolio" className="site-band relative overflow-hidden px-4 py-28 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-14 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <span className="site-badge site-badge--primary mb-4">Nosso Trabalho</span>
            <h2 className="text-[clamp(2rem,7vw,3.75rem)] font-black leading-[0.92] tracking-tighter text-white/92">
              Modelos reais para mostrar como o seu projeto pode nascer com mais{" "}
              <span className="site-gradient-text">presenca</span>
            </h2>
          </div>

          <div className="max-w-xl">
            <p className="text-sm leading-7 text-white/58 sm:text-base">
              Confira alguns modelos de sites que desenvolvemos para diferentes tipos
              de negocio. Todos sao totalmente adaptaveis e podem ser personalizados
              para o seu projeto.
            </p>
            <Link to="/modelos" className="mt-5 inline-flex">
              <Button
                className="h-11 rounded-2xl border border-white/10 px-6 text-[11px] font-black uppercase tracking-[0.22em] text-white"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(220,38,38,0.92), rgba(107,33,168,0.9), rgba(236,72,153,0.88))",
                }}
              >
                Ver todos os modelos
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>

        <PublicDemoGrid />

        <div className="mt-10 rounded-[1.75rem] border border-white/10 bg-white/[0.03] px-6 py-5 text-sm leading-7 text-white/58 backdrop-blur-xl sm:px-7 sm:text-base">
          Todos os sites podem ser personalizados com o nome, cores e informacoes do seu
          negocio.
          <Link to="/modelos" className="ml-2 inline-flex items-center font-semibold text-white/78 transition-colors hover:text-white">
            Ver pagina completa
            <motion.span initial={false} whileHover={{ x: 4 }} className="ml-2 inline-flex">
              <ArrowRight className="h-4 w-4" />
            </motion.span>
          </Link>
        </div>
      </div>
    </section>
  );
}
