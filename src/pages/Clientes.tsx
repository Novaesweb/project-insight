import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Search, Plus, Eye, Pencil, Trash2 } from "lucide-react";
import { clientes } from "@/lib/mock-data";
import StatusBadge from "@/components/StatusBadge";

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

export default function Clientes() {
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("todos");

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
                  <Button key={s} variant={filtroStatus === s ? "default" : "outline"} size="sm"
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
                  <TableHead className="text-[11px] text-[hsl(var(--muted-foreground))]">Cliente</TableHead>
                  <TableHead className="text-[11px] text-[hsl(var(--muted-foreground))]">E-mail</TableHead>
                  <TableHead className="text-[11px] text-[hsl(var(--muted-foreground))] hidden md:table-cell">Telefone</TableHead>
                  <TableHead className="text-[11px] text-[hsl(var(--muted-foreground))] hidden lg:table-cell">Cidade</TableHead>
                  <TableHead className="text-[11px] text-[hsl(var(--muted-foreground))]">Status</TableHead>
                  <TableHead className="text-[11px] text-[hsl(var(--muted-foreground))] hidden md:table-cell">Cadastro</TableHead>
                  <TableHead className="text-[11px] text-[hsl(var(--muted-foreground))]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtrados.map((c) => (
                  <TableRow key={c.id} className="border-[rgba(255,255,255,0.04)]">
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
                      <div className="flex gap-1">
                        <button className="p-1.5 rounded-lg hover:bg-[rgba(255,255,255,0.06)] text-[hsl(var(--muted-foreground))] hover:text-white transition-colors"><Eye className="w-4 h-4" /></button>
                        <button className="p-1.5 rounded-lg hover:bg-[rgba(255,255,255,0.06)] text-[hsl(var(--muted-foreground))] hover:text-white transition-colors"><Pencil className="w-4 h-4" /></button>
                        <button className="p-1.5 rounded-lg hover:bg-red-500/10 text-[hsl(var(--muted-foreground))] hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
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
