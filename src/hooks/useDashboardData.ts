import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useRealtimeRefresh } from "@/hooks/useRealtimeRefresh";

type DashboardSnapshot = {
  stats?: {
    clientes?: number;
    projetos?: number;
    leads?: number;
    receita?: number;
  };
  pedidos?: unknown[];
  tickets?: unknown[];
  subCount?: number;
  monthlyRevenue?: Array<{ name?: string; total?: number }>;
  topModules?: Array<{ name?: string; value?: number }>;
  funnelData?: Array<{ name?: string; value?: number }>;
  revenue?: {
    paid?: number;
    pending?: number;
  };
  pendingInvoices?: number;
  newLeads?: number;
  lateProjects?: number;
};

type DashboardActivityItem = {
  id: string;
  title: string;
  body: string;
  created_at: string;
  url?: string | null;
  read?: boolean;
};

const defaultFunnelData = [
  { name: "Leads", value: 0 },
  { name: "Clientes", value: 0 },
  { name: "Projetos", value: 0 },
];

export function useDashboardData() {
  const [stats, setStats] = useState({ clientes: 0, projetos: 0, leads: 0, receita: 0 });
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [dbStatus, setDbStatus] = useState<"conectado" | "erro" | "carregando">("carregando");
  const [subCount, setSubCount] = useState(0);
  const [activity, setActivity] = useState<DashboardActivityItem[]>([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState<any[]>([]);
  const [topModules, setTopModules] = useState<any[]>([]);
  const [funnelData, setFunnelData] = useState<any[]>(defaultFunnelData);
  const [revenue, setRevenue] = useState({ paid: 0, pending: 0 });
  const [pendingInvoices, setPendingInvoices] = useState(0);
  const [newLeads, setNewLeads] = useState(0);
  const [lateProjects, setLateProjects] = useState(0);

  const load = useCallback(async () => {
    try {
      const [snapshotResponse, activityResponse] = await Promise.all([
        supabase.rpc("get_admin_dashboard_snapshot"),
        supabase.rpc("get_admin_dashboard_activity"),
      ]);

      if (snapshotResponse.error) {
        throw snapshotResponse.error;
      }

      if (activityResponse.error) {
        throw activityResponse.error;
      }

      const snapshot = (snapshotResponse.data || {}) as DashboardSnapshot;
      const activityItems = Array.isArray(activityResponse.data)
        ? (activityResponse.data as DashboardActivityItem[])
        : [];

      setStats({
        clientes: Number(snapshot.stats?.clientes || 0),
        projetos: Number(snapshot.stats?.projetos || 0),
        leads: Number(snapshot.stats?.leads || 0),
        receita: Number(snapshot.stats?.receita || 0),
      });
      setPedidos(Array.isArray(snapshot.pedidos) ? snapshot.pedidos : []);
      setTickets(Array.isArray(snapshot.tickets) ? snapshot.tickets : []);
      setSubCount(Number(snapshot.subCount || 0));
      setActivity(activityItems);
      setMonthlyRevenue(
        Array.isArray(snapshot.monthlyRevenue)
          ? snapshot.monthlyRevenue.map((item) => ({
              name: item.name || "—",
              total: Number(item.total || 0),
            }))
          : [],
      );
      setTopModules(
        Array.isArray(snapshot.topModules) && snapshot.topModules.length > 0
          ? snapshot.topModules.map((item) => ({
              name: item.name || "Outro",
              value: Number(item.value || 0),
            }))
          : [{ name: "Nenhuma venda", value: 1 }],
      );
      setFunnelData(
        Array.isArray(snapshot.funnelData)
          ? snapshot.funnelData.map((item) => ({
              name: item.name || "—",
              value: Number(item.value || 0),
            }))
          : defaultFunnelData,
      );
      setRevenue({
        paid: Number(snapshot.revenue?.paid || 0),
        pending: Number(snapshot.revenue?.pending || 0),
      });
      setPendingInvoices(Number(snapshot.pendingInvoices || 0));
      setNewLeads(Number(snapshot.newLeads || 0));
      setLateProjects(Number(snapshot.lateProjects || 0));
      setDbStatus("conectado");
    } catch (err) {
      console.error("Dashboard error:", err);
      setDbStatus("erro");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useRealtimeRefresh(
    [
      { table: "clientes" },
      { table: "projetos" },
      { table: "pedidos" },
      { table: "tickets" },
      { table: "financeiro" },
      { table: "extras_clientes" },
      { table: "extras_catalogo" },
      { table: "leads" },
      { table: "push_subscriptions" },
      { table: "notifications" },
    ],
    load,
    { channelPrefix: "admin-dashboard", debounceMs: 800, mode: "conservative" },
  );

  return {
    stats,
    pedidos,
    tickets,
    dbStatus,
    subCount,
    activity,
    monthlyRevenue,
    topModules,
    funnelData,
    revenue,
    pendingInvoices,
    newLeads,
    lateProjects,
    refresh: load,
  };
}
