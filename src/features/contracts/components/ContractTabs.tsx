import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Sparkles, Layers, Filter } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ContractCofreList } from "./ContractCofreList";
import { ContractBuilderWizard } from "./ContractBuilderWizard";

interface ContractTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  cofre: any;
  builder: any;
  extrasCatalogo: any[];
  onPreview: (contrato: any) => void;
  onDuplicate: (contrato: any) => void;
  onVersions: (contrato: any) => void;
  onSend: (contrato: any) => void;
}

export function ContractTabs({
  activeTab,
  onTabChange,
  cofre,
  builder,
  extrasCatalogo,
  onPreview,
  onDuplicate,
  onVersions,
  onSend
}: ContractTabsProps) {
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
              onClick={() => cofre.setCofreFilter(cofre.cofreFilter === "ativos" ? "arquivados" : "ativos")}
              className="h-9 gap-2 text-xs text-white/60 hover:bg-white/5 hover:text-white"
            >
              <Filter className="h-3.5 w-3.5" />
              {cofre.cofreFilter === "ativos" ? "Ver Arquivados" : "Ver Ativos"}
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
              contratos={cofre.filteredContratos}
              extrasCatalogo={extrasCatalogo}
              onView={onPreview}
              onArchive={(c) => cofre.handleArchiveContract(c)}
              onUnarchive={(c) => cofre.handleUnarchiveContract(c)}
              onDuplicate={onDuplicate}
              onDelete={(c) => cofre.setDeleteTarget(c)}
              onVersions={onVersions}
              onEdit={(c) => {
                builder.openBuilderContract(c);
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
            <ContractBuilderWizard 
              builder={builder}
              onCancel={() => onTabChange("lista")}
              onDuplicate={onDuplicate}
            />
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
