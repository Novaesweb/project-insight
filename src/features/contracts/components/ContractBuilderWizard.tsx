import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  FileDown,
  FileSignature,
  Printer,
  Save,
  Send,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  ContractStepCliente,
  ContractStepDados,
  ContractStepExtras,
  ContractStepPlano,
  ContractStepPreview,
  SummaryPill,
} from "@/features/contracts/components/ContractBuilderSteps";
import {
  BUILDER_STEPS,
  type Cliente,
  type Contrato,
} from "@/features/contracts/types";
import {
  formatCurrencyBRL,
  type BuilderPrimaryPlanId,
  type ContractBuilderClientExtraSnapshot,
  type ContractBuilderPayload,
  type ContractProposalSummary,
  type ContractStatus,
} from "@/lib/contract-builder";
import { PUBLIC_PLAN_CATALOG } from "@/lib/public-plans";
import { getContractStatusBadgeClass, getContractStatusLabel } from "@/lib/contract-status";

type BuilderPreparedContract = {
  normalizedPayload: ContractBuilderPayload;
  title: string;
  body: string;
  description: string;
  value: number;
} | null;

type BuilderStatusLabel = {
  title: string;
  subtitle: string;
};

type ContractBuilderWizardProps = {
  builderPayload: ContractBuilderPayload;
  builderStep: number;
  editingBuilderContract: Contrato | null;
  clientes: Cliente[];
  builderSummary: ContractProposalSummary | null;
  builderProgress: number;
  builderStatusLabel: BuilderStatusLabel;
  builderRemoteAutosaveState: "idle" | "saving" | "saved" | "error";
  workingBuilderPayload: ContractBuilderPayload;
  mobileSummaryOpen: boolean;
  selectedItemsCount: number;
  builderClientExtras: ContractBuilderClientExtraSnapshot[];
  syncingClientExtras: boolean;
  shouldReduceMotion: boolean;
  onStepChange: (step: number) => void;
  onReset: () => void;
  onBackToList: () => void;
  onMobileSummaryToggle: () => void;
  onClientChange: (clientId: string) => void | Promise<void>;
  onUpdateContractante: (field: string, value: string) => void;
  onUpdateContratada: (field: string, value: string) => void;
  onUpdateTextField: (field: string, value: string) => void;
  onPrimaryPlanChange: (planId: BuilderPrimaryPlanId) => void;
  onDiscountTypeChange: (value: string) => void;
  onPricingChange: (field: string, value: string) => void;
  onMoneyDraftBlur: (key: string, value: number) => void;
  onRefreshExtras: () => void | Promise<void>;
  onExtraFieldChange: (
    extraId: string,
    field: "name" | "description" | "clause" | "setupPrice",
    value: string,
  ) => void;
  onToggleExtra: (extraId: string, active: boolean) => void;
  onPreview: (contrato: Contrato) => void;
  onSaveDraft: () => void | Promise<void>;
  onSaveAndExit: () => void | Promise<void>;
  onSave: () => void | Promise<void>;
  onSendCurrent?: () => void | Promise<void>;
  onMarkAsSigned?: () => void | Promise<void>;
  onGeneratePdf?: () => void;
  onPrint?: () => void;
  getStepError: (step: number) => string | null;
  getMoneyInputDisplayValue: (key: string, value: number) => string;
  describeClientExtraPricing: (item: ContractBuilderClientExtraSnapshot) => string;
  buildPricingMoneyDraftKey: (field: string) => string;
  builderPrepared: BuilderPreparedContract;
  builderPreparedError?: string | null;
};

