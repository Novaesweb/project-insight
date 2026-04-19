import { describe, expect, it } from "vitest";

import {
  ADMIN_BRIEFINGS_DRAFT_NEW,
  resolveAdminBriefingClientPath,
} from "@/features/briefings/admin/routes";
import type { ClientBriefingRow } from "@/features/briefings/admin/types";

function makeBriefingRow(
  id: string,
  clientId: string,
  status: ClientBriefingRow["status"],
  updatedAt: string,
): ClientBriefingRow {
  return {
    id,
    cliente_id: clientId,
    projeto_id: null,
    titulo: `Briefing ${id}`,
    instrucoes: null,
    status,
    snapshot_briefing: null,
    snapshot_references: null,
    sent_at: null,
    started_at: null,
    submitted_at: null,
    completed_at: null,
    created_at: updatedAt,
    updated_at: updatedAt,
    clientes: null,
    projetos: null,
  };
}

describe("resolveAdminBriefingClientPath", () => {
  it("prioritizes an in-progress draft for the client", () => {
    const path = resolveAdminBriefingClientPath(
      [
        makeBriefingRow("sent-1", "client-1", "respondido", "2026-04-18T10:00:00.000Z"),
        makeBriefingRow("draft-1", "client-1", "em_construcao", "2026-04-19T10:00:00.000Z"),
      ],
      "client-1",
    );

    expect(path).toBe("/admin/briefings/em-andamento/draft-1?cliente=client-1");
  });

  it("falls back to the most recent sent briefing when there is no draft", () => {
    const path = resolveAdminBriefingClientPath(
      [
        makeBriefingRow("sent-new", "client-1", "enviado", "2026-04-19T10:00:00.000Z"),
        makeBriefingRow("sent-old", "client-1", "respondido", "2026-04-18T10:00:00.000Z"),
      ],
      "client-1",
    );

    expect(path).toBe("/admin/briefings/enviados/sent-new?cliente=client-1");
  });

  it("routes to a new draft when the client has no briefings yet", () => {
    const path = resolveAdminBriefingClientPath([], "client-1");

    expect(path).toBe(`${ADMIN_BRIEFINGS_DRAFT_NEW}?cliente=client-1`);
  });
});
