import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, Plus, Eye, Pencil } from "lucide-react";
import { pedidos } from "@/lib/mock-data";
import StatusBadge from "@/components/StatusBadge";

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

export default function Pedidos() {
  const [filtro, setFiltro] = useState("todos");
  const filtrados = filtro === "todos" ? pedidos : pedidos.filter(p => p.status === filtro);

  return (
    <motion.div className="space-y-6" initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.08 } } }}>
      <motion.div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4" variants={fadeUp}>
        <div className="flex gap-2 flex-wrap">
          {[{ key: "todos", label: "Todos" }, { key: "pendente", label: "Pendente" }, { key: "em_revisao", label: "Em revisão" }, { key: "entregue", label: "Entregue" }, { key: "cancelado", label: "Cancelado" }].map((s) => (
            <Button key={s.key} size="sm"
              className={filtro === s.key ? "gradient-primary border-0 text-white" : "glass-input border-0 text-[hsl(var(--muted-foreground))] hover:text-white"}
              onClick={() => setFiltro(s.key)}>
              {s.label}
            </Button>
          ))}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="glass-input border-0 text-[hsl(var(--muted-foreground))] hover:text-white">
            <Download className="w-4 h-4 mr-1.5" /> Exportar
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="gradient-primary border-0 text-white rounded-lg" size="sm"><Plus className="w-4 h-4 mr-2" /> Novo Pedido</Button>
            </DialogTrigger>
            <DialogContent className="glass-card border-[0.5px] text-white max-w-lg">
              <DialogHeader><DialogTitle className="text-white">Novo Pedido</DialogTitle></DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {["Cliente", "Projeto", "Tipo de Serviço", "Valor"].map((f) => (
                  <div key={f} className="space-y-1.5">
                    <Label className="text-xs text-[hsl(var(--muted-foreground))]">{f}</Label>
                    <Input className="glass-input border-[rgba(255,255,255,0.1)] text-white text-sm h-9" />
                  </div>
                ))}
              </div>
              <Button className="gradient-primary border-0 text-white w-full mt-4 rounded-lg">Salvar Pedido</Button>
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>

      <motion.div variants={fadeUp}>
        <Card className="glass-card border-[0.5px]">
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow className="border-[rgba(255,255,255,0.06)]">
                  {["Nº Pedido", "Cliente", "Tipo", "Valor", "Data", "Status", "Ações"].map((h) => (
                    <TableHead key={h} className="text-[11px] text-[hsl(var(--muted-foreground))]">{h}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtrados.map((p) => (
                  <TableRow key={p.id} className="border-[rgba(255,255,255,0.04)]">
                    <TableCell className="text-sm font-mono font-medium gradient-text">{p.id}</TableCell>
                    <TableCell className="text-sm text-white">{p.cliente}</TableCell>
                    <TableCell className="text-sm text-[hsl(var(--muted-foreground))]">{p.tipo}</TableCell>
                    <TableCell className="text-sm text-white">R$ {p.valor.toLocaleString("pt-BR")}</TableCell>
                    <TableCell className="text-sm text-[hsl(var(--muted-foreground))]">{new Date(p.data).toLocaleDateString("pt-BR")}</TableCell>
                    <TableCell><StatusBadge status={p.status} /></TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <button className="p-1.5 rounded-lg hover:bg-[rgba(255,255,255,0.06)] text-[hsl(var(--muted-foreground))] hover:text-white"><Eye className="w-4 h-4" /></button>
                        <button className="p-1.5 rounded-lg hover:bg-[rgba(255,255,255,0.06)] text-[hsl(var(--muted-foreground))] hover:text-white"><Pencil className="w-4 h-4" /></button>
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
