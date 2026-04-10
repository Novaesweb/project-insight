import {
  loadProposalFromSupabase,
  saveDraftToSupabase,
  saveProposalToSupabase,
} from "@novaesflow/supabase-adapter";

import { supabase } from "@/integrations/supabase/client";
import { refreshAdminSessionSilently } from "@/lib/admin-function-client";
import type { ContractEventRow } from "@/lib/contract-activity";

import { buildArchivePayload, buildSendToClientUpdate } from "./domain";
import { BUILDER_TEMPLATE_ID, type Cliente, type Contrato, type ContratoVersion, type ExtraCatalogo } from "./types";

export async function fetchBuilderContracts() {
  return loadProposalFromSupabase<Contrato[]>({
    client: supabase,
    table: "contratos",
    select: "*, clientes(nome)",
    orderBy: {
      column: "updated_at",
      ascending: false,
    },
    applyFilters: (query) => query.eq("modelo", BUILDER_TEMPLATE_ID),
  });
}

export async function fetchActiveClientes() {
  const { data } = await supabase
    .from("clientes")
    .select(
      "id, nome, nome_empresa, email, documento, whatsapp, telefone, endereco, numero_endereco, complemento, bairro, cidade, estado, cep, instagram, site_url, status",
    )
    .eq("status", "ativo")
    .order("nome", { ascending: true });

  return (data as Cliente[]) || [];
}

export async function fetchActiveExtrasCatalog() {
  const { data } = await supabase
    .from("extras_catalogo")
    .select("id, nome, descricao, categoria, preco_ativacao, preco_mensal, status, subcategoria")
    .eq("status", "ativo")
    .order("categoria", { ascending: true })
    .order("nome", { ascending: true });

  return (data as ExtraCatalogo[]) || [];
}

export async function fetchContractEvents(contractId: string) {
  const { data, error } = await supabase
    .from("contrato_eventos")
    .select("*")
    .eq("contrato_id", contractId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data as ContractEventRow[]) || [];
}

export async function saveBuilderContractRecord({
  contractId,
  payloadToPersist,
  currentContracts,
  createVersionSnapshot = true,
}: {
  contractId: string | null;
  payloadToPersist: Record<string, unknown>;
  currentContracts: Contrato[];
  createVersionSnapshot?: boolean;
}) {
  await refreshAdminSessionSilently({ force: false });

  const existingRecord = contractId ? currentContracts.find((item) => item.id === contractId) ?? null : null;

  if (contractId && createVersionSnapshot && !existingRecord) {
    throw new Error("Contrato não encontrado para atualização.");
  }

  const saveOptions = {
    client: supabase,
    table: "contratos",
    id: contractId,
    record: payloadToPersist,
    select: "*, clientes(nome)",
    applyFilters: contractId ? (query: any) => query.eq("modelo", BUILDER_TEMPLATE_ID) : undefined,
  };

  if (contractId && createVersionSnapshot && existingRecord) {
    return saveProposalToSupabase<Contrato>({
      ...saveOptions,
      versioning: {
        table: "contrato_versions",
        currentRecord: existingRecord,
        buildSnapshot: (currentRecord, nextVersionNumber) => ({
          contrato_id: currentRecord.id,
          version_number: nextVersionNumber,
          titulo: currentRecord.titulo,
          descricao: currentRecord.descricao,
          valor: currentRecord.valor,
          status: currentRecord.status,
          corpo: (currentRecord as any).corpo || "",
          builder_payload: currentRecord.builder_payload,
        }),
      },
    });
  }

  return saveDraftToSupabase<Contrato>(saveOptions);
}

export async function sendBuilderContractToClientRecord(contract: Contrato) {
  await refreshAdminSessionSilently({ force: false });

  const sentAt = new Date().toISOString();
  const { isResignFlow, update } = buildSendToClientUpdate(contract, sentAt);
  const { data, error } = await supabase
    .from("contratos")
    .update(update as any)
    .eq("id", contract.id)
    .eq("modelo", BUILDER_TEMPLATE_ID)
    .select("*, clientes(nome)")
    .single();

  if (error) {
    throw error;
  }

  return {
    contract: data as Contrato,
    sentAt,
    isResignFlow,
  };
}

export async function fetchContractVersions(contractId: string) {
  const { data, error } = await supabase
    .from("contrato_versions")
    .select("*")
    .eq("contrato_id", contractId)
    .order("version_number", { ascending: false });

  if (error) {
    throw error;
  }

  return (data as ContratoVersion[]) || [];
}

export async function setContractArchived(contractId: string, archived: boolean) {
  await refreshAdminSessionSilently({ force: false });

  const { data, error } = await supabase
    .from("contratos")
    .update(buildArchivePayload(archived) as any)
    .eq("id", contractId)
    .eq("modelo", BUILDER_TEMPLATE_ID)
    .select("*, clientes(nome)")
    .single();

  if (error) {
    throw error;
  }

  return data as Contrato;
}

export async function deleteBuilderDraftContract(contractId: string) {
  await refreshAdminSessionSilently({ force: false });

  const { error } = await supabase
    .from("contratos")
    .delete()
    .eq("id", contractId)
    .eq("modelo", BUILDER_TEMPLATE_ID)
    .eq("status", "rascunho");

  if (error) {
    throw error;
  }
}
