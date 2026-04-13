import React, { useEffect, useMemo, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Pencil, Trash2, DollarSign, FileText, Layout, Copy, Zap, Package, CheckCircle2 } from "lucide-react";
import StatusBadge from "@/components/StatusBadge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { DeleteConfirmDialog, useDeleteConfirm } from "@/components/DeleteConfirmDialog";
import { useRealtimeRefresh } from "@/hooks/useRealtimeRefresh";
import { usePersistentDraftState } from "@/hooks/usePersistentDraftState";

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

const PEDIDO_TIPO_OPTIONS = [
  { value: "site", label: "Site" },
  { value: "sistema", label: "Sistema" },
  { value: "landing_page", label: "Landing Page" },
  { value: "ecommerce", label: "E-commerce" },
  { value: "manutencao", label: "Manutenção" },
  { value: "outro", label: "Outro" },
];

const INITIAL_FORM = {
  id: "",
  codigo: "",
  tipo: "site",
  titulo: "",
  descricao: "",
  observacoes: "",
  valor: "",
  cliente_id: "",
};

const INITIAL_PEDIDO_DRAFT = {
  dialogOpen: false,
  editingItemId: "",
  form: { ...INITIAL_FORM },
};

function getPedidoTipoLabel(tipo: string) {
  return PEDIDO_TIPO_OPTIONS.find((option) => option.value === tipo)?.label || tipo || "Pedido";
}

