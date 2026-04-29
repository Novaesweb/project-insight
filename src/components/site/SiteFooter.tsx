import { ArrowRight, Instagram } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

import SiteFooterWaves from "@/components/site/SiteFooterWaves";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import novaeswebSymbol from "@/assets/novaesweb-logo-glow.png";
import { handleSiteNavigation } from "@/lib/site-navigation";

interface SiteFooterProps {
  onOpenModal: (id: string) => void;
}

const footerLinks = [
  { href: "#o-que-fazemos", label: "Solucoes" },
  { href: "#resultados", label: "Resultados" },
  { href: "#planos", label: "Planos" },
  { href: "#cadastro", label: "Orcamento" },
  { href: "/sobre", label: "Sobre" },
  { href: "/nichos", label: "Nichos" },
  { href: "/funcionalidades", label: "Modulos" },
  { id: "privacidade", label: "Privacidade" },
  { id: "termos", label: "Termos" },
];

export default function SiteFooter({ onOpenModal }: SiteFooterProps) {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <footer className="relative overflow-hidden px-4 pb-10 pt-20 sm:px-6 sm:pt-24">
      <SiteFooterWaves />

      <div className="relative z-10 mx-auto max-w-7xl border-t border-white/[0.05] pt-16">
        <div className="grid gap-8 sm:gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)_minmax(0,0.8fr)]">
          <div className="max-w-md">
            <div className="flex items-center gap-3">
              <OptimizedImage src={novaeswebSymbol} alt="NovaesWeb" width={40} height={40} className="h-10 w-10 rounded-xl" />
              <div>
                <p className="site-gradient-text text-xl font-black tracking-tight">NovaesWeb</p>
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/38">Studio digital premium</p>
              </div>
            </div>

            <p className="mt-5 text-sm leading-relaxed text-white/52">
              A NovaesWeb desenha estruturas digitais para marcas que precisam sair do generico, vender melhor e operar
              com uma base propria mais clara.
            </p>
          </div>

          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.26em] text-white/35">Navegacao</p>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {footerLinks.map((link) => (
                <button
                  key={link.href ?? link.id}
                  onClick={() =>
                    handleSiteNavigation({
                      href: link.href,
                      id: link.id,
                      locationPathname: location.pathname,
                      navigate,
                      onOpenModal,
                    })
                  }
                  className="group flex items-center gap-2 rounded-xl px-3 py-3 text-left text-sm font-semibold text-white/58 transition-colors hover:bg-white/[0.03] hover:text-white"
                >
                  <ArrowRight className="h-3.5 w-3.5 text-white/22 transition-colors group-hover:text-white/52" />
                  {link.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.26em] text-white/35">Redes e contato</p>
            <div className="mt-4 space-y-3">
              {[
                { icon: Instagram, label: "Instagram", url: "https://www.instagram.com/novaesweb.oficial/" },
              ].map((item) => (
                <a
                  key={item.label}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="site-soft-surface flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-white/74 transition-all hover:text-white"
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-white/[0.05] pt-6 text-[11px] font-semibold text-white/32 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} NovaesWeb. Todos os direitos reservados.</p>
          <p>Estrutura digital premium para marcas que precisam vender com mais clareza.</p>
        </div>
      </div>
    </footer>
  );
}
