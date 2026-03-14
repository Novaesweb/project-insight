import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Plus, Eye, Pencil, Trash2, ArrowLeft, Package, Pause, XCircle, DollarSign, RefreshCw } from "lucide-react";
import { clientes, extrasClientes, extrasCatalogo, projetos, pedidos } from "@/lib/mock-data";
import StatusBadge from "@/components/StatusBadge";

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

const catColors: Record<string, string> = {
  fixo: "text-emerald-400",
  intermediario: "text-amber-400",
  mensal: "text-blue-400",
};

function ClienteDetalhes({ clienteId, onBack }: { clienteId: string; onBack: () => void }) {
  const cliente = clientes.find(c => c.id === clienteId)!;
  const clienteExtras = extrasClientes.filter(e => e.clienteId === clienteId);
  const clienteProjetos = projetos.filter(p => p.clienteId === clienteId);
  const clientePedidos = pedidos.filter(p => p.clienteId === clienteId);

  const totalMensal = clienteExtras.filter(e => e.status === "ativo" && e.precoMensal > 0).reduce((s, e) => s + e.precoMensal, 0);
  const totalAtivacoes = clienteExtras.filter(e => e.precoAtivacao > 0).reduce((s, e) => s + e.precoAtivacao, 0);
  const extrasAtivos = extrasCatalogo.filter(e => e.status === "ativo");

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
                <span className="text-white text-lg font-bold">{cliente.avatar}</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{cliente.nome}</h2>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">{cliente.email} · {cliente.telefone}</p>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">{cliente.cidade}, {cliente.estado} · {cliente.documento}</p>
              </div>
              <div className="ml-auto">
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
              <Package className="w-3.5 h-3.5" /> Extras contratados
            </TabsTrigger>
            <TabsTrigger value="projetos" className="data-[state=active]:gradient-primary data-[state=active]:text-white text-[hsl(var(--muted-foreground))] text-xs">
              Projetos
            </TabsTrigger>
            <TabsTrigger value="pedidos" className="data-[state=active]:gradient-primary data-[state=active]:text-white text-[hsl(var(--muted-foreground))] text-xs">
              Pedidos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="extras" className="space-y-4">
            {/* Summary */}
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

            {/* Add extra button */}
            <div className="flex justify-end">
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="gradient-primary border-0 text-white rounded-lg" size="sm">
                    <Plus className="w-4 h-4 mr-2" /> Adicionar extra ao cliente
                  </Button>
                </DialogTrigger>
                <DialogContent className="glass-card border-[0.5px] text-white max-w-md">
                  <DialogHeader><DialogTitle className="text-white">Adicionar Extra</DialogTitle></DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs text-[hsl(var(--muted-foreground))]">Selecionar extra</Label>
                      <select className="w-full h-9 rounded-lg glass-input border border-[rgba(255,255,255,0.1)] text-white text-sm px-3 bg-transparent">
                        {extrasAtivos.map(e => (
                          <option key={e.id} value={e.id}>{e.nome} — R$ {e.precoAtivacao.toFixed(2)} {e.precoMensal > 0 ? `+ R$ ${e.precoMensal}/mês` : ""}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-[hsl(var(--muted-foreground))]">Data de ativação</Label>
                      <Input type="date" className="glass-input border-[rgba(255,255,255,0.1)] text-white text-sm h-9" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-[hsl(var(--muted-foreground))]">Observação (opcional)</Label>
                      <Input className="glass-input border-[rgba(255,255,255,0.1)] text-white text-sm h-9" />
                    </div>
                  </div>
                  <Button className="gradient-primary border-0 text-white w-full mt-4 rounded-lg">Confirmar</Button>
                </DialogContent>
              </Dialog>
            </div>

            {/* Extras table */}
            <Card className="glass-card border-[0.5px]">
              <CardContent className="pt-4">
                <Table>
                  <TableHeader>
                    <TableRow className="border-[rgba(255,255,255,0.06)]">
                      {["Extra", "Categoria", "Ativação", "Mensal", "Data", "Status", "Ação"].map(h => (
                        <TableHead key={h} className="text-[11px] text-[hsl(var(--muted-foreground))]">{h}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clienteExtras.map(e => (
                      <TableRow key={e.id} className="border-[rgba(255,255,255,0.04)]">
                        <TableCell className="text-sm text-white font-medium">{e.extraNome}</TableCell>
                        <TableCell className={`text-xs font-medium ${catColors[e.categoria]}`}>
                          {e.categoria === "fixo" ? "Fixo" : e.categoria === "intermediario" ? "Intermediário" : "Mensal"}
                        </TableCell>
                        <TableCell className="text-sm text-white">{e.precoAtivacao > 0 ? `R$ ${e.precoAtivacao.toFixed(2).replace(".", ",")}` : "—"}</TableCell>
                        <TableCell className="text-sm text-white">{e.precoMensal > 0 ? `R$ ${e.precoMensal.toFixed(2).replace(".", ",")}/mês` : "—"}</TableCell>
                        <TableCell className="text-sm text-[hsl(var(--muted-foreground))]">{new Date(e.dataAtivacao).toLocaleDateString("pt-BR")}</TableCell>
                        <TableCell><StatusBadge status={e.status} /></TableCell>
                        <TableCell>
                          {e.status === "ativo" && (
                            <div className="flex gap-1">
                              <button className="p-1 rounded hover:bg-amber-500/10 text-[hsl(var(--muted-foreground))] hover:text-amber-400" title="Pausar"><Pause className="w-3.5 h-3.5" /></button>
                              <button className="p-1 rounded hover:bg-red-500/10 text-[hsl(var(--muted-foreground))] hover:text-red-400" title="Cancelar"><XCircle className="w-3.5 h-3.5" /></button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                    {clienteExtras.length === 0 && (
                      <TableRow><TableCell colSpan={7} className="text-center text-sm text-[hsl(var(--muted-foreground))] py-8">Nenhum extra contratado</TableCell></TableRow>
                    )}
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
                    {clienteProjetos.map(p => (
                      <TableRow key={p.id} className="border-[rgba(255,255,255,0.04)]">
                        <TableCell className="text-sm text-white font-medium">{p.titulo}</TableCell>
                        <TableCell className="text-sm text-[hsl(var(--muted-foreground))]">{p.responsavel}</TableCell>
                        <TableCell className="text-sm text-[hsl(var(--muted-foreground))]">{new Date(p.prazo).toLocaleDateString("pt-BR")}</TableCell>
                        <TableCell className="text-sm text-white">R$ {p.valor.toLocaleString("pt-BR")}</TableCell>
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
                    {clientePedidos.map(p => (
                      <TableRow key={p.id} className="border-[rgba(255,255,255,0.04)]">
                        <TableCell className="text-sm font-mono gradient-text">{p.id}</TableCell>
                        <TableCell className="text-sm text-[hsl(var(--muted-foreground))]">{p.tipo}</TableCell>
                        <TableCell className="text-sm text-white">R$ {p.valor.toLocaleString("pt-BR")}</TableCell>
                        <TableCell className="text-sm text-[hsl(var(--muted-foreground))]">{new Date(p.data).toLocaleDateString("pt-BR")}</TableCell>
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
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [selectedCliente, setSelectedCliente] = useState<string | null>(null);

  if (selectedCliente) {
    return <ClienteDetalhes clienteId={selectedCliente} onBack={() => setSelectedCliente(null)} />;
  }

  const filtrados = clientes.filter((c) => {
    const matchBusca = c.nome.toLowerCase().includes(busca.toLowerCase()) || c.email.toLowerCase().includes(busca.toLowerCase());
    const matchStatus = filtroStatus === "todos" || c.status === filtroStatus;
    return matchBusca && matchStatus;
  });

  return (
    <motion.div className="space-y-6" initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.08 } } }}>
      <motion.div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4" variants={fadeUp}>
        <div />
        <Dialog>
          <DialogTrigger asChild>
            <Button className="gradient-primary border-0 text-white rounded-lg"><Plus className="w-4 h-4 mr-2" /> Novo Cliente</Button>
          </DialogTrigger>
          <DialogContent className="glass-card border-[0.5px] text-white max-w-lg">
            <DialogHeader><DialogTitle className="text-white">Novo Cliente</DialogTitle></DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {["Nome completo", "E-mail", "Telefone", "CPF/CNPJ", "Endereço", "Cidade", "Estado"].map((f) => (
                <div key={f} className="space-y-1.5">
                  <Label className="text-xs text-[hsl(var(--muted-foreground))]">{f}</Label>
                  <Input className="glass-input border-[rgba(255,255,255,0.1)] text-white text-sm h-9" />
                </div>
              ))}
              <div className="space-y-1.5">
                <Label className="text-xs text-[hsl(var(--muted-foreground))]">Status</Label>
                <select className="w-full h-9 rounded-lg glass-input border border-[rgba(255,255,255,0.1)] text-white text-sm px-3 bg-transparent">
                  <option value="ativo">Ativo</option>
                  <option value="inativo">Inativo</option>
                </select>
              </div>
            </div>
            <Button className="gradient-primary border-0 text-white w-full mt-4 rounded-lg">Salvar Cliente</Button>
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
                  {["Cliente", "E-mail", "Telefone", "Cidade", "Status", "Cadastro", "Ações"].map(h => (
                    <TableHead key={h} className={`text-[11px] text-[hsl(var(--muted-foreground))] ${["Telefone", "Cadastro"].includes(h) ? "hidden md:table-cell" : ""} ${h === "Cidade" ? "hidden lg:table-cell" : ""}`}>{h}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtrados.map((c) => (
                  <TableRow key={c.id} className="border-[rgba(255,255,255,0.04)] cursor-pointer hover:bg-[rgba(255,255,255,0.02)]" onClick={() => setSelectedCliente(c.id)}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center shrink-0">
                          <span className="text-white text-[10px] font-bold">{c.avatar}</span>
                        </div>
                        <span className="text-sm font-medium text-white">{c.nome}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-[hsl(var(--muted-foreground))]">{c.email}</TableCell>
                    <TableCell className="text-sm text-[hsl(var(--muted-foreground))] hidden md:table-cell">{c.telefone}</TableCell>
                    <TableCell className="text-sm text-[hsl(var(--muted-foreground))] hidden lg:table-cell">{c.cidade}</TableCell>
                    <TableCell><StatusBadge status={c.status} /></TableCell>
                    <TableCell className="text-sm text-[hsl(var(--muted-foreground))] hidden md:table-cell">{new Date(c.dataCadastro).toLocaleDateString("pt-BR")}</TableCell>
                    <TableCell>
                      <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                        <button className="p-1.5 rounded-lg hover:bg-[rgba(255,255,255,0.06)] text-[hsl(var(--muted-foreground))] hover:text-white" onClick={() => setSelectedCliente(c.id)}><Eye className="w-4 h-4" /></button>
                        <button className="p-1.5 rounded-lg hover:bg-[rgba(255,255,255,0.06)] text-[hsl(var(--muted-foreground))] hover:text-white"><Pencil className="w-4 h-4" /></button>
                        <button className="p-1.5 rounded-lg hover:bg-red-500/10 text-[hsl(var(--muted-foreground))] hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
