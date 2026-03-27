import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Menu, X, ChevronDown, ChevronRight, Star, Users, Zap, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import novaeswebSymbol from "@/assets/novaesweb-main-logo.webp";

interface SiteNavbarProps {
  onOpenModal: (id: string) => void;
}

const navLinks = [
  { href: "#servicos", label: "Serviços" },
  { href: "#solucoes", label: "Soluções" },
  { href: "#processo", label: "Processo" },
  { href: "#planos", label: "Planos" },
  { href: "#resultados", label: "Resultados" },
];

const companyLinks = [
  { id: "sobre", label: "Sobre a NovaesWeb", icon: Star },
  { id: "quem-somos", label: "Quem Somos", icon: Users },
  { id: "diferenciais", label: "Diferenciais", icon: Target },
];



import { scrollTo } from "@/lib/utils";

export default function SiteNavbar({ onOpenModal }: SiteNavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-700 ease-in-out px-4 py-6 sm:px-8",
      scrolled && "py-4"
    )} onMouseLeave={() => setActiveDropdown(null)}>
      <div className={cn(
        "max-w-7xl mx-auto h-16 flex items-center justify-between transition-all duration-700 rounded-[24px] px-8 border border-transparent relative",
        scrolled
          ? "border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] bg-[hsl(var(--background)/0.95)] translate-y-0"
          : "bg-transparent"
      )}>
        {/* Logo */}
        <Link 
          to="/" 
          onClick={(e) => {
            if (window.location.pathname === "/") {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }
          }}
          className="flex items-center gap-2.5 group"
        >
          <motion.div 
            whileHover={{ rotate: 10, scale: 1.1 }}
            className="relative"
          >
            <img src={novaeswebSymbol} alt="novaesweb" className="w-8 h-8 rounded-lg object-cover shadow-lg shadow-red-500/20 group-hover:shadow-red-500/40 transition-shadow" />
          </motion.div>
            <span className="gradient-text">NovaesWeb</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden lg:flex items-center gap-8">
          {/* Dropdown Empresa */}
          <div className="relative" onMouseEnter={() => setActiveDropdown("empresa")}>
            <button className="flex items-center gap-1.5 text-[13px] text-white/50 hover:text-white transition-all font-bold tracking-[0.1em] uppercase group">
              Empresa <ChevronDown className={cn("w-4 h-4 transition-transform", activeDropdown === "empresa" && "rotate-180")} />
            </button>
            <AnimatePresence>
              {activeDropdown === "empresa" && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full left-1/2 -translate-x-1/2 pt-4 w-64"
                >
                  <div className="glass-panel-premium border-white/10 p-4 rounded-3xl shadow-2xl overflow-hidden">
                    {companyLinks.map(link => (
                      <button
                        key={link.id}
                        onClick={() => { onOpenModal(link.id); setActiveDropdown(null); }}
                        className="flex items-center gap-3 w-full p-3 hover:bg-white/5 rounded-2xl transition-all text-left group/item"
                      >
                        <link.icon className="w-5 h-5 text-primary" />
                        <span className="text-xs font-bold text-white/70 group-hover/item:text-white">{link.label}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

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
          <button onClick={() => scrollTo("#cadastro")} className="hidden sm:block">
            <Button className="h-11 px-8 rounded-2xl gradient-primary text-white text-[13px] font-black shadow-[0_10px_30px_rgba(255,51,102,0.3)] hover:shadow-[0_15px_40px_rgba(255,51,102,0.5)] group overflow-hidden border-0 transition-all hover:-translate-y-0.5 animate-shimmer bg-[linear-gradient(110deg,#ff3366,45%,#ff6699,55%,#ff3366)] bg-[length:200%_100%]">
              <span className="relative z-10 flex items-center gap-2 tracking-widest uppercase">
                Acesse Já <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
              </span>
            </Button>
          </button>
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
            className="fixed inset-0 z-50 bg-black/98 lg:hidden flex flex-col p-8 overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-12">
              <div className="flex items-center gap-3">
                <img src={novaeswebSymbol} alt="novaesweb" className="w-10 h-10 rounded-full" />
                <span className="text-2xl font-black gradient-text tracking-tighter">Explorar</span>
              </div>
              <button 
                onClick={() => setMenuOpen(false)}
                className="p-3 bg-white/5 rounded-2xl text-white"
              >
                <X className="w-8 h-8" />
              </button>
            </div>

            <div className="space-y-8">
              {/* Seção Empresa */}
              <div>
                <p className="text-[10px] text-white/30 uppercase tracking-[0.3em] font-bold mb-4">Institucional</p>
                <div className="grid grid-cols-1 gap-2">
                  {companyLinks.map(link => (
                    <button
                      key={link.id}
                      onClick={() => { setMenuOpen(false); setTimeout(() => onOpenModal(link.id), 300); }}
                      className="flex items-center justify-between p-4 bg-white/5 rounded-2xl text-white/70 hover:text-white"
                    >
                      <span className="font-bold flex items-center gap-3"><link.icon className="w-4 h-4 text-primary" /> {link.label}</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  ))}
                </div>
              </div>



              {/* Seção Navegação */}
              <div>
                <p className="text-[10px] text-white/30 uppercase tracking-[0.3em] font-bold mb-4">Navegação</p>
                <div className="flex flex-wrap gap-2">
                  {navLinks.map((link) => (
                    <button
                      key={link.href}
                      onClick={() => scrollTo(link.href, setMenuOpen)}
                      className="px-4 py-2 bg-white/5 rounded-lg text-sm font-bold text-white/60"
                    >
                      {link.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-12">
              <button 
                className="w-full" 
                onClick={() => scrollTo("#cadastro", setMenuOpen)}
              >
                <Button className="h-16 rounded-2xl w-full gradient-primary text-xl font-black uppercase tracking-widest shadow-xl shadow-primary/20">
                  Começar Agora
                </Button>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}



