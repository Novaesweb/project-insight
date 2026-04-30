import { type ReactNode, useCallback, useState } from "react";

import { motion, useScroll } from "framer-motion";

import PublicAmbientBackground from "@/components/site/PublicAmbientBackground";
import MobileAppNav from "@/components/site/MobileAppNav";
import SiteFooter from "@/components/site/SiteFooter";
import SiteModals from "@/components/site/SiteModals";
import SiteNavbar from "@/components/site/SiteNavbar";
import WhatsAppFloat from "@/components/site/WhatsAppFloat";
import { cn } from "@/lib/utils";

interface PublicPageLayoutRenderControls {
  openModal: (id: string) => void;
}

interface PublicPageLayoutProps {
  children: ReactNode | ((controls: PublicPageLayoutRenderControls) => ReactNode);
  mainClassName?: string;
  showFooter?: boolean;
  showNavbar?: boolean;
  showMobileNav?: boolean;
}

export default function PublicPageLayout({
  children,
  mainClassName,
  showFooter = true,
  showNavbar = true,
  showMobileNav = false,
}: PublicPageLayoutProps) {
  const [modalOpen, setModalOpen] = useState<string | null>(null);
  const closeModal = useCallback(() => setModalOpen(null), []);
  const openModal = useCallback((id: string) => setModalOpen(id), []);
  const { scrollYProgress } = useScroll();

  const content =
    typeof children === "function"
      ? (children as (controls: PublicPageLayoutRenderControls) => ReactNode)({ openModal })
      : children;

  return (
    <div
      className="public-site-unified min-h-screen scroll-smooth font-sans antialiased relative overflow-x-hidden"
      style={{ background: "hsl(var(--background))" }}
    >
      <motion.div
        className="fixed left-0 right-0 top-0 z-[100] h-1.5 origin-left shadow-[0_4px_16px_rgba(236,72,153,0.3)]"
        style={{
          scaleX: scrollYProgress,
          background: "linear-gradient(90deg, rgba(220,38,38,0.94), rgba(107,33,168,0.92), rgba(236,72,153,0.9))",
        }}
      />
      <PublicAmbientBackground />

      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[120] focus:rounded-xl focus:px-4 focus:py-3 focus:text-sm focus:font-bold focus:text-white"
        style={{ background: "linear-gradient(135deg, rgba(220,38,38,0.96), rgba(107,33,168,0.92), rgba(236,72,153,0.9))" }}
      >
        Pular para o conteudo principal
      </a>

      <main
        id="main-content"
        className={cn("relative z-10", showMobileNav ? "pb-24 md:pb-0" : "", mainClassName)}
      >
        {showNavbar ? <SiteNavbar onOpenModal={openModal} /> : null}
        {content}
        {showFooter ? <SiteFooter onOpenModal={openModal} /> : null}
        <SiteModals modalOpen={modalOpen} onClose={closeModal} />
        <WhatsAppFloat />
        {showMobileNav ? <MobileAppNav /> : null}
      </main>
    </div>
  );
}
