import { useState, lazy, Suspense, useCallback, memo } from "react";
import SiteNavbar from "@/components/site/SiteNavbar";
import HeroSection from "@/components/site/HeroSection";

// Lazy load all below-fold sections
const OQueFazemosSection = lazy(() => import("@/components/site/OQueFazemosSection"));
const ComoFuncionaSection = lazy(() => import("@/components/site/ComoFuncionaSection"));
const PlanosSection = lazy(() => import("@/components/site/PlanosSection"));
const ResultadosSection = lazy(() => import("@/components/site/ResultadosSection"));
const FaqSection = lazy(() => import("@/components/site/FaqSection"));
const SiteModals = lazy(() => import("@/components/site/SiteModals"));
const CtaSection = lazy(() => import("@/components/site/CtaSection"));
const SiteFooter = lazy(() => import("@/components/site/SiteFooter"));
const WhatsAppFloat = lazy(() => import("@/components/site/WhatsAppFloat"));
const MobileAppNav = lazy(() => import("@/components/site/MobileAppNav"));
const CadastroPerfeitoSection = lazy(() => import("@/components/site/CadastroPerfeitoSection"));

// Memoized background to avoid re-renders
const GlobalBackground = memo(function GlobalBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0" aria-hidden="true">
      <div className="absolute inset-0 opacity-[0.015]" style={{
        backgroundImage: 'linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)',
        backgroundSize: '80px 80px',
        willChange: 'auto',
      }} />
      <div className="absolute top-[20%] -left-[10%] w-[500px] h-[500px] rounded-full blur-[150px] opacity-[0.04]"
        style={{ background: 'radial-gradient(circle, hsl(var(--accent)), transparent 70%)', willChange: 'auto' }} />
      <div className="absolute top-[60%] -right-[10%] w-[400px] h-[400px] rounded-full blur-[150px] opacity-[0.03]"
        style={{ background: 'radial-gradient(circle, hsl(var(--primary)), transparent 70%)' }} />
    </div>
  );
});

export default function Site() {
  const [modalOpen, setModalOpen] = useState<string | null>(null);
  const openDemo = useCallback(() => setModalOpen("demonstracao"), []);
  const closeModal = useCallback(() => setModalOpen(null), []);

  return (
    <div className="min-h-screen scroll-smooth font-sans antialiased relative" style={{ background: 'hsl(var(--background))' }}>
      <GlobalBackground />

      <div className="relative z-10">
        <SiteNavbar onOpenModal={setModalOpen} />
        <HeroSection onOpenDemo={openDemo} />
        
        <Suspense fallback={null}>
          <OQueFazemosSection onOpenDemo={openDemo} />
          <ComoFuncionaSection />
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
          <MobileAppNav onOpenModal={setModalOpen} />
        </Suspense>
      </div>
    </div>
  );
}
