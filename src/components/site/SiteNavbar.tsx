import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Menu, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { cn } from "@/lib/utils";
import { handleSiteNavigation, siteFeatureNavLinks, sitePrimaryNavLinks } from "@/lib/site-navigation";
import novaeswebSymbol from "@/assets/novaesweb-logo-glow.png";

const noopModal = () => undefined;

interface SiteNavbarProps {
  onOpenModal?: (id: string) => void;
}

export default function SiteNavbar({ onOpenModal }: SiteNavbarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("");

  const supportLinks = useMemo(
    () => [{ href: "/sobre", label: "Sobre" }, ...siteFeatureNavLinks],
    []
  );

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 18);
    handler();
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    if (location.pathname !== "/") {
      setActiveSection(location.pathname);
      return;
    }

    const updateActiveSection = () => {
      const probe = window.scrollY + window.innerHeight * 0.34;
      let nextActive = "";

      for (const link of sitePrimaryNavLinks) {
        if (!link.href.startsWith("#")) continue;
        const section = document.getElementById(link.href.replace("#", ""));
        if (section && probe >= section.offsetTop - 80) {
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

  const handleNavClick = (href: string, closeMenu?: (value: boolean) => void) => {
    handleSiteNavigation({
      href,
      locationPathname: location.pathname,
      navigate,
      onOpenModal: onOpenModal ?? noopModal,
      closeMenu,
      setActiveSection,
    });
  };

  return (
    <nav
      className={cn(
        "fixed inset-x-0 top-0 z-50 px-4 py-5 transition-all duration-500 sm:px-6 lg:px-8",
        scrolled ? "py-3" : "py-5"
      )}
    >
      <div
        className={cn(
          "mx-auto flex h-16 w-full max-w-7xl items-center justify-between rounded-[1.7rem] border px-4 backdrop-blur-2xl transition-all duration-500 sm:px-6",
          scrolled
            ? "border-white/[0.08] bg-[linear-gradient(180deg,hsl(var(--background)/0.96),hsl(var(--secondary)/0.56))] shadow-[0_20px_60px_rgba(0,0,0,0.45)]"
            : "border-white/[0.06] bg-[linear-gradient(180deg,hsl(var(--background)/0.82),hsl(var(--secondary)/0.34))] shadow-[0_14px_42px_rgba(0,0,0,0.28)]"
        )}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-75"
          style={{ background: "radial-gradient(circle at top center, rgba(236,72,153,0.08), transparent 42%)" }}
        />

        <Link
          to="/"
          onClick={(event) => {
            if (location.pathname === "/") {
              event.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }
          }}
          className="relative z-10 flex items-center gap-3"
        >
          <OptimizedImage
            src={novaeswebSymbol}
            alt="NovaesWeb"
            width={34}
            height={34}
            loading="eager"
            className="h-8 w-8 rounded-xl shadow-lg shadow-primary/20"
          />
          <div className="leading-none">
            <span className="site-gradient-text block text-lg font-black tracking-tight">NovaesWeb</span>
            <span className="block text-[9px] font-black uppercase tracking-[0.24em] text-white/40">Studio digital</span>
          </div>
        </Link>

        <div className="relative z-10 hidden items-center gap-7 lg:flex">
          {sitePrimaryNavLinks.map((link) => (
            <button
              key={link.href}
              onClick={() => handleNavClick(link.href)}
              className={cn(
                "group relative text-[11px] font-black uppercase tracking-[0.24em] transition-colors",
                activeSection === link.href ? "text-white" : "text-white/54 hover:text-white/88"
              )}
            >
              {link.label}
              <span
                className={cn(
                  "absolute -bottom-1.5 left-0 h-[2px] rounded-full transition-all duration-300",
                  activeSection === link.href ? "w-full" : "w-0 group-hover:w-full"
                )}
                style={{ background: "linear-gradient(90deg, rgba(220,38,38,0.78), rgba(107,33,168,0.72), rgba(236,72,153,0.72))" }}
              />
            </button>
          ))}
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <Button
            onClick={() => handleNavClick("#cadastro")}
            className="hidden h-11 rounded-2xl border border-white/10 px-7 text-[11px] font-black uppercase tracking-[0.24em] text-white shadow-[0_12px_32px_rgba(236,72,153,0.18)] transition-all hover:-translate-y-0.5 sm:inline-flex"
            style={{ background: "linear-gradient(135deg, rgba(220,38,38,0.92), rgba(107,33,168,0.9), rgba(236,72,153,0.88))" }}
          >
            Solicitar orcamento
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>

          <button
            onClick={() => setMenuOpen((value) => !value)}
            aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
            className="rounded-xl border border-white/10 bg-white/[0.05] p-2.5 text-white transition-colors hover:bg-white/[0.08] lg:hidden"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className="mx-auto mt-3 max-w-7xl lg:hidden"
          >
            <div className="site-surface rounded-[1.8rem] border border-white/[0.08] p-5 shadow-[0_24px_60px_rgba(0,0,0,0.5)]">
              <div className="grid gap-3">
                {sitePrimaryNavLinks.map((link) => (
                  <button
                    key={link.href}
                    onClick={() => handleNavClick(link.href, setMenuOpen)}
                    className={cn(
                      "rounded-2xl border px-4 py-4 text-left text-sm font-black uppercase tracking-[0.14em] transition-all",
                      activeSection === link.href
                        ? "border-white/12 text-white"
                        : "border-white/[0.06] text-white/65 hover:border-white/10 hover:text-white/88"
                    )}
                    style={
                      activeSection === link.href
                        ? { background: "linear-gradient(180deg, hsl(var(--primary)/0.18), hsl(var(--accent)/0.12))" }
                        : { background: "rgba(255,255,255,0.03)" }
                    }
                  >
                    {link.label}
                  </button>
                ))}
              </div>

              <div className="mt-6 rounded-[1.5rem] border border-white/[0.06] bg-white/[0.03] p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-white/40">Outras paginas</p>
                <div className="mt-3 space-y-2">
                  {supportLinks.map((link) => (
                    <button
                      key={link.href}
                      onClick={() => handleNavClick(link.href, setMenuOpen)}
                      className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-left text-sm font-semibold text-white/72 transition-colors hover:bg-white/[0.04] hover:text-white"
                    >
                      {link.label}
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  ))}
                </div>
              </div>

              <Button
                onClick={() => handleNavClick("#cadastro", setMenuOpen)}
                className="mt-5 h-12 w-full rounded-2xl border border-white/10 text-xs font-black uppercase tracking-[0.22em] text-white"
                style={{ background: "linear-gradient(135deg, rgba(220,38,38,0.92), rgba(107,33,168,0.9), rgba(236,72,153,0.88))" }}
              >
                Solicitar orcamento
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
