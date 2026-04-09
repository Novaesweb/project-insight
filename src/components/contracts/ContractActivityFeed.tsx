import {
  Archive,
  CheckCircle2,
  CopyPlus,
  Eye,
  FilePenLine,
  FolderOpen,
  Send,
} from "lucide-react";

import type { ContractEventRow } from "@/lib/contract-activity";
import { formatContractEventRelative, getContractEventLabel } from "@/lib/contract-activity";

function getEventIcon(type: string) {
  switch (type) {
    case "enviado":
      return Send;
    case "visualizado":
      return Eye;
    case "assinado":
      return CheckCircle2;
    case "arquivado":
      return Archive;
    case "desarquivado":
      return FolderOpen;
    case "duplicado":
      return CopyPlus;
    default:
      return FilePenLine;
  }
}

export function ContractActivityFeed({
  events,
  loading = false,
  emptyLabel = "Nenhuma movimentação registrada ainda.",
}: {
  events: ContractEventRow[];
  loading?: boolean;
  emptyLabel?: string;
}) {
  if (loading) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4 text-sm text-white/45">
        Carregando atividade do contrato...
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4 text-sm text-white/45">
        {emptyLabel}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {events.map((event) => {
        const Icon = getEventIcon(event.tipo);

        return (
          <div
            key={event.id}
            className="flex items-start gap-3 rounded-3xl border border-white/10 bg-[linear-gradient(135deg,rgba(123,31,162,0.12),rgba(232,51,74,0.08),rgba(255,255,255,0.03))] p-4"
          >
            <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
              <Icon className="h-4 w-4 text-rose-200" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-medium text-white">{event.titulo || getContractEventLabel(event.tipo)}</p>
                <span className="text-[10px] uppercase tracking-[0.18em] text-white/30">
                  {formatContractEventRelative(event.created_at)}
                </span>
              </div>
              <p className="mt-1 text-xs text-white/55">
                {event.descricao || "Evento operacional registrado no histórico do contrato."}
              </p>
              <p className="mt-2 text-[10px] uppercase tracking-[0.16em] text-white/30">
                {event.actor_type === "cliente" ? "Cliente" : event.actor_type === "admin" ? "Admin" : "Sistema"}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
