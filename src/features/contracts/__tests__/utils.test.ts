import { describe, expect, it } from "vitest";

import { normalizeBuilderPayload } from "@/features/contracts/utils";

describe("normalizeBuilderPayload", () => {
  it("recovers malformed legacy payloads without throwing", () => {
    const malformedPayload = {
      clienteId: 123,
      lastStep: 99,
      primaryPlanId: "plano-antigo",
      contractante: null,
      contratada: { nome: { broken: true } },
      items: [
        null,
        {
          id: "plan:express",
          selected: true,
          name: { invalid: true },
          description: null,
          setupPrice: "1.250,50",
          monthlyPrice: "199,90",
        },
      ],
      clientExtrasSnapshot: [
        null,
        {
          id: null,
          extraId: null,
          label: "Pixel Meta",
          name: { invalid: true },
          category: "categoria-antiga",
          typeLabel: "quebrado",
          setupPrice: "99,90",
          monthlyPrice: null,
        },
      ],
      customScope: { invalid: true },
      prazoDias: 30,
      formaPagamento: null,
      numeroRevisoes: 3,
      valorRevisao: { invalid: true },
      prazoSuporte: undefined,
      observacoesComerciais: ["nao", "valido"],
      escopoExclusoes: false,
      pricing: {
        negotiatedSetup: "1.500,00",
        discountType: "invalid",
        discountValue: "100,00",
        entryValue: "300,00",
        negotiatedMonthly: "199,90",
      },
      createdAt: null,
    };

    expect(() => normalizeBuilderPayload(malformedPayload, [], "client-1")).not.toThrow();

    const normalized = normalizeBuilderPayload(malformedPayload, [], "client-1");
    const expressPlan = normalized.items.find((item) => item.id === "plan:express");

    expect(normalized.clienteId).toBe("client-1");
    expect(normalized.lastStep).toBe(0);
    expect(normalized.primaryPlanId).toBe("express");
    expect(normalized.contractante.nome).toBe("");
    expect(normalized.contratada.nome).toBe("NovaesWeb");
    expect(normalized.customScope).toBe("");
    expect(normalized.formaPagamento).toContain("PIX");
    expect(normalized.clientExtrasSnapshot).toEqual([
      expect.objectContaining({
        name: "Pixel Meta",
        category: "fixo",
        setupPrice: 99.9,
        monthlyPrice: 0,
      }),
    ]);
    expect(normalized.clientExtrasSnapshot[0]?.typeLabel).not.toBe("mensal");
    expect(expressPlan).toEqual(
      expect.objectContaining({
        selected: true,
        setupPrice: 1250.5,
        monthlyPrice: 199.9,
      }),
    );
  });
});
