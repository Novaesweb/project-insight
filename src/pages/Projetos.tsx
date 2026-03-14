import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus, List, LayoutGrid } from "lucide-react";
import { projetos } from "@/lib/mock-data";
import StatusBadge from "@/components/StatusBadge";

const statusColumns = [
  { key: "em_andamento", label: "Em Andamento" },
  { key: "pausado", label: "Pausado" },
  { key: "concluido", label: "Concluído" },
  { key: "cancelado", label: "Cancelado" },
];

export default function Projetos() {
  const [view, setView] = useState<"lista" | "kanban">("lista");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projetos</h1>
          <p className="text-muted-foreground mt-1">Gerenciamento de projetos por cliente</p>
        </div>
        <div className="flex gap-2">
          <div className="flex border rounded-lg overflow-hidden">
            <Button variant={view === "lista" ? "default" : "ghost"} size="sm" onClick={() => setView("lista")}><List className="w-4 h-4" /></Button>
            <Button variant={view === "kanban" ? "default" : "ghost"} size="sm" onClick={() => setView("kanban")}><LayoutGrid className="w-4 h-4" /></Button>
          </div>
          <Button><Plus className="w-4 h-4 mr-2" /> Novo Projeto</Button>
        </div>
      </div>

      {view === "lista" ? (
        <Card>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Responsável</TableHead>
                  <TableHead>Prazo</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projetos.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.titulo}</TableCell>
                    <TableCell>{p.cliente}</TableCell>
                    <TableCell>{p.responsavel}</TableCell>
                    <TableCell>{new Date(p.prazo).toLocaleDateString("pt-BR")}</TableCell>
                    <TableCell>R$ {p.valor.toLocaleString("pt-BR")}</TableCell>
                    <TableCell><StatusBadge status={p.status} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statusColumns.map((col) => (
            <div key={col.key} className="space-y-3">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">{col.label}</h3>
              {projetos.filter(p => p.status === col.key).map((p) => (
                <Card key={p.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4 space-y-2">
                    <p className="font-semibold text-sm">{p.titulo}</p>
                    <p className="text-xs text-muted-foreground">{p.cliente}</p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">{p.responsavel}</span>
                      <span className="font-medium">R$ {(p.valor / 1000).toFixed(0)}k</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {projetos.filter(p => p.status === col.key).length === 0 && (
                <div className="border border-dashed rounded-lg p-6 text-center text-xs text-muted-foreground">
                  Nenhum projeto
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
