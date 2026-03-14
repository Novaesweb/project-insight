import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, List, LayoutGrid, Calendar, User } from "lucide-react";
import { projetos } from "@/lib/mock-data";
import StatusBadge from "@/components/StatusBadge";

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

const kanbanColumns = [
  { key: "em_aberto", label: "Em aberto", color: "border-amber-500/50" },
  { key: "em_andamento", label: "Em andamento", color: "border-blue-500/50" },
  { key: "em_revisao", label: "Em revisão", color: "border-violet-500/50" },
  { key: "concluido", label: "Concluído", color: "border-emerald-500/50" },
  { key: "cancelado", label: "Cancelado", color: "border-red-500/50" },
];

export default function Projetos() {
  const [view, setView] = useState<"lista" | "kanban">("kanban");

  return (
    <motion.div className="space-y-6" initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.08 } } }}>
      <motion.div className="flex items-center justify-between gap-4" variants={fadeUp}>
        <div className="flex gap-1 p-1 rounded-lg glass-card border-[0.5px]">
          <Button variant="ghost" size="sm" className={view === "lista" ? "gradient-primary text-white border-0" : "text-[hsl(var(--muted-foreground))]"} onClick={() => setView("lista")}><List className="w-4 h-4" /></Button>
          <Button variant="ghost" size="sm" className={view === "kanban" ? "gradient-primary text-white border-0" : "text-[hsl(var(--muted-foreground))]"} onClick={() => setView("kanban")}><LayoutGrid className="w-4 h-4" /></Button>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="gradient-primary border-0 text-white rounded-lg"><Plus className="w-4 h-4 mr-2" /> Novo Projeto</Button>
          </DialogTrigger>
          <DialogContent className="glass-card border-[0.5px] text-white max-w-lg">
            <DialogHeader><DialogTitle className="text-white">Novo Projeto</DialogTitle></DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {["Título", "Descrição", "Cliente", "Responsável", "Data início", "Prazo", "Valor"].map((f) => (
                <div key={f} className={`space-y-1.5 ${f === "Descrição" ? "md:col-span-2" : ""}`}>
                  <Label className="text-xs text-[hsl(var(--muted-foreground))]">{f}</Label>
                  <Input className="glass-input border-[rgba(255,255,255,0.1)] text-white text-sm h-9" />
                </div>
              ))}
            </div>
            <Button className="gradient-primary border-0 text-white w-full mt-4 rounded-lg">Salvar Projeto</Button>
          </DialogContent>
        </Dialog>
      </motion.div>

      {view === "kanban" ? (
        <motion.div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4" variants={fadeUp}>
          {kanbanColumns.map((col) => (
            <div key={col.key} className="space-y-3">
              <div className={`flex items-center gap-2 px-1 border-l-2 ${col.color} pl-3`}>
                <span className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">{col.label}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full glass-card text-[hsl(var(--muted-foreground))]">
                  {projetos.filter(p => p.status === col.key).length}
                </span>
              </div>
              {projetos.filter(p => p.status === col.key).map((p) => (
                <Card key={p.id} className="glass-card border-[0.5px] hover:border-[rgba(255,255,255,0.15)] transition-all cursor-pointer">
                  <CardContent className="p-4 space-y-3">
                    <p className="font-semibold text-sm text-white">{p.titulo}</p>
                    <p className="text-[11px] text-[hsl(var(--muted-foreground))]">{p.descricao}</p>
                    <div className="flex items-center gap-2 text-[11px] text-[hsl(var(--muted-foreground))]">
                      <User className="w-3 h-3" /> {p.cliente}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-[11px] text-[hsl(var(--muted-foreground))]">
                        <Calendar className="w-3 h-3" /> {new Date(p.prazo).toLocaleDateString("pt-BR")}
                      </div>
                      <span className="text-xs font-semibold gradient-text">R$ {(p.valor / 1000).toFixed(0)}k</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {projetos.filter(p => p.status === col.key).length === 0 && (
                <div className="border border-dashed border-[rgba(255,255,255,0.08)] rounded-xl p-8 text-center text-[11px] text-[hsl(var(--muted-foreground))]">
                  Nenhum projeto
                </div>
              )}
            </div>
          ))}
        </motion.div>
      ) : (
        <motion.div variants={fadeUp}>
          <Card className="glass-card border-[0.5px]">
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow className="border-[rgba(255,255,255,0.06)]">
                    {["Título", "Cliente", "Responsável", "Prazo", "Valor", "Status"].map((h) => (
                      <TableHead key={h} className="text-[11px] text-[hsl(var(--muted-foreground))]">{h}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projetos.map((p) => (
                    <TableRow key={p.id} className="border-[rgba(255,255,255,0.04)]">
                      <TableCell className="text-sm font-medium text-white">{p.titulo}</TableCell>
                      <TableCell className="text-sm text-[hsl(var(--muted-foreground))]">{p.cliente}</TableCell>
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
        </motion.div>
      )}
    </motion.div>
  );
}
