import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import TopProgressBar from "@/components/TopProgressBar";
import { ReloadPrompt } from "./ReloadPrompt";
import { useBranding } from "@/hooks/useBranding";
import { useUI } from "@/store";
import { useLeadCount } from "@/hooks/useLeadCount";
import { AdminAccessProvider, useAdminAccess } from "@/hooks/useAdminAccess";
import { supabase } from "@/integrations/supabase/client";
import { refreshAdminSessionSilently } from "@/lib/admin-function-client";
import { cn } from "@/lib/utils";
import { getFavoriteAdminRoutes, getRecentAdminRoutes, trackAdminRoute } from "@/lib/admin-navigation";
import {
  Menu,
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
  CalendarDays,
  Puzzle,
  Sparkles,
  ArrowLeft,
  LockKeyhole,
  ServerCog,
  ClipboardList,
  FileSignature,
  BookText,
} from "lucide-react";

import AdminSidebar from "./admin/AdminSidebar";
import AdminHeader from "./admin/AdminHeader";
import AdminMainContent from "./admin/AdminMainContent";

const mobileNavGroups = [
  {
    title: "Essencial",
    items: [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
      { href: "/admin/leads", label: "Leads", icon: Headphones, showCount: true },
      { href: "/admin/clientes", label: "Clientes", icon: Users },
      { href: "/admin/projetos", label: "Projetos", icon: FolderKanban },
      { href: "/admin/contratos", label: "Contratos", icon: FileSignature },
      { href: "/admin/financeiro", label: "Financeiro", icon: DollarSign },
    ],
  },
  {
    title: "Operacao",
    items: [
      { href: "/admin/pedidos", label: "Pedidos", icon: ShoppingCart },
      { href: "/admin/briefings", label: "Briefings", icon: ClipboardList },
      { href: "/admin/suporte", label: "Suporte", icon: Headphones },
    ],
  },
  {
    title: "Catalogo",
    items: [
      { href: "/admin/extras", label: "Extras", icon: Puzzle },
      { href: "/admin/clausulas", label: "Clausulas", icon: BookText },
      { href: "/admin/recurrent-extras", label: "Extras Recorrentes", icon: CalendarDays },
    ],
  },
  {
    title: "Sistema",
    items: [
      { href: "/admin/relatorios", label: "Analytics", icon: BarChart3 },
      { href: "/admin/custos-sistema", label: "Custos", icon: ServerCog },
      { href: "/admin/usuarios", label: "Usuarios", icon: UserCog },
      { href: "/admin/revenda", label: "Revenda", icon: Users },
    ],
  },
  {
    title: "Configuracoes",
    items: [{ href: "/admin/configuracoes", label: "Ajustes", icon: Settings }],
  },
];

const mobileDockItems = [
  { href: "/admin", label: "Inicio", icon: LayoutDashboard },
  { href: "/admin/leads", label: "Leads", icon: Headphones },
  { href: "/admin/contratos", label: "Contratos", icon: FileSignature },
  { href: "/admin/financeiro", label: "Financeiro", icon: DollarSign },
];

