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
  ContractStepExtras,
  ContractStepPlano,
  ContractStepPreview,
  SummaryPill,
} from "@/features/contracts/components/ContractBuilderSteps";
import { ContractStepDadosLibrary } from "@/features/contracts/components/ContractStepDadosLibrary";
import {
  BUILDER_STEPS,
  type Cliente,
  type Contrato,
} from "@/features/contracts/types";
import type { ContractClauseSelection } from "@/lib/contract-clauses";
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
  onClauseSelectionChange: (selection: ContractClauseSelection) => void;
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
  onClauseSelectionChange,
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
    () => PUBLIC_PLAN_CATALOG.find((plan) => plan.id === workingBuilderPayload?.primaryPlanId) || null,
    [workingBuilderPayload?.primaryPlanId],
  );
  const activeExtras = useMemo(
    () => (workingBuilderPayload?.clientExtrasSnapshot || []).filter((item) => item.active !== false),
    [workingBuilderPayload?.clientExtrasSnapshot],
  );
  const contractStatus = editingBuilderContract?.status || workingBuilderPayload?.status || "rascunho";
  const isPersisting = builderRemoteAutosaveState === "saving";
  const saveLabel = editingBuilderContract ? "Atualizar contrato" : "Salvar contrato";
  const currentStepMeta = BUILDER_STEPS.find((step) => step.id === builderStep) || BUILDER_STEPS[0];
  const currentStepError = getStepError?.(builderStep) || null;
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
        <ContractStepDadosLibrary
          payload={workingBuilderPayload}
          error={currentStepError}
          onUpdateTextField={onUpdateTextField}
          onClauseSelectionChange={onClauseSelectionChange}
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
    <div className="space-y-8">
      {/* HEADER PREMIUM COM ACENTO DOURADO */}
      <motion.section
        initial={shouldReduceMotion ? false : { opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[40px] border border-white/10 bg-[linear-gradient(135deg,rgba(13,9,20,0.98),rgba(23,10,28,0.95))] shadow-[0_40px_100px_rgba(0,0,0,0.6)]"
      >
        {/* Linha de Marca Superior */}
        <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#FF1F1F] to-transparent opacity-60" />
        
        <div className="relative border-b border-white/5 px-8 py-8 md:px-10">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <Badge className="border-[#FF1F1F]/30 bg-[#FF1F1F]/10 text-white hover:bg-[#FF1F1F]/20 transition-colors">
                  <Sparkles className="mr-1.5 h-3 w-3 text-[#EC4899]" />
                  Smart Assembler Premium
                </Badge>
                <Badge variant="outline" className={`${getContractStatusBadgeClass(contractStatus)} px-3 py-0.5 border-white/10`}>
                  {getContractStatusLabel(contractStatus)}
                </Badge>
              </div>
              <div>
                <h2 className="text-4xl font-light tracking-tight text-white md:text-5xl" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Montador <span className="text-brand-gradient italic">Smart</span>
                </h2>
                <p className="mt-3 max-w-2xl text-base leading-relaxed text-white/50">
                  Refine cada detalhe do contrato com precisão. O sistema organiza a estrutura e a IA ajuda no texto jurídico com o DNA da marca.
                </p>
              </div>
            </div>

            {/* Pílulas de Resumo Flutuantes */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex flex-col items-end px-5 py-3 rounded-2xl bg-white/[0.03] border border-white/5">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#EC4899]/80">Valor Total</span>
                <span className="text-xl font-medium text-white">{formatCurrencyBRL(workingBuilderPayload?.pricing?.totalValue || 0)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* INDICADOR DE ETAPAS MODERNO */}
        <div className="px-8 py-8 md:px-10 bg-black/20">
          <div className="relative">
            <div className="absolute top-1/2 left-0 right-0 h-px bg-white/5 -translate-y-1/2" />
            <div className="relative flex justify-between gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {BUILDER_STEPS.map((step, idx) => {
                const isActive = builderStep === step.id;
                const isCompleted = builderStep > step.id;
                const stepError = getStepError(step.id);

                return (
                  <button
                    key={step.id}
                    onClick={() => onStepChange(step.id)}
                    className="group relative flex flex-col items-center min-w-[120px] outline-none"
                  >
                    <div className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full border transition-all duration-500 ${
                      isActive 
                        ? "border-[#FF1F1F] bg-[#FF1F1F]/20 shadow-[0_0_15px_rgba(255,31,31,0.3)] scale-110" 
                        : isCompleted 
                          ? "border-[#7C3AED]/40 bg-[#7C3AED]/10" 
                          : "border-white/10 bg-[#1a1520]"
                    }`}>
                      {isCompleted ? (
                        <CheckCircle2 className="h-5 w-5 text-[#EC4899]" />
                      ) : (
                        <span className={`text-sm font-bold ${isActive ? "text-white" : "text-white/40"}`}>{idx + 1}</span>
                      )}
                    </div>
                    <span className={`mt-3 text-[10px] font-black uppercase tracking-[0.15em] transition-colors ${
                      isActive ? "text-white" : "text-white/30 group-hover:text-white/60"
                    }`}>
                      {step.label}
                    </span>
                    {stepError && (
                      <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" title={stepError} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
          
          <div className="mt-8">
             <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">Progresso do Contrato</span>
                <span className="text-[10px] font-bold text-[#EC4899]">{builderProgress}%</span>
             </div>
             <div className="h-1 w-full rounded-full bg-white/5 overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${builderProgress}%` }}
                  className="h-full bg-brand-gradient shadow-[0_0_10px_rgba(236,72,153,0.3)]"
                />
             </div>
          </div>
        </div>
      </motion.section>

      {/* CONTEÚDO PRINCIPAL (ETAPAS) */}
      <div className="relative">
        <motion.div
          key={builderStep}
          initial={shouldReduceMotion ? false : { opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          {renderCurrentStep()}
        </motion.div>
      </div>

      {/* FOOTER DE AÇÕES PREMIUM */}
      <div className="sticky bottom-6 z-40">
        <div className="mx-auto max-w-5xl rounded-[32px] border border-white/10 bg-[#0d0914]/90 backdrop-blur-xl p-4 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4 px-2">
               <div className={`h-2 w-2 rounded-full ${builderRemoteAutosaveState === 'saving' ? 'bg-amber-400 animate-pulse' : 'bg-[#7C3AED]'}`} />
               <p className="text-xs text-white/50">{builderStatusLabel.subtitle}</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="ghost"
                className="rounded-2xl text-white/60 hover:text-white hover:bg-white/5"
                onClick={handlePrevious}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar
              </Button>

              <Button
                variant="outline"
                className="rounded-2xl border-white/5 bg-white/[0.03] text-white/80 hover:bg-white/10"
                onClick={() => void onSaveDraft()}
                disabled={isPersisting}
              >
                <Save className="mr-2 h-4 w-4" />
                Rascunho
              </Button>

              {builderStep < BUILDER_STEPS.length - 1 ? (
                <Button
                  className="rounded-2xl border-0 bg-brand-gradient px-8 text-white font-bold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_10px_20px_rgba(124,58,237,0.2)]"
                  onClick={handleNext}
                  disabled={!canAdvance}
                >
                  Continuar
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <div className="flex items-center gap-2">
                  <Button
                    className="rounded-2xl border-0 bg-brand-gradient px-8 text-white font-bold hover:shadow-[0_0_20px_rgba(236,72,153,0.4)] transition-all"
                    onClick={() => void onSave()}
                    disabled={isPersisting || !builderPrepared}
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    {isPersisting ? "Finalizando..." : "Gerar Contrato"}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* AÇÕES EXTRAS (Só no Preview Final) */}
      {builderStep === BUILDER_STEPS.length - 1 && builderPrepared && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap justify-center gap-3 pt-4"
        >
          <Button variant="outline" className="rounded-xl border-white/5 bg-white/[0.02] text-white/60 hover:text-[#EC4899]" onClick={onGeneratePdf}>
            <FileDown className="mr-2 h-4 w-4" /> PDF
          </Button>
          <Button variant="outline" className="rounded-xl border-white/5 bg-white/[0.02] text-white/60 hover:text-[#EC4899]" onClick={onPrint}>
            <Printer className="mr-2 h-4 w-4" /> Imprimir
          </Button>
          <Button variant="outline" className="rounded-xl border-white/5 bg-white/[0.02] text-white/60 hover:text-[#EC4899]" onClick={() => void onSendCurrent?.()}>
            <Send className="mr-2 h-4 w-4" /> Enviar
          </Button>
        </motion.div>
      )}
    </div>
  );
}
