import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { List, LayoutGrid, Calendar, User, ArrowLeft, Send, Clock, FileText, Download, Trash2, Upload, Loader2, Paperclip, Sparkles, ExternalLink } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StatusBadge from "@/components/StatusBadge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

const kanbanColumns = [
  { key: "briefing", label: "📋 Briefing", color: "border-blue-500/50" },
  { key: "design", label: "🎨 Design & Branding", color: "border-purple-500/50" },
  { key: "desenvolvimento", label: "💻 Desenvolvimento", color: "border-amber-500/50" },
  { key: "homologacao", label: "🧪 Testes & SEO", color: "border-violet-500/50" },
  { key: "concluido", label: "🚀 Finalizado", color: "border-emerald-500/50" },
];

function ProjetoDetalhes({ projetoId, onBack }: { projetoId: string; onBack: () => void }) {
  const { toast } = useToast();
  const [projeto, setProjeto] = useState<any>(null);
  const [pedido, setPedido] = useState<any>(null);
  const [atualizacoes, setAtualizacoes] = useState<any[]>([]);
  const [arquivos, setArquivos] = useState<any[]>([]);
  const [novaAtualizacao, setNovaAtualizacao] = useState("");
  const [visivelCliente, setVisivelCliente] = useState(true);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);

  const loadData = async () => {
    const { data: proj } = await supabase.from("projetos").select("*, clientes(nome)").eq("id", projetoId).single();
    setProjeto(proj);
    if (proj) {
      const { data: pedData } = await supabase.from("pedidos").select("codigo").eq("projeto_id", proj.id).maybeSingle();
      setPedido(pedData);
      
      const { data: atData } = await supabase.from("projeto_atualizacoes").select("*").eq("projeto_id", projetoId).order("created_at", { ascending: false });
      setAtualizacoes(atData || []);

      const { data: arData } = await (supabase.from("projeto_arquivos" as any) as any).select("*").eq("projeto_id", projetoId).order("created_at", { ascending: false });
      setArquivos(arData || []);
    }
  };

  useEffect(() => { loadData(); }, [projetoId]);

  const updateStatus = async (newStatus: string) => {
    const progressMap: Record<string, number> = { briefing: 20, design: 40, desenvolvimento: 60, homologacao: 85, concluido: 100 };
    const newProgress = progressMap[newStatus] ?? projeto.progresso;
    const { error } = await supabase.from("projetos").update({ status: newStatus, progresso: newProgress }).eq("id", projetoId);
    if (error) toast({ title: "Erro", description: error.message, variant: "destructive" });
    else {
      setProjeto((prev: any) => ({ ...prev, status: newStatus, progresso: newProgress }));
      toast({ title: "Status e progresso atualizados!" });
    }
  };

  const handleProgressChange = (value: number[]) => setProjeto((prev: any) => ({ ...prev, progresso: value[0] }));
  const saveProgresso = async (value: number[]) => {
    const { error } = await supabase.from("projetos").update({ progresso: value[0] }).eq("id", projetoId);
    if (!error) toast({ title: `Progresso atualizado para ${value[0]}%` });
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
      toast({ title: "Arquivo enviado!" });
      loadData();
    } catch (error: any) { toast({ title: "Erro no envio", description: error.message, variant: "destructive" }); }
    finally { setUploading(false); }
  };

  const deleteArquivo = async (id: string, url: string) => {
    if (!confirm("Excluir este arquivo?")) return;
    try {
      const path = url.split("projeto-arquivos/").pop();
      if (path) await (supabase.storage.from("projeto-arquivos") as any).remove([path]);
      await (supabase.from("projeto_arquivos" as any) as any).delete().eq("id", id);
      toast({ title: "Arquivo excluído" });
      loadData();
    } catch (error: any) { toast({ title: "Erro", description: error.message, variant: "destructive" }); }
  };

  const enviarAtualizacao = async () => {
    if (!novaAtualizacao.trim()) return;
    setSending(true);
    const { error } = await supabase.from("projeto_atualizacoes").insert({ projeto_id: projetoId, descricao: novaAtualizacao.trim(), visivel_cliente: visivelCliente });
    if (!error) { toast({ title: "Atualização registrada!" }); setNovaAtualizacao(""); loadData(); }
    setSending(false);
  };

  if (!projeto) return <p className="text-white p-10">Carregando detalhes do projeto...</p>;

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
          <Card className="glass-card border-[0.5px]">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3"><p className="text-sm font-semibold text-white">Progresso Real</p><span className="text-lg font-bold gradient-text">{projeto.progresso}%</span></div>
              <Slider value={[projeto.progresso]} onValueChange={handleProgressChange} onValueCommit={saveProgresso} max={100} step={5} className="w-full" />
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="glass-card border-[0.5px]">
              <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold text-white flex items-center gap-2"><Sparkles className="w-4 h-4 text-primary" /> Briefing do Cliente</CardTitle></CardHeader>
              <CardContent>
                <p className="text-xs text-white/60 leading-relaxed whitespace-pre-wrap">{(projeto as any).briefing || "O cliente ainda não preencheu o briefing."}</p>
              </CardContent>
            </Card>

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
    </motion.div>
  );
}

