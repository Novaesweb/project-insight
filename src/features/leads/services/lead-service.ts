import { supabase } from "@/integrations/supabase/client";

export type LeadStatus = "novo" | "em_contato" | "convertido" | "perdido";

export interface Lead {
  id: string;
  nome: string;
  email: string;
  whatsapp: string;
  cidade: string | null;
  estado: string | null;
  documento: string | null;
  nome_negocio: string | null;
  segmento: string | null;
  servicos: string[];
  orcamento: string | null;
  como_conheceu: string | null;
  mensagem: string | null;
  status: LeadStatus;
  motivo_perda: string | null;
  visualizado: boolean;
  created_at: string;
  updated_at: string;
}

export const leadService = {
  async getAll() {
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (error) throw error;
    return data as Lead[];
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .eq("id", id)
      .single();
    
    if (error) throw error;
    return data as Lead;
  },

  async updateStatus(id: string, status: LeadStatus, extra?: Partial<Lead>) {
    const { error } = await supabase
      .from("leads")
      .update({ status, visualizado: true, ...extra })
      .eq("id", id);
    
    if (error) throw error;
  },

  async delete(id: string) {
    const { error } = await supabase.from("leads").delete().eq("id", id);
    if (error) throw error;
  },

  async getStats() {
    const { data, error } = await supabase.from("leads").select("status, created_at, visualizado");
    if (error) throw error;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return {
      total: data.length,
      new: data.filter(l => l.status === "novo").length,
      unvisited: data.filter(l => !l.visualizado).length,
      converted: data.filter(l => l.status === "convertido").length,
      todayCount: data.filter(l => new Date(l.created_at) >= today).length
    };
  }
};
