import React, { useState, useEffect, useCallback, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

import { SuccessCelebration } from "@/components/SuccessCelebration";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ContractHeader } from "./components/ContractHeader";
import { ContractTabs } from "./components/ContractTabs";
import { ContractPreviewDrawer } from "./components/ContractPreviewDrawer";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

import { 
  Contrato,
  Cliente,
  ExtraCatalogo,
  ContratoVersion,
  BUILDER_TEMPLATE_ID,
  PreviewState
} from "./types";
import { useContractsCatalog } from "./hooks/useContractsCatalog";
import { useContractsRealtime } from "@/hooks/useContractsRealtime";
import { useContractCofre } from "./hooks/useContractCofre";
import { useContractBuilder } from "./hooks/useContractBuilder";
import { logContractAdminError } from "./debug";
import { 
  normalizeBuilderPayload, 
  buildBuilderSavePayload
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

type ContractsCatalogIssueArea = "contratos" | "clientes" | "extras";

type ContractsCatalogIssue = {
  area: ContractsCatalogIssueArea;
  title: string;
  message: string;
  reference: string;
};

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
  const clientesLookupRef = useRef(new Map<string, string>());
  const [extrasCatalogo, setExtrasCatalogo] = useState<ExtraCatalogo[]>([]);
  const [extrasLoaded, setExtrasLoaded] = useState(false);
  const [catalogIssues, setCatalogIssues] = useState<ContractsCatalogIssue[]>([]);
  
  // Preview & Versions state
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewState, setPreviewState] = useState<PreviewState | null>(null);
  const [previewContractEvents, setPreviewContractEvents] = useState<ContractEventRow[]>([]);
  const [previewContractEventsLoading, setPreviewContractEventsLoading] = useState(false);
  const [contractVersions, setContractVersions] = useState<ContratoVersion[]>([]);
  const [versionsLoading, setVersionsLoading] = useState(false);
  const [versionsContract, setVersionsContract] = useState<Contrato | null>(null);
  const [versionsOpen, setVersionsOpen] = useState(false);

  useEffect(() => {
    clientesLookupRef.current = new Map(clientes.map((cliente) => [cliente.id, cliente.nome]));
  }, [clientes]);

  // Helper functions for state updates
  const decorateContrato = useCallback((c: any): Contrato => ({
    ...c,
    clientes: c.clientes || (clientesLookupRef.current.get(c.cliente_id) ? { nome: clientesLookupRef.current.get(c.cliente_id)! } : null)
  }), []);

  const sortContratosByUpdatedAt = useCallback((items: Contrato[]) => {
    return [...items].sort((a, b) => {
      const dateA = new Date(a.updated_at || a.created_at || 0).getTime();
      const dateB = new Date(b.updated_at || b.created_at || 0).getTime();
      return dateB - dateA;
    });
  }, []);

  const sortContractEvents = useCallback((items: ContractEventRow[]) => {
    return [...items].sort((a, b) => {
      const dateA = new Date(a.created_at || 0).getTime();
      const dateB = new Date(b.created_at || 0).getTime();
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
  const { loadContratos, loadClientes, loadExtrasCatalogo, loadPreviewContractEvents } = useContractsCatalog({
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

  const loadInitialCatalog = useCallback(async () => {
    const loaders: Array<{
      area: ContractsCatalogIssueArea;
      title: string;
      run: () => Promise<unknown>;
    }> = [
      {
        area: "contratos",
        title: "Nao foi possivel carregar os contratos",
        run: loadContratos,
      },
      {
        area: "clientes",
        title: "Nao foi possivel carregar os clientes",
        run: loadClientes,
      },
      {
        area: "extras",
        title: "Nao foi possivel carregar o catalogo de extras",
        run: loadExtrasCatalogo,
      },
    ];

    const results = await Promise.allSettled(loaders.map((loader) => loader.run()));
    const nextIssues = results.flatMap((result, index) => {
      if (result.status === "fulfilled") return [];

      const loader = loaders[index];
      const debugEntry = logContractAdminError(`catalog-${loader.area}`, result.reason, {
        route: "admin/contratos",
      });

      return [{
        area: loader.area,
        title: loader.title,
        message: debugEntry.safeMessage,
        reference: debugEntry.reference,
      }];
    });

    setCatalogIssues(nextIssues);
    return nextIssues;
  }, [loadClientes, loadContratos, loadExtrasCatalogo]);

  useEffect(() => {
    void loadInitialCatalog();
  }, [loadInitialCatalog]);

  const handleRetryCatalog = useCallback(async () => {
    const nextIssues = await loadInitialCatalog();

    if (nextIssues.length === 0) {
      toast({ title: "Painel de contratos atualizado." });
      return;
    }

    toast({
      title: "Alguns dados continuam indisponiveis",
      description: "Use as referencias mostradas no aviso para localizar a falha rapidamente.",
      variant: "destructive",
    });
  }, [loadInitialCatalog, toast]);

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
      const debugEntry = logContractAdminError("contract-versions", error, {
        contractId: contrato.id,
        status: contrato.status,
      });

      toast({
        title: "Erro ao carregar versoes",
        description: `${debugEntry.safeMessage} Ref ${debugEntry.reference}.`,
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
          title: "Catalogo ainda carregando",
          description: "Os extras ainda estao sendo sincronizados. Tente novamente em instantes.",
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
        throw new Error("Nao foi possivel preparar a duplicacao da proposta.");
      }

      const duplicatedTitle = prepared.title.includes("Copia")
        ? prepared.title
        : `${prepared.title} - Copia`;

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
      const debugEntry = logContractAdminError("contract-duplicate", error, {
        contractId: contrato.id,
        clientId: contrato.cliente_id || null,
      });

      toast({
        title: "Erro ao duplicar contrato",
        description: `${debugEntry.safeMessage} Ref ${debugEntry.reference}.`,
        variant: "destructive"
      });
    }
  }, [extrasCatalogo, extrasLoaded, toast, upsertContratoState]);

  const handleOpenPreview = useCallback(async (contrato: Contrato) => {
    try {
      const proposal = normalizeBuilderPayload(contrato.builder_payload, extrasCatalogo, contrato.cliente_id);
      setPreviewState({
        title: contrato.titulo,
        body: (contrato.corpo as string) || "",
        contract: contrato,
        proposal,
      });
      setPreviewOpen(true);

      await loadPreviewContractEvents(contrato.id);
    } catch (error) {
      const debugEntry = logContractAdminError("contract-preview", error, {
        contractId: contrato.id,
        clientId: contrato.cliente_id || null,
      });

      setPreviewOpen(false);
      toast({
        title: "Erro ao abrir preview",
        description: `${debugEntry.safeMessage} Ref ${debugEntry.reference}.`,
        variant: "destructive",
      });
    }
  }, [extrasCatalogo, loadPreviewContractEvents, toast]);

  const handleSendToClient = useCallback(async (contrato: Contrato) => {
    try {
      const result = await sendBuilderContractToClientRecord(contrato);
      upsertContratoState(result.contract);

      await createContractEvent({
        contrato_id: contrato.id,
        tipo: "enviado",
        titulo: result.isResignFlow ? "Versao atualizada enviada" : "Contrato enviado",
        descricao: "O contrato foi enviado para o portal do cliente.",
        actor_type: "admin"
      });

      toast({ title: "Contrato enviado com sucesso!" });
      return true;
    } catch (error) {
      const debugEntry = logContractAdminError("contract-send-client", error, {
        contractId: contrato.id,
        clientId: contrato.cliente_id || null,
      });

      toast({
        title: "Erro ao enviar contrato",
        description: `${debugEntry.safeMessage} Ref ${debugEntry.reference}.`,
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

  const [searchTerm, setSearchTerm] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const builder = useContractBuilder({
    clientes,
    extrasCatalogo,
    extrasLoaded,
    upsertContratoState,
    setTab: handleTabChange,
    setCofreFilter: cofre.setCofreFilter,
    setSearchTerm: setSearchTerm
  });
  const { builderPayload, resetBuilder } = builder;

  const handleNewContract = useCallback(() => {
    try {
      resetBuilder();
    } catch (error) {
      const debugEntry = logContractAdminError("contract-new", error, {
        extrasLoaded,
      });

      toast({
        title: "Nao foi possivel iniciar um novo contrato",
        description: `${debugEntry.safeMessage} Ref ${debugEntry.reference}.`,
        variant: "destructive",
      });
    }
  }, [extrasLoaded, resetBuilder, toast]);

  useEffect(() => {
    if (activeTab !== "montador" || !extrasLoaded || builderPayload) return;
    resetBuilder();
  }, [activeTab, builderPayload, extrasLoaded, resetBuilder]);

  return (
    <div className="min-h-screen bg-[#0a0510] pb-20 pt-4 md:pt-8">
      <div className="container max-w-7xl px-4 md:px-6">
        
        <ContractHeader 
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          onNewContract={handleNewContract}
        />

        {catalogIssues.length > 0 && (
          <Alert className="mb-6 border-amber-500/30 bg-amber-500/10 text-white [&>svg]:text-amber-300">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Painel carregado com avisos</AlertTitle>
            <AlertDescription className="space-y-4 text-white/80">
              <p>
                Parte dos dados de contratos nao carregou. O painel continua aberto, mas alguns recursos podem ficar
                incompletos ate a proxima sincronizacao.
              </p>
              <div className="space-y-2">
                {catalogIssues.map((issue) => (
                  <div key={issue.area} className="rounded-xl border border-white/10 bg-black/20 p-3">
                    <p className="text-sm font-semibold text-white">{issue.title}</p>
                    <p className="text-sm text-white/70">{issue.message}</p>
                    <p className="text-xs text-white/40">Referencia: {issue.reference}</p>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                <Button type="button" size="sm" onClick={() => void handleRetryCatalog()}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Tentar novamente
                </Button>
                <Button type="button" size="sm" variant="outline" onClick={() => window.location.reload()}>
                  Recarregar pagina
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <ContractTabs 
          activeTab={activeTab}
          onTabChange={handleTabChange}
          cofre={cofre}
          builder={builder}
          clientes={clientes}
          extrasCatalogo={extrasCatalogo}
          onPreview={handleOpenPreview}
          onDuplicate={handleDuplicateContract}
          onVersions={handleOpenVersions}
          onSend={handleSendToClient}
        />

        <ContractPreviewDrawer
          open={previewOpen}
          onOpenChange={setPreviewOpen}
          previewState={previewState}
          events={previewContractEvents}
          eventsLoading={previewContractEventsLoading}
        />

        <SuccessCelebration 
          show={showSuccess} 
          onComplete={() => setShowSuccess(false)}
          title="Contrato Finalizado!"
          subtitle="Seu documento foi gerado e salvo com sucesso no cofre premium."
        />

        <AnimatePresence>
          {cofre.deleteTarget && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => cofre.setDeleteTarget(null)}
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-[#15101c] p-6 shadow-2xl"
              >
                <h3 className="mb-2 text-xl font-bold text-white">Confirmar exclusao</h3>
                <p className="mb-6 text-sm text-white/60">
                  Voce tem certeza que deseja excluir o rascunho <strong>{cofre.deleteTarget.titulo}</strong>? 
                  Esta acao nao pode ser desfeita.
                </p>
                <div className="flex justify-end gap-3">
                  <Button variant="ghost" onClick={() => cofre.setDeleteTarget(null)} className="text-white/60 hover:text-white">
                    Cancelar
                  </Button>
                  <Button variant="destructive" onClick={() => cofre.handleDeleteDraft()}>
                    Excluir rascunho
                  </Button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
