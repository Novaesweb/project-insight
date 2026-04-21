import { motion, AnimatePresence } from "framer-motion";
import { Plus, CheckCircle2, Eye, ArrowLeft, Save, ArrowRight, RefreshCw, CircleDollarSign, PlusCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { BuilderLiveSummary } from "@/components/contracts/BuilderLiveSummary";
import { BuilderPreviewDocument } from "@/components/contracts/BuilderPreviewDocument";
import { AnimatedValue } from "@/components/AnimatedValue";
import { 
  ContractBuilderPayload, 
  ContractBuilderStepIndex, 
  BuilderPrimaryPlanId,
  ContractBuilderPricing,
  buildContractSignatureSummary,
  buildContractClauseExplanations
} from "@/lib/contract-builder";
import { PUBLIC_PLAN_CATALOG } from "@/lib/public-plans";
import { formatCurrencyBRL, formatMoneyInputValue } from "@/lib/contract-utils";
import { BUILDER_STEPS, Contrato, Cliente } from "@/features/contracts/types";

interface ContractBuilderWizardProps {
  builderPayload: ContractBuilderPayload;
  builderStep: ContractBuilderStepIndex;
  editingBuilderContract: Contrato | null;
  clientes: Cliente[];
  builderSummary: any;
  builderProgress: number;
  builderStatusLabel: { title: string; subtitle: string };
  builderRemoteAutosaveState: "idle" | "saving" | "saved" | "error";
  workingBuilderPayload: ContractBuilderPayload | null;
  mobileSummaryOpen: boolean;
  selectedItemsCount: number;
  builderClientExtras: any[];
  syncingClientExtras: boolean;
  shouldReduceMotion: boolean;
  onStepChange: (step: ContractBuilderStepIndex) => void;
  onReset: () => void;
  onMobileSummaryToggle: () => void;
  onClientChange: (clientId: string) => void;
  onUpdateContractante: (field: string, value: string) => void;
  onUpdateContratada: (field: string, value: string) => void;
  onUpdateTextField: (field: any, value: string) => void;
  onPrimaryPlanChange: (planId: BuilderPrimaryPlanId) => void;
  onDiscountTypeChange: (type: ContractBuilderPricing["discountType"]) => void;
  onPricingChange: (field: any, value: string) => void;
  onMoneyDraftBlur: (field: string) => void;
  onRefreshExtras: () => void;
  onPreview: (state: any) => void;
  onSaveAndExit: () => void;
  onSave: () => void;
  getStepError: (step: number) => string | null;
  getMoneyInputDisplayValue: (key: string, value: number) => string;
  describeClientExtraPricing: (item: any) => string;
  buildPricingMoneyDraftKey: (field: string) => string;
  builderPrepared: any;
  builderPreparedError?: string | null;
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
  onPreview,
  onSaveAndExit,
  onSave,
  getStepError,
  getMoneyInputDisplayValue,
  describeClientExtraPricing,
  buildPricingMoneyDraftKey,
  builderPrepared,
  builderPreparedError,
}: ContractBuilderWizardProps) {
  const previewExplanations = workingBuilderPayload
    ? buildContractClauseExplanations(workingBuilderPayload)
    : [];
  const previewSignatureSummary = buildContractSignatureSummary(workingBuilderPayload);

  return (
    <div className="space-y-6">
      <Card className="glass-card-premium border-[0.5px] overflow-hidden">
        <CardContent className="p-6">
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-primary/20 flex items-center justify-center border border-primary/30">
                  <PlusCircle className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Montador de Propostas</h2>
                  <p className="text-xs text-white/45">NovaesWeb Premium Contract System</p>
                </div>
              </div>

              <Button
                variant="outline"
                className="border-white/10 bg-white/5 text-white hover:bg-white/10 rounded-xl"
                onClick={onReset}
              >
                <Plus className="w-4 h-4 mr-2" /> Novo montador
              </Button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.22em] text-white/40">Etapa atual</p>
                  <p className="text-sm text-white font-medium">
                    {BUILDER_STEPS[builderStep].label} • {BUILDER_STEPS[builderStep].description}
                  </p>
                  <p className="text-xs text-white/45 mt-1">{builderStatusLabel.subtitle}</p>
                </div>
                <p className="text-sm text-white/55">{Math.round(builderProgress)}% concluído</p>
              </div>
              <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary via-fuchsia-600 to-rose-500 transition-all duration-300"
                  style={{ width: `${builderProgress}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              {BUILDER_STEPS.map((step) => {
                const isActive = step.id === builderStep;
                const isCompleted = step.id < builderStep;

                return (
                  <motion.button
                    key={step.id}
                    type="button"
                    onClick={() => onStepChange(step.id)}
                    whileTap={shouldReduceMotion ? undefined : { scale: 0.985 }}
                    className={`rounded-2xl border p-4 text-left transition-all ${
                      isActive
                        ? "border-primary/40 bg-primary/10 shadow-[0_16px_32px_rgba(var(--primary-rgb),0.1)]"
                        : isCompleted
                          ? "border-emerald-400/25 bg-emerald-400/10"
                          : "border-white/10 bg-white/[0.04] hover:bg-white/[0.07]"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.2em] text-white/35">Etapa {step.id + 1}</p>
                        <p className="text-sm font-medium text-white mt-1">{step.label}</p>
                      </div>
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center border ${
                          isCompleted
                            ? "border-emerald-400/35 bg-emerald-400/15 text-emerald-300"
                            : isActive
                              ? "border-primary/30 bg-primary/15 text-primary"
                              : "border-white/10 bg-white/[0.04] text-white/45"
                        }`}
                      >
                        {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <span className="text-xs">{step.id + 1}</span>}
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px] gap-6 items-start">
        <div className="space-y-6">
          <Card className="glass-card-premium border-[0.5px]">
            <CardHeader>
              <CardTitle className="text-sm text-white">{BUILDER_STEPS[builderStep].label}</CardTitle>
              <CardDescription className="text-xs text-white/45">
                {BUILDER_STEPS[builderStep].description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={builderStep}
                  initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={shouldReduceMotion ? false : { opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  {/* Step 0: Cliente */}
                  {builderStep === 0 && (
                    <div className="space-y-6">
                       <div className="space-y-2">
                          <Label className="text-xs uppercase tracking-[0.18em] text-white/45">Cliente</Label>
                          <Select value={builderPayload.clienteId} onValueChange={onClientChange}>
                            <SelectTrigger className="glass-input border-white/10 text-white">
                              <SelectValue placeholder="Selecione um cliente ativo" />
                            </SelectTrigger>
                            <SelectContent className="bg-[#120f18] border-white/10">
                              {clientes.map((cliente) => (
                                <SelectItem key={cliente.id} value={cliente.id} className="text-white focus:bg-primary/20">
                                  {cliente.nome} {cliente.nome_empresa ? `• ${cliente.nome_empresa}` : ""}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        {/* Display contractor details Card */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <Card className="bg-white/[0.03] border-white/10">
                              <CardContent className="p-5 space-y-3">
                                <p className="text-[10px] uppercase tracking-[0.2em] text-white/35">Contratante Selecionado</p>
                                <p className="text-lg font-semibold text-white">
                                  {builderPayload.contractante.nome || "Aguardando seleção..."}
                                </p>
                                <div className="space-y-1.5 text-xs text-white/50">
                                  {builderPayload.contractante.documento && <p>Doc: {builderPayload.contractante.documento}</p>}
                                  {builderPayload.contractante.email && <p>Email: {builderPayload.contractante.email}</p>}
                                </div>
                              </CardContent>
                            </Card>
                        </div>
                    </div>
                  )}

                  {/* Step 1: Partes */}
                  {builderStep === 1 && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <h4 className="text-sm font-medium text-white/70">Dados do Contratante</h4>
                            <Input placeholder="Nome" value={builderPayload.contractante.nome} onChange={e => onUpdateContractante('nome', e.target.value)} className="glass-input" />
                            <Input placeholder="Documento" value={builderPayload.contractante.documento} onChange={e => onUpdateContractante('documento', e.target.value)} className="glass-input" />
                            <Textarea placeholder="Endereço" value={builderPayload.contractante.endereco} onChange={e => onUpdateContractante('endereco', e.target.value)} className="glass-input" />
                        </div>
                        <div className="space-y-4">
                            <h4 className="text-sm font-medium text-white/70">Dados da Contratada</h4>
                            <Input placeholder="Nome" value={builderPayload.contratada.nome} onChange={e => onUpdateContratada('nome', e.target.value)} className="glass-input" />
                            <Input placeholder="Representante" value={builderPayload.contratada.representante} onChange={e => onUpdateContratada('representante', e.target.value)} className="glass-input" />
                            <Textarea placeholder="Endereço" value={builderPayload.contratada.endereco} onChange={e => onUpdateContratada('endereco', e.target.value)} className="glass-input" />
                        </div>
                    </div>
                  )}

                  {/* Step 2: Planos */}
                  {builderStep === 2 && (
                    <div className="space-y-6">
                        <RadioGroup value={builderPayload.primaryPlanId} onValueChange={v => onPrimaryPlanChange(v as BuilderPrimaryPlanId)} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                           {PUBLIC_PLAN_CATALOG.map(plan => (
                             <Label key={plan.id} className={`p-4 border rounded-2xl cursor-pointer transition-all ${builderPayload.primaryPlanId === plan.id ? 'border-primary bg-primary/5' : 'border-white/10 bg-white/5'}`}>
                                <div className="flex justify-between items-start">
                                    <span className="font-bold text-white">{plan.title}</span>
                                    <RadioGroupItem value={plan.id} />
                                </div>
                                <p className="text-xs text-white/40 mt-1">{plan.description}</p>
                             </Label>
                           ))}
                        </RadioGroup>
                    </div>
                  )}

                  {/* Step 3: Totais */}
                  {builderStep === 3 && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Tipo de Desconto</Label>
                                <Select value={builderPayload.pricing.discountType} onValueChange={v => onDiscountTypeChange(v as any)}>
                                    <SelectTrigger className="glass-input"><SelectValue /></SelectTrigger>
                                    <SelectContent className="bg-[#120f18] border-white/10">
                                        <SelectItem value="fixed">Fixo (R$)</SelectItem>
                                        <SelectItem value="percentage">Porcentagem (%)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Valor do Desconto</Label>
                                <Input 
                                    value={getMoneyInputDisplayValue(buildPricingMoneyDraftKey('discountValue'), builderPayload.pricing.discountValue)} 
                                    onChange={e => onPricingChange('discountValue', e.target.value)}
                                    onBlur={() => onMoneyDraftBlur(buildPricingMoneyDraftKey('discountValue'))}
                                    className="glass-input"
                                />
                            </div>
                        </div>
                    </div>
                  )}

                  {/* Step 4: Preview */}
                  {builderStep === 4 && (
                    <div className="space-y-4">
                        {builderPrepared ? (
                          <BuilderPreviewDocument
                            title={builderPrepared.title}
                            body={builderPrepared.body}
                            summary={builderSummary}
                            explanations={previewExplanations}
                            signatureSummary={previewSignatureSummary}
                          />
                        ) : builderPreparedError ? (
                          <div className="rounded-3xl border border-amber-300/20 bg-amber-300/10 px-5 py-6">
                            <p className="text-xs font-bold uppercase tracking-[0.16em] text-amber-100">
                              Revisao necessaria
                            </p>
                            <p className="mt-2 text-sm text-white/75">{builderPreparedError}</p>
                            <p className="mt-2 text-xs text-white/55">
                              Revise as etapas anteriores e salve novamente para regenerar a visualizacao final.
                            </p>
                          </div>
                        ) : (
                          <p className="text-center text-white/40 py-10">Gerando visualização...</p>
                        )}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </CardContent>
          </Card>

          <div className="flex items-center justify-between p-4 bg-white/5 rounded-[28px] border border-white/10">
            <Button variant="ghost" disabled={builderStep === 0} onClick={() => onStepChange((builderStep - 1) as any)} className="rounded-xl">
              <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onSaveAndExit} className="rounded-xl border-white/10 bg-white/5">
                <Save className="w-4 h-4 mr-2" /> Rascunho
              </Button>
              {builderStep < 4 ? (
                <Button onClick={() => onStepChange((builderStep + 1) as any)} className="gradient-primary rounded-xl px-8">
                  Avançar <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={onSave}
                  disabled={!builderPrepared}
                  className="gradient-primary rounded-xl px-8 shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)]"
                >
                  Finalizar e Salvar
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="hidden xl:block space-y-6 sticky top-6">
            <BuilderLiveSummary
                summary={builderSummary}
                selectedCount={selectedItemsCount}
                syncState={builderRemoteAutosaveState}
                contractStatus={editingBuilderContract?.status}
            />
        </div>
      </div>
    </div>
  );
}
