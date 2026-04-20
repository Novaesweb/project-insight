import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { BriefingsMetricsGrid } from "./BriefingsMetricsGrid";

export function BriefingReadinessCard({
  title,
  clientName,
  readinessScore,
  missingCount,
  answeredFieldCount,
  pendingFieldCount,
  totalQuestions,
  statusLabel,
}: {
  title: string;
  clientName?: string;
  readinessScore: number;
  missingCount: number;
  answeredFieldCount: number;
  pendingFieldCount: number;
  totalQuestions: number;
  statusLabel: string;
}) {
  const readinessLabel = readinessScore >= 80 ? "Pronto" : readinessScore >= 50 ? "Médio" : "Baixo";
  const readinessTone =
    readinessScore >= 80
      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
      : readinessScore >= 50
        ? "border-amber-500/30 bg-amber-500/10 text-amber-200"
        : "border-rose-500/30 bg-rose-500/10 text-rose-200";

  return (
    <Card className="overflow-hidden border-white/10 bg-[linear-gradient(135deg,rgba(138,43,226,0.18),rgba(255,0,0,0.08),rgba(255,0,127,0.12))]">
      <CardContent className="space-y-5 p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <p className="text-[11px] font-black uppercase tracking-[0.22em] text-white/45">Radar de prontidão</p>
            <h2 className="text-xl font-black text-white">{title || "Briefing sem título"}</h2>
            <p className="text-sm text-white/55">Cliente: {clientName || "nenhum selecionado"}</p>
          </div>
          <Badge className={cn("border", readinessTone)}>{readinessLabel}</Badge>
        </div>

        <div className="space-y-2">
          <div className="h-3 overflow-hidden rounded-full bg-black/30">
            <div
              className="h-full rounded-full bg-[linear-gradient(90deg,#8A2BE2,#FF0000,#FF007F)] transition-all"
              style={{ width: `${readinessScore}%` }}
            />
          </div>
          <div className="flex flex-wrap justify-between gap-3 text-xs text-white/55">
            <span>{readinessScore}% completo</span>
            <span>{missingCount} pendências críticas</span>
          </div>
        </div>

        <BriefingsMetricsGrid
          items={[
            { label: "Perguntas", value: totalQuestions },
            { label: "Respondidas", value: answeredFieldCount },
            { label: "Pendentes", value: pendingFieldCount },
            { label: "Status", value: statusLabel },
          ]}
        />
      </CardContent>
    </Card>
  );
}
