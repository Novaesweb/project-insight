import { describe, expect, it } from "vitest";

import {
  CLAUSE_LIBRARY_SEED,
  createSelectionItemFromClause,
} from "@/lib/contract-clauses";
import {
  createEmptyBuilderPayload,
  resolveContractCustomClauses,
} from "@/lib/contract-builder";

describe("resolveContractCustomClauses", () => {
  it("returns no clauses for a new contract without selections", () => {
    const payload = createEmptyBuilderPayload([]);

    expect(resolveContractCustomClauses(payload)).toBe("");
  });

  it("preserves legacy custom clauses when no manual selection exists", () => {
    const payload = createEmptyBuilderPayload([]);
    payload.customClauses = "CLAUSULA LEGADA\nTexto antigo.";

    expect(resolveContractCustomClauses(payload)).toBe("CLAUSULA LEGADA\nTexto antigo.");
  });

  it("clears legacy custom clauses after the user confirms an empty manual selection", () => {
    const payload = createEmptyBuilderPayload([]);
    payload.customClauses = "CLAUSULA LEGADA\nTexto antigo.";
    payload.clauseSelection = {
      items: [],
      updatedAt: "2026-04-29T10:00:00.000Z",
    };

    expect(resolveContractCustomClauses(payload)).toBe("");
  });

  it("renders only the selected library clauses when a manual selection exists", () => {
    const payload = createEmptyBuilderPayload([]);
    payload.contractante.nome = "Empresa Teste";
    payload.contractante.nomeEmpresa = "Empresa Teste Ltda";
    payload.clauseSelection = {
      items: [createSelectionItemFromClause(CLAUSE_LIBRARY_SEED[2], 0)],
      updatedAt: "2026-04-29T10:00:00.000Z",
    };

    const rendered = resolveContractCustomClauses(payload);

    expect(rendered).toContain("CLAUSULA 03 - SERVICOS NAO INCLUIDOS");
    expect(rendered).not.toContain("CLAUSULA LEGADA");
  });
});
