import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Menu, X, ChevronDown, ChevronRight, Star, Users, Zap, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { handleSiteNavigation, siteCompanyLinks, siteNavLinks } from "@/lib/site-navigation";
import novaeswebSymbol from "@/assets/novaesweb-logo-glow.png";
import { scrollTo } from "@/lib/utils";
import { OptimizedImage } from "@/components/ui/OptimizedImage";

interface SiteNavbarProps {
  onOpenModal: (id: string) => void;
}

const companyLinks = siteCompanyLinks.map((link) => ({
  ...link,
  icon:
    link.label === "Sobre a NovaesWeb"
      ? Star
      : link.label === "Quem Somos"
        ? Users
        : Target,
}));

export default function SiteNavbar({ onOpenModal }: SiteNavbarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    const sectionLinks = siteNavLinks.filter((link) => link.href.startsWith("#"));
    const routeLinks = siteNavLinks.filter((link) => link.href.startsWith("/"));

    if (location.pathname !== "/") {
      const activeRoute = routeLinks.find((link) => link.href === location.pathname);
      setActiveSection(activeRoute?.href ?? "");
      return;
    }

    const updateActiveSection = () => {
      const probe = window.scrollY + window.innerHeight * 0.42;
      const firstSection = document.getElementById(sectionLinks[0]?.href.replace("#", "") || "");

      if (firstSection && probe < firstSection.offsetTop - 180) {
        setActiveSection("");
        return;
      }

      let nextActive = sectionLinks[0]?.href || "";

      for (const link of sectionLinks) {
        const section = document.getElementById(link.href.replace("#", ""));
        if (section && probe >= section.offsetTop) {
          nextActive = link.href;
        }
      }

      setActiveSection(nextActive);
    };

    updateActiveSection();
    window.addEventListener("scroll", updateActiveSection, { passive: true });
    window.addEventListener("resize", updateActiveSection);

    return () => {
      window.removeEventListener("scroll", updateActiveSection);
      window.removeEventListener("resize", updateActiveSection);
    };
  }, [location.pathname]);

  const handleNavClick = (href: string, closeMenu?: (v: boolean) => void) => {
    handleSiteNavigation({
      href,
      locationPathname: location.pathname,
      navigate,
      onOpenModal,
      closeMenu,
      setActiveSection,
    });
  };

  const handleBudgetClick = (closeMenu?: (v: boolean) => void) => {
    scrollTo("#cadastro", closeMenu);
  };

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-700 ease-in-out px-4 py-6 sm:px-8",
      scrolled && "py-4"
    )} onMouseLeave={() => setActiveDropdown(null)}>
      <div className={cn(
        "max-w-7xl mx-auto h-16 flex items-center justify-between transition-all duration-700 rounded-[24px] px-8 border relative overflow-hidden backdrop-blur-2xl",
        scrolled
          ? "border-white/[0.08] shadow-[0_20px_60px_rgba(0,0,0,0.45)] bg-[linear-gradient(180deg,hsl(var(--background)/0.96),hsl(var(--secondary)/0.48))] translate-y-0"
          : "border-white/[0.06] bg-[linear-gradient(180deg,hsl(var(--background)/0.76),hsl(var(--secondary)/0.34))] shadow-[0_14px_40px_rgba(0,0,0,0.28)]"
      )}>
        <div
          className="absolute inset-0 pointer-events-none opacity-70"
          style={{ background: "radial-gradient(circle at top, rgba(236, 72, 153, 0.08), transparent 52%)" }}
        />
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
            <OptimizedImage 
              src={novaeswebSymbol} 
              alt="novaesweb" 
              width={32}
              height={32}
              loading="eager"
              className="w-8 h-8 rounded-lg shadow-lg shadow-primary/15 group-hover:shadow-accent/25 transition-shadow" 
            />
          </motion.div>
            <span className="site-gradient-text text-lg font-black tracking-tight">NovaesWeb</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden lg:flex items-center gap-6 ml-8">
          {/* Dropdown Empresa */}
          <div className="relative" onMouseEnter={() => setActiveDropdown("empresa")}>
            <button className="flex items-center gap-1.5 text-[13px] text-foreground/60 hover:text-foreground/90 transition-all font-bold tracking-[0.1em] uppercase group">
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
                  <div className="site-surface p-4 rounded-3xl shadow-2xl overflow-hidden">
                    {companyLinks.map(link => (
                      <button
                        key={link.href ?? link.id}
                        onClick={() => {
                          handleSiteNavigation({
                            href: link.href,
                            id: link.id,
                            locationPathname: location.pathname,
                            navigate,
                            onOpenModal,
                            setActiveSection,
                          });
                          setActiveDropdown(null);
                        }}
                        className="flex items-center gap-3 w-full p-3 hover:bg-white/[0.04] rounded-2xl transition-all text-left group/item"
                      >
                        <link.icon className="w-5 h-5 text-primary/80" />
                        <span className="text-xs font-bold text-foreground/70 group-hover/item:text-foreground">{link.label}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {siteNavLinks.map((link) => (
            <button
              key={link.href}
              onClick={() => handleNavClick(link.href)}
              className={cn(
                "text-[13px] transition-all font-bold tracking-[0.1em] uppercase group relative",
                activeSection === link.href ? "text-foreground" : "text-foreground/55 hover:text-foreground/90"
              )}
            >
              <span className="relative z-10">{link.label}</span>
              <span className={cn(
                "absolute -bottom-1.5 left-0 h-[2px] rounded-full transition-all duration-500 ease-out",
                activeSection === link.href ? "w-full" : "w-0 group-hover:w-full"
              )}
                style={{ background: "linear-gradient(90deg, rgba(220,38,38,0.75), rgba(236,72,153,0.75))" }} />
            </button>
          ))}


        </div>

        {/* Right actions */}
        <div className="flex items-center gap-4">
          <Button
            onClick={() => handleBudgetClick()}
            className="hidden sm:inline-flex h-11 px-8 rounded-2xl text-white text-[13px] font-black shadow-[0_12px_32px_rgba(220,38,38,0.18)] hover:shadow-[0_16px_38px_rgba(236,72,153,0.24)] group overflow-hidden border border-white/10 transition-all hover:-translate-y-0.5"
            style={{ background: "linear-gradient(135deg, rgba(220,38,38,0.92), rgba(107,33,168,0.9), rgba(236,72,153,0.88))" }}
          >
            <span className="relative z-10 flex items-center gap-2 tracking-widest uppercase">
              Solicitar orçamento <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
            </span>
          </Button>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
            className="p-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.09] transition-colors text-white lg:hidden"
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
            className="fixed inset-0 z-[120] lg:hidden overflow-y-auto bg-[hsl(var(--background))]"
          >
            <div className="min-h-full bg-[hsl(var(--background)/0.98)] px-6 py-8 backdrop-blur-2xl">
              <div className="site-surface mb-12 rounded-[28px] px-5 py-4 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3 min-w-0">
                    <OptimizedImage 
                      src={novaeswebSymbol} 
                      alt="novaesweb" 
                      width={40}
                      height={40}
                      className="w-10 h-10 rounded-full shrink-0" 
                    />
                    <span className="text-2xl font-black site-gradient-text tracking-tighter truncate">Explorar</span>
                  </div>
                  <button 
                    onClick={() => setMenuOpen(false)}
                    aria-label="Fechar menu"
                    className="p-3 rounded-2xl text-white bg-white/[0.08] hover:bg-white/[0.12] transition-colors shrink-0"
                  >
                    <X className="w-8 h-8" />
                  </button>
                </div>
              </div>

              <div className="space-y-8">
                <div>
                  <p className="text-[10px] text-foreground/45 uppercase tracking-[0.3em] font-bold mb-4">Institucional</p>
                  <div className="grid grid-cols-1 gap-3">
                    {companyLinks.map(link => (
                      <button
                        key={link.href ?? link.id}
                        onClick={() => {
                          setMenuOpen(false);
                          setTimeout(() => {
                            handleSiteNavigation({
                              href: link.href,
                              id: link.id,
                              locationPathname: location.pathname,
                              navigate,
                              onOpenModal,
                              setActiveSection,
                            });
                          }, 300);
                        }}
                        className="site-soft-surface flex items-center justify-between p-4 rounded-2xl text-white hover:bg-[hsl(var(--muted)/0.45)] transition-colors"
                      >
                        <span className="font-bold flex items-center gap-3"><link.icon className="w-4 h-4 text-primary" /> {link.label}</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-[10px] text-foreground/45 uppercase tracking-[0.3em] font-bold mb-4">Navegação</p>
                  <div className="grid grid-cols-2 gap-3">
                    {siteNavLinks.map((link) => (
                      <button
                        key={link.href}
                        onClick={() => handleNavClick(link.href, setMenuOpen)}
                        className={cn(
                          "site-soft-surface px-4 py-3 rounded-xl text-sm font-bold text-white hover:bg-[hsl(var(--muted)/0.45)] transition-colors",
                          activeSection === link.href && "border-primary/30 bg-[linear-gradient(180deg,hsl(var(--primary)/0.18),hsl(var(--secondary)/0.42))] text-primary-foreground"
                        )}
                      >
                        {link.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-12">
                <Button
                  className="h-16 rounded-2xl w-full text-xl font-black uppercase tracking-widest shadow-xl shadow-primary/20 border border-white/10"
                  onClick={() => handleBudgetClick(setMenuOpen)}
                  style={{ background: "linear-gradient(135deg, rgba(220,38,38,0.92), rgba(107,33,168,0.9), rgba(236,72,153,0.88))" }}
                >
                  Solicitar orçamento
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}



