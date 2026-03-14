import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download, Plus, Eye, Pencil } from "lucide-react";
import StatusBadge from "@/components/StatusBadge";
import { supabase } from "@/integrations/supabase/client";

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

export default function Pedidos() {
  const [filtro, setFiltro] = useState("todos");
  const [pedidos, setPedidos] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from("pedidos").select("*, clientes(nome)").order("created_at", { ascending: false });
      setPedidos(data || []);
    };
    load();
  }, []);

  const filtrados = filtro === "todos" ? pedidos : pedidos.filter(p => p.status === filtro);

  return (
    <motion.div className="space-y-6" initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.08 } } }}>
      <motion.div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4" variants={fadeUp}>
        <div className="flex gap-2 flex-wrap">
          {[{ key: "todos", label: "Todos" }, { key: "pendente", label: "Pendente" }, { key: "em_revisao", label: "Em revisão" }, { key: "entregue", label: "Entregue" }, { key: "cancelado", label: "Cancelado" }].map((s) => (
            <Button key={s.key} size="sm"
              className={filtro === s.key ? "gradient-primary border-0 text-white" : "glass-input border-0 text-[hsl(var(--muted-foreground))] hover:text-white"}
              onClick={() => setFiltro(s.key)}>{s.label}</Button>
          ))}
        </div>
        <Button className="gradient-primary border-0 text-white rounded-lg" size="sm"><Plus className="w-4 h-4 mr-2" /> Novo Pedido</Button>
      </motion.div>

      <motion.div variants={fadeUp}>
        <Card className="glass-card border-[0.5px]">
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow className="border-[rgba(255,255,255,0.06)]">
                  {["Nº Pedido", "Cliente", "Tipo", "Valor", "Data", "Status"].map((h) => (
                    <TableHead key={h} className="text-[11px] text-[hsl(var(--muted-foreground))]">{h}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtrados.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center text-sm text-[hsl(var(--muted-foreground))] py-8">Nenhum pedido</TableCell></TableRow>
                ) : filtrados.map((p) => (
                  <TableRow key={p.id} className="border-[rgba(255,255,255,0.04)]">
                    <TableCell className="text-sm font-mono font-medium gradient-text">{p.codigo}</TableCell>
                    <TableCell className="text-sm text-white">{p.clientes?.nome || "—"}</TableCell>
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
      </motion.div>
    </motion.div>
  );
}
