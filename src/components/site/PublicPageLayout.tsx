import { memo, useCallback, useState, type ReactNode } from "react";

import SiteFooter from "@/components/site/SiteFooter";
import SiteModals from "@/components/site/SiteModals";
import SiteNavbar from "@/components/site/SiteNavbar";
import PublicSiteCursor from "@/components/site/PublicSiteCursor";
import WhatsAppFloat from "@/components/site/WhatsAppFloat";
import { cn } from "@/lib/utils";

const PublicBackground = memo(function PublicBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(180deg, hsl(var(--background)), hsl(245 12% 5%))",
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.012]"
        style={{
          backgroundImage:
            "linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)",
          backgroundSize: "96px 96px",
        }}
      />
      <div
        className="absolute top-[10%] -left-[8%] w-[560px] h-[560px] rounded-full blur-[180px] opacity-[0.04]"
        style={{ background: "radial-gradient(circle, hsl(var(--primary) / 0.32), transparent 72%)" }}
      />
      <div
        className="absolute top-[28%] -right-[10%] w-[520px] h-[520px] rounded-full blur-[170px] opacity-[0.045]"
        style={{ background: "radial-gradient(circle, hsl(var(--accent) / 0.28), transparent 72%)" }}
      />
      <div
        className="absolute bottom-[-8%] left-[20%] w-[520px] h-[520px] rounded-full blur-[180px] opacity-[0.03]"
        style={{ background: "radial-gradient(circle, hsl(var(--primary-novaesweb) / 0.24), transparent 74%)" }}
      />
    </div>
  );
});

interface PublicPageLayoutProps {
  children: ReactNode;
  mainClassName?: string;
}

export default function PublicPageLayout({ children, mainClassName }: PublicPageLayoutProps) {
  const [modalOpen, setModalOpen] = useState<string | null>(null);
  const closeModal = useCallback(() => setModalOpen(null), []);

  return (
    <div
      className="public-site-unified min-h-screen scroll-smooth font-sans antialiased relative overflow-x-hidden"
      style={{ background: "hsl(var(--background))" }}
    >
      <PublicBackground />
      <PublicSiteCursor />

      <main className={cn("relative z-10", mainClassName)}>
        <SiteNavbar onOpenModal={setModalOpen} />
        {children}
        <SiteFooter onOpenModal={setModalOpen} />
        <SiteModals modalOpen={modalOpen} onClose={closeModal} />
        <WhatsAppFloat />
      </main>
    </div>
  );
}
