import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { notifyClientPanel } from "@/lib/user-notifications";
import { useRealtimeRefresh } from "@/hooks/useRealtimeRefresh";
import { usePersistentDraftState } from "@/hooks/usePersistentDraftState";

export function useProjectDetails(projectId: string | undefined) {
  const { toast } = useToast();
  const {
    state: detailsDraft,
    setState: setDetailsDraft,
    replaceState: replaceDetailsDraft,
    markSaved: markDetailsDraftSaved,
    isDirty: detailsDraftDirty,
  } = usePersistentDraftState({
    storageKey: `novaesweb:admin:projects:detail:${projectId}`,
    initialState: {
      novaAtualizacao: "",
      visivelCliente: true,
      urlSite: "",
      dataEntrega: "",
      horaEntrega: "",
    },
  });

  const [project, setProject] = useState<any>(null);
  const [order, setOrder] = useState<any>(null);
  const [updates, setUpdates] = useState<any[]>([]);
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);

  const loadData = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    
    const [
      { data: proj },
      { data: orderData },
      { data: updatesData },
      { data: filesData }
    ] = await Promise.all([
      supabase.from("projetos").select("*, clientes(nome, nome_empresa)").eq("id", projectId).single(),
      supabase.from("pedidos").select("codigo").eq("projeto_id", projectId).maybeSingle(),
      supabase.from("projeto_atualizacoes").select("*").eq("projeto_id", projectId).order("created_at", { ascending: false }),
      (supabase.from("projeto_arquivos" as any) as any).select("*").eq("projeto_id", projectId).order("created_at", { ascending: false })
    ]);

    setProject(proj);
    setOrder(orderData);
    setUpdates(updatesData || []);
    setFiles(filesData || []);

    if (proj && !detailsDraftDirty) {
      replaceDetailsDraft({
        novaAtualizacao: "",
        visivelCliente: true,
        urlSite: (proj as any).url_site || "",
        dataEntrega: (proj as any).data_entrega || "",
        horaEntrega: (proj as any).hora_entrega || "",
      }, { markClean: true });
    }
    setLoading(false);
  }, [detailsDraftDirty, projectId, replaceDetailsDraft]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useRealtimeRefresh(
    [
      { table: "projetos", filter: `id=eq.${projectId}` },
      { table: "pedidos", filter: `projeto_id=eq.${projectId}` },
      { table: "projeto_atualizacoes", filter: `projeto_id=eq.${projectId}` },
      { table: "projeto_arquivos", filter: `projeto_id=eq.${projectId}` },
    ],
    loadData,
    { channelPrefix: `admin-project-detail-${projectId}`, debounceMs: 350 }
  );

  const updateStatus = async (newStatus: string) => {
    const progressMap: Record<string, number> = { 
      briefing: 20, 
      design: 40, 
      desenvolvimento: 60, 
      homologacao: 85, 
      concluido: 100 
    };
    const newProgress = progressMap[newStatus] ?? project.progresso;
    
    const { error } = await supabase
      .from("projetos")
      .update({ status: newStatus, progresso: newProgress })
      .eq("id", projectId);

    if (error) {
      toast({ title: "Erro na atualização", description: error.message, variant: "destructive" });
    } else {
      setProject((prev: any) => ({ ...prev, status: newStatus, progresso: newProgress }));
      await notifyClientPanel(project.cliente_id, {
        title: "Projeto avançou de etapa",
        body: `${project.titulo} agora está em ${newStatus}.`,
        url: "/cliente/projetos",
      });
      toast({ title: "Status atualizado com sucesso!" });
    }
  };

  const saveProgress = async (value: number) => {
    if (value < project.progresso) return;
    
    const { error } = await supabase
      .from("projetos")
      .update({ progresso: value })
      .eq("id", projectId);

    if (!error) {
      toast({ title: `Progresso em ${value}%` });
      let novoStatus = project.status;
      if (value >= 100) novoStatus = "concluido";
      else if (value >= 85) novoStatus = "homologacao";
      else if (value >= 60) novoStatus = "desenvolvimento";
      else if (value >= 40) novoStatus = "design";
      else novoStatus = "briefing";
      
      await supabase.from("projetos").update({ status: novoStatus }).eq("id", projectId);
      setProject((prev: any) => ({ ...prev, progresso: value, status: novoStatus }));
    }
  };

  const saveDeliveryInfo = async () => {
    const { dataEntrega, horaEntrega } = detailsDraft;
    if (!dataEntrega.trim() || !horaEntrega.trim()) {
      toast({ title: "Dados incompletos", variant: "destructive" });
      return;
    }

    const { error } = await (supabase.from("projetos") as any).update({ 
      data_entrega: dataEntrega.trim(), 
      hora_entrega: horaEntrega.trim() 
    }).eq("id", projectId);
    
    if (error) {
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
    } else {
      setProject((prev: any) => ({ 
        ...prev, 
        data_entrega: dataEntrega.trim(), 
        hora_entrega: horaEntrega.trim() 
      }));
      markDetailsDraftSaved(detailsDraft);
      toast({ title: "Data de entrega agendada!" });
    }
  };

  const saveUrlSite = async () => {
    const { urlSite } = detailsDraft;
    if (!urlSite.trim()) return;

    const { error } = await (supabase.from("projetos") as any).update({ 
      url_site: urlSite.trim() 
    }).eq("id", projectId);

    if (error) {
      toast({ title: "Erro ao salvar URL", variant: "destructive" });
    } else {
      setProject((prev: any) => ({ ...prev, url_site: urlSite.trim() }));
      markDetailsDraftSaved(detailsDraft);
      toast({ title: "URL do site atualizada!" });
    }
  };

  const sendUpdate = async () => {
    const { novaAtualizacao, visivelCliente } = detailsDraft;
    if (!novaAtualizacao.trim()) return;

    setSending(true);
    const { error } = await supabase.from("projeto_atualizacoes").insert({ 
      projeto_id: projectId, 
      descricao: novaAtualizacao.trim(), 
      visivel_cliente: visivelCliente 
    });

    if (!error) {
      toast({ title: "Atualização enviada!" });
      setDetailsDraft({ ...detailsDraft, novaAtualizacao: "" });
      loadData();
    }
    setSending(false);
  };

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    try {
      const fileName = `${projectId}/${Date.now()}-${file.name}`;
      const { error: storageError } = await (supabase.storage.from("projeto-arquivos") as any).upload(fileName, file);
      if (storageError) throw storageError;

      const { data: { publicUrl } } = (supabase.storage.from("projeto-arquivos") as any).getPublicUrl(fileName);
      const { error: dbError } = await (supabase.from("projeto_arquivos" as any) as any).insert({
        projeto_id: projectId, 
        nome: file.name, 
        url: publicUrl, 
        tipo: file.name.split(".").pop(), 
        tamanho: file.size, 
        enviado_por: "admin"
      });

      if (dbError) throw dbError;
      toast({ title: "Arquivo enviado!" });
      loadData();
    } catch (error: any) {
      toast({ title: "Erro no upload", description: error.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const deleteFile = async (id: string, url: string) => {
    try {
      const path = url.split("projeto-arquivos/").pop();
      if (path) await (supabase.storage.from("projeto-arquivos") as any).remove([path]);
      await (supabase.from("projeto_arquivos" as any) as any).delete().eq("id", id);
      toast({ title: "Arquivo excluído!" });
      loadData();
    } catch (error: any) {
      toast({ title: "Erro na exclusão", variant: "destructive" });
    }
  };

  return {
    project,
    order,
    updates,
    files,
    loading,
    sending,
    uploading,
    detailsDraft,
    setDetailsDraft,
    updateStatus,
    saveProgress,
    saveDeliveryInfo,
    saveUrlSite,
    sendUpdate,
    handleFileUpload,
    deleteFile,
  };
}
