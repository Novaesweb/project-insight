import { Link } from "react-router-dom";
import { User2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { briefingStatusMeta } from "@/lib/project-briefings";
import { cn } from "@/lib/utils";
import {
  formatDateTime,
  getClientDisplayName,
  getProjectTitle,
  getSentStatusLabel,
  type ClientBriefingRow,
} from "../types";

export function BriefingsQueueList({
  title,
  description,
  loading,
  emptyMessage,
  items,
  activeId,
}: {
  title: string;
  description: string;
  loading?: boolean;
  emptyMessage: string;
  items: Array<{ briefing: ClientBriefingRow; to: string }>;
  activeId?: string | null;
}) {
  return (
    <Card className="border-white/10 bg-white/[0.03]">
      <CardHeader>
        <CardTitle className="text-white">{title}</CardTitle>
        <CardDescription className="text-white/45">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[720px] pr-3">
          <div className="space-y-3">
            {loading ? (
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-white/55">
                Carregando briefings...
              </div>
            ) : null}

            {!loading && items.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-6 text-center text-sm text-white/45">
                {emptyMessage}
              </div>
            ) : null}

            {items.map(({ briefing, to }) => (
              <Link
                key={briefing.id}
                to={to}
                className={cn(
                  "block rounded-3xl border p-4 text-left transition-all",
                  briefing.id === activeId
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
                      {getProjectTitle(briefing.projetos) ? <span>{getProjectTitle(briefing.projetos)}</span> : null}
                    </div>
                  </div>
                  <Badge className={cn("border", briefingStatusMeta[briefing.status].tone)}>
                    {getSentStatusLabel(briefing.status)}
                  </Badge>
                </div>
                <p className="mt-3 text-[11px] text-white/35">
                  Atualizado em {formatDateTime(briefing.updated_at)}
                </p>
              </Link>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
