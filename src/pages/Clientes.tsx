import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Plus, ArrowLeft, Package, Pause, XCircle, DollarSign, RefreshCw, Link as LinkIcon, Copy, UserPlus } from "lucide-react";
import StatusBadge from "@/components/StatusBadge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { sendPushToAdmins, sendPushToClient } from "@/lib/push-notifications";

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

const catColors: Record<string, string> = { fixo: "text-emerald-400", intermediario: "text-amber-400", mensal: "text-blue-400" };
const catLabels: Record<string, string> = { fixo: "Fixo", intermediario: "Intermediário", mensal: "Mensal" };
function ClienteDetalhes({ clienteId, onBack }: { clienteId: string; onBack: () => void }) {
  const { toast } = useToast();
  const [cliente, setCliente] = useState<any>(null);
  const [extras, setExtras] = useState<any[]>([]);
  const [projetos, setProjetos] = useState<any[]>([]);
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [catalogo, setCatalogo] = useState<any[]>([]);
  const [showAddExtra, setShowAddExtra] = useState(false);
  const [extraSelecionado, setExtraSelecionado] = useState("");
  const [observacao, setObservacao] = useState("");
  const [savingExtra, setSavingExtra] = useState(false);

  const loadData = async () => {
    const [c, e, p, ped, cat] = await Promise.all([
      supabase.from("clientes").select("*").eq("id", clienteId).single(),
      supabase.from("extras_clientes").select("*, extras_catalogo(nome, descricao)").eq("cliente_id", clienteId),
      supabase.from("projetos").select("*").eq("cliente_id", clienteId),
      supabase.from("pedidos").select("*").eq("cliente_id", clienteId),
      supabase.from("extras_catalogo").select("*").eq("status", "ativo"),
    ]);
    setCliente(c.data);
    setExtras(e.data || []);
    setProjetos(p.data || []);
    setPedidos(ped.data || []);
    setCatalogo(cat.data || []);
  };

  useEffect(() => { loadData(); }, [clienteId]);

  const handleAddExtra = async () => {
    if (!extraSelecionado) return;
    const extra = catalogo.find(c => c.id === extraSelecionado);
    if (!extra) return;
    setSavingExtra(true);
    const { error } = await supabase.from("extras_clientes").insert({
      cliente_id: clienteId,
      extra_id: extra.id,
      categoria: extra.categoria,
      preco_ativacao: Number(extra.preco_ativacao) || 0,
      preco_mensal: Number(extra.preco_mensal) || 0,
      observacao: observacao || null,
    });
    setSavingExtra(false);
    if (error) { toast({ title: "Erro", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Extra adicionado!", description: `"${extra.nome}" foi vinculado ao cliente.` });
    setShowAddExtra(false);
    setExtraSelecionado("");
    setObservacao("");
    loadData();
  };

  if (!cliente) return <p className="text-white">Carregando...</p>;

  const avatar = cliente.avatar || cliente.nome?.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();
  const totalMensal = extras.filter((e: any) => e.status === "ativo" && e.preco_mensal > 0).reduce((s: number, e: any) => s + Number(e.preco_mensal), 0);
  const totalAtivacoes = extras.filter((e: any) => e.preco_ativacao > 0).reduce((s: number, e: any) => s + Number(e.preco_ativacao), 0);
  // Filter catalog to exclude already-added extras
  const extrasDisponiveis = catalogo.filter(c => !extras.some(e => e.extra_id === c.id && e.status === "ativo"));

  return (
    <motion.div className="space-y-6" initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.08 } } }}>
      <motion.div variants={fadeUp}>
        <Button variant="ghost" className="text-[hsl(var(--muted-foreground))] hover:text-white mb-3" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Voltar para Clientes
        </Button>
        <Card className="glass-card border-[0.5px]">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full gradient-primary flex items-center justify-center">
                <span className="text-white text-lg font-bold">{avatar}</span>
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-white">{cliente.nome}</h2>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">{cliente.email} · {cliente.telefone}</p>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">{cliente.cidade}, {cliente.estado} · {cliente.documento}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs border-[rgba(255,255,255,0.1)] text-[hsl(var(--muted-foreground))] hover:text-white"
                  onClick={() => {
                    const link = `${window.location.origin}/cliente`;
                    navigator.clipboard.writeText(link);
                    toast({ title: "Link copiado!", description: "Compartilhe o link do portal com o cliente." });
                  }}
                >
                  <LinkIcon className="w-3 h-3 mr-1" /> Link do Portal
                </Button>
                <StatusBadge status={cliente.status} />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={fadeUp}>
        <Tabs defaultValue="extras" className="space-y-4">
          <TabsList className="glass-card border-[0.5px] bg-transparent p-1 gap-1">
            <TabsTrigger value="extras" className="data-[state=active]:gradient-primary data-[state=active]:text-white text-[hsl(var(--muted-foreground))] text-xs gap-1.5">
              <Package className="w-3.5 h-3.5" /> Extras ({extras.length})
            </TabsTrigger>
            <TabsTrigger value="projetos" className="data-[state=active]:gradient-primary data-[state=active]:text-white text-[hsl(var(--muted-foreground))] text-xs">Projetos</TabsTrigger>
            <TabsTrigger value="pedidos" className="data-[state=active]:gradient-primary data-[state=active]:text-white text-[hsl(var(--muted-foreground))] text-xs">Pedidos</TabsTrigger>
          </TabsList>

          <TabsContent value="extras" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Card className="glass-card border-[0.5px]">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-blue-500/10"><RefreshCw className="w-4 h-4 text-blue-400" /></div>
                  <div>
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">Total Mensal Recorrente</p>
                    <p className="text-lg font-bold text-blue-400">R$ {totalMensal.toFixed(2).replace(".", ",")}/mês</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="glass-card border-[0.5px]">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-500/10"><DollarSign className="w-4 h-4 text-emerald-400" /></div>
                  <div>
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">Total em Ativações</p>
                    <p className="text-lg font-bold text-emerald-400">R$ {totalAtivacoes.toFixed(2).replace(".", ",")}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-end">
              <Button className="gradient-primary border-0 text-white text-xs" onClick={() => setShowAddExtra(true)}>
                <Plus className="w-3 h-3 mr-1.5" /> Adicionar Extra
              </Button>
            </div>

            <Card className="glass-card border-[0.5px]">
              <CardContent className="pt-4">
                <Table>
                  <TableHeader>
                    <TableRow className="border-[rgba(255,255,255,0.06)]">
                      {["Extra", "Categoria", "Ativação", "Mensal", "Observação", "Status"].map(h => (
                        <TableHead key={h} className="text-[11px] text-[hsl(var(--muted-foreground))]">{h}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {extras.length === 0 ? (
                      <TableRow><TableCell colSpan={6} className="text-center text-sm text-[hsl(var(--muted-foreground))] py-8">Nenhum extra contratado</TableCell></TableRow>
                    ) : extras.map((e: any) => (
                      <TableRow key={e.id} className="border-[rgba(255,255,255,0.04)]">
                        <TableCell>
                          <div>
                            <p className="text-sm text-white font-medium">{e.extras_catalogo?.nome || "—"}</p>
                            {e.extras_catalogo?.descricao && <p className="text-[10px] text-[hsl(var(--muted-foreground))] line-clamp-1">{e.extras_catalogo.descricao}</p>}
                          </div>
                        </TableCell>
                        <TableCell className={`text-xs font-medium ${catColors[e.categoria] || ""}`}>{catLabels[e.categoria] || e.categoria}</TableCell>
                        <TableCell className="text-sm text-white">{Number(e.preco_ativacao) > 0 ? `R$ ${Number(e.preco_ativacao).toFixed(2).replace(".", ",")}` : "—"}</TableCell>
                        <TableCell className="text-sm text-white">{Number(e.preco_mensal) > 0 ? `R$ ${Number(e.preco_mensal).toFixed(2).replace(".", ",")}/mês` : "—"}</TableCell>
                        <TableCell className="text-xs text-[hsl(var(--muted-foreground))] max-w-[150px] truncate">{e.observacao || "—"}</TableCell>
                        <TableCell><StatusBadge status={e.status} /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="projetos">
            <Card className="glass-card border-[0.5px]">
              <CardContent className="pt-4">
                <Table>
                  <TableHeader>
                    <TableRow className="border-[rgba(255,255,255,0.06)]">
                      {["Título", "Responsável", "Prazo", "Valor", "Status"].map(h => (
                        <TableHead key={h} className="text-[11px] text-[hsl(var(--muted-foreground))]">{h}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {projetos.length === 0 ? (
                      <TableRow><TableCell colSpan={5} className="text-center text-sm text-[hsl(var(--muted-foreground))] py-8">Nenhum projeto</TableCell></TableRow>
                    ) : projetos.map((p: any) => (
                      <TableRow key={p.id} className="border-[rgba(255,255,255,0.04)]">
                        <TableCell className="text-sm text-white font-medium">{p.titulo}</TableCell>
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
          </TabsContent>

          <TabsContent value="pedidos">
            <Card className="glass-card border-[0.5px]">
              <CardContent className="pt-4">
                <Table>
                  <TableHeader>
                    <TableRow className="border-[rgba(255,255,255,0.06)]">
                      {["Nº", "Tipo", "Valor", "Data", "Status"].map(h => (
                        <TableHead key={h} className="text-[11px] text-[hsl(var(--muted-foreground))]">{h}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pedidos.length === 0 ? (
                      <TableRow><TableCell colSpan={5} className="text-center text-sm text-[hsl(var(--muted-foreground))] py-8">Nenhum pedido</TableCell></TableRow>
                    ) : pedidos.map((p: any) => (
                      <TableRow key={p.id} className="border-[rgba(255,255,255,0.04)]">
                        <TableCell className="text-sm font-mono gradient-text">{p.codigo}</TableCell>
                        <TableCell className="text-sm text-[hsl(var(--muted-foreground))]">{p.tipo}</TableCell>
                        <TableCell className="text-sm text-white">R$ {Number(p.valor).toLocaleString("pt-BR")}</TableCell>
                        <TableCell className="text-sm text-[hsl(var(--muted-foreground))]">{p.data ? new Date(p.data).toLocaleDateString("pt-BR") : "—"}</TableCell>
                        <TableCell><StatusBadge status={p.status} /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Dialog Adicionar Extra */}
      <Dialog open={showAddExtra} onOpenChange={setShowAddExtra}>
        <DialogContent className="glass-card border-[0.5px] text-white max-w-md">
          <DialogHeader><DialogTitle className="text-white">Adicionar Extra ao Cliente</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label className="text-xs text-[hsl(var(--muted-foreground))]">Selecionar Extra</Label>
              <select
                className="w-full h-9 rounded-lg glass-input border border-[rgba(255,255,255,0.1)] text-white text-sm px-3 bg-transparent"
                value={extraSelecionado}
                onChange={(e) => setExtraSelecionado(e.target.value)}
              >
                <option value="">Escolha um extra...</option>
                {extrasDisponiveis.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome} — {catLabels[c.categoria] || c.categoria} {Number(c.preco_mensal) > 0 ? `(R$ ${Number(c.preco_mensal).toFixed(2).replace(".", ",")}/mês)` : ""} {Number(c.preco_ativacao) > 0 ? `(Ativ: R$ ${Number(c.preco_ativacao).toFixed(2).replace(".", ",")})` : ""}
                  </option>
                ))}
              </select>
            </div>

            {extraSelecionado && (() => {
              const sel = catalogo.find(c => c.id === extraSelecionado);
              if (!sel) return null;
              return (
                <div className="p-3 rounded-xl bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.06)]">
                  <p className="text-sm font-medium text-white">{sel.nome}</p>
                  {sel.descricao && <p className="text-[11px] text-[hsl(var(--muted-foreground))] mt-0.5">{sel.descricao}</p>}
                  <div className="flex gap-3 mt-2 text-xs text-[hsl(var(--muted-foreground))]">
                    <span className={catColors[sel.categoria]}>{catLabels[sel.categoria]}</span>
                    {Number(sel.preco_ativacao) > 0 && <span>Ativação: R$ {Number(sel.preco_ativacao).toFixed(2).replace(".", ",")}</span>}
                    {Number(sel.preco_mensal) > 0 && <span>Mensal: R$ {Number(sel.preco_mensal).toFixed(2).replace(".", ",")}</span>}
                  </div>
                </div>
              );
            })()}

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
              onClick={handleAddExtra}
              disabled={!extraSelecionado || savingExtra}
            >
              {savingExtra ? "Salvando..." : "Confirmar"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

export default function Clientes() {
  const { toast } = useToast();
  const [clientes, setClientes] = useState<any[]>([]);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [selectedCliente, setSelectedCliente] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [criarConta, setCriarConta] = useState(true);
  const [senhaCliente, setSenhaCliente] = useState("");
  const [contaCriada, setContaCriada] = useState<{ email: string; senha: string; link: string } | null>(null);
  const [form, setForm] = useState({ nome: "", email: "", telefone: "", documento: "", endereco: "", cidade: "", estado: "", status: "ativo" });
  const [saving, setSaving] = useState(false);

  const fetchClientes = async () => {
    const { data } = await supabase.from("clientes").select("*").order("created_at", { ascending: false });
    if (data) setClientes(data);
  };

  useEffect(() => { fetchClientes(); }, []);

  if (selectedCliente) {
    return <ClienteDetalhes clienteId={selectedCliente} onBack={() => setSelectedCliente(null)} />;
  }

  const filtrados = clientes.filter((c) => {
    const matchBusca = c.nome.toLowerCase().includes(busca.toLowerCase()) || c.email.toLowerCase().includes(busca.toLowerCase());
    const matchStatus = filtroStatus === "todos" || c.status === filtroStatus;
    return matchBusca && matchStatus;
  });

  const handleSave = async () => {
    if (!form.nome || !form.email) {
      toast({ title: "Preencha nome e e-mail", variant: "destructive" });
      return;
    }
    setSaving(true);
    const avatar = form.nome.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
    const { error } = await supabase.from("clientes").insert({ ...form, avatar });
    if (error) { toast({ title: "Erro", description: error.message, variant: "destructive" }); setSaving(false); return; }

    // Create auth account for client portal
    if (criarConta && senhaCliente.length >= 6) {
      const { error: accountError } = await supabase.functions.invoke("create-account", {
        body: { email: form.email, password: senhaCliente, nome: form.nome, tipo: "cliente" },
      });
      if (accountError) {
        toast({ title: "Cliente criado, mas erro na conta", description: "Crie a conta manualmente depois.", variant: "destructive" });
      } else {
        const link = `${window.location.origin}/cliente`;
        setContaCriada({ email: form.email, senha: senhaCliente, link });
      }
    }

    toast({ title: "Cliente criado!" });
    sendPushToAdmins("👤 Novo Cliente", `${form.nome} foi cadastrado no sistema.`, "/admin/clientes");
    setShowNew(false);
    setForm({ nome: "", email: "", telefone: "", documento: "", endereco: "", cidade: "", estado: "", status: "ativo" });
    setSenhaCliente("");
    setCriarConta(true);
    setSaving(false);
    fetchClientes();
  };

  return (
    <motion.div className="space-y-6" initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.08 } } }}>
      <motion.div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4" variants={fadeUp}>
        <div />
        <Dialog open={showNew} onOpenChange={setShowNew}>
          <DialogTrigger asChild>
            <Button className="gradient-primary border-0 text-white rounded-lg"><Plus className="w-4 h-4 mr-2" /> Novo Cliente</Button>
          </DialogTrigger>
          <DialogContent className="glass-card border-[0.5px] text-white max-w-lg">
            <DialogHeader><DialogTitle className="text-white">Novo Cliente</DialogTitle></DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {[
                { key: "nome", label: "Nome completo" }, { key: "email", label: "E-mail" },
                { key: "telefone", label: "Telefone" }, { key: "documento", label: "CPF/CNPJ" },
                { key: "endereco", label: "Endereço" }, { key: "cidade", label: "Cidade" },
                { key: "estado", label: "Estado" },
              ].map((f) => (
                <div key={f.key} className="space-y-1.5">
                  <Label className="text-xs text-[hsl(var(--muted-foreground))]">{f.label}</Label>
                  <Input className="glass-input border-[rgba(255,255,255,0.1)] text-white text-sm h-9"
                    value={(form as any)[f.key]} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} />
                </div>
              ))}
            </div>

            <div className="mt-4 p-3 rounded-xl bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.06)] space-y-3">
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={criarConta} onChange={e => setCriarConta(e.target.checked)} className="rounded" />
                <Label className="text-xs text-white cursor-pointer">Criar conta de acesso ao Portal do Cliente</Label>
              </div>
              {criarConta && (
                <div className="space-y-1.5">
                  <Label className="text-xs text-[hsl(var(--muted-foreground))]">Senha de acesso (mín. 6 caracteres)</Label>
                  <Input type="text" className="glass-input border-[rgba(255,255,255,0.1)] text-white text-sm h-9"
                    value={senhaCliente} onChange={e => setSenhaCliente(e.target.value)} placeholder="Defina a senha do cliente" />
                </div>
              )}
            </div>

            <Button className="gradient-primary border-0 text-white w-full mt-4 rounded-lg" onClick={handleSave} disabled={saving}>
              {saving ? "Salvando..." : "Salvar Cliente"}
            </Button>
          </DialogContent>
        </Dialog>
      </motion.div>

      <motion.div variants={fadeUp}>
        <Card className="glass-card border-[0.5px]">
          <CardHeader>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--muted-foreground))]" />
                <Input placeholder="Buscar por nome ou e-mail..." className="pl-9 glass-input border-0 text-white text-sm" value={busca} onChange={(e) => setBusca(e.target.value)} />
              </div>
              <div className="flex gap-2">
                {["todos", "ativo", "inativo"].map((s) => (
                  <Button key={s} size="sm"
                    className={filtroStatus === s ? "gradient-primary border-0 text-white" : "glass-input border-0 text-[hsl(var(--muted-foreground))] hover:text-white"}
                    onClick={() => setFiltroStatus(s)}>
                    {s === "todos" ? "Todos" : s === "ativo" ? "Ativos" : "Inativos"}
                  </Button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-[rgba(255,255,255,0.06)]">
                  {["Cliente", "E-mail", "Telefone", "Cidade", "Status", "Ações"].map(h => (
                    <TableHead key={h} className="text-[11px] text-[hsl(var(--muted-foreground))]">{h}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtrados.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center text-sm text-[hsl(var(--muted-foreground))] py-8">Nenhum cliente encontrado</TableCell></TableRow>
                ) : filtrados.map((c) => {
                  const avatar = c.avatar || c.nome?.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();
                  return (
                    <TableRow key={c.id} className="border-[rgba(255,255,255,0.04)] cursor-pointer hover:bg-[rgba(255,255,255,0.02)]" onClick={() => setSelectedCliente(c.id)}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center shrink-0">
                            <span className="text-white text-[10px] font-bold">{avatar}</span>
                          </div>
                          <span className="text-sm font-medium text-white">{c.nome}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-[hsl(var(--muted-foreground))]">{c.email}</TableCell>
                      <TableCell className="text-sm text-[hsl(var(--muted-foreground))]">{c.telefone}</TableCell>
                      <TableCell className="text-sm text-[hsl(var(--muted-foreground))]">{c.cidade}, {c.estado}</TableCell>
                      <TableCell><StatusBadge status={c.status} /></TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" className="text-[hsl(var(--muted-foreground))] hover:text-white text-xs">Ver</Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>

      {/* Dialog Conta Criada */}
      <Dialog open={!!contaCriada} onOpenChange={() => setContaCriada(null)}>
        <DialogContent className="glass-card border-[0.5px] text-white max-w-md">
          <DialogHeader><DialogTitle className="text-white flex items-center gap-2"><UserPlus className="w-5 h-5" /> Conta criada com sucesso!</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <p className="text-xs text-[hsl(var(--muted-foreground))]">Compartilhe os dados abaixo com o cliente para que ele acesse o portal:</p>
            <div className="p-4 rounded-xl bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.06)] space-y-3">
              <div>
                <p className="text-[10px] text-[hsl(var(--muted-foreground))]">Link do Portal</p>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-white font-mono flex-1">{contaCriada?.link}</p>
                  <Button size="sm" variant="ghost" className="text-white/50 h-7" onClick={() => { navigator.clipboard.writeText(contaCriada?.link || ""); toast({ title: "Link copiado!" }); }}>
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              <div>
                <p className="text-[10px] text-[hsl(var(--muted-foreground))]">E-mail</p>
                <p className="text-sm text-white">{contaCriada?.email}</p>
              </div>
              <div>
                <p className="text-[10px] text-[hsl(var(--muted-foreground))]">Senha</p>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-white font-mono">{contaCriada?.senha}</p>
                  <Button size="sm" variant="ghost" className="text-white/50 h-7" onClick={() => { navigator.clipboard.writeText(contaCriada?.senha || ""); toast({ title: "Senha copiada!" }); }}>
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
            <Button className="gradient-primary border-0 text-white w-full" onClick={() => setContaCriada(null)}>Entendi</Button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
