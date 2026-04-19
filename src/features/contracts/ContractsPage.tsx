import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FileText, 
  Plus, 
  Layers, 
  Search,
  Sparkles,
  ChevronRight,
  Filter
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

import { SuccessCelebration } from "@/components/SuccessCelebration";
import { useContractCofre } from "./hooks/useContractCofre";
import { useContractBuilder } from "./hooks/useContractBuilder";
import { ContractPreviewDrawer } from "./components/ContractPreviewDrawer";
import { ContractCofreList } from "./components/ContractCofreList";
import { ContractBuilderWizard } from "./components/ContractBuilderWizard";

import { 
  Contrato,
  fadeUp 
} from "./types";

export default function Contratos() {
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname.split("/").pop() || "contratos";
  
  // Tab Management
  const activeTab = currentPath === "modelos" 
    ? "modelos" 
    : (currentPath === "novo" || currentPath === "montador") 
      ? "montador" 
      : "lista";
      
  const handleTabChange = (newTab: string) => {
    if (newTab === "lista") navigate("/admin/contratos");
    else if (newTab === "modelos") navigate("/admin/contratos/modelos");
    else if (newTab === "montador") navigate("/admin/contratos/novo");
  };

  // Hooks
  const cofre = useContractCofre();
  const builder = useContractBuilder();

  // Local UI State
  const [searchTerm, setSearchTerm] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  // Success Celebration Trigger
  useEffect(() => {
    if (builder.syncState === "saved" && builder.lastSavedAt) {
      // Only show for explicit saves or completions
      // For now, let's keep it simple
    }
  }, [builder.syncState, builder.lastSavedAt]);

  return (
    <div className="min-h-screen bg-[#0a0510] pb-20 pt-4 md:pt-8">
      <div className="container max-w-7xl px-4 md:px-6">
        
        {/* Header Section */}
        <motion.div 
          variants={fadeUp}
          initial="initial"
          animate="animate"
          className="mb-8 flex flex-col gap-6 md:flex-row md:items-end md:justify-between"
        >
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-primary/20 bg-primary/5 text-primary">
                Gestão de Documentos
              </Badge>
              <div className="h-1 w-1 rounded-full bg-white/20" />
              <span className="text-xs text-white/40">v3.0 Premium</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
              Cofre de <span className="text-primary">Contratos</span>
            </h1>
            <p className="max-w-2xl text-sm text-white/50 md:text-base">
              Gerencie, monitore e crie contratos inteligentes com a infraestrutura NovaesWeb.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
              <Input
                placeholder="Buscar contrato ou cliente..."
                className="h-10 w-64 border-white/10 bg-white/5 pl-9 text-sm text-white transition-all focus:border-primary/50 focus:bg-white/10 focus:ring-0"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button 
              onClick={() => handleTabChange("montador")}
              className="h-10 gap-2 bg-primary px-5 font-semibold text-white hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" />
              Novo Contrato
            </Button>
          </div>
        </motion.div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-8">
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
                  onClick={() => cofre.setFilter(cofre.filter === "ativos" ? "arquivados" : "ativos")}
                  className="h-9 gap-2 text-xs text-white/60 hover:bg-white/5 hover:text-white"
                >
                  <Filter className="h-3.5 w-3.5" />
                  {cofre.filter === "ativos" ? "Ver Arquivados" : "Ver Ativos"}
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
                  contratos={cofre.contratos}
                  loaded={cofre.loaded}
                  filter={cofre.filter}
                  statusFilter={cofre.statusFilter}
                  setStatusFilter={cofre.setStatusFilter}
                  searchTerm={searchTerm}
                  onOpenPreview={(c) => cofre.openPreview(c)}
                  onArchive={(c) => cofre.handleArchive(c)}
                  onUnarchive={(c) => cofre.handleUnarchive(c)}
                  onDuplicate={(c) => cofre.handleDuplicate(c)}
                  onDelete={(c) => cofre.setDeleteTarget(c)}
                  onOpenVersions={(c) => cofre.handleOpenVersions(c)}
                  onEdit={(c) => {
                    builder.startEditing(c);
                    handleTabChange("montador");
                  }}
                />
              </motion.div>
            </TabsContent>

            <TabsContent value="montador" className="m-0 outline-none">
              <motion.div
                key="builder-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <ContractBuilderWizard 
                  payload={builder.payload}
                  setPayload={builder.setPayload}
                  step={builder.step}
                  setStep={builder.setStep}
                  editingContract={builder.editingContract}
                  syncState={builder.syncState}
                  lastSavedAt={builder.lastSavedAt}
                  recoveredLocally={builder.recoveredLocally}
                  onSave={async () => {
                    const ok = await builder.handleSave();
                    if (ok) setShowSuccess(true);
                  }}
                  onSendToClient={async () => {
                    const ok = await builder.handleSendToClient();
                    if (ok) {
                      setShowSuccess(true);
                      setTimeout(() => handleTabChange("lista"), 2000);
                    }
                  }}
                  onCancel={() => {
                    builder.reset();
                    handleTabChange("lista");
                  }}
                />
              </motion.div>
            </TabsContent>

            <TabsContent value="modelos" className="m-0 outline-none">
              <div className="flex min-h-[400px] flex-col items-center justify-center rounded-3xl border border-white/5 bg-white/[0.02] p-12 text-center backdrop-blur-md">
                <div className="mb-4 rounded-full bg-primary/10 p-4">
                  <Layers className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-white">Biblioteca de Modelos</h3>
                <p className="mt-2 max-w-sm text-sm text-white/40">
                  Em breve você poderá gerenciar seus modelos de contrato mestre diretamente por aqui.
                </p>
                <Button 
                  variant="outline" 
                  className="mt-6 border-white/10 text-white hover:bg-white/5"
                  onClick={() => handleTabChange("montador")}
                >
                  Usar Modelo Padrão
                </Button>
              </div>
            </TabsContent>
          </AnimatePresence>
        </Tabs>

        {/* Global Components */}
        <ContractPreviewDrawer 
          open={cofre.previewOpen}
          onOpenChange={cofre.setPreviewOpen}
          previewState={cofre.previewState}
          events={cofre.previewEvents}
          eventsLoading={cofre.previewEventsLoading}
        />

        <AnimatePresence>
          {showSuccess && (
            <SuccessCelebration 
              onComplete={() => setShowSuccess(false)}
              title="Contrato Atualizado"
              subtitle="As alterações foram sincronizadas com sucesso no cofre digital."
            />
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
