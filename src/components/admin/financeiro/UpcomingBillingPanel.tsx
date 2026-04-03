import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarClock, AlertTriangle, Clock, RefreshCw, TrendingUp, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

interface BillingItem {
  id: string;
  descricao: string;
  valor: number;
  vencimento: string | null;
  status: string;
  tipo: string;
  cliente_nome?: string;
  source: "financeiro" | "custo_sistema";
  frequencia?: string;
}

export default function UpcomingBillingPanel() {
  const [items, setItems] = useState<BillingItem[]>([]);
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [filtroTipo, setFiltroTipo] = useState("todos");

  useEffect(() => {
    const load = async () => {
      const today = new Date().toISOString().split("T")[0];
      const in7days = new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0];

      const [fin, custos] = await Promise.all([
        supabase.from("financeiro").select("*, clientes(nome)").in("status", ["pendente", "em_atraso"]).order("vencimento"),
        supabase.from("custos_sistema").select("*").eq("status", "ativo"),
      ]);

      const finItems: BillingItem[] = (fin.data || []).map((f: any) => ({
        id: f.id,
        descricao: f.descricao,
        valor: Number(f.valor),
        vencimento: f.vencimento,
        status: f.status,
        tipo: f.tipo,
        cliente_nome: f.clientes?.nome,
        source: "financeiro" as const,
      }));

      const custoItems: BillingItem[] = (custos.data || []).map((c: any) => ({
        id: c.id,
        descricao: c.nome,
        valor: Number(c.valor),
        vencimento: c.proxima_cobranca,
        status: "recorrente",
        tipo: "saida",
        source: "custo_sistema" as const,
        frequencia: c.frequencia,
      }));

      setItems([...finItems, ...custoItems]);
    };
    load();
  }, []);

  const today = new Date().toISOString().split("T")[0];
  const in7days = new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0];

  const vencendoHoje = items.filter(i => i.vencimento === today && i.source === "financeiro");
  const prox7dias = items.filter(i => i.vencimento && i.vencimento > today && i.vencimento <= in7days && i.source === "financeiro");
  const atrasadas = items.filter(i => i.vencimento && i.vencimento < today && i.status !== "pago" && i.source === "financeiro");
  const recorrentes = items.filter(i => i.source === "custo_sistema");

  const filtered = useMemo(() => {
    return items.filter(i => {
      if (filtroStatus !== "todos") {
        if (filtroStatus === "recorrente" && i.source !== "custo_sistema") return false;
        if (filtroStatus === "atrasado" && !(i.vencimento && i.vencimento < today && i.status !== "pago")) return false;
        if (filtroStatus === "pendente" && i.status !== "pendente") return false;
        if (filtroStatus === "hoje" && i.vencimento !== today) return false;
      }
      if (filtroTipo !== "todos") {
        if (filtroTipo === "entrada" && i.tipo !== "entrada") return false;
        if (filtroTipo === "saida" && i.tipo !== "saida") return false;
      }
      return true;
    });
  }, [items, filtroStatus, filtroTipo, today]);

  const summaryCards = [
    { label: "Vencendo Hoje", count: vencendoHoje.length, total: vencendoHoje.reduce((s, i) => s + i.valor, 0), icon: Clock, color: "text-amber-400", bg: "bg-amber-500/10" },
    { label: "Próximos 7 dias", count: prox7dias.length, total: prox7dias.reduce((s, i) => s + i.valor, 0), icon: CalendarClock, color: "text-blue-400", bg: "bg-blue-500/10" },
    { label: "Atrasadas", count: atrasadas.length, total: atrasadas.reduce((s, i) => s + i.valor, 0), icon: AlertTriangle, color: "text-red-400", bg: "bg-red-500/10" },
    { label: "Recorrentes", count: recorrentes.length, total: recorrentes.reduce((s, i) => s + i.valor, 0), icon: RefreshCw, color: "text-purple-400", bg: "bg-purple-500/10" },
  ];

  const freqLabel: Record<string, string> = { mensal: "Mensal", anual: "Anual", semanal: "Semanal", trimestral: "Trimestral" };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <CalendarClock className="w-5 h-5 text-blue-400" />
        <h2 className="text-sm font-bold text-white">Cobranças Futuras & Recorrentes</h2>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {summaryCards.map((s) => (
          <Card key={s.label} className="glass-card border-[0.5px]">
            <CardContent className="p-3 flex items-center gap-3">
              <div className={cn("p-2 rounded-lg", s.bg)}><s.icon className={cn("w-4 h-4", s.color)} /></div>
              <div>
                <p className="text-[10px] text-[hsl(var(--muted-foreground))] uppercase font-bold">{s.label}</p>
                <p className={cn("text-lg font-bold", s.color)}>{s.count}</p>
                <p className="text-[10px] text-[hsl(var(--muted-foreground))]">R$ {s.total.toLocaleString("pt-BR")}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <Filter className="w-3.5 h-3.5 text-[hsl(var(--muted-foreground))]" />
        <Select value={filtroStatus} onValueChange={setFiltroStatus}>
          <SelectTrigger className="glass-input border-0 text-white w-[140px] h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="hoje">Hoje</SelectItem>
            <SelectItem value="pendente">Pendentes</SelectItem>
            <SelectItem value="atrasado">Atrasados</SelectItem>
            <SelectItem value="recorrente">Recorrentes</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filtroTipo} onValueChange={setFiltroTipo}>
          <SelectTrigger className="glass-input border-0 text-white w-[120px] h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos tipos</SelectItem>
            <SelectItem value="entrada">Entrada</SelectItem>
            <SelectItem value="saida">Saída</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* List */}
      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="text-center py-6 text-sm text-[hsl(var(--muted-foreground))]">Nenhuma cobrança encontrada</div>
        ) : filtered.map((item) => {
          const isOverdue = item.vencimento && item.vencimento < today && item.status !== "pago";
          const isToday = item.vencimento === today;
          return (
            <div key={`${item.source}-${item.id}`} className={cn(
              "p-3 rounded-lg border flex items-center justify-between gap-3",
              isOverdue ? "border-red-500/30 bg-red-500/5" : isToday ? "border-amber-500/30 bg-amber-500/5" : "border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)]"
            )}>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-bold text-white truncate">{item.descricao}</p>
                  {item.source === "custo_sistema" && (
                    <Badge variant="outline" className="text-[9px] border-purple-500/30 text-purple-400 px-1.5 py-0">
                      <RefreshCw className="w-2.5 h-2.5 mr-1" />{freqLabel[item.frequencia || "mensal"] || item.frequencia}
                    </Badge>
                  )}
                  {isOverdue && <Badge variant="destructive" className="text-[9px] px-1.5 py-0">Atrasado</Badge>}
                  {isToday && <Badge className="text-[9px] px-1.5 py-0 bg-amber-500/20 text-amber-400 border-0">Hoje</Badge>}
                </div>
                <p className="text-[10px] text-[hsl(var(--muted-foreground))]">
                  {item.cliente_nome || (item.source === "custo_sistema" ? "Custo do sistema" : "—")}
                  {item.vencimento && ` · Venc: ${new Date(item.vencimento + "T12:00:00").toLocaleDateString("pt-BR")}`}
                </p>
              </div>
              <span className={cn("text-sm font-bold whitespace-nowrap", item.tipo === "entrada" ? "text-emerald-400" : "text-red-400")}>
                R$ {item.valor.toLocaleString("pt-BR")}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
