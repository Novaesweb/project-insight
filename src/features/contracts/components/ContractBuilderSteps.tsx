import { useMemo, useState, type ReactNode } from "react";
import { AlertTriangle, ArrowRight, RefreshCw, Search, Sparkles, UserRound } from "lucide-react";

import { BuilderLiveSummary } from "@/components/contracts/BuilderLiveSummary";
import { BuilderPreviewDocument } from "@/components/contracts/BuilderPreviewDocument";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CONTRACT_STATUS_OPTIONS, type Cliente, type Contrato } from "@/features/contracts/types";
import {
  formatCurrencyBRL,
  type BuilderPrimaryPlanId,
  type ContractBuilderClientExtraSnapshot,
  type ContractBuilderPayload,
  type ContractProposalSummary,
} from "@/lib/contract-builder";
import { getContractStatusBadgeClass, getContractStatusLabel } from "@/lib/contract-status";
import { PUBLIC_PLAN_CATALOG } from "@/lib/public-plans";

type BuilderPreparedContract = {
  normalizedPayload: ContractBuilderPayload;
  title: string;
  body: string;
  description: string;
  value: number;
} | null;

export function SummaryPill({
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

export function StepPanel({
  title,
  description,
  stepLabel,
  error,
  children,
}: {
  title: string;
  description: string;
  stepLabel: string;
  error?: string | null;
  children: ReactNode;
}) {
  return (
    <Card className="overflow-hidden border-white/10 bg-[#120d18]">
      <CardHeader className="border-b border-white/10">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-fuchsia-200/70">{stepLabel}</p>
            <CardTitle className="text-2xl text-white">{title}</CardTitle>
            <CardDescription className="max-w-3xl text-white/55">{description}</CardDescription>
          </div>
          <Badge
            variant="outline"
            className={
              error
                ? "border-amber-300/20 bg-amber-300/10 text-amber-100"
                : "border-emerald-300/15 bg-emerald-300/10 text-emerald-100"
            }
          >
            {error ? "Revisar" : "Pronto"}
          </Badge>
        </div>
        {error ? (
          <div className="rounded-2xl border border-amber-300/20 bg-amber-300/10 px-4 py-3 text-sm text-amber-100/85">
            {error}
          </div>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-5 p-5">{children}</CardContent>
    </Card>
  );
}

export function FieldGrid({ children }: { children: ReactNode }) {
  return <div className="grid gap-4 md:grid-cols-2">{children}</div>;
}

export function FieldShell({
  label,
  children,
  full = false,
}: {
  label: string;
  children: ReactNode;
  full?: boolean;
}) {
  return (
    <label className={`space-y-2 ${full ? "md:col-span-2" : ""}`}>
      <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/45">{label}</span>
      {children}
    </label>
  );
}

export function ContractStepCliente({
  clientes,
  payload,
  error,
  onClientChange,
  onUpdateContractante,
}: {
  clientes: Cliente[];
  payload: ContractBuilderPayload;
  error?: string | null;
  onClientChange: (clientId: string) => void | Promise<void>;
  onUpdateContractante: (field: string, value: string) => void;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const filteredClientes = useMemo(() => {
    const normalized = searchTerm.trim().toLowerCase();
    if (!normalized) return clientes;

    return clientes.filter((cliente) =>
      [
        cliente.nome,
        cliente.nome_empresa,
        cliente.email,
        cliente.documento,
        cliente.telefone,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalized)),
    );
  }, [clientes, searchTerm]);
  const selectedClientExists = !payload.clienteId || clientes.some((cliente) => cliente.id === payload.clienteId);

  return (
    <StepPanel
      title="Cliente e dados automaticos"
      description="Comece pelo cliente. O sistema preenche os dados existentes e voce ajusta apenas o que estiver faltando."
      stepLabel="Etapa 1"
      error={error}
    >
      {!selectedClientExists ? (
        <Alert className="border-amber-300/20 bg-amber-300/10 text-amber-100 [&>svg]:text-amber-200">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Cliente nao encontrado</AlertTitle>
          <AlertDescription>
            O contrato manteve os dados atuais, mas o cliente vinculado nao existe mais no cadastro ativo. Escolha outro cliente ou revise os campos manualmente.
          </AlertDescription>
        </Alert>
      ) : null}

      <FieldGrid>
        <FieldShell label="Buscar cliente" full>
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
            <Input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Busque por nome, empresa, documento ou e-mail"
              className="border-white/10 bg-black/30 pl-11 text-white"
            />
          </div>
        </FieldShell>
        <FieldShell label="Cliente" full>
          <select
            value={payload.clienteId}
            onChange={(event) => void onClientChange(event.target.value)}
            className="h-11 w-full rounded-2xl border border-white/10 bg-black/30 px-4 text-sm text-white outline-none transition focus:border-fuchsia-300/30"
          >
            <option value="">Selecione um cliente</option>
            {filteredClientes.map((cliente) => (
              <option key={cliente.id} value={cliente.id} className="bg-[#120d18] text-white">
                {cliente.nome} {cliente.nome_empresa ? `- ${cliente.nome_empresa}` : ""}
              </option>
            ))}
          </select>
        </FieldShell>
      </FieldGrid>

      <FieldGrid>
        <FieldShell label="Nome completo">
          <Input
            value={payload.contractante.nome}
            onChange={(event) => onUpdateContractante("nome", event.target.value)}
            className="border-white/10 bg-black/30 text-white"
          />
        </FieldShell>
        <FieldShell label="Empresa">
          <Input
            value={payload.contractante.nomeEmpresa || ""}
            onChange={(event) => onUpdateContractante("nomeEmpresa", event.target.value)}
            className="border-white/10 bg-black/30 text-white"
          />
        </FieldShell>
        <FieldShell label="CPF / CNPJ">
          <Input
            value={payload.contractante.documento}
            onChange={(event) => onUpdateContractante("documento", event.target.value)}
            className="border-white/10 bg-black/30 text-white"
          />
        </FieldShell>
        <FieldShell label="RG">
          <Input
            value={payload.contractante.rg || ""}
            onChange={(event) => onUpdateContractante("rg", event.target.value)}
            className="border-white/10 bg-black/30 text-white"
          />
        </FieldShell>
        <FieldShell label="Telefone">
          <Input
            value={payload.contractante.telefone || ""}
            onChange={(event) => onUpdateContractante("telefone", event.target.value)}
            className="border-white/10 bg-black/30 text-white"
          />
        </FieldShell>
        <FieldShell label="WhatsApp">
          <Input
            value={payload.contractante.whatsapp || ""}
            onChange={(event) => onUpdateContractante("whatsapp", event.target.value)}
            className="border-white/10 bg-black/30 text-white"
          />
        </FieldShell>
        <FieldShell label="E-mail">
          <Input
            type="email"
            value={payload.contractante.email || ""}
            onChange={(event) => onUpdateContractante("email", event.target.value)}
            className="border-white/10 bg-black/30 text-white"
          />
        </FieldShell>
        <FieldShell label="Data de nascimento">
          <Input
            type="date"
            value={payload.contractante.dataNascimento || ""}
            onChange={(event) => onUpdateContractante("dataNascimento", event.target.value)}
            className="border-white/10 bg-black/30 text-white"
          />
        </FieldShell>
        <FieldShell label="Endereco" full>
          <Input
            value={payload.contractante.endereco || ""}
            onChange={(event) => onUpdateContractante("endereco", event.target.value)}
            className="border-white/10 bg-black/30 text-white"
          />
        </FieldShell>
        <FieldShell label="Cidade">
          <Input
            value={payload.contractante.cidade || ""}
            onChange={(event) => onUpdateContractante("cidade", event.target.value)}
            className="border-white/10 bg-black/30 text-white"
          />
        </FieldShell>
        <FieldShell label="Estado">
          <Input
            value={payload.contractante.estado || ""}
            onChange={(event) => onUpdateContractante("estado", event.target.value)}
            className="border-white/10 bg-black/30 text-white"
          />
        </FieldShell>
      </FieldGrid>
    </StepPanel>
  );
}

export function ContractStepDados({
  payload,
  error,
  onUpdateTextField,
}: {
  payload: ContractBuilderPayload;
  error?: string | null;
  onUpdateTextField: (field: string, value: string) => void;
}) {
  return (
    <StepPanel
      title="Dados do contrato"
      description="Aqui ficam os dados operacionais do documento, o status atual e as observacoes comerciais."
      stepLabel="Etapa 2"
      error={error}
    >
      <FieldGrid>
        <FieldShell label="Numero do contrato">
          <Input
            value={payload.contractNumber}
            onChange={(event) => onUpdateTextField("contractNumber", event.target.value)}
            className="border-white/10 bg-black/30 text-white"
          />
        </FieldShell>
        <FieldShell label="Status">
          <select
            value={payload.status}
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
        <FieldShell label="Data de emissao">
          <Input
            type="date"
            value={payload.issueDate}
            onChange={(event) => onUpdateTextField("issueDate", event.target.value)}
            className="border-white/10 bg-black/30 text-white"
          />
        </FieldShell>
        <FieldShell label="Data de inicio">
          <Input
            type="date"
            value={payload.startDate}
            onChange={(event) => onUpdateTextField("startDate", event.target.value)}
            className="border-white/10 bg-black/30 text-white"
          />
        </FieldShell>
        <FieldShell label="Vencimento">
          <Input
            type="date"
            value={payload.dueDate}
            onChange={(event) => onUpdateTextField("dueDate", event.target.value)}
            className="border-white/10 bg-black/30 text-white"
          />
        </FieldShell>
        <FieldShell label="Prazo (dias)">
          <Input
            value={payload.prazoDias}
            onChange={(event) => onUpdateTextField("prazoDias", event.target.value)}
            className="border-white/10 bg-black/30 text-white"
          />
        </FieldShell>
        <FieldShell label="Forma de pagamento" full>
          <Input
            value={payload.formaPagamento}
            onChange={(event) => onUpdateTextField("formaPagamento", event.target.value)}
            className="border-white/10 bg-black/30 text-white"
          />
        </FieldShell>
        <FieldShell label="Numero de revisoes">
          <Input
            value={payload.numeroRevisoes}
            onChange={(event) => onUpdateTextField("numeroRevisoes", event.target.value)}
            className="border-white/10 bg-black/30 text-white"
          />
        </FieldShell>
        <FieldShell label="Valor de revisao">
          <Input
            value={payload.valorRevisao}
            onChange={(event) => onUpdateTextField("valorRevisao", event.target.value)}
            className="border-white/10 bg-black/30 text-white"
          />
        </FieldShell>
        <FieldShell label="Prazo de suporte" full>
          <Textarea
            value={payload.prazoSuporte}
            onChange={(event) => onUpdateTextField("prazoSuporte", event.target.value)}
            className="min-h-[96px] border-white/10 bg-black/30 text-white"
          />
        </FieldShell>
        <FieldShell label="Escopo principal" full>
          <Textarea
            value={payload.customScope}
            onChange={(event) => onUpdateTextField("customScope", event.target.value)}
            className="min-h-[100px] border-white/10 bg-black/30 text-white"
            placeholder="Descreva o escopo principal do contrato."
          />
        </FieldShell>
        <FieldShell label="Observacoes comerciais" full>
          <Textarea
            value={payload.observacoesComerciais}
            onChange={(event) => onUpdateTextField("observacoesComerciais", event.target.value)}
            className="min-h-[120px] border-white/10 bg-black/30 text-white"
          />
        </FieldShell>
        <FieldShell label="Escopo e exclusoes" full>
          <Textarea
            value={payload.escopoExclusoes}
            onChange={(event) => onUpdateTextField("escopoExclusoes", event.target.value)}
            className="min-h-[120px] border-white/10 bg-black/30 text-white"
          />
        </FieldShell>
      </FieldGrid>
    </StepPanel>
  );
}

export function ContractStepPlano({
  payload,
  error,
  onPrimaryPlanChange,
  onPricingChange,
  onMoneyDraftBlur,
  buildPricingMoneyDraftKey,
}: {
  payload: ContractBuilderPayload;
  error?: string | null;
  onPrimaryPlanChange: (planId: BuilderPrimaryPlanId) => void;
  onPricingChange: (field: string, value: string) => void;
  onMoneyDraftBlur: (key: string, value: number) => void;
  buildPricingMoneyDraftKey: (field: string) => string;
}) {
  return (
    <StepPanel
      title="Plano e valores"
      description="Escolha o plano principal, revise o valor base e deixe o total ser recalculado automaticamente."
      stepLabel="Etapa 3"
      error={error}
    >
      <div className="grid gap-4 lg:grid-cols-3">
        {PUBLIC_PLAN_CATALOG.map((plan) => {
          const isSelected = payload.primaryPlanId === plan.id;
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
            value={payload.pricing.baseValue}
            onChange={(event) => onPricingChange("baseValue", event.target.value)}
            onBlur={() => onMoneyDraftBlur(buildPricingMoneyDraftKey("baseValue"), payload.pricing.baseValue)}
            className="border-white/10 bg-black/30 text-white"
          />
        </FieldShell>
        <FieldShell label="Entrada">
          <Input
            type="number"
            step="0.01"
            value={payload.pricing.entryValue}
            onChange={(event) => onPricingChange("entryValue", event.target.value)}
            onBlur={() => onMoneyDraftBlur(buildPricingMoneyDraftKey("entryValue"), payload.pricing.entryValue)}
            className="border-white/10 bg-black/30 text-white"
          />
        </FieldShell>
      </FieldGrid>

      <div className="grid gap-3 md:grid-cols-3">
        <SummaryPill label="Valor base" value={formatCurrencyBRL(payload.pricing.baseValue)} />
        <SummaryPill label="Extras" value={formatCurrencyBRL(payload.pricing.extrasTotal)} />
        <SummaryPill label="Total do contrato" value={formatCurrencyBRL(payload.pricing.totalValue)} accent />
      </div>
    </StepPanel>
  );
}

export function ContractStepExtras({
  payload,
  error,
  builderClientExtras,
  syncingClientExtras,
  describeClientExtraPricing,
  onRefreshExtras,
  onExtraFieldChange,
  onToggleExtra,
}: {
  payload: ContractBuilderPayload;
  error?: string | null;
  builderClientExtras: ContractBuilderClientExtraSnapshot[];
  syncingClientExtras: boolean;
  describeClientExtraPricing: (item: ContractBuilderClientExtraSnapshot) => string;
  onRefreshExtras: () => void | Promise<void>;
  onExtraFieldChange: (
    extraId: string,
    field: "name" | "description" | "clause" | "setupPrice",
    value: string,
  ) => void;
  onToggleExtra: (extraId: string, active: boolean) => void;
}) {
  return (
    <StepPanel
      title="Extras vinculados"
      description="Os extras do cliente entram aqui, podem ser ativados ou desativados e ganham clausula personalizada."
      stepLabel="Etapa 4"
      error={error}
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
          disabled={syncingClientExtras || !payload.clienteId}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${syncingClientExtras ? "animate-spin" : ""}`} />
          Sincronizar extras
        </Button>
      </div>

      <div className="space-y-4">
        {payload.clientExtrasSnapshot.length === 0 ? (
          <div className="rounded-[24px] border border-dashed border-white/10 bg-black/10 px-5 py-8 text-center">
            <UserRound className="mx-auto h-8 w-8 text-white/25" />
            <p className="mt-3 text-sm text-white/60">Este cliente ainda nao possui extras ativos vinculados.</p>
          </div>
        ) : (
          payload.clientExtrasSnapshot.map((extra) => (
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
                <FieldShell label="Descricao" full>
                  <Textarea
                    value={extra.description}
                    onChange={(event) => onExtraFieldChange(extra.id, "description", event.target.value)}
                    className="min-h-[92px] border-white/10 bg-black/30 text-white"
                  />
                </FieldShell>
                <FieldShell label="Clausula personalizada" full>
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
    </StepPanel>
  );
}

export function ContractStepPreview({
  payload,
  builderSummary,
  selectedItemsCount,
  builderRemoteAutosaveState,
  builderPrepared,
  builderPreparedError,
  editingBuilderContract,
  onPreview,
  onReset,
}: {
  payload: ContractBuilderPayload;
  builderSummary: ContractProposalSummary | null;
  selectedItemsCount: number;
  builderRemoteAutosaveState: "idle" | "saving" | "saved" | "error";
  builderPrepared: BuilderPreparedContract;
  builderPreparedError?: string | null;
  editingBuilderContract: Contrato | null;
  onPreview: (contrato: Contrato) => void;
  onReset: () => void;
}) {
  const contractStatus = editingBuilderContract?.status || payload.status;

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,0.86fr)_minmax(0,1.14fr)]">
      <div className="space-y-6 xl:sticky xl:top-6">
        <BuilderLiveSummary
          summary={builderSummary}
          selectedCount={selectedItemsCount}
          syncState={builderRemoteAutosaveState}
          contractStatus={payload.status}
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
            <CardTitle className="flex items-center gap-2 text-white">
              <Sparkles className="h-4 w-4 text-fuchsia-200" />
              Fechamento final
            </CardTitle>
            <CardDescription className="text-white/55">
              Revise status, valor total e o documento inteiro antes de salvar, enviar ou assinar.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 p-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/35">Status atual</p>
                <Badge variant="outline" className={`mt-3 ${getContractStatusBadgeClass(contractStatus)}`}>
                  {getContractStatusLabel(contractStatus)}
                </Badge>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/35">Valor total</p>
                <p className="mt-3 text-xl font-semibold text-white">{formatCurrencyBRL(payload.pricing.totalValue)}</p>
              </div>
            </div>

            {editingBuilderContract ? (
              <Button
                type="button"
                variant="outline"
                className="w-full border-white/10 bg-white/5 text-white hover:bg-white/10"
                onClick={() => onPreview(editingBuilderContract)}
              >
                Abrir drawer de historico
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : null}

            <Button
              type="button"
              variant="outline"
              className="w-full border-white/10 bg-white/5 text-white hover:bg-white/10"
              onClick={onReset}
            >
              Novo contrato
            </Button>
          </CardContent>
        </Card>
      </div>

      <StepPanel
        title="Preview final do contrato"
        description="Esta e a unica etapa com o documento completo. Aqui voce confere o resultado final antes de publicar."
        stepLabel="Etapa 5"
        error={builderPrepared ? null : builderPreparedError}
      >
        {builderPrepared ? (
          <BuilderPreviewDocument title={builderPrepared.title} body={builderPrepared.body} summary={builderSummary} />
        ) : (
          <div className="rounded-[24px] border border-amber-300/20 bg-amber-300/10 p-5">
            <p className="text-sm font-semibold text-white">Previa indisponivel</p>
            <p className="mt-2 text-sm text-amber-100/80">
              {builderPreparedError || "Complete os dados minimos do contrato para renderizar a previa."}
            </p>
          </div>
        )}
      </StepPanel>
    </div>
  );
}
