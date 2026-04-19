import { create } from "zustand";
import { supabase } from "@/integrations/supabase/client";

interface AdminState {
  counts: {
    leads: number;
    financeiro: number;
    projetos: number;
  };
  loading: boolean;
  lastUpdated: Date | null;
  refreshCounts: () => Promise<void>;
}

export const useAdminStore = create<AdminState>((set) => ({
  counts: {
    leads: 0,
    financeiro: 0,
    projetos: 0,
  },
  loading: false,
  lastUpdated: null,

  refreshCounts: async () => {
    set({ loading: true });
    try {
      const [newLeads, financeOpen, projectData] = await Promise.all([
        supabase.from("leads").select("*", { count: "exact", head: true }).eq("status", "novo"),
        supabase.from("financeiro").select("*", { count: "exact", head: true }).in("status", ["pendente", "em_atraso"]),
        supabase.from("projetos").select("id, status, data_entrega").neq("status", "concluido"),
      ]);

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const lateProjects = (projectData.data || []).filter((project: any) => {
        if (!project?.data_entrega) return false;
        const deliveryDate = new Date(project.data_entrega);
        deliveryDate.setHours(0, 0, 0, 0);
        return deliveryDate < today;
      }).length;

      set({
        counts: {
          leads: newLeads.count || 0,
          financeiro: financeOpen.count || 0,
          projetos: lateProjects,
        },
        lastUpdated: new Date(),
      });
    } catch (error) {
      console.error("Erro ao atualizar contadores globais:", error);
    } finally {
      set({ loading: false });
    }
  },
}));
