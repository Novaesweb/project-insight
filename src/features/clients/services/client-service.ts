import { supabase } from "@/integrations/supabase/client";

export interface Client {
  id: string;
  nome: string;
  email: string;
  whatsapp: string | null;
  documento: string | null;
  nome_negocio: string | null;
  status: "ativo" | "inativo" | "bloqueado";
  created_at: string;
  avatar_url?: string | null;
}

export const clientService = {
  async getAll() {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("role", "cliente")
      .order("created_at", { ascending: false });
    
    if (error) throw error;
    return data as Client[];
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", id)
      .single();
    
    if (error) throw error;
    return data as Client;
  },

  async getClientStats(clientId: string) {
    const [projects, invoices] = await Promise.all([
      supabase.from("projects").select("id, status").eq("client_id", clientId),
      supabase.from("invoices").select("id, status, amount").eq("client_id", clientId),
    ]);

    return {
      projectsCount: projects.data?.length || 0,
      activeProjects: projects.data?.filter(p => p.status !== "concluido").length || 0,
      totalSpent: invoices.data?.reduce((acc, inv) => acc + (inv.amount || 0), 0) || 0,
      pendingInvoices: invoices.data?.filter(inv => inv.status === "pendente").length || 0,
    };
  },

  async update(id: string, updates: Partial<Client>) {
    const { error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", id);
    
    if (error) throw error;
  },

  async delete(id: string) {
    const { error } = await supabase.from("profiles").delete().eq("id", id);
    if (error) throw error;
  }
};
