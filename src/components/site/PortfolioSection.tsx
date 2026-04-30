import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { PUBLIC_DEMO_SITES } from "@/lib/public-demo-sites";

export default function PortfolioSection() {
  return (
    <section id="portfolio" className="site-band relative overflow-hidden px-4 py-28 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-14 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <span className="site-badge site-badge--primary mb-4">Nosso Trabalho</span>
            <h2 className="text-[clamp(2rem,7vw,3.75rem)] font-black leading-[0.92] tracking-tighter text-white/92">
              Veja nossos modelos em uma{" "}
              <span className="site-gradient-text">pagina separada</span>
            </h2>
          </div>

          <div className="max-w-xl">
            <p className="text-sm leading-7 text-white/58 sm:text-base">
              Em vez de mostrar todos os modelos na home, deixamos uma pagina propria
              para voce navegar com mais calma e comparar os estilos que a NovaesWeb
              ja tem como referencia.
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

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.7fr)]">
          <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl sm:p-8">
            <span className="site-badge site-badge--accent mb-5">
              <Sparkles className="h-3.5 w-3.5" />
              Pagina de modelos
            </span>
            <p className="max-w-2xl text-base leading-8 text-white/64">
              Reunimos todos os sites e cardapios publicados em uma pagina dedicada.
              Assim a home fica mais limpa e voce consegue abrir os modelos com mais
              conforto em um lugar so.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <span className="inline-flex rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-[11px] font-black uppercase tracking-[0.18em] text-white/70">
                {PUBLIC_DEMO_SITES.length} modelos publicados
              </span>
              <span className="inline-flex rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-[11px] font-black uppercase tracking-[0.18em] text-white/70">
                Sites e cardapios personalizaveis
              </span>
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-white/10 bg-[linear-gradient(135deg,rgba(220,38,38,0.14),rgba(107,33,168,0.14),rgba(236,72,153,0.11))] p-6 backdrop-blur-xl sm:p-8">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/45">
              Acesso rapido
            </p>
            <h3 className="mt-3 text-2xl font-black tracking-tight text-white/92">
              Abrir todos os modelos
            </h3>
            <p className="mt-3 text-sm leading-7 text-white/60">
              Entre na pagina completa para ver cada demo com mais clareza e escolher o
              estilo que faz mais sentido para o seu negocio.
            </p>
            <Link to="/modelos" className="mt-6 inline-flex">
              <Button
                className="h-11 rounded-2xl border border-white/10 px-6 text-[11px] font-black uppercase tracking-[0.22em] text-white"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(220,38,38,0.92), rgba(107,33,168,0.9), rgba(236,72,153,0.88))",
                }}
              >
                Ir para a pagina
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
