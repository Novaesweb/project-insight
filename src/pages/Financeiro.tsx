import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { TrendingUp, AlertTriangle, DollarSign, Plus, FileDown, FileText, FileSpreadsheet, Pencil, Trash2, MoreVertical, CheckCircle2, XCircle } from "lucide-react";
import StatusBadge from "@/components/StatusBadge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { exportFaturaPDF, exportFaturaWord, exportFaturaCSV } from "@/lib/fatura-export";
import { sendPushToAdmins } from "@/lib/push-notifications";
import { AsaasService } from "@/lib/asaas-service";
import { DeleteConfirmDialog, useDeleteConfirm } from "@/components/DeleteConfirmDialog";

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };
const emptyForm = { descricao: "", tipo: "entrada", valor: "", vencimento: "", cliente_id: "", status: "pendente" };

export default function Financeiro() {
  const { toast } = useToast();
  const [financeiro, setFinanceiro] = useState<any[]>([]);
  const [clientes, setClientes] = useState<any[]>([]);
  const [filtro, setFiltro] = useState("todos");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const load = async () => {
    const [f, c] = await Promise.all([
      supabase.from("financeiro").select("*, clientes(nome)").order("vencimento", { ascending: false }),
      supabase.from("clientes").select("id, nome").eq("status", "ativo"),
    ]);
    setFinanceiro(f.data || []);
    setClientes(c.data || []);
  };

  useEffect(() => { load(); }, []);

  const openNew = () => { setForm(emptyForm); setEditingId(null); setShowForm(true); };
  const openEdit = (f: any) => {
    setForm({
      descricao: f.descricao,
      tipo: f.tipo,
      valor: String(f.valor),
      vencimento: f.vencimento || "",
      cliente_id: f.cliente_id || "",
      status: f.status,
    });
    setEditingId(f.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.descricao || !form.valor) {
      toast({ title: "Preencha os campos obrigatórios", variant: "destructive" });
      return;
    }
    setSaving(true);
    const payload = {
      descricao: form.descricao,
      tipo: form.tipo,
      valor: Number(form.valor) || 0,
      vencimento: form.vencimento || null,
      cliente_id: form.cliente_id || null,
      status: form.status,
    };

    if (editingId) {
      const { error } = await supabase.from("financeiro").update(payload).eq("id", editingId);
      setSaving(false);
      if (error) { toast({ title: "Erro", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Lançamento atualizado!" });
    } else {
      const { error } = await supabase.from("financeiro").insert(payload);
      setSaving(false);
      if (error) { toast({ title: "Erro", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Lançamento criado!" });
      sendPushToAdmins("💰 Novo Lançamento", `${form.descricao} — R$ ${form.valor}`, "/admin/financeiro");
    }
    setShowForm(false);
    setForm(emptyForm);
    setEditingId(null);
    load();
  };

  const toggleStatus = async (id: string, current: string) => {
    const next = current === "pago" ? "pendente" : "pago";
    const { error } = await supabase.from("financeiro").update({ status: next }).eq("id", id);
    if (error) { toast({ title: "Erro", description: error.message, variant: "destructive" }); return; }
    toast({ title: `Status alterado para ${next.toUpperCase()}!` });
    load();
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    const { error } = await supabase.from("financeiro").delete().eq("id", id);
    setDeletingId(null);
    if (error) { toast({ title: "Erro ao excluir", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Lançamento excluído!" });
    load();
  };

  const handleExport = async (f: any, type: "pdf" | "word" | "csv") => {
    const data = { descricao: f.descricao, valor: Number(f.valor), vencimento: f.vencimento || "", data_emissao: f.data || "", status: f.status, clienteNome: f.clientes?.nome };
    try {
      if (type === "pdf") exportFaturaPDF(data);
      else if (type === "word") await exportFaturaWord(data);
      else exportFaturaCSV(data);
      toast({ title: `Exportado em ${type.toUpperCase()}!` });
    } catch { toast({ title: "Erro ao exportar", variant: "destructive" }); }
  };

  const handleAsaas = async (f: any) => {
    if (!f.cliente_id) {
      toast({ title: "Selecione um cliente primeiro", variant: "destructive" });
      return;
    }
    
    setSaving(true);
    try {
      // 1. Buscar detalhes completo do cliente
      const { data: cliente } = await supabase.from("clientes").select("*").eq("id", f.cliente_id).single();
      if (!cliente) throw new Error("Cliente não encontrado.");

      // 2. Garantir cliente no Asaas
      const asaasCustomer = await AsaasService.getOrCreateCustomer({
        name: cliente.nome,
        email: cliente.email,
        cpfCnpj: cliente.documento || undefined,
        mobilePhone: cliente.telefone || undefined,
        externalReference: cliente.id
      });

      // 3. Gerar Cobrança
      const payment = await AsaasService.createPayment({
        customer: asaasCustomer.id,
        billingType: "UNDEFINED", // Deixa o cliente escolher (Boleto, Pix, Cartão)
        value: Number(f.valor),
        dueDate: f.vencimento || new Date().toISOString().split('T')[0],
        description: f.descricao,
        externalReference: f.id
      });

      // 4. Salvar ID no registro (como nota na descrição já que não podemos mudar o banco)
      const novaDescricao = `${f.descricao} (Asaas: ${payment.invoiceUrl})`;
      await supabase.from("financeiro").update({ descricao: novaDescricao }).eq("id", f.id);
      
      toast({ title: "Fatura Asaas Gerada!", description: "O link de pagamento foi vinculado à descrição." });
      load();
    } catch (err: any) {
      toast({ title: "Erro no Asaas", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const filtrados = financeiro.filter(f => {
    const matchStatus = filtro === "todos" || f.status === filtro;
    const matchInicio = !dataInicio || (f.vencimento && f.vencimento >= dataInicio);
    const matchFim = !dataFim || (f.vencimento && f.vencimento <= dataFim);
    return matchStatus && matchInicio && matchFim;
  });

  const totalRecebido = filtrados.filter(f => f.tipo === "entrada" && f.status === "pago").reduce((s, f) => s + Number(f.valor), 0);
  const totalPendente = filtrados.filter(f => f.status === "pendente").reduce((s, f) => s + Number(f.valor), 0);
  const totalAtraso = filtrados.filter(f => f.status === "em_atraso").reduce((s, f) => s + Number(f.valor), 0);

  return (
    <motion.div className="space-y-6" initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.08 } } }}>
      <motion.div className="grid grid-cols-1 sm:grid-cols-3 gap-4" variants={fadeUp}>
        <Card className="glass-card border-[0.5px]">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-emerald-500/10"><TrendingUp className="w-5 h-5 text-emerald-400" /></div>
            <div>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">Total Recebido</p>
              <p className="text-xl font-bold text-white">R$ {totalRecebido.toLocaleString("pt-BR")}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card border-[0.5px]">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-amber-500/10"><DollarSign className="w-5 h-5 text-amber-400" /></div>
            <div>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">Total Pendente</p>
              <p className="text-xl font-bold text-white">R$ {totalPendente.toLocaleString("pt-BR")}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card border-[0.5px]">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-red-500/10"><AlertTriangle className="w-5 h-5 text-red-400" /></div>
            <div>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">Em Atraso</p>
              <p className="text-xl font-bold text-white">R$ {totalAtraso.toLocaleString("pt-BR")}</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={fadeUp}>
        <Card className="glass-card border-[0.5px]">
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <CardTitle className="text-sm font-semibold text-white">Lançamentos</CardTitle>
              <div className="flex gap-2 flex-wrap items-center">
                <div className="flex items-center gap-2 bg-white/5 p-1 rounded-lg border border-white/10 mr-2">
                  <div className="flex items-center gap-1.5 px-1">
                    <span className="text-[10px] text-[hsl(var(--muted-foreground))] uppercase font-bold">Início:</span>
                    <Input type="date" value={dataInicio} onChange={e => setDataInicio(e.target.value)}
                      className="h-7 w-[120px] bg-transparent border-0 text-[11px] text-white p-0 focus-visible:ring-0" />
                  </div>
                  <div className="w-[1px] h-3 bg-white/10" />
                  <div className="flex items-center gap-1.5 px-1">
                    <span className="text-[10px] text-[hsl(var(--muted-foreground))] uppercase font-bold">Fim:</span>
                    <Input type="date" value={dataFim} onChange={e => setDataFim(e.target.value)}
                      className="h-7 w-[120px] bg-transparent border-0 text-[11px] text-white p-0 focus-visible:ring-0" />
                  </div>
                  {(dataInicio || dataFim) && (
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-[hsl(var(--muted-foreground))] hover:text-white"
                      onClick={() => { setDataInicio(""); setDataFim(""); }}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  )}
                </div>
                {["todos", "pago", "pendente", "em_atraso"].map((s) => (
                  <Button key={s} size="sm"
                    className={filtro === s ? "gradient-primary border-0 text-white text-xs" : "glass-input border-0 text-[hsl(var(--muted-foreground))] hover:text-white text-xs"}
                    onClick={() => setFiltro(s)}>
                    {s === "todos" ? "Todos" : s === "em_atraso" ? "Atrasado" : s.charAt(0).toUpperCase() + s.slice(1)}
                  </Button>
                ))}
                <Button className="gradient-primary border-0 text-white text-xs" size="sm" onClick={openNew}>
                  <Plus className="w-3 h-3 mr-1" /> Novo lançamento
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table className="min-w-[700px]">
              <TableHeader>
                <TableRow className="border-[rgba(255,255,255,0.06)]">
                  {["Descrição", "Tipo", "Valor", "Vencimento", "Cliente", "Status", "Ações"].map((h) => (
                    <TableHead key={h} className="text-[11px] text-[hsl(var(--muted-foreground))]">{h}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtrados.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="text-center text-sm text-[hsl(var(--muted-foreground))] py-8">Nenhum lançamento</TableCell></TableRow>
                ) : filtrados.map((f) => (
                  <TableRow key={f.id} className="border-[rgba(255,255,255,0.04)]">
                    <TableCell className="text-sm text-white">{f.descricao}</TableCell>
                    <TableCell>
                      <span className={`text-sm font-medium ${f.tipo === "entrada" ? "text-emerald-400" : "text-red-400"}`}>
                        {f.tipo === "entrada" ? "↑ Entrada" : "↓ Saída"}
                      </span>
                    </TableCell>
                    <TableCell className={`text-sm font-medium ${f.tipo === "entrada" ? "text-emerald-400" : "text-red-400"}`}>
                      {f.tipo === "saida" ? "- " : ""}R$ {Number(f.valor).toLocaleString("pt-BR")}
                    </TableCell>
                    <TableCell className="text-sm text-[hsl(var(--muted-foreground))]">{f.vencimento ? new Date(f.vencimento).toLocaleDateString("pt-BR") : "—"}</TableCell>
                    <TableCell className="text-sm text-[hsl(var(--muted-foreground))]">{f.clientes?.nome || "—"}</TableCell>
                    <TableCell><StatusBadge status={f.status} /></TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className={cn(
                            "h-7 px-3 text-[10px] uppercase font-bold transition-all gap-1.5 rounded-lg border-0",
                            f.status === "pago" 
                              ? "bg-emerald-500/20 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]" 
                              : "bg-white/5 text-white/40 hover:bg-emerald-500/20 hover:text-emerald-400"
                          )}
                          onClick={() => toggleStatus(f.id, f.status)}
                        >
                          {f.status === "pago" ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Pago
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3.5 h-3.5" />
                              Pagar
                            </>
                          )}
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="sm" variant="ghost" className="text-white/50 text-xs h-7 px-2">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-[#1a1a2e] border-white/10 text-white">
                            <DropdownMenuItem onClick={() => openEdit(f)} className="text-xs gap-2 cursor-pointer">
                              <Pencil className="w-3 h-3 text-blue-400" /> Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toggleStatus(f.id, f.status)} className="text-xs gap-2 cursor-pointer">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Alternar Status
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-white/5" />
                            <DropdownMenuItem onClick={() => handleExport(f, "pdf")} className="text-xs gap-2 cursor-pointer">
                              <FileText className="w-3 h-3 text-red-400" /> PDF
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleExport(f, "word")} className="text-xs gap-2 cursor-pointer">
                              <FileSpreadsheet className="w-3 h-3 text-blue-400" /> Word
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleExport(f, "csv")} className="text-xs gap-2 cursor-pointer">
                              <FileDown className="w-3 h-3 text-green-400" /> CSV
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-white/5" />
                            {f.descricao.includes("Asaas:") ? (
                              <DropdownMenuItem 
                                onClick={() => window.open(f.descricao.split("Asaas: ")[1].replace(")", ""), "_blank")} 
                                className="text-xs gap-2 cursor-pointer text-emerald-400"
                              >
                                <DollarSign className="w-3 h-3" /> Ver Fatura Asaas
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onClick={() => handleAsaas(f)} className="text-xs gap-2 cursor-pointer">
                                <DollarSign className="w-3 h-3 text-amber-400" /> Gerar no Asaas
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator className="bg-white/5" />
                            <DropdownMenuItem
                              onClick={() => { if (confirm("Excluir este lançamento?")) handleDelete(f.id); }}
                              className="text-xs gap-2 cursor-pointer text-red-400 focus:text-red-400"
                              disabled={deletingId === f.id}
                            >
                              <Trash2 className="w-3 h-3" /> {deletingId === f.id ? "Excluindo..." : "Excluir"}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>

      <Dialog open={showForm} onOpenChange={(o) => { setShowForm(o); if (!o) { setEditingId(null); setForm(emptyForm); } }}>
        <DialogContent className="glass-card border-[0.5px] text-white max-w-md">
          <DialogHeader><DialogTitle className="text-white">{editingId ? "Editar Lançamento" : "Novo Lançamento"}</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label className="text-xs text-[hsl(var(--muted-foreground))]">Descrição *</Label>
              <Input className="glass-input border-[rgba(255,255,255,0.1)] text-white text-sm h-9" value={form.descricao} onChange={e => setForm({ ...form, descricao: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-[hsl(var(--muted-foreground))]">Tipo</Label>
                <Select value={form.tipo} onValueChange={v => setForm({ ...form, tipo: v })}>
                  <SelectTrigger className="glass-input border-0 text-white"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entrada">Entrada</SelectItem>
                    <SelectItem value="saida">Saída</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-[hsl(var(--muted-foreground))]">Valor (R$) *</Label>
                <Input type="number" className="glass-input border-[rgba(255,255,255,0.1)] text-white text-sm h-9" value={form.valor} onChange={e => setForm({ ...form, valor: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-[hsl(var(--muted-foreground))]">Vencimento</Label>
                <Input type="date" className="glass-input border-[rgba(255,255,255,0.1)] text-white text-sm h-9" value={form.vencimento} onChange={e => setForm({ ...form, vencimento: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-[hsl(var(--muted-foreground))]">Status</Label>
                <Select value={form.status} onValueChange={v => setForm({ ...form, status: v })}>
                  <SelectTrigger className="glass-input border-0 text-white"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pendente">Pendente</SelectItem>
                    <SelectItem value="pago">Pago</SelectItem>
                    <SelectItem value="em_atraso">Em atraso</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-[hsl(var(--muted-foreground))]">Cliente</Label>
              <Select value={form.cliente_id} onValueChange={v => setForm({ ...form, cliente_id: v })}>
                <SelectTrigger className="glass-input border-0 text-white"><SelectValue placeholder="Selecione (opcional)" /></SelectTrigger>
                <SelectContent>
                  {clientes.map(c => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Button className="gradient-primary border-0 text-white w-full rounded-lg" onClick={handleSave} disabled={saving}>
              {saving ? "Salvando..." : editingId ? "Salvar Alterações" : "Salvar Lançamento"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}