export function ContractBuilderWizard({
  builderStep,
  editingBuilderContract,
  clientes,
  builderSummary,
  builderProgress,
  builderStatusLabel,
  builderRemoteAutosaveState,
  workingBuilderPayload,
  selectedItemsCount,
  builderClientExtras,
  syncingClientExtras,
  shouldReduceMotion,
  onStepChange,
  onReset,
  onBackToList,
  onClientChange,
  onUpdateContractante,
  onUpdateContratada,
  onUpdateTextField,
  onPrimaryPlanChange,
  onDiscountTypeChange,
  onPricingChange,
  onMoneyDraftBlur,
  onRefreshExtras,
  onExtraFieldChange,
  onToggleExtra,
  onPreview,
  onSaveDraft,
  onSaveAndExit,
  onSave,
  onSendCurrent,
  onMarkAsSigned,
  onGeneratePdf,
  onPrint,
  getStepError,
  getMoneyInputDisplayValue,
  describeClientExtraPricing,
  buildPricingMoneyDraftKey,
  builderPrepared,
  builderPreparedError,
}: ContractBuilderWizardProps) {
  const selectedPlan = useMemo(
    () => PUBLIC_PLAN_CATALOG.find((plan) => plan.id === workingBuilderPayload.primaryPlanId) || null,
    [workingBuilderPayload.primaryPlanId],
  );
  const activeExtras = useMemo(
    () => workingBuilderPayload.clientExtrasSnapshot.filter((item) => item.active !== false),
    [workingBuilderPayload.clientExtrasSnapshot],
  );
  const contractStatus = editingBuilderContract?.status || workingBuilderPayload.status;
  const isPersisting = builderRemoteAutosaveState === "saving";
  const saveLabel = editingBuilderContract ? "Atualizar contrato" : "Salvar contrato";
  const currentStepMeta = BUILDER_STEPS.find((step) => step.id === builderStep) || BUILDER_STEPS[0];
  const currentStepError = getStepError(builderStep);
  const canAdvance = builderStep < BUILDER_STEPS.length - 1 && !currentStepError;

  const handlePrevious = () => {
    if (builderStep === 0) {
      onBackToList();
      return;
    }

    onStepChange(Math.max(builderStep - 1, 0));
  };

  const handleNext = () => {
    if (!canAdvance) return;
    onStepChange(Math.min(builderStep + 1, BUILDER_STEPS.length - 1));
  };

  const renderCurrentStep = () => {
    if (builderStep === 0) {
      return (
        <ContractStepCliente
          clientes={clientes}
          payload={workingBuilderPayload}
          error={currentStepError}
          onClientChange={onClientChange}
          onUpdateContractante={onUpdateContractante}
        />
      );
    }

    if (builderStep === 1) {
      return (
        <ContractStepDados
          payload={workingBuilderPayload}
          error={currentStepError}
          onUpdateTextField={onUpdateTextField}
        />
      );
    }

    if (builderStep === 2) {
      return (
        <ContractStepPlano
          payload={workingBuilderPayload}
          error={currentStepError}
          onPrimaryPlanChange={onPrimaryPlanChange}
          onPricingChange={onPricingChange}
          onMoneyDraftBlur={onMoneyDraftBlur}
          buildPricingMoneyDraftKey={buildPricingMoneyDraftKey}
        />
      );
    }

    if (builderStep === 3) {
      return (
        <ContractStepExtras
          payload={workingBuilderPayload}
          error={currentStepError}
          builderClientExtras={builderClientExtras}
          syncingClientExtras={syncingClientExtras}
          describeClientExtraPricing={describeClientExtraPricing}
          onRefreshExtras={onRefreshExtras}
          onExtraFieldChange={onExtraFieldChange}
          onToggleExtra={onToggleExtra}
        />
      );
    }

    return (
      <ContractStepPreview
        payload={workingBuilderPayload}
        builderSummary={builderSummary}
        selectedItemsCount={selectedItemsCount}
        builderRemoteAutosaveState={builderRemoteAutosaveState}
        builderPrepared={builderPrepared}
        builderPreparedError={builderPreparedError}
        editingBuilderContract={editingBuilderContract}
        onPreview={onPreview}
        onReset={onReset}
      />
    );
  };

  return (
    <div className="space-y-6">
      <motion.section
        initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="overflow-hidden rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(123,31,162,0.28),transparent_24%),radial-gradient(circle_at_top_right,rgba(232,51,74,0.18),transparent_26%),linear-gradient(135deg,rgba(13,9,20,0.98),rgba(23,10,28,0.96),rgba(44,12,34,0.92))] shadow-[0_32px_80px_rgba(8,4,16,0.42)]"
      >
        <div className="border-b border-white/10 px-6 py-5 md:px-8">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="border-white/15 bg-white/10 text-white/80">
                Contratos NovaesWeb
              </Badge>
              <Badge variant="outline" className={getContractStatusBadgeClass(contractStatus)}>
                {getContractStatusLabel(contractStatus)}
              </Badge>
              {editingBuilderContract ? (
                <Badge variant="outline" className="border-cyan-300/20 bg-cyan-300/10 text-cyan-100">
                  Editando contrato do cofre
                </Badge>
              ) : null}
            </div>

            <div>
              <h2
                className="text-3xl font-semibold leading-tight text-white"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                Fluxo por etapas do contrato
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-white/60">
                Cada etapa foca em um bloco do contrato. O resumo fica no topo e a previa completa aparece apenas no passo final.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6 px-6 py-6 md:px-8">
          <div className="grid gap-3 md:grid-cols-5">
            <SummaryPill label="Cliente" value={workingBuilderPayload.contractante.nome || "Selecione um cliente"} />
            <SummaryPill label="Plano" value={selectedPlan?.title || "Plano nao definido"} />
            <SummaryPill label="Extras" value={`${activeExtras.length} ativo(s)`} />
            <SummaryPill label="Valor total" value={formatCurrencyBRL(workingBuilderPayload.pricing.totalValue)} accent />
            <SummaryPill label="Status" value={builderStatusLabel.title} />
          </div>

          <div className="space-y-3 rounded-[26px] border border-white/10 bg-black/20 p-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/40">Fluxo do editor</p>
                <p className="mt-1 text-sm text-white/70">{builderStatusLabel.subtitle}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-white/15 bg-white/10 text-white/70">
                  Etapa {builderStep + 1} de {BUILDER_STEPS.length}
                </Badge>
                <Badge
                  variant="outline"
                  className={
                    builderRemoteAutosaveState === "error"
                      ? "border-red-300/20 bg-red-300/10 text-red-100"
                      : builderRemoteAutosaveState === "saved"
                        ? "border-emerald-300/20 bg-emerald-300/10 text-emerald-100"
                        : "border-white/10 bg-white/[0.06] text-white/60"
                  }
                >
                  {builderRemoteAutosaveState === "saving"
                    ? "Sincronizando"
                    : builderRemoteAutosaveState === "saved"
                      ? "Sincronizado"
                      : builderRemoteAutosaveState === "error"
                        ? "Falha no sync"
                        : "Rascunho local"}
                </Badge>
              </div>
            </div>
            <Progress value={builderProgress} className="h-2 bg-white/10" />
            <div className="grid gap-2 md:grid-cols-5">
              {BUILDER_STEPS.map((step) => {
                const isActive = builderStep === step.id;
                const stepError = getStepError(step.id);

                return (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() => onStepChange(step.id)}
                    className={`rounded-2xl border px-3 py-3 text-left transition-all ${
                      isActive
                        ? "border-fuchsia-300/20 bg-fuchsia-300/10"
                        : "border-white/10 bg-white/[0.03] hover:border-white/20"
                    }`}
                  >
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/35">{step.label}</p>
                    <p className="mt-2 text-sm font-semibold text-white">{step.description}</p>
                    {stepError ? <p className="mt-2 text-xs text-amber-100/75">{stepError}</p> : null}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </motion.section>

      {renderCurrentStep()}

      {builderStep < BUILDER_STEPS.length - 1 ? (
        <div className="flex flex-col gap-3 rounded-[28px] border border-white/10 bg-[#120d18] p-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold text-white">{currentStepMeta.label}</p>
            <p className="mt-1 text-sm text-white/55">
              {currentStepError || "Tudo certo nesta etapa. Voce pode salvar o rascunho ou continuar o fluxo."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              className="border-white/10 bg-white/5 text-white hover:bg-white/10"
              onClick={handlePrevious}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              {builderStep === 0 ? "Voltar ao cofre" : "Etapa anterior"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="border-white/10 bg-white/5 text-white hover:bg-white/10"
              onClick={() => void onSaveDraft()}
              disabled={isPersisting}
            >
              <Save className="mr-2 h-4 w-4" />
              Salvar rascunho
            </Button>
            <Button
              type="button"
              className="border-0 text-white"
              style={{ background: "var(--admin-gradient)" }}
              onClick={handleNext}
              disabled={!canAdvance}
            >
              Avancar
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="rounded-[28px] border border-white/10 bg-[#120d18] p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-sm font-semibold text-white">Acoes finais do contrato</p>
              <p className="mt-1 text-sm text-white/55">
                {builderPrepared
                  ? "Documento pronto para salvar, imprimir, enviar ao cliente ou marcar assinatura."
                  : builderPreparedError || "Complete os dados minimos antes de finalizar o contrato."}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                className="border-white/10 bg-white/5 text-white hover:bg-white/10"
                onClick={handlePrevious}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar uma etapa
              </Button>
              <Button
                type="button"
                variant="outline"
                className="border-white/10 bg-white/5 text-white hover:bg-white/10"
                onClick={() => void onSaveDraft()}
                disabled={isPersisting}
              >
                <Save className="mr-2 h-4 w-4" />
                Salvar rascunho
              </Button>
              <Button
                type="button"
                variant="outline"
                className="border-white/10 bg-white/5 text-white hover:bg-white/10"
                onClick={() => void onSaveAndExit()}
                disabled={isPersisting}
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Salvar e voltar
              </Button>
              <Button
                type="button"
                className="border-0 text-white"
                style={{ background: "var(--admin-gradient)" }}
                onClick={() => void onSave()}
                disabled={isPersisting || !builderPrepared}
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                {isPersisting ? "Salvando..." : saveLabel}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="border-white/10 bg-white/5 text-white hover:bg-white/10"
                onClick={onGeneratePdf}
                disabled={!builderPrepared}
              >
                <FileDown className="mr-2 h-4 w-4" />
                Gerar PDF
              </Button>
              <Button
                type="button"
                variant="outline"
                className="border-white/10 bg-white/5 text-white hover:bg-white/10"
                onClick={onPrint}
                disabled={!builderPrepared}
              >
                <Printer className="mr-2 h-4 w-4" />
                Imprimir
              </Button>
              <Button
                type="button"
                variant="outline"
                className="border-white/10 bg-white/5 text-white hover:bg-white/10"
                onClick={() => void onSendCurrent?.()}
                disabled={!onSendCurrent || isPersisting || !builderPrepared}
              >
                <Send className="mr-2 h-4 w-4" />
                Marcar como enviado
              </Button>
              <Button
                type="button"
                variant="outline"
                className="border-white/10 bg-white/5 text-white hover:bg-white/10"
                onClick={() => void onMarkAsSigned?.()}
                disabled={!onMarkAsSigned || isPersisting || !builderPrepared}
              >
                <FileSignature className="mr-2 h-4 w-4" />
                Marcar como assinado
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
