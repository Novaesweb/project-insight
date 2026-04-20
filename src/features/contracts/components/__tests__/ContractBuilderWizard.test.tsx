import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { createEmptyBuilderPayload, buildProposalSummary } from "@/lib/contract-builder";
import { buildBuilderSavePayload } from "@/features/contracts/utils";
import { ContractBuilderWizard } from "@/features/contracts/components/ContractBuilderWizard";

describe("ContractBuilderWizard", () => {
  it("renders the preview step without crashing", () => {
    const payload = createEmptyBuilderPayload([]);
    const builderPrepared = buildBuilderSavePayload(payload, 4);

    expect(builderPrepared).not.toBeNull();

    render(
      <ContractBuilderWizard
        builderPayload={payload}
        builderStep={4}
        editingBuilderContract={null}
        clientes={[]}
        builderSummary={buildProposalSummary(payload)}
        builderProgress={100}
        builderStatusLabel={{ title: "Rascunho", subtitle: "Pronto para revisar" }}
        builderRemoteAutosaveState="idle"
        workingBuilderPayload={payload}
        mobileSummaryOpen={false}
        selectedItemsCount={0}
        builderClientExtras={[]}
        syncingClientExtras={false}
        shouldReduceMotion={true}
        onStepChange={vi.fn()}
        onReset={vi.fn()}
        onMobileSummaryToggle={vi.fn()}
        onClientChange={vi.fn()}
        onUpdateContractante={vi.fn()}
        onUpdateContratada={vi.fn()}
        onUpdateTextField={vi.fn()}
        onPrimaryPlanChange={vi.fn()}
        onDiscountTypeChange={vi.fn()}
        onPricingChange={vi.fn()}
        onMoneyDraftBlur={vi.fn()}
        onRefreshExtras={vi.fn()}
        onPreview={vi.fn()}
        onSaveAndExit={vi.fn()}
        onSave={vi.fn()}
        getStepError={vi.fn().mockReturnValue(null)}
        getMoneyInputDisplayValue={vi.fn().mockReturnValue("0,00")}
        describeClientExtraPricing={vi.fn().mockReturnValue("Cortesia")}
        buildPricingMoneyDraftKey={vi.fn().mockReturnValue("pricing:root:discountValue")}
        builderPrepared={builderPrepared}
      />,
    );

    expect(screen.getAllByText(/proposta premium/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/contrato mestre universal/i)).toBeInTheDocument();
  });
});
