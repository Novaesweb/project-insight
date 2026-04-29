// @vitest-environment jsdom

import { beforeEach, describe, expect, it } from "vitest";

import {
  CLAUSE_LIBRARY_SEED,
  CLAUSE_LIBRARY_STORAGE_KEY,
  buildClauseVariableMap,
  createDefaultContractClauseSelection,
  createSelectionItemFromClause,
  loadClauseLibrary,
  renderContractClauseSelection,
  saveClauseLibrary,
} from "@/lib/contract-clauses";

describe("contract clause library", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("loads the new seed library when storage is empty", () => {
    const library = loadClauseLibrary();

    expect(library).toHaveLength(20);
    expect(library[0]?.title).toBe("CLAUSULA 01 - OBJETO DO CONTRATO");
    expect(library[19]?.title).toBe("CLAUSULA 20 - DISPOSICOES GERAIS E FORO");
    expect(library.every((item) => item.required === false)).toBe(true);
  });

  it("does not auto-select clauses by default", () => {
    const selection = createDefaultContractClauseSelection(CLAUSE_LIBRARY_SEED);

    expect(selection.items).toHaveLength(0);
    expect(selection.updatedAt).toBeNull();
  });

  it("persists custom clauses in localStorage", () => {
    const customLibrary = [
      ...CLAUSE_LIBRARY_SEED,
      {
        id: "custom-1",
        title: "CLAUSULA CUSTOM",
        text: "Texto livre da clausula customizada.",
        category: "geral" as const,
        required: false,
        origin: "custom" as const,
        createdAt: "2026-04-23T10:00:00.000Z",
        updatedAt: "2026-04-23T10:00:00.000Z",
      },
    ];

    saveClauseLibrary(customLibrary);

    expect(window.localStorage.getItem(CLAUSE_LIBRARY_STORAGE_KEY)).toBeTruthy();
    expect(loadClauseLibrary().some((item) => item.id === "custom-1")).toBe(true);
  });

  it("renders only the selected clauses with substituted variables", () => {
    const selectionItems = [
      createSelectionItemFromClause(CLAUSE_LIBRARY_SEED[0], 0),
      createSelectionItemFromClause(
        {
          id: "custom-2",
          title: "CLAUSULA 21 - CLAUSULA FINAL",
          text: "Atendimento iniciado em {{DATA_INICIO}} para {{NOME_CLIENTE}}.",
          category: "geral",
          required: false,
          origin: "custom",
          createdAt: "2026-04-23T10:00:00.000Z",
          updatedAt: "2026-04-23T10:00:00.000Z",
        },
        1,
      ),
    ];

    const rendered = renderContractClauseSelection(
      {
        items: selectionItems,
        updatedAt: "2026-04-23T10:00:00.000Z",
      },
      buildClauseVariableMap({
        contractante: {
          nome: "Maria Fernanda",
          nomeEmpresa: "Loja Modelo",
          telefone: "(51) 99999-0000",
        },
        contratada: {
          nome: "NovaesWeb",
          representante: "Lucas Rodrigo",
        },
        pricing: {
          baseValue: 1200,
          finalMonthlyTotal: 350,
        },
        issueDate: "2026-04-23",
        startDate: "2026-05-01",
        dueDate: "2026-05-10",
        prazoDias: "15",
        numeroRevisoes: "2",
      }),
    );

    expect(rendered).toContain("CLAUSULA 01 - OBJETO DO CONTRATO");
    expect(rendered).toContain("Maria Fernanda");
    expect(rendered).toContain("01/05/2026");
    expect(rendered).not.toContain("CLAUSULA 03 - SERVICOS NAO INCLUIDOS");
  });
});
