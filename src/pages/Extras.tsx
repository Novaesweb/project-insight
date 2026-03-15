import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Search, Plus, Package, Zap, RefreshCw, UserPlus, Pencil, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type CategoriaExtra = "fixo" | "intermediario" | "mensal";

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };
const stagger = { show: { transition: { staggerChildren: 0.06 } } };

const catConfig: Record<CategoriaExtra, { label: string; color: string; bgColor: string; borderColor: string; icon: typeof Package }> = {
  fixo: { label: "Fixo", color: "text-emerald-400", bgColor: "bg-emerald-500/10", borderColor: "border-emerald-500/30", icon: Package },
  intermediario: { label: "Intermediário", color: "text-amber-400", bgColor: "bg-amber-500/10", borderColor: "border-amber-500/30", icon: Zap },
  mensal: { label: "Mensal", color: "text-blue-400", bgColor: "bg-blue-500/10", borderColor: "border-blue-500/30", icon: RefreshCw },
};

export default function Extras() {
  const { toast } = useToast();
  const [extras, setExtras] = useState<any[]>([]);
  const [clientes, setClientes] = useState<any[]>([]);
  const [busca, setBusca] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState<string>("todos");
  const [categoria, setCategoria] = useState<CategoriaExtra>("fixo");
  const [showNew, setShowNew] = useState(false);
  const [showAtribuir, setShowAtribuir] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [extraSelecionado, setExtraSelecionado] = useState<any>(null);
  const [clienteSelecionado, setClienteSelecionado] = useState("");
  const [observacao, setObservacao] = useState("");
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ nome: "", descricao: "", preco_ativacao: "", preco_mensal: "", status: "ativo" });
  const [editForm, setEditForm] = useState({ id: "", nome: "", descricao: "", categoria: "fixo" as CategoriaExtra, preco_ativacao: "", preco_mensal: "", status: "ativo" });

  const fetchData = async () => {
    const [extrasRes, clientesRes] = await Promise.all([
      supabase.from("extras_catalogo").select("*").order("created_at", { ascending: false }),
      supabase.from("clientes").select("id, nome, email").eq("status", "ativo").order("nome"),
    ]);
    setExtras(extrasRes.data || []);
    setClientes(clientesRes.data || []);
  };

  useEffect(() => { fetchData(); }, []);

  const handleSave = async () => {
    const { error } = await supabase.from("extras_catalogo").insert({
      nome: form.nome, descricao: form.descricao, categoria,
      preco_ativacao: Number(form.preco_ativacao) || 0, preco_mensal: Number(form.preco_mensal) || 0, status: form.status,
    });
    if (error) { toast({ title: "Erro", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Extra criado!" });
    setShowNew(false);
    setForm({ nome: "", descricao: "", preco_ativacao: "", preco_mensal: "", status: "ativo" });
    fetchData();
  };

  const handleAtribuir = async () => {
    if (!clienteSelecionado || !extraSelecionado) return;
    setSaving(true);
    const { error } = await supabase.from("extras_clientes").insert({
      cliente_id: clienteSelecionado,
      extra_id: extraSelecionado.id,
      categoria: extraSelecionado.categoria,
      preco_ativacao: Number(extraSelecionado.preco_ativacao) || 0,
      preco_mensal: Number(extraSelecionado.preco_mensal) || 0,
      observacao: observacao || null,
    });
    setSaving(false);
    if (error) { toast({ title: "Erro", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Extra atribuído!", description: `"${extraSelecionado.nome}" foi adicionado ao cliente.` });
    setShowAtribuir(false);
    setClienteSelecionado("");
    setObservacao("");
    setExtraSelecionado(null);
  };

  const abrirAtribuir = (extra: any) => {
    setExtraSelecionado(extra);
    setClienteSelecionado("");
    setObservacao("");
    setShowAtribuir(true);
  };

  const abrirEditar = (extra: any) => {
    setEditForm({
      id: extra.id,
      nome: extra.nome,
      descricao: extra.descricao || "",
      categoria: extra.categoria,
      preco_ativacao: String(extra.preco_ativacao || 0),
      preco_mensal: String(extra.preco_mensal || 0),
      status: extra.status,
    });
    setShowEdit(true);
  };

  const handleEdit = async () => {
    setSaving(true);
    const { error } = await supabase.from("extras_catalogo").update({
      nome: editForm.nome,
      descricao: editForm.descricao,
      categoria: editForm.categoria,
      preco_ativacao: Number(editForm.preco_ativacao) || 0,
      preco_mensal: Number(editForm.preco_mensal) || 0,
      status: editForm.status,
    }).eq("id", editForm.id);
    setSaving(false);
    if (error) { toast({ title: "Erro", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Extra atualizado!" });
    setShowEdit(false);
    fetchData();
  };

  const handleDelete = async (extra: any) => {
    if (!confirm(`Excluir "${extra.nome}"?`)) return;
    const { error } = await supabase.from("extras_catalogo").delete().eq("id", extra.id);
    if (error) { toast({ title: "Erro", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Extra excluído!" });
    fetchData();
  };

  const filtrados = extras.filter((e) => {
    const matchBusca = e.nome.toLowerCase().includes(busca.toLowerCase());
    const matchCat = filtroCategoria === "todos" || e.categoria === filtroCategoria;
    return matchBusca && matchCat;
  });

  const groupedExtras = {
    fixo: filtrados.filter(e => e.categoria === "fixo"),
    intermediario: filtrados.filter(e => e.categoria === "intermediario"),
    mensal: filtrados.filter(e => e.categoria === "mensal"),
  };

  return (
    <motion.div className="space-y-6" initial="hidden" animate="show" variants={stagger}>
      <motion.div className="grid grid-cols-2 lg:grid-cols-4 gap-4" variants={fadeUp}>
        <Card className="glass-card border-[0.5px]">
          <CardContent className="p-4 text-center">
            <p className="text-xs text-[hsl(var(--muted-foreground))]">Total de Extras</p>
            <p className="text-2xl font-bold text-white mt-1">{extras.length}</p>
          </CardContent>
        </Card>
        {(["fixo", "intermediario", "mensal"] as const).map((cat) => (
          <Card key={cat} className="glass-card border-[0.5px]">
            <CardContent className="p-4 text-center">
              <p className="text-xs text-[hsl(var(--muted-foreground))]">{catConfig[cat].label}</p>
              <p className={`text-2xl font-bold mt-1 ${catConfig[cat].color}`}>{extras.filter(e => e.categoria === cat).length}</p>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      <motion.div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between" variants={fadeUp}>
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--muted-foreground))]" />
            <Input placeholder="Buscar extra..." className="pl-9 glass-input border-0 text-white text-sm" value={busca} onChange={(e) => setBusca(e.target.value)} />
          </div>
          <div className="flex gap-2">
            {[{ key: "todos", label: "Todos" }, { key: "fixo", label: "Fixos" }, { key: "intermediario", label: "Intermediários" }, { key: "mensal", label: "Mensais" }].map((f) => (
              <Button key={f.key} size="sm"
                className={filtroCategoria === f.key ? "gradient-primary border-0 text-white text-xs" : "glass-input border-0 text-[hsl(var(--muted-foreground))] hover:text-white text-xs"}
                onClick={() => setFiltroCategoria(f.key)}>{f.label}</Button>
            ))}
          </div>
        </div>
        <Dialog open={showNew} onOpenChange={setShowNew}>
          <DialogTrigger asChild>
            <Button className="gradient-primary border-0 text-white rounded-lg"><Plus className="w-4 h-4 mr-2" /> Cadastrar novo extra</Button>
          </DialogTrigger>
          <DialogContent className="glass-card border-[0.5px] text-white max-w-md">
            <DialogHeader><DialogTitle className="text-white">Novo Extra</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-[hsl(var(--muted-foreground))]">Nome</Label>
                <Input className="glass-input border-[rgba(255,255,255,0.1)] text-white text-sm h-9" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-[hsl(var(--muted-foreground))]">Descrição</Label>
                <Textarea className="glass-input border-[rgba(255,255,255,0.1)] text-white text-sm min-h-[60px]" value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-[hsl(var(--muted-foreground))]">Categoria</Label>
                <select className="w-full h-9 rounded-lg glass-input border border-[rgba(255,255,255,0.1)] text-white text-sm px-3 bg-transparent" value={categoria} onChange={(e) => setCategoria(e.target.value as CategoriaExtra)}>
                  <option value="fixo">Fixo</option>
                  <option value="intermediario">Intermediário</option>
                  <option value="mensal">Mensal</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-[hsl(var(--muted-foreground))]">Preço ativação (R$)</Label>
                <Input type="number" className="glass-input border-[rgba(255,255,255,0.1)] text-white text-sm h-9" value={form.preco_ativacao} onChange={(e) => setForm({ ...form, preco_ativacao: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-[hsl(var(--muted-foreground))]">Preço mensal (R$)</Label>
                <Input type="number" className="glass-input border-[rgba(255,255,255,0.1)] text-white text-sm h-9" value={form.preco_mensal} onChange={(e) => setForm({ ...form, preco_mensal: e.target.value })} />
              </div>
            </div>
            <Button className="gradient-primary border-0 text-white w-full mt-4 rounded-lg" onClick={handleSave}>Salvar Extra</Button>
          </DialogContent>
        </Dialog>
      </motion.div>

      {(["fixo", "intermediario", "mensal"] as const).map((cat) => {
        const items = groupedExtras[cat];
        if (items.length === 0) return null;
        const config = catConfig[cat];
        return (
          <motion.div key={cat} className="space-y-3" variants={fadeUp}>
            <div className={`flex items-center gap-2 border-l-2 pl-3 ${config.borderColor}`}>
              <config.icon className={`w-4 h-4 ${config.color}`} />
              <h3 className={`text-sm font-semibold ${config.color} uppercase tracking-wider`}>
                {cat === "fixo" ? "Extras Fixos" : cat === "intermediario" ? "Extras Intermediários" : "Extras Mensais"}
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full glass-card text-[hsl(var(--muted-foreground))]">{items.length}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {items.map((extra: any) => (
                <Card key={extra.id} className="glass-card border-[0.5px] transition-all group">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-sm font-medium text-white leading-tight">{extra.nome}</h4>
                      <Badge variant="outline" className={`text-[9px] ${config.color} ${config.borderColor} shrink-0 ml-2`}>{config.label}</Badge>
                    </div>
                    {extra.descricao && (
                      <p className="text-[11px] text-[hsl(var(--muted-foreground))] mb-2 line-clamp-2">{extra.descricao}</p>
                    )}
                    <div className="space-y-1 mb-3">
                      {Number(extra.preco_ativacao) > 0 && (
                        <p className="text-sm"><span className="text-[hsl(var(--muted-foreground))] text-xs">Ativação: </span><span className="text-white font-semibold">R$ {Number(extra.preco_ativacao).toFixed(2).replace(".", ",")}</span></p>
                      )}
                      {Number(extra.preco_mensal) > 0 && (
                        <p className="text-sm"><span className="text-[hsl(var(--muted-foreground))] text-xs">Mensal: </span><span className={`font-semibold ${config.color}`}>R$ {Number(extra.preco_mensal).toFixed(2).replace(".", ",")}/mês</span></p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1 gradient-primary border-0 text-white text-xs rounded-lg h-8"
                        onClick={() => abrirAtribuir(extra)}
                      >
                        <UserPlus className="w-3 h-3 mr-1.5" /> Atribuir
                      </Button>
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-white/40 hover:text-white" onClick={() => abrirEditar(extra)}>
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-white/40 hover:text-red-400" onClick={() => handleDelete(extra)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        );
      })}

      {filtrados.length === 0 && (
        <p className="text-center text-sm text-[hsl(var(--muted-foreground))] py-12">Nenhum extra cadastrado ainda</p>
      )}

      {/* Dialog Atribuir Extra a Cliente */}
      <Dialog open={showAtribuir} onOpenChange={setShowAtribuir}>
        <DialogContent className="glass-card border-[0.5px] text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Atribuir Extra a Cliente</DialogTitle>
          </DialogHeader>
          {extraSelecionado && (
            <div className="space-y-4 mt-2">
              <div className="p-3 rounded-xl bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.06)]">
                <p className="text-sm font-medium text-white">{extraSelecionado.nome}</p>
                <div className="flex gap-3 mt-1 text-xs text-[hsl(var(--muted-foreground))]">
                  <span>{catConfig[extraSelecionado.categoria as CategoriaExtra]?.label}</span>
                  {Number(extraSelecionado.preco_ativacao) > 0 && <span>Ativação: R$ {Number(extraSelecionado.preco_ativacao).toFixed(2).replace(".", ",")}</span>}
                  {Number(extraSelecionado.preco_mensal) > 0 && <span>Mensal: R$ {Number(extraSelecionado.preco_mensal).toFixed(2).replace(".", ",")}</span>}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-[hsl(var(--muted-foreground))]">Selecionar Cliente</Label>
                <select
                  className="w-full h-9 rounded-lg glass-input border border-[rgba(255,255,255,0.1)] text-white text-sm px-3 bg-transparent"
                  value={clienteSelecionado}
                  onChange={(e) => setClienteSelecionado(e.target.value)}
                >
                  <option value="">Escolha um cliente...</option>
                  {clientes.map((c) => (
                    <option key={c.id} value={c.id}>{c.nome} — {c.email}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-[hsl(var(--muted-foreground))]">Observação (opcional)</Label>
                <Textarea
                  className="glass-input border-[rgba(255,255,255,0.1)] text-white text-sm min-h-[60px]"
                  placeholder="Ex: Cortesia por 3 meses..."
                  value={observacao}
                  onChange={(e) => setObservacao(e.target.value)}
                />
              </div>

              <Button
                className="gradient-primary border-0 text-white w-full rounded-lg"
                onClick={handleAtribuir}
                disabled={!clienteSelecionado || saving}
              >
                {saving ? "Salvando..." : "Confirmar atribuição"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
      {/* Dialog Editar Extra */}
      <Dialog open={showEdit} onOpenChange={setShowEdit}>
        <DialogContent className="glass-card border-[0.5px] text-white max-w-md">
          <DialogHeader><DialogTitle className="text-white">Editar Extra</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-[hsl(var(--muted-foreground))]">Nome</Label>
              <Input className="glass-input border-[rgba(255,255,255,0.1)] text-white text-sm h-9" value={editForm.nome} onChange={(e) => setEditForm({ ...editForm, nome: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-[hsl(var(--muted-foreground))]">Descrição</Label>
              <Textarea className="glass-input border-[rgba(255,255,255,0.1)] text-white text-sm min-h-[60px]" value={editForm.descricao} onChange={(e) => setEditForm({ ...editForm, descricao: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-[hsl(var(--muted-foreground))]">Categoria</Label>
              <select className="w-full h-9 rounded-lg glass-input border border-[rgba(255,255,255,0.1)] text-white text-sm px-3 bg-transparent" value={editForm.categoria} onChange={(e) => setEditForm({ ...editForm, categoria: e.target.value as CategoriaExtra })}>
                <option value="fixo">Fixo</option>
                <option value="intermediario">Intermediário</option>
                <option value="mensal">Mensal</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-[hsl(var(--muted-foreground))]">Preço ativação (R$)</Label>
              <Input type="number" className="glass-input border-[rgba(255,255,255,0.1)] text-white text-sm h-9" value={editForm.preco_ativacao} onChange={(e) => setEditForm({ ...editForm, preco_ativacao: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-[hsl(var(--muted-foreground))]">Preço mensal (R$)</Label>
              <Input type="number" className="glass-input border-[rgba(255,255,255,0.1)] text-white text-sm h-9" value={editForm.preco_mensal} onChange={(e) => setEditForm({ ...editForm, preco_mensal: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-[hsl(var(--muted-foreground))]">Status</Label>
              <select className="w-full h-9 rounded-lg glass-input border border-[rgba(255,255,255,0.1)] text-white text-sm px-3 bg-transparent" value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}>
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
              </select>
            </div>
          </div>
          <Button className="gradient-primary border-0 text-white w-full mt-4 rounded-lg" onClick={handleEdit} disabled={saving}>
            {saving ? "Salvando..." : "Salvar alterações"}
          </Button>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
