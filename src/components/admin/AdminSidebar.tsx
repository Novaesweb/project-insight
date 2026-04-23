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
      animate={{ width: isCollapsed ? 72 : 264 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="hidden md:flex md:flex-col relative z-50 shrink-0 h-screen"
      style={{
        background: "linear-gradient(180deg, rgba(8, 0, 15, 0.8) 0%, rgba(15, 0, 24, 0.9) 100%)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderRight: "1px solid rgba(255, 255, 255, 0.05)",
      }}
    >
      <div
        className="absolute top-0 left-0 w-[1px] h-full opacity-30"
        style={{ background: "linear-gradient(180deg, hsl(var(--primary)), transparent 60%)" }}
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
              className="absolute -inset-2 rounded-xl blur-xl opacity-40 group-hover:opacity-70 transition-opacity duration-500"
              style={{ background: "var(--admin-gradient)" }}
            />
            <div
              className="rounded-xl flex items-center justify-center relative w-10 h-10 border border-white/10"
              style={{ background: "var(--admin-gradient)", boxShadow: "inset 0 2px 10px rgba(255,255,255,0.2)" }}
            >
              <Sparkles className="w-5 h-5 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
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
                      "group flex items-center py-2.5 text-[12px] font-medium transition-all relative rounded-xl",
                      item.isSubItem
                        ? "ml-7 gap-2 px-3 py-2 text-[11px]"
                        : isCollapsed
                          ? "justify-center px-2"
                          : "gap-3 px-3",
                      isActive
                        ? "text-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/50",
                      item.accent && !isActive && "text-amber-400/60 hover:text-amber-400"
                    )}
                    style={isActive ? {
                      background: "rgba(255, 255, 255, 0.05)",
                      boxShadow: "0 0 0 1px rgba(255, 255, 255, 0.08)",
                      backdropFilter: "blur(10px)",
                    } : undefined}
                    aria-current={isActive ? "page" : undefined}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeNavBackground"
                        className="absolute inset-x-2 inset-y-1 rounded-xl -z-10"
                        style={{ 
                          background: "rgba(124, 58, 237, 0.08)",
                          border: "1px solid rgba(124, 58, 237, 0.15)",
                          boxShadow: "0 0 20px -5px rgba(124, 58, 237, 0.2)"
                        }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                    {isActive && (
                      <motion.div
                        layoutId="adminNavIndicator"
                        className={cn(
                          "absolute w-[2px] rounded-r-full left-0",
                          item.isSubItem ? "h-3" : "h-5"
                        )}
                        style={{ background: "var(--admin-gradient)" }}
                        transition={{ type: "spring", stiffness: 350, damping: 30 }}
                      />
                    )}
                    {item.isSubItem ? (
                      <span
                        className={cn(
                          "h-1.5 w-1.5 shrink-0 rounded-full transition-all duration-200",
                          isActive ? "bg-primary" : "bg-white/30 group-hover:bg-white/60"
                        )}
                      />
                    ) : item.icon ? (
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
                    ) : null}
                    {!isCollapsed && <span className="truncate">{item.label}</span>}
                    {!isCollapsed && !item.isSubItem && badgeCount > 0 && (
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
