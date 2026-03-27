import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function useDashboardData() {
  const { toast } = useToast();
  const [stats, setStats] = useState({ clientes: 0, projetos: 0, pedidos: 0, receita: 0 });
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [dbStatus, setDbStatus] = useState<"conectado" | "erro" | "carregando">("carregando");
  const [subCount, setSubCount] = useState(0);
  const [activity, setActivity] = useState<any[]>([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState<any[]>([]);
  const [topModules, setTopModules] = useState<any[]>([]);
  const [funnelData, setFunnelData] = useState<any[]>([
    { name: "Leads", value: 0 },
    { name: "Clientes", value: 0 },
    { name: "Projetos", value: 0 }
  ]);
  const [revenue, setRevenue] = useState({ paid: 0, pending: 0 });
  const [pendingInvoices, setPendingInvoices] = useState(0);

  const load = useCallback(async () => {
    if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY) {
      setDbStatus("erro");
      return;
    }

    try {
      const [c, p, ped, t, fin, extrasCli, catFull] = await Promise.all([
        supabase.from("clientes").select("*", { count: "exact", head: true }).eq("status", "ativo"),
        supabase.from("projetos").select("*", { count: "exact", head: true }).eq("status", "em_andamento"),
        supabase.from("pedidos").select("*, clientes(nome)").order("created_at", { ascending: false }).limit(5),
        supabase.from("tickets").select("*, clientes(nome)").neq("status", "resolvido").order("created_at", { ascending: false }).limit(5),
        supabase.from("financeiro").select("valor, created_at").eq("tipo", "entrada").eq("status", "pago"),
        supabase.from("extras_clientes").select("extra_id"),
        supabase.from("extras_catalogo").select("id, nome")
      ]);

      const totalRevenue = (fin.data || []).reduce((s: number, f: any) => s + Number(f.valor), 0);
      setStats({
        clientes: c.count || 0,
        projetos: p.count || 0,
        pedidos: (ped.data || []).filter((x: any) => x.status === "pendente").length,
        receita: totalRevenue
      });
      setPedidos(ped.data || []);
      setTickets(t.data || []);

      const hasError = c.error || p.error || ped.error || t.error || fin.error;
      setDbStatus(hasError ? "erro" : "conectado");

      // Chart Calculations: Monthly Revenue
      const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      const currentMonthIndex = new Date().getMonth();
      const revenueMap: Record<string, number> = {};

      for (let i = 5; i >= 0; i--) {
        let mIdx = currentMonthIndex - i;
        if (mIdx < 0) mIdx += 12;
        revenueMap[months[mIdx]] = 0;
      }

      fin.data?.forEach((f: any) => {
        const date = new Date(f.created_at);
        const monthName = months[date.getMonth()];
        if (revenueMap[monthName] !== undefined) {
          revenueMap[monthName] += Number(f.valor);
        }
      });

      setMonthlyRevenue(Object.keys(revenueMap).map(k => ({ name: k, total: Number(revenueMap[k].toFixed(2)) })));

      // Chart Calculations: Top Modules
      const moduleCounts: Record<string, number> = {};
      extrasCli.data?.forEach((e: any) => {
        if (!e.extra_id) return;
        moduleCounts[e.extra_id] = (moduleCounts[e.extra_id] || 0) + 1;
      });

      const pieData = Object.keys(moduleCounts)
        .map((id) => {
          const cat = catFull.data?.find(item => item.id === id);
          return { name: cat ? cat.nome : 'Outro', value: moduleCounts[id] };
        })
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);

      if (pieData.length === 0) pieData.push({ name: 'Nenhum venda', value: 1 });
      setTopModules(pieData);

      // Other counts & revenue split
      const [leadsRes, cliRes, projRes, pedDataRes] = await Promise.all([
        supabase.from("leads").select("*", { count: "exact", head: true }),
        supabase.from("clientes").select("*", { count: "exact", head: true }),
        supabase.from("projetos").select("*", { count: "exact", head: true }),
        supabase.from("pedidos").select("valor, status, created_at")
      ]);

      setFunnelData([
        { name: "Leads", value: leadsRes.count || 0 },
        { name: "Clientes", value: cliRes.count || 0 },
        { name: "Projetos", value: projRes.count || 0 }
      ]);

      if (pedDataRes.data) {
        const totalPaid = pedDataRes.data.filter(p => p.status === "pago").reduce((s, p) => s + (p.valor || 0), 0);
        const totalPending = pedDataRes.data.filter(p => p.status === "pendente").reduce((s, p) => s + (p.valor || 0), 0);
        setRevenue({ paid: totalPaid, pending: totalPending });
        setPendingInvoices(pedDataRes.data.filter(p => p.status === "pendente").length);
      }

      // Subscriptions & Activity
      supabase.from("push_subscriptions").select("id", { count: "exact", head: true }).then(({ count }) => setSubCount(count || 0));
      const { data: acts } = await supabase.from("notifications").select("*").eq("user_type", "admin").order("created_at", { ascending: false }).limit(20);
      setActivity(acts || []);

    } catch (err) {
      console.error("Dashboard error:", err);
      setDbStatus("erro");
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return {
    stats, pedidos, tickets, dbStatus, subCount, activity, 
    monthlyRevenue, topModules, funnelData, revenue, pendingInvoices, 
    refresh: load
  };
}



