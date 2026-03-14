import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Plus, ArrowLeft, Package, Pause, XCircle, DollarSign, RefreshCw } from "lucide-react";
import StatusBadge from "@/components/StatusBadge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

const catColors: Record<string, string> = { fixo: "text-emerald-400", intermediario: "text-amber-400", mensal: "text-blue-400" };

function ClienteDetalhes({ clienteId, onBack }: { clienteId: string; onBack: () => void }) {
  const [cliente, setCliente] = useState<any>(null);
  const [extras, setExtras] = useState<any[]>([]);
  const [projetos, setProjetos] = useState<any[]>([]);
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [catalogo, setCatalogo] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const [c, e, p, ped, cat] = await Promise.all([
        supabase.from("clientes").select("*").eq("id", clienteId).single(),
        supabase.from("extras_clientes").select("*, extras_catalogo(nome)").eq("cliente_id", clienteId),
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
    load();
  }, [clienteId]);

  if (!cliente) return <p className="text-white">Carregando...</p>;

  const avatar = cliente.avatar || cliente.nome?.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();
  const totalMensal = extras.filter((e: any) => e.status === "ativo" && e.preco_mensal > 0).reduce((s: number, e: any) => s + Number(e.preco_mensal), 0);
  const totalAtivacoes = extras.filter((e: any) => e.preco_ativacao > 0).reduce((s: number, e: any) => s + Number(e.preco_ativacao), 0);

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
              <div>
                <h2 className="text-xl font-bold text-white">{cliente.nome}</h2>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">{cliente.email} · {cliente.telefone}</p>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">{cliente.cidade}, {cliente.estado} · {cliente.documento}</p>
              </div>
              <div className="ml-auto"><StatusBadge status={cliente.status} /></div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={fadeUp}>
        <Tabs defaultValue="extras" className="space-y-4">
          <TabsList className="glass-card border-[0.5px] bg-transparent p-1 gap-1">
            <TabsTrigger value="extras" className="data-[state=active]:gradient-primary data-[state=active]:text-white text-[hsl(var(--muted-foreground))] text-xs gap-1.5">
              <Package className="w-3.5 h-3.5" /> Extras
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
            <Card className="glass-card border-[0.5px]">
              <CardContent className="pt-4">
                <Table>
                  <TableHeader>
                    <TableRow className="border-[rgba(255,255,255,0.06)]">
                      {["Extra", "Categoria", "Ativação", "Mensal", "Status"].map(h => (
                        <TableHead key={h} className="text-[11px] text-[hsl(var(--muted-foreground))]">{h}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {extras.length === 0 ? (
                      <TableRow><TableCell colSpan={5} className="text-center text-sm text-[hsl(var(--muted-foreground))] py-8">Nenhum extra contratado</TableCell></TableRow>
                    ) : extras.map((e: any) => (
                      <TableRow key={e.id} className="border-[rgba(255,255,255,0.04)]">
                        <TableCell className="text-sm text-white font-medium">{e.extras_catalogo?.nome || "—"}</TableCell>
                        <TableCell className={`text-xs font-medium ${catColors[e.categoria] || ""}`}>{e.categoria}</TableCell>
                        <TableCell className="text-sm text-white">{Number(e.preco_ativacao) > 0 ? `R$ ${Number(e.preco_ativacao).toFixed(2).replace(".", ",")}` : "—"}</TableCell>
                        <TableCell className="text-sm text-white">{Number(e.preco_mensal) > 0 ? `R$ ${Number(e.preco_mensal).toFixed(2).replace(".", ",")}/mês` : "—"}</TableCell>
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
  const [form, setForm] = useState({ nome: "", email: "", telefone: "", documento: "", endereco: "", cidade: "", estado: "", status: "ativo" });

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
    const avatar = form.nome.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
    const { error } = await supabase.from("clientes").insert({ ...form, avatar });
    if (error) { toast({ title: "Erro", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Cliente criado!" });
    setShowNew(false);
    setForm({ nome: "", email: "", telefone: "", documento: "", endereco: "", cidade: "", estado: "", status: "ativo" });
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
            <Button className="gradient-primary border-0 text-white w-full mt-4 rounded-lg" onClick={handleSave}>Salvar Cliente</Button>
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
    </motion.div>
  );
}
