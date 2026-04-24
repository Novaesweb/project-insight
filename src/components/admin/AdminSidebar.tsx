import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
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
import { getFavoriteAdminRoutes, getRecentAdminRoutes } from "@/lib/admin-navigation";
import { useAdminStore } from "@/features/admin/store/admin-store";
import { useLeadCount } from "@/hooks/useLeadCount";

interface NavGroup {
  title: string;
  items: { href: string; label: string; icon?: any; accent?: boolean; isSubItem?: boolean }[];
}

const navGroups: NavGroup[] = [
  {
    title: "Principal",
    items: [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
      { href: "/admin/clientes", label: "Clientes", icon: Users },
      { href: "/admin/leads", label: "Leads", icon: Headphones },
      { href: "/admin/leads/lista", label: "Gestão de Base", isSubItem: true },
      { href: "/admin/projetos", label: "Projetos", icon: FolderKanban },
      { href: "/admin/projetos/lista", label: "Lista de Projetos", isSubItem: true },
      { href: "/admin/projetos/kanban", label: "Quadro Kanban", isSubItem: true },
      { href: "/admin/contratos", label: "Contratos", icon: FileSignature },
      { href: "/admin/clausulas", label: "Cláusulas", icon: BookText },
    ],
  },
  {
    title: "Operações",
    items: [
      { href: "/admin/pedidos", label: "Pedidos", icon: ShoppingCart },
      { href: "/admin/extras", label: "Extras", icon: Puzzle, accent: true },
      { href: "/admin/extras/lista", label: "Catálogo de Itens", isSubItem: true },
      { href: "/admin/recurrent-extras", label: "Extras Recorrentes", icon: CalendarDays },
    ],
  },
  {
    title: "Gestão",
    items: [
      { href: "/admin/financeiro", label: "Financeiro", icon: DollarSign, accent: true },
      { href: "/admin/financeiro/lista", label: "Gestão de Faturas", isSubItem: true },
      { href: "/admin/custos-sistema", label: "Custos do Sistema", icon: ServerCog },
      { href: "/admin/relatorios", label: "Relatórios", icon: BarChart3 },
      { href: "/admin/briefings", label: "Briefings", icon: ClipboardList },
      { href: "/admin/briefings/em-andamento", label: "Briefings em andamento", isSubItem: true },
      { href: "/admin/briefings/biblioteca", label: "Biblioteca de perguntas prontas", isSubItem: true },
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
  const { counts, refreshCounts } = useAdminStore();

  const favoriteRoutes = useMemo(
    () => getFavoriteAdminRoutes().filter((route) => route.href !== pathname && canAccessPath(route.href)).slice(0, 3),
    [canAccessPath, pathname]
  );

  useEffect(() => {
    setRecentRoutes(getRecentAdminRoutes().filter((route) => route.href !== pathname && canAccessPath(route.href)).slice(0, 3));
  }, [canAccessPath, pathname]);

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

  return (
    <motion.aside
      animate={{ width: isCollapsed ? 80 : 280 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="hidden md:flex md:flex-col relative z-50 shrink-0 h-screen glass-sidebar-admin"
    >
      {/* Brand Border Shimmer */}
      <div
        className="absolute top-0 right-0 w-[1px] h-full opacity-20"
        style={{ background: "linear-gradient(180deg, #7C3AED, transparent 70%)" }}
      />

      <button
        onClick={onToggle}
        className="absolute -right-3 top-24 w-6 h-6 rounded-full flex items-center justify-center z-50 transition-all hover:scale-110 active:scale-95 shadow-lg shadow-black/30"
        style={{
          background: "rgba(21, 0, 34, 0.96)",
          border: "1px solid rgba(124, 58, 237, 0.3)",
          color: "#F0E8FF",
        }}
        aria-label={isCollapsed ? "Expandir" : "Recolher"}
      >
        {isCollapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>

      {/* Logo Section */}
      <div
        className={cn("py-8 flex items-center border-b", isCollapsed ? "px-0 justify-center" : "px-6 gap-4")}
        style={{ borderColor: "rgba(124, 58, 237, 0.14)" }}
      >
        <Link to="/admin" className="flex items-center gap-3 group">
          <div className="relative">
            <div
              className="absolute -inset-3 rounded-2xl blur-2xl opacity-0 group-hover:opacity-40 transition-opacity duration-700 bg-brand-gradient"
            />
            <div
              className="rounded-xl flex items-center justify-center relative w-11 h-11 border border-[rgba(124,58,237,0.22)] bg-[rgba(255,255,255,0.04)] shadow-[0_12px_30px_rgba(0,0,0,0.25)]"
            >
              <Sparkles className="w-6 h-6 text-white" />
            </div>
          </div>
          {!isCollapsed && (
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
              <p className="text-lg font-light tracking-tight text-[var(--admin-text)] leading-none" style={{ fontFamily: "'Playfair Display', serif" }}>
                Novaes<span className="text-[#EC4899] italic font-bold">Web</span>
              </p>
              <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-[var(--admin-muted)] mt-1.5">Premium Admin</p>
            </motion.div>
          )}
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-6 custom-scrollbar" role="navigation">
        {navGroups.map((group) => (
          <div key={group.title}>
            {!isCollapsed && (
              <p className="text-[9px] font-black uppercase tracking-[0.3em] px-4 mb-3 text-[var(--admin-muted)] italic">
                {group.title}
              </p>
            )}

            <div className="space-y-1">
              {group.items
                .filter((item) => item.href !== "/admin/extras/lista")
                .filter((item) => canAccessPath(item.href))
                .filter((item) => !isCollapsed || !item.isSubItem)
                .map((item) => {
                const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
                const badgeCount = getItemCount(item.href);

                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={cn(
                      "group flex items-center py-3 text-[13px] font-medium transition-all relative rounded-2xl",
                      item.isSubItem
                        ? "ml-8 gap-3 px-4 py-2.5 text-[11px]"
                        : isCollapsed
                          ? "justify-center px-2"
                          : "gap-4 px-4",
                      isActive
                        ? "bg-[rgba(124,58,237,0.18)] border-brand-subtle shadow-[0_10px_30px_rgba(0,0,0,0.16)] scale-[1.02]"
                        : "text-[var(--admin-muted)] hover:text-[var(--admin-text)] hover:bg-[rgba(255,255,255,0.04)]",
                      isActive ? "text-[var(--admin-text)]" : item.accent && "text-[#F9A8D4] hover:bg-[rgba(236,72,153,0.08)]"
                    )}
                    aria-current={isActive ? "page" : undefined}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="adminNavIndicator"
                        className={cn(
                          "absolute w-1 rounded-r-full left-0",
                          item.isSubItem ? "h-3" : "h-5"
                        )}
                        style={{ background: "var(--gradient-primary)" }}
                        transition={{ type: "spring", stiffness: 350, damping: 30 }}
                      />
                    )}
                    {item.isSubItem ? (
                      <span
                        className={cn(
                          "h-1.5 w-1.5 shrink-0 rounded-full transition-all duration-300",
                          isActive ? "bg-[#F0E8FF] shadow-[0_0_10px_rgba(240,232,255,0.45)]" : "bg-[rgba(155,137,184,0.55)] group-hover:bg-[#C4B5FD]"
                        )}
                      />
                    ) : item.icon ? (
                      <item.icon
                        className={cn(
                          "w-5 h-5 shrink-0 transition-all duration-300",
                          isActive
                            ? "text-[#C4B5FD]"
                            : item.accent
                              ? "text-[#F472B6]"
                              : "text-[var(--admin-muted)] group-hover:text-[var(--admin-text)] group-hover:scale-110"
                        )}
                      />
                    ) : null}
                    {!isCollapsed && <span className="truncate tracking-tight">{item.label}</span>}
                    {!isCollapsed && !item.isSubItem && badgeCount > 0 && (
                      <span
                        className={cn(
                          "ml-auto px-2 py-0.5 rounded-full text-[9px] font-black transition-all",
                          isActive ? "bg-[rgba(255,255,255,0.08)] text-[#F0E8FF]" : "bg-brand-gradient text-white shadow-[0_0_10px_rgba(124,58,237,0.3)]"
                        )}
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
          <div className="pt-2">
            <p className="text-[9px] font-black uppercase tracking-[0.3em] px-4 mb-3 text-[var(--admin-muted)]">
              Atalhos Elite
            </p>
            <div className="flex flex-wrap gap-2 px-4">
              {favoriteRoutes.map((route) => (
                <Link
                  key={route.href}
                  to={route.href}
                  className="rounded-xl px-4 py-2 text-[11px] font-bold text-[var(--admin-muted)] transition-all hover:text-[var(--admin-text)] hover:border-[#7C3AED]/50 border border-[rgba(124,58,237,0.18)] bg-[rgba(255,255,255,0.04)]"
                >
                  {route.shortLabel || route.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>

      <div className={cn("p-4 border-t", isCollapsed && "px-2")} style={{ borderColor: "rgba(124, 58, 237, 0.14)" }}>
        <button
          onClick={handleLogout}
          className={cn(
            "flex items-center py-3 text-xs font-bold uppercase tracking-widest text-[var(--admin-muted)] hover:text-[#FCA5A5] transition-all w-full rounded-2xl hover:bg-[rgba(220,38,38,0.08)] group",
            isCollapsed ? "justify-center px-2" : "gap-4 px-4"
          )}
        >
          <LogOut size={18} className="shrink-0 transition-transform group-hover:translate-x-1" />
          {!isCollapsed && <span>Terminar Sessão</span>}
        </button>
      </div>
    </motion.aside>
  );
}
