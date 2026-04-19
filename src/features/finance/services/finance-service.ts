import { supabase } from "@/integrations/supabase/client";

export type FinanceStatus = "pago" | "pendente" | "em_atraso";
export type FinanceType = "entrada" | "saida";

export interface FinanceEntry {
  id: string;
  descricao: string;
  tipo: FinanceType;
  valor: number;
  vencimento: string | null;
  status: FinanceStatus;
  cliente_id: string | null;
  clientes?: { nome: string } | null;
  created_at: string;
}

export const financeService = {
  async getAll(filters?: { status?: string; start?: string; end?: string }) {
    let query = supabase
      .from("financeiro")
      .select("*, clientes(nome)")
      .order("vencimento", { ascending: false });

    if (filters?.status && filters.status !== "todos") {
      query = query.eq("status", filters.status);
    }
    if (filters?.start) {
      query = query.gte("vencimento", filters.start);
    }
    if (filters?.end) {
      query = query.lte("vencimento", filters.end);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as FinanceEntry[];
  },

  async getStats(entries: FinanceEntry[]) {
    const totalRecebido = entries
      .filter(f => f.tipo === "entrada" && f.status === "pago")
      .reduce((s, f) => s + Number(f.valor), 0);
    
    const totalPendente = entries
      .filter(f => f.status === "pendente")
      .reduce((s, f) => s + Number(f.valor), 0);
    
    const totalAtraso = entries
      .filter(f => f.status === "em_atraso")
      .reduce((s, f) => s + Number(f.valor), 0);

    return {
      recebido: totalRecebido,
      pendente: totalPendente,
      atraso: totalAtraso,
      total: totalRecebido + totalPendente
    };
  },

  async updateStatus(id: string, status: FinanceStatus) {
    const { error } = await supabase
      .from("financeiro")
      .update({ status })
      .eq("id", id);
    if (error) throw error;
  },

  async delete(id: string) {
    const { error } = await supabase.from("financeiro").delete().eq("id", id);
    if (error) throw error;
  }
};
