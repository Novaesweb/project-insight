import { Compass, Star, Target, Users } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

import { cn } from "@/lib/utils";
import { handleSiteNavigation, siteCompanyLinks, siteNavLinks } from "@/lib/site-navigation";

interface MobileQuickLinksProps {
  onOpenModal: (id: string) => void;
}

const companyLinkIcons = {
  "Sobre a NovaesWeb": Star,
  "Quem Somos": Users,
  Diferenciais: Target,
} as const;

export default function MobileQuickLinks({ onOpenModal }: MobileQuickLinksProps) {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <section className="lg:hidden relative z-10 px-6 pb-10 -mt-2">
      <div className="max-w-5xl mx-auto">
        <div className="site-surface rounded-[2rem] border border-white/10 p-5 shadow-[0_18px_50px_rgba(0,0,0,0.28)]">
          <div className="flex items-center gap-2 mb-5">
            <div
              className="w-9 h-9 rounded-2xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, rgba(220,38,38,0.92), rgba(107,33,168,0.9), rgba(236,72,153,0.88))" }}
            >
              <Compass className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.28em] text-primary">Explore a NovaesWeb</p>
              <p className="text-xs text-white/45">Acesse as informações principais sem abrir o menu.</p>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-white/30 mb-3">Institucional</p>
              <div className="flex flex-wrap gap-2.5">
                {siteCompanyLinks.map((link) => {
                  const Icon = companyLinkIcons[link.label as keyof typeof companyLinkIcons];

                  return (
                    <button
                      key={link.href ?? link.id}
                      type="button"
                      onClick={() =>
                        handleSiteNavigation({
                          href: link.href,
                          id: link.id,
                          locationPathname: location.pathname,
                          navigate,
                          onOpenModal,
                        })
                      }
                      className="site-soft-surface min-h-[48px] px-4 py-3 rounded-2xl text-white/85 text-xs font-bold inline-flex items-center gap-2 transition-colors hover:bg-white/[0.08]"
                    >
                      {Icon ? <Icon className="w-3.5 h-3.5 text-primary shrink-0" /> : null}
                      <span>{link.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-white/30 mb-3">Navegação</p>
              <div className="flex flex-wrap gap-2.5">
                {siteNavLinks.map((link) => (
                  <button
                    key={link.href}
                    type="button"
                    onClick={() =>
                      handleSiteNavigation({
                        href: link.href,
                        locationPathname: location.pathname,
                        navigate,
                        onOpenModal,
                      })
                    }
                    className={cn(
                      "site-soft-surface min-h-[48px] px-4 py-3 rounded-2xl text-xs font-bold transition-colors hover:bg-white/[0.08]",
                      "text-white/80"
                    )}
                  >
                    {link.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
