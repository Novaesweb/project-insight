import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Sparkles, Layers, Filter } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ContractCofreList } from "./ContractCofreList";
import { ContractBuilderWizard } from "./ContractBuilderWizard";
import { ensureArray, noop, noopContractAction, noopTabChange } from "@/features/contracts/runtime";

interface ContractTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  cofre: any;
  builder: any;
  clientes: any[];
  extrasCatalogo: any[];
  onPreview: (contrato: any) => void;
  onDuplicate: (contrato: any) => void;
  onVersions: (contrato: any) => void;
  onSend: (contrato: any) => void;
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
  const safeCofre = cofre ?? {};
  const safeBuilder = builder ?? {};
  const safeClientes = ensureArray(clientes);
  const safeExtrasCatalogo = ensureArray(extrasCatalogo);
  const filteredContratos = ensureArray(safeCofre.filteredContratos);
  const builderPayload = safeBuilder.builderPayload ?? null;
  const builderStatusLabel = safeBuilder.builderStatusLabel ?? {
    title: "Rascunho",
    subtitle: "Preparando montador",
  };

  const handleSaveDraftAndExit = async () => {
    const saved = await safeBuilder.persistBuilderDraft?.();
    if (saved) onTabChange("lista");
  };

  const handleSaveCompletedContract = async () => {
    await safeBuilder.persistBuilderDraft?.({ requireCompleteValidation: true });
  };

  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="space-y-8">
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
        
        {activeTab === "lista" && (
          <div className="flex items-center gap-2">
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
        )}
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
                onTabChange("montador");
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
                onStepChange={safeBuilder.setBuilderStep ?? noop}
                onReset={safeBuilder.resetBuilder ?? noop}
                onMobileSummaryToggle={() => safeBuilder.setMobileSummaryOpen?.(!safeBuilder.mobileSummaryOpen)}
                onClientChange={(clientId) => {
                  void safeBuilder.onClientChange?.(clientId);
                }}
                onUpdateContractante={safeBuilder.onUpdateContractante ?? noop}
                onUpdateContratada={safeBuilder.onUpdateContratada ?? noop}
                onUpdateTextField={safeBuilder.onUpdateTextField ?? noop}
                onPrimaryPlanChange={safeBuilder.onPrimaryPlanChange ?? noop}
                onDiscountTypeChange={safeBuilder.onDiscountTypeChange ?? noop}
                onPricingChange={safeBuilder.onPricingChange ?? noop}
                onMoneyDraftBlur={safeBuilder.onMoneyDraftBlur ?? noop}
                onRefreshExtras={() => {
                  void safeBuilder.onRefreshExtras?.();
                }}
                onPreview={onPreview}
                onSaveAndExit={handleSaveDraftAndExit}
                onSave={handleSaveCompletedContract}
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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="mb-4 rounded-full bg-white/5 p-4">
              <Layers className="h-8 w-8 text-white/20" />
            </div>
            <h3 className="text-lg font-medium text-white">Catálogo de Modelos</h3>
            <p className="text-sm text-white/40">Modelos pré-configurados estarão disponíveis em breve.</p>
          </motion.div>
        </TabsContent>
      </AnimatePresence>
    </Tabs>
  );
}
