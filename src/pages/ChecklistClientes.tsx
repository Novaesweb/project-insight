import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useSearchParams } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  Filter,
  Mail,
  MapPin,
  Plus,
  Search,
  Trash2,
  Users,
  XCircle,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  type ClientChecklistItem,
  getChecklistApprovedCount,
  getChecklistOverallStatus,
  getChecklistPendingCount,
  getChecklistProgress,
  getChecklistStatusMeta,
  normalizeChecklistText,
} from "@/lib/client-checklist";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

type ClienteResumo = Pick<
  Tables<"clientes">,
  "id" | "nome" | "nome_empresa" | "email" | "whatsapp" | "telefone" | "cidade" | "estado" | "status" | "updated_at"
> & {
  cliente_checklist_items: ClientChecklistItem[];
};

const FILTERS = [
  { key: "todos", label: "Todos" },
  { key: "pendente", label: "Pendentes" },
  { key: "preenchido", label: "Preenchidos" },
  { key: "aprovado", label: "Aprovados" },
] as const;

export default function ChecklistClientes() {
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [clientes, setClientes] = useState<ClienteResumo[]>([]);
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState<(typeof FILTERS)[number]["key"]>("todos");
  const [loading, setLoading] = useState(true);
  const [savingChecklist, setSavingChecklist] = useState(false);
  const [editorItems, setEditorItems] = useState<ClientChecklistItem[]>([]);
  const [originalItems, setOriginalItems] = useState<Record<string, ClientChecklistItem>>({});
  const [deletedItemIds, setDeletedItemIds] = useState<string[]>([]);

  const selectedClientId = searchParams.get("cliente");

  const loadClientes = useCallback(async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("clientes")
      .select(`
        id,
        nome,
        nome_empresa,
        email,
        whatsapp,
        telefone,
        cidade,
        estado,
        status,
        updated_at,
        cliente_checklist_items (
          id,
          cliente_id,
          item_key,
          titulo,
          descricao,
          valor_texto,
          status,
          ordem,
          updated_by,
          created_at,
          updated_at
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Erro ao carregar checklist",
        description: error.message,
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    const normalized = (data || []).map((cliente: any) => ({
      ...cliente,
      cliente_checklist_items: [...(cliente.cliente_checklist_items || [])].sort(
        (left: ClientChecklistItem, right: ClientChecklistItem) => left.ordem - right.ordem
      ),
    })) as ClienteResumo[];

    setClientes(normalized);
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    void loadClientes();
  }, [loadClientes]);

  const clienteSelecionado = useMemo(
    () => clientes.find((cliente) => cliente.id === selectedClientId) || null,
    [clientes, selectedClientId]
  );

  useEffect(() => {
    if (!clienteSelecionado) {
      setEditorItems([]);
      setOriginalItems({});
      setDeletedItemIds([]);
      return;
    }

    const sortedItems = [...clienteSelecionado.cliente_checklist_items].sort((left, right) => left.ordem - right.ordem);
    setEditorItems(sortedItems);
    setOriginalItems(
      Object.fromEntries(sortedItems.map((item) => [item.id, item]))
    );
    setDeletedItemIds([]);
  }, [clienteSelecionado]);

  const clientesFiltrados = useMemo(() => {
    const normalizedBusca = busca.trim().toLowerCase();

    return clientes.filter((cliente) => {
      const matchesBusca =
        !normalizedBusca ||
        cliente.nome.toLowerCase().includes(normalizedBusca) ||
        cliente.email.toLowerCase().includes(normalizedBusca) ||
        (cliente.nome_empresa || "").toLowerCase().includes(normalizedBusca);

      const overallStatus = getChecklistOverallStatus(cliente.cliente_checklist_items);
      const matchesFiltro = filtro === "todos" || overallStatus === filtro;

      return matchesBusca && matchesFiltro;
    });
  }, [busca, clientes, filtro]);

  const summary = useMemo(() => {
    const base = {
      total: clientes.length,
      pendente: 0,
      preenchido: 0,
      aprovado: 0,
    };

    return clientes.reduce((accumulator, cliente) => {
      const status = getChecklistOverallStatus(cliente.cliente_checklist_items);
      accumulator[status] += 1;
      return accumulator;
    }, base);
  }, [clientes]);

  const openCliente = (clienteId: string) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("cliente", clienteId);
    setSearchParams(nextParams, { replace: true });
  };

  const closeCliente = () => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("cliente");
    setSearchParams(nextParams, { replace: true });
  };

  const handleChecklistValueChange = (itemId: string, value: string) => {
    setEditorItems((current) =>
      current.map((item) => {
        if (item.id !== itemId) return item;

        const normalizedValue = normalizeChecklistText(value);
        const nextStatus = normalizedValue
          ? item.status === "pendente"
            ? "preenchido"
            : item.status
          : "pendente";

        return {
          ...item,
          valor_texto: value,
          status: nextStatus,
        };
      })
    );
  };

  const handleChecklistStatusChange = (itemId: string, status: ClientChecklistItem["status"]) => {
    setEditorItems((current) =>
      current.map((item) => {
        if (item.id !== itemId) return item;

        return {
          ...item,
          status,
        };
      })
    );
  };

  const handleChecklistMetaChange = (
    itemId: string,
    field: "titulo" | "descricao",
    value: string
  ) => {
    setEditorItems((current) =>
      current.map((item) => {
        if (item.id !== itemId) return item;

        return {
          ...item,
          [field]: value,
        };
      })
    );
  };

  const handleAddChecklistItem = () => {
    if (!clienteSelecionado) return;

    const now = new Date().toISOString();
    const nextOrder = editorItems.length ? Math.max(...editorItems.map((item) => item.ordem)) + 1 : 1;

    setEditorItems((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        cliente_id: clienteSelecionado.id,
        item_key: `custom_${Date.now()}`,
        titulo: "",
        descricao: "",
        valor_texto: "",
        status: "pendente",
        ordem: nextOrder,
        updated_by: "admin",
        created_at: now,
        updated_at: now,
      },
    ]);
  };

  const handleRemoveChecklistItem = (itemId: string) => {
    if (originalItems[itemId]) {
      setDeletedItemIds((current) => [...new Set([...current, itemId])]);
    }

    setEditorItems((current) => current.filter((item) => item.id !== itemId));
  };

  const buildChecklistItemKey = (title: string, fallbackKey: string, index: number) => {
    const base = title
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");

    if (base) return base;
    if (fallbackKey?.trim()) return fallbackKey.trim();
    return `item_${index + 1}`;
  };

  const handleSaveChecklist = async () => {
    if (!clienteSelecionado || (!editorItems.length && !deletedItemIds.length)) return;

    setSavingChecklist(true);

    const emptyTitle = editorItems.find((item) => !item.titulo.trim());
    if (emptyTitle) {
      toast({
        title: "Título obrigatório",
        description: "Preencha o título de todos os itens do checklist antes de salvar.",
        variant: "destructive",
      });
      setSavingChecklist(false);
      return;
    }

    if (deletedItemIds.length) {
      const { error: deleteError } = await supabase
        .from("cliente_checklist_items")
        .delete()
        .in("id", deletedItemIds);

      if (deleteError) {
        toast({
          title: "Erro ao remover item",
          description: deleteError.message,
          variant: "destructive",
        });
        setSavingChecklist(false);
        return;
      }
    }

    const payload = editorItems.map((item, index) => {
      const normalizedValue = normalizeChecklistText(item.valor_texto);
      const originalItem = originalItems[item.id];

      let nextStatus = item.status;

      if (!normalizedValue) {
        nextStatus = "pendente";
      } else if (nextStatus === "pendente") {
        nextStatus = "preenchido";
      } else if (originalItem && normalizeChecklistText(originalItem.valor_texto) !== normalizedValue && nextStatus !== "aprovado") {
        nextStatus = "preenchido";
      }

      return {
        id: item.id,
        cliente_id: clienteSelecionado.id,
        item_key: buildChecklistItemKey(item.titulo, item.item_key, index),
        titulo: item.titulo.trim(),
        descricao: normalizeChecklistText(item.descricao) || null,
        valor_texto: normalizedValue || null,
        status: nextStatus,
        ordem: index + 1,
        updated_by: "admin",
      };
    });

    const { error } = await supabase.from("cliente_checklist_items").upsert(payload as never[]);

    if (error) {
      toast({
        title: "Erro ao salvar checklist",
        description: error.message,
        variant: "destructive",
      });
      setSavingChecklist(false);
      return;
    }

    toast({
      title: "Checklist atualizado!",
      description: "As informações e opções do checklist foram sincronizadas com sucesso.",
    });

    await loadClientes();
    setSavingChecklist(false);
  };

  return (
    <motion.div
      className="space-y-6"
      initial="hidden"
      animate="show"
      variants={{ show: { transition: { staggerChildren: 0.08 } } }}
    >
      <motion.div variants={fadeUp} className="space-y-2">
        <p className="text-[10px] font-black uppercase tracking-[0.28em] text-primary">Onboarding centralizado</p>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white">Checklist Clientes</h1>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              Acompanhe tudo o que cada cliente já enviou no cadastro e aprove os itens sem sair do admin.
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: "Clientes com checklist", value: summary.total, tone: "text-white", bg: "bg-white/[0.03]" },
          { label: "Pendentes", value: summary.pendente, tone: "text-amber-400", bg: "bg-amber-400/[0.06]" },
          { label: "Em revisão", value: summary.preenchido, tone: "text-blue-400", bg: "bg-blue-400/[0.06]" },
          { label: "Aprovados", value: summary.aprovado, tone: "text-emerald-400", bg: "bg-emerald-400/[0.06]" },
        ].map((card) => (
          <Card key={card.label} className={cn("glass-card border-[0.5px]", card.bg)}>
            <CardContent className="p-5 space-y-2">
              <p className="text-[10px] uppercase tracking-[0.24em] font-black text-white/40">{card.label}</p>
              <p className={cn("text-3xl font-black tracking-tight", card.tone)}>{card.value}</p>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      <motion.div variants={fadeUp}>
        <Card className="glass-card border-[0.5px]">
          <CardHeader className="space-y-4">
            <div className="flex flex-col lg:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--muted-foreground))]" />
                <Input
                  placeholder="Buscar por nome, empresa ou e-mail..."
                  className="pl-9 glass-input border-0 text-white"
                  value={busca}
                  onChange={(event) => setBusca(event.target.value)}
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {FILTERS.map((item) => (
                  <Button
                    key={item.key}
                    size="sm"
                    className={
                      filtro === item.key
                        ? "gradient-primary border-0 text-white"
                        : "glass-input border-0 text-[hsl(var(--muted-foreground))] hover:text-white"
                    }
                    onClick={() => setFiltro(item.key)}
                  >
                    {item.label}
                  </Button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <p className="text-sm text-white/40">Carregando checklist dos clientes...</p>
              </div>
            ) : clientesFiltrados.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center mb-5">
                  <Filter className="w-8 h-8 text-white/10" />
                </div>
                <h3 className="text-lg font-black text-white">Nenhum cliente nesta visão</h3>
                <p className="text-sm text-white/30 max-w-md mt-2">
                  Ajuste a busca ou troque o filtro para visualizar outro estágio do checklist.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {clientesFiltrados.map((cliente) => {
                  const items = cliente.cliente_checklist_items;
                  const overallStatus = getChecklistOverallStatus(items);
                  const statusMeta = getChecklistStatusMeta(overallStatus);
                  const progress = getChecklistProgress(items);
                  const pendingCount = getChecklistPendingCount(items);
                  const approvedCount = getChecklistApprovedCount(items);
                  const lastUpdatedAt = items.reduce((latest, item) => {
                    if (!latest) return item.updated_at;
                    return new Date(item.updated_at) > new Date(latest) ? item.updated_at : latest;
                  }, cliente.updated_at);

                  return (
                    <motion.div key={cliente.id} variants={fadeUp}>
                      <Card className="glass-card border-[0.5px] h-full">
                        <CardContent className="p-5 h-full flex flex-col gap-5">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-lg font-black text-white truncate">{cliente.nome}</p>
                              <p className="text-xs text-white/40 truncate">
                                {cliente.nome_empresa || cliente.email}
                              </p>
                            </div>
                            <Badge variant="outline" className={cn("border-[0.5px] rounded-full py-1 px-3", statusMeta.className)}>
                              {statusMeta.label}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-4">
                              <p className="text-[10px] uppercase tracking-[0.24em] font-black text-white/35">Progresso</p>
                              <p className="text-2xl font-black text-white mt-2">{progress}%</p>
                            </div>
                            <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-4">
                              <p className="text-[10px] uppercase tracking-[0.24em] font-black text-white/35">Pendentes</p>
                              <p className="text-2xl font-black text-amber-400 mt-2">{pendingCount}</p>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${progress}%`,
                                  background: "var(--gradient-primary)",
                                }}
                              />
                            </div>
                            <div className="flex flex-wrap items-center gap-3 text-[11px] text-white/45">
                              <span className="flex items-center gap-1.5">
                                <Mail className="w-3.5 h-3.5" /> {cliente.email}
                              </span>
                              <span className="flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5" /> {cliente.cidade || "Sem cidade"}{cliente.estado ? `, ${cliente.estado}` : ""}
                              </span>
                            </div>
                          </div>

                          <div className="mt-auto flex items-center justify-between gap-3 border-t border-white/5 pt-4">
                            <div className="text-[11px] text-white/35">
                              {approvedCount} de {items.length} itens aprovados
                              <div className="text-[10px] text-white/25 mt-1">
                                Última atualização em {new Date(lastUpdatedAt).toLocaleDateString("pt-BR")}
                              </div>
                            </div>
                            <Button
                              className="gradient-primary text-white text-[10px] font-black uppercase tracking-widest"
                              onClick={() => openCliente(cliente.id)}
                            >
                              Abrir checklist <ArrowRight className="w-3.5 h-3.5 ml-2" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <Sheet open={!!clienteSelecionado} onOpenChange={(open) => !open && closeCliente()}>
        <SheetContent className="glass-card border-l-white/5 w-full sm:max-w-2xl p-0 overflow-y-auto">
          {clienteSelecionado && (
            <div className="flex min-h-full flex-col">
              <div className="p-8 gradient-primary">
                <div className="space-y-4">
                  <p className="text-[10px] uppercase tracking-[0.28em] font-black text-white/60">Checklist do cliente</p>
                  <div className="space-y-2">
                    <SheetTitle className="text-3xl font-black text-white tracking-tighter">
                      {clienteSelecionado.nome}
                    </SheetTitle>
                    <SheetDescription className="text-white/75">
                      Revise o cadastro inicial, ajuste o texto e aprove os itens importantes sem sair do admin.
                    </SheetDescription>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="bg-white/10 border-white/20 text-white">
                      <Users className="w-3.5 h-3.5 mr-1.5" />
                      {clienteSelecionado.nome_empresa || "Sem empresa informada"}
                    </Badge>
                    <Badge variant="outline" className="bg-black/10 border-white/10 text-white">
                      {getChecklistProgress(editorItems)}% concluído
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-white/15 bg-black/10 text-white hover:bg-white/10"
                      onClick={handleAddChecklistItem}
                    >
                      <Plus className="w-3.5 h-3.5 mr-1.5" />
                      Novo item
                    </Button>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <Card className="glass-card border-[0.5px]">
                  <CardContent className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.24em] font-black text-white/35 mb-1">E-mail</p>
                      <p className="text-white">{clienteSelecionado.email}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.24em] font-black text-white/35 mb-1">WhatsApp</p>
                      <p className="text-white">{clienteSelecionado.whatsapp || clienteSelecionado.telefone || "Não informado"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.24em] font-black text-white/35 mb-1">Localização</p>
                      <p className="text-white">{clienteSelecionado.cidade || "Sem cidade"}{clienteSelecionado.estado ? `, ${clienteSelecionado.estado}` : ""}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.24em] font-black text-white/35 mb-1">Status geral</p>
                      <Badge
                        variant="outline"
                        className={cn(
                          "border-[0.5px] rounded-full py-1 px-3",
                          getChecklistStatusMeta(getChecklistOverallStatus(editorItems)).className
                        )}
                      >
                        {getChecklistStatusMeta(getChecklistOverallStatus(editorItems)).label}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-4">
                  {editorItems.map((item) => {
                    const statusMeta = getChecklistStatusMeta(item.status);

                    return (
                      <Card key={item.id} className="glass-card border-[0.5px]">
                        <CardContent className="p-5 space-y-4">
                          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                            <div className="space-y-3 flex-1">
                              <div className="space-y-1.5">
                                <Label className="text-[10px] uppercase tracking-[0.22em] font-black text-white/35">Título do item</Label>
                                <Input
                                  value={item.titulo}
                                  onChange={(event) => handleChecklistMetaChange(item.id, "titulo", event.target.value)}
                                  className="glass-input border-white/10 text-white"
                                  placeholder="Ex: Enviar logo em PNG"
                                />
                              </div>
                              <div className="space-y-1.5">
                                <Label className="text-[10px] uppercase tracking-[0.22em] font-black text-white/35">Orientação para o cliente</Label>
                                <Textarea
                                  value={item.descricao || ""}
                                  onChange={(event) => handleChecklistMetaChange(item.id, "descricao", event.target.value)}
                                  className="glass-input min-h-[90px] border-white/10 text-white"
                                  placeholder="Explique o que você quer que o cliente envie nesse item."
                                />
                              </div>
                            </div>
                            <div className="flex flex-col items-start md:items-end gap-2 shrink-0">
                              <Badge variant="outline" className={cn("border-[0.5px] rounded-full py-1 px-3 shrink-0", statusMeta.className)}>
                                {statusMeta.label}
                              </Badge>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                                onClick={() => handleRemoveChecklistItem(item.id)}
                              >
                                <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                                Remover
                              </Button>
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <Label className="text-[10px] uppercase tracking-[0.22em] font-black text-white/35">Conteúdo enviado</Label>
                            <Textarea
                              value={item.valor_texto || ""}
                              onChange={(event) => handleChecklistValueChange(item.id, event.target.value)}
                              className="glass-input min-h-[120px] border-white/10 text-white"
                              placeholder="Digite ou ajuste aqui o conteúdo enviado pelo cliente..."
                            />
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <Button
                              size="sm"
                              className="gradient-primary text-white text-[10px] font-black uppercase tracking-widest"
                              onClick={() => handleChecklistStatusChange(item.id, "aprovado")}
                              disabled={!normalizeChecklistText(item.valor_texto)}
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                              Aprovar
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-white/10 text-[10px] font-black uppercase tracking-widest text-white/70 hover:text-white hover:bg-white/5"
                              onClick={() => handleChecklistStatusChange(item.id, "pendente")}
                            >
                              <XCircle className="w-3.5 h-3.5 mr-1.5" />
                              Voltar para pendente
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    className="gradient-primary text-white"
                    onClick={handleSaveChecklist}
                    disabled={savingChecklist || (!editorItems.length && !deletedItemIds.length)}
                  >
                    {savingChecklist ? "Salvando checklist..." : "Salvar checklist"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </motion.div>
  );
}
