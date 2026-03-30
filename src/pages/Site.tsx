import { useState, lazy, Suspense } from "react";
import SiteNavbar from "@/components/site/SiteNavbar";
import HeroSection from "@/components/site/HeroSection";
import DemoButtonSection from "@/components/site/DemoButtonSection";
import WhatsAppFloat from "@/components/site/WhatsAppFloat";
import MobileAppNav from "@/components/site/MobileAppNav";
import FloatingSocialProof from "@/components/site/FloatingSocialProof";

// Lazy load below-fold sections
const TrustedBySection = lazy(() => import("@/components/site/TrustedBySection"));
const OQueFazemosSection = lazy(() => import("@/components/site/OQueFazemosSection"));
const ComoFuncionaSection = lazy(() => import("@/components/site/ComoFuncionaSection"));
const AutomacaoSection = lazy(() => import("@/components/site/AutomacaoSection"));
const PlanosSection = lazy(() => import("@/components/site/PlanosSection"));
const CadastroPerfeitoSection = lazy(() => import("@/components/site/CadastroPerfeitoSection"));
const ResultadosSection = lazy(() => import("@/components/site/ResultadosSection"));
const FaqSection = lazy(() => import("@/components/site/FaqSection"));
const SiteModals = lazy(() => import("@/components/site/SiteModals"));
const CtaSection = lazy(() => import("@/components/site/CtaSection"));
const SiteFooter = lazy(() => import("@/components/site/SiteFooter"));

export default function Site() {
  const [modalOpen, setModalOpen] = useState<string | null>(null);

  return (
    <div className="min-h-screen scroll-smooth font-sans antialiased relative" style={{ background: 'hsl(var(--background))' }}>
      {/* Unified global background effects */}
      <div className="fixed inset-0 pointer-events-none z-0" aria-hidden="true">
        {/* Subtle grid */}
        <div className="absolute inset-0 opacity-[0.015]" style={{
          backgroundImage: 'linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)',
          backgroundSize: '80px 80px'
        }} />
        {/* Ambient orbs that stay consistent */}
        <div className="absolute top-[20%] -left-[10%] w-[600px] h-[600px] rounded-full blur-[200px] opacity-[0.04]"
          style={{ background: 'radial-gradient(circle, hsl(var(--accent)), transparent 70%)' }} />
        <div className="absolute top-[60%] -right-[10%] w-[500px] h-[500px] rounded-full blur-[200px] opacity-[0.03]"
          style={{ background: 'radial-gradient(circle, hsl(var(--primary)), transparent 70%)' }} />
        <div className="absolute bottom-[10%] left-[30%] w-[400px] h-[400px] rounded-full blur-[180px] opacity-[0.025]"
          style={{ background: 'radial-gradient(circle, hsl(var(--primary-novaesweb)), transparent 70%)' }} />
      </div>

      <div className="relative z-10">
        <SiteNavbar onOpenModal={setModalOpen} />
        <HeroSection onOpenDemo={() => setModalOpen("demonstracao")} />
        
        <DemoButtonSection onOpenDemo={() => setModalOpen("demonstracao")} />
        
        <Suspense fallback={null}>
          <TrustedBySection />
        </Suspense>
        <Suspense fallback={null}>
          <OQueFazemosSection onOpenDemo={() => setModalOpen("demonstracao")} />
        </Suspense>
        <Suspense fallback={null}>
          <ComoFuncionaSection />
        </Suspense>
        <Suspense fallback={null}>
          <AutomacaoSection />
        </Suspense>
        <Suspense fallback={null}>
          <PlanosSection />
        </Suspense>
        <Suspense fallback={null}>
          <CadastroPerfeitoSection />
        </Suspense>
        <Suspense fallback={null}>
          <ResultadosSection />
        </Suspense>
        <Suspense fallback={null}>
          <FaqSection />
        </Suspense>
        <Suspense fallback={null}>
          <CtaSection />
        </Suspense>
        <Suspense fallback={null}>
          <SiteModals modalOpen={modalOpen} onClose={() => setModalOpen(null)} />
        </Suspense>
        <Suspense fallback={null}>
          <SiteFooter onOpenModal={setModalOpen} />
        </Suspense>

        <WhatsAppFloat />
        <MobileAppNav onOpenModal={setModalOpen} />
        <FloatingSocialProof />
      </div>
    </div>
  );
}
