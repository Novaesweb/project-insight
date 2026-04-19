import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  Sparkles, 
  Calendar, 
  Globe, 
  List, 
  Upload, 
  Loader2, 
  FileText, 
  Download, 
  Trash2,
  ExternalLink,
  Copy,
  Target,
  BarChart3,
  Users,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useProjectDetails } from "@/features/projects/hooks/useProjectDetails";
import { DeleteConfirmDialog, useDeleteConfirm } from "@/components/DeleteConfirmDialog";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const kanbanColumns = [
  { key: "briefing", label: "📋 Briefing" },
  { key: "design", label: "🎨 Design & Branding" },
  { key: "desenvolvimento", label: "💻 Desenvolvimento" },
  { key: "homologacao", label: "🧪 Testes & SEO" },
  { key: "concluido", label: "🚀 Finalizado" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function ProjectDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
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
    deleteFile
  } = useProjectDetails(id);

  const { requestDelete, dialogProps } = useDeleteConfirm();

  if (loading && !project) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="text-white/40 font-bold animate-pulse">Sincronizando arquitetura da solução...</p>
      </div>
    );
  }

  if (!project) return <div className="p-10 text-white">Projeto não encontrado.</div>;

  const copiarUrl = async () => {
    if (!detailsDraft.urlSite) return;
    await navigator.clipboard.writeText(detailsDraft.urlSite);
    toast({ title: "URL copiada!" });
  };

  return (
    <motion.div
      className="space-y-6 pb-20"
      initial="hidden"
      animate="show"
      variants={{ show: { transition: { staggerChildren: 0.08 } } }}
    >
      {/* Header */}
      <motion.div variants={fadeUp} className="flex flex-col gap-4">
        <Button variant="ghost" asChild className="w-fit text-white/40 hover:text-white px-0 hover:bg-transparent">
          <Link to="/admin/projetos">
            <ArrowLeft className="w-4 h-4 mr-2" /> Voltar aos projetos
          </Link>
        </Button>
        
        <Card className="glass-card-premium overflow-hidden">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start justify-between gap-6">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-black text-white tracking-tight">{project.titulo}</h1>
                  {order && (
                    <Badge variant="outline" className="border-primary/20 bg-primary/5 text-primary text-[10px] uppercase font-black tracking-widest">
                      Pedido: {order.codigo}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-white/40 font-medium">
                  {project.clientes?.nome_empresa || project.clientes?.nome || "Cliente não identificado"}
                </p>
              </div>

              <div className="flex items-center gap-3 self-end md:self-auto">
                <Select value={project.status} onValueChange={updateStatus}>
                  <SelectTrigger className="w-[200px] glass-card-premium border-white/5 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-white/10 text-white">
                    {kanbanColumns.map(col => (
                      <SelectItem key={col.key} value={col.key}>{col.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="resumo" className="space-y-8">
        <TabsList className="bg-white/5 p-1 rounded-xl border border-white/5">
          <TabsTrigger value="resumo" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white">Resumo</TabsTrigger>
          <TabsTrigger value="atualizacoes" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white">Linha do Tempo</TabsTrigger>
          <TabsTrigger value="arquivos" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white">Arquivos ({files.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="resumo" className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Progresso */}
            <Card className="glass-card-premium">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-black uppercase tracking-widest text-white/60">Progresso da Engenharia</CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-0 space-y-4">
                <div className="flex items-end justify-between">
                  <span className="text-4xl font-black text-white">{project.progresso}%</span>
                  <div className="h-2 w-24 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full gradient-primary" style={{ width: `${project.progresso}%` }} />
                  </div>
                </div>
                <Slider 
                  value={[project.progresso]} 
                  onValueChange={(v) => saveProgress(v[0])}
                  max={100} 
                  step={5} 
                  disabled={project.progresso >= 100}
                />
                <p className="text-[10px] text-white/30 italic">
                  O progresso é incremental e bloqueia em 100%.
                </p>
              </CardContent>
            </Card>

            {/* Entrega */}
            <Card className="glass-card-premium">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-black uppercase tracking-widest text-white/60">Agendamento de Entrega</CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-0 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase text-white/30">Data</Label>
                    <Input 
                      type="date" 
                      className="glass-card-premium border-white/5 text-white text-xs h-9"
                      value={detailsDraft.dataEntrega}
                      onChange={(e) => setDetailsDraft({ ...detailsDraft, dataEntrega: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase text-white/30">Hora</Label>
                    <Input 
                      type="time" 
                      className="glass-card-premium border-white/5 text-white text-xs h-9"
                      value={detailsDraft.horaEntrega}
                      onChange={(e) => setDetailsDraft({ ...detailsDraft, horaEntrega: e.target.value })}
                    />
                  </div>
                </div>
                <Button onClick={saveDeliveryInfo} className="w-full gradient-primary text-white h-9 text-xs font-bold">Salvar Agenda</Button>
              </CardContent>
            </Card>

            {/* URL Site */}
            <Card className="glass-card-premium">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-black uppercase tracking-widest text-white/60">Acesso ao Site</CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-0 space-y-4">
                <div className="flex gap-2">
                  <Input 
                    placeholder="https://..." 
                    className="glass-card-premium border-white/5 text-white text-xs h-9"
                    value={detailsDraft.urlSite}
                    onChange={(e) => setDetailsDraft({ ...detailsDraft, urlSite: e.target.value })}
                  />
                  <Button onClick={saveUrlSite} className="gradient-primary text-white h-9 px-4 text-xs font-bold">OK</Button>
                </div>
                {project.url_site && (
                  <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/10">
                    <span className="text-[10px] text-white/60 truncate max-w-[120px]">{project.url_site}</span>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-white/40 hover:text-white" onClick={copiarUrl}><Copy className="h-3 w-3" /></Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-white/40 hover:text-white" asChild><a href={project.url_site} target="_blank" rel="noopener noreferrer"><ExternalLink className="h-3 w-3" /></a></Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Info Section */}
            <div className="space-y-8">
              <Card className="glass-card-premium">
                <CardHeader>
                  <CardTitle className="text-sm font-black uppercase tracking-widest text-white/60 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" /> Briefing Coletado
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[200px] pr-4">
                    <p className="text-sm text-white/70 leading-relaxed whitespace-pre-wrap">
                      {project.briefing || "Nenhum briefing preenchido ainda."}
                    </p>
                  </ScrollArea>
                </CardContent>
              </Card>

              <Card className="glass-card-premium">
                <CardHeader>
                  <CardTitle className="text-sm font-black uppercase tracking-widest text-white/60 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" /> Referências & Inspirações
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[150px] pr-4">
                    {project.referencias ? (
                      <div className="space-y-3">
                        {project.referencias.split('\n').map((ref: string, i: number) => {
                          const isUrl = ref.trim().startsWith('http');
                          return (
                            <div key={i} className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between group">
                              <span className="text-xs text-white/60 truncate">{ref}</span>
                              {isUrl && (
                                <Button size="icon" variant="ghost" className="h-6 w-6" asChild>
                                  <a href={ref.trim()} target="_blank" rel="noopener noreferrer"><ExternalLink className="h-3 w-3" /></a>
                                </Button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : <p className="text-xs text-white/40 italic">Nenhuma referência enviada.</p>}
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            {/* Blueprint Section */}
            <Card className="glass-card-premium border-primary/20 bg-primary/5 relative overflow-hidden h-fit">
              <div className="absolute top-0 right-0 p-4 opacity-10"><Target className="w-20 h-20 text-primary" /></div>
              <CardHeader>
                <CardTitle className="text-lg font-black text-white flex items-center gap-3">
                   <Sparkles className="h-5 w-5 text-yellow-400" /> Blueprint de Escala
                </CardTitle>
                <CardDescription className="text-xs text-white/50">Oportunidades de crescimento sugeridas pela NovaesWeb</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { title: "SEO Pro & Indexação", desc: "Aumentar autoridade orgânica", icon: BarChart3, status: "Sugerido" },
                  { title: "CRM & Automação", desc: "Fluxos de conversão 3x", icon: Users, status: "Planejado" }
                ].map((item) => (
                  <div key={item.title} className="p-4 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-between group hover:border-primary/40 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary"><item.icon className="h-5 w-5" /></div>
                      <div>
                        <p className="text-sm font-bold text-white">{item.title}</p>
                        <p className="text-[10px] text-white/40">{item.desc}</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" className="h-8 text-[10px] font-black uppercase border-white/10 text-white/60">{item.status}</Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="atualizacoes" className="space-y-8">
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1">
                <Card className="glass-card-premium sticky top-6">
                  <CardHeader>
                    <CardTitle className="text-sm font-black uppercase tracking-widest text-white/60">Registrar Evolução</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Textarea 
                      placeholder="Descreva a atualização técnica..." 
                      className="glass-card-premium border-white/5 text-white text-sm min-h-[120px]"
                      value={detailsDraft.novaAtualizacao}
                      onChange={(e) => setDetailsDraft({ ...detailsDraft, novaAtualizacao: e.target.value })}
                    />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Switch 
                          checked={detailsDraft.visivelCliente}
                          onCheckedChange={(v) => setDetailsDraft({ ...detailsDraft, visivelCliente: v })}
                        />
                        <Label className="text-xs text-white/60">Visível no Painel</Label>
                      </div>
                      <Button onClick={sendUpdate} disabled={sending} className="gradient-primary text-white font-bold h-9">
                        {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Enviar"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="lg:col-span-2 space-y-4">
                {updates.map((up) => (
                  <motion.div key={up.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                    <Card className="glass-card-premium p-5 border-l-4 border-l-primary/40">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/30">
                          {new Date(up.created_at).toLocaleString("pt-BR")}
                        </span>
                        <Badge className={up.visivel_cliente ? "bg-emerald-500/10 text-emerald-400 border-0" : "bg-amber-500/10 text-amber-400 border-0"}>
                          {up.visivel_cliente ? "Cliente Visualiza" : "Uso Interno"}
                        </Badge>
                      </div>
                      <p className="text-sm text-white/80 leading-relaxed">{up.descricao}</p>
                    </Card>
                  </motion.div>
                ))}
                {updates.length === 0 && (
                  <div className="text-center py-20 text-white/20 italic">Ainda não há registros nesta timeline.</div>
                )}
              </div>
           </div>
        </TabsContent>

        <TabsContent value="arquivos" className="space-y-8">
           <Card className="glass-card-premium">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-black text-white">Assets do Projeto</CardTitle>
                  <CardDescription className="text-white/40">Gerencie arquivos, designs e documentos compartilhados.</CardDescription>
                </div>
                <div className="relative">
                  <input 
                    type="file" 
                    className="absolute inset-0 opacity-0 cursor-pointer" 
                    onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])} 
                    disabled={uploading} 
                  />
                  <Button disabled={uploading} className="gradient-primary text-white font-bold h-10 px-6">
                    {uploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                    Upload de Ativo
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/5 hover:bg-transparent">
                      <TableHead className="text-white/30 text-[10px] uppercase font-black">Documento</TableHead>
                      <TableHead className="text-white/30 text-[10px] uppercase font-black">Fonte</TableHead>
                      <TableHead className="text-right text-white/30 text-[10px] uppercase font-black">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {files.map((file) => (
                      <TableRow key={file.id} className="border-white/5 hover:bg-white/[0.02] transition-colors">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center text-primary"><FileText className="h-4 w-4" /></div>
                            <div>
                              <p className="text-xs font-bold text-white truncate max-w-[200px]">{file.nome}</p>
                              <p className="text-[9px] text-white/30">{(file.tamanho / 1024 / 1024).toFixed(2)} MB • {file.tipo}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={file.enviado_por === 'admin' ? "bg-blue-500/10 text-blue-400 border-0" : "bg-purple-500/10 text-purple-400 border-0"}>
                            {file.enviado_por === 'admin' ? 'EQUIPE' : 'CLIENTE'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-white/30 hover:text-white" asChild>
                              <a href={file.url} target="_blank" rel="noopener noreferrer"><Download className="h-4 w-4" /></a>
                            </Button>
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="h-8 w-8 text-white/20 hover:text-red-500"
                              onClick={() => requestDelete(() => deleteFile(file.id, file.url), "Excluir Ativo", `Deseja remover ${file.nome}?`)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {files.length === 0 && (
                   <div className="text-center py-20 text-white/20 italic">Sem arquivos processados para este projeto.</div>
                )}
              </CardContent>
           </Card>
        </TabsContent>
      </Tabs>

      <DeleteConfirmDialog {...dialogProps} />
    </motion.div>
  );
}