function MobileSidebar({ branding, onClose }: { branding: { logo: string; nome: string }; onClose: () => void }) {
  const { pathname } = useLocation();
  const leadCount = useLeadCount();
  const { canAccessPath } = useAdminAccess();
  const recentRoutes = getRecentAdminRoutes().filter((route) => route.href !== pathname && canAccessPath(route.href)).slice(0, 3);
  const favoriteRoutes = getFavoriteAdminRoutes().filter((route) => route.href !== pathname && canAccessPath(route.href)).slice(0, 3);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/admin/login";
  };

  return (
    <div className="flex h-full flex-col bg-[var(--admin-bg)] text-[var(--admin-text)]">
      <div className="flex items-center gap-3 border-b border-[rgba(124,58,237,0.14)] px-5 py-5">
        <Link to="/admin" onClick={onClose} className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: "var(--gradient-primary)" }}>
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="admin-brand-title leading-none text-[var(--admin-text)]">{branding.nome || "NovaesWeb"}</p>
            <p className="admin-kicker mt-1 text-[var(--admin-muted)]">Admin Panel</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 space-y-4 overflow-y-auto px-3 py-4">
        {mobileNavGroups.map((group) => (
          <div key={group.title}>
            <p className="admin-kicker mb-2 px-3 text-[var(--admin-muted-soft)]">{group.title}</p>
            <div className="space-y-0.5">
              {group.items.filter((item) => canAccessPath(item.href)).map((item) => {
                const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));

                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all",
                      isActive ? "text-[var(--admin-text)]" : "text-[var(--admin-muted)] hover:bg-[rgba(255,255,255,0.04)] hover:text-[var(--admin-text)]",
                    )}
                    style={
                      isActive
                        ? {
                            background: "rgba(124,58,237,0.16)",
                            boxShadow: "0 0 0 1px rgba(124,58,237,0.18)",
                          }
                        : undefined
                    }
                  >
                    <item.icon className={cn("h-4 w-4 shrink-0", isActive ? "text-[#C4B5FD]" : "text-[var(--admin-muted)]")} />
                    <span className="admin-nav-copy text-[0.74rem]">{item.label}</span>
                    {item.showCount && leadCount > 0 && (
                      <span className="ml-auto rounded-full bg-brand-gradient px-1.5 py-0.5 text-[9px] font-bold text-white">
                        {leadCount}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

        {favoriteRoutes.length > 0 && (
          <div className="border-t border-[rgba(124,58,237,0.14)] pt-4">
            <p className="admin-kicker mb-2 px-3 text-[var(--admin-muted-soft)]">Atalhos</p>
            <div className="flex flex-wrap gap-2 px-3">
              {favoriteRoutes.map((route) => (
                <Link
                  key={route.href}
                  to={route.href}
                  onClick={onClose}
                  className="rounded-xl border border-[rgba(124,58,237,0.16)] bg-[rgba(255,255,255,0.04)] px-3 py-2 text-[11px] font-semibold text-[var(--admin-text)]"
                >
                  {route.label}
                </Link>
              ))}
            </div>
          </div>
        )}

        {recentRoutes.length > 0 && (
          <div>
            <p className="admin-kicker mb-2 px-3 text-[var(--admin-muted-soft)]">Recentes</p>
            <div className="space-y-1 px-3">
              {recentRoutes.map((route) => (
                <Link
                  key={route.href}
                  to={route.href}
                  onClick={onClose}
                  className="flex items-center justify-between rounded-xl px-3 py-2 text-[12px] font-medium text-[var(--admin-muted)] hover:bg-[rgba(255,255,255,0.04)] hover:text-[var(--admin-text)]"
                >
                  <span>{route.label}</span>
                  <span className="text-[10px] uppercase tracking-widest text-[var(--admin-muted-soft)]">Abrir</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>

      <div className="border-t border-[rgba(124,58,237,0.14)] p-3">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-medium text-[var(--admin-muted)] transition-all hover:bg-[rgba(220,38,38,0.08)] hover:text-[#FCA5A5]"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          <span>Sair</span>
        </button>
      </div>
    </div>
  );
}

function AdminShellLoadingState() {
  return (
    <div className="min-h-[80vh] space-y-8">
      <div className="admin-hero-card p-8 md:p-10">
        <div className="grid gap-8 xl:grid-cols-[1.4fr_0.9fr]">
          <div className="space-y-5">
            <Skeleton className="h-7 w-40 rounded-full bg-white/10" />
            <Skeleton className="h-16 w-full max-w-2xl rounded-[28px] bg-white/10" />
            <Skeleton className="h-5 w-full max-w-xl rounded-full bg-white/10" />
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-24 rounded-[24px] bg-white/10" />
              ))}
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-12 rounded-2xl bg-white/10" />
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-36 rounded-[32px] bg-white/10" />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Skeleton className="h-80 rounded-[32px] bg-white/10 lg:col-span-2" />
        <Skeleton className="h-80 rounded-[32px] bg-white/10" />
      </div>
    </div>
  );
}

function AdminShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const { sidebarCollapsed, setSidebarCollapsed } = useUI();
  const branding = useBranding();
  const { canAccessPath, loading } = useAdminAccess();

  const availableDockItems = mobileDockItems.filter((item) => canAccessPath(item.href));

  useEffect(() => {
    trackAdminRoute(pathname);
  }, [pathname]);

  useEffect(() => {
    document.body.classList.add("admin-premium-active");

    return () => {
      document.body.classList.remove("admin-premium-active");
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const keepSessionAlive = async () => {
      if (cancelled) return;

      try {
        await refreshAdminSessionSilently();
      } catch {
        void 0;
      }
    };

    const interval = window.setInterval(() => {
      void keepSessionAlive();
    }, 4 * 60 * 1000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, []);

  const renderMainContent = () => {
    if (loading) {
      return <AdminShellLoadingState />;
    }

    if (!canAccessPath(pathname)) {
      return (
        <div className="flex min-h-[80vh] items-center justify-center p-4">
          <div className="glass-card-admin w-full max-w-lg rounded-[40px] p-10 text-center">
            <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-[28px] border border-[rgba(124,58,237,0.22)] bg-[rgba(124,58,237,0.12)]">
              <LockKeyhole size={36} className="text-[#7C3AED]" />
            </div>
            <p className="mb-4 text-[10px] font-black uppercase tracking-[0.4em] text-[#EC4899]">Acesso Reservado</p>
            <h2 className="text-3xl font-light leading-tight text-[var(--admin-text)]" style={{ fontFamily: "'Playfair Display', serif" }}>
              Este modulo pertence a outro <span className="text-brand-gradient italic">nivel de acesso</span>.
            </h2>
            <p className="mt-6 px-4 text-sm leading-relaxed text-[var(--admin-muted)]">
              As permissoes de seguranca da NovaesWeb sao rigorosas. Se voce acredita que isto e um erro, consulte a governanca do sistema.
            </p>
            <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
              <Button
                asChild
                className="h-12 rounded-2xl border-0 bg-brand-gradient px-8 text-[10px] font-bold uppercase tracking-widest text-white transition-all hover:scale-[1.02]"
              >
                <Link to="/admin">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Dashboard Principal
                </Link>
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return children;
  };

  return (
    <div className="admin-premium-bg relative flex h-screen overflow-hidden text-[var(--admin-text)] selection:bg-primary/30">
      <div className="ambient-glow pointer-events-none fixed inset-0 opacity-20" />

      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] h-[40%] w-[40%] animate-pulse rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute top-[20%] -right-[10%] h-[30%] w-[30%] rounded-full bg-accent/5 blur-[100px]" />
      </div>

      <AdminSidebar isCollapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} branding={branding} />

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="left"
          className="w-72 overflow-hidden p-0"
          style={{ background: "hsl(var(--background))", borderRight: "1px solid hsl(var(--border))", color: "var(--admin-text)" }}
        >
          <div className="flex h-full flex-col">
            <MobileSidebar branding={branding} onClose={() => setOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>

      <main className="relative flex min-w-0 flex-1 flex-col">
        <TopProgressBar />
        <AdminHeader />
        <AdminMainContent pathname={pathname}>{renderMainContent()}</AdminMainContent>
      </main>

      <div className="fixed bottom-4 left-3 right-3 z-50 md:hidden">
        <div
          className="grid grid-cols-5 gap-1 rounded-[1.35rem] p-1.5 shadow-2xl backdrop-blur-xl"
          style={{
            background: "linear-gradient(180deg, rgba(13,0,24,0.92), rgba(7,0,13,0.95))",
            border: "1px solid rgba(124,58,237,0.18)",
            boxShadow: "0 24px 60px rgba(0,0,0,0.35)",
          }}
        >
          {availableDockItems.slice(0, 4).map((item) => {
            const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                to={item.href}
                className="flex flex-col items-center justify-center gap-1 rounded-[1rem] px-2 py-2.5 transition-all"
                style={
                  isActive
                    ? {
                        background: "hsl(var(--secondary))",
                        color: "hsl(var(--foreground))",
                        boxShadow: "0 0 0 1px hsl(var(--border))",
                      }
                    : {
                        color: "hsl(var(--muted-foreground))",
                      }
                }
              >
                <item.icon className="h-4 w-4" />
                <span className="text-[10px] font-semibold">{item.label}</span>
              </Link>
            );
          })}

          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex flex-col items-center justify-center gap-1 rounded-[1rem] px-2 py-2.5 text-muted-foreground transition-all hover:bg-secondary/60 hover:text-foreground"
          >
            <Menu className="h-4 w-4" />
            <span className="text-[10px] font-semibold">Menu</span>
          </button>
        </div>
      </div>

      <ReloadPrompt />
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAccessProvider>
      <AdminShell>{children}</AdminShell>
    </AdminAccessProvider>
  );
}
