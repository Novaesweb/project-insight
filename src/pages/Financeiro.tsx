import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, AlertTriangle, DollarSign, RefreshCw, Package, Clock } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { financeiro, evolucaoFinanceira, extrasClientes, clientes } from "@/lib/mock-data";
import StatusBadge from "@/components/StatusBadge";

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

const totalRecebido = financeiro.filter(f => f.tipo === "entrada" && f.status === "pago").reduce((s, f) => s + f.valor, 0);
const totalPendente = financeiro.filter(f => f.status === "pendente").reduce((s, f) => s + f.valor, 0);
const totalAtraso = financeiro.filter(f => f.status === "em_atraso").reduce((s, f) => s + f.valor, 0);

// Extras financeiro
const mensaisAtivos = extrasClientes.filter(e => e.status === "ativo" && e.precoMensal > 0);
const totalMensalRecorrente = mensaisAtivos.reduce((s, e) => s + e.precoMensal, 0);
const totalAtivacoesMes = extrasClientes.filter(e => e.dataAtivacao.startsWith("2026-03")).reduce((s, e) => s + e.precoAtivacao, 0);

export default function Financeiro() {
  const [filtro, setFiltro] = useState("todos");
  const filtrados = filtro === "todos" ? financeiro : financeiro.filter(f => f.status === filtro);

  return (
    <motion.div className="space-y-6" initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.08 } } }}>
      {/* Summary */}
      <motion.div className="grid grid-cols-1 sm:grid-cols-3 gap-4" variants={fadeUp}>
        <Card className="glass-card border-[0.5px]">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-emerald-500/10"><TrendingUp className="w-5 h-5 text-emerald-400" /></div>
            <div>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">Total Recebido</p>
              <p className="text-xl font-bold text-white">R$ {totalRecebido.toLocaleString("pt-BR")}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card border-[0.5px]">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-amber-500/10"><DollarSign className="w-5 h-5 text-amber-400" /></div>
            <div>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">Total Pendente</p>
              <p className="text-xl font-bold text-white">R$ {totalPendente.toLocaleString("pt-BR")}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card border-[0.5px]">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-red-500/10"><AlertTriangle className="w-5 h-5 text-red-400" /></div>
            <div>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">Em Atraso</p>
              <p className="text-xl font-bold text-white">R$ {totalAtraso.toLocaleString("pt-BR")}</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Area chart */}
      <motion.div variants={fadeUp}>
        <Card className="glass-card border-[0.5px]">
          <CardHeader><CardTitle className="text-sm font-semibold text-white">Evolução Financeira</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={evolucaoFinanceira}>
                <defs>
                  <linearGradient id="colorRecebido" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#e8334a" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#e8334a" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "rgba(255,255,255,0.5)" }} />
                <YAxis tick={{ fontSize: 11, fill: "rgba(255,255,255,0.5)" }} tickFormatter={(v) => `${v / 1000}k`} />
                <Tooltip contentStyle={{ background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#fff", fontSize: 12 }} formatter={(v: number) => `R$ ${v.toLocaleString("pt-BR")}`} />
                <Area type="monotone" dataKey="recebido" stroke="#e8334a" fill="url(#colorRecebido)" strokeWidth={2} />
                <Area type="monotone" dataKey="pendente" stroke="#f59e0b" fill="transparent" strokeWidth={1.5} strokeDasharray="4 4" />
                <Area type="monotone" dataKey="atrasado" stroke="#ef4444" fill="transparent" strokeWidth={1.5} strokeDasharray="2 2" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Receita de Extras */}
      <motion.div variants={fadeUp}>
        <Card className="glass-card border-[0.5px]">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
              <Package className="w-4 h-4" /> Receita de Extras
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)]">
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">Ativações no mês</p>
                </div>
                <p className="text-lg font-bold text-emerald-400">R$ {totalAtivacoesMes.toFixed(2).replace(".", ",")}</p>
              </div>
              <div className="p-4 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)]">
                <div className="flex items-center gap-2 mb-1">
                  <RefreshCw className="w-4 h-4 text-blue-400" />
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">Renda Recorrente (mensais ativos)</p>
                </div>
                <p className="text-lg font-bold text-blue-400">R$ {totalMensalRecorrente.toFixed(2).replace(".", ",")}/mês</p>
              </div>
            </div>

            {/* Mensais ativos por cliente */}
            <div className="space-y-2">
              <p className="text-xs text-[hsl(var(--muted-foreground))] font-semibold uppercase tracking-wider">Mensais ativos por cliente</p>
              {mensaisAtivos.map(e => (
                <div key={e.id} className="flex items-center justify-between p-3 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.04)]">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full gradient-primary flex items-center justify-center">
                      <span className="text-white text-[8px] font-bold">{clientes.find(c => c.id === e.clienteId)?.avatar || "?"}</span>
                    </div>
                    <div>
                      <p className="text-sm text-white">{e.extraNome}</p>
                      <p className="text-[10px] text-[hsl(var(--muted-foreground))]">{e.cliente}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-blue-400">R$ {e.precoMensal.toFixed(2).replace(".", ",")}/mês</p>
                    <p className="text-[10px] text-[hsl(var(--muted-foreground))]">Desde {new Date(e.dataAtivacao).toLocaleDateString("pt-BR")}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Transactions */}
      <motion.div variants={fadeUp}>
        <Card className="glass-card border-[0.5px]">
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <CardTitle className="text-sm font-semibold text-white">Lançamentos</CardTitle>
              <div className="flex gap-2">
                {["todos", "pago", "pendente", "em_atraso"].map((s) => (
                  <Button key={s} size="sm"
                    className={filtro === s ? "gradient-primary border-0 text-white text-xs" : "glass-input border-0 text-[hsl(var(--muted-foreground))] hover:text-white text-xs"}
                    onClick={() => setFiltro(s)}>
                    {s === "todos" ? "Todos" : s === "em_atraso" ? "Atrasado" : s.charAt(0).toUpperCase() + s.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-[rgba(255,255,255,0.06)]">
                  {["Descrição", "Tipo", "Valor", "Vencimento", "Cliente", "Status"].map((h) => (
                    <TableHead key={h} className="text-[11px] text-[hsl(var(--muted-foreground))]">{h}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtrados.map((f) => (
                  <TableRow key={f.id} className="border-[rgba(255,255,255,0.04)]">
                    <TableCell className="text-sm text-white">{f.descricao}</TableCell>
                    <TableCell>
                      <span className={`text-sm font-medium ${f.tipo === "entrada" ? "text-emerald-400" : "text-red-400"}`}>
                        {f.tipo === "entrada" ? "↑ Entrada" : "↓ Saída"}
                      </span>
                    </TableCell>
                    <TableCell className={`text-sm font-medium ${f.tipo === "entrada" ? "text-emerald-400" : "text-red-400"}`}>
                      {f.tipo === "saida" ? "- " : ""}R$ {f.valor.toLocaleString("pt-BR")}
                    </TableCell>
                    <TableCell className="text-sm text-[hsl(var(--muted-foreground))]">{new Date(f.vencimento).toLocaleDateString("pt-BR")}</TableCell>
                    <TableCell className="text-sm text-[hsl(var(--muted-foreground))]">{f.cliente || "—"}</TableCell>
                    <TableCell><StatusBadge status={f.status} /></TableCell>
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
