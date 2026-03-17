import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Search, Plus, Zap, Star, CalendarDays, Pencil, UserPlus, Package, DollarSign, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type CategoriaExtra = "fixo" | "intermediario" | "mensal";

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };
const stagger = { show: { transition: { staggerChildren: 0.06 } } };

const catConfig: Record<CategoriaExtra, { label: string; plural: string; subtitle: string; color: string; border: string; bg: string; icon: typeof Zap }> = {
  fixo: { label: "Fixo", plural: "Extras Fixos", subtitle: "Paga uma vez, fica para sempre", color: "text-emerald-400", border: "border-emerald-500/30", bg: "bg-emerald-500/10", icon: Zap },
  intermediario: { label: "Intermediário", plural: "Intermediários", subtitle: "Ativação + mensalidade", color: "text-amber-400", border: "border-amber-500/30", bg: "bg-amber-500/10", icon: Star },
  mensal: { label: "Mensal", plural: "Mensais", subtitle: "Renda fixa recorrente", color: "text-blue-400", border: "border-blue-500/30", bg: "bg-blue-500/10", icon: CalendarDays },
};

const subcategorias: Record<CategoriaExtra, string[]> = {
  fixo: ["Comunicação", "Páginas e conteúdo", "Vendas e produtos", "Sistema e gestão", "Integrações"],
  intermediario: ["Promoções", "Fidelização", "Avaliações", "Pedidos e vendas", "Comunicação avançada", "Relatórios"],
  mensal: ["Manutenção", "Crescimento", "Infraestrutura"],
};