export default function Projetos() {
  const [view, setView] = useState<"lista" | "kanban">("kanban");
  const [projetos, setProjetos] = useState<any[]>([]);
  const [selectedProjeto, setSelectedProjeto] = useState<string | null>(null);

  const load = async () => {
    const { data } = await supabase.from("projetos").select("*, clientes(nome)").order("updated_at", { ascending: false });
    if (data) setProjetos(data);
  };

  useEffect(() => { load(); }, []);

  if (selectedProjeto) return <ProjetoDetalhes projetoId={selectedProjeto} onBack={() => setSelectedProjeto(null)} />;

  return (
    <motion.div className="space-y-6 ambient-glow min-h-screen pb-10" initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.08 } } }}>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white tracking-tight">Projetos</h1>
        <div className="flex gap-1 p-1 rounded-lg glass-card border-[0.5px]">
          <Button variant="ghost" size="sm" className={view === "lista" ? "gradient-primary text-white" : "text-white/40"} onClick={() => setView("lista")}><List className="w-4 h-4" /></Button>
          <Button variant="ghost" size="sm" className={view === "kanban" ? "gradient-primary text-white" : "text-white/40"} onClick={() => setView("kanban")}><LayoutGrid className="w-4 h-4" /></Button>
        </div>
      </div>

      {view === "kanban" ? (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {kanbanColumns.map(col => {
            const items = projetos.filter(p => p.status === col.key);
            return (
              <div key={col.key} className="space-y-3">
                <div className="flex items-center gap-2 px-2 border-l-2 border-primary/20"><span className="text-[10px] font-bold text-white/40 uppercase">{col.label}</span></div>
                {items.map(p => (
                  <Card key={p.id} className="glass-card border-white/5 hover:border-primary/20 cursor-pointer group" onClick={() => setSelectedProjeto(p.id)}>
                    <CardContent className="p-4 space-y-3">
                      <p className="font-bold text-sm text-white group-hover:text-primary transition-colors">{p.titulo}</p>
                      <div className="w-full h-1 rounded-full bg-white/5 overflow-hidden"><div className="h-full gradient-primary" style={{ width: `${p.progresso}%` }} /></div>
                      <div className="flex items-center justify-between text-[10px] text-white/40 font-mono"><p>{p.clientes?.nome}</p><p>{p.progresso}%</p></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            );
          })}
        </div>
      ) : (
        <Card className="glass-card border-[0.5px]">
          <CardContent className="pt-6">
            <Table>
              <TableHeader><TableRow className="border-white/5"><TableHead className="text-white/40">Projeto</TableHead><TableHead className="text-white/40">Cliente</TableHead><TableHead className="text-white/40">Progresso</TableHead><TableHead className="text-white/40">Status</TableHead></TableRow></TableHeader>
              <TableBody>
                {projetos.map(p => (
                  <TableRow key={p.id} className="border-white/5 cursor-pointer hover:bg-white/5" onClick={() => setSelectedProjeto(p.id)}>
                    <TableCell className="font-medium text-white">{p.titulo}</TableCell>
                    <TableCell className="text-white/60">{p.clientes?.nome}</TableCell>
                    <TableCell><div className="flex items-center gap-2"><div className="w-16 h-1 rounded-full bg-white/5"><div className="h-full gradient-primary" style={{ width: `${p.progresso}%` }} /></div><span className="text-[10px]">{p.progresso}%</span></div></TableCell>
                    <TableCell><StatusBadge status={p.status} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}

function Badge({ children, variant, className }: any) {
  return <span className={`px-2 py-0.5 rounded text-white ${className}`}>{children}</span>;
}
