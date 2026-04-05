import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  ShoppingCart,
  BarChart3,
  DollarSign,
  Headphones,
  UserCog,
  Settings,
  LogOut,
  Puzzle,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  CalendarDays,
  ClipboardList,
} from "lucide-react";
import { useLeadCount } from "@/hooks/useLeadCount";
import { useAdminAccess } from "@/hooks/useAdminAccess";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { getFavoriteAdminRoutes, getRecentAdminRoutes } from "@/lib/admin-navigation";

interface NavGroup {
  title: string;
  items: { href: string; label: string; icon: any; accent?: boolean }[];
}

const navGroups: NavGroup[] = [
  {
    title: "Principal",
    items: [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
      { href: "/admin/clientes", label: "Clientes", icon: Users },
      { href: "/admin/checklist-clientes", label: "Checklist Clientes", icon: ClipboardList },
      { href: "/admin/leads", label: "Leads", icon: Headphones },
      { href: "/admin/projetos", label: "Projetos", icon: FolderKanban },
    ],
  },
  {
    title: "Operações",
    items: [
      { href: "/admin/pedidos", label: "Pedidos", icon: ShoppingCart },
      { href: "/admin/extras", label: "Extras", icon: Puzzle, accent: true },
      { href: "/admin/recurrent-extras", label: "Extras Recorrentes", icon: CalendarDays },
    ],
  },
  {
    title: "Gestão",
    items: [
      { href: "/admin/financeiro", label: "Financeiro", icon: DollarSign, accent: true },
      { href: "/admin/relatorios", label: "Relatórios", icon: BarChart3 },
      { href: "/admin/contratos", label: "Contratos", icon: ShieldCheck },
      { href: "/admin/suporte", label: "Suporte", icon: Headphones },
    ],
  },
  {
    title: "Sistema",
    items: [
      { href: "/admin/usuarios", label: "Usuários", icon: UserCog },
      { href: "/admin/revenda", label: "Revenda", icon: Users },
      { href: "/admin/configuracoes", label: "Configurações", icon: Settings },
    ],
  },
];

interface AdminSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  branding: { logo: string; nome: string };
}

