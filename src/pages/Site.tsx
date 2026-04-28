import { useState, lazy, Suspense, useCallback, memo } from "react";
import SiteNavbar from "@/components/site/SiteNavbar";
import HeroSection from "@/components/site/HeroSection";
import SiteTrustStrip from "@/components/site/SiteTrustStrip";

// Lazy load all below-fold sections
const OQueFazemosSection = lazy(() => import("@/components/site/OQueFazemosSection"));
const ComoFuncionaSection = lazy(() => import("@/components/site/ComoFuncionaSection"));
const PlanosSection = lazy(() => import("@/components/site/PlanosSection"));
const ResultadosSection = lazy(() => import("@/components/site/ResultadosSection"));
const PortfolioSection = lazy(() => import("@/components/site/PortfolioSection"));
const TestimonialsSection = lazy(() => import("@/components/site/TestimonialsSection"));
const FaqSection = lazy(() => import("@/components/site/FaqSection"));
const SiteModals = lazy(() => import("@/components/site/SiteModals"));
const CtaSection = lazy(() => import("@/components/site/CtaSection"));
const SiteFooter = lazy(() => import("@/components/site/SiteFooter"));
const WhatsAppFloat = lazy(() => import("@/components/site/WhatsAppFloat"));
const MobileAppNav = lazy(() => import("@/components/site/MobileAppNav"));
import { motion, useScroll } from "framer-motion";


// Memoized background to avoid re-renders
const GlobalBackground = memo(function GlobalBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
      <div className="absolute inset-0" style={{
        background: 'linear-gradient(180deg, hsl(var(--background)), hsl(245 12% 5%))',
      }} />
      <div className="absolute inset-0 opacity-[0.012]" style={{
        backgroundImage: 'linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)',
        backgroundSize: '96px 96px',
        willChange: 'auto',
      }} />
      <div className="absolute top-[10%] -left-[8%] w-[560px] h-[560px] rounded-full blur-[180px] opacity-[0.04]"
        style={{ background: 'radial-gradient(circle, hsl(var(--primary) / 0.32), transparent 72%)', willChange: 'auto' }} />
      <div className="absolute top-[28%] -right-[10%] w-[520px] h-[520px] rounded-full blur-[170px] opacity-[0.045]"
        style={{ background: 'radial-gradient(circle, hsl(var(--accent) / 0.28), transparent 72%)' }} />
      <div className="absolute bottom-[-8%] left-[20%] w-[520px] h-[520px] rounded-full blur-[180px] opacity-[0.03]"
        style={{ background: 'radial-gradient(circle, hsl(var(--primary-novaesweb) / 0.24), transparent 74%)' }} />
    </div>
  );
});

export default function Site() {
  const [modalOpen, setModalOpen] = useState<string | null>(null);
  const openDemo = useCallback(() => setModalOpen("demonstracao"), []);
  const closeModal = useCallback(() => setModalOpen(null), []);

  const { scrollYProgress } = useScroll();

  return (
    <div className="public-site-unified min-h-screen scroll-smooth font-sans antialiased relative overflow-x-hidden" style={{ background: 'hsl(var(--background))' }}>
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 z-[100] origin-left"
        style={{ 
          scaleX: scrollYProgress,
          background: "linear-gradient(90deg, rgba(220,38,38,0.92), rgba(107,33,168,0.9), rgba(236,72,153,0.88))"
        }}
      />
      <GlobalBackground />

      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[120] focus:rounded-xl focus:px-4 focus:py-3 focus:text-sm focus:font-bold focus:text-white"
        style={{ background: "linear-gradient(135deg, rgba(220,38,38,0.96), rgba(107,33,168,0.92), rgba(236,72,153,0.9))" }}
      >
        Pular para o conteudo principal
      </a>

      <main id="main-content" className="relative z-10 pb-24 md:pb-0">
        <SiteNavbar />
        <HeroSection onOpenDemo={openDemo} />
        <SiteTrustStrip />
        
        <Suspense fallback={null}>
          <PortfolioSection />
          <OQueFazemosSection onOpenDemo={openDemo} />
          <ResultadosSection />
          <ComoFuncionaSection />
          <PlanosSection />
          <TestimonialsSection />
          <FaqSection />
        </Suspense>

        <Suspense fallback={null}>
          <CtaSection />
          <SiteFooter onOpenModal={setModalOpen} />
        </Suspense>

        <Suspense fallback={null}>
          <SiteModals modalOpen={modalOpen} onClose={closeModal} />
          <WhatsAppFloat />
          <MobileAppNav onOpenModal={setModalOpen} />
        </Suspense>
      </main>
    </div>
  );
}
