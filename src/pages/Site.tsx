import { useState, lazy, Suspense, useCallback, memo } from "react";
import SiteNavbar from "@/components/site/SiteNavbar";
import HeroSection from "@/components/site/HeroSection";

// Lazy load all below-fold sections
const OQueFazemosSection = lazy(() => import("@/components/site/OQueFazemosSection"));
const ComoFuncionaSection = lazy(() => import("@/components/site/ComoFuncionaSection"));
const AutomacaoSection = lazy(() => import("@/components/site/AutomacaoSection"));
const PlanosSection = lazy(() => import("@/components/site/PlanosSection"));
const ResultadosSection = lazy(() => import("@/components/site/ResultadosSection"));
const FaqSection = lazy(() => import("@/components/site/FaqSection"));
const SiteModals = lazy(() => import("@/components/site/SiteModals"));
const CtaSection = lazy(() => import("@/components/site/CtaSection"));
const SiteFooter = lazy(() => import("@/components/site/SiteFooter"));
const WhatsAppFloat = lazy(() => import("@/components/site/WhatsAppFloat"));
const MobileAppNav = lazy(() => import("@/components/site/MobileAppNav"));
const CadastroPerfeitoSection = lazy(() => import("@/components/site/CadastroPerfeitoSection"));
const FloatingMascot = lazy(() => import("@/components/site/FloatingMascot"));

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

  return (
    <div className="public-site-unified min-h-screen scroll-smooth font-sans antialiased relative" style={{ background: 'hsl(var(--background))' }}>
      <GlobalBackground />

      <main className="relative z-10">
        <SiteNavbar onOpenModal={setModalOpen} />
        <HeroSection onOpenDemo={openDemo} />
        
        <Suspense fallback={null}>
          <OQueFazemosSection onOpenDemo={openDemo} />
          <ComoFuncionaSection />
          <AutomacaoSection />
          <PlanosSection />
        </Suspense>

        <Suspense fallback={null}>
          <ResultadosSection />
          <CadastroPerfeitoSection />
          <FaqSection />
        </Suspense>

        <Suspense fallback={null}>
          <CtaSection />
          <SiteFooter onOpenModal={setModalOpen} />
        </Suspense>

        <Suspense fallback={null}>
          <SiteModals modalOpen={modalOpen} onClose={closeModal} />
          <WhatsAppFloat />
          <FloatingMascot />
          <MobileAppNav onOpenModal={setModalOpen} />
        </Suspense>
      </main>
    </div>
  );
}
