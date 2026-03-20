import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Plus, List, LayoutGrid, Calendar, User, ArrowLeft, Send, Clock } from "lucide-react";
import StatusBadge from "@/components/StatusBadge";
import { supabase } from "@/integrations/supabase/client";
import { sendPushToClient } from "@/lib/push-notifications";
import { useToast } from "@/hooks/use-toast";

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

const kanbanColumns = [
  { key: "briefing", label: "📋 Briefing", color: "border-blue-500/50" },
  { key: "design", label: "🎨 Design & Branding", color: "border-purple-500/50" },
  { key: "desenvolvimento", label: "💻 Desenvolvimento", color: "border-amber-500/50" },
  { key: "homologacao", label: "🧪 Testes & SEO", color: "border-violet-500/50" },
  { key: "concluido", label: "🚀 Finalizado", color: "border-emerald-500/50" },
];

const statusLabels: Record<string, string> = {
  briefing: "Briefing",
  design: "Design & Branding",
  desenvolvimento: "Desenvolvimento",
  homologacao: "Testes & SEO",
  concluido: "Finalizado",
  cancelado: "Cancelado",
};

function ProjetoDetalhes({ projetoId, onBack }: { projetoId: string; onBack: () => void }) {
  const { toast } = useToast();
  const [projeto, setProjeto] = useState<any>(null);
  const [pedido, setPedido] = useState<any>(null);
  const [atualizacoes, setAtualizacoes] = useState<any[]>([]);
  const [novaAtualizacao, setNovaAtualizacao] = useState("");
  const [visivelCliente, setVisivelCliente] = useState(true);
  const [sending, setSending] = useState(false);

  const loadProjeto = async () => {
    const { data } = await supabase.from("projetos").select("*, clientes(nome)").eq("id", projetoId).single();
    setProjeto(data);
    if (data) {
      const { data: pedData } = await supabase.from("pedidos").select("codigo").eq("projeto_id", data.id).maybeSingle();
      setPedido(pedData);
    }
  };

  const loadAtualizacoes = async () => {
    const { data } = await supabase.from("projeto_atualizacoes").select("*").eq("projeto_id", projetoId).order("created_at", { ascending: false });
    setAtualizacoes(data || []);
  };

  useEffect(() => { loadProjeto(); loadAtualizacoes(); }, [projetoId]);

  const updateStatus = async (newStatus: string) => {
    const progressMap: Record<string, number> = {
      briefing: 20,
      design: 40,
      desenvolvimento: 60,
      homologacao: 85,
      concluido: 100,
      cancelado: 0
    };

    const newProgress = progressMap[newStatus] ?? projeto.progresso;
    
    const { error } = await supabase.from("projetos").update({ 
      status: newStatus,
      progresso: newProgress
    }).eq("id", projetoId);

    if (error) { toast({ title: "Erro", description: error.message, variant: "destructive" }); return; }
    
    setProjeto((prev: any) => ({ ...prev, status: newStatus, progresso: newProgress }));
    toast({ title: "Status e progresso atualizados!" });
  };

  const handleProgressChange = (value: number[]) => {
    setProjeto((prev: any) => ({ ...prev, progresso: value[0] }));
  };

  const saveProgresso = async (value: number[]) => {
    const progresso = value[0];
    const { error } = await supabase.from("projetos").update({ progresso }).eq("id", projetoId);
    if (error) toast({ title: "Erro", description: error.message, variant: "destructive" });
    else toast({ title: `Progresso atualizado para ${progresso}%` });
  };

  const enviarAtualizacao = async () => {
    if (!novaAtualizacao.trim()) return;
    setSending(true);
    const { error } = await supabase.from("projeto_atualizacoes").insert({
      projeto_id: projetoId,
      descricao: novaAtualizacao.trim(),
      visivel_cliente: visivelCliente,
    });
    setSending(false);
    if (error) { toast({ title: "Erro", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Atualização registrada!" });
    setNovaAtualizacao("");
    loadAtualizacoes();
  };

  if (!projeto) return <p className="text-white">Carregando...</p>;

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
                  {pedido && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-mono border border-primary/20">
                      Origem: {pedido.codigo}
                    </span>
                  )}
                </div>
                <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">{projeto.clientes?.nome || "Sem cliente"}</p>
                {projeto.descricao && <p className="text-xs text-[hsl(var(--muted-foreground))] mt-2">{projeto.descricao}</p>}
              </div>
              <div className="flex items-center gap-3">
                <Select value={projeto.status} onValueChange={updateStatus}>
                  <SelectTrigger className="w-[180px] glass-input border-0 text-white text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {kanbanColumns.map(col => (
                      <SelectItem key={col.key} value={col.key}>{col.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
              <div>
                <p className="text-[10px] text-[hsl(var(--muted-foreground))] uppercase tracking-wider">Responsável</p>
                <p className="text-sm text-white font-medium mt-0.5">{projeto.responsavel || "—"}</p>
              </div>
              <div>
                <p className="text-[10px] text-[hsl(var(--muted-foreground))] uppercase tracking-wider">Valor</p>
                <p className="text-sm text-white font-medium mt-0.5">R$ {Number(projeto.valor).toLocaleString("pt-BR")}</p>
              </div>
              <div>
                <p className="text-[10px] text-[hsl(var(--muted-foreground))] uppercase tracking-wider">Início</p>
                <p className="text-sm text-white font-medium mt-0.5">{projeto.inicio ? new Date(projeto.inicio).toLocaleDateString("pt-BR") : "—"}</p>
              </div>
              <div>
                <p className="text-[10px] text-[hsl(var(--muted-foreground))] uppercase tracking-wider">Prazo</p>
                <p className="text-sm text-white font-medium mt-0.5">{projeto.prazo ? new Date(projeto.prazo).toLocaleDateString("pt-BR") : "—"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Progresso */}
      <motion.div variants={fadeUp}>
        <Card className="glass-card border-[0.5px]">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-white">Progresso</p>
              <span className="text-lg font-bold gradient-text">{projeto.progresso}%</span>
            </div>
            <Slider
              value={[projeto.progresso]}
              onValueChange={handleProgressChange}
              onValueCommit={saveProgresso}
              max={100}
              step={5}
              className="w-full"
            />
            <div className="flex justify-between mt-1 text-[10px] text-[hsl(var(--muted-foreground))]">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Nova atualização */}
      <motion.div variants={fadeUp}>
        <Card className="glass-card border-[0.5px]">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-white">Registrar Atualização</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Textarea
              value={novaAtualizacao}
              onChange={e => setNovaAtualizacao(e.target.value)}
              placeholder="Descreva o andamento do projeto..."
              className="glass-input border-[rgba(255,255,255,0.1)] text-white text-sm min-h-[80px]"
            />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Switch checked={visivelCliente} onCheckedChange={setVisivelCliente} />
                <span className="text-xs text-[hsl(var(--muted-foreground))]">Visível para o cliente</span>
              </div>
              <Button
                className="gradient-primary border-0 text-white text-xs"
                onClick={enviarAtualizacao}
                disabled={sending || !novaAtualizacao.trim()}
              >
                <Send className="w-3 h-3 mr-1.5" /> {sending ? "Enviando..." : "Registrar"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Histórico */}
      <motion.div variants={fadeUp}>
        <Card className="glass-card border-[0.5px]">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-white">Histórico de Atualizações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {atualizacoes.length === 0 ? (
              <p className="text-sm text-[hsl(var(--muted-foreground))] text-center py-6">Nenhuma atualização registrada</p>
            ) : atualizacoes.map((a) => (
              <div key={a.id} className="p-3 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)]">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2 text-[10px] text-[hsl(var(--muted-foreground))]">
                    <Clock className="w-3 h-3" />
                    {new Date(a.created_at).toLocaleString("pt-BR")}
                  </div>
                  {a.visivel_cliente ? (
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400">Visível ao cliente</span>
                  ) : (
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-[rgba(255,255,255,0.06)] text-[hsl(var(--muted-foreground))]">Interno</span>
                  )}
                </div>
                <p className="text-sm text-white">{a.descricao}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

export default function Projetos() {
  const { toast } = useToast();
  const [view, setView] = useState<"lista" | "kanban">("kanban");
  const [projetos, setProjetos] = useState<any[]>([]);
  const [selectedProjeto, setSelectedProjeto] = useState<string | null>(null);

  const load = async () => {
    const [p] = await Promise.all([
      supabase.from("projetos").select("*, clientes(nome)").order("created_at", { ascending: false }),
    ]);
    setProjetos(p.data || []);
  };

  useEffect(() => { load(); }, []);

  if (selectedProjeto) {
    return <ProjetoDetalhes projetoId={selectedProjeto} onBack={() => { setSelectedProjeto(null); load(); }} />;
  }

  return (
    <motion.div className="space-y-6" initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.08 } } }}>
      <motion.div className="flex items-center justify-between gap-4" variants={fadeUp}>
        <div className="flex gap-1 p-1 rounded-lg glass-card border-[0.5px]">
          <Button variant="ghost" size="sm" className={view === "lista" ? "gradient-primary text-white border-0" : "text-[hsl(var(--muted-foreground))]"} onClick={() => setView("lista")}><List className="w-4 h-4" /></Button>
          <Button variant="ghost" size="sm" className={view === "kanban" ? "gradient-primary text-white border-0" : "text-[hsl(var(--muted-foreground))]"} onClick={() => setView("kanban")}><LayoutGrid className="w-4 h-4" /></Button>
        </div>
      </motion.div>

      {view === "kanban" ? (
        <motion.div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4" variants={fadeUp}>
          {kanbanColumns.map((col) => {
            const items = projetos.filter(p => p.status === col.key);
            return (
              <div key={col.key} className="space-y-3">
                <div className={`flex items-center gap-2 px-1 border-l-2 ${col.color} pl-3`}>
                  <span className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">{col.label}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full glass-card text-[hsl(var(--muted-foreground))]">{items.length}</span>
                </div>
                {items.map((p) => {
                  const isRestaurante = p.titulo.toLowerCase().includes("pizza") || p.descricao?.toLowerCase().includes("pizzaria") || p.descricao?.toLowerCase().includes("restaurante");
                  const isBarbearia = p.titulo.toLowerCase().includes("barber") || p.titulo.toLowerCase().includes("barbearia") || p.descricao?.toLowerCase().includes("salao");
                  const isLoja = p.titulo.toLowerCase().includes("loja") || p.titulo.toLowerCase().includes("acai") || p.descricao?.toLowerCase().includes("ecommerce");
                  
                  return (
                    <Card key={p.id} className="glass-card border-white/5 hover:border-primary/30 transition-all cursor-pointer group info-card-hover" onClick={() => setSelectedProjeto(p.id)}>
                      <CardContent className="p-4 space-y-3">
                        <div className="flex justify-between items-start gap-2">
                          <p className="font-bold text-sm text-white group-hover:text-primary transition-colors leading-snug">{p.titulo}</p>
                          <div className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-white/40 group-hover:text-primary group-hover:border-primary/20 transition-all">
                            {isRestaurante ? "🍕" : isBarbearia ? "✂️" : isLoja ? "🛍️" : "🎨"}
                          </div>
                        </div>
                        <p className="text-[11px] text-[hsl(var(--muted-foreground))] line-clamp-2 leading-relaxed">{p.descricao || "Sem descrição disponível para este projeto."}</p>
                        
                        {/* Progress bar Premium */}
                        <div className="pt-1">
                          <div className="flex justify-between text-[10px] text-[hsl(var(--muted-foreground))] mb-1.5">
                            <span className="font-medium">Progresso</span>
                            <span className="text-primary font-bold">{p.progresso}%</span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-white/5 border border-white/5 overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${p.progresso}%` }}
                              className="h-full rounded-full gradient-primary shadow-[0_0_10px_rgba(232,51,74,0.3)]"
                            />
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-1">
                          <div className="flex items-center gap-1.5 text-[10px] text-[hsl(var(--muted-foreground))]">
                            <User className="w-3 h-3 text-blue-400" /> {p.clientes?.nome || "—"}
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] text-[hsl(var(--muted-foreground))]">
                            <Calendar className="w-3 h-3 text-amber-400" /> {p.prazo ? new Date(p.prazo).toLocaleDateString("pt-BR") : "—"}
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between pt-1 border-t border-white/5 mt-1">
                          <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full">
                            R$ {(Number(p.valor)).toLocaleString("pt-BR")}
                          </div>
                          <ArrowLeft className="w-3 h-3 text-white/20 rotate-180" />
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
                {items.length === 0 && (
                  <div className="border border-dashed border-[rgba(255,255,255,0.08)] rounded-xl p-8 text-center text-[11px] text-[hsl(var(--muted-foreground))]">Nenhum projeto</div>
                )}
              </div>
            );
          })}
        </motion.div>
      ) : (
        <motion.div variants={fadeUp}>
          <Card className="glass-card border-[0.5px]">
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow className="border-[rgba(255,255,255,0.06)]">
                    {["Título", "Cliente", "Progresso", "Responsável", "Prazo", "Valor", "Status"].map((h) => (
                      <TableHead key={h} className="text-[11px] text-[hsl(var(--muted-foreground))]">{h}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projetos.length === 0 ? (
                    <TableRow><TableCell colSpan={7} className="text-center text-sm text-[hsl(var(--muted-foreground))] py-8">Nenhum projeto</TableCell></TableRow>
                  ) : projetos.map((p) => (
                    <TableRow key={p.id} className="border-[rgba(255,255,255,0.04)] cursor-pointer hover:bg-[rgba(255,255,255,0.02)]" onClick={() => setSelectedProjeto(p.id)}>
                      <TableCell className="text-sm font-medium text-white">{p.titulo}</TableCell>
                      <TableCell className="text-sm text-[hsl(var(--muted-foreground))]">{p.clientes?.nome || "—"}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 rounded-full bg-[rgba(255,255,255,0.06)]">
                            <div className="h-full rounded-full gradient-primary" style={{ width: `${p.progresso}%` }} />
                          </div>
                          <span className="text-[11px] text-[hsl(var(--muted-foreground))]">{p.progresso}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-[hsl(var(--muted-foreground))]">{p.responsavel}</TableCell>
                      <TableCell className="text-sm text-[hsl(var(--muted-foreground))]">{p.prazo ? new Date(p.prazo).toLocaleDateString("pt-BR") : "—"}</TableCell>
                      <TableCell className="text-sm text-white">R$ {Number(p.valor).toLocaleString("pt-BR")}</TableCell>
                      <TableCell><StatusBadge status={p.status} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}
