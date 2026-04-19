import { supabase } from "@/integrations/supabase/client";

export type ExtraCategory = "fixo" | "intermediario" | "mensal";

export interface ExtraCatalogItem {
  id: string;
  nome: string;
  descricao: string | null;
  categoria: ExtraCategory;
  preco_ativacao: number;
  preco_mensal: number;
  status: "ativo" | "inativo";
  created_at: string;
}

export interface PackageItem {
  id: string;
  nome: string;
  descricao: string | null;
  preco_total: number;
  created_at: string;
}

export const extraService = {
  async getCatalog() {
    const { data, error } = await supabase
      .from("extras_catalogo")
      .select("*")
      .order("nome");
    if (error) throw error;
    return data as ExtraCatalogItem[];
  },

  async getPackages() {
    const { data, error } = await (supabase.from as any)("pacotes")
      .select("*")
      .order("nome");
    if (error) throw error;
    return data as PackageItem[];
  },

  async getPackageItems() {
    const { data, error } = await (supabase.from as any)("pacote_itens").select("*");
    if (error) throw error;
    return data;
  },

  async getClientExtras() {
    const { data, error } = await supabase
      .from("extras_clientes")
      .select("extra_id")
      .eq("status", "ativo");
    if (error) throw error;
    return data;
  },

  async createExtra(extra: Partial<ExtraCatalogItem>) {
    const { data, error } = await supabase.from("extras_catalogo").insert(extra).select().single();
    if (error) throw error;
    return data;
  },

  async updateExtra(id: string, extra: Partial<ExtraCatalogItem>) {
    const { error } = await supabase.from("extras_catalogo").update(extra).eq("id", id);
    if (error) throw error;
  },

  async deleteExtra(id: string) {
    // Note: Usually we should check for dependencies or use Cascade delete in DB
    const { error } = await supabase.from("extras_catalogo").delete().eq("id", id);
    if (error) throw error;
  }
};
