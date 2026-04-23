import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Sparkles, Layers, Filter } from "lucide-react";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ContractBuilderWizard } from "./ContractBuilderWizard";
import { ContractCofreList } from "./ContractCofreList";
import { 
  ensureArray, 
  noop,
  noopContractAction, 
  noopTabChange 
} from "@/features/contracts/runtime";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { contractTemplates } from "@/lib/contract-templates";
import type { 
  Cliente, 
  ExtraCatalogo, 
  Contrato, 
  ContractCofreState, 
  ContractBuilderState 
} from "@/features/contracts/types";

interface ContractTabsProps {
  activeTab: string;
  onTabChange: (tab: string, options?: { step?: number }) => void;
  cofre: ContractCofreState;
  builder: ContractBuilderState;
  clientes: Cliente[];
  extrasCatalogo: ExtraCatalogo[];
  onPreview: (contrato: Contrato) => void;
  onDuplicate: (contrato: Contrato) => void;
  onVersions: (contrato: Contrato) => void;
  onSend: (contrato: Contrato) => Promise<boolean> | boolean;
}

type ContractTabsInput = Partial<ContractTabsProps>;

export function ContractTabs({
  activeTab = "lista",
  onTabChange = noopTabChange,
  cofre,
  builder,
  clientes = [],
  extrasCatalogo = [],
  onPreview = noopContractAction,
  onDuplicate = noopContractAction,
  onVersions = noopContractAction,
  onSend = noopContractAction,
}: ContractTabsInput = {}) {
  const safeClientes = ensureArray(clientes);
  const safeExtrasCatalogo = ensureArray(extrasCatalogo);
  
  const safeBuilder = builder || ({} as Partial<ContractBuilderState>);
  const safeCofre = cofre || ({} as Partial<ContractCofreState>);
  
  const filteredContratos = ensureArray(cofre?.filteredContratos);
  const builderPayload = builder?.builderPayload ?? null;
  const [isAddModelOpen, setIsAddModelOpen] = React.useState(false);
  const [newModel, setNewModel] = React.useState({ nome: "", descricao: "" });

  const builderStatusLabel = builder?.builderStatusLabel ?? {
    title: "Carregando",
    subtitle: "Preparando montador...",
  };

  const handleBuilderStepChange = (step: number) => {
    builder?.setBuilderStep?.(step as any);
    onTabChange("montador", { step });
  };

  const handleSaveDraft = async () => {
    await builder?.persistBuilderDraft?.();
  };

  const handleSaveDraftAndExit = async () => {
    const saved = await builder?.persistBuilderDraft?.();
    if (saved) onTabChange("lista");
  };

  const handleSaveCompletedContract = async () => {
    await builder?.persistBuilderDraft?.({ requireCompleteValidation: true, stepOverride: 4 });
  };

  const handleSendCurrent = async () => {
    const saved = await builder?.persistBuilderDraft?.({
      requireCompleteValidation: true,
      stepOverride: 4,
    });
    if (saved) {
      await onSend(saved);
    }
  };

  const handleMarkAsSigned = async () => {
    const saved = await builder?.persistBuilderDraft?.({
      requireCompleteValidation: true,
      stepOverride: 4,
    });
    if (saved) {
      await builder?.changeContractStatus?.("assinado");
    }
  };

  return (
    <Tabs value={activeTab} onValueChange={(value) => onTabChange(value)} className="space-y-8">
      <div className="flex items-center justify-between">
        <TabsList className="h-12 border border-white/5 bg-white/5 p-1 backdrop-blur-sm">
          <TabsTrigger
            value="lista"
            className="gap-2 px-6 data-[state=active]:bg-primary data-[state=active]:text-white"
          >
            <FileText className="h-4 w-4" />
            <span>Cofre Ativo</span>
          </TabsTrigger>
          <TabsTrigger
            value="montador"
            className="gap-2 px-6 data-[state=active]:bg-primary data-[state=active]:text-white"
          >
            <Sparkles className="h-4 w-4" />
            <span>Montador Smart</span>
          </TabsTrigger>
          <TabsTrigger
            value="modelos"
            className="gap-2 px-6 data-[state=active]:bg-primary data-[state=active]:text-white"
          >
            <Layers className="h-4 w-4" />
            <span>Modelos</span>
          </TabsTrigger>
        </TabsList>

        {activeTab === "lista" ? (
          <div className="flex items-center gap-2">
            <Button
              variant="default"
              size="sm"
              onClick={() => {
                safeBuilder.resetBuilder?.();
                onTabChange("montador", { step: 0 });
              }}
              className="h-9 gap-2 bg-primary text-xs text-white hover:bg-primary/90"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Novo Contrato
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                safeCofre.setCofreFilter?.(safeCofre.cofreFilter === "ativos" ? "arquivados" : "ativos")
              }
              className="h-9 gap-2 text-xs text-white/60 hover:bg-white/5 hover:text-white"
            >
              <Filter className="h-3.5 w-3.5" />
              {safeCofre.cofreFilter === "arquivados" ? "Ver Ativos" : "Ver Arquivados"}
            </Button>
          </div>
        ) : null}
      </div>

      <AnimatePresence mode="wait">
        <TabsContent value="lista" className="m-0 outline-none">
          <motion.div
            key="list-view"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <ContractCofreList
              contratos={filteredContratos}
              extrasCatalogo={safeExtrasCatalogo}
              onView={onPreview}
              onArchive={(c) => safeCofre.handleArchiveContract?.(c)}
              onUnarchive={(c) => safeCofre.handleUnarchiveContract?.(c)}
              onDuplicate={onDuplicate}
              onDelete={(c) => safeCofre.setDeleteTarget?.(c)}
              onVersions={onVersions}
              onEdit={(c) => {
                safeBuilder.openBuilderContract?.(c);
              }}
              onSend={onSend}
            />
          </motion.div>
        </TabsContent>

        <TabsContent value="montador" className="m-0 outline-none">
          <motion.div
            key="builder-view"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.3 }}
          >
            {builderPayload ? (
              <ContractBuilderWizard
                builderPayload={builderPayload}
                builderStep={safeBuilder.builderStep ?? 0}
                editingBuilderContract={safeBuilder.editingBuilderContract ?? null}
                clientes={safeClientes}
                builderSummary={safeBuilder.builderSummary ?? null}
                builderProgress={safeBuilder.builderProgress ?? 0}
                builderStatusLabel={builderStatusLabel}
                builderRemoteAutosaveState={safeBuilder.builderRemoteAutosaveState ?? "idle"}
                workingBuilderPayload={safeBuilder.workingBuilderPayload ?? builderPayload}
                mobileSummaryOpen={Boolean(safeBuilder.mobileSummaryOpen)}
                selectedItemsCount={safeBuilder.selectedItemsCount ?? 0}
                builderClientExtras={ensureArray(safeBuilder.builderClientExtras)}
                syncingClientExtras={Boolean(safeBuilder.syncingClientExtras)}
                shouldReduceMotion={Boolean(safeBuilder.shouldReduceMotion)}
                onStepChange={handleBuilderStepChange}
                onReset={safeBuilder.resetBuilder ?? noop}
                onBackToList={() => onTabChange("lista")}
                onMobileSummaryToggle={() => safeBuilder.setMobileSummaryOpen?.(!safeBuilder.mobileSummaryOpen)}
                onClientChange={(clientId) => {
                  void safeBuilder.onClientChange?.(clientId);
                }}
                onUpdateContractante={safeBuilder.onUpdateContractante ?? noop}
                onUpdateContratada={safeBuilder.onUpdateContratada ?? noop}
                onUpdateTextField={safeBuilder.onUpdateTextField ?? noop}
                onClauseSelectionChange={safeBuilder.onClauseSelectionChange ?? noop}
                onPrimaryPlanChange={safeBuilder.onPrimaryPlanChange ?? noop}
                onDiscountTypeChange={safeBuilder.onDiscountTypeChange ?? noop}
                onPricingChange={safeBuilder.onPricingChange ?? noop}
                onMoneyDraftBlur={safeBuilder.onMoneyDraftBlur ?? noop}
                onRefreshExtras={() => {
                  void safeBuilder.onRefreshExtras?.();
                }}
                onExtraFieldChange={safeBuilder.onExtraFieldChange ?? noop}
                onToggleExtra={safeBuilder.onToggleExtra ?? noop}
                onPreview={onPreview}
                onSaveDraft={handleSaveDraft}
                onSaveAndExit={handleSaveDraftAndExit}
                onSave={handleSaveCompletedContract}
                onSendCurrent={handleSendCurrent}
                onMarkAsSigned={handleMarkAsSigned}
                onGeneratePdf={safeBuilder.handleGeneratePdf}
                onPrint={safeBuilder.handlePrint}
                getStepError={safeBuilder.getBuilderStepError ?? (() => null)}
                getMoneyInputDisplayValue={safeBuilder.getMoneyInputDisplayValue ?? (() => "0,00")}
                describeClientExtraPricing={safeBuilder.describeClientExtraPricing ?? (() => "Cortesia")}
                buildPricingMoneyDraftKey={safeBuilder.buildPricingMoneyDraftKey ?? ((field: string) => field)}
                builderPrepared={safeBuilder.builderPrepared ?? null}
                builderPreparedError={safeBuilder.builderPreparedError ?? null}
              />
            ) : (
              <div className="rounded-3xl border border-white/10 bg-white/[0.04] px-6 py-10 text-center text-sm text-white/60">
                Preparando montador de contratos...
              </div>
            )}
          </motion.div>
        </TabsContent>

        <TabsContent value="modelos" className="m-0 outline-none">
          <motion.div
            key="templates-view"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card 
                className="border-dashed border-white/20 bg-transparent transition-all hover:bg-white/[0.03] cursor-pointer group"
                onClick={() => setIsAddModelOpen(true)}
              >
                <CardContent className="flex flex-col items-center justify-center py-10">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-white/40 group-hover:bg-primary/20 group-hover:text-primary transition-all">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <p className="mt-4 text-sm font-bold text-white">Adicionar Novo Modelo</p>
                  <p className="text-[10px] text-white/40 text-center mt-1">Crie um template base personalizado</p>
                </CardContent>
              </Card>

              <Dialog open={isAddModelOpen} onOpenChange={setIsAddModelOpen}>
                <DialogContent className="border-white/10 bg-[#120d18] text-white">
                  <DialogHeader>
                    <DialogTitle>Novo Modelo de Contrato</DialogTitle>
                    <DialogDescription className="text-white/40">
                      Defina o nome e a descrição para o seu novo modelo de contrato.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-white/30">Nome do Modelo</label>
                      <Input 
                        placeholder="Ex: Contrato de Mentoria"
                        value={newModel.nome}
                        onChange={(e) => setNewModel(prev => ({ ...prev, nome: e.target.value }))}
                        className="border-white/10 bg-black/40 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-white/30">Descrição</label>
                      <Textarea 
                        placeholder="Breve descrição do propósito deste modelo"
                        value={newModel.descricao}
                        onChange={(e) => setNewModel(prev => ({ ...prev, descricao: e.target.value }))}
                        className="border-white/10 bg-black/40 text-white"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="ghost" onClick={() => setIsAddModelOpen(false)} className="text-white/50 hover:bg-white/5">
                      Cancelar
                    </Button>
                    <Button 
                      onClick={() => {
                        toast.success("Modelo criado com sucesso!");
                        setIsAddModelOpen(false);
                        setNewModel({ nome: "", descricao: "" });
                      }}
                      className="bg-primary text-white"
                      disabled={!newModel.nome.trim()}
                    >
                      Criar Modelo
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              {contractTemplates.map((template: any) => (
                <Card key={template.id} className="border-white/10 bg-white/[0.02] transition-all hover:bg-white/[0.05]">
                  <CardHeader>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary mb-3">
                      <Layers className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-lg text-white">{template.nome}</CardTitle>
                    <CardDescription className="text-white/40">Template padrão para serviços digitais.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      variant="outline" 
                      className="w-full border-white/10 bg-white/5 text-white hover:bg-white/10"
                      onClick={() => {
                        safeBuilder.resetBuilder?.();
                        onTabChange("montador", { step: 0 });
                      }}
                    >
                      Usar este modelo
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        </TabsContent>
      </AnimatePresence>
    </Tabs>
  );
}
