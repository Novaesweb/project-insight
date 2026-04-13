import React, { useState, useEffect, useCallback } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { List, LayoutGrid, Calendar, User, ArrowLeft, Send, Clock, FileText, Download, Trash2, Upload, Loader2, Paperclip, Sparkles, ExternalLink, DollarSign, Target, BarChart3, Users, Globe, Copy, AlertTriangle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StatusBadge from "@/components/StatusBadge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { notifyClientPanel } from "@/lib/user-notifications";
import { DeleteConfirmDialog, useDeleteConfirm } from "@/components/DeleteConfirmDialog";
import { useRealtimeRefresh } from "@/hooks/useRealtimeRefresh";
import { usePersistentDraftState } from "@/hooks/usePersistentDraftState";

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

const kanbanColumns = [
  { key: "briefing", label: "📋 Briefing", color: "border-blue-500/50" },
  { key: "design", label: "🎨 Design & Branding", color: "border-purple-500/50" },
  { key: "desenvolvimento", label: "💻 Desenvolvimento", color: "border-amber-500/50" },
  { key: "homologacao", label: "🧪 Testes & SEO", color: "border-violet-500/50" },
  { key: "concluido", label: "🚀 Finalizado", color: "border-emerald-500/50" },
];

function ProjetoDetalhes({ projetoId, onBack, onReload, selectedProjeto, setSelectedProjeto }: { projetoId: string; onBack: () => void; onReload: () => void; selectedProjeto: string | null; setSelectedProjeto: (id: string | null) => void }) {
  const { toast } = useToast();
  const {
    state: detailsDraft,
    setState: setDetailsDraft,
    replaceState: replaceDetailsDraft,
    markSaved: markDetailsDraftSaved,
    isDirty: detailsDraftDirty,
  } = usePersistentDraftState({
    storageKey: `novaesweb:admin:projetos:detalhe:${projetoId}`,
    initialState: {
      novaAtualizacao: "",
      visivelCliente: true,
      urlSite: "",
      dataEntrega: "",
      horaEntrega: "",
    },
  });
  const [projeto, setProjeto] = useState<any>(null);
  const [pedido, setPedido] = useState<any>(null);
  const [atualizacoes, setAtualizacoes] = useState<any[]>([]);
  const [arquivos, setArquivos] = useState<any[]>([]);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const novaAtualizacao = detailsDraft.novaAtualizacao;
  const visivelCliente = detailsDraft.visivelCliente;
  const urlSite = detailsDraft.urlSite;
  const dataEntrega = detailsDraft.dataEntrega;
  const horaEntrega = detailsDraft.horaEntrega;

  const setNovaAtualizacao = useCallback((value: string) => {
    setDetailsDraft((current) => ({ ...current, novaAtualizacao: value }));
  }, [setDetailsDraft]);

  const setVisivelCliente = useCallback((value: boolean) => {
    setDetailsDraft((current) => ({ ...current, visivelCliente: value }));
  }, [setDetailsDraft]);

  const setUrlSite = useCallback((value: string) => {
    setDetailsDraft((current) => ({ ...current, urlSite: value }));
  }, [setDetailsDraft]);

  const setDataEntrega = useCallback((value: string) => {
    setDetailsDraft((current) => ({ ...current, dataEntrega: value }));
  }, [setDetailsDraft]);

  const setHoraEntrega = useCallback((value: string) => {
    setDetailsDraft((current) => ({ ...current, horaEntrega: value }));
  }, [setDetailsDraft]);

  const loadData = useCallback(async () => {
    const { data: proj } = await supabase.from("projetos").select("*, clientes(nome)").eq("id", projetoId).single();
    setProjeto(proj);
    if (proj) {
      if (!detailsDraftDirty) {
        replaceDetailsDraft({
          novaAtualizacao: "",
          visivelCliente: true,
          urlSite: (proj as any).url_site || "",
          dataEntrega: (proj as any).data_entrega || "",
          horaEntrega: (proj as any).hora_entrega || "",
        }, { markClean: true });
      }
      const { data: pedData } = await supabase.from("pedidos").select("codigo").eq("projeto_id", proj.id).maybeSingle();
      setPedido(pedData);
      
      const { data: atData } = await supabase.from("projeto_atualizacoes").select("*").eq("projeto_id", projetoId).order("created_at", { ascending: false });
      setAtualizacoes(atData || []);

      const { data: arData } = await (supabase.from("projeto_arquivos" as any) as any).select("*").eq("projeto_id", projetoId).order("created_at", { ascending: false });
      setArquivos(arData || []);
    }
  }, [detailsDraftDirty, projetoId, replaceDetailsDraft]);

  useEffect(() => { loadData(); }, [loadData]);

  useRealtimeRefresh(
    [
      { table: "projetos", filter: `id=eq.${projetoId}` },
      { table: "pedidos", filter: `projeto_id=eq.${projetoId}` },
      { table: "projeto_atualizacoes", filter: `projeto_id=eq.${projetoId}` },
      { table: "projeto_arquivos", filter: `projeto_id=eq.${projetoId}` },
    ],
    loadData,
    { channelPrefix: `admin-projeto-detalhe-${projetoId}`, debounceMs: 350 },
  );

  const updateStatus = async (newStatus: string) => {
    const progressMap: Record<string, number> = { briefing: 20, design: 40, desenvolvimento: 60, homologacao: 85, concluido: 100 };
    const newProgress = progressMap[newStatus] ?? projeto.progresso;
    const { error } = await supabase.from("projetos").update({ status: newStatus, progresso: newProgress }).eq("id", projetoId);
    if (error) { toast({ title: "Inconsistência Técnica", description: error.message, variant: "destructive" }); return; }
    else {
      setProjeto((prev: any) => ({ ...prev, status: newStatus, progresso: newProgress }));
      await notifyClientPanel(projeto.cliente_id, {
        title: "Projeto avançou de etapa",
        body: `${projeto.titulo} agora está em ${newStatus}.`,
        url: "/cliente/projetos",
      });
      toast({ title: "Parâmetro de Evolução Sincronizado!" });
    }
  };

  const handleProgressChange = (value: number[]) => {
    // Se já estiver em 100%, não permite alterar
    if (projeto.progresso >= 100) return;
    // Se tentar diminuir, não permite
    if (value[0] < projeto.progresso) return;
    setProjeto((prev: any) => ({ ...prev, progresso: value[0] }));
  };
  
  const saveProgresso = async (value: number[]) => {
    // Se já estiver em 100%, não permite salvar
    if (projeto.progresso >= 100) return;
    // Se tentar diminuir, não permite salvar
    if (value[0] < projeto.progresso) return;
    
    const { error } = await supabase.from("projetos").update({ progresso: value[0] }).eq("id", projetoId);
    if (!error) {
      toast({ title: `Engenharia de Solução em ${value[0]}%` });
      // Atualizar status baseado no progresso
      let novoStatus = projeto.status;
      if (value[0] >= 100) {
        novoStatus = "concluido";
      } else if (value[0] >= 85) {
        novoStatus = "homologacao";
      } else if (value[0] >= 60) {
        novoStatus = "desenvolvimento";
      } else if (value[0] >= 40) {
        novoStatus = "design";
      } else {
        novoStatus = "briefing";
      }
      
      // Atualizar status também
      await supabase.from("projetos").update({ status: novoStatus }).eq("id", projetoId);
      setProjeto((prev: any) => ({ ...prev, progresso: value[0], status: novoStatus }));
    }
  };

  const saveDataHoraEntrega = async () => {
    if (!dataEntrega.trim() || !horaEntrega.trim()) {
      toast({ title: "Dados incompletos", description: "Preencha data e hora de entrega", variant: "destructive" });
      return;
    }

    try {
      const { error } = await (supabase.from("projetos") as any).update({ 
        data_entrega: dataEntrega.trim(), 
        hora_entrega: horaEntrega.trim() 
      }).eq("id", projetoId);
      
      if (error) throw error;
      
      setProjeto((prev: any) => ({ 
        ...prev, 
        data_entrega: dataEntrega.trim(), 
        hora_entrega: horaEntrega.trim() 
      }));
      markDetailsDraftSaved({
        ...detailsDraft,
        dataEntrega: dataEntrega.trim(),
        horaEntrega: horaEntrega.trim(),
      });

      await notifyClientPanel(projeto.cliente_id, {
        title: "Entrega agendada",
        body: `${projeto.titulo} está previsto para ${dataEntrega.trim()} às ${horaEntrega.trim()}.`,
        url: "/cliente/projetos",
      });
      
      toast({ title: "Data de entrega salva!", description: "Projeto será entregue em " + dataEntrega + " às " + horaEntrega });
    } catch (error: any) {
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
    }
  };

  const saveUrlSite = async () => {
    if (!urlSite.trim()) {
      toast({ title: "URL inválida", description: "Digite uma URL válida para o site", variant: "destructive" });
      return;
    }

    try {
      const { error } = await (supabase.from("projetos") as any).update({ url_site: urlSite.trim() }).eq("id", projetoId);
      if (error) throw error;
      
      setProjeto((prev: any) => ({ ...prev, url_site: urlSite.trim() }));
      markDetailsDraftSaved({
        ...detailsDraft,
        urlSite: urlSite.trim(),
      });
      await notifyClientPanel(projeto.cliente_id, {
        title: "Link do projeto disponível",
        body: `O link de ${projeto.titulo} já está liberado no seu painel.`,
        url: "/cliente/projetos",
      });
      toast({ title: "URL do site atualizada!", description: "O cliente já pode acessar o link do projeto" });
    } catch (error: any) {
      toast({ title: "Erro ao salvar URL", description: error.message, variant: "destructive" });
    }
  };

  const copiarUrl = async () => {
    if (!urlSite.trim()) {
      toast({ title: "URL não definida", description: "Primeiro defina a URL para o site", variant: "destructive" });
      return;
    }

    try {
      await navigator.clipboard.writeText(urlSite.trim());
      toast({ title: "URL copiada!", description: "URL do site copiada para a área de transferência" });
    } catch (error) {
      toast({ title: "Erro ao copiar", description: "Não foi possível copiar a URL", variant: "destructive" });
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fileName = `${projetoId}/${Date.now()}-${file.name}`;
      const { error: storageError } = await (supabase.storage.from("projeto-arquivos") as any).upload(fileName, file);
      if (storageError) throw storageError;

      const { data: { publicUrl } } = (supabase.storage.from("projeto-arquivos") as any).getPublicUrl(fileName);
      const { error: dbError } = await (supabase.from("projeto_arquivos" as any) as any).insert({
        projeto_id: projetoId, nome: file.name, url: publicUrl, tipo: file.name.split(".").pop(), tamanho: file.size, enviado_por: "admin"
      });

      if (dbError) throw dbError;
      await notifyClientPanel(projeto.cliente_id, {
        title: "Novo arquivo disponível",
        body: `${file.name} foi adicionado ao projeto ${projeto.titulo}.`,
        url: "/cliente/projetos",
      });
      toast({ title: "Ativo Digital Processado!" });
      loadData();
    } catch (error: any) { toast({ title: "Falha na Engenharia do Ativo", description: error.message, variant: "destructive" }); }
    finally { setUploading(false); }
  };

  const { requestDelete, dialogProps: deleteDialogProps } = useDeleteConfirm();

  const deleteArquivo = (id: string, url: string) => {
    requestDelete(async () => {
      try {
        const path = url.split("projeto-arquivos/").pop();
        if (path) await (supabase.storage.from("projeto-arquivos") as any).remove([path]);
        await (supabase.from("projeto_arquivos" as any) as any).delete().eq("id", id);
        toast({ title: "Ativo removido da arquitetura" });
        loadData();
      } catch (error: any) { toast({ title: "Erro na remoção", description: error.message, variant: "destructive" }); }
    }, "Excluir Arquivo", "Este arquivo será removido permanentemente.");
  };

  const deleteProjeto = (projetoId: string, projetoTitulo: string) => {
    requestDelete(async () => {
      try {
        const { data: arquivos } = await (supabase.from("projeto_arquivos" as any) as any).select("url").eq("projeto_id", projetoId);
        if (arquivos && arquivos.length > 0) {
          for (const arquivo of arquivos) {
            const path = arquivo.url.split("projeto-arquivos/").pop();
            if (path) await (supabase.storage.from("projeto-arquivos") as any).remove([path]);
          }
        }
        await (supabase.from("projeto_arquivos" as any) as any).delete().eq("projeto_id", projetoId);
        await (supabase.from("projeto_atualizacoes") as any).delete().eq("projeto_id", projetoId);
        const { error } = await supabase.from("projetos").delete().eq("id", projetoId);
        if (error) throw error;
        toast({ title: "Projeto excluído!", description: `"${projetoTitulo}" foi removido permanentemente.` });
        onReload();
        if (selectedProjeto === projetoId) { setSelectedProjeto(null); }
      } catch (error: any) {
        toast({ title: "Erro ao excluir projeto", description: error.message, variant: "destructive" });
      }
    }, "Excluir Projeto", `O projeto "${projetoTitulo}" e todos os seus arquivos serão removidos permanentemente.`);
  };

  const enviarAtualizacao = async () => {
    if (!novaAtualizacao.trim()) return;
    setSending(true);
    const { error } = await supabase.from("projeto_atualizacoes").insert({ projeto_id: projetoId, descricao: novaAtualizacao.trim(), visivel_cliente: visivelCliente });
    if (!error) {
      toast({ title: "Evolução Registrada com Sucesso!" });
      if (visivelCliente && projeto?.cliente_id) {
        await notifyClientPanel(projeto.cliente_id, {
          title: "Nova atualização no projeto",
          body: novaAtualizacao.trim().substring(0, 120),
          url: "/cliente/projetos",
        });
      }
      setNovaAtualizacao("");
      loadData();
    }
    setSending(false);
  };

  if (!projeto) return <p className="text-white p-10 font-bold animate-pulse">Sincronizando arquitetura da solução...</p>;

  return (
    <motion.div className="space-y-6" initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.08 } } }}>
      <motion.div variants={fadeUp}>
        <Button variant="ghost" className="text-[hsl(var(--muted-foreground))] hover:text-white mb-3" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
        </Button>
        <Card className="glass-card border-[0.5px]">
          <CardContent className="p-5">
            <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-white">{projeto.titulo}</h2>
                  {pedido && <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-mono border border-primary/20">Origem: {pedido.codigo}</span>}
                </div>
                <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">{projeto.clientes?.nome || "Sem cliente"}</p>
              </div>
              <Select value={projeto.status} onValueChange={updateStatus}>
                <SelectTrigger className="w-[180px] glass-input border-0 text-white text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>{kanbanColumns.map(col => <SelectItem key={col.key} value={col.key}>{col.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <Tabs defaultValue="resumo" className="space-y-6">
        <TabsList className="glass-card border-[0.5px] bg-transparent p-1 gap-1">
          <TabsTrigger value="resumo" className="data-[state=active]:gradient-primary data-[state=active]:text-white text-xs px-6">Resumo</TabsTrigger>
          <TabsTrigger value="atualizacoes" className="data-[state=active]:gradient-primary data-[state=active]:text-white text-xs px-6">Atualizações</TabsTrigger>
          <TabsTrigger value="arquivos" className="data-[state=active]:gradient-primary data-[state=active]:text-white text-xs px-6">Arquivos ({arquivos.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="resumo" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="glass-card border-[0.5px]">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold text-white">Engenharia de Solução</p>
                  <span className="text-lg font-bold gradient-text">{projeto.progresso}%</span>
                </div>
                <Slider 
                  value={[projeto.progresso]} 
                  onValueChange={handleProgressChange} 
                  onValueCommit={saveProgresso} 
                  max={100} 
                  step={5} 
                  className="w-full"
                  disabled={projeto.progresso >= 100}
                />
                <p className="text-xs text-white/40 mt-2">
                  {projeto.progresso >= 100 
                    ? "🔒 Projeto finalizado - Barra de progresso bloqueada" 
                    : "Ajuste o progresso conforme necessário. A barra só avança e não volta."
                  }
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card border-[0.5px] border-amber-500/30 bg-amber-500/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-amber-400" /> Data & Hora de Entrega
                </CardTitle>
                <CardDescription className="text-[10px] text-white/40">Previsão de entrega do projeto</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] text-white/30 uppercase font-black">Data</Label>
                    <Input
                      type="date"
                      value={dataEntrega}
                      onChange={(e) => setDataEntrega(e.target.value)}
                      className="glass-input h-10 text-white text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] text-white/30 uppercase font-black">Hora</Label>
                    <Input
                      type="time"
                      value={horaEntrega}
                      onChange={(e) => setHoraEntrega(e.target.value)}
                      className="glass-input h-10 text-white text-sm"
                    />
                  </div>
                </div>
                <Button 
                  onClick={saveDataHoraEntrega}
                  className="w-full gradient-primary text-white"
                  size="sm"
                >
                  Salvar Data de Entrega
                </Button>
                {dataEntrega && horaEntrega && (
                  <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                    <p className="text-xs text-white/60 mb-1">Previsão de entrega:</p>
                    <p className="text-sm text-white font-semibold">
                      📅 {new Date(dataEntrega).toLocaleDateString('pt-BR')} às 🕐 {horaEntrega}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="glass-card border-[0.5px]">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between gap-3">
                  <CardTitle className="text-sm font-semibold text-white flex items-center gap-2"><Sparkles className="w-4 h-4 text-primary" /> Briefing do Cliente</CardTitle>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 border-white/10 bg-white/[0.03] text-[10px] text-white"
                    onClick={() => {
                            window.location.href = `/admin/briefings?cliente=${projeto.cliente_id}`;
                    }}
                  >
                    Abrir briefing
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-white/60 leading-relaxed whitespace-pre-wrap">{(projeto as any).briefing || "O cliente ainda não preencheu o briefing."}</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="glass-card border-[0.5px]">
              <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold text-white flex items-center gap-2"><List className="w-4 h-4 text-primary" /> Referências & Inspirações</CardTitle></CardHeader>
              <CardContent>
                { (projeto as any).referencias ? (
                  <div className="space-y-2">
                    {(projeto as any).referencias.split('\n').map((ref: string, i: number) => {
                      const isUrl = ref.trim().startsWith('http');
                      return (
                        <div key={i} className="text-[11px] p-2 rounded-lg bg-white/5 border border-white/5 truncate">
                          {isUrl ? (
                            <a href={ref.trim()} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline flex items-center gap-1">
                              <ExternalLink className="w-3 h-3" /> {ref.trim()}
                            </a>
                          ) : (
                            <span className="text-white/60">{ref}</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-white/40 italic">Nenhuma referência enviada.</p>
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="glass-card border-[0.5px]">
            <CardHeader><CardTitle className="text-sm font-semibold text-white">Descrição Interna</CardTitle></CardHeader>
            <CardContent><p className="text-xs text-white/60 leading-relaxed">{projeto.descricao || "Sem descrição."}</p></CardContent>
          </Card>

          <Card className="glass-card border-[0.5px] border-emerald-500/30 bg-emerald-500/5">
            <CardHeader>
              <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-400" /> URL do Site
              </CardTitle>
              <CardDescription className="text-[10px] text-white/40">Link para o cliente acessar o site finalizado</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="https://exemplo.com.br"
                  value={urlSite}
                  onChange={(e) => setUrlSite(e.target.value)}
                  className="flex-1 glass-input border-white/10 text-white text-sm"
                />
                <Button 
                  onClick={saveUrlSite}
                  className="gradient-primary text-white"
                  size="sm"
                >
                  Salvar
                </Button>
              </div>
              
              {urlSite && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-white/5 border border-white/10">
                  <div className="flex-1">
                    <p className="text-xs text-white/60 mb-1">URL do Projeto</p>
                    <p className="text-sm text-white font-mono truncate">{urlSite}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      onClick={copiarUrl}
                      size="sm"
                      variant="outline"
                      className="h-8 px-3 border-white/20 text-white hover:bg-white/10"
                    >
                      <Copy className="w-3 h-3 mr-1" />
                      Copiar
                    </Button>
                    <Button
                      asChild
                      size="sm"
                      variant="outline"
                      className="h-8 px-3 border-white/20 text-white hover:bg-white/10"
                    >
                      <a href={urlSite} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="glass-card border-[0.5px] border-primary/20 bg-primary/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 opacity-20"><Target className="w-12 h-12 text-primary" /></div>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-yellow-400" /> Blueprint de Escala (Upgrade Sugerido)
              </CardTitle>
              <CardDescription className="text-[10px] text-white/40">Engenharia preditiva baseada no ecossistema do cliente</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between group hover:border-primary/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center"><BarChart3 className="w-4 h-4 text-primary" /></div>
                    <div>
                      <p className="text-xs font-bold text-white">Otimização SEO Pro & Indexação</p>
                      <p className="text-[10px] text-white/40">Aumentar visibilidade e autoridade orgânica</p>
                    </div>
                  </div>
                  <Button size="sm" className="h-7 text-[9px] gradient-primary text-white font-bold px-3">Sugerir Upgrade</Button>
                </div>

                <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between group hover:border-primary/50 transition-colors opacity-60">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center"><Users className="w-4 h-4 text-blue-400" /></div>
                    <div>
                      <p className="text-xs font-bold text-white">Integração CRM & Automação de Leads</p>
                      <p className="text-[10px] text-white/40">Converter 3x mais com fluxos automáticos</p>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" className="h-7 text-[9px] text-white/40 border border-white/10 px-3">Planejado</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="atualizacoes" className="space-y-6">
          <Card className="glass-card border-[0.5px]">
            <CardHeader><CardTitle className="text-sm font-semibold text-white">Nova Atualização</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Textarea placeholder="O que foi feito?" className="glass-input text-white text-sm min-h-[100px]" value={novaAtualizacao} onChange={e => setNovaAtualizacao(e.target.value)} />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2"><Switch checked={visivelCliente} onCheckedChange={setVisivelCliente} /><Label className="text-xs text-white">Visível para o cliente</Label></div>
                <Button className="gradient-primary text-white" onClick={enviarAtualizacao} disabled={sending}>{sending ? "Enviando..." : "Enviar"}</Button>
              </div>
            </CardContent>
          </Card>
          <div className="space-y-3">
            {atualizacoes.map(at => (
              <Card key={at.id} className="glass-card border-[0.5px] p-4 font-normal">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] text-white/40">{new Date(at.created_at).toLocaleString("pt-BR")}</span>
                  <Badge variant="outline" className={at.visivel_cliente ? "bg-emerald-500/10 text-emerald-400 border-0 text-[9px]" : "bg-amber-500/10 text-amber-400 border-0 text-[9px]"}>{at.visivel_cliente ? "Cliente vê" : "Interno"}</Badge>
                </div>
                <p className="text-sm text-white/80">{at.descricao}</p>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="arquivos" className="space-y-6">
          <Card className="glass-card border-[0.5px]">
            <CardHeader className="flex flex-row items-center justify-between">
              <div><CardTitle className="text-sm font-semibold text-white">Arquivos do Projeto</CardTitle><p className="text-[10px] text-white/40">Shared assets</p></div>
              <div className="relative"><input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleUpload} disabled={uploading} /><Button size="sm" className="gradient-primary text-white text-xs">{uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3 mr-2" />} Enviar</Button></div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow className="border-white/5"><TableHead className="text-[10px] text-white/40">Nome</TableHead><TableHead className="text-[10px] text-white/40">De</TableHead><TableHead className="text-right text-[10px] text-white/40">Ações</TableHead></TableRow></TableHeader>
                <TableBody>
                  {arquivos.map(arq => (
                    <TableRow key={arq.id} className="border-white/5">
                      <TableCell><div className="flex items-center gap-2"><FileText className="w-3 h-3 text-primary" /><span className="text-xs text-white truncate max-w-[120px]">{arq.nome}</span></div></TableCell>
                      <TableCell><span className={`text-[9px] px-1.5 py-0.5 rounded-full ${arq.enviado_por === 'admin' ? 'bg-blue-500/10 text-blue-400' : 'bg-purple-500/10 text-purple-400'}`}>{arq.enviado_por === 'admin' ? 'VOCÊ' : 'CLIENTE'}</span></TableCell>
                      <TableCell className="text-right flex justify-end gap-1"><Button size="icon" variant="ghost" className="h-7 w-7" asChild><a href={arq.url} target="_blank" rel="noopener noreferrer"><Download className="w-3 h-3" /></a></Button><Button size="icon" variant="ghost" className="h-7 w-7 text-red-500/40 hover:text-red-500" onClick={() => deleteArquivo(arq.id, arq.url)}><Trash2 className="w-3 h-3" /></Button></TableCell>
                    </TableRow>
                  ))}
                  {arquivos.length === 0 && <TableRow><TableCell colSpan={3} className="text-center py-6 text-xs text-white/20">Sem arquivos.</TableCell></TableRow>}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <DeleteConfirmDialog {...deleteDialogProps} />
    </motion.div>
  );
}

export default function Projetos() {
  const {
    state: projetosViewDraft,
    setState: setProjetosViewDraft,
  } = usePersistentDraftState({
    storageKey: "novaesweb:admin:projetos:view-draft",
    initialState: {
      view: "kanban" as "lista" | "kanban",
      selectedProjeto: null as string | null,
    },
  });
  const view = projetosViewDraft.view;
  const [projetos, setProjetos] = useState<any[]>([]);
  const selectedProjeto = projetosViewDraft.selectedProjeto;
  const { toast } = useToast();

  const setView = useCallback((value: "lista" | "kanban") => {
    setProjetosViewDraft((current) => ({ ...current, view: value }));
  }, [setProjetosViewDraft]);

  const setSelectedProjeto = useCallback((value: string | null) => {
    setProjetosViewDraft((current) => ({ ...current, selectedProjeto: value }));
  }, [setProjetosViewDraft]);

  const load = useCallback(async () => {
    const { data } = await supabase.from("projetos").select("*, clientes(nome)").order("updated_at", { ascending: false });
    if (data) setProjetos(data);
  }, []);

  useEffect(() => { load(); }, [load]);

  useRealtimeRefresh(
    [
      { table: "projetos" },
      { table: "clientes" },
    ],
    load,
    { channelPrefix: "admin-projetos-lista" },
  );

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId) return;

    const newStatus = destination.droppableId;
    const progressMap: Record<string, number> = { briefing: 20, design: 40, desenvolvimento: 60, homologacao: 85, concluido: 100 };
    const newProgress = progressMap[newStatus];

    // Optimistic UI update
    setProjetos(prev => prev.map(p => {
      if (p.id === draggableId) return { ...p, status: newStatus, progresso: newProgress !== undefined ? newProgress : p.progresso };
      return p;
    }));

    // Data-sync
    const { error } = await supabase.from("projetos").update({ 
      status: newStatus, 
      progresso: newProgress !== undefined ? newProgress : 0 
    }).eq("id", draggableId);

    if (error) {
       toast({ title: "Falha de Sincronia", description: "O servidor rejeitou a atualização.", variant: "destructive" });
       load(); // rollback to real DB state
    } else {
      const projetoAtualizado = projetos.find((p) => p.id === draggableId);
      await notifyClientPanel(projetoAtualizado?.cliente_id, {
        title: "Projeto avançou de etapa",
        body: `${projetoAtualizado?.titulo || "Seu projeto"} foi movido para ${newStatus}.`,
        url: "/cliente/projetos",
      });
    }
  };

  const { requestDelete: requestDeleteOuter, dialogProps: outerDeleteProps } = useDeleteConfirm();

  const deleteProjeto = (projetoId: string, projetoTitulo: string) => {
    requestDeleteOuter(async () => {
      try {
        const { data: arquivos } = await (supabase.from("projeto_arquivos" as any) as any).select("url").eq("projeto_id", projetoId);
        if (arquivos && arquivos.length > 0) {
          for (const arquivo of arquivos) {
            const path = arquivo.url.split("projeto-arquivos/").pop();
            if (path) await (supabase.storage.from("projeto-arquivos") as any).remove([path]);
          }
        }
        await (supabase.from("projeto_arquivos" as any) as any).delete().eq("projeto_id", projetoId);
        await (supabase.from("projeto_atualizacoes") as any).delete().eq("projeto_id", projetoId);
        const { error } = await supabase.from("projetos").delete().eq("id", projetoId);
        if (error) throw error;
        toast({ title: "Projeto excluído!", description: `"${projetoTitulo}" foi removido permanentemente.` });
        load();
      } catch (error: any) {
        toast({ title: "Erro ao excluir projeto", description: error.message, variant: "destructive" });
      }
    }, "Excluir Projeto", `O projeto "${projetoTitulo}" será removido permanentemente.`);
  };

  if (selectedProjeto) return (
    <>
      <ProjetoDetalhes projetoId={selectedProjeto} onBack={() => setSelectedProjeto(null)} onReload={load} selectedProjeto={selectedProjeto} setSelectedProjeto={setSelectedProjeto} />
      <DeleteConfirmDialog {...outerDeleteProps} />
    </>
  );

  return (
    <motion.div className="space-y-6 ambient-glow min-h-screen pb-10" initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.08 } } }}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h1 className="text-xl sm:text-2xl font-black text-white tracking-tighter uppercase italic">Engenharia de Soluções</h1>
        <div className="flex gap-1 p-1 rounded-lg glass-card border-[0.5px]">
          <Button variant="ghost" size="sm" className={view === "lista" ? "gradient-primary text-white" : "text-white/40"} onClick={() => setView("lista")}><List className="w-4 h-4" /></Button>
          <Button variant="ghost" size="sm" className={view === "kanban" ? "gradient-primary text-white" : "text-white/40"} onClick={() => setView("kanban")}><LayoutGrid className="w-4 h-4" /></Button>
        </div>
      </div>

      {view === "kanban" ? (
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 items-start">
            {kanbanColumns.map(col => {
              const items = projetos.filter(p => p.status === col.key);
              return (
                <div key={col.key} className="flex flex-col gap-3 min-h-[300px]">
                  <div className="flex items-center gap-2 px-2 border-l-2 border-primary/20 shrink-0">
                    <span className="text-[10px] font-bold text-white/40 uppercase">{col.label}</span>
                  </div>
                  
                  <Droppable droppableId={col.key}>
                    {(provided, snapshot) => (
                      <div 
                        ref={provided.innerRef} 
                        {...provided.droppableProps} 
                        className={`flex flex-col gap-3 flex-1 p-2 rounded-xl transition-colors ${snapshot.isDraggingOver ? "bg-white/5" : "bg-transparent"}`}
                      >
                        {items.map((p, index) => (
                          <Draggable draggableId={p.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                style={{
                                  ...provided.draggableProps.style,
                                  opacity: snapshot.isDragging ? 0.9 : 1
                                }}
                              >
                                <Card 
                                  className={`glass-card border-white/5 hover:border-primary/20 cursor-grab active:cursor-grabbing group shadow-md transition-shadow ${snapshot.isDragging ? "ring-2 ring-primary bg-black/40 shadow-xl shadow-primary/20 scale-[1.02]" : ""}`} 
                                  onClick={() => !snapshot.isDragging && setSelectedProjeto(p.id)}
                                >
                                  <CardContent className="p-4 space-y-3">
                                    <div className="flex items-center justify-between mb-2">
                                      <p className="font-bold text-sm text-white group-hover:text-primary transition-colors">{p.titulo}</p>
                                      <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-7 w-7 text-red-500/40 hover:text-red-500 hover:bg-red-500/10"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          deleteProjeto(p.id, p.titulo);
                                        }}
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </Button>
                                    </div>
                                    <div className="w-full h-1 rounded-full bg-white/5 overflow-hidden"><div className="h-full gradient-primary" style={{ width: `${p.progresso}%` }} /></div>
                                    <div className="flex items-center justify-between text-[10px] text-white/40 font-mono"><p className="truncate pr-2">{p.clientes?.nome}</p><p>{p.progresso}%</p></div>
                                  </CardContent>
                                </Card>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
          </div>
        </DragDropContext>
      ) : (
        <Card className="glass-card border-[0.5px]">
          <CardContent className="pt-6 overflow-x-auto">
            <Table className="min-w-[600px]">
              <TableHeader><TableRow className="border-white/5"><TableHead className="text-white/40">Projeto</TableHead><TableHead className="text-white/40">Cliente</TableHead><TableHead className="text-white/40">Progresso</TableHead><TableHead className="text-white/40">Status</TableHead></TableRow></TableHeader>
              <TableBody>
                {projetos.map(p => (
                  <TableRow key={p.id} className="border-white/5 cursor-pointer hover:bg-white/5">
                    <TableCell className="font-medium text-white">{p.titulo}</TableCell>
                    <TableCell className="text-white/60">{p.clientes?.nome}</TableCell>
                    <TableCell><div className="flex items-center gap-2"><div className="w-16 h-1 rounded-full bg-white/5"><div className="h-full gradient-primary" style={{ width: `${p.progresso}%` }} /></div><span className="text-[10px]">{p.progresso}%</span></div></TableCell>
                    <TableCell><StatusBadge status={p.status} /></TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-red-500/40 hover:text-red-500 hover:bg-red-500/10"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteProjeto(p.id, p.titulo);
                        }}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
      <DeleteConfirmDialog {...outerDeleteProps} />
    </motion.div>
  );
}

function Badge({ children, variant, className }: any) {
  return <span className={`px-2 py-0.5 rounded text-white ${className}`}>{children}</span>;
}



