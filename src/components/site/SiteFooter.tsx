import { motion } from "framer-motion";
import { ArrowRight, Instagram, Mail, MapPin, Phone } from "lucide-react";
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
    <footer className="relative overflow-hidden px-4 pb-12 pt-24 sm:px-6 sm:pt-32">
      <SiteFooterWaves />

      <div className="relative z-10 mx-auto max-w-7xl">
        {/* Top Divider */}
        <div className="mb-16 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        
        <div className="grid gap-10 sm:gap-12 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,0.9fr)]">
          <motion.div 
            className="max-w-md"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div 
              className="flex items-center gap-4 group cursor-pointer"
              whileHover={{ scale: 1.02 }}
            >
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              >
                <OptimizedImage 
                  src={novaeswebSymbol} 
                  alt="NovaesWeb" 
                  width={44} 
                  height={44} 
                  className="h-11 w-11 rounded-xl shadow-lg shadow-primary/25" 
                />
              </motion.div>
              <div>
                <p className="site-gradient-text text-xl font-black tracking-tight group-hover:scale-105 transition-transform origin-left">NovaesWeb</p>
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-white/44 group-hover:text-white/52 transition-colors">Studio Premium</p>
              </div>
            </motion.div>

            <motion.p 
              className="mt-6 text-sm leading-relaxed text-white/56"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}
            >
              Desenha estruturas digitais para marcas que precisam sair do improviso, vender melhor e operar com bases mais claras.
            </motion.p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-white/42">Navegação</p>
            <div className="mt-5 space-y-2">
              {footerLinks.map((link, idx) => (
                <motion.button
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
                  initial={{ opacity: 0, x: -8 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + idx * 0.04, duration: 0.3 }}
                  whileHover={{ x: 4, paddingLeft: "8px" }}
                  className="group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-white/62 transition-all hover:text-white hover:bg-white/[0.05]"
                >
                  <motion.div
                    whileHover={{ x: 2 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ArrowRight className="h-3.5 w-3.5 text-white/28 transition-colors group-hover:text-white/60" />
                  </motion.div>
                  {link.label}
                </motion.button>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-white/42">Conecte-se</p>
            <div className="mt-5 space-y-3">
              {[
                { icon: Instagram, label: "Instagram", url: "https://www.instagram.com/novaesweb.oficial/" },
              ].map((item, idx) => (
                <motion.a
                  key={item.label}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, x: -8 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + idx * 0.08, duration: 0.3 }}
                  whileHover={{ scale: 1.05, x: 4 }}
                  whileTap={{ scale: 0.95 }}
                  className="group site-soft-surface flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-white/76 transition-all hover:text-white hover:shadow-[0_8px_24px_rgba(236,72,153,0.1)]"
                >
                  <motion.div
                    whileHover={{ rotate: 12, scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  >
                    <item.icon className="h-5 w-5" />
                  </motion.div>
                  {item.label}
                </motion.a>
              ))}
            </div>
          </motion.div>
        </div>

        <motion.div 
          className="mt-14 flex flex-col gap-4 border-t border-white/[0.08] pt-8 text-[11px] font-semibold text-white/40 sm:flex-row sm:items-center sm:justify-between"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.4 }}
        >
          <p className="hover:text-white/60 transition-colors">&copy; {new Date().getFullYear()} NovaesWeb. Todos os direitos reservados.</p>
          <p className="text-white/35">Estrutura digital premium para marcas que precisam vender com mais clareza.</p>
        </motion.div>
      </div>
    </footer>
  );
}
