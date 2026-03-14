import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TrendingUp, TrendingDown, AlertTriangle, DollarSign } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { financeiro, receitaMensal } from "@/lib/mock-data";
import StatusBadge from "@/components/StatusBadge";

const totalEntradas = financeiro.filter(f => f.tipo === "entrada").reduce((s, f) => s + f.valor, 0);
const totalSaidas = financeiro.filter(f => f.tipo === "saida").reduce((s, f) => s + f.valor, 0);
const emAtraso = financeiro.filter(f => f.status === "em_atraso").reduce((s, f) => s + f.valor, 0);

export default function Financeiro() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Financeiro</h1>
        <p className="text-muted-foreground mt-1">Visão financeira do negócio</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-emerald-500/10"><TrendingUp className="w-5 h-5 text-emerald-600" /></div>
            <div>
              <p className="text-sm text-muted-foreground">Entradas</p>
              <p className="text-xl font-bold">R$ {totalEntradas.toLocaleString("pt-BR")}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-red-500/10"><TrendingDown className="w-5 h-5 text-red-600" /></div>
            <div>
              <p className="text-sm text-muted-foreground">Saídas</p>
              <p className="text-xl font-bold">R$ {totalSaidas.toLocaleString("pt-BR")}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-blue-500/10"><DollarSign className="w-5 h-5 text-blue-600" /></div>
            <div>
              <p className="text-sm text-muted-foreground">Saldo</p>
              <p className="text-xl font-bold">R$ {(totalEntradas - totalSaidas).toLocaleString("pt-BR")}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-amber-500/10"><AlertTriangle className="w-5 h-5 text-amber-600" /></div>
            <div>
              <p className="text-sm text-muted-foreground">Em Atraso</p>
              <p className="text-xl font-bold">R$ {emAtraso.toLocaleString("pt-BR")}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-lg">Receita por Mês</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={receitaMensal}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
              <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${v / 1000}k`} />
              <Tooltip formatter={(v: number) => `R$ ${v.toLocaleString("pt-BR")}`} />
              <Bar dataKey="valor" fill="hsl(243, 75%, 59%)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">Movimentações</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Descrição</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {financeiro.map((f) => (
                <TableRow key={f.id}>
                  <TableCell className="font-medium">{f.descricao}</TableCell>
                  <TableCell>
                    <span className={f.tipo === "entrada" ? "text-emerald-600 font-medium" : "text-red-600 font-medium"}>
                      {f.tipo === "entrada" ? "Entrada" : "Saída"}
                    </span>
                  </TableCell>
                  <TableCell className={f.tipo === "entrada" ? "text-emerald-600" : "text-red-600"}>
                    {f.tipo === "saida" ? "- " : ""}R$ {f.valor.toLocaleString("pt-BR")}
                  </TableCell>
                  <TableCell>{new Date(f.data).toLocaleDateString("pt-BR")}</TableCell>
                  <TableCell>{f.cliente || "—"}</TableCell>
                  <TableCell><StatusBadge status={f.status} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
