import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Search, Plus, Zap, Star, CalendarDays, Pencil, UserPlus, Package, DollarSign, TrendingUp, Trash2, Rocket } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type CategoriaExtra = "fixo" | "intermediario" | "mensal";

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };
const stagger = { show: { transition: { staggerChildren: 0.06 } } };

const catConfig: Record<CategoriaExtra, { label: string; plural: string; subtitle: string; color: string; border: string; bg: string; icon: typeof Zap }> = {
  fixo: { label: "Único", plural: "Extras Únicos", subtitle: "Pagamento único, sem mensalidade", color: "text-emerald-400", border: "border-emerald-500/30", bg: "bg-emerald-500/10", icon: Zap },
  intermediario: { label: "Pro", plural: "Extras Pro", subtitle: "Ativação + mensalidade recorrente", color: "text-amber-400", border: "border-amber-500/30", bg: "bg-amber-500/10", icon: Star },
  mensal: { label: "Assinatura", plural: "Assinaturas", subtitle: "Mensalidade de serviço fixo", color: "text-blue-400", border: "border-blue-500/30", bg: "bg-blue-500/10", icon: CalendarDays },
};

const subcategorias: Record<CategoriaExtra, string[]> = {
  fixo: ["Comunicação", "Páginas e conteúdo", "Vendas e produtos", "Sistema e gestão", "Integrações", "Vendas e UI", "Produtos", "Pedidos", "Localização", "Sistema"],
  intermediario: ["Promoções", "Fidelização", "Avaliações", "Pedidos e vendas", "Comunicação avançada", "Relatórios", "Marketing", "Vendas", "Cliente", "Automação", "Gestão"],
  mensal: ["Manutenção", "Crescimento", "Infraestrutura"],
};

