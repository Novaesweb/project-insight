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
  Zap,
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

  const renderNavItem = (item: NavItem, variant: "primary" | "secondary" = "secondary", delay = 0) => {
    const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
    const badgeCount = getItemCount(item.href);

    return (
      <motion.div
        key={item.href}
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      >
        <Link
          to={item.href}
          className={cn(
            "group relative flex items-center rounded-[14px] py-3 text-[13px] font-medium transition-all duration-300",
            isCollapsed ? "justify-center px-2" : "gap-3.5 px-4",
            variant === "primary" && !isCollapsed && "py-3.5",
            isActive
              ? "text-[var(--admin-text)] shadow-[0_10px_30px_rgba(0,0,0,0.22)] scale-[1.01]"
              : "text-[var(--admin-muted)] hover:bg-[rgba(255,255,255,0.04)] hover:text-[var(--admin-text)]",
            !isActive && item.accent && "text-[var(--admin-tone-success)] hover:bg-[rgba(236,72,153,0.06)]",
          )}
          style={
            isActive
              ? {
                  background:
                    "linear-gradient(135deg, rgba(220, 38, 38, 0.16), rgba(107, 33, 168, 0.20), rgba(236, 72, 153, 0.14))",
                  border: "1px solid rgba(236,72,153,0.15)",
                }
              : undefined
          }
          aria-current={isActive ? "page" : undefined}
        >
          {/* Active indicator bar */}
          {isActive && (
            <motion.div
              layoutId="adminNavIndicator"
              className="absolute left-0 h-6 w-[3px] rounded-r-full"
              style={{ background: "var(--gradient-primary)" }}
              transition={{ type: "spring", stiffness: 400, damping: 32 }}
            />
          )}

          {/* Icon */}
          <div className={cn(
            "relative shrink-0 transition-all duration-300",
            isActive && "drop-shadow-[0_0_8px_rgba(236,72,153,0.5)]"
          )}>
            <item.icon
              className={cn(
                "h-[18px] w-[18px] transition-all duration-300",
                isActive
                  ? "text-[var(--admin-tone-primary)]"
                  : item.accent
                    ? "text-[var(--admin-tone-success)]"
                    : "text-[var(--admin-muted)] group-hover:scale-110 group-hover:text-[var(--admin-text)]",
              )}
            />
          </div>

          {/* Label */}
          {!isCollapsed && (
            <span className={cn(
              "truncate font-semibold tracking-tight",
              variant === "primary" ? "text-[0.8rem]" : "text-[0.78rem]"
            )}>
              {item.label}
            </span>
          )}

          {/* Badge vivo com ping */}
          {!isCollapsed && badgeCount > 0 && (
            <span className="admin-badge-live ml-auto">
              {badgeCount}
            </span>
          )}

          {/* Collapsed badge dot */}
          {isCollapsed && badgeCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2 rounded-full bg-[#EC4899]">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#EC4899] opacity-60" />
            </span>
          )}
        </Link>
      </motion.div>
    );
  };

  return (
    <motion.aside
      animate={{ width: isCollapsed ? 72 : 272 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="relative z-50 hidden h-screen shrink-0 md:flex md:flex-col glass-sidebar-admin"
    >
      {/* Dot-pattern overlay */}
      <div className="admin-dot-bg pointer-events-none absolute inset-0 opacity-100" />

      {/* Right border gradient line */}
      <div
        className="absolute top-0 right-0 h-full w-[1px] opacity-30"
        style={{ background: "linear-gradient(180deg, rgba(236,72,153,0.9) 0%, rgba(107,33,168,0.5) 50%, transparent 100%)" }}
      />

      {/* Ambient glow top */}
      <div
        className="pointer-events-none absolute -top-12 -left-12 h-48 w-48 rounded-full opacity-20"
        style={{ background: "radial-gradient(circle, rgba(124,58,237,0.6), transparent 70%)", animation: "glow-breathe 6s ease-in-out infinite" }}
      />

      {/* Collapse toggle button */}
      <button
        onClick={onToggle}
        className="absolute -right-3.5 top-24 z-50 flex h-7 w-7 items-center justify-center rounded-full transition-all hover:scale-110 active:scale-95"
        style={{
          background: "linear-gradient(135deg, rgba(21, 0, 34, 0.98), rgba(13, 0, 24, 0.98))",
          border: "1px solid rgba(236, 72, 153, 0.30)",
          color: "#F0E8FF",
          boxShadow: "0 4px 16px rgba(0,0,0,0.4), 0 0 0 1px rgba(236,72,153,0.15)",
        }}
        aria-label={isCollapsed ? "Expandir" : "Recolher"}
      >
        {isCollapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
      </button>

      {/* Branding header */}
      <div
        className={cn("relative flex items-center border-b py-7", isCollapsed ? "justify-center px-0" : "gap-3.5 px-5")}
        style={{ borderColor: "rgba(249, 168, 212, 0.12)" }}
      >
        <Link to="/admin" className="group flex items-center gap-3">
          <div className="relative shrink-0">
            <div className="absolute -inset-2 rounded-2xl opacity-0 blur-xl transition-opacity duration-700 group-hover:opacity-60"
              style={{ background: "var(--admin-gradient)" }} />
            <div className="relative flex h-10 w-10 items-center justify-center rounded-[13px] border border-[rgba(236,72,153,0.25)] bg-[rgba(255,255,255,0.05)] shadow-[0_8px_24px_rgba(0,0,0,0.3)]">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
          </div>
          {!isCollapsed && (
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
              <p className="admin-brand-title leading-none text-[var(--admin-text)] font-black">
                {branding.nome || "NovaesWeb"}
              </p>
              <p className="admin-kicker mt-1 text-[var(--admin-muted)]">Painel Administrativo</p>
            </motion.div>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="custom-scrollbar flex-1 space-y-5 overflow-y-auto px-3 py-5" role="navigation">
        {/* Principal */}
        <div>
          {!isCollapsed && (
            <p className="admin-kicker mb-2.5 px-3 text-[#F0E8FF]/40">Principal</p>
          )}
          <div className="space-y-1">
            {primaryNavItems.filter((item) => canAccessPath(item.href)).map((item, i) =>
              renderNavItem(item, "primary", i * 0.04)
            )}
          </div>
        </div>

        {navGroups.map((group, gi) => (
          <div key={group.title}>
            <div className="admin-nav-divider mb-3" />
            {!isCollapsed && (
              <p className="admin-kicker mb-2.5 px-3 italic text-[var(--admin-muted)]/70">
                {group.title}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.filter((item) => canAccessPath(item.href)).map((item, i) =>
                renderNavItem(item, "secondary", (gi + i) * 0.03)
              )}
            </div>
          </div>
        ))}

        {/* Atalhos rápidos */}
        {!isCollapsed && favoriteRoutes.length > 0 && (
          <div className="pt-1">
            <div className="admin-nav-divider mb-3" />
            <p className="mb-2.5 px-3 text-[9px] font-black uppercase tracking-[0.28em] text-[var(--admin-muted)]/60 flex items-center gap-1.5">
              <Zap size={9} className="shrink-0" />
              Atalhos
            </p>
            <div className="flex flex-wrap gap-1.5 px-3">
              {favoriteRoutes.map((route) => (
                <Link
                  key={route.href}
                  to={route.href}
                  className="rounded-[10px] border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-[10px] font-bold text-[var(--admin-muted)] transition-all hover:border-[#7C3AED]/40 hover:bg-[rgba(124,58,237,0.1)] hover:text-[var(--admin-text)]"
                >
                  {route.shortLabel || route.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Footer com avatar */}
      <div
        className={cn("border-t p-3", isCollapsed && "px-2")}
        style={{ borderColor: "rgba(124, 58, 237, 0.12)" }}
      >
        {!isCollapsed ? (
          <div className="flex items-center gap-3 rounded-[14px] border border-white/[0.05] bg-white/[0.03] px-3 py-2.5 transition-all hover:bg-white/[0.05]">
            <div className="relative">
              <div className="admin-user-avatar">NW</div>
              <span className="admin-online-dot absolute -bottom-0.5 -right-0.5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-bold text-[var(--admin-text)] truncate">NovaesWeb</p>
              <p className="text-[9px] text-[var(--admin-muted)] tracking-wide">Admin</p>
            </div>
            <button
              onClick={handleLogout}
              className="group ml-auto rounded-[8px] p-1.5 text-[var(--admin-muted)] transition-all hover:bg-[rgba(220,38,38,0.12)] hover:text-[#FCA5A5]"
              title="Sair"
            >
              <LogOut size={14} className="transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="relative">
              <div className="admin-user-avatar text-[9px]">NW</div>
              <span className="admin-online-dot absolute -bottom-0.5 -right-0.5" />
            </div>
            <button
              onClick={handleLogout}
              className="group rounded-[8px] p-1.5 text-[var(--admin-muted)] transition-all hover:bg-[rgba(220,38,38,0.12)] hover:text-[#FCA5A5]"
              title="Sair"
            >
              <LogOut size={14} className="transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        )}
      </div>
    </motion.aside>
  );
}
