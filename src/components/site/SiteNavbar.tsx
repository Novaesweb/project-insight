import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Menu, X, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
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
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled
        ? "border-b border-white/8 bg-[#08080f]/80 backdrop-blur-2xl shadow-lg shadow-black/30"
        : "border-b border-transparent bg-transparent backdrop-blur-none"
    }`}>
      <div className="max-w-7xl mx-auto px-6 h-[72px] flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="relative">
            <img src={novaesSymbol} alt="NovaesWeb" className="w-9 h-9 rounded-xl object-cover shadow-lg shadow-red-500/20 group-hover:shadow-red-500/40 transition-shadow" />
          </div>
          <span className="text-xl font-bold tracking-tight">
            <span className="gradient-text">Novaes</span>
            <span className="text-[hsl(var(--foreground))]">Web</span>
          </span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden lg:flex items-center gap-6">
          {navLinks.map((link) => (
            <button
              key={link.href}
              onClick={() => scrollTo(link.href)}
              className="text-sm text-[hsl(var(--muted-foreground))] hover:text-white transition-colors font-medium"
            >
              {link.label}
            </button>
          ))}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          <Link to="/cadastro" className="hidden sm:block">
            <Button className="relative gradient-primary border-0 text-white text-sm h-10 px-6 rounded-xl font-semibold shadow-lg shadow-red-500/20 overflow-hidden group">
              <span className="relative z-10 flex items-center gap-2">
                Solicitar orçamento <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </span>
              {/* Pulse ring */}
              <span className="absolute inset-0 rounded-xl animate-ping bg-red-500/20 pointer-events-none" />
            </Button>
          </Link>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2.5 rounded-xl hover:bg-white/8 transition-colors text-[hsl(var(--foreground))]"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-white/8 bg-[#08080f]/95 backdrop-blur-2xl overflow-hidden"
          >
            <div className="px-6 py-5 flex flex-col gap-1">
              {navLinks.map((link, i) => (
                <button
                  key={i}
                  onClick={() => scrollTo(link.href, setMenuOpen)}
                  className="text-left text-sm font-medium text-[hsl(var(--muted-foreground))] hover:text-white transition-colors py-3 border-b border-white/6 flex items-center justify-between"
                >
                  {link.label}
                  <ChevronRight className="w-4 h-4 opacity-40" />
                </button>
              ))}
              {modalLinks.map((link, i) => (
                <button
                  key={`modal-${i}`}
                  onClick={() => { setMenuOpen(false); setTimeout(() => onOpenModal(link.id), 300); }}
                  className="text-left text-sm font-medium text-[hsl(var(--muted-foreground))] hover:text-white transition-colors py-3 border-b border-white/6 last:border-0 flex items-center justify-between"
                >
                  {link.label}
                  <ChevronRight className="w-4 h-4 opacity-40" />
                </button>
              ))}
              <Link to="/cadastro" onClick={() => setMenuOpen(false)} className="mt-2">
                <Button className="gradient-primary border-0 text-white text-sm h-10 rounded-xl w-full font-semibold">
                  Solicitar orçamento <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