export default function Pedidos() {
  const { toast } = useToast();
  const { requestDelete, dialogProps } = useDeleteConfirm();
  const [filtro, setFiltro] = useState("todos");
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [clientes, setClientes] = useState<any[]>([]);
  const {
    state: pedidoDraft,
    setState: setPedidoDraft,
    markSaved: markPedidoDraftSaved,
    discardDraft: discardPedidoDraft,
  } = usePersistentDraftState({
    storageKey: "novaesweb:admin:pedidos:dialog-draft",
    initialState: INITIAL_PEDIDO_DRAFT,
  });
  const [saving, setSaving] = useState(false);
  const dialogOpen = pedidoDraft.dialogOpen;
  const editingItem = useMemo(
    () => pedidos.find((item) => item.id === pedidoDraft.editingItemId) || null,
    [pedidoDraft.editingItemId, pedidos],
  );
  const form = pedidoDraft.form;

  const setDialogOpen = useCallback((value: boolean) => {
    setPedidoDraft((current) => ({
      ...current,
      dialogOpen: value,
    }));
  }, [setPedidoDraft]);

  const setForm = useCallback((value: typeof INITIAL_FORM | ((current: typeof INITIAL_FORM) => typeof INITIAL_FORM)) => {
    setPedidoDraft((current) => ({
      ...current,
      form: typeof value === "function" ? value(current.form) : value,
    }));
  }, [setPedidoDraft]);

  const load = useCallback(async () => {
    const [pedidosResponse, clientesResponse] = await Promise.all([
      supabase.from("pedidos").select("*, clientes(id, nome)").order("created_at", { ascending: false }),
      supabase.from("clientes").select("id, nome").eq("status", "ativo"),
    ]);

    setPedidos(pedidosResponse.data || []);
    setClientes(clientesResponse.data || []);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useRealtimeRefresh(
    [
      { table: "pedidos" },
      { table: "clientes" },
      { table: "projetos" },
    ],
    load,
    { channelPrefix: "admin-pedidos" },
  );

  const resetForm = () => {
    discardPedidoDraft({ ...INITIAL_PEDIDO_DRAFT });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const codigo = form.codigo.trim() || `PED-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
    const payload = {
      codigo,
      tipo: form.tipo,
      titulo: form.titulo.trim() || null,
      descricao: form.descricao.trim() || null,
      observacoes: form.observacoes.trim() || null,
      valor: Number(form.valor) || 0,
      cliente_id: form.cliente_id || null,
    };

    const { error } = form.id
      ? await supabase.from("pedidos").update(payload).eq("id", form.id)
      : await supabase.from("pedidos").insert({
          ...payload,
          status: "pendente",
          data: new Date().toISOString().split("T")[0],
        });

    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      toast({ title: form.id ? "Pedido atualizado!" : "Pedido criado!" });
      markPedidoDraftSaved({ ...INITIAL_PEDIDO_DRAFT });
      await load();
    }

    setSaving(false);
  };

  const handleDelete = (id: string) => {
    requestDelete(async () => {
      const { error } = await supabase.from("pedidos").delete().eq("id", id);
      if (error) toast({ title: "Erro", description: error.message, variant: "destructive" });
      else {
        toast({ title: "Pedido excluído" });
        await load();
      }
    }, "Excluir Pedido", "Este pedido será removido permanentemente.");
  };

  const openEdit = (pedido: any) => {
    setForm({
      id: pedido.id,
      codigo: pedido.codigo || "",
      tipo: pedido.tipo || "site",
      titulo: pedido.titulo || "",
      descricao: pedido.descricao || "",
      observacoes: pedido.observacoes || "",
      valor: pedido.valor?.toString?.() || "",
      cliente_id: pedido.cliente_id || "",
    });
    setPedidoDraft((current) => ({
      ...current,
      dialogOpen: true,
      editingItemId: pedido.id,
    }));
  };

  const iniciarProjeto = async (pedido: any) => {
    if (pedido.projeto_id) return;
    if (!pedido.cliente_id) {
      toast({
        title: "Cliente obrigatório",
        description: "Associe um cliente ao pedido antes de iniciar o projeto.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);

    const clienteNome = pedido.clientes?.nome || "Cliente";
    const tituloProjeto = pedido.titulo?.trim() || `Projeto: ${getPedidoTipoLabel(pedido.tipo)} - ${clienteNome}`;
    const descricaoProjeto = pedido.descricao?.trim() || `Projeto gerado a partir do pedido ${pedido.codigo}`;

    const { data: novoProjeto, error: errorProj } = await supabase
      .from("projetos")
      .insert({
        titulo: tituloProjeto,
        descricao: descricaoProjeto,
        cliente_id: pedido.cliente_id,
        valor: pedido.valor || 0,
        status: "briefing",
        progresso: 20,
      })
      .select()
      .single();

    if (errorProj) {
      toast({ title: "Erro ao criar projeto", description: errorProj.message, variant: "destructive" });
      setSaving(false);
      return;
    }

    const { error: errorPed } = await supabase
      .from("pedidos")
      .update({
        projeto_id: novoProjeto.id,
        status: "aprovado",
      })
      .eq("id", pedido.id);

    if (errorPed) {
      await supabase.from("projetos").delete().eq("id", novoProjeto.id);
      toast({ title: "Erro ao aprovar pedido", description: errorPed.message, variant: "destructive" });
    } else {
      toast({ title: "Pedido aprovado!", description: "O projeto foi iniciado com base nesse pedido." });
      await load();
    }

    setSaving(false);
  };

  const filtrados = useMemo(() => {
    if (filtro === "todos") return pedidos;
    if (filtro === "pendente") return pedidos.filter((pedido) => pedido.status === "pendente");
    if (filtro === "aprovado") return pedidos.filter((pedido) => pedido.status === "aprovado");
    return pedidos;
  }, [filtro, pedidos]);

  return (
    <motion.div className="space-y-6" initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.08 } } }}>
      <motion.div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4" variants={fadeUp}>
        <div className="flex flex-wrap gap-2">
          {[
            { value: "todos", label: "Todos" },
            { value: "pendente", label: "Pendentes" },
            { value: "aprovado", label: "Aprovados" },
          ].map((item) => (
            <Button
              key={item.value}
              size="sm"
              className={filtro === item.value ? "gradient-primary border-0 text-white" : "glass-input border-0 text-[hsl(var(--muted-foreground))] hover:text-white"}
              onClick={() => setFiltro(item.value)}
            >
              {item.label}
            </Button>
          ))}
        </div>

        <Dialog
          open={dialogOpen}
          onOpenChange={(open) => {
            if (!open) {
              resetForm();
              return;
            }

            setDialogOpen(true);
          }}
        >
          <DialogTrigger asChild>
            <Button className="gradient-primary border-0 text-white rounded-lg" size="sm">
              <Plus className="w-4 h-4 mr-2" /> Novo Pedido
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-card border-[0.5px] text-[hsl(var(--foreground))]">
            <DialogHeader>
              <DialogTitle>{editingItem ? "Editar Pedido" : "Novo Pedido"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-[hsl(var(--muted-foreground))]">Código</Label>
                  <Input
                    value={form.codigo}
                    onChange={(e) => setForm({ ...form, codigo: e.target.value })}
                    placeholder="PED-001"
                    className="glass-input border-[0.5px] mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs text-[hsl(var(--muted-foreground))]">Tipo *</Label>
                  <Select value={form.tipo} onValueChange={(value) => setForm({ ...form, tipo: value })}>
                    <SelectTrigger className="glass-input border-[0.5px] mt-1">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {PEDIDO_TIPO_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label className="text-xs text-[hsl(var(--muted-foreground))]">Título do pedido *</Label>
                  <Input
                    value={form.titulo}
                    onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                    placeholder="Ex: Site institucional da clínica"
                    className="glass-input border-[0.5px] mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-[hsl(var(--muted-foreground))]">Cliente *</Label>
                  <Select value={form.cliente_id} onValueChange={(value) => setForm({ ...form, cliente_id: value })}>
                    <SelectTrigger className="glass-input border-[0.5px] mt-1">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {clientes.map((cliente) => (
                        <SelectItem key={cliente.id} value={cliente.id}>
                          {cliente.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-[hsl(var(--muted-foreground))]">Valor (R$)</Label>
                  <Input
                    type="number"
                    value={form.valor}
                    onChange={(e) => setForm({ ...form, valor: e.target.value })}
                    className="glass-input border-[0.5px] mt-1"
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs text-[hsl(var(--muted-foreground))]">Descrição</Label>
                <Textarea
                  value={form.descricao}
                  onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                  placeholder="Descreva rapidamente o que esse pedido precisa."
                  className="glass-input min-h-24 border-[0.5px] mt-1"
                />
              </div>

              <div>
                <Label className="text-xs text-[hsl(var(--muted-foreground))]">Observações internas</Label>
                <Textarea
                  value={form.observacoes}
                  onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
                  placeholder="Anotações internas, pendências ou alinhamentos comerciais."
                  className="glass-input min-h-24 border-[0.5px] mt-1"
                />
              </div>

              <Button type="submit" disabled={saving || !form.tipo || !form.cliente_id || !form.titulo.trim()} className="w-full gradient-primary border-0 text-white">
                {saving ? "Salvando..." : editingItem ? "Salvar Alterações" : "Criar Pedido"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </motion.div>

      <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filtrados.length === 0 ? (
          <div className="col-span-full p-20 border border-dashed border-white/10 rounded-[3rem] text-center bg-white/[0.01]">
            <Package className="w-12 h-12 text-white/10 mx-auto mb-4" />
            <p className="text-sm text-white/40 font-medium italic">Nenhum pedido encontrado nesta categoria.</p>
          </div>
        ) : (
          filtrados.map((pedido) => {
            const tituloPedido = pedido.titulo?.trim() || getPedidoTipoLabel(pedido.tipo);
            const tipoPedido = getPedidoTipoLabel(pedido.tipo);

            return (
              <Card key={pedido.id} className="glass-card border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all overflow-hidden group relative">
                <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none group-hover:scale-110 transition-transform">
                  <DollarSign className="w-24 h-24 text-primary" />
                </div>

                <CardContent className="p-8">
                  <div className="flex justify-between items-start mb-6">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{pedido.codigo}</span>
                        <StatusBadge status={pedido.status} />
                      </div>
                      <h3 className="text-lg font-black text-white group-hover:text-primary transition-colors line-clamp-2">{tituloPedido}</h3>
                      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/35">{tipoPedido}</p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-white/40 shadow-inner">
                      <FileText className="w-5 h-5" />
                    </div>
                  </div>

                  <div className="space-y-4 mb-8">
                    <div className="flex justify-between items-end border-b border-white/5 pb-4 gap-4">
                      <div className="min-w-0">
                        <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-1">Cliente</p>
                        <p className="text-sm font-bold text-white/80 truncate">{pedido.clientes?.nome || "Excluído"}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-1">Criado em</p>
                        <p className="text-sm font-bold text-white/80">{pedido.data ? new Date(pedido.data).toLocaleDateString("pt-BR") : "N/D"}</p>
                      </div>
                    </div>

                    {pedido.descricao ? (
                      <div className="rounded-2xl border border-white/5 bg-black/20 p-4">
                        <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-2">Descrição</p>
                        <p className="text-sm text-white/70 line-clamp-3">{pedido.descricao}</p>
                      </div>
                    ) : null}

                    <div className="pt-2">
                      <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-1">Valor do Pedido</p>
                      <p className="text-3xl font-black text-white tracking-tighter">
                        <span className="text-sm font-medium text-primary mr-1">R$</span>
                        {(pedido.valor || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Button
                      variant="ghost"
                      className="h-12 border border-white/5 hover:border-primary/20 hover:bg-primary/10 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-primary rounded-2xl transition-all"
                      onClick={() => {
                        const text = `💎 *PEDIDO novaesweb*\n\nNº: ${pedido.codigo}\nCliente: ${pedido.clientes?.nome}\nServiço: ${tituloPedido}\nTipo: ${tipoPedido}\nValor: R$ ${(pedido.valor || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}\nStatus: ${String(pedido.status || "").toUpperCase()}\n\n_Acesse seu portal para mais detalhes._`;
                        navigator.clipboard.writeText(text);
                        toast({ title: "Pronto para WhatsApp!", description: "Dados copiados com sucesso." });
                      }}
                    >
                      <Copy className="w-3.5 h-3.5 mr-2" /> Copiar Dados
                    </Button>

                    {pedido.projeto_id ? (
                      <Button
                        className="h-12 gradient-primary text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-primary/20"
                        onClick={() => (window.location.href = "/admin/projetos")}
                      >
                        <Layout className="w-3.5 h-3.5 mr-2" /> Ver Projeto
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        className="h-12 border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/10 text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all"
                        disabled={saving}
                        onClick={() => iniciarProjeto(pedido)}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 mr-2" /> Aprovar e Iniciar Projeto
                      </Button>
                    )}
                  </div>

                  <div className="absolute bottom-4 right-8 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg text-white/20 hover:text-white" onClick={() => openEdit(pedido)}>
                        <Pencil className="w-3 h-3" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg text-rose-500/40 hover:text-rose-500" onClick={() => handleDelete(pedido.id)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </motion.div>
      <DeleteConfirmDialog {...dialogProps} />
    </motion.div>
  );
}