export default function Extras() {
  const { toast } = useToast();
  const [extras, setExtras] = useState<any[]>([]);
  const [clientes, setClientes] = useState<any[]>([]);
  const [extrasClientes, setExtrasClientes] = useState<any[]>([]);
  const [categoriaSel, setCategoriaSel] = useState<CategoriaExtra>("fixo");
  const [buscaGeral, setBuscaGeral] = useState("");
  const [buscaCategoria, setBuscaCategoria] = useState("");

  // Modals
  const [showNew, setShowNew] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showAtribuir, setShowAtribuir] = useState(false);
  const [extraSel, setExtraSel] = useState<any>(null);
  const [clienteSel, setClienteSel] = useState("");
  const [observacao, setObservacao] = useState("");
  const [saving, setSaving] = useState(false);

  const emptyForm = { nome: "", descricao: "", categoria: "fixo" as CategoriaExtra, subcategoria: "", preco_ativacao: "", preco_mensal: "", status: "ativo" };
  const [form, setForm] = useState(emptyForm);
  const [editForm, setEditForm] = useState({ ...emptyForm, id: "" });

  const fetchData = async () => {
    const [extrasRes, clientesRes, ecRes] = await Promise.all([
      supabase.from("extras").select("*").order("nome"),
      supabase.from("clientes").select("id, nome_empresa, email").eq("ativo", true).order("nome_empresa"),
      supabase.from("cliente_extras").select("extra_id").eq("ativo", true),
    ]);
    setExtras(extrasRes.data || []);
    setClientes(clientesRes.data || []);
    setExtrasClientes(ecRes.data || []);
  };

  useEffect(() => { fetchData(); }, []);

  // Counts
  const countByExtra = useMemo(() => {
    const map: Record<string, number> = {};
    extrasClientes.forEach(ec => { map[ec.extra_id] = (map[ec.extra_id] || 0) + 1; });
    return map;
  }, [extrasClientes]);

  const countByCat = useMemo(() => ({
    fixo: extras.filter(e => e.categoria === "fixo").length,
    intermediario: extras.filter(e => e.categoria === "intermediario").length,
    mensal: extras.filter(e => e.categoria === "mensal").length,
  }), [extras]);

  const receitaFixos = useMemo(() => extras.filter(e => e.categoria === "fixo").reduce((s, e) => s + Number(e.preco_ativacao || 0), 0), [extras]);
  const receitaMensal = useMemo(() => extras.filter(e => e.categoria === "mensal" || e.categoria === "intermediario").reduce((s, e) => s + Number(e.preco_mensal || 0), 0), [extras]);

  // Filtered extras
  const filtrados = useMemo(() => {
    let list = extras.filter(e => e.categoria === categoriaSel);
    if (buscaGeral) list = list.filter(e => e.nome.toLowerCase().includes(buscaGeral.toLowerCase()));
    if (buscaCategoria) list = list.filter(e => e.nome.toLowerCase().includes(buscaCategoria.toLowerCase()));
    return list;
  }, [extras, categoriaSel, buscaGeral, buscaCategoria]);

  // Handlers
  const handleSave = async () => {
    if (!form.nome) return;
    setSaving(true);
    const { error } = await supabase.from("extras_catalogo").insert({
      nome: form.nome, descricao: form.descricao || null, categoria: form.categoria,
      preco_ativacao: Number(form.preco_ativacao) || 0, preco_mensal: Number(form.preco_mensal) || 0, status: form.status,
    });
    setSaving(false);
    if (error) { toast({ title: "Erro", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Extra criado!" });
    setShowNew(false);
    setForm(emptyForm);
    fetchData();
  };

  const handleEdit = async () => {
    setSaving(true);
    const { error } = await supabase.from("extras_catalogo").update({
      nome: editForm.nome, descricao: editForm.descricao || null, categoria: editForm.categoria,
      preco_ativacao: Number(editForm.preco_ativacao) || 0, preco_mensal: Number(editForm.preco_mensal) || 0, status: editForm.status,
    }).eq("id", editForm.id);
    setSaving(false);
    if (error) { toast({ title: "Erro", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Extra atualizado!" });
    setShowEdit(false);
    fetchData();
  };

  const toggleStatus = async (extra: any) => {
    const newStatus = extra.status === "ativo" ? "inativo" : "ativo";
    await supabase.from("extras_catalogo").update({ status: newStatus }).eq("id", extra.id);
    fetchData();
  };

  const abrirEditar = (extra: any) => {
    setEditForm({ id: extra.id, nome: extra.nome, descricao: extra.descricao || "", categoria: extra.categoria, subcategoria: "", preco_ativacao: String(extra.preco_ativacao || 0), preco_mensal: String(extra.preco_mensal || 0), status: extra.status });
    setShowEdit(true);
  };

  const abrirAtribuir = (extra: any) => {
    setExtraSel(extra);
    setClienteSel("");
    setObservacao("");
    setShowAtribuir(true);
  };

  const handleAtribuir = async () => {
    if (!clienteSel || !extraSel) return;
    setSaving(true);
    const { error } = await supabase.from("extras_clientes").insert({
      cliente_id: clienteSel, extra_id: extraSel.id, categoria: extraSel.categoria,
      preco_ativacao: Number(extraSel.preco_ativacao) || 0, preco_mensal: Number(extraSel.preco_mensal) || 0, observacao: observacao || null,
    });
    setSaving(false);
    if (error) { toast({ title: "Erro", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Extra atribuído!", description: `"${extraSel.nome}" adicionado ao cliente.` });
    setShowAtribuir(false);
    fetchData();
  };

  const config = catConfig[categoriaSel];

  return (
    <motion.div className="space-y-0 h-full" initial="hidden" animate="show" variants={stagger}>
      <div className="flex flex-col lg:flex-row gap-6">
        {/* LEFT SIDE — Categories & Summary */}
        <motion.div className="w-full lg:w-[40%] space-y-4" variants={fadeUp}>
          {(["fixo", "intermediario", "mensal"] as const).map(cat => {
            const c = catConfig[cat];
            const isActive = categoriaSel === cat;
            return (
              <Card
                key={cat}
                className={`cursor-pointer transition-all border-[0.5px] ${isActive ? "border-[rgba(232,51,74,0.5)] shadow-lg shadow-[rgba(232,51,74,0.1)]" : c.border} hover:border-white/20`}
                style={{ background: isActive ? "rgba(232,51,74,0.08)" : "rgba(255,255,255,0.04)" }}
                onClick={() => { setCategoriaSel(cat); setBuscaCategoria(""); }}
              >
                <CardContent className="p-4 flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${c.bg}`}>
                    <c.icon className={`w-5 h-5 ${c.color}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className={`text-sm font-semibold ${c.color}`}>{c.plural}</h3>
                    <p className="text-[11px] text-white/40">{c.subtitle}</p>
                  </div>
                  <span className={`text-xl font-bold ${c.color}`}>{countByCat[cat]}</span>
                </CardContent>
              </Card>
            );
          })}

          {/* Search global */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <Input
              placeholder="Buscar em todas categorias..."
              className="pl-9 glass-input border-0 text-white text-sm"
              value={buscaGeral}
              onChange={e => setBuscaGeral(e.target.value)}
            />
          </div>

          {/* Financial summary */}
          <div className="grid grid-cols-1 gap-3">
            <Card className="border-[0.5px] border-white/[0.08]" style={{ background: "rgba(255,255,255,0.04)" }}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-white/5"><Package className="w-4 h-4 text-white/60" /></div>
                <div>
                  <p className="text-[10px] text-white/40 uppercase tracking-wider">Total cadastrados</p>
                  <p className="text-lg font-bold text-white">{extras.length}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-[0.5px] border-white/[0.08]" style={{ background: "rgba(255,255,255,0.04)" }}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10"><DollarSign className="w-4 h-4 text-emerald-400" /></div>
                <div>
                  <p className="text-[10px] text-white/40 uppercase tracking-wider">Receita potencial fixos</p>
                  <p className="text-lg font-bold text-emerald-400">R$ {receitaFixos.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-[0.5px] border-white/[0.08]" style={{ background: "rgba(255,255,255,0.04)" }}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10"><TrendingUp className="w-4 h-4 text-blue-400" /></div>
                <div>
                  <p className="text-[10px] text-white/40 uppercase tracking-wider">Receita mensal recorrente</p>
                  <p className="text-lg font-bold text-blue-400">R$ {receitaMensal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}/mês</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* RIGHT SIDE — Cards grid */}
        <motion.div className="w-full lg:w-[60%] space-y-4" variants={fadeUp}>
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <h2 className={`text-lg font-bold ${config.color}`}>{config.plural}</h2>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
                <Input
                  placeholder="Buscar nesta categoria..."
                  className="pl-8 glass-input border-0 text-white text-xs h-9 w-52"
                  value={buscaCategoria}
                  onChange={e => setBuscaCategoria(e.target.value)}
                />
              </div>
              <Button className="gradient-primary border-0 text-white text-xs h-9" onClick={() => { setForm({ ...emptyForm, categoria: categoriaSel }); setShowNew(true); }}>
                <Plus className="w-3.5 h-3.5 mr-1.5" /> Novo extra
              </Button>
            </div>
          </div>

          {/* Cards grid */}
          {filtrados.length === 0 ? (
            <p className="text-center text-sm text-white/40 py-16">Nenhum extra encontrado</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[calc(100vh-200px)] overflow-y-auto pr-1 custom-scrollbar">
              {filtrados.map(extra => {
                const clientesCount = countByExtra[extra.id] || 0;
                return (
                  <Card
                    key={extra.id}
                    className={`border-[0.5px] transition-all ${extra.status === "inativo" ? "opacity-50" : ""} ${config.border} hover:border-white/20`}
                    style={{ background: "rgba(255,255,255,0.04)" }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-sm font-medium text-white leading-tight flex-1 pr-2">{extra.nome}</h4>
                        <Switch
                          checked={extra.status === "ativo"}
                          onCheckedChange={() => toggleStatus(extra)}
                          className="scale-75"
                        />
                      </div>

                      {extra.descricao && <p className="text-[11px] text-white/40 mb-2 line-clamp-2">{extra.descricao}</p>}

                      <div className="space-y-1 mb-3">
                        {Number(extra.preco_ativacao) > 0 && (
                          <p className="text-sm">
                            <span className="text-white/40 text-xs">Ativação: </span>
                            <span className="text-emerald-400 font-semibold">R$ {Number(extra.preco_ativacao).toFixed(2).replace(".", ",")}</span>
                          </p>
                        )}
                        {Number(extra.preco_mensal) > 0 && (
                          <p className="text-sm">
                            <span className="text-white/40 text-xs">Mensal: </span>
                            <span className="text-amber-400 font-semibold">R$ {Number(extra.preco_mensal).toFixed(2).replace(".", ",")}/mês</span>
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-between mb-3">
                        <Badge variant="outline" className={`text-[9px] ${config.color} ${config.border}`}>{config.label}</Badge>
                        <span className="text-[10px] text-white/30">{clientesCount} {clientesCount === 1 ? "cliente" : "clientes"}</span>
                      </div>

                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost" className="flex-1 h-8 text-xs text-white/60 hover:text-white border border-white/10 hover:border-white/20" onClick={() => abrirEditar(extra)}>
                          <Pencil className="w-3 h-3 mr-1.5" /> Editar
                        </Button>
                        <Button size="sm" className="flex-1 h-8 text-xs gradient-primary border-0 text-white" onClick={() => abrirAtribuir(extra)}>
                          <UserPlus className="w-3 h-3 mr-1.5" /> Adicionar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>

      {/* Footer */}
      <div className="mt-8 pt-4 border-t border-white/5 text-center">
        <p className="text-[11px] text-white/20">NovaesWeb © 2025 — Painel Administrativo</p>
      </div>

      {/* MODAL — Novo Extra */}
      <Dialog open={showNew} onOpenChange={setShowNew}>
        <DialogContent className="glass-card border-[0.5px] text-white max-w-md">
          <DialogHeader><DialogTitle className="text-white">Novo Extra</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label className="text-xs text-white/50">Nome</Label>
              <Input className="glass-input border-[rgba(255,255,255,0.1)] text-white text-sm h-9" value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-white/50">Categoria principal</Label>
              <Select value={form.categoria} onValueChange={v => setForm({ ...form, categoria: v as CategoriaExtra, subcategoria: "" })}>
                <SelectTrigger className="glass-input border-[rgba(255,255,255,0.1)] text-white text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixo">Fixo</SelectItem>
                  <SelectItem value="intermediario">Intermediário</SelectItem>
                  <SelectItem value="mensal">Mensal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-white/50">Subcategoria</Label>
              <Select value={form.subcategoria} onValueChange={v => setForm({ ...form, subcategoria: v })}>
                <SelectTrigger className="glass-input border-[rgba(255,255,255,0.1)] text-white text-sm"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>
                  {subcategorias[form.categoria].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-white/50">Descrição curta</Label>
              <Textarea className="glass-input border-[rgba(255,255,255,0.1)] text-white text-sm min-h-[50px]" value={form.descricao} onChange={e => setForm({ ...form, descricao: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-white/50">Preço de ativação (R$)</Label>
              <Input type="number" className="glass-input border-[rgba(255,255,255,0.1)] text-white text-sm h-9" value={form.preco_ativacao} onChange={e => setForm({ ...form, preco_ativacao: e.target.value })} />
            </div>
            {(form.categoria === "intermediario" || form.categoria === "mensal") && (
              <div className="space-y-1.5">
                <Label className="text-xs text-white/50">Preço mensal (R$)</Label>
                <Input type="number" className="glass-input border-[rgba(255,255,255,0.1)] text-white text-sm h-9" value={form.preco_mensal} onChange={e => setForm({ ...form, preco_mensal: e.target.value })} />
              </div>
            )}
            <div className="space-y-1.5">
              <Label className="text-xs text-white/50">Status</Label>
              <Select value={form.status} onValueChange={v => setForm({ ...form, status: v })}>
                <SelectTrigger className="glass-input border-[rgba(255,255,255,0.1)] text-white text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="inativo">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button className="gradient-primary border-0 text-white w-full rounded-lg" onClick={handleSave} disabled={saving || !form.nome}>
              {saving ? "Salvando..." : "Salvar Extra"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* MODAL — Editar Extra */}
      <Dialog open={showEdit} onOpenChange={setShowEdit}>
        <DialogContent className="glass-card border-[0.5px] text-white max-w-md">
          <DialogHeader><DialogTitle className="text-white">Editar Extra</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label className="text-xs text-white/50">Nome</Label>
              <Input className="glass-input border-[rgba(255,255,255,0.1)] text-white text-sm h-9" value={editForm.nome} onChange={e => setEditForm({ ...editForm, nome: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-white/50">Categoria</Label>
              <Select value={editForm.categoria} onValueChange={v => setEditForm({ ...editForm, categoria: v as CategoriaExtra })}>
                <SelectTrigger className="glass-input border-[rgba(255,255,255,0.1)] text-white text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixo">Fixo</SelectItem>
                  <SelectItem value="intermediario">Intermediário</SelectItem>
                  <SelectItem value="mensal">Mensal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-white/50">Descrição</Label>
              <Textarea className="glass-input border-[rgba(255,255,255,0.1)] text-white text-sm min-h-[50px]" value={editForm.descricao} onChange={e => setEditForm({ ...editForm, descricao: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-white/50">Preço de ativação (R$)</Label>
              <Input type="number" className="glass-input border-[rgba(255,255,255,0.1)] text-white text-sm h-9" value={editForm.preco_ativacao} onChange={e => setEditForm({ ...editForm, preco_ativacao: e.target.value })} />
            </div>
            {(editForm.categoria === "intermediario" || editForm.categoria === "mensal") && (
              <div className="space-y-1.5">
                <Label className="text-xs text-white/50">Preço mensal (R$)</Label>
                <Input type="number" className="glass-input border-[rgba(255,255,255,0.1)] text-white text-sm h-9" value={editForm.preco_mensal} onChange={e => setEditForm({ ...editForm, preco_mensal: e.target.value })} />
              </div>
            )}
            <div className="space-y-1.5">
              <Label className="text-xs text-white/50">Status</Label>
              <Select value={editForm.status} onValueChange={v => setEditForm({ ...editForm, status: v })}>
                <SelectTrigger className="glass-input border-[rgba(255,255,255,0.1)] text-white text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="inativo">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button className="gradient-primary border-0 text-white w-full rounded-lg" onClick={handleEdit} disabled={saving}>
              {saving ? "Salvando..." : "Salvar alterações"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* MODAL — Atribuir a Cliente */}
      <Dialog open={showAtribuir} onOpenChange={setShowAtribuir}>
        <DialogContent className="glass-card border-[0.5px] text-white max-w-md">
          <DialogHeader><DialogTitle className="text-white">Adicionar a Cliente</DialogTitle></DialogHeader>
          {extraSel && (
            <div className="space-y-4 mt-2">
              <div className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.06]">
                <p className="text-sm font-medium text-white">{extraSel.nome}</p>
                <div className="flex gap-3 mt-1 text-xs text-white/40">
                  <span className={catConfig[extraSel.categoria as CategoriaExtra]?.color}>{catConfig[extraSel.categoria as CategoriaExtra]?.label}</span>
                  {Number(extraSel.preco_ativacao) > 0 && <span className="text-emerald-400">Ativação: R$ {Number(extraSel.preco_ativacao).toFixed(2).replace(".", ",")}</span>}
                  {Number(extraSel.preco_mensal) > 0 && <span className="text-amber-400">Mensal: R$ {Number(extraSel.preco_mensal).toFixed(2).replace(".", ",")}/mês</span>}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-white/50">Cliente</Label>
                <Select value={clienteSel} onValueChange={setClienteSel}>
                  <SelectTrigger className="glass-input border-[rgba(255,255,255,0.1)] text-white"><SelectValue placeholder="Selecione o cliente" /></SelectTrigger>
                  <SelectContent>
                    {clientes.map(c => <SelectItem key={c.id} value={c.id}>{c.nome} — {c.email}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-white/50">Observação (opcional)</Label>
                <Textarea className="glass-input border-[rgba(255,255,255,0.1)] text-white text-sm min-h-[50px]" placeholder="Ex: Cortesia por 3 meses..." value={observacao} onChange={e => setObservacao(e.target.value)} />
              </div>

              <Button className="gradient-primary border-0 text-white w-full rounded-lg" onClick={handleAtribuir} disabled={!clienteSel || saving}>
                {saving ? "Salvando..." : "Confirmar atribuição"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
