import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { DeleteConfirmDialog, useDeleteConfirm } from "@/components/DeleteConfirmDialog";
import StatusBadge from "@/components/StatusBadge";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  CalendarClock,
  CircleDollarSign,
  MoreVertical,
  Pencil,
  Plus,
  ReceiptText,
  RefreshCcw,
  Search,
  ServerCog,
  Trash2,
} from "lucide-react";
import {
  createSystemCost,
  deleteSystemCost,
  getAnnualProjection,
  getMonthlyEquivalent,
  getSystemCostCategoryLabel,
  getSystemCostFrequencyLabel,
  isSystemCostDueSoon,
  listSystemCosts,
  SYSTEM_COST_CATEGORIES,
  SYSTEM_COST_FREQUENCIES,
  SYSTEM_COST_STATUSES,
  type SystemCost,
  updateSystemCost,
} from "@/lib/system-costs";
import { useRealtimeRefresh } from "@/hooks/useRealtimeRefresh";

const fadeUp = { hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };
const moneyFormatter = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const emptyForm = {
  nome: "",
  categoria: "hospedagem",
  fornecedor: "",
  valor: "",
  frequencia: "mensal",
  proxima_cobranca: "",
  dia_vencimento: "",
  status: "ativo",
  pagamento_automatico: false,
  descricao: "",
  observacoes: "",
};

type FormState = typeof emptyForm;

function getRecurringDayLabel(day: number | null) {
  if (!day) return "Sem dia fixo";
  return `Todo dia ${String(day).padStart(2, "0")}`;
}

function getUpcomingLabel(cost: SystemCost | null) {
  if (!cost?.proxima_cobranca) return "Sem próxima cobrança";
  return `${new Date(`${cost.proxima_cobranca}T12:00:00`).toLocaleDateString("pt-BR")} • ${cost.nome}`;
}

