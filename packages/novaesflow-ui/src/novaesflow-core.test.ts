import { describe, expect, it } from "vitest";

import { buildNovaesFlowSelection, computeNovaesFlowTotals } from "./utils/finance";
import { sanitizeNovaesFlowEmail, sanitizeNovaesFlowFields } from "./utils/sanitize";

describe("novaesflow core", () => {
  it("computes totals without backend", () => {
    const result = computeNovaesFlowTotals(
      [{ id: "pro", name: "Pro", price: 500, description: "Plano base", monthlyPrice: 90 }],
      [{ id: "ia", name: "IA", price: 120, description: "Atendimento", monthlyPrice: 40 }],
      "pro",
      ["ia"],
    );

    expect(result.totals.setup).toBe(620);
    expect(result.totals.recurring).toBe(130);
  });

  it("sanitizes dangerous field values", () => {
    const cleaned = sanitizeNovaesFlowFields(
      [{ id: "brief", label: "Brief", type: "textarea", maxLength: 120 }],
      { brief: "<script>alert(1)</script>Landing page premium" },
    );

    expect(cleaned.brief).toBe("alert(1)Landing page premium");
  });

  it("normalizes invalid emails to empty string", () => {
    expect(sanitizeNovaesFlowEmail("bad@@example")).toBe("");
  });

  it("builds a stable selection payload", () => {
    const selection = buildNovaesFlowSelection(
      [{ id: "express", name: "Express", price: 180, description: "Base" }],
      [{ id: "marketing", name: "Marketing", price: 300, description: "Extra" }],
      "express",
      ["marketing"],
      { name: "Lucas" },
    );

    expect(selection.selectedPlan?.id).toBe("express");
    expect(selection.selectedExtras).toHaveLength(1);
    expect(selection.fieldValues.name).toBe("Lucas");
  });
});
