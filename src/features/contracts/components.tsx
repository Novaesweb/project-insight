import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ShieldCheck, Sparkles } from "lucide-react";

import { ContractSignaturePanel } from "@/components/contracts/ContractSignaturePanel";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  formatCurrencyBRL,
  parseMoneyInput,
  stripLegacySignaturePlaceholders,
  type ContractBuilderPricing,
  type ContractClauseExplanation,
  type ContractProposalSummary,
  type ContractSignatureSummary,
} from "@/lib/contract-builder";
import {
  CONTRACT_STATUS_ORDER,
  getContractStatusBadgeClass,
  getContractStatusInsight,
  getContractStatusLabel,
} from "@/lib/contract-status";

import { formatContractDateTime } from "./utils";

function ContractSummaryCard({
  title,
  eyebrow,
  lines,
}: {
  title: string;
  eyebrow: string;
  lines: string[];
}) {
  return (
    <Card className="bg-white/[0.03] border-white/10">
      <CardContent className="p-4 space-y-3">
        <div className="space-y-1">
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/35">{eyebrow}</p>
          <p className="text-base font-semibold text-white">{title}</p>
        </div>
        <div className="space-y-1.5 text-sm text-white/65">
          {lines.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function ContractClauseExplanationCard({
  item,
}: {
  item: ContractClauseExplanation;
}) {
  return (
    <Card className="bg-white/[0.03] border-white/10">
      <CardContent className="p-4 space-y-2">
        <div className="space-y-1">
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/35">Cláusula {item.number}</p>
          <p className="text-sm font-semibold text-white">{item.title}</p>
        </div>
        <p className="text-sm text-white/65 leading-relaxed">{item.explanation}</p>
      </CardContent>
    </Card>
  );
}

function AnimatedValue({
  value,
  format,
  className,
}: {
  value: number;
  format: (value: number) => string;
  className?: string;
}) {
  const shouldReduceMotion = useReducedMotion();
  const [displayValue, setDisplayValue] = useState(value);
  const previousValueRef = useRef(value);

  useEffect(() => {
    const from = previousValueRef.current;
    previousValueRef.current = value;

    if (shouldReduceMotion || Math.abs(from - value) < 0.01) {
      setDisplayValue(value);
      return;
    }

    const startedAt = performance.now();
    const duration = 320;
    let frameId = 0;

    const step = (now: number) => {
      const progress = Math.min((now - startedAt) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(from + (value - from) * eased);

      if (progress < 1) {
        frameId = requestAnimationFrame(step);
      }
    };

    frameId = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [shouldReduceMotion, value]);

  return <span className={className}>{format(displayValue)}</span>;
}

function SummaryMetric({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
      <p className="text-[10px] uppercase tracking-[0.2em] text-white/35">{label}</p>
      <AnimatedValue
        value={value}
        format={formatCurrencyBRL}
        className="mt-2 block text-lg font-semibold text-white"
      />
    </div>
  );
}

export function VersionComparisonCard({
  label,
  title,
  description,
  value,
  summary,
  createdAt,
}: {
  label: string;
  title: string;
  description?: string | null;
  value: number;
  summary: ContractProposalSummary | null;
  createdAt?: string | null;
}) {
  return (
    <Card className="bg-white/[0.03] border-white/10">
      <CardContent className="p-5 space-y-4">
        <div className="space-y-1">
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/35">{label}</p>
          <p className="text-base font-semibold text-white">{title}</p>
          {description && <p className="text-sm text-white/50 leading-relaxed">{description}</p>}
          <div className="flex items-center gap-2 flex-wrap text-xs text-white/45">
            <span>Valor: {formatCurrencyBRL(value)}</span>
            {createdAt && <span>• {formatContractDateTime(createdAt)}</span>}
          </div>
        </div>

        {summary ? (
          <div className="space-y-3 text-sm text-white/65">
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] text-white/35">Cliente</p>
              <p className="text-white">{summary.contractante.title}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] text-white/35">Plano</p>
              <p className="text-white">{summary.selectedPlan?.name || "Sem plano principal"}</p>
              {summary.selectedPlan && <p className="text-primary">{summary.selectedPlan.pricing}</p>}
            </div>
            {summary.customScope && (
              <div>
                <p className="text-[10px] uppercase tracking-[0.18em] text-white/35">Escopo</p>
                <p>{summary.customScope}</p>
              </div>
            )}
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] text-white/35">Itens contratados</p>
              <div className="space-y-1.5">
                {summary.selectedServices.length > 0 ? (
                  summary.selectedServices.slice(0, 6).map((item) => (
                    <div
                      key={`${item.name}-${item.pricing}`}
                      className="rounded-xl border border-white/10 bg-white/[0.02] p-3"
                    >
                      <p className="text-white">{item.name}</p>
                      <p className="text-xs text-primary mt-1">{item.pricing}</p>
                    </div>
                  ))
                ) : (
                  <p>Nenhum extra adicional selecionado.</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-white/45">Resumo comercial indisponível nesta versão.</p>
        )}
      </CardContent>
    </Card>
  );
}

export function BuilderPreviewDocument({
  title,
  body,
  summary,
  explanations = [],
  signatureSummary = null,
}: {
  title: string;
  body: string;
  summary: ContractProposalSummary | null;
  explanations?: ContractClauseExplanation[];
  signatureSummary?: ContractSignatureSummary | null;
}) {
  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-primary/20 bg-[radial-gradient(circle_at_top_left,rgba(194,24,91,0.34),transparent_32%),radial-gradient(circle_at_top_right,rgba(123,31,162,0.32),transparent_38%),linear-gradient(135deg,rgba(15,12,22,0.96),rgba(30,11,33,0.94),rgba(45,12,34,0.9))] shadow-[0_30px_70px_rgba(17,6,26,0.38)]">
        <CardContent className="relative overflow-hidden p-6 md:p-8">
          <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.35),transparent)]" />
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="border-white/15 bg-white/10 text-white/80">
                NovaesWeb
              </Badge>
              <Badge variant="outline" className="border-fuchsia-300/20 bg-fuchsia-300/10 text-fuchsia-100">
                Proposta premium
              </Badge>
              <Badge variant="outline" className="border-white/10 bg-white/[0.06] text-white/55">
                Experiência de assinatura centralizada
              </Badge>
            </div>
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_280px] xl:items-end">
              <div className="space-y-3">
                <h3 className="text-2xl font-semibold text-white leading-tight md:text-[2rem]">{title}</h3>
                <p className="max-w-3xl text-sm leading-relaxed text-white/65">
                  Estrutura comercial gerada no montador do contrato mestre, com escopo, condições financeiras,
                  cláusulas consolidadas e assinatura final preparada para leitura, aceite e impressão.
                </p>
              </div>
              {summary ? (
                <div className="rounded-[26px] border border-white/10 bg-white/[0.05] p-4 backdrop-blur-xl">
                  <p className="text-[10px] uppercase tracking-[0.22em] text-white/40">Painel executivo</p>
                  <div className="mt-4 space-y-3">
                    <div>
                      <p className="text-xs text-white/45">Cliente</p>
                      <p className="text-sm font-medium text-white">{summary.contractante.title}</p>
                    </div>
                    <div>
                      <p className="text-xs text-white/45">Comercial</p>
                      <p className="text-sm font-medium text-white">{summary.comercial.lines[0] || "Sem valor definido"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-white/45">Assinaturas</p>
                      <p className="text-sm font-medium text-white">Somente CONTRATANTE e CONTRATADA</p>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </CardContent>
      </Card>

      {summary && (
        <>
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <ContractSummaryCard
              title={summary.contractante.title}
              eyebrow={summary.contractante.eyebrow}
              lines={summary.contractante.lines}
            />
            <ContractSummaryCard
              title={summary.contratada.title}
              eyebrow={summary.contratada.eyebrow}
              lines={summary.contratada.lines}
            />
            <ContractSummaryCard title={summary.comercial.title} eyebrow={summary.comercial.eyebrow} lines={summary.comercial.lines} />
          </div>

          <Card className="glass-card border-[0.5px]">
            <CardHeader>
              <CardTitle className="text-sm text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" /> Plano e serviços contratados
              </CardTitle>
              <CardDescription className="text-xs text-white/40">
                O documento final exibe somente os itens efetivamente contratados.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {summary.selectedPlan && (
                <Card className="bg-white/[0.03] border-primary/20">
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="border-primary/20 bg-primary/10 text-primary">
                        Plano principal
                      </Badge>
                      <p className="text-base font-semibold text-white">{summary.selectedPlan.name}</p>
                    </div>
                    <p className="text-sm text-primary">{summary.selectedPlan.pricing}</p>
                    {summary.selectedPlan.description && (
                      <p className="text-sm text-white/60">{summary.selectedPlan.description}</p>
                    )}
                  </CardContent>
                </Card>
              )}

              {summary.customScope && (
                <Card className="bg-white/[0.03] border-white/10">
                  <CardContent className="p-4 space-y-2">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-white/35">Escopo customizado</p>
                    <p className="text-sm text-white/75 leading-relaxed">{summary.customScope}</p>
                  </CardContent>
                </Card>
              )}

              {summary.selectedServices.length > 0 && (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                  {summary.selectedServices.map((service) => (
                    <Card key={`${service.name}-${service.pricing}`} className="bg-white/[0.03] border-white/10">
                      <CardContent className="p-4 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          {service.highlight && (
                            <Badge variant="outline" className="border-white/10 text-white/55">
                              {service.highlight}
                            </Badge>
                          )}
                          <p className="text-sm font-semibold text-white">{service.name}</p>
                        </div>
                        <p className="text-sm text-primary">{service.pricing}</p>
                        {service.description && <p className="text-sm text-white/60">{service.description}</p>}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {summary.pricingBreakdown.length > 0 && (
                <Card className="bg-white/[0.03] border-white/10">
                  <CardContent className="p-4 space-y-2">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-white/35">Fechamento financeiro</p>
                    <div className="space-y-2 text-sm text-white/70">
                      {summary.pricingBreakdown.map((line) => (
                        <div key={line} className="rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2">
                          {line}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card className="bg-white/[0.03] border-white/10">
                <CardContent className="p-4 space-y-2">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-white/35">{summary.scopeNotice.title}</p>
                  <div className="space-y-2 text-sm text-white/70 leading-relaxed">
                    {summary.scopeNotice.lines.map((line) => (
                      <p key={line}>{line}</p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </>
      )}

      <Card className="glass-card border-[0.5px]">
        <CardContent className="p-0">
          <Accordion type="multiple" defaultValue={["contrato-explicado"]} className="w-full">
            <AccordionItem value="contrato-explicado">
              <AccordionTrigger className="px-6 py-5 text-sm text-white hover:no-underline">
                Contrato explicado em linguagem simples
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                  {explanations.map((item) => (
                    <ContractClauseExplanationCard key={`${item.number}-${item.title}`} item={item} />
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="corpo-contratual" className="border-b-0">
              <AccordionTrigger className="px-6 py-5 text-sm text-white hover:no-underline">
                Contrato mestre universal de prestação de serviços digitais NovaesWeb
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6">
                <div className="rounded-2xl bg-white text-black p-6 font-serif text-sm leading-relaxed whitespace-pre-wrap">
                  {stripLegacySignaturePlaceholders(body)}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      <ContractSignaturePanel summary={signatureSummary} variant="dark" />
    </div>
  );
}

export function ContractLifecycleTimeline({
  status,
  dataEnvio,
  dataVisualizacao,
  dataAssinatura,
}: {
  status: string;
  dataEnvio?: string | null;
  dataVisualizacao?: string | null;
  dataAssinatura?: string | null;
}) {
  const steps = [
    { id: "rascunho", label: "Rascunho", date: null },
    { id: "enviado", label: "Enviado", date: dataEnvio },
    { id: "visualizado", label: "Visualizado", date: dataVisualizacao },
    { id: "assinado", label: "Assinado", date: dataAssinatura },
  ];
  const activeIndex = Math.min(
    Math.max(CONTRACT_STATUS_ORDER.indexOf(status as (typeof CONTRACT_STATUS_ORDER)[number]), 0),
    steps.length - 1,
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[10px] uppercase tracking-[0.2em] text-white/35">Ciclo do contrato</p>
        <Badge variant="outline" className={getContractStatusBadgeClass(status)}>
          {getContractStatusLabel(status)}
        </Badge>
      </div>
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        {steps.map((step, index) => {
          const isActive = index <= activeIndex;
          const isCurrent = steps[activeIndex]?.id === step.id;

          return (
            <div
              key={step.id}
              className={`rounded-2xl border p-3 transition-all ${
                isCurrent
                  ? "border-fuchsia-300/25 bg-[linear-gradient(135deg,rgba(123,31,162,0.26),rgba(232,51,74,0.18),rgba(194,24,91,0.2))] shadow-[0_16px_32px_rgba(194,24,91,0.18)]"
                  : isActive
                    ? "border-emerald-300/20 bg-emerald-300/10"
                    : "border-white/10 bg-white/[0.03]"
              }`}
            >
              <p className="text-xs font-medium text-white">{step.label}</p>
              <p className="mt-1 text-[11px] text-white/45">
                {step.date ? formatContractDateTime(step.date) : isCurrent ? "Etapa atual" : "Pendente"}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function parseComercialSummaryLines(lines: string[]): Partial<Record<keyof ContractBuilderPricing, number>> {
  return lines.reduce<Partial<Record<keyof ContractBuilderPricing, number>>>((acc, line) => {
    const normalized = line.toLowerCase();
    const numericValue = parseMoneyInput(line);

    if (normalized.includes("subtotal da implantação")) acc.setupSubtotal = numericValue;
    if (normalized.includes("valor final da implantação") || normalized.includes("ativação total") || normalized.includes("total ativação")) {
      acc.finalSetupTotal = numericValue;
      acc.setupSubtotal = numericValue;
    }
    if (normalized.includes("desconto aplicado")) acc.discountAmount = numericValue;
    if (normalized.includes("entrada / sinal")) acc.entryValue = numericValue;
    if (normalized.includes("saldo na entrega")) acc.balanceValue = numericValue;
    if (normalized.includes("mensalidade contratada") || normalized.includes("total mensal")) acc.negotiatedMonthly = numericValue;
    return acc;
  }, {});
}

export function BuilderLiveSummary({
  summary,
  selectedCount,
  syncState,
  contractStatus,
  contractDates,
}: {
  summary: ContractProposalSummary | null;
  selectedCount: number;
  syncState: "idle" | "saving" | "saved" | "error";
  contractStatus?: string | null;
  contractDates?: {
    dataEnvio?: string | null;
    dataVisualizacao?: string | null;
    dataAssinatura?: string | null;
    onboardingStartedAt?: string | null;
    pedidoId?: string | null;
    requiresResign?: boolean | null;
    resignReason?: string | null;
  };
}) {
  if (!summary) {
    return (
      <Card className="glass-card border-[0.5px] bg-[linear-gradient(180deg,rgba(17,15,24,0.95),rgba(17,15,24,0.82))]">
        <CardContent className="p-5 text-sm text-white/45">
          Selecione o cliente e comece a montar a proposta para ver o resumo ao vivo.
        </CardContent>
      </Card>
    );
  }

  const comercialMap = parseComercialSummaryLines(summary.comercial.lines);
  const statusInsight = contractStatus
    ? getContractStatusInsight({
        status: contractStatus,
        dataEnvio: contractDates?.dataEnvio,
        dataVisualizacao: contractDates?.dataVisualizacao,
        dataAssinatura: contractDates?.dataAssinatura,
        onboardingStartedAt: contractDates?.onboardingStartedAt,
        pedidoId: contractDates?.pedidoId,
        requiresResign: contractDates?.requiresResign,
        resignReason: contractDates?.resignReason,
      })
    : null;

  return (
    <Card className="glass-card overflow-hidden border-[0.5px] border-fuchsia-400/15 bg-[linear-gradient(180deg,rgba(17,15,24,0.98),rgba(17,15,24,0.85))] shadow-[0_20px_50px_rgba(35,8,52,0.5)]">
      <CardHeader className="border-b border-white/10 bg-[linear-gradient(135deg,rgba(123,31,162,0.24),rgba(232,51,74,0.16),rgba(194,24,91,0.18))]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-sm text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-fuchsia-200" /> Resumo ao vivo
            </CardTitle>
            <CardDescription className="text-xs text-white/50">
              {selectedCount} item(ns) contratado(s) na proposta atual.
            </CardDescription>
          </div>
          <Badge
            variant="outline"
            className={
              syncState === "saving"
                ? "border-fuchsia-300/20 bg-fuchsia-300/10 text-fuchsia-100"
                : syncState === "error"
                  ? "border-red-300/20 bg-red-300/10 text-red-100"
                  : "border-white/15 bg-white/10 text-white/80"
            }
          >
            {syncState === "saving"
              ? "Sincronizando"
              : syncState === "error"
                ? "Falha no sync"
                : "NovaesWeb live"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-5 p-5">
        <div className="grid grid-cols-2 gap-3">
          <SummaryMetric label="Implantação" value={comercialMap.setupSubtotal || 0} />
          <SummaryMetric label="Mensalidade" value={comercialMap.negotiatedMonthly || 0} />
          <SummaryMetric label="Entrada" value={comercialMap.entryValue || 0} />
          <SummaryMetric label="Saldo" value={comercialMap.balanceValue || 0} />
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 space-y-3">
          <div className="space-y-1">
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/35">{summary.contractante.eyebrow}</p>
            <p className="text-base font-semibold text-white">{summary.contractante.title}</p>
          </div>
          <div className="space-y-1 text-sm text-white/60">
            {summary.contractante.lines.slice(0, 4).map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-primary/20 bg-primary/10 p-4 space-y-2">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/35">Plano principal</p>
            <Badge variant="outline" className="border-white/10 text-white/60">
              {selectedCount} item(ns)
            </Badge>
          </div>
          <p className="text-sm font-medium text-white">{summary.selectedPlan?.name || "Sem plano principal"}</p>
          {summary.selectedPlan && <p className="text-sm text-primary">{summary.selectedPlan.pricing}</p>}
          {summary.customScope && <p className="text-sm text-white/60 leading-relaxed">{summary.customScope}</p>}
        </div>

        <div className="space-y-2">
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/35">Condições comerciais</p>
          <div className="space-y-2 text-sm text-white/60">
            {summary.comercial.lines.map((line) => (
              <div key={line} className="rounded-xl border border-white/10 bg-white/[0.025] px-3 py-2">
                {line}
              </div>
            ))}
          </div>
        </div>

        {contractStatus && (
          <div className="space-y-3">
            {statusInsight ? (
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-sm font-medium text-white">{statusInsight.title}</p>
                <p className="mt-1 text-xs text-white/50">{statusInsight.subtitle}</p>
              </div>
            ) : null}
            <ContractLifecycleTimeline
              status={contractStatus}
              dataEnvio={contractDates?.dataEnvio}
              dataVisualizacao={contractDates?.dataVisualizacao}
              dataAssinatura={contractDates?.dataAssinatura}
            />
          </div>
        )}

        {summary.selectedServices.length > 0 && (
          <div className="space-y-2">
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/35">Extras selecionados</p>
            <div className="space-y-2">
              {summary.selectedServices.slice(0, 6).map((service) => (
                <motion.div
                  key={`${service.name}-${service.pricing}`}
                  layout
                  className="rounded-xl border border-white/10 bg-white/[0.03] p-3"
                >
                  <p className="text-sm font-medium text-white">{service.name}</p>
                  <p className="text-xs text-primary mt-1">{service.pricing}</p>
                </motion.div>
              ))}
              {summary.selectedServices.length > 6 && (
                <p className="text-xs text-white/40">+ {summary.selectedServices.length - 6} item(ns) adicional(is)</p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
