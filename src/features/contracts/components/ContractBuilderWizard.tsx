import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  FileDown,
  FileSignature,
  Printer,
  RefreshCw,
  Save,
  Send,
  Sparkles,
  UserRound,
} from "lucide-react";

import { BuilderLiveSummary } from "@/components/contracts/BuilderLiveSummary";
import { BuilderPreviewDocument } from "@/components/contracts/BuilderPreviewDocument";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import {
  BUILDER_STEPS,
  CONTRACT_STATUS_OPTIONS,
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

function SummaryPill({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-[24px] border px-4 py-3 ${
        accent
          ? "border-fuchsia-300/20 bg-[linear-gradient(135deg,rgba(123,31,162,0.22),rgba(232,51,74,0.18))]"
          : "border-white/10 bg-white/[0.04]"
      }`}
    >
      <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/40">{label}</p>
      <p className="mt-2 text-sm font-semibold text-white">{value}</p>
    </div>
  );
}

function SectionCard({
  title,
  description,
  children,
  step,
  active,
  error,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  step: number;
  active: boolean;
  error?: string | null;
}) {
  return (
    <Card
      className={`overflow-hidden border transition-all ${
        active
          ? "border-fuchsia-300/20 bg-[linear-gradient(135deg,rgba(123,31,162,0.16),rgba(232,51,74,0.08),rgba(10,5,16,0.98))] shadow-[0_24px_60px_rgba(17,6,26,0.22)]"
          : "border-white/10 bg-[#120d18]"
      }`}
    >
      <CardHeader className="border-b border-white/10">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-fuchsia-200/70">
              Etapa {step + 1}
            </p>
            <CardTitle className="text-lg text-white">{title}</CardTitle>
            <CardDescription className="text-white/50">{description}</CardDescription>
          </div>
          {error ? (
            <Badge variant="outline" className="border-amber-300/20 bg-amber-300/10 text-amber-100">
              Revisar
            </Badge>
          ) : (
            <Badge variant="outline" className="border-emerald-300/15 bg-emerald-300/10 text-emerald-100">
              OK
            </Badge>
          )}
        </div>
        {error ? <p className="text-xs text-amber-100/80">{error}</p> : null}
      </CardHeader>
      <CardContent className="space-y-5 p-5">{children}</CardContent>
    </Card>
  );
}

function FieldGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-4 md:grid-cols-2">{children}</div>;
}

function FieldShell({
  label,
  children,
  full = false,
}: {
  label: string;
  children: React.ReactNode;
  full?: boolean;
}) {
  return (
    <label className={`space-y-2 ${full ? "md:col-span-2" : ""}`}>
      <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/45">{label}</span>
      {children}
    </label>
  );
}

export function ContractBuilderWizard({
  builderPayload,
  builderStep,
  editingBuilderContract,
  clientes,
  builderSummary,
  builderProgress,
  builderStatusLabel,
  builderRemoteAutosaveState,
  workingBuilderPayload,
  mobileSummaryOpen,
  selectedItemsCount,
  builderClientExtras,
  syncingClientExtras,
  shouldReduceMotion,
  onStepChange,
  onReset,
  onMobileSummaryToggle,
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
  const saveLabel = editingBuilderContract ? "Atualizar contrato" : "Salvar rascunho";

  return (
    <div className="space-y-6">
      <motion.section
        initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="overflow-hidden rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(123,31,162,0.28),transparent_24%),radial-gradient(circle_at_top_right,rgba(232,51,74,0.18),transparent_26%),linear-gradient(135deg,rgba(13,9,20,0.98),rgba(23,10,28,0.96),rgba(44,12,34,0.92))] shadow-[0_32px_80px_rgba(8,4,16,0.42)]"
      >
        <div className="border-b border-white/10 px-6 py-5 md:px-8">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="border-white/15 bg-white/10 text-white/80">
                  Contratos NovaesWeb
                </Badge>
                <Badge variant="outline" className={getContractStatusBadgeClass(contractStatus)}>
                  {getContractStatusLabel(contractStatus)}
                </Badge>
                {editingBuilderContract ? (
                  <Badge variant="outline" className="border-cyan-300/20 bg-cyan-300/10 text-cyan-100">
                    Editando cofre ativo
                  </Badge>
                ) : null}
              </div>
              <div>
                <h2
                  className="text-3xl font-semibold leading-tight text-white"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  Editor dinâmico de contrato
                </h2>
                <p className="mt-2 max-w-3xl text-sm leading-relaxed text-white/60">
                  Use o cliente, o plano e os extras como fonte do documento. A prévia à direita substitui os
                  placeholders automaticamente e mantém o contrato pronto para envio, assinatura, impressão e PDF.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="outline"
                className="border-white/10 bg-white/5 text-white hover:bg-white/10"
                onClick={() => void onSaveAndExit()}
                disabled={isPersisting}
              >
                <Save className="mr-2 h-4 w-4" />
                Salvar e voltar
              </Button>
              <Button
                type="button"
                className="border-0 text-white"
                style={{ background: "linear-gradient(135deg, #7b1fa2, #e8334a, #c2185b)" }}
                onClick={() => void onSave()}
                disabled={isPersisting}
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
                disabled={!onSendCurrent || isPersisting}
              >
                <Send className="mr-2 h-4 w-4" />
                Marcar como enviado
              </Button>
              <Button
                type="button"
                variant="outline"
                className="border-white/10 bg-white/5 text-white hover:bg-white/10"
                onClick={() => void onMarkAsSigned?.()}
                disabled={!onMarkAsSigned || isPersisting}
              >
                <FileSignature className="mr-2 h-4 w-4" />
                Marcar como assinado
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-6 px-6 py-6 md:px-8">
          <div className="grid gap-3 md:grid-cols-5">
            <SummaryPill label="Cliente" value={workingBuilderPayload.contractante.nome || "Selecione um cliente"} />
            <SummaryPill label="Plano" value={selectedPlan?.title || "Plano não definido"} />
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
                  {selectedItemsCount} itens
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

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)]">
        <div className="space-y-6">
          <SectionCard
            title="Cliente e dados automáticos"
            description="Selecione o cliente e ajuste apenas o que faltar no contrato."
            step={0}
            active={builderStep === 0}
            error={getStepError(0)}
          >
            <FieldShell label="Cliente" full>
              <select
                value={workingBuilderPayload.clienteId}
                onChange={(event) => void onClientChange(event.target.value)}
                className="h-11 w-full rounded-2xl border border-white/10 bg-black/30 px-4 text-sm text-white outline-none transition focus:border-fuchsia-300/30"
              >
                <option value="">Selecione um cliente</option>
                {clientes.map((cliente) => (
                  <option key={cliente.id} value={cliente.id} className="bg-[#120d18] text-white">
                    {cliente.nome} {cliente.nome_empresa ? `• ${cliente.nome_empresa}` : ""}
                  </option>
                ))}
              </select>
            </FieldShell>

            <FieldGrid>
              <FieldShell label="Nome completo">
                <Input
                  value={workingBuilderPayload.contractante.nome}
                  onChange={(event) => onUpdateContractante("nome", event.target.value)}
                  className="border-white/10 bg-black/30 text-white"
                />
              </FieldShell>
              <FieldShell label="Empresa">
                <Input
                  value={workingBuilderPayload.contractante.nomeEmpresa || ""}
                  onChange={(event) => onUpdateContractante("nomeEmpresa", event.target.value)}
                  className="border-white/10 bg-black/30 text-white"
                />
              </FieldShell>
              <FieldShell label="CPF / CNPJ">
                <Input
                  value={workingBuilderPayload.contractante.documento}
                  onChange={(event) => onUpdateContractante("documento", event.target.value)}
                  className="border-white/10 bg-black/30 text-white"
                />
              </FieldShell>
              <FieldShell label="RG">
                <Input
                  value={workingBuilderPayload.contractante.rg || ""}
                  onChange={(event) => onUpdateContractante("rg", event.target.value)}
                  className="border-white/10 bg-black/30 text-white"
                />
              </FieldShell>
              <FieldShell label="Telefone">
                <Input
                  value={workingBuilderPayload.contractante.telefone || ""}
                  onChange={(event) => onUpdateContractante("telefone", event.target.value)}
                  className="border-white/10 bg-black/30 text-white"
                />
              </FieldShell>
              <FieldShell label="WhatsApp">
                <Input
                  value={workingBuilderPayload.contractante.whatsapp || ""}
                  onChange={(event) => onUpdateContractante("whatsapp", event.target.value)}
                  className="border-white/10 bg-black/30 text-white"
                />
              </FieldShell>
              <FieldShell label="E-mail">
                <Input
                  type="email"
                  value={workingBuilderPayload.contractante.email || ""}
                  onChange={(event) => onUpdateContractante("email", event.target.value)}
                  className="border-white/10 bg-black/30 text-white"
                />
              </FieldShell>
              <FieldShell label="Data de nascimento">
                <Input
                  type="date"
                  value={workingBuilderPayload.contractante.dataNascimento || ""}
                  onChange={(event) => onUpdateContractante("dataNascimento", event.target.value)}
                  className="border-white/10 bg-black/30 text-white"
                />
              </FieldShell>
              <FieldShell label="Endereço" full>
                <Input
                  value={workingBuilderPayload.contractante.endereco || ""}
                  onChange={(event) => onUpdateContractante("endereco", event.target.value)}
                  className="border-white/10 bg-black/30 text-white"
                />
              </FieldShell>
              <FieldShell label="Cidade">
                <Input
                  value={workingBuilderPayload.contractante.cidade || ""}
                  onChange={(event) => onUpdateContractante("cidade", event.target.value)}
                  className="border-white/10 bg-black/30 text-white"
                />
              </FieldShell>
              <FieldShell label="Estado">
                <Input
                  value={workingBuilderPayload.contractante.estado || ""}
                  onChange={(event) => onUpdateContractante("estado", event.target.value)}
                  className="border-white/10 bg-black/30 text-white"
                />
              </FieldShell>
            </FieldGrid>
          </SectionCard>

          <SectionCard
            title="Contrato e datas"
            description="Campos centrais do documento, status operacional e observações comerciais."
            step={1}
            active={builderStep === 1}
            error={getStepError(1)}
          >
            <FieldGrid>
              <FieldShell label="Número do contrato">
                <Input
                  value={workingBuilderPayload.contractNumber}
                  onChange={(event) => onUpdateTextField("contractNumber", event.target.value)}
                  className="border-white/10 bg-black/30 text-white"
                />
              </FieldShell>
              <FieldShell label="Status">
                <select
                  value={workingBuilderPayload.status}
                  onChange={(event) => onUpdateTextField("status", event.target.value)}
                  className="h-11 w-full rounded-2xl border border-white/10 bg-black/30 px-4 text-sm text-white outline-none transition focus:border-fuchsia-300/30"
                >
                  {CONTRACT_STATUS_OPTIONS.map((status) => (
                    <option key={status.value} value={status.value} className="bg-[#120d18] text-white">
                      {status.label}
                    </option>
                  ))}
                </select>
              </FieldShell>
              <FieldShell label="Data de emissão">
                <Input
                  type="date"
                  value={workingBuilderPayload.issueDate}
                  onChange={(event) => onUpdateTextField("issueDate", event.target.value)}
                  className="border-white/10 bg-black/30 text-white"
                />
              </FieldShell>
              <FieldShell label="Data de início">
                <Input
                  type="date"
                  value={workingBuilderPayload.startDate}
                  onChange={(event) => onUpdateTextField("startDate", event.target.value)}
                  className="border-white/10 bg-black/30 text-white"
                />
              </FieldShell>
              <FieldShell label="Vencimento">
                <Input
                  type="date"
                  value={workingBuilderPayload.dueDate}
                  onChange={(event) => onUpdateTextField("dueDate", event.target.value)}
                  className="border-white/10 bg-black/30 text-white"
                />
              </FieldShell>
              <FieldShell label="Prazo (dias)">
                <Input
                  value={workingBuilderPayload.prazoDias}
                  onChange={(event) => onUpdateTextField("prazoDias", event.target.value)}
                  className="border-white/10 bg-black/30 text-white"
                />
              </FieldShell>
              <FieldShell label="Forma de pagamento" full>
                <Input
                  value={workingBuilderPayload.formaPagamento}
                  onChange={(event) => onUpdateTextField("formaPagamento", event.target.value)}
                  className="border-white/10 bg-black/30 text-white"
                />
              </FieldShell>
              <FieldShell label="Número de revisões">
                <Input
                  value={workingBuilderPayload.numeroRevisoes}
                  onChange={(event) => onUpdateTextField("numeroRevisoes", event.target.value)}
                  className="border-white/10 bg-black/30 text-white"
                />
              </FieldShell>
              <FieldShell label="Valor de revisão">
                <Input
                  value={workingBuilderPayload.valorRevisao}
                  onChange={(event) => onUpdateTextField("valorRevisao", event.target.value)}
                  className="border-white/10 bg-black/30 text-white"
                />
              </FieldShell>
              <FieldShell label="Prazo de suporte" full>
                <Textarea
                  value={workingBuilderPayload.prazoSuporte}
                  onChange={(event) => onUpdateTextField("prazoSuporte", event.target.value)}
                  className="min-h-[96px] border-white/10 bg-black/30 text-white"
                />
              </FieldShell>
              <FieldShell label="Escopo principal" full>
                <Textarea
                  value={workingBuilderPayload.customScope}
                  onChange={(event) => onUpdateTextField("customScope", event.target.value)}
                  className="min-h-[100px] border-white/10 bg-black/30 text-white"
                  placeholder="Descreva o escopo principal do contrato."
                />
              </FieldShell>
              <FieldShell label="Observações comerciais" full>
                <Textarea
                  value={workingBuilderPayload.observacoesComerciais}
                  onChange={(event) => onUpdateTextField("observacoesComerciais", event.target.value)}
                  className="min-h-[120px] border-white/10 bg-black/30 text-white"
                />
              </FieldShell>
              <FieldShell label="Escopo e exclusões" full>
                <Textarea
                  value={workingBuilderPayload.escopoExclusoes}
                  onChange={(event) => onUpdateTextField("escopoExclusoes", event.target.value)}
                  className="min-h-[120px] border-white/10 bg-black/30 text-white"
                />
              </FieldShell>
            </FieldGrid>
          </SectionCard>

          <SectionCard
            title="Plano e valores"
            description="Escolha o plano base e deixe o valor total ser recalculado com os extras."
            step={2}
            active={builderStep === 2}
            error={getStepError(2)}
          >
            <div className="grid gap-4 lg:grid-cols-3">
              {PUBLIC_PLAN_CATALOG.map((plan) => {
                const isSelected = workingBuilderPayload.primaryPlanId === plan.id;
                return (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => onPrimaryPlanChange(plan.id)}
                    className={`rounded-[24px] border p-4 text-left transition-all ${
                      isSelected
                        ? "border-fuchsia-300/20 bg-[linear-gradient(135deg,rgba(123,31,162,0.22),rgba(232,51,74,0.15))] shadow-[0_20px_40px_rgba(17,6,26,0.18)]"
                        : "border-white/10 bg-white/[0.03] hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/35">{plan.tag}</p>
                        <p className="mt-2 text-xl font-semibold text-white">{plan.title}</p>
                      </div>
                      {plan.popular ? (
                        <Badge variant="outline" className="border-amber-300/20 bg-amber-300/10 text-amber-100">
                          Mais pedido
                        </Badge>
                      ) : null}
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-white/60">{plan.description}</p>
                    <div className="mt-4 space-y-1">
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/35">{plan.priceLabel}</p>
                      <p className="text-lg font-semibold text-white">{formatCurrencyBRL(plan.setupPrice)}</p>
                      <p className="text-xs text-white/45">{plan.priceSub}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            <FieldGrid>
              <FieldShell label="Valor base">
                <Input
                  type="number"
                  step="0.01"
                  value={workingBuilderPayload.pricing.baseValue}
                  onChange={(event) => onPricingChange("baseValue", event.target.value)}
                  onBlur={() =>
                    onMoneyDraftBlur(
                      buildPricingMoneyDraftKey("baseValue"),
                      workingBuilderPayload.pricing.baseValue,
                    )
                  }
                  className="border-white/10 bg-black/30 text-white"
                />
              </FieldShell>
              <FieldShell label="Entrada">
                <Input
                  type="number"
                  step="0.01"
                  value={workingBuilderPayload.pricing.entryValue}
                  onChange={(event) => onPricingChange("entryValue", event.target.value)}
                  onBlur={() =>
                    onMoneyDraftBlur(
                      buildPricingMoneyDraftKey("entryValue"),
                      workingBuilderPayload.pricing.entryValue,
                    )
                  }
                  className="border-white/10 bg-black/30 text-white"
                />
              </FieldShell>
            </FieldGrid>

            <div className="grid gap-3 md:grid-cols-3">
              <SummaryPill label="Valor base" value={formatCurrencyBRL(workingBuilderPayload.pricing.baseValue)} />
              <SummaryPill label="Extras" value={formatCurrencyBRL(workingBuilderPayload.pricing.extrasTotal)} />
              <SummaryPill
                label="Total do contrato"
                value={formatCurrencyBRL(workingBuilderPayload.pricing.totalValue)}
                accent
              />
            </div>
          </SectionCard>

          <SectionCard
            title="Extras vinculados ao cliente"
            description="Os extras ativos do cliente entram automaticamente no contrato e podem receber cláusula própria."
            step={3}
            active={builderStep === 3}
            error={getStepError(3)}
          >
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
              <div>
                <p className="text-sm font-semibold text-white">Extras sincronizados</p>
                <p className="mt-1 text-xs text-white/50">
                  {syncingClientExtras
                    ? "Atualizando extras do cliente..."
                    : `${builderClientExtras.length} item(ns) carregado(s) do cliente selecionado.`}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                className="border-white/10 bg-white/5 text-white hover:bg-white/10"
                onClick={() => void onRefreshExtras()}
                disabled={syncingClientExtras || !workingBuilderPayload.clienteId}
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${syncingClientExtras ? "animate-spin" : ""}`} />
                Sincronizar extras
              </Button>
            </div>

            <div className="space-y-4">
              {workingBuilderPayload.clientExtrasSnapshot.length === 0 ? (
                <div className="rounded-[24px] border border-dashed border-white/10 bg-black/10 px-5 py-8 text-center">
                  <UserRound className="mx-auto h-8 w-8 text-white/25" />
                  <p className="mt-3 text-sm text-white/60">
                    Este cliente ainda não possui extras ativos vinculados.
                  </p>
                </div>
              ) : (
                workingBuilderPayload.clientExtrasSnapshot.map((extra) => (
                  <div
                    key={extra.id}
                    className="rounded-[28px] border border-white/10 bg-[linear-gradient(145deg,rgba(123,31,162,0.08),rgba(255,255,255,0.02))] p-5"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <label className="inline-flex items-center gap-2 text-sm font-semibold text-white">
                            <input
                              type="checkbox"
                              checked={extra.active !== false}
                              onChange={(event) => onToggleExtra(extra.id, event.target.checked)}
                              className="h-4 w-4 rounded border-white/20 bg-black/30"
                            />
                            {extra.name}
                          </label>
                          <Badge
                            variant="outline"
                            className={
                              extra.active !== false
                                ? "border-emerald-300/20 bg-emerald-300/10 text-emerald-100"
                                : "border-white/10 bg-white/[0.06] text-white/55"
                            }
                          >
                            {extra.active !== false ? "Ativo" : "Desligado"}
                          </Badge>
                        </div>
                        <p className="text-sm text-white/55">{extra.description}</p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white">
                        {describeClientExtraPricing(extra)}
                      </div>
                    </div>

                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                      <FieldShell label="Nome do extra">
                        <Input
                          value={extra.name}
                          onChange={(event) => onExtraFieldChange(extra.id, "name", event.target.value)}
                          className="border-white/10 bg-black/30 text-white"
                        />
                      </FieldShell>
                      <FieldShell label="Valor">
                        <Input
                          type="number"
                          step="0.01"
                          value={extra.setupPrice}
                          onChange={(event) => onExtraFieldChange(extra.id, "setupPrice", event.target.value)}
                          className="border-white/10 bg-black/30 text-white"
                        />
                      </FieldShell>
                      <FieldShell label="Descrição" full>
                        <Textarea
                          value={extra.description}
                          onChange={(event) => onExtraFieldChange(extra.id, "description", event.target.value)}
                          className="min-h-[92px] border-white/10 bg-black/30 text-white"
                        />
                      </FieldShell>
                      <FieldShell label="Cláusula personalizada" full>
                        <Textarea
                          value={extra.clause}
                          onChange={(event) => onExtraFieldChange(extra.id, "clause", event.target.value)}
                          className="min-h-[110px] border-white/10 bg-black/30 text-white"
                        />
                      </FieldShell>
                    </div>
                  </div>
                ))
              )}
            </div>
          </SectionCard>
        </div>

        <div className="space-y-6">
          <div className="xl:sticky xl:top-6 space-y-6">
            <BuilderLiveSummary
              summary={builderSummary}
              selectedCount={selectedItemsCount}
              syncState={builderRemoteAutosaveState}
              contractStatus={workingBuilderPayload.status}
              contractDates={{
                dataEnvio: editingBuilderContract?.data_envio,
                dataVisualizacao: editingBuilderContract?.data_visualizacao,
                dataAssinatura: editingBuilderContract?.data_assinatura,
                onboardingStartedAt: editingBuilderContract?.onboarding_started_at,
                pedidoId: editingBuilderContract?.pedido_id,
                requiresResign: editingBuilderContract?.requer_reassinatura,
                resignReason: editingBuilderContract?.reassinatura_motivo,
              }}
            />

            <Card className="overflow-hidden border-white/10 bg-[#120d18]">
              <CardHeader className="border-b border-white/10">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-white">
                      <Sparkles className="h-4 w-4 text-fuchsia-200" />
                      Prévia dinâmica do contrato
                    </CardTitle>
                    <CardDescription className="text-white/50">
                      O documento substitui os placeholders automaticamente em tempo real.
                    </CardDescription>
                  </div>
                  {editingBuilderContract ? (
                    <Button
                      type="button"
                      variant="outline"
                      className="border-white/10 bg-white/5 text-white hover:bg-white/10"
                      onClick={() => onPreview(editingBuilderContract)}
                    >
                      Abrir drawer
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  ) : null}
                </div>
              </CardHeader>
              <CardContent className="space-y-4 p-4">
                {builderPrepared ? (
                  <BuilderPreviewDocument
                    title={builderPrepared.title}
                    body={builderPrepared.body}
                    summary={builderSummary}
                  />
                ) : (
                  <div className="rounded-[24px] border border-amber-300/20 bg-amber-300/10 p-5">
                    <p className="text-sm font-semibold text-white">Prévia indisponível</p>
                    <p className="mt-2 text-sm text-amber-100/80">
                      {builderPreparedError || "Complete os dados mínimos do contrato para renderizar a prévia."}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                className="border-white/10 bg-white/5 text-white hover:bg-white/10"
                onClick={onReset}
              >
                Novo contrato
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="md:hidden">
        <Button
          type="button"
          variant="outline"
          className="w-full border-white/10 bg-white/5 text-white hover:bg-white/10"
          onClick={onMobileSummaryToggle}
        >
          {mobileSummaryOpen ? "Fechar resumo móvel" : "Abrir resumo móvel"}
        </Button>
      </div>

      {mobileSummaryOpen ? (
        <div className="md:hidden">
          <BuilderLiveSummary
            summary={builderSummary}
            selectedCount={selectedItemsCount}
            syncState={builderRemoteAutosaveState}
            contractStatus={workingBuilderPayload.status}
          />
        </div>
      ) : null}
    </div>
  );
}
