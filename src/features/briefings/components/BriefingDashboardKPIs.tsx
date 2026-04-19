import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface BriefingDashboardKPIsProps {
  title: string;
  clientName: string;
  readinessLabel: string;
  readinessTone: string;
  readinessScore: number;
  missingCount: number;
  fieldCount: number;
  answeredCount: number;
  pendingCount: number;
  statusLabel: string;
}

export function BriefingDashboardKPIs({
  title,
  clientName,
  readinessLabel,
  readinessTone,
  readinessScore,
  missingCount,
  fieldCount,
  answeredCount,
  pendingCount,
  statusLabel,
}: BriefingDashboardKPIsProps) {
  return (
    <Card className="overflow-hidden border-white/10 bg-[linear-gradient(135deg,rgba(138,43,226,0.18),rgba(255,0,0,0.08),rgba(255,0,127,0.12))]">
      <CardContent className="space-y-5 p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <p className="text-[11px] font-black uppercase tracking-[0.22em] text-white/45">Radar de prontidão</p>
            <h2 className="text-xl font-black text-white">{title || "Briefing sem título"}</h2>
            <p className="text-sm text-white/55">Cliente: {clientName}</p>
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

        <div className="grid gap-3 md:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">Perguntas enviadas</p>
            <p className="mt-2 text-3xl font-black text-white">{fieldCount}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">Respondidas</p>
            <p className="mt-2 text-3xl font-black text-white">{answeredCount}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">Pendentes</p>
            <p className="mt-2 text-3xl font-black text-white">{pendingCount}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">Status</p>
            <p className="mt-2 text-lg font-black text-white">{statusLabel}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
