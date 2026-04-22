import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { buildProposalSummary, createEmptyBuilderPayload } from "@/lib/contract-builder";
import { buildBuilderSavePayload } from "@/features/contracts/utils";
import { ContractBuilderWizard } from "@/features/contracts/components/ContractBuilderWizard";

function buildProps(step = 0) {
  const payload = createEmptyBuilderPayload([]);
  if (step >= 2) {
    payload.clienteId = "cliente-1";
    payload.contractante.nome = "Cliente Teste";
    payload.contractante.documento = "123.456.789-00";
    payload.contractNumber = "CTR-2026-TESTE";
    payload.primaryPlanId = "express";
    payload.pricing.baseValue = 1200;
  }

  const builderPrepared = buildBuilderSavePayload(payload, 4);

  return {
    builderPayload: payload,
    builderStep: step,
    editingBuilderContract: null,
    clientes: [],
    builderSummary: buildProposalSummary(payload),
    builderProgress: 20,
    builderStatusLabel: { title: "Rascunho", subtitle: "Fluxo por etapas" },
    builderRemoteAutosaveState: "idle" as const,
    workingBuilderPayload: payload,
    mobileSummaryOpen: false,
    selectedItemsCount: 0,
    builderClientExtras: [],
    syncingClientExtras: false,
    shouldReduceMotion: true,
    onStepChange: vi.fn(),
    onReset: vi.fn(),
    onBackToList: vi.fn(),
    onMobileSummaryToggle: vi.fn(),
    onClientChange: vi.fn(),
    onUpdateContractante: vi.fn(),
    onUpdateContratada: vi.fn(),
    onUpdateTextField: vi.fn(),
    onPrimaryPlanChange: vi.fn(),
    onDiscountTypeChange: vi.fn(),
    onPricingChange: vi.fn(),
    onMoneyDraftBlur: vi.fn(),
    onRefreshExtras: vi.fn(),
    onExtraFieldChange: vi.fn(),
    onToggleExtra: vi.fn(),
    onPreview: vi.fn(),
    onSaveDraft: vi.fn(),
    onSaveAndExit: vi.fn(),
    onSave: vi.fn(),
    onSendCurrent: vi.fn(),
    onMarkAsSigned: vi.fn(),
    onGeneratePdf: vi.fn(),
    onPrint: vi.fn(),
    getStepError: vi.fn().mockImplementation((currentStep: number) => (currentStep === 0 ? "Selecione um cliente para iniciar o contrato." : null)),
    getMoneyInputDisplayValue: vi.fn().mockReturnValue("0,00"),
    describeClientExtraPricing: vi.fn().mockReturnValue("Cortesia"),
    buildPricingMoneyDraftKey: vi.fn().mockReturnValue("pricing:root:baseValue"),
    builderPrepared,
    builderPreparedError: null,
  };
}

describe("ContractBuilderWizard", () => {
  it("renders the client step without the full preview", () => {
    render(<ContractBuilderWizard {...buildProps(0)} />);

    expect(screen.getByText(/cliente e dados automaticos/i)).toBeInTheDocument();
    expect(screen.getByText(/buscar cliente/i)).toBeInTheDocument();
    expect(screen.queryByText(/preview final do contrato/i)).not.toBeInTheDocument();
  });

  it("renders the final preview step without crashing", () => {
    render(<ContractBuilderWizard {...buildProps(4)} />);

    expect(screen.getByText(/preview final do contrato/i)).toBeInTheDocument();
    expect(screen.getByText(/acoes finais do contrato/i)).toBeInTheDocument();
    expect(screen.getAllByText(/proposta premium/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/contrato mestre universal/i)).toBeInTheDocument();
  });
});
