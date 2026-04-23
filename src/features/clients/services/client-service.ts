import type { Tables } from "@/integrations/supabase/types";
import { supabase } from "@/integrations/supabase/client";

type ClienteRow = Tables<"clientes">;

export interface Client {
  id: string;
  nome: string;
  email: string;
  whatsapp: string | null;
  telefone: string | null;
  documento: string | null;
  nome_empresa: string | null;
  nome_negocio: string | null;
  status: "ativo" | "inativo" | "bloqueado";
  created_at: string;
  updated_at: string;
  avatar: string | null;
  avatar_url?: string | null;
  auth_user_id: string | null;
  cidade: string | null;
  estado: string | null;
  endereco: string | null;
  site_url: string | null;
}

export interface CreateClientInput {
  nome: string;
  email: string;
  whatsapp?: string | null;
  telefone?: string | null;
  documento?: string | null;
  nome_empresa?: string | null;
  cidade?: string | null;
  estado?: string | null;
  endereco?: string | null;
  site_url?: string | null;
  status?: Client["status"];
  auth_user_id?: string | null;
}

function buildAvatar(nome: string) {
  return nome
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((item) => item[0]?.toUpperCase() || "")
    .join("") || "CL";
}

function mapClient(row: ClienteRow): Client {
  return {
    id: row.id,
    nome: row.nome,
    email: row.email,
    whatsapp: row.whatsapp || row.telefone || null,
    telefone: row.telefone || row.whatsapp || null,
    documento: row.documento || null,
    nome_empresa: row.nome_empresa || null,
    nome_negocio: row.nome_empresa || null,
    status: (row.status as Client["status"]) || "ativo",
    created_at: row.created_at,
    updated_at: row.updated_at,
    avatar: row.avatar || null,
    avatar_url: null,
    auth_user_id: row.auth_user_id || null,
    cidade: row.cidade || null,
    estado: row.estado || null,
    endereco: row.endereco || null,
    site_url: row.site_url || null,
  };
}

export const clientService = {
  async getAll() {
    const { data, error } = await supabase
      .from("clientes")
      .select("*")
      .eq("status", "ativo")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data || []).map(mapClient);
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from("clientes")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return mapClient(data);
  },

  async getClientStats(clientId: string) {
    const [pedidos, financeiro] = await Promise.all([
      supabase.from("pedidos").select("id, status, valor").eq("cliente_id", clientId),
      supabase.from("financeiro").select("id, status, valor").eq("cliente_id", clientId),
    ]);

    if (pedidos.error) throw pedidos.error;
    if (financeiro.error) throw financeiro.error;

    return {
      projectsCount: pedidos.data?.length || 0,
      activeProjects: pedidos.data?.filter((pedido) => pedido.status !== "concluido").length || 0,
      totalSpent: financeiro.data?.reduce((acc, item) => acc + Number(item.valor || 0), 0) || 0,
      pendingInvoices:
        financeiro.data?.filter((item) => ["pendente", "em_atraso"].includes(item.status || "")).length || 0,
    };
  },

  async create(input: CreateClientInput) {
    const normalizedEmail = input.email.trim().toLowerCase();
    const phone = input.whatsapp?.trim() || input.telefone?.trim() || "";

    const payload: Tables<"clientes">["Insert"] = {
      nome: input.nome.trim(),
      email: normalizedEmail,
      whatsapp: phone || null,
      telefone: input.telefone?.trim() || phone || null,
      documento: input.documento?.trim() || null,
      nome_empresa: input.nome_empresa?.trim() || null,
      cidade: input.cidade?.trim() || null,
      estado: input.estado?.trim() || null,
      endereco: input.endereco?.trim() || null,
      site_url: input.site_url?.trim() || null,
      status: input.status || "ativo",
      avatar: buildAvatar(input.nome),
      auth_user_id: input.auth_user_id || null,
      senha: null,
    };

    const { data, error } = await supabase.from("clientes").insert(payload).select("*").single();

    if (error) throw error;
    return mapClient(data);
  },

  async update(id: string, updates: Partial<Client>) {
    const payload: Tables<"clientes">["Update"] = {
      ...(updates.nome && { nome: updates.nome.trim() }),
      ...(updates.email && { email: updates.email.trim().toLowerCase() }),
      ...(updates.whatsapp !== undefined && { whatsapp: updates.whatsapp }),
      ...(updates.telefone !== undefined && { telefone: updates.telefone }),
      ...(updates.documento !== undefined && { documento: updates.documento }),
      ...(updates.nome_empresa !== undefined && { nome_empresa: updates.nome_empresa }),
      ...(updates.nome_negocio !== undefined && { nome_empresa: updates.nome_negocio }),
      ...(updates.status && { status: updates.status }),
      ...(updates.cidade !== undefined && { cidade: updates.cidade }),
      ...(updates.estado !== undefined && { estado: updates.estado }),
      ...(updates.endereco !== undefined && { endereco: updates.endereco }),
      ...(updates.site_url !== undefined && { site_url: updates.site_url }),
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from("clientes").update(payload).eq("id", id);
    if (error) {
      console.error(`[ClientService] Error updating client ${id}:`, error);
      throw new Error(`Falha ao atualizar cliente: ${error.message}`);
    }
  },

  async delete(id: string) {
    const { error } = await supabase.from("clientes").delete().eq("id", id);
    if (error) throw error;
  },
};
