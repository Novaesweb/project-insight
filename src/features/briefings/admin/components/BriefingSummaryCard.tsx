import { Paperclip } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTime, type BriefingAttachmentRow, type ClientBriefingRow } from "../types";

export function BriefingSummaryCard({
  snapshotBriefing,
  snapshotReferences,
  attachments,
  selectedBriefing,
}: {
  snapshotBriefing: string;
  snapshotReferences: string;
  attachments: BriefingAttachmentRow[];
  selectedBriefing?: ClientBriefingRow | null;
}) {
  return (
    <Card className="border-white/10 bg-white/[0.03]">
      <CardHeader>
        <CardTitle className="text-white">Resumo recebido</CardTitle>
        <CardDescription className="text-white/45">
          Snapshot consolidado, links e histórico operacional do briefing.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
          <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">Snapshot do briefing</p>
          <pre className="mt-3 whitespace-pre-wrap text-xs leading-relaxed text-white/70">
            {snapshotBriefing || "Nenhuma resposta consolidada ainda."}
          </pre>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
          <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">Links e referências</p>
          <pre className="mt-3 whitespace-pre-wrap text-xs leading-relaxed text-white/70">
            {snapshotReferences || "Nenhum link consolidado ainda."}
          </pre>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
          <div className="flex items-center gap-2">
            <Paperclip className="h-4 w-4 text-fuchsia-200" />
            <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">Anexos do briefing</p>
          </div>
          <div className="mt-3 space-y-2">
            {attachments.length === 0 ? (
              <p className="text-xs text-white/45">Nenhum anexo recebido ainda.</p>
            ) : (
              attachments.map((file) => (
                <a
                  key={file.id}
                  href={file.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/75"
                >
                  <span className="truncate">{file.nome}</span>
                  <span className="text-[11px] text-white/35">{formatDateTime(file.created_at)}</span>
                </a>
              ))
            )}
          </div>
        </div>

        {selectedBriefing ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
            <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">Timeline operacional</p>
            <div className="mt-3 flex flex-wrap gap-3 text-xs text-white/65">
              <span>Enviado: {formatDateTime(selectedBriefing.sent_at)}</span>
              <span>Iniciado: {formatDateTime(selectedBriefing.started_at)}</span>
              <span>Respondido: {formatDateTime(selectedBriefing.submitted_at)}</span>
              <span>Concluído: {formatDateTime(selectedBriefing.completed_at)}</span>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
