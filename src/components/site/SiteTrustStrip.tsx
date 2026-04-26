import { ShieldCheck, Sparkles, Clock3, BriefcaseBusiness } from "lucide-react";

import { useCompanyCounter } from "@/hooks/useCompanyCounter";

const sectors = ["Clinicas", "Restaurantes", "Servicos", "Imobiliarias", "Lojas locais", "Operacoes digitais"];

export default function SiteTrustStrip() {
  const companyCount = useCompanyCounter();

  return (
    <section className="site-band px-6 pb-8 lg:pb-12">
      <div className="max-w-6xl mx-auto">
        <div className="public-page-section-card">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-center">
            <div>
              <div className="site-badge site-badge--primary mb-5">Base de confianca</div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white/90 leading-tight">
                Estrutura pensada para posicionar sua marca, organizar a operacao e abrir conversas melhores.
              </h2>
              <p className="mt-4 max-w-2xl text-sm sm:text-base leading-relaxed site-copy-muted">
                A NovaesWeb trabalha com uma combinacao de vitrine comercial, processo interno e captação para sua empresa
                sair do improviso sem parecer um sistema genérico.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                {sectors.map((sector) => (
                  <span
                    key={sector}
                    className="site-soft-surface rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-white/68"
                  >
                    {sector}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              {[
                {
                  title: `${companyCount}+ bases`,
                  copy: "projetos entregues com foco em posicionamento e operação",
                  icon: BriefcaseBusiness,
                },
                {
                  title: "Retorno em até 24h",
                  copy: "diagnóstico comercial para entender o melhor caminho",
                  icon: Clock3,
                },
                {
                  title: "Entrega com direção",
                  copy: "site, operação e automação alinhados à mesma narrativa",
                  icon: ShieldCheck,
                },
              ].map((item) => (
                <div key={item.title} className="public-page-proof-card">
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-2xl flex items-center justify-center border border-white/10 bg-white/[0.04] shrink-0">
                      <item.icon className="w-4 h-4 text-white/75" />
                    </div>
                    <div>
                      <p className="text-base font-black tracking-tight text-white/92 flex items-center gap-2">
                        {item.title}
                        <Sparkles className="w-3.5 h-3.5 text-white/35" />
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-white/58">{item.copy}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
