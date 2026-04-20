import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

type HeaderAction = {
  label: string;
  to?: string;
  onClick?: () => void;
  variant?: "default" | "outline" | "ghost";
  className?: string;
};

export function BriefingsPageHeader({
  title,
  description,
  eyebrow = "Estratégia antes do projeto",
  breadcrumbs = [],
  actions = [],
}: {
  title: string;
  description: string;
  eyebrow?: string;
  breadcrumbs?: Array<{ label: string; to?: string }>;
  actions?: HeaderAction[];
}) {
  return (
    <div className="space-y-4">
      {breadcrumbs.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.18em] text-white/35">
          {breadcrumbs.map((item, index) => (
            <span key={`${item.label}-${index}`} className="inline-flex items-center gap-2">
              {item.to ? (
                <Link to={item.to} className="transition-colors hover:text-white/70">
                  {item.label}
                </Link>
              ) : (
                <span className="text-white/65">{item.label}</span>
              )}
              {index < breadcrumbs.length - 1 && <span>/</span>}
            </span>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-fuchsia-400/20 bg-fuchsia-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.24em] text-fuchsia-200">
            <Sparkles className="h-3.5 w-3.5" />
            {eyebrow}
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white">{title}</h1>
            <p className="max-w-3xl text-sm text-white/55">{description}</p>
          </div>
        </div>

        {actions.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {actions.map((action) => {
              const variant = action.variant || "outline";
              const className =
                action.className ||
                (variant === "default"
                  ? "border-0 text-white"
                  : "border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.06]");

              if (action.to) {
                return (
                  <Button key={`${action.label}-${action.to}`} asChild variant={variant} className={className}>
                    <Link to={action.to}>{action.label}</Link>
                  </Button>
                );
              }

              return (
                <Button
                  key={action.label}
                  type="button"
                  variant={variant}
                  className={className}
                  onClick={action.onClick}
                >
                  {action.label}
                </Button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
