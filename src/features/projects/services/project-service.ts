import { supabase } from "@/integrations/supabase/client";

export const projectService = {
  async getAll() {
    const { data, error } = await supabase
      .from("projetos")
      .select("*, clientes(nome, nome_empresa)")
      .order("updated_at", { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async getHealthMetrics() {
    // Busca projetos ativos e suas últimas atualizações
    const { data: projects, error } = await supabase
      .from("projetos")
      .select("id, titulo, updated_at, status")
      .neq("status", "concluido");

    if (error) throw error;

    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const staleProjects = projects.filter(p => new Date(p.updated_at) < threeDaysAgo);

    return {
      totalActive: projects.length,
      staleCount: staleProjects.length,
      staleProjects: staleProjects.slice(0, 3) // Top 3 precisando de atenção
    };
  },

  async getRecentActivity(limit = 5) {
    const { data, error } = await supabase
      .from("projeto_atualizacoes")
      .select("*, projetos(titulo)")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  }
};
