import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion, useScroll, useMotionValueEvent } from "framer-motion";
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
  const [hidden, setHidden] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    if (latest > previous && latest > 150) {
      setHidden(true);
    } else {
      setHidden(false);
    }
  });

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
    <motion.nav
      variants={{
        visible: { y: 0, opacity: 1 },
        hidden: { y: "-100%", opacity: 0 },
      }}
      animate={hidden ? "hidden" : "visible"}
      transition={{ duration: 0.4, ease: "easeInOut" }}
      className={cn(
        "fixed inset-x-0 top-0 z-50 px-3 py-4 transition-all duration-500 sm:px-6 lg:px-8",
        scrolled ? "py-2.5 sm:py-3" : "py-4 sm:py-5"
      )}
    >
      <div
        className={cn(
          "mx-auto flex h-14 w-full max-w-7xl items-center justify-between rounded-[1.6rem] border px-3 backdrop-blur-3xl transition-all duration-500 sm:h-16 sm:rounded-[2rem] sm:px-7",
          scrolled
            ? "border-white/[0.1] bg-[linear-gradient(180deg,hsl(var(--background)/0.97),hsl(var(--secondary)/0.62))] shadow-[0_24px_72px_rgba(0,0,0,0.52)]"
            : "border-white/[0.08] bg-[linear-gradient(180deg,hsl(var(--background)/0.85),hsl(var(--secondary)/0.38))] shadow-[0_16px_48px_rgba(0,0,0,0.32)]"
        )}
      >
        <div
          className="pointer-events-none absolute inset-0 rounded-[1.6rem] opacity-60 sm:rounded-[2rem]"
          style={{ background: "radial-gradient(circle at top center, rgba(236,72,153,0.12), transparent 50%)" }}
        />

        <Link
          to="/"
          onClick={(event) => {
            if (location.pathname === "/") {
              event.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }
          }}
          className="relative z-10 flex min-w-0 items-center gap-3 hover:opacity-80 transition-opacity duration-300 sm:gap-4"
        >
          <motion.div
            whileHover={{ scale: 1.1 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          >
            <OptimizedImage
              src={novaeswebSymbol}
              alt="NovaesWeb"
              width={36}
              height={36}
              loading="eager"
              className="h-9 w-9 rounded-xl shadow-lg shadow-primary/30 sm:h-9 sm:w-9"
            />
          </motion.div>
          <div className="min-w-0 leading-none">
            <span className="site-gradient-text block truncate text-base font-black tracking-tight sm:text-lg">NovaesWeb</span>
            <span className="block truncate text-[8px] font-black uppercase tracking-[0.24em] text-white/45 sm:text-[9px] sm:tracking-[0.28em]">Studio Premium</span>
          </div>
        </Link>

        <div className="relative z-10 hidden items-center gap-8 lg:flex">
          {sitePrimaryNavLinks.map((link, index) => (
            <motion.button
              key={link.href}
              onClick={() => handleNavClick(link.href)}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.4 }}
              className={cn(
                "group relative text-[11px] font-black uppercase tracking-[0.26em] transition-colors duration-300 py-2",
                activeSection === link.href ? "text-white" : "text-white/52 hover:text-white/92"
              )}
            >
              {link.label}
              <span
                className={cn(
                  "absolute -bottom-2 left-0 h-0.5 rounded-full transition-all duration-400 origin-left",
                  activeSection === link.href ? "w-full scale-x-100" : "w-0 scale-x-0 group-hover:w-full group-hover:scale-x-100"
                )}
                style={{ background: "linear-gradient(90deg, rgba(220,38,38,0.88), rgba(107,33,168,0.8), rgba(236,72,153,0.82))" }}
              />
              <span
                className={cn(
                  "absolute inset-x-0 -bottom-2.5 h-6 rounded-lg transition-all duration-300 -z-10",
                  activeSection === link.href ? "bg-white/[0.04] scale-y-100" : "scale-y-0 group-hover:bg-white/[0.03]"
                )}
              />
            </motion.button>
          ))}
        </div>

        <div className="relative z-10 flex items-center gap-2 sm:gap-3">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative group hidden sm:block"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-red-600 via-purple-600 to-pink-600 rounded-2xl blur-sm opacity-30 group-hover:opacity-50 transition-opacity duration-300" />
            <Button
              onClick={() => handleNavClick("#cadastro")}
              className="relative h-11 rounded-2xl border border-white/10 px-7 text-[11px] font-black uppercase tracking-[0.24em] text-white shadow-[0_14px_36px_rgba(236,72,153,0.22)] transition-all hover:-translate-y-1 sm:inline-flex"
              style={{ background: "linear-gradient(135deg, rgba(220,38,38,0.94), rgba(107,33,168,0.92), rgba(236,72,153,0.9))" }}
            >
              Solicitar orcamento
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>

          <motion.button
            onClick={() => setMenuOpen((value) => !value)}
            aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            className="rounded-2xl border border-white/10 bg-white/[0.06] p-2.5 text-white transition-all hover:bg-white/[0.1] hover:border-white/20 lg:hidden"
          >
            <motion.div
              animate={{ rotate: menuOpen ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </motion.div>
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.32, ease: "easeOut" }}
            className="mx-auto mt-4 max-w-7xl lg:hidden"
          >
            <div className="site-surface rounded-[1.8rem] border border-white/[0.1] p-5 sm:rounded-[2rem] sm:p-6 shadow-[0_28px_72px_rgba(0,0,0,0.58)] backdrop-blur-2xl"
              style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(236,72,153,0.03))" }}
            >
              <div className="grid gap-3">
                {sitePrimaryNavLinks.map((link, index) => (
                  <motion.button
                    key={link.href}
                    onClick={() => handleNavClick(link.href, setMenuOpen)}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.06, duration: 0.3 }}
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    className={cn(
                      "rounded-2xl border px-4 py-4 text-left text-sm font-black uppercase tracking-[0.16em] transition-all",
                      activeSection === link.href
                        ? "border-white/15 text-white shadow-[0_0_24px_rgba(236,72,153,0.15)]"
                        : "border-white/[0.08] text-white/66 hover:border-white/12 hover:text-white/92"
                    )}
                    style={
                      activeSection === link.href
                        ? { background: "linear-gradient(180deg, hsl(var(--primary)/0.2), hsl(var(--accent)/0.14))" }
                        : { background: "rgba(255,255,255,0.04)" }
                    }
                  >
                    {link.label}
                  </motion.button>
                ))}
              </div>

              <motion.div 
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.18, duration: 0.3 }}
                className="mt-6 rounded-[1.6rem] border border-white/[0.08] bg-white/[0.04] p-5"
              >
                <p className="text-[10px] font-black uppercase tracking-[0.28em] text-white/45">Mais</p>
                <div className="mt-4 space-y-2">
                  {supportLinks.map((link, index) => (
                    <motion.button
                      key={link.href}
                      onClick={() => handleNavClick(link.href, setMenuOpen)}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.18 + index * 0.04, duration: 0.25 }}
                      whileHover={{ x: 2 }}
                      className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-sm font-semibold text-white/68 transition-colors hover:bg-white/[0.06] hover:text-white/92"
                    >
                      {link.label}
                      <motion.div
                        whileHover={{ x: 3 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ArrowRight className="h-4 w-4" />
                      </motion.div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.32, duration: 0.3 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="mt-7 relative group"
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-red-600 via-purple-600 to-pink-600 rounded-2xl blur opacity-40 group-hover:opacity-60 transition-opacity duration-300" />
                <Button
                  onClick={() => handleNavClick("#cadastro", setMenuOpen)}
                  className="relative w-full h-12 rounded-2xl border border-white/10 px-4 text-[11px] font-black uppercase tracking-[0.2em] text-white sm:text-xs sm:tracking-[0.24em] shadow-[0_16px_40px_rgba(236,72,153,0.2)]"
                  style={{ background: "linear-gradient(135deg, rgba(220,38,38,0.94), rgba(107,33,168,0.92), rgba(236,72,153,0.9))" }}
                >
                  Solicitar orcamento
                </Button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
