import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download, Plus } from "lucide-react";
import { pedidos } from "@/lib/mock-data";
import StatusBadge from "@/components/StatusBadge";

export default function Pedidos() {
  const [filtro, setFiltro] = useState("todos");

  const filtrados = filtro === "todos" ? pedidos : pedidos.filter(p => p.status === filtro);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pedidos</h1>
          <p className="text-muted-foreground mt-1">Controle de pedidos e solicitações</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline"><Download className="w-4 h-4 mr-2" /> Exportar</Button>
          <Button><Plus className="w-4 h-4 mr-2" /> Novo Pedido</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex gap-2 flex-wrap">
            {["todos", "pendente", "em_revisao", "entregue", "cancelado"].map((s) => (
              <Button key={s} variant={filtro === s ? "default" : "outline"} size="sm" onClick={() => setFiltro(s)}>
                {s === "todos" ? "Todos" : s === "em_revisao" ? "Em revisão" : s.charAt(0).toUpperCase() + s.slice(1)}
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nº Pedido</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Projeto</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtrados.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-mono font-medium">{p.id}</TableCell>
                  <TableCell>{p.cliente}</TableCell>
                  <TableCell>{p.projeto}</TableCell>
                  <TableCell>{p.tipo}</TableCell>
                  <TableCell>R$ {p.valor.toLocaleString("pt-BR")}</TableCell>
                  <TableCell>{new Date(p.data).toLocaleDateString("pt-BR")}</TableCell>
                  <TableCell><StatusBadge status={p.status} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
