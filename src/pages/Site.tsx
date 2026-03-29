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
const SiteModals = lazy(() => import("@/components/site/SiteModals"));
const CtaSection = lazy(() => import("@/components/site/CtaSection"));
const SiteFooter = lazy(() => import("@/components/site/SiteFooter"));

export default function Site() {
  const [modalOpen, setModalOpen] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-[hsl(240,15%,3%)] scroll-smooth font-sans antialiased">
      <SiteNavbar onOpenModal={setModalOpen} />
      <HeroSection onOpenDemo={() => setModalOpen("demonstracao")} />
      
      {/* Demo Button */}
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
  );
}
