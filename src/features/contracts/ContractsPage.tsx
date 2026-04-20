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
  Cliente,
  ExtraCatalogo,
  ContratoVersion,
  BUILDER_TEMPLATE_ID,
  fadeUp 
} from "./types";
import { useContractsCatalog } from "./hooks/useContractsCatalog";
import { useContractsRealtime } from "@/hooks/useContractsRealtime";
import { useContractEventsRealtime } from "@/hooks/useContractEventsRealtime";
import { 
  normalizeBuilderPayload, 
  buildBuilderSavePayload,
  hasMeaningfulBuilderState
} from "./utils";
import { 
  saveBuilderContractDirectly,
  sendBuilderContractToClientRecord,
  fetchContractVersions
} from "./services";
import {
  createContractEvent
} from "@/lib/contract-activity";
import type { ContractEventRow } from "@/lib/contract-activity";
import { PreviewState } from "./types";

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

  // --- State Management ---
  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [contratosLoaded, setContratosLoaded] = useState(false);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [extrasCatalogo, setExtrasCatalogo] = useState<ExtraCatalogo[]>([]);
  const [extrasLoaded, setExtrasLoaded] = useState(false);
  
  // Preview & Versions state
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewState, setPreviewState] = useState<PreviewState | null>(null);
  const [previewContractEvents, setPreviewContractEvents] = useState<ContractEventRow[]>([]);
  const [previewContractEventsLoading, setPreviewContractEventsLoading] = useState(false);
  const [contractVersions, setContractVersions] = useState<ContratoVersion[]>([]);
  const [versionsLoading, setVersionsLoading] = useState(false);
  const [versionsContract, setVersionsContract] = useState<Contrato | null>(null);
  const [versionsOpen, setVersionsOpen] = useState(false);

  // Helper functions for state updates
  const decorateContrato = useCallback((c: any): Contrato => ({
    ...c,
    clientes: c.clientes || (clientes.find(cl => cl.id === c.cliente_id) ? { nome: clientes.find(cl => cl.id === c.cliente_id)!.nome } : null)
  }), [clientes]);

  const sortContratosByUpdatedAt = useCallback((items: Contrato[]) => {
    return [...items].sort((a, b) => {
      const dateA = new Date(a.updated_at || a.created_at || 0).getTime();
      const dateB = new Date(b.updated_at || b.created_at || 0).getTime();
      return dateB - dateA;
    });
  }, []);

  const upsertContratoState = useCallback((contrato: any) => {
    const decorated = decorateContrato(contrato);
    setContratos((current) => {
      const next = current.filter((item) => item.id !== decorated.id);
      next.unshift(decorated);
      return sortContratosByUpdatedAt(next);
    });
  }, [decorateContrato, sortContratosByUpdatedAt]);

  const removeContratoState = useCallback((contractId: string) => {
    setContratos((current) => current.filter((item) => item.id !== contractId));
  }, []);

  // --- Data Orchestration ---
  const { loadContratos, loadClientes, loadExtrasCatalogo } = useContractsCatalog({
    decorateContrato,
    sortContratosByUpdatedAt,
    sortContractEvents,
    setContratos,
    setContratosLoaded,
    setClientes,
    setExtrasCatalogo,
    setExtrasLoaded,
    setPreviewContractEvents,
    setPreviewContractEventsLoading,
  });

  useEffect(() => {
    void loadContratos();
    void loadClientes();
    void loadExtrasCatalogo();
  }, [loadContratos, loadClientes, loadExtrasCatalogo]);

  // --- Realtime Updates ---
  useContractsRealtime({
    channelName: "contracts-admin-realtime",
    filter: `modelo=eq.${BUILDER_TEMPLATE_ID}`,
    enabled: contratosLoaded,
    onUpsert: upsertContratoState,
    onDelete: removeContratoState,
  });

  const handleOpenVersions = useCallback(async (contrato: Contrato) => {
    setVersionsContract(contrato);
    setVersionsOpen(true);
    setVersionsLoading(true);
    try {
      const versions = await fetchContractVersions(contrato.id);
      setContractVersions(versions);
    } catch (error) {
      toast({
        title: "Erro ao carregar versões",
        description: "Não foi possível carregar o histórico de versões deste contrato.",
        variant: "destructive"
      });
    } finally {
      setVersionsLoading(false);
    }
  }, [toast]);

  const handleDuplicateContract = useCallback(async (contrato: Contrato) => {
    try {
      if (!extrasLoaded) {
        toast({
          title: "Catálogo ainda carregando",
          description: "Os extras ainda estão sendo sincronizados. Tente novamente em instantes.",
          variant: "destructive",
        });
        return;
      }

      const duplicatedPayloadBase = normalizeBuilderPayload(
        contrato.builder_payload,
        extrasCatalogo,
        contrato.cliente_id,
        4,
      );
      const duplicatedPayload = {
        ...duplicatedPayloadBase,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastStep: duplicatedPayloadBase.lastStep,
      };
      const prepared = buildBuilderSavePayload(duplicatedPayload, duplicatedPayload.lastStep);

      if (!prepared) {
        throw new Error("Não foi possível preparar a duplicação da proposta.");
      }

      const duplicatedTitle = prepared.title.includes("Cópia")
        ? prepared.title
        : `${prepared.title} • Cópia`;
        
      const savedContrato = await saveBuilderContractDirectly({
        contractId: null,
        createVersionSnapshot: false,
        payloadToPersist: {
          cliente_id: prepared.normalizedPayload.clienteId || null,
          titulo: duplicatedTitle,
          descricao: prepared.description,
          valor: prepared.value,
          status: "rascunho",
          corpo: prepared.body,
          modelo: BUILDER_TEMPLATE_ID,
          builder_payload: prepared.normalizedPayload as any,
          updated_at: new Date().toISOString(),
        },
      });

      upsertContratoState(savedContrato);
      toast({ title: "Contrato duplicado com sucesso!" });
    } catch (error) {
      toast({
        title: "Erro ao duplicar contrato",
        description: "Ocorreu uma falha ao tentar criar a cópia do contrato.",
        variant: "destructive"
      });
    }
  }, [extrasCatalogo, extrasLoaded, toast, upsertContratoState]);

  const handleSendToClient = useCallback(async (contrato: Contrato) => {
    try {
      const result = await sendBuilderContractToClientRecord(contrato);
      upsertContratoState(result.contract);
      
      // Create activity event
      await createContractEvent({
        contrato_id: contrato.id,
        tipo: "enviado",
        titulo: result.isResignFlow ? "Versão atualizada enviada" : "Contrato enviado",
        descricao: `O contrato foi enviado para o portal do cliente.`,
        actor_type: "admin"
      });

      toast({ title: "Contrato enviado com sucesso!" });
      return true;
    } catch (error) {
      toast({
        title: "Erro ao enviar contrato",
        description: "Não foi possível enviar o contrato para o cliente.",
        variant: "destructive"
      });
      return false;
    }
  }, [toast, upsertContratoState]);

  // --- Hooks ---
  const cofre = useContractCofre({
    contratos,
    setContratos,
    upsertContratoState,
    removeContratoState
  });

  const builder = useContractBuilder({
    clientes,
    extrasCatalogo,
    extrasLoaded,
    upsertContratoState,
    setTab: handleTabChange,
    setCofreFilter: cofre.setCofreFilter,
    setSearchTerm: setSearchTerm
  });

  // Local UI State
  const [searchTerm, setSearchTerm] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  // Success Celebration Trigger
  useEffect(() => {
    if (builder.builderRemoteAutosaveState === "saved" && builder.builderLastSavedAt) {
      // Logic for celebration could be added here
    }
  }, [builder.builderRemoteAutosaveState, builder.builderLastSavedAt]);

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
                  onView={(c) => {
                    setPreviewState({ title: c.titulo, body: c.corpo as string, contract: c });
                    setPreviewOpen(true);
                  }}
                  onArchive={(c) => cofre.handleArchiveContract(c)}
                  onUnarchive={(c) => cofre.handleUnarchiveContract(c)}
                  onDuplicate={(c) => handleDuplicateContract(c)}
                  onDelete={(c) => cofre.setDeleteTarget(c)}
                  onVersions={(c) => handleOpenVersions(c)}
                  onEdit={(c) => {
                    builder.openBuilderContract(c);
                    handleTabChange("montador");
                  }}
                  onSend={(c) => handleSendToClient(c)}
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
                  {...builder}
                  onSave={async () => {
                    const ok = await builder.persistBuilderDraft({ requireCompleteValidation: true });
                    if (ok) setShowSuccess(true);
                  }}
                  onSaveAndExit={async () => {
                    const ok = await builder.persistBuilderDraft({ requireCompleteValidation: true });
                    if (ok) {
                       setShowSuccess(true);
                       setTimeout(() => handleTabChange("lista"), 1500);
                    }
                  }}
                  onStepChange={builder.setBuilderStep}
                  onReset={builder.resetBuilder}
                  onPreview={(state) => {
                    setPreviewState(state);
                    setPreviewOpen(true);
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
          open={previewOpen}
          onOpenChange={setPreviewOpen}
          previewState={previewState}
          events={previewContractEvents}
          eventsLoading={previewContractEventsLoading}
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
