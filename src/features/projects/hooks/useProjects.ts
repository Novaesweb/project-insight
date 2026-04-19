import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { notifyClientPanel } from "@/lib/user-notifications";
import { useRealtimeRefresh } from "@/hooks/useRealtimeRefresh";
import { usePersistentDraftState } from "@/hooks/usePersistentDraftState";
import { DropResult } from "@hello-pangea/dnd";
import { projectService } from "../services/project-service";

export function useProjects() {
  const { toast } = useToast();
  const {
    state: projectsViewDraft,
    setState: setProjectsViewDraft,
  } = usePersistentDraftState({
    storageKey: "novaesweb:admin:projects:view-draft",
    initialState: {
      view: "kanban" as "lista" | "kanban",
    },
  });

  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [healthMetrics, setHealthMetrics] = useState<any>(null);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [projectsData, healthData, activityData] = await Promise.all([
        projectService.getAll(),
        projectService.getHealthMetrics(),
        projectService.getRecentActivity()
      ]);
      
      setProjects(projectsData);
      setHealthMetrics(healthData);
      setRecentActivity(activityData);
    } catch (error: any) {
      toast({ title: "Erro ao carregar dados", description: error.message, variant: "destructive" });
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  useRealtimeRefresh(
    [
      { table: "projetos" },
      { table: "clientes" },
      { table: "projeto_atualizacoes" },
    ],
    load,
    { channelPrefix: "admin-projects-list" }
  );

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId) return;

    const newStatus = destination.droppableId;
    const progressMap: Record<string, number> = { 
      briefing: 20, 
      design: 40, 
      desenvolvimento: 60, 
      homologacao: 85, 
      concluido: 100 
    };
    const newProgress = progressMap[newStatus];

    // Optimistic UI update
    setProjects(prev => prev.map(p => {
      if (p.id === draggableId) {
        return { 
          ...p, 
          status: newStatus, 
          progresso: newProgress !== undefined ? newProgress : p.progresso 
        };
      }
      return p;
    }));

    // Data-sync
    const { error } = await supabase
      .from("projetos")
      .update({ 
        status: newStatus, 
        progresso: newProgress !== undefined ? newProgress : 0 
      })
      .eq("id", draggableId);

    if (error) {
      toast({ 
        title: "Falha de Sincronia", 
        description: "O servidor rejeitou a atualização.", 
        variant: "destructive" 
      });
      load(); // rollback
    } else {
      const updatedProject = projects.find((p) => p.id === draggableId);
      await notifyClientPanel(updatedProject?.cliente_id, {
        title: "Projeto avançou de etapa",
        body: `${updatedProject?.titulo || "Seu projeto"} foi movido para ${newStatus}.`,
        url: "/cliente/projetos",
      });
    }
  };

  const deleteProject = async (projectId: string, projectTitle: string) => {
    try {
      const { data: files } = await supabase
        .from("projeto_arquivos" as any)
        .select("url")
        .eq("projeto_id", projectId);

      if (files && files.length > 0) {
        for (const file of files) {
          const path = file.url.split("projeto-arquivos/").pop();
          if (path) await supabase.storage.from("projeto-arquivos").remove([path]);
        }
      }

      await supabase.from("projeto_arquivos" as any).delete().eq("projeto_id", projectId);
      await supabase.from("projeto_atualizacoes").delete().eq("projeto_id", projectId);
      
      const { error } = await supabase.from("projetos").delete().eq("id", projectId);
      
      if (error) throw error;
      
      toast({ 
        title: "Projeto excluído!", 
        description: `"${projectTitle}" foi removido permanentemente.` 
      });
      load();
    } catch (error: any) {
      toast({ 
        title: "Erro ao excluir projeto", 
        description: error.message, 
        variant: "destructive" 
      });
    }
  };

  const kpis = {
    total: projects.length,
    active: projects.filter(p => p.status !== 'concluido').length,
    completed: projects.filter(p => p.status === 'concluido').length,
    late: projects.filter(p => {
      if (!p.data_entrega || p.status === 'concluido') return false;
      return new Date(p.data_entrega) < new Date();
    }).length,
  };

  return {
    projects,
    loading,
    healthMetrics,
    recentActivity,
    view: projectsViewDraft.view,
    setView: (view: "lista" | "kanban") => setProjectsViewDraft({ view }),
    handleDragEnd,
    deleteProject,
    load,
    kpis,
  };
}
