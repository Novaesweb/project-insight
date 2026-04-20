import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { briefingFieldTypeMeta, type BriefingFieldDraft } from "@/lib/project-briefings";
import { cn } from "@/lib/utils";
import { formatDateTime, hasAnswerValue, type BriefingAttachmentRow } from "../types";

export function BriefingResponsePanelCard({
  responseSections,
  answerMap,
  attachments,
}: {
  responseSections: Array<{ name: string; fields: BriefingFieldDraft[] }>;
  answerMap: Record<string, string | string[]>;
  attachments: BriefingAttachmentRow[];
}) {
  return (
    <Card className="border-white/10 bg-white/[0.03]">
      <CardHeader>
        <CardTitle className="text-white">Respostas do cliente</CardTitle>
        <CardDescription className="text-white/45">
          Leitura operacional das respostas, pendências e anexos por seção.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {responseSections.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-6 text-center text-sm text-white/45">
            Nenhuma pergunta carregada para esse briefing.
          </div>
        ) : null}

        {responseSections.map((section) => (
          <div key={section.name} className="space-y-4">
            <div>
              <p className="text-sm font-black text-white">{section.name}</p>
              <p className="text-xs text-white/45">{section.fields.length} perguntas nessa seção</p>
            </div>

            <div className="space-y-3">
              {section.fields.map((field) => {
                const value = answerMap[field.id];
                const files = attachments.filter((file) => file.field_id === field.id);
                const answered =
                  field.field_type === "file_upload" ? files.length > 0 : hasAnswerValue(value);

                return (
                  <div key={field.id} className="rounded-3xl border border-white/10 bg-black/20 p-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-semibold text-white">{field.label}</p>
                          <Badge
                            className={cn(
                              "border",
                              answered
                                ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-200"
                                : "border-rose-500/20 bg-rose-500/10 text-rose-200",
                            )}
                          >
                            {answered ? "Respondida" : "Pendente"}
                          </Badge>
                        </div>
                        {field.help_text ? (
                          <p className="text-xs leading-relaxed text-white/45">{field.help_text}</p>
                        ) : null}
                      </div>
                      <Badge className="border border-white/10 bg-white/5 text-white/60">
                        {briefingFieldTypeMeta.find((item) => item.value === field.field_type)?.label}
                      </Badge>
                    </div>

                    {field.field_type === "file_upload" ? (
                      <div className="mt-4 space-y-2">
                        {files.length === 0 ? (
                          <p className="text-sm text-white/45">Nenhum arquivo anexado.</p>
                        ) : (
                          files.map((file) => (
                            <a
                              key={file.id}
                              href={file.url}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/75"
                            >
                              <span className="truncate">{file.nome}</span>
                              <span className="text-[11px] text-white/35">{formatDateTime(file.created_at)}</span>
                            </a>
                          ))
                        )}
                      </div>
                    ) : Array.isArray(value) ? (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {value.length > 0 ? (
                          value.map((item) => (
                            <Badge key={item} className="border border-white/10 bg-white/[0.03] text-white/75">
                              {item}
                            </Badge>
                          ))
                        ) : (
                          <p className="text-sm text-white/45">Resposta pendente.</p>
                        )}
                      </div>
                    ) : (
                      <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm leading-relaxed text-white/75">
                        {typeof value === "string" && value.trim() ? value : "Resposta pendente."}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
