import { useEffect, useMemo } from "react";
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
  ChevronLeft,
  ChevronRight,
  Sparkles,
  CalendarDays,
  ServerCog,
  ClipboardList,
  BookText,
  FileSignature,
} from "lucide-react";

import { useAdminAccess } from "@/hooks/useAdminAccess";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { getFavoriteAdminRoutes } from "@/lib/admin-navigation";
import { useAdminStore } from "@/features/admin/store/admin-store";
import { useLeadCount } from "@/hooks/useLeadCount";

interface NavItem {
  href: string;
  label: string;
  icon: any;
  accent?: boolean;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const primaryNavItems: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/leads", label: "Leads", icon: Headphones, accent: true },
  { href: "/admin/clientes", label: "Clientes", icon: Users },
  { href: "/admin/projetos", label: "Projetos", icon: FolderKanban },
  { href: "/admin/contratos", label: "Contratos", icon: FileSignature },
  { href: "/admin/financeiro", label: "Financeiro", icon: DollarSign, accent: true },
];

const navGroups: NavGroup[] = [
  {
    title: "Operacoes",
    items: [
      { href: "/admin/pedidos", label: "Pedidos", icon: ShoppingCart },
      { href: "/admin/briefings", label: "Briefings", icon: ClipboardList },
      { href: "/admin/suporte", label: "Suporte", icon: Headphones },
    ],
  },
  {
    title: "Gestao",
    items: [
      { href: "/admin/extras", label: "Extras", icon: Puzzle, accent: true },
      { href: "/admin/clausulas", label: "Clausulas", icon: BookText },
      { href: "/admin/recurrent-extras", label: "Extras Recorrentes", icon: CalendarDays },
      { href: "/admin/usuarios", label: "Usuarios", icon: UserCog },
      { href: "/admin/revenda", label: "Revenda", icon: Users },
    ],
  },
  {
    title: "Sistema",
    items: [
      { href: "/admin/relatorios", label: "Analytics", icon: BarChart3 },
      { href: "/admin/custos-sistema", label: "Custos", icon: ServerCog },
      { href: "/admin/configuracoes", label: "Ajustes", icon: Settings },
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
  const { counts, refreshCounts } = useAdminStore();

  const favoriteRoutes = useMemo(
    () => getFavoriteAdminRoutes().filter((route) => route.href !== pathname && canAccessPath(route.href)).slice(0, 3),
    [canAccessPath, pathname],
  );

  useEffect(() => {
    refreshCounts();
  }, [pathname, refreshCounts]);

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

  const renderNavItem = (item: NavItem, variant: "primary" | "secondary" = "secondary") => {
    const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
    const badgeCount = getItemCount(item.href);

    return (
      <Link
        key={item.href}
        to={item.href}
        className={cn(
          "group relative flex items-center rounded-[14px] py-3 text-[13px] font-medium transition-all",
          isCollapsed ? "justify-center px-2" : "gap-4 px-4",
          variant === "primary" && !isCollapsed && "py-3.5",
          isActive
            ? "border-brand-subtle text-[var(--admin-text)] shadow-[0_10px_30px_rgba(0,0,0,0.18)] scale-[1.02]"
            : "text-[var(--admin-muted)] hover:bg-[rgba(255,255,255,0.04)] hover:text-[var(--admin-text)]",
          !isActive && item.accent && "text-[var(--admin-tone-success)] hover:bg-[rgba(236,72,153,0.08)]",
        )}
        style={
          isActive
            ? {
                background:
                  "linear-gradient(135deg, rgba(220, 38, 38, 0.14), rgba(107, 33, 168, 0.18), rgba(236, 72, 153, 0.12))",
              }
            : undefined
        }
        aria-current={isActive ? "page" : undefined}
      >
        {isActive && (
          <motion.div
            layoutId="adminNavIndicator"
            className="absolute left-0 h-5 w-1 rounded-r-full"
            style={{ background: "var(--gradient-primary)" }}
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
          />
        )}

        <item.icon
          className={cn(
            "h-5 w-5 shrink-0 transition-all duration-300",
            isActive
              ? "text-[var(--admin-tone-primary)]"
              : item.accent
                ? "text-[var(--admin-tone-success)]"
                : "text-[var(--admin-muted)] group-hover:scale-110 group-hover:text-[var(--admin-text)]",
          )}
        />

        {!isCollapsed && (
          <span className={cn("truncate", variant === "primary" ? "admin-nav-copy text-[0.76rem]" : "text-[13px] font-medium tracking-tight")}>
            {item.label}
          </span>
        )}

        {!isCollapsed && badgeCount > 0 && (
          <span
            className={cn(
              "ml-auto rounded-full px-2 py-0.5 text-[9px] font-black transition-all",
              isActive ? "bg-[rgba(255,255,255,0.08)] text-[#F0E8FF]" : "bg-brand-gradient text-white shadow-[0_0_10px_rgba(124,58,237,0.3)]",
            )}
          >
            {badgeCount}
          </span>
        )}
      </Link>
    );
  };

  return (
    <motion.aside
      animate={{ width: isCollapsed ? 80 : 280 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="relative z-50 hidden h-screen shrink-0 md:flex md:flex-col glass-sidebar-admin"
    >
      <div
        className="absolute top-0 right-0 h-full w-[1px] opacity-20"
        style={{ background: "linear-gradient(180deg, rgba(236,72,153,0.9), rgba(107,33,168,0.55), transparent 72%)" }}
      />

      <button
        onClick={onToggle}
        className="absolute -right-3 top-24 z-50 flex h-6 w-6 items-center justify-center rounded-full shadow-lg shadow-black/30 transition-all hover:scale-110 active:scale-95"
        style={{
          background: "rgba(21, 0, 34, 0.96)",
          border: "1px solid rgba(236, 72, 153, 0.24)",
          color: "#F0E8FF",
        }}
        aria-label={isCollapsed ? "Expandir" : "Recolher"}
      >
        {isCollapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>

      <div
        className={cn("flex items-center border-b py-8", isCollapsed ? "justify-center px-0" : "gap-4 px-6")}
        style={{ borderColor: "rgba(249, 168, 212, 0.14)" }}
      >
        <Link to="/admin" className="group flex items-center gap-3">
          <div className="relative">
            <div className="absolute -inset-3 rounded-2xl bg-brand-gradient opacity-0 blur-2xl transition-opacity duration-700 group-hover:opacity-40" />
            <div className="relative flex h-11 w-11 items-center justify-center rounded-[14px] border border-[var(--admin-border-color)] bg-[rgba(255,255,255,0.04)] shadow-[0_12px_30px_rgba(0,0,0,0.25)]">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
          </div>
          {!isCollapsed && (
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
              <p className="admin-brand-title leading-none text-[var(--admin-text)]">{branding.nome || "NovaesWeb"}</p>
              <p className="admin-kicker mt-1.5 text-[var(--admin-muted)]">Painel Administrativo</p>
            </motion.div>
          )}
        </Link>
      </div>

      <nav className="custom-scrollbar flex-1 space-y-6 overflow-y-auto px-4 py-6" role="navigation">
        <div>
          {!isCollapsed && (
              <p className="admin-kicker mb-3 px-4 text-[#F0E8FF]/55">
                Principal
              </p>
            )}
          <div className="space-y-1.5">
            {primaryNavItems.filter((item) => canAccessPath(item.href)).map((item) => renderNavItem(item, "primary"))}
          </div>
        </div>

        {navGroups.map((group) => (
          <div key={group.title}>
            {!isCollapsed && (
              <p className="admin-kicker mb-3 px-4 italic text-[var(--admin-muted)]">
                {group.title}
              </p>
            )}

            <div className="space-y-1">
              {group.items.filter((item) => canAccessPath(item.href)).map((item) => renderNavItem(item))}
            </div>
          </div>
        ))}

        {!isCollapsed && favoriteRoutes.length > 0 && (
          <div className="pt-2">
            <p className="mb-3 px-4 text-[9px] font-black uppercase tracking-[0.3em] text-[var(--admin-muted)]">
              Atalhos
            </p>
            <div className="flex flex-wrap gap-2 px-4">
              {favoriteRoutes.map((route) => (
                <Link
                  key={route.href}
                  to={route.href}
                  className="rounded-[14px] border border-[var(--admin-border-color)] bg-[rgba(255,255,255,0.04)] px-4 py-2 text-[11px] font-bold text-[var(--admin-muted)] transition-all hover:border-[#7C3AED]/50 hover:text-[var(--admin-text)]"
                >
                  {route.shortLabel || route.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>

      <div className={cn("border-t p-4", isCollapsed && "px-2")} style={{ borderColor: "rgba(124, 58, 237, 0.14)" }}>
        <button
          onClick={handleLogout}
          className={cn(
            "group flex w-full items-center rounded-[14px] py-3 text-xs font-bold uppercase tracking-widest text-[var(--admin-muted)] transition-all hover:bg-[rgba(220,38,38,0.08)] hover:text-[#FCA5A5]",
            isCollapsed ? "justify-center px-2" : "gap-4 px-4",
          )}
        >
          <LogOut size={18} className="shrink-0 transition-transform group-hover:translate-x-1" />
          {!isCollapsed && <span>Terminar Sessao</span>}
        </button>
      </div>
    </motion.aside>
  );
}