export default function SystemCostsSection() {
  const { toast } = useToast();
  const [costs, setCosts] = useState<SystemCost[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [filterStatus, setFilterStatus] = useState("todos");
  const [query, setQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const { requestDelete, dialogProps } = useDeleteConfirm();

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await listSystemCosts();
    setLoading(false);

    if (error) {
      toast({ title: "Erro ao carregar custos", description: error.message, variant: "destructive" });
      return;
    }

    setCosts(data || []);
  }, [toast]);

  useEffect(() => {
    void load();
  }, [load]);

  useRealtimeRefresh(
    [{ table: "custos_sistema" }],
    load,
    { channelPrefix: "admin-system-costs" },
  );

  const activeCosts = useMemo(() => costs.filter((cost) => cost.status === "ativo"), [costs]);
  const monthlyBase = useMemo(() => activeCosts.reduce((sum, cost) => sum + getMonthlyEquivalent(cost), 0), [activeCosts]);
  const annualProjection = useMemo(() => activeCosts.reduce((sum, cost) => sum + getAnnualProjection(cost), 0), [activeCosts]);
  const dueSoonCosts = useMemo(() => activeCosts.filter((cost) => isSystemCostDueSoon(cost, 30)), [activeCosts]);
  const dueSoonTotal = useMemo(() => dueSoonCosts.reduce((sum, cost) => sum + Number(cost.valor), 0), [dueSoonCosts]);
  const nextDueCost = useMemo(() => activeCosts.find((cost) => Boolean(cost.proxima_cobranca)) || null, [activeCosts]);

  const filteredCosts = useMemo(() => {
    const search = query.trim().toLowerCase();
    return costs.filter((cost) => {
      const matchStatus = filterStatus === "todos" || cost.status === filterStatus;
      const haystack = `${cost.nome} ${cost.fornecedor || ""} ${cost.categoria} ${cost.descricao || ""}`.toLowerCase();
      return matchStatus && (!search || haystack.includes(search));
    });
  }, [costs, filterStatus, query]);

  const openNew = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (cost: SystemCost) => {
    setEditingId(cost.id);
    setForm({
      nome: cost.nome,
      categoria: cost.categoria,
      fornecedor: cost.fornecedor || "",
      valor: String(cost.valor),
      frequencia: cost.frequencia,
      proxima_cobranca: cost.proxima_cobranca || "",
      dia_vencimento: cost.dia_vencimento ? String(cost.dia_vencimento) : "",
      status: cost.status,
      pagamento_automatico: cost.pagamento_automatico,
      descricao: cost.descricao || "",
      observacoes: cost.observacoes || "",
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    const value = Number(form.valor);
    const dueDay = form.dia_vencimento ? Number(form.dia_vencimento) : null;

    if (!form.nome.trim() || !Number.isFinite(value) || value <= 0) {
      toast({
        title: "Preencha os campos obrigatórios",
        description: "Informe pelo menos o nome do custo e um valor válido.",
        variant: "destructive",
      });
      return;
    }

    if (dueDay !== null && (!Number.isInteger(dueDay) || dueDay < 1 || dueDay > 31)) {
      toast({ title: "Dia de vencimento inválido", description: "Use um número entre 1 e 31.", variant: "destructive" });
      return;
    }

    setSaving(true);
    const payload = {
      nome: form.nome.trim(),
      categoria: form.categoria,
      fornecedor: form.fornecedor.trim() || null,
      valor: value,
      frequencia: form.frequencia,
      proxima_cobranca: form.proxima_cobranca || null,
      dia_vencimento: dueDay,
      status: form.status,
      pagamento_automatico: form.pagamento_automatico,
      descricao: form.descricao.trim() || null,
      observacoes: form.observacoes.trim() || null,
      updated_at: new Date().toISOString(),
    } as const;

    const result = editingId ? await updateSystemCost(editingId, payload) : await createSystemCost(payload);
    setSaving(false);

    if (result.error) {
      toast({ title: "Erro ao salvar custo", description: result.error.message, variant: "destructive" });
      return;
    }

    toast({ title: editingId ? "Custo atualizado!" : "Custo adicionado ao painel!" });
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
    load();
  };

  const handleDelete = (cost: SystemCost) => {
    requestDelete(async () => {
      const { error } = await deleteSystemCost(cost.id);
      if (error) {
        toast({ title: "Erro ao excluir custo", description: error.message, variant: "destructive" });
        return;
      }
      toast({ title: "Custo removido!" });
      load();
    }, "Excluir custo do sistema", `O item "${cost.nome}" será removido permanentemente.`);
  };

  return (
    <motion.section variants={fadeUp} className="space-y-4">
      <Card className="glass-card border-[0.5px]">
        <CardHeader className="space-y-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="rounded-xl bg-cyan-500/10 p-2 text-cyan-400">
                  <ServerCog className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle className="text-base text-white">Custos do Sistema</CardTitle>
                  <CardDescription className="text-[hsl(var(--muted-foreground))]">
                    Cadastre gastos fixos para manter a operação ativa, como hospedagem, programação, domínio e ferramentas.
                  </CardDescription>
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-xs text-[hsl(var(--muted-foreground))]">
                Essa área separa a manutenção da NovaesWeb do fluxo de cobranças dos clientes e te ajuda a enxergar o custo real da operação.
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" className="glass-input border-0 text-white" onClick={load} disabled={loading}>
                <RefreshCcw className="mr-2 h-4 w-4" />
                Atualizar
              </Button>
              <Button type="button" className="gradient-primary border-0 text-white" onClick={openNew}>
                <Plus className="mr-2 h-4 w-4" />
                Novo custo
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Card className="border border-white/10 bg-white/[0.03]">
              <CardContent className="flex items-center gap-4 p-5">
                <div className="rounded-2xl bg-cyan-500/10 p-3 text-cyan-400">
                  <CircleDollarSign className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">Base mensal</p>
                  <p className="text-xl font-bold text-white">{moneyFormatter.format(monthlyBase)}</p>
                  <p className="text-[11px] text-[hsl(var(--muted-foreground))]">Custos ativos convertidos para visão mensal</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-white/10 bg-white/[0.03]">
              <CardContent className="flex items-center gap-4 p-5">
                <div className="rounded-2xl bg-violet-500/10 p-3 text-violet-400">
                  <ReceiptText className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">Projeção anual</p>
                  <p className="text-xl font-bold text-white">{moneyFormatter.format(annualProjection)}</p>
                  <p className="text-[11px] text-[hsl(var(--muted-foreground))]">Estimativa dos custos ativos ao longo de 12 meses</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-white/10 bg-white/[0.03]">
              <CardContent className="flex items-center gap-4 p-5">
                <div className="rounded-2xl bg-amber-500/10 p-3 text-amber-400">
                  <CalendarClock className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">Próximos 30 dias</p>
                  <p className="text-xl font-bold text-white">{moneyFormatter.format(dueSoonTotal)}</p>
                  <p className="text-[11px] text-[hsl(var(--muted-foreground))]">
                    {dueSoonCosts.length} cobrança(s) próximas • {getUpcomingLabel(nextDueCost)}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardHeader>
      </Card>

      <Card className="glass-card border-[0.5px]">
        <CardHeader className="space-y-3">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle className="text-sm font-semibold text-white">Itens cadastrados</CardTitle>
              <CardDescription className="text-[hsl(var(--muted-foreground))]">
                Registre tudo o que mantém a operação online e sob controle.
              </CardDescription>
            </div>

            <div className="relative w-full lg:max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar custo, fornecedor ou categoria"
                className="glass-input border-[rgba(255,255,255,0.1)] pl-9 text-white"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {["todos", "ativo", "pausado", "cancelado"].map((status) => (
              <Button
                key={status}
                type="button"
                size="sm"
                className={cn(
                  "border-0 text-xs",
                  filterStatus === status ? "gradient-primary text-white" : "glass-input text-[hsl(var(--muted-foreground))] hover:text-white"
                )}
                onClick={() => setFilterStatus(status)}
              >
                {status === "todos" ? "Todos" : status.charAt(0).toUpperCase() + status.slice(1)}
              </Button>
            ))}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-3 lg:hidden">
            {loading ? (
              <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] py-8 text-center text-sm text-[hsl(var(--muted-foreground))]">
                Carregando custos do sistema...
              </div>
            ) : filteredCosts.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-4 py-8 text-center">
                <p className="text-sm font-semibold text-white">Nenhum custo nesta visão</p>
                <p className="mt-2 text-xs text-[hsl(var(--muted-foreground))]">
                  Cadastre os gastos de hospedagem, programação, domínio e ferramentas para acompanhar a estrutura do sistema.
                </p>
              </div>
            ) : (
              filteredCosts.map((cost) => (
                <div key={cost.id} className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-white">{cost.nome}</p>
                      <p className="text-xs text-[hsl(var(--muted-foreground))]">{cost.fornecedor || "Fornecedor não informado"}</p>
                    </div>
                    <StatusBadge status={cost.status} />
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="border-cyan-500/30 bg-cyan-500/10 text-cyan-300">
                      {getSystemCostCategoryLabel(cost.categoria)}
                    </Badge>
                    <Badge variant="outline" className="border-white/10 bg-white/5 text-white/70">
                      {getSystemCostFrequencyLabel(cost.frequencia)}
                    </Badge>
                    {cost.pagamento_automatico && (
                      <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-300">
                        Automático
                      </Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="text-[hsl(var(--muted-foreground))]">Valor</p>
                      <p className="font-semibold text-white">{moneyFormatter.format(Number(cost.valor))}</p>
                    </div>
                    <div>
                      <p className="text-[hsl(var(--muted-foreground))]">Próxima cobrança</p>
                      <p className="font-semibold text-white">
                        {cost.proxima_cobranca ? new Date(`${cost.proxima_cobranca}T12:00:00`).toLocaleDateString("pt-BR") : "Não definida"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[hsl(var(--muted-foreground))]">Dia recorrente</p>
                      <p className="font-semibold text-white">{getRecurringDayLabel(cost.dia_vencimento)}</p>
                    </div>
                    <div>
                      <p className="text-[hsl(var(--muted-foreground))]">Base mensal</p>
                      <p className="font-semibold text-white">{moneyFormatter.format(getMonthlyEquivalent(cost))}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 border-t border-white/5 pt-2">
                    <Button type="button" size="sm" variant="ghost" className="h-8 px-3 text-xs text-white/70" onClick={() => openEdit(cost)}>
                      <Pencil className="mr-2 h-3.5 w-3.5" />
                      Editar
                    </Button>
                    <Button type="button" size="sm" variant="ghost" className="h-8 px-3 text-xs text-red-400/80 hover:text-red-400" onClick={() => handleDelete(cost)}>
                      <Trash2 className="mr-2 h-3.5 w-3.5" />
                      Excluir
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="hidden overflow-x-auto lg:block">
            <Table>
              <TableHeader>
                <TableRow className="border-[rgba(255,255,255,0.06)]">
                  {["Nome", "Categoria", "Frequência", "Valor", "Próxima cobrança", "Fornecedor", "Status", "Ações"].map((header) => (
                    <TableHead key={header} className="text-[11px] text-[hsl(var(--muted-foreground))]">{header}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="py-8 text-center text-sm text-[hsl(var(--muted-foreground))]">Carregando custos do sistema...</TableCell>
                  </TableRow>
                ) : filteredCosts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="py-8 text-center text-sm text-[hsl(var(--muted-foreground))]">Nenhum custo cadastrado nesta visão.</TableCell>
                  </TableRow>
                ) : (
                  filteredCosts.map((cost) => (
                    <TableRow key={cost.id} className="border-[rgba(255,255,255,0.04)]">
                      <TableCell className="max-w-[240px]">
                        <div className="space-y-1">
                          <p className="truncate text-sm font-medium text-white">{cost.nome}</p>
                          <p className="truncate text-xs text-[hsl(var(--muted-foreground))]">{cost.descricao || cost.observacoes || "Sem observações"}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-cyan-500/30 bg-cyan-500/10 text-cyan-300">
                          {getSystemCostCategoryLabel(cost.categoria)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-white/80">
                        <div className="space-y-1">
                          <p>{getSystemCostFrequencyLabel(cost.frequencia)}</p>
                          <p className="text-xs text-[hsl(var(--muted-foreground))]">{getRecurringDayLabel(cost.dia_vencimento)}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm font-semibold text-white">
                        <div className="space-y-1">
                          <p>{moneyFormatter.format(Number(cost.valor))}</p>
                          <p className="text-xs font-normal text-[hsl(var(--muted-foreground))]">Base: {moneyFormatter.format(getMonthlyEquivalent(cost))}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-[hsl(var(--muted-foreground))]">
                        {cost.proxima_cobranca ? new Date(`${cost.proxima_cobranca}T12:00:00`).toLocaleDateString("pt-BR") : "Não definida"}
                      </TableCell>
                      <TableCell className="text-sm text-[hsl(var(--muted-foreground))]">
                        <div className="space-y-1">
                          <p>{cost.fornecedor || "—"}</p>
                          {cost.pagamento_automatico && <p className="text-xs text-emerald-300">Cobrança automática</p>}
                        </div>
                      </TableCell>
                      <TableCell><StatusBadge status={cost.status} /></TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="sm" variant="ghost" className="h-8 px-2 text-white/60">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="border-white/10 bg-[#1a1a2e] text-white">
                            <DropdownMenuItem className="cursor-pointer gap-2 text-xs" onClick={() => openEdit(cost)}>
                              <Pencil className="h-3 w-3 text-blue-400" />
                              Editar custo
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-white/5" />
                            <DropdownMenuItem className="cursor-pointer gap-2 text-xs text-red-400 focus:text-red-400" onClick={() => handleDelete(cost)}>
                              <Trash2 className="h-3 w-3" />
                              Excluir custo
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showForm} onOpenChange={(open) => {
        setShowForm(open);
        if (!open) {
          setEditingId(null);
          setForm(emptyForm);
        }
      }}>
        <DialogContent className="glass-card max-w-2xl border-[0.5px] text-white">
          <DialogHeader>
            <DialogTitle className="text-white">{editingId ? "Editar custo do sistema" : "Novo custo do sistema"}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5 md:col-span-2">
              <Label className="text-xs text-[hsl(var(--muted-foreground))]">Nome do custo *</Label>
              <Input value={form.nome} onChange={(event) => setForm((current) => ({ ...current, nome: event.target.value }))} className="glass-input border-[rgba(255,255,255,0.1)] text-white" placeholder="Ex.: Hospedagem principal da Vercel" />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-[hsl(var(--muted-foreground))]">Categoria</Label>
              <Select value={form.categoria} onValueChange={(value) => setForm((current) => ({ ...current, categoria: value }))}>
                <SelectTrigger className="glass-input border-0 text-white"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SYSTEM_COST_CATEGORIES.map((category) => <SelectItem key={category.value} value={category.value}>{category.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-[hsl(var(--muted-foreground))]">Fornecedor</Label>
              <Input value={form.fornecedor} onChange={(event) => setForm((current) => ({ ...current, fornecedor: event.target.value }))} className="glass-input border-[rgba(255,255,255,0.1)] text-white" placeholder="Ex.: Vercel, Hostinger, freelancer" />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-[hsl(var(--muted-foreground))]">Valor *</Label>
              <Input type="number" min="0" step="0.01" value={form.valor} onChange={(event) => setForm((current) => ({ ...current, valor: event.target.value }))} className="glass-input border-[rgba(255,255,255,0.1)] text-white" placeholder="0,00" />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-[hsl(var(--muted-foreground))]">Frequência</Label>
              <Select value={form.frequencia} onValueChange={(value) => setForm((current) => ({ ...current, frequencia: value }))}>
                <SelectTrigger className="glass-input border-0 text-white"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SYSTEM_COST_FREQUENCIES.map((frequency) => <SelectItem key={frequency.value} value={frequency.value}>{frequency.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-[hsl(var(--muted-foreground))]">Próxima cobrança</Label>
              <Input type="date" value={form.proxima_cobranca} onChange={(event) => setForm((current) => ({ ...current, proxima_cobranca: event.target.value }))} className="glass-input border-[rgba(255,255,255,0.1)] text-white" />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-[hsl(var(--muted-foreground))]">Dia do vencimento</Label>
              <Input type="number" min="1" max="31" value={form.dia_vencimento} onChange={(event) => setForm((current) => ({ ...current, dia_vencimento: event.target.value }))} className="glass-input border-[rgba(255,255,255,0.1)] text-white" placeholder="Ex.: 5" />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-[hsl(var(--muted-foreground))]">Status</Label>
              <Select value={form.status} onValueChange={(value) => setForm((current) => ({ ...current, status: value }))}>
                <SelectTrigger className="glass-input border-0 text-white"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SYSTEM_COST_STATUSES.map((status) => <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <Label className="text-xs text-[hsl(var(--muted-foreground))]">Resumo do item</Label>
              <Input value={form.descricao} onChange={(event) => setForm((current) => ({ ...current, descricao: event.target.value }))} className="glass-input border-[rgba(255,255,255,0.1)] text-white" placeholder="Ex.: Plano anual do domínio principal da operação" />
            </div>

            <div className="space-y-2 md:col-span-2">
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-white">Cobrança automática</p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">Marque se o valor é debitado automaticamente sem ação manual.</p>
                </div>
                <Switch checked={form.pagamento_automatico} onCheckedChange={(checked) => setForm((current) => ({ ...current, pagamento_automatico: checked }))} />
              </div>
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <Label className="text-xs text-[hsl(var(--muted-foreground))]">Observações</Label>
              <Textarea value={form.observacoes} onChange={(event) => setForm((current) => ({ ...current, observacoes: event.target.value }))} className="glass-input min-h-[100px] border-[rgba(255,255,255,0.1)] text-white" placeholder="Ex.: renovação em dólar, reajuste previsto, contato do fornecedor, observações internas" />
            </div>
          </div>

          <Button type="button" className="gradient-primary mt-2 w-full border-0 text-white" onClick={handleSave} disabled={saving}>
            {saving ? "Salvando..." : editingId ? "Salvar alterações" : "Salvar custo"}
          </Button>
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog {...dialogProps} />
    </motion.section>
  );
}
