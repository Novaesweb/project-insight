import { User2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { briefingStatusMeta } from "@/lib/project-briefings";
import type { ClientBriefingRow } from "../types";

interface BriefingCardProps {
  briefing: ClientBriefingRow;
  active?: boolean;
  onClick: (briefing: ClientBriefingRow) => void;
  getSentStatusLabel: (status: any) => string;
  getClientDisplayName: (client: any) => string;
  formatDateTime: (date: string) => string;
}

export function BriefingCard({
  briefing,
  active,
  onClick,
  getSentStatusLabel,
  getClientDisplayName,
  formatDateTime,
}: BriefingCardProps) {
  return (
    <button
      type="button"
      onClick={() => onClick(briefing)}
      className={cn(
        "w-full rounded-3xl border p-4 text-left transition-all",
        active
          ? "border-fuchsia-400/30 bg-[linear-gradient(135deg,rgba(123,31,162,0.22),rgba(232,51,74,0.12),rgba(194,24,91,0.14))]"
          : "border-white/10 bg-white/[0.02] hover:bg-white/[0.04]",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-sm font-black text-white">{briefing.titulo}</p>
          <div className="flex flex-wrap gap-3 text-[11px] text-white/45">
            <span className="inline-flex items-center gap-1">
              <User2 className="h-3.5 w-3.5" />
              {getClientDisplayName(briefing.clientes)}
            </span>
          </div>
        </div>
        <Badge className={cn("border", briefingStatusMeta[briefing.status].tone)}>
          {getSentStatusLabel(briefing.status)}
        </Badge>
      </div>
      <p className="mt-3 text-[11px] text-white/35">
        Atualizado em {formatDateTime(briefing.updated_at)}
      </p>
    </button>
  );
}
