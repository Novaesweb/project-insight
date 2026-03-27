import { useState, lazy, Suspense } from "react";
import SiteNavbar from "@/components/site/SiteNavbar";
import HeroSection from "@/components/site/HeroSection";
import SocialProofPopup from "@/components/conversion/SocialProofPopup";

// Lazy load below-fold sections
const ExperienceSection = lazy(() => import("@/components/site/ExperienceSection"));
const TrustedBySection = lazy(() => import("@/components/site/TrustedBySection"));
const FaqSection = lazy(() => import("@/components/site/FaqSection"));
const ServicosSection = lazy(() => import("@/components/site/ServicosSection"));
const AutomacaoSection = lazy(() => import("@/components/site/AutomacaoSection"));
const SolucoesSection = lazy(() => import("@/components/site/SolucoesSection"));
const NicheCarousel = lazy(() => import("@/components/NicheCarousel"));
const ProcessoSection = lazy(() => import("@/components/site/ProcessoSection"));
const PlanosSection = lazy(() => import("@/components/site/PlanosSection"));
const FuncionalidadeExtraSection = lazy(() => import("@/components/site/FuncionalidadeExtraSection"));
const ResultadosSection = lazy(() => import("@/components/site/ResultadosSection"));
const SiteModals = lazy(() => import("@/components/site/SiteModals"));
const CadastroPerfeitoSection = lazy(() => import("@/components/site/CadastroPerfeitoSection"));
const CtaSection = lazy(() => import("@/components/site/CtaSection"));
const SiteFooter = lazy(() => import("@/components/site/SiteFooter"));

export default function Site() {
  const [modalOpen, setModalOpen] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] scroll-smooth font-sans antialiased">
      <SiteNavbar onOpenModal={setModalOpen} />
      <HeroSection onOpenDemo={() => setModalOpen("demonstracao")} />
      
      <Suspense fallback={null}>
        <ExperienceSection />
      </Suspense>
      <Suspense fallback={null}>
        <TrustedBySection />
      </Suspense>
      <Suspense fallback={null}>
        <ServicosSection onOpenModal={setModalOpen} />
      </Suspense>
      <Suspense fallback={null}>
        <AutomacaoSection />
      </Suspense>
      <Suspense fallback={null}>
        <SolucoesSection onOpenModal={setModalOpen} />
      </Suspense>
      <Suspense fallback={null}>
        <section id="segmentos" className="py-8">
          <NicheCarousel />
        </section>
      </Suspense>
      <Suspense fallback={null}>
        <ProcessoSection />
      </Suspense>
      <Suspense fallback={null}>
        <PlanosSection />
      </Suspense>
      <Suspense fallback={null}>
        <FuncionalidadeExtraSection />
      </Suspense>
      <Suspense fallback={null}>
        <ResultadosSection />
      </Suspense>
      <Suspense fallback={null}>
        <CadastroPerfeitoSection />
      </Suspense>
      <Suspense fallback={null}>
        <CtaSection />
      </Suspense>
      <Suspense fallback={null}>
        <FaqSection />
      </Suspense>
      <Suspense fallback={null}>
        <SiteModals modalOpen={modalOpen} onClose={() => setModalOpen(null)} />
      </Suspense>
      <Suspense fallback={null}>
        <SiteFooter onOpenModal={setModalOpen} />
      </Suspense>

      <SocialProofPopup />
    </div>
  );
}
