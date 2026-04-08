import { describe, expect, it } from "vitest";

import { createEmptyBuilderPayload, selectPrimaryPlan } from "@/lib/contract-builder";
import { validateAndSanitizeBuilderPayload } from "@/lib/contract-builder-schema";

describe("validateAndSanitizeBuilderPayload", () => {
  it("remove tags HTML e caracteres perigosos de campos livres", () => {
    const payload = createEmptyBuilderPayload([]);

    payload.contractante.nome = "<script>alert(1)</script>Cliente Teste";
    payload.observacoesComerciais = "Linha 1\n<img src=x onerror=alert(1)>\nLinha 2";

    const sanitized = validateAndSanitizeBuilderPayload(payload);

    expect(sanitized.contractante.nome).toBe("alert(1)Cliente Teste");
    expect(sanitized.observacoesComerciais).toBe("Linha 1\n\nLinha 2");
  });

  it("normaliza email, telefone, documento e url inválidos", () => {
    const payload = createEmptyBuilderPayload([]);

    payload.contractante.email = "invalido";
    payload.contractante.whatsapp = "+55 (51) 99999-0000<script>";
    payload.contractante.documento = "503.328.838-50<script>";
    payload.contractante.siteUrl = "javascript:alert(1)";

    const sanitized = validateAndSanitizeBuilderPayload(payload);

    expect(sanitized.contractante.email).toBe("");
    expect(sanitized.contractante.whatsapp).toBe("+55 (51) 99999-0000");
    expect(sanitized.contractante.documento).toBe("503.328.838-50");
    expect(sanitized.contractante.siteUrl).toBe("");
  });

  it("clampa valores negativos para zero", () => {
    const payload = createEmptyBuilderPayload([]);

    payload.items[0].setupPrice = -150;
    payload.items[0].monthlyPrice = -20;
    payload.pricing.negotiatedSetup = -100;
    payload.pricing.entryValue = -40;
    payload.pricing.negotiatedMonthly = -10;

    const sanitized = validateAndSanitizeBuilderPayload(payload);

    expect(sanitized.items[0].setupPrice).toBe(0);
    expect(sanitized.items[0].monthlyPrice).toBe(0);
    expect(sanitized.pricing.negotiatedSetup).toBe(0);
    expect(sanitized.pricing.entryValue).toBe(0);
    expect(sanitized.pricing.negotiatedMonthly).toBe(0);
  });

  it("exige escopo customizado para propostas Sob Medida", () => {
    const payload = createEmptyBuilderPayload([]);

    payload.primaryPlanId = "sob-medida";
    payload.items = selectPrimaryPlan(payload.items, "sob-medida");
    payload.customScope = "";

    expect(() => validateAndSanitizeBuilderPayload(payload)).toThrow(
      /Escopo customizado é obrigatório/i,
    );
  });

  it("bloqueia entrada maior do que o valor negociado", () => {
    const payload = createEmptyBuilderPayload([]);

    payload.pricing.negotiatedSetup = 100;
    payload.pricing.entryValue = 150;

    expect(() => validateAndSanitizeBuilderPayload(payload)).toThrow(
      /entrada não pode ser maior/i,
    );
  });
});
