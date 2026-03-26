import { useState } from "react";
import SiteNavbar from "@/components/site/SiteNavbar";
import HeroSection from "@/components/site/HeroSection";
import ExperienceSection from "@/components/site/ExperienceSection";
import TrustedBySection from "@/components/site/TrustedBySection";
import FaqSection from "@/components/site/FaqSection";

import ServicosSection from "@/components/site/ServicosSection";
import AutomacaoSection from "@/components/site/AutomacaoSection";
import SolucoesSection from "@/components/site/SolucoesSection";
import NicheCarousel from "@/components/NicheCarousel";

import ProcessoSection from "@/components/site/ProcessoSection";
import PlanosSection from "@/components/site/PlanosSection";
import FuncionalidadeExtraSection from "@/components/site/FuncionalidadeExtraSection";
import ResultadosSection from "@/components/site/ResultadosSection";
import SiteModals from "@/components/site/SiteModals";
import CadastroPerfeitoSection from "@/components/site/CadastroPerfeitoSection";
import SiteFooter from "@/components/site/SiteFooter";
import SocialProofPopup from "@/components/conversion/SocialProofPopup";

export default function Site() {
  const [modalOpen, setModalOpen] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] scroll-smooth ambient-glow font-sans antialiased">
      <SiteNavbar onOpenModal={setModalOpen} />
      <HeroSection onOpenDemo={() => setModalOpen("demonstracao")} />
      <ExperienceSection />
      <TrustedBySection />

      <ServicosSection onOpenModal={setModalOpen} />
      <AutomacaoSection />
      <SolucoesSection onOpenModal={setModalOpen} />
      <section id="segmentos" className="py-8">
        <NicheCarousel />
      </section>
      
      <ProcessoSection />
      <PlanosSection />
      <FuncionalidadeExtraSection />
      <ResultadosSection />
      <CadastroPerfeitoSection />
      <FaqSection />
      <SiteModals modalOpen={modalOpen} onClose={() => setModalOpen(null)} />
      <SiteFooter onOpenModal={setModalOpen} />

      <SocialProofPopup />
    </div>
  );
}



