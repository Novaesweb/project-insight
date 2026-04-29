import { lazy, Suspense } from "react";

import PublicPageLayout from "@/components/site/PublicPageLayout";
import HeroSection from "@/components/site/HeroSection";
import SiteTrustStrip from "@/components/site/SiteTrustStrip";

const OQueFazemosSection = lazy(() => import("@/components/site/OQueFazemosSection"));
const ComoFuncionaSection = lazy(() => import("@/components/site/ComoFuncionaSection"));
const PlanosSection = lazy(() => import("@/components/site/PlanosSection"));
const ResultadosSection = lazy(() => import("@/components/site/ResultadosSection"));
const PortfolioSection = lazy(() => import("@/components/site/PortfolioSection"));
const TestimonialsSection = lazy(() => import("@/components/site/TestimonialsSection"));
const FaqSection = lazy(() => import("@/components/site/FaqSection"));
const CtaSection = lazy(() => import("@/components/site/CtaSection"));

export default function Site() {
  return (
    <PublicPageLayout showMobileNav mainClassName="pb-24 md:pb-0">
      {({ openModal }) => (
        <>
          <HeroSection onOpenDemo={() => openModal("demonstracao")} />
          <SiteTrustStrip />

          <Suspense fallback={null}>
            <OQueFazemosSection onOpenDemo={() => openModal("demonstracao")} />
            <ResultadosSection />
            <PortfolioSection />
            <TestimonialsSection />
            <ComoFuncionaSection />
            <PlanosSection />
            <FaqSection />
            <CtaSection />
          </Suspense>
        </>
      )}
    </PublicPageLayout>
  );
}
