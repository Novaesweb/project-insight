import { useState } from "react";
import SiteNavbar from "@/components/site/SiteNavbar";
import HeroSection from "@/components/site/HeroSection";

import ClientesSection from "@/components/site/ClientesSection";
import ServicosSection from "@/components/site/ServicosSection";
import AutomacaoSection from "@/components/site/AutomacaoSection";
import SolucoesSection from "@/components/site/SolucoesSection";
import NicheCarousel from "@/components/NicheCarousel";
import PortfolioSection from "@/components/site/PortfolioSection";
import ProcessoSection from "@/components/site/ProcessoSection";
import PlanosSection from "@/components/site/PlanosSection";
import FuncionalidadeExtraSection from "@/components/site/FuncionalidadeExtraSection";
import ResultadosSection from "@/components/site/ResultadosSection";
import SiteModals from "@/components/site/SiteModals";
import CadastroPerfeitoSection from "@/components/site/CadastroPerfeitoSection";
import SiteFooter from "@/components/site/SiteFooter";
import UrgencyBanner from "@/components/conversion/UrgencyBanner";
import SocialProofPopup from "@/components/conversion/SocialProofPopup";

export default function Site() {
  const [modalOpen, setModalOpen] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] scroll-smooth ambient-glow font-sans antialiased">
      <UrgencyBanner />
      <SiteNavbar onOpenModal={setModalOpen} />
      <HeroSection onOpenDemo={() => setModalOpen("demonstracao")} />


      <ClientesSection />
      <ServicosSection />
      <AutomacaoSection />
      <SolucoesSection />
      <section id="segmentos" className="py-8">
        <NicheCarousel />
      </section>
      <PortfolioSection />
      <ProcessoSection />
      <PlanosSection />
      <FuncionalidadeExtraSection />
      <ResultadosSection />
      <CadastroPerfeitoSection />
      <SiteModals modalOpen={modalOpen} onClose={() => setModalOpen(null)} />
      <SiteFooter onOpenModal={setModalOpen} />

      <SocialProofPopup />
    </div>
  );
}
