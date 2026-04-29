import { ArrowLeft, ArrowRight, MessageCircle, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type StatItem = {
  value: string;
  label: string;
  detail?: string;
};

interface PublicPageBackLinkProps {
  to?: string;
  label?: string;
  className?: string;
}

export function PublicPageBackLink({
  to = "/",
  label = "Voltar ao site",
  className,
}: PublicPageBackLinkProps) {
  return (
    <Link to={to} className={cn("public-page-backlink mb-8", className)}>
      <ArrowLeft className="w-4 h-4" />
      {label}
    </Link>
  );
}

interface PublicPageStatGridProps {
  items: StatItem[];
  className?: string;
}

export function PublicPageStatGrid({ items, className }: PublicPageStatGridProps) {
  return (
    <div className={cn("grid gap-4 md:grid-cols-3", className)}>
      {items.map((item) => (
        <div key={`${item.label}-${item.value}`} className="public-page-stat-card">
          <span className="public-page-stat-value site-gradient-text">{item.value}</span>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/42">{item.label}</p>
          {item.detail ? <p className="mt-2 text-xs leading-relaxed text-white/52">{item.detail}</p> : null}
        </div>
      ))}
    </div>
  );
}

interface PublicPageFinalCtaProps {
  eyebrow?: string;
  title: string;
  description: string;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  className?: string;
}

export function PublicPageFinalCta({
  eyebrow = "Proximo passo",
  title,
  description,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel = "Falar no WhatsApp",
  className,
}: PublicPageFinalCtaProps) {
  return (
    <section className={cn("public-page-section", className)}>
      <div className="public-page-cta-card">
        <div className="mx-auto max-w-3xl text-center">
          <span className="site-badge site-badge--primary mb-6">
            <Sparkles className="h-3.5 w-3.5" />
            {eyebrow}
          </span>

          <h2 className="text-[clamp(2rem,6vw,3.75rem)] font-black tracking-tighter text-white/94 leading-[0.92]">
            {title}
          </h2>
          <p className="mt-5 text-base sm:text-lg leading-relaxed text-white/64">{description}</p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <a href={primaryHref} className="w-full sm:w-auto">
              <Button
                className="h-12 w-full rounded-2xl border border-white/10 px-8 text-xs font-black uppercase tracking-[0.18em] text-white shadow-[0_18px_44px_rgba(236,72,153,0.2)]"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(220,38,38,0.92), rgba(107,33,168,0.9), rgba(236,72,153,0.88))",
                }}
              >
                {primaryLabel}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </a>

            {secondaryHref ? (
              <a href={secondaryHref} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                <Button className="site-soft-surface h-12 w-full rounded-2xl px-8 text-sm font-bold text-white/84">
                  <MessageCircle className="mr-2 h-4 w-4" />
                  {secondaryLabel}
                </Button>
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