export default function AdminSidebar({ isCollapsed, onToggle, branding }: AdminSidebarProps) {
  const { pathname } = useLocation();
  const leadCount = useLeadCount();
  const { canAccessPath } = useAdminAccess();
  const [recentRoutes, setRecentRoutes] = useState(() => getRecentAdminRoutes());
  const [counts, setCounts] = useState({ leads: 0, financeiro: 0, projetos: 0 });

  const favoriteRoutes = useMemo(
    () => getFavoriteAdminRoutes().filter((route) => route.href !== pathname && canAccessPath(route.href)).slice(0, 3),
    [canAccessPath, pathname]
  );

  useEffect(() => {
    setRecentRoutes(getRecentAdminRoutes().filter((route) => route.href !== pathname && canAccessPath(route.href)).slice(0, 3));
  }, [canAccessPath, pathname]);

  useEffect(() => {
    const loadCounts = async () => {
      const [newLeads, financeOpen, projectData] = await Promise.all([
        supabase.from("leads").select("*", { count: "exact", head: true }).eq("status", "novo"),
        supabase.from("financeiro").select("*", { count: "exact", head: true }).in("status", ["pendente", "em_atraso"]),
        supabase.from("projetos").select("id, status, data_entrega").neq("status", "concluido"),
      ]);

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const lateProjects = (projectData.data || []).filter((project: any) => {
        if (!project?.data_entrega) return false;
        const deliveryDate = new Date(project.data_entrega);
        deliveryDate.setHours(0, 0, 0, 0);
        return deliveryDate < today;
      }).length;

      setCounts({
        leads: newLeads.count || 0,
        financeiro: financeOpen.count || 0,
        projetos: lateProjects,
      });
    };

    loadCounts();
  }, [pathname]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/admin/login";
  };

  const getItemCount = (href: string) => {
    if (href === "/admin/leads") return counts.leads || leadCount;
    if (href === "/admin/financeiro") return counts.financeiro;
    if (href === "/admin/projetos") return counts.projetos;
    return 0;
  };

  return (
    <motion.aside
      animate={{ width: isCollapsed ? 72 : 264 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="hidden md:flex md:flex-col relative z-50 shrink-0 h-screen"
      style={{
        background: "hsl(var(--background))",
        borderRight: "1px solid hsl(var(--border))",
      }}
    >
      <div
        className="absolute top-0 left-0 w-[2px] h-full opacity-50"
        style={{ background: "linear-gradient(180deg, hsl(var(--primary)), hsl(var(--accent)), transparent)" }}
      />

      <button
        onClick={onToggle}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full flex items-center justify-center z-50 transition-all"
        style={{
          background: "hsl(var(--secondary))",
          border: "1px solid hsl(var(--border))",
          color: "hsl(var(--muted-foreground))",
        }}
        aria-label={isCollapsed ? "Expandir" : "Recolher"}
      >
        {isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>

      <div
        className={cn("py-6 flex items-center border-b", isCollapsed ? "px-0 justify-center" : "px-5 gap-3")}
        style={{ borderColor: "hsl(var(--border))" }}
      >
        <Link to="/admin" className="flex items-center gap-3 group">
          <div className="relative">
            <div
              className="absolute -inset-1 rounded-xl blur-lg opacity-20 group-hover:opacity-40 transition-opacity"
              style={{ background: "var(--gradient-primary)" }}
            />
            <div
              className="rounded-xl flex items-center justify-center relative w-10 h-10"
              style={{ background: "var(--gradient-primary)" }}
            >
              <Sparkles className="w-5 h-5 text-white" />
            </div>
          </div>
          {!isCollapsed && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
              <p className="text-sm font-extrabold tracking-tight text-foreground leading-none">{branding.nome || "NovaesWeb"}</p>
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground mt-0.5">Admin Panel</p>
            </motion.div>
          )}
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5 custom-scrollbar" role="navigation">
        {navGroups.map((group) => (
          <div key={group.title}>
            {!isCollapsed && (
              <p className="text-[9px] font-bold uppercase tracking-[0.25em] px-3 mb-2 text-muted-foreground/50">
                {group.title}
              </p>
            )}

            <div className="space-y-0.5">
              {group.items.filter((item) => canAccessPath(item.href)).map((item) => {
                const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
                const badgeCount = getItemCount(item.href);

                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={cn(
                      "group flex items-center py-2.5 text-[12px] font-medium transition-all relative rounded-xl",
                      isCollapsed ? "justify-center px-2" : "gap-3 px-3",
                      isActive
                        ? "text-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/50",
                      item.accent && !isActive && "text-amber-400/60 hover:text-amber-400"
                    )}
                    style={isActive ? {
                      background: "hsl(var(--secondary))",
                      boxShadow: "0 0 0 1px hsl(var(--border))",
                    } : undefined}
                    aria-current={isActive ? "page" : undefined}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="adminNav"
                        className="absolute left-0 w-[3px] h-4 rounded-r-full"
                        style={{ background: "var(--gradient-primary)" }}
                        transition={{ type: "spring", stiffness: 350, damping: 30 }}
                      />
                    )}
                    <item.icon
                      className={cn(
                        "w-4 h-4 shrink-0 transition-all duration-200",
                        isActive
                          ? "text-primary"
                          : item.accent
                            ? "text-amber-400/50"
                            : "text-muted-foreground/60 group-hover:text-foreground/80"
                      )}
                    />
                    {!isCollapsed && <span className="truncate">{item.label}</span>}
                    {!isCollapsed && badgeCount > 0 && (
                      <span
                        className="ml-auto px-1.5 py-0.5 rounded-full text-[9px] font-bold text-white"
                        style={{ background: "hsl(var(--primary))" }}
                      >
                        {badgeCount}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

        {!isCollapsed && (
          <>
            <div className="pt-1">
              <p className="text-[9px] font-bold uppercase tracking-[0.25em] px-3 mb-2 text-muted-foreground/50">
                Atalhos
              </p>
              <div className="flex flex-wrap gap-2 px-3">
                {favoriteRoutes.map((route) => (
                  <Link
                    key={route.href}
                    to={route.href}
                    className="rounded-xl px-3 py-2 text-[11px] font-semibold text-foreground transition-all hover:bg-secondary/80"
                    style={{
                      background: "hsl(var(--secondary))",
                      border: "1px solid hsl(var(--border))",
                    }}
                  >
                    {route.shortLabel || route.label}
                  </Link>
                ))}
              </div>
            </div>

            {recentRoutes.length > 0 && (
              <div className="pt-1">
                <p className="text-[9px] font-bold uppercase tracking-[0.25em] px-3 mb-2 text-muted-foreground/50">
                  Recentes
                </p>
                <div className="space-y-1">
                  {recentRoutes.map((route) => (
                    <Link
                      key={route.href}
                      to={route.href}
                      className="flex items-center justify-between px-3 py-2 rounded-xl text-[12px] text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
                    >
                      <span>{route.label}</span>
                      <span className="text-[10px] uppercase tracking-widest text-muted-foreground/50">Abrir</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </nav>

      <div className={cn("p-3 border-t", isCollapsed && "px-2")} style={{ borderColor: "hsl(var(--border))" }}>
        <button
          onClick={handleLogout}
          className={cn(
            "flex items-center py-2.5 text-xs font-medium text-muted-foreground hover:text-destructive transition-all w-full rounded-xl hover:bg-destructive/5",
            isCollapsed ? "justify-center px-2" : "gap-3 px-3"
          )}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span>Sair</span>}
        </button>
      </div>
    </motion.aside>
  );
}
