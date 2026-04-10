import { ShieldCheck } from "lucide-react";

import type { ContractSignatureSummary } from "@/lib/contract-builder";
import { cn } from "@/lib/utils";

type ContractSignaturePanelVariant = "dark" | "light";

interface ContractSignaturePanelProps {
  summary: ContractSignatureSummary | null;
  variant?: ContractSignaturePanelVariant;
  className?: string;
}

interface ContractSignedStatusBadgeProps {
  signedName?: string | null;
  signedAt?: string | null;
  className?: string;
  variant?: ContractSignaturePanelVariant;
}

const panelVariantClasses: Record<ContractSignaturePanelVariant, string> = {
  dark:
    "border-white/10 bg-[linear-gradient(135deg,rgba(123,31,162,0.2),rgba(232,51,74,0.14),rgba(194,24,91,0.18))] text-white shadow-[0_24px_54px_rgba(20,8,31,0.36)]",
  light:
    "border-rose-200/70 bg-[linear-gradient(135deg,rgba(123,31,162,0.08),rgba(232,51,74,0.09),rgba(194,24,91,0.12))] text-slate-900 shadow-[0_20px_42px_rgba(123,31,162,0.12)]",
};

const kickerVariantClasses: Record<ContractSignaturePanelVariant, string> = {
  dark: "text-white/70",
  light: "text-[#9f2d84]",
};

const metaVariantClasses: Record<ContractSignaturePanelVariant, string> = {
  dark: "text-white/55",
  light: "text-slate-500",
};

const cardVariantClasses: Record<ContractSignaturePanelVariant, string> = {
  dark:
    "border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.04))] text-white backdrop-blur-xl",
  light: "border-rose-100 bg-white/90 text-slate-900 backdrop-blur",
};

const captionVariantClasses: Record<ContractSignaturePanelVariant, string> = {
  dark: "text-white/55",
  light: "text-slate-500",
};

const noteVariantClasses: Record<ContractSignaturePanelVariant, string> = {
  dark: "text-white/48",
  light: "text-slate-500",
};

const badgeVariantClasses: Record<ContractSignaturePanelVariant, string> = {
  dark:
    "border-emerald-300/20 bg-emerald-300/10 text-emerald-100 shadow-[0_12px_28px_rgba(16,185,129,0.12)]",
  light: "border-emerald-300/30 bg-emerald-50 text-emerald-900 shadow-[0_10px_24px_rgba(16,185,129,0.08)]",
};

function formatSignedAtLabel(signedAt?: string | null) {
  if (!signedAt) return null;
  return new Date(signedAt).toLocaleString("pt-BR");
}

export function ContractSignaturePanel({
  summary,
  variant = "dark",
  className,
}: ContractSignaturePanelProps) {
  if (!summary) return null;

  return (
    <section
      className={cn(
        "rounded-[30px] border px-6 py-7 text-center md:px-8 md:py-9",
        panelVariantClasses[variant],
        className,
      )}
    >
      <div className="space-y-2">
        <p className={cn("text-[10px] font-semibold uppercase tracking-[0.28em]", kickerVariantClasses[variant])}>
          Aceite e assinatura
        </p>
        <p className={cn("text-sm", metaVariantClasses[variant])}>{summary.locationAndDate}</p>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {[
          { name: summary.contractanteName, caption: summary.contractanteCaption },
          { name: summary.contratadaName, caption: summary.contratadaCaption },
        ].map((signer) => (
          <div
            key={`${signer.name}-${signer.caption}`}
            className={cn("rounded-[24px] border px-5 py-6 text-center", cardVariantClasses[variant])}
          >
            <div className="mx-auto h-px w-full bg-[linear-gradient(90deg,rgba(123,31,162,0.42),rgba(232,51,74,0.78),rgba(194,24,91,0.52))]" />
            <p className="mt-5 text-lg font-semibold">{signer.name}</p>
            <p className={cn("mt-2 text-xs leading-relaxed", captionVariantClasses[variant])}>{signer.caption}</p>
          </div>
        ))}
      </div>

      <p className={cn("mx-auto mt-5 max-w-2xl text-xs leading-relaxed", noteVariantClasses[variant])}>
        {summary.note}
      </p>
    </section>
  );
}

export function ContractSignedStatusBadge({
  signedName,
  signedAt,
  className,
  variant = "dark",
}: ContractSignedStatusBadgeProps) {
  if (!signedName?.trim()) return null;

  const signedAtLabel = formatSignedAtLabel(signedAt);

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium",
        badgeVariantClasses[variant],
        className,
      )}
    >
      <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
      <span className="truncate">Assinado por {signedName.trim()}</span>
      {signedAtLabel ? <span className="hidden sm:inline opacity-80">• {signedAtLabel}</span> : null}
    </div>
  );
}
