import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { AlertTriangle, Headphones, DollarSign, FolderKanban, ArrowRight } from "lucide-react";

interface DashboardKPIAlertsProps {
  newLeads: number;
  pendingInvoices: number;
  lateProjects: number;
}

const fadeUp = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

export function DashboardKPIAlerts({ newLeads, pendingInvoices, lateProjects }: DashboardKPIAlertsProps) {
  const alerts = [
    newLeads > 0 && {
      icon: Headphones,
      label: `${newLeads} lead${newLeads > 1 ? 's' : ''} novo${newLeads > 1 ? 's' : ''}`,
      link: "/admin/leads",
      color: "hsl(var(--primary))",
      bg: "hsl(var(--primary) / 0.08)",
      border: "hsl(var(--primary) / 0.15)",
    },
    pendingInvoices > 0 && {
      icon: DollarSign,
      label: `${pendingInvoices} fatura${pendingInvoices > 1 ? 's' : ''} pendente${pendingInvoices > 1 ? 's' : ''}`,
      link: "/admin/financeiro",
      color: "hsl(var(--warning))",
      bg: "hsl(var(--warning) / 0.08)",
      border: "hsl(var(--warning) / 0.15)",
    },
    lateProjects > 0 && {
      icon: FolderKanban,
      label: `${lateProjects} projeto${lateProjects > 1 ? 's' : ''} atrasado${lateProjects > 1 ? 's' : ''}`,
      link: "/admin/projetos",
      color: "hsl(var(--destructive))",
      bg: "hsl(var(--destructive) / 0.08)",
      border: "hsl(var(--destructive) / 0.15)",
    },
  ].filter(Boolean) as any[];

  if (alerts.length === 0) return null;

  return (
    <motion.div variants={fadeUp} className="flex flex-wrap gap-2">
      {alerts.map((alert) => (
        <Link
          key={alert.label}
          to={alert.link}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all hover:scale-[1.02] group"
          style={{
            background: alert.bg,
            border: `1px solid ${alert.border}`,
            color: alert.color,
          }}
        >
          <alert.icon className="w-3.5 h-3.5" />
          {alert.label}
          <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
        </Link>
      ))}
    </motion.div>
  );
}
