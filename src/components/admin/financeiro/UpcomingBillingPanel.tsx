import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CalendarClock, Clock, Filter, RefreshCw } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
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
        source: "financeiro",
      }));

      const custoItems: BillingItem[] = (custos.data || []).map((c: any) => ({
        id: c.id,
        descricao: c.nome,
        valor: Number(c.valor),
        vencimento: c.proxima_cobranca,
        status: "recorrente",
        tipo: "saida",
        source: "custo_sistema",
        frequencia: c.frequencia,
      }));

      setItems([...finItems, ...custoItems]);
    };

    void load();
  }, []);

  const today = new Date().toISOString().split("T")[0];
  const in7days = new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0];

  const vencendoHoje = items.filter((item) => item.vencimento === today && item.source === "financeiro");
  const prox7dias = items.filter(
    (item) => item.vencimento && item.vencimento > today && item.vencimento <= in7days && item.source === "financeiro",
  );
  const atrasadas = items.filter(
    (item) => item.vencimento && item.vencimento < today && item.status !== "pago" && item.source === "financeiro",
  );
  const recorrentes = items.filter((item) => item.source === "custo_sistema");

  const filtered = useMemo(() => {
    return items.filter((item) => {
      if (filtroStatus !== "todos") {
        if (filtroStatus === "recorrente" && item.source !== "custo_sistema") return false;
        if (filtroStatus === "atrasado" && !(item.vencimento && item.vencimento < today && item.status !== "pago")) return false;
        if (filtroStatus === "pendente" && item.status !== "pendente") return false;
        if (filtroStatus === "hoje" && item.vencimento !== today) return false;
      }

      if (filtroTipo !== "todos") {
        if (filtroTipo === "entrada" && item.tipo !== "entrada") return false;
        if (filtroTipo === "saida" && item.tipo !== "saida") return false;
      }

      return true;
    });
  }, [items, filtroStatus, filtroTipo, today]);

  const summaryCards = [
    {
      label: "Vencendo Hoje",
      count: vencendoHoje.length,
      total: vencendoHoje.reduce((sum, item) => sum + item.valor, 0),
      icon: Clock,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
    },
    {
      label: "Proximos 7 dias",
      count: prox7dias.length,
      total: prox7dias.reduce((sum, item) => sum + item.valor, 0),
      icon: CalendarClock,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
    },
    {
      label: "Atrasadas",
      count: atrasadas.length,
      total: atrasadas.reduce((sum, item) => sum + item.valor, 0),
      icon: AlertTriangle,
      color: "text-red-400",
      bg: "bg-red-500/10",
    },
    {
      label: "Recorrentes",
      count: recorrentes.length,
      total: recorrentes.reduce((sum, item) => sum + item.valor, 0),
      icon: RefreshCw,
      color: "text-purple-400",
      bg: "bg-purple-500/10",
    },
  ];

  const freqLabel: Record<string, string> = {
    mensal: "Mensal",
    anual: "Anual",
    semanal: "Semanal",
    trimestral: "Trimestral",
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <CalendarClock className="h-5 w-5 text-blue-400" />
        <h2 className="text-sm font-bold text-white">Cobrancas Futuras e Recorrentes</h2>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {summaryCards.map((card) => (
          <Card key={card.label} className="glass-card border-[0.5px]">
            <CardContent className="flex items-center gap-3 p-3">
              <div className={cn("rounded-lg p-2", card.bg)}>
                <card.icon className={cn("h-4 w-4", card.color)} />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase text-[hsl(var(--muted-foreground))]">{card.label}</p>
                <p className={cn("text-lg font-bold", card.color)}>{card.count}</p>
                <p className="text-[10px] text-[hsl(var(--muted-foreground))]">R$ {card.total.toLocaleString("pt-BR")}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Filter className="h-3.5 w-3.5 text-[hsl(var(--muted-foreground))]" />
        <Select value={filtroStatus} onValueChange={setFiltroStatus}>
          <SelectTrigger className="glass-input h-8 w-[140px] border-0 text-xs text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="hoje">Hoje</SelectItem>
            <SelectItem value="pendente">Pendentes</SelectItem>
            <SelectItem value="atrasado">Atrasados</SelectItem>
            <SelectItem value="recorrente">Recorrentes</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filtroTipo} onValueChange={setFiltroTipo}>
          <SelectTrigger className="glass-input h-8 w-[120px] border-0 text-xs text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos tipos</SelectItem>
            <SelectItem value="entrada">Entrada</SelectItem>
            <SelectItem value="saida">Saida</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="max-h-[400px] space-y-2 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="py-8 text-center text-sm text-[hsl(var(--muted-foreground))]">
            Nenhuma cobranca futura ou recorrencia ativa. O financeiro esta limpo e pronto para iniciar.
          </div>
        ) : (
          filtered.map((item) => {
            const isOverdue = item.vencimento && item.vencimento < today && item.status !== "pago";
            const isToday = item.vencimento === today;

            return (
              <div
                key={`${item.source}-${item.id}`}
                className={cn(
                  "flex items-center justify-between gap-3 rounded-lg border p-3",
                  isOverdue
                    ? "border-red-500/30 bg-red-500/5"
                    : isToday
                      ? "border-amber-500/30 bg-amber-500/5"
                      : "border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)]",
                )}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-xs font-bold text-white">{item.descricao}</p>
                    {item.source === "custo_sistema" && (
                      <Badge variant="outline" className="px-1.5 py-0 text-[9px] text-purple-400 border-purple-500/30">
                        <RefreshCw className="mr-1 h-2.5 w-2.5" />
                        {freqLabel[item.frequencia || "mensal"] || item.frequencia}
                      </Badge>
                    )}
                    {isOverdue && (
                      <Badge variant="destructive" className="px-1.5 py-0 text-[9px]">
                        Atrasado
                      </Badge>
                    )}
                    {isToday && (
                      <Badge className="border-0 bg-amber-500/20 px-1.5 py-0 text-[9px] text-amber-400">
                        Hoje
                      </Badge>
                    )}
                  </div>
                  <p className="text-[10px] text-[hsl(var(--muted-foreground))]">
                    {item.cliente_nome || (item.source === "custo_sistema" ? "Custo do sistema" : "-")}
                    {item.vencimento && ` · Venc: ${new Date(`${item.vencimento}T12:00:00`).toLocaleDateString("pt-BR")}`}
                  </p>
                </div>
                <span className={cn("whitespace-nowrap text-sm font-bold", item.tipo === "entrada" ? "text-emerald-400" : "text-red-400")}>
                  R$ {item.valor.toLocaleString("pt-BR")}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