export default function Extras() {
  const { toast } = useToast();
  const [extras, setExtras] = useState<any[]>([]);
  const [pacotes, setPacotes] = useState<any[]>([]);
  const [pacoteItens, setPacoteItens] = useState<any[]>([]);
  const [clientes, setClientes] = useState<any[]>([]);
  const [extrasClientes, setExtrasClientes] = useState<any[]>([]);
  const [categoriaSel, setCategoriaSel] = useState<CategoriaExtra | "pacotes">("fixo");
  const [buscaGeral, setBuscaGeral] = useState("");
  const [buscaCategoria, setBuscaCategoria] = useState("");

  const [showNewPacote, setShowNewPacote] = useState(false);
  const [pacoteForm, setPacoteForm] = useState({ nome: "", descricao: "", preco_total: "", itens: [] as string[] });

  const [showNew, setShowNew] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showAtribuir, setShowAtribuir] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [extraSel, setExtraSel] = useState<any>(null);
  const [clienteSel, setClienteSel] = useState("");
  const [observacao, setObservacao] = useState("");
  const [saving, setSaving] = useState(false);

  const emptyForm = { nome: "", descricao: "", categoria: "fixo" as CategoriaExtra, subcategoria: "", preco_ativacao: "", preco_mensal: "", status: "ativo" };
  const [form, setForm] = useState(emptyForm);
  const [editForm, setEditForm] = useState({ ...emptyForm, id: "" });

  const fetchData = async () => {
    // @ts-ignore
    const [extrasRes, pacotesRes, piRes, clientesRes, ecRes] = await Promise.all([
      supabase.from("extras_catalogo").select("*").order("nome"),
      (supabase.from as any)("pacotes").select("*").order("nome"),
      (supabase.from as any)("pacote_itens").select("*"),
      supabase.from("clientes").select("id, nome, email").eq("status", "ativo").order("nome"),
      supabase.from("extras_clientes").select("extra_id").eq("status", "ativo"),
    ]);
    setExtras(extrasRes.data || []);
    setPacotes(pacotesRes.data || []);
    setPacoteItens(piRes.data || []);
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
    if (categoriaSel === "pacotes") {
      let list = [...pacotes];
      if (buscaGeral) list = list.filter(p => p.nome.toLowerCase().includes(buscaGeral.toLowerCase()));
      if (buscaCategoria) list = list.filter(p => p.nome.toLowerCase().includes(buscaCategoria.toLowerCase()));
      return list;
    }
    let list = extras.filter(e => e.categoria === categoriaSel);
    if (buscaGeral) list = list.filter(e => e.nome.toLowerCase().includes(buscaGeral.toLowerCase()));
    if (buscaCategoria) list = list.filter(e => e.nome.toLowerCase().includes(buscaCategoria.toLowerCase()));
    return list;
  }, [extras, pacotes, categoriaSel, buscaGeral, buscaCategoria]);

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

  const handleSavePacote = async () => {
    if (!pacoteForm.nome) return;
    setSaving(true);
    const { data: pkg, error } = await (supabase.from as any)("pacotes").insert({
      nome: pacoteForm.nome, descricao: pacoteForm.descricao, preco_total: Number(pacoteForm.preco_total) || 0
    }).select().single();

    if (!error && pkg && pacoteForm.itens.length > 0) {
      const links = pacoteForm.itens.map(id => ({ pacote_id: (pkg as any).id, extra_id: id }));
      await (supabase.from as any)("pacote_itens").insert(links);
    }

    setSaving(false);
    if (error) { toast({ title: "Erro", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Pacote criado!" });
    setShowNewPacote(false);
    setPacoteForm({ nome: "", descricao: "", preco_total: "", itens: [] });
    fetchData();
  };

  const deletePacote = async (id: string) => {
    setSaving(true);
    await (supabase.from as any)("pacotes").delete().eq("id", id);
    setSaving(false);
    fetchData();
    toast({ title: "Pacote excluído" });
  };

  const handleDelete = async () => {
    if (!extraSel) return;
    setSaving(true);
    // Remove atribuições primeiro
    await supabase.from("extras_clientes").delete().eq("extra_id", extraSel.id);
    const { error } = await supabase.from("extras_catalogo").delete().eq("id", extraSel.id);
    setSaving(false);
    if (error) { toast({ title: "Erro", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Extra excluído!" });
    setShowDelete(false);
    setExtraSel(null);
    fetchData();
  };

  const handleAtribuir = async () => {
    if (!clienteSel || !extraSel) return;
    setSaving(true);

    // Se extraSel tiver 'itens', é um pacote
    if (extraSel.preco_total !== undefined) {
      const items = pacoteItens.filter(pi => pi.pacote_id === extraSel.id);
      const batch = items.map(pi => {
        const fullExtra = extras.find(e => e.id === pi.extra_id);
        return {
          cliente_id: clienteSel, extra_id: pi.extra_id, pacote_id: extraSel.id,
          categoria: (fullExtra?.categoria as any) || 'fixo',
          preco_ativacao: fullExtra?.preco_ativacao || 0,
          preco_mensal: fullExtra?.preco_mensal || 0,
          observacao: observacao || null,
        } as any;
      });
      await supabase.from("extras_clientes").insert(batch);
    } else {
      await supabase.from("extras_clientes").insert({
        cliente_id: clienteSel, extra_id: extraSel.id, categoria: extraSel.categoria,
        preco_ativacao: Number(extraSel.preco_ativacao) || 0, preco_mensal: Number(extraSel.preco_mensal) || 0, observacao: observacao || null,
      });
    }

    setSaving(false);
    fetchData();
    setShowAtribuir(false);
    toast({ title: "Extra(s) atribuídos!" });
  };

  const config = categoriaSel === "pacotes"
    ? { label: "Pacote", plural: "Pacotes Premium", color: "text-purple-400", border: "border-purple-500/30", bg: "bg-purple-500/10", icon: Rocket }
    : catConfig[categoriaSel as CategoriaExtra];

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

          <Card
            className={`cursor-pointer transition-all border-[0.5px] ${categoriaSel === "pacotes" ? "border-purple-500/50 shadow-lg" : "border-purple-500/10"} hover:border-purple-500/30`}
            style={{ background: categoriaSel === "pacotes" ? "rgba(168,85,247,0.08)" : "rgba(255,255,255,0.04)" }}
            onClick={() => setCategoriaSel("pacotes")}
          >
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-purple-500/10">
                <Rocket className="w-5 h-5 text-purple-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-purple-400">Pacotes Premium</h3>
                <p className="text-[11px] text-white/40">Combos de funcionalidades</p>
              </div>
              <span className="text-xl font-bold text-purple-400">{pacotes.length}</span>
            </CardContent>
          </Card>

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
              <Button className="gradient-primary border-0 text-white text-xs h-9" onClick={() => {
                if (categoriaSel === "pacotes") {
                  setShowNewPacote(true);
                } else {
                  setForm({ ...emptyForm, categoria: categoriaSel });
                  setShowNew(true);
                }
              }}>
                <Plus className="w-3.5 h-3.5 mr-1.5" /> {categoriaSel === "pacotes" ? "Novo pacote" : "Novo extra"}
              </Button>
            </div>
          </div>

          {/* Cards grid */}
          {filtrados.length === 0 ? (
            <p className="text-center text-sm text-white/40 py-16">Nenhum {categoriaSel === "pacotes" ? "pacote" : "extra"} encontrado</p>
          ) : categoriaSel === "pacotes" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[calc(100vh-200px)] overflow-y-auto pr-1 custom-scrollbar">
              {filtrados.map(pkg => {
                const itensPkg = pacoteItens.filter(pi => pi.pacote_id === pkg.id);
                return (
                  <Card key={pkg.id} className="border-[0.5px] border-purple-500/30 hover:border-purple-500/50 transition-all bg-white/[0.04]">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-sm font-bold text-purple-400 leading-tight flex-1 pr-2">{pkg.nome}</h4>
                        <Rocket className="w-4 h-4 text-purple-400/40" />
                      </div>
                      <p className="text-[11px] text-white/40 mb-3 line-clamp-2">{pkg.descricao}</p>

                      <div className="space-y-1 mb-4">
                        <p className="text-[10px] text-white/20 uppercase font-semibold">Itens inclusos:</p>
                        <ul className="text-[10px] text-white/60 list-disc list-inside">
                          {itensPkg.map(pi => {
                            const ex = extras.find(e => e.id === pi.extra_id);
                            return <li key={pi.id}>{ex?.nome}</li>;
                          })}
                        </ul>
                      </div>

                      <div className="flex items-center justify-between mb-4">
                        <p className="text-sm font-bold text-purple-400">R$ {Number(pkg.preco_total).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                        <Badge variant="outline" className="text-[9px] border-purple-500/20 text-purple-400 bg-purple-500/5">Pacote Econômico</Badge>
                      </div>

                      <div className="flex gap-2">
                        <Button size="sm" className="flex-1 h-8 text-xs gradient-primary border-0 text-white" onClick={() => abrirAtribuir(pkg)}>
                          <UserPlus className="w-3 h-3 mr-1.5" /> Adicionar a Cliente
                        </Button>
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-400/60 hover:text-red-400 hover:bg-red-500/10" onClick={() => deletePacote(pkg.id)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
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
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-400/60 hover:text-red-400 hover:bg-red-500/10" onClick={() => { setExtraSel(extra); setShowDelete(true); }}>
                          <Trash2 className="w-3.5 h-3.5" />
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
        <p className="text-[11px] text-white/20">WebNovaX © 2025 — v2.4.8 Premium — Painel Administrativo</p>
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

      {/* MODAL — Confirmar Exclusão */}
      <Dialog open={showDelete} onOpenChange={setShowDelete}>
        <DialogContent className="glass-card border-[0.5px] text-white max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-white">Excluir Extra</DialogTitle>
            <DialogDescription className="text-white/50">
              Tem certeza que deseja excluir <strong className="text-white">{extraSel?.nome}</strong>? Esta ação também removerá todas as atribuições a clientes e não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 mt-2">
            <Button variant="ghost" className="border border-white/10 text-white/60" onClick={() => setShowDelete(false)}>Cancelar</Button>
            <Button className="bg-red-600 hover:bg-red-700 text-white border-0" onClick={handleDelete} disabled={saving}>
              {saving ? "Excluindo..." : "Excluir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL — Novo Pacote */}
      <Dialog open={showNewPacote} onOpenChange={setShowNewPacote}>
        <DialogContent className="glass-card border-[0.5px] text-white max-w-lg overflow-y-auto max-h-[90vh]">
          <DialogHeader><DialogTitle className="text-white">Criar Novo Pacote</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label className="text-xs text-white/50">Nome do Pacote</Label>
              <Input className="glass-input border-[rgba(255,255,255,0.1)] text-white text-sm h-9" value={pacoteForm.nome} onChange={e => setPacoteForm({ ...pacoteForm, nome: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-white/50">Descrição</Label>
              <Textarea className="glass-input border-[rgba(255,255,255,0.1)] text-white text-sm min-h-[50px]" value={pacoteForm.descricao} onChange={e => setPacoteForm({ ...pacoteForm, descricao: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-white/50">Preço Sugerido (R$)</Label>
              <Input type="number" className="glass-input border-[rgba(255,255,255,0.1)] text-white text-sm h-9" value={pacoteForm.preco_total} onChange={e => setPacoteForm({ ...pacoteForm, preco_total: e.target.value })} />
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-white/50 font-bold">Selecionar Itens inclusos</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 rounded bg-black/20 border border-white/5">
                {extras.map(ex => {
                  const isSelected = pacoteForm.itens.includes(ex.id);
                  return (
                    <div
                      key={ex.id}
                      onClick={() => {
                        const newItens = isSelected
                          ? pacoteForm.itens.filter(id => id !== ex.id)
                          : [...pacoteForm.itens, ex.id];
                        setPacoteForm({ ...pacoteForm, itens: newItens });
                      }}
                      className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-all border ${isSelected ? "bg-purple-500/20 border-purple-500/50" : "bg-white/5 border-transparent hover:border-white/10"}`}
                    >
                      <div className={`w-3.5 h-3.5 rounded-sm border ${isSelected ? "bg-purple-500 border-purple-400" : "border-white/20"}`} />
                      <span className="text-[10px] text-white/70 truncate">{ex.nome}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <Button className="gradient-primary border-0 text-white w-full rounded-lg" onClick={handleSavePacote} disabled={saving || !pacoteForm.nome}>
              {saving ? "Criando..." : "Criar Pacote Premium"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}


