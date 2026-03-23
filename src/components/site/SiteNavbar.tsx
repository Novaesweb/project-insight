import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Menu, X, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import novaesSymbol from "@/assets/novaesweb-symbol.jpeg";

interface SiteNavbarProps {
  onOpenModal: (id: string) => void;
}

const navLinks = [
  { href: "#servicos", label: "Serviços" },
  { href: "#solucoes", label: "Soluções" },
  { href: "#processo", label: "Processo" },
  { href: "#planos", label: "Planos" },
  { href: "#resultados", label: "Resultados" },
  { href: "#contato", label: "Contato" },
];

const modalLinks = [
  { id: "sobre", label: "Sobre NovaesWeb" },
  { id: "quem-somos", label: "Quem Somos" },
  { id: "diferenciais", label: "Por que a NovaesWeb?" },
  { id: "demonstracao", label: "Demonstração" },
];

export function scrollTo(href: string, setMenuOpen?: (v: boolean) => void) {
  setMenuOpen?.(false);
  setTimeout(() => {
    const el = document.getElementById(href.replace("#", ""));
    if (el) el.scrollIntoView({ behavior: "smooth" });
  }, 350);
}

export default function SiteNavbar({ onOpenModal }: SiteNavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-700 ease-in-out px-4 py-6 sm:px-8",
      scrolled && "py-4"
    )}>
      <div className={cn(
        "max-w-7xl mx-auto h-16 flex items-center justify-between transition-all duration-700 rounded-[24px] px-8 border border-transparent",
        scrolled
          ? "glass-panel-premium border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-2xl translate-y-0"
          : "bg-transparent"
      )}>
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <motion.div 
            whileHover={{ rotate: 10, scale: 1.1 }}
            className="relative"
          >
            <img src={novaesSymbol} alt="NovaesWeb" className="w-8 h-8 rounded-lg object-cover shadow-lg shadow-red-500/20 group-hover:shadow-red-500/40 transition-shadow" />
          </motion.div>
          <span className="text-lg font-bold tracking-tighter">
            <span className="gradient-text">Novaes</span>
            <span className="text-white">Web</span>
          </span>
        </Link>

        <div className="hidden lg:flex items-center gap-10">
          {navLinks.map((link) => (
            <button
              key={link.href}
              onClick={() => scrollTo(link.href)}
              className="text-[13px] text-white/40 hover:text-white transition-all font-bold tracking-[0.1em] uppercase group relative"
            >
              <span className="relative z-10">{link.label}</span>
              <span className="absolute -bottom-1.5 left-0 w-0 h-[3px] bg-gradient-to-r from-primary to-accent rounded-full group-hover:w-full transition-all duration-500 ease-out" />
            </button>
          ))}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-4">
          <Link to="/cadastro" className="hidden sm:block">
            <Button className="h-11 px-8 rounded-2xl gradient-primary text-white text-[13px] font-black shadow-[0_10px_30px_rgba(255,51,102,0.3)] hover:shadow-[0_15px_40px_rgba(255,51,102,0.5)] group overflow-hidden border-0 transition-all hover:-translate-y-0.5 animate-shimmer bg-[linear-gradient(110deg,#ff3366,45%,#ff6699,55%,#ff3366)] bg-[length:200%_100%]">
              <span className="relative z-10 flex items-center gap-2 tracking-widest uppercase">
                Acesse Já <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
              </span>
            </Button>
          </Link>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-white lg:hidden"
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-3xl lg:hidden flex flex-col p-8"
          >
            <div className="flex justify-between items-center mb-12">
              <div className="flex items-center gap-3">
                <img src={novaesSymbol} alt="NovaesWeb" className="w-10 h-10 rounded-xl" />
                <span className="text-2xl font-black gradient-text">Menu</span>
              </div>
              <button 
                onClick={() => setMenuOpen(false)}
                className="p-3 bg-white/5 rounded-2xl"
              >
                <X className="w-8 h-8 text-white" />
              </button>
            </div>

            <div className="flex flex-col gap-2">
              {[...navLinks, ...modalLinks].map((link, i) => {
                const isNavLink = 'href' in link;
                return (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => {
                      if (isNavLink) {
                        scrollTo((link as any).href, setMenuOpen);
                      } else {
                        setMenuOpen(false);
                        setTimeout(() => onOpenModal((link as any).id), 300);
                      }
                    }}
                    className="text-left text-2xl font-bold text-white/70 hover:text-primary transition-colors py-4 border-b border-white/5 flex items-center justify-between group"
                  >
                    {link.label}
                    <ArrowRight className="w-6 h-6 opacity-0 group-hover:opacity-100 transition-all -translate-x-4 group-hover:translate-x-0" />
                  </motion.button>
                );
              })}
            </div>

            <div className="mt-auto">
              <Link to="/cadastro" onClick={() => setMenuOpen(false)}>
                <Button className="h-16 rounded-2xl w-full gradient-primary text-xl font-bold">
                  Impulsionar meu negócio
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
