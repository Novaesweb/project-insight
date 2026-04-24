import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
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
  Menu, LayoutDashboard, Users, FolderKanban, ShoppingCart,
  BarChart3, DollarSign, Headphones, UserCog, Settings,
  LogOut, CalendarDays, Puzzle, Sparkles, ArrowLeft, LockKeyhole, ServerCog, ClipboardList, FileSignature
} from "lucide-react";
import AdminSidebar from "./admin/AdminSidebar";
import AdminHeader from "./admin/AdminHeader";
import AdminMainContent from "./admin/AdminMainContent";

const mobileNavGroups = [
  {
    title: "Principal",
    items: [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
      { href: "/admin/clientes", label: "Clientes", icon: Users },
      { href: "/admin/leads", label: "Leads", icon: Headphones, showCount: true },
      { href: "/admin/projetos", label: "Projetos", icon: FolderKanban },
      { href: "/admin/projetos/lista", label: "Lista de Projetos", isSubItem: true },
      { href: "/admin/projetos/kanban", label: "Quadro Kanban", isSubItem: true },
      { href: "/admin/contratos", label: "Contratos", icon: FileSignature },
    ],
  },
  {
    title: "Operações",
    items: [
      { href: "/admin/pedidos", label: "Pedidos", icon: ShoppingCart },
      { href: "/admin/extras", label: "Extras", icon: Puzzle },
      { href: "/admin/recurrent-extras", label: "Extras Recorrentes", icon: CalendarDays },
    ],
  },
  {
    title: "Gestão",
    items: [
      { href: "/admin/financeiro", label: "Financeiro", icon: DollarSign },
      { href: "/admin/custos-sistema", label: "Custos do Sistema", icon: ServerCog },
      { href: "/admin/relatorios", label: "Relatórios", icon: BarChart3 },
      { href: "/admin/briefings", label: "Briefings", icon: ClipboardList },
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

const mobileDockItems = [
  { href: "/admin", label: "Início", icon: LayoutDashboard },
  { href: "/admin/leads", label: "Leads", icon: Headphones },
  { href: "/admin/contratos", label: "Contratos", icon: FileSignature },
  { href: "/admin/financeiro", label: "Financeiro", icon: DollarSign },
  { href: "/admin/projetos", label: "Projetos", icon: FolderKanban },
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
    <div className="flex flex-col h-full" style={{ background: 'hsl(var(--background))' }}>
      {/* Logo */}
      <div className="py-5 px-5 flex items-center gap-3 border-b" style={{ borderColor: 'hsl(var(--border))' }}>
        <Link to="/admin" onClick={onClose} className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'var(--gradient-primary)' }}>
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-extrabold tracking-tight text-foreground leading-none">{branding.nome || "NovaesWeb"}</p>
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground mt-0.5">Admin Panel</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-4">
        {mobileNavGroups.map((group) => (
          <div key={group.title}>
            <p className="text-[9px] font-bold uppercase tracking-[0.25em] px-3 mb-2 text-muted-foreground/50">
              {group.title}
            </p>
            <div className="space-y-0.5">
              {group.items.filter((item) => canAccessPath(item.href)).map((item) => {
                const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-3 py-2.5 px-3 text-[13px] font-medium transition-all rounded-xl",
                      item.isSubItem && "ml-7 py-2 text-[12px]",
                      isActive
                        ? "text-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                    )}
                    style={isActive ? {
                      background: 'hsl(var(--secondary))',
                      boxShadow: '0 0 0 1px hsl(var(--border))',
                    } : undefined}
                  >
                    {item.icon ? (
                      <item.icon className={cn(
                        "w-4 h-4 shrink-0",
                        isActive ? "text-primary" : "text-muted-foreground/60"
                      )} />
                    ) : (
                      <span
                        className={cn(
                          "h-1.5 w-1.5 shrink-0 rounded-full",
                          isActive ? "bg-primary" : "bg-muted-foreground/50"
                        )}
                      />
                    )}
                    <span>{item.label}</span>
                    {item.showCount && leadCount > 0 && (
                      <span className="ml-auto px-1.5 py-0.5 rounded-full text-[9px] font-bold text-white"
                        style={{ background: 'hsl(var(--primary))' }}>
                        {leadCount}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

        <div className="pt-4 border-t" style={{ borderColor: "hsl(var(--border))" }}>
          <p className="text-[9px] font-bold uppercase tracking-[0.25em] px-3 mb-2 text-muted-foreground/50">
            Atalhos
          </p>
          <div className="flex flex-wrap gap-2 px-3">
            {favoriteRoutes.map((route) => (
              <Link
                key={route.href}
                to={route.href}
                onClick={onClose}
                className="px-3 py-2 rounded-xl text-[11px] font-semibold"
                style={{
                  background: "hsl(var(--secondary))",
                  border: "1px solid hsl(var(--border))",
                  color: "hsl(var(--foreground))",
                }}
              >
                {route.label}
              </Link>
            ))}
          </div>
        </div>

        {recentRoutes.length > 0 && (
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.25em] px-3 mb-2 text-muted-foreground/50">
              Recentes
            </p>
            <div className="space-y-1 px-3">
              {recentRoutes.map((route) => (
                <Link
                  key={route.href}
                  to={route.href}
                  onClick={onClose}
                  className="flex items-center justify-between px-3 py-2 rounded-xl text-[12px] font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                >
                  <span>{route.label}</span>
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground/50">Abrir</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t" style={{ borderColor: 'hsl(var(--border))' }}>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 py-2.5 px-3 text-xs font-medium text-muted-foreground hover:text-destructive transition-all w-full rounded-xl hover:bg-destructive/5"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span>Sair</span>
        </button>
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
      return (
        <div className="min-h-[80vh] flex items-center justify-center">
          <div className="text-center space-y-6">
            <div className="relative w-20 h-20 mx-auto">
              <div className="absolute inset-0 rounded-full border-2 border-[#7C3AED]/10 animate-ping" />
              <div className="relative flex items-center justify-center w-20 h-20 rounded-full bg-brand-gradient shadow-[0_0_30px_rgba(124,58,237,0.2)]">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-xl font-light text-[var(--admin-text)] tracking-widest uppercase" style={{ fontFamily: "'Playfair Display', serif" }}>
                Validando <span className="text-brand-gradient italic">Credenciais</span>
              </p>
              <p className="text-[10px] font-bold text-[var(--admin-muted)] uppercase tracking-[0.3em]">Preparando ecossistema premium...</p>
            </div>
          </div>
        </div>
      );
    }

    if (!canAccessPath(pathname)) {
      return (
        <div className="min-h-[80vh] flex items-center justify-center p-4">
          <div className="max-w-lg w-full glass-card-admin p-10 text-center rounded-[40px]">
            <div className="mx-auto w-20 h-20 rounded-[28px] bg-[rgba(124,58,237,0.12)] border border-[rgba(124,58,237,0.22)] flex items-center justify-center mb-8">
              <LockKeyhole size={36} className="text-[#7C3AED]" />
            </div>
            <p className="text-[10px] uppercase tracking-[0.4em] font-black text-[#EC4899] mb-4">Acesso Reservado</p>
            <h2 className="text-3xl font-light text-[var(--admin-text)] leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
              Este módulo pertence a outro <span className="text-brand-gradient italic">nível de acesso</span>.
            </h2>
            <p className="text-sm text-[var(--admin-muted)] mt-6 leading-relaxed px-4">
              As permissões de segurança da NovaesWeb são rigorosas. Se você acredita que isto é um erro, consulte a governança do sistema.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-10 justify-center">
              <Button asChild className="h-12 rounded-2xl border-0 bg-brand-gradient text-white font-bold uppercase tracking-widest text-[10px] px-8 hover:scale-[1.02] transition-all">
                <Link to="/admin">
                  <ArrowLeft className="w-4 h-4 mr-2" />
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
    <div className="flex h-screen admin-premium-bg text-[var(--admin-text)] font-sora selection:bg-primary/30 overflow-hidden relative">
      <div className="fixed inset-0 pointer-events-none ambient-glow opacity-20" />

      
      {/* Desktop Sidebar */}
      {/* Atmospheric Glow Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px] animate-pulse" />
        <div className="absolute top-[20%] -right-[10%] w-[30%] h-[30%] rounded-full bg-accent/5 blur-[100px]" />
      </div>

      <AdminSidebar
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        branding={branding}
      />

      {/* Mobile Sidebar */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-72 p-0 overflow-hidden"
          style={{ background: 'hsl(var(--background))', borderRight: '1px solid hsl(var(--border))', color: 'var(--admin-text)' }}>
          <div className="h-full flex flex-col">
            <MobileSidebar branding={branding} onClose={() => setOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>

      {/* Main Area */}
      <main className="flex-1 relative flex flex-col min-w-0">
        <TopProgressBar />
        <AdminHeader />
        <AdminMainContent pathname={pathname}>
          {renderMainContent()}
        </AdminMainContent>
      </main>

      <div className="md:hidden fixed bottom-4 left-3 right-3 z-50">
        <div
          className="grid grid-cols-5 gap-1 p-1.5 rounded-[1.35rem] backdrop-blur-xl shadow-2xl"
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
                style={isActive ? {
                  background: "hsl(var(--secondary))",
                  color: "hsl(var(--foreground))",
                  boxShadow: "0 0 0 1px hsl(var(--border))",
                } : {
                  color: "hsl(var(--muted-foreground))",
                }}
              >
                <item.icon className="w-4 h-4" />
                <span className="text-[10px] font-semibold">{item.label}</span>
              </Link>
            );
          })}

          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex flex-col items-center justify-center gap-1 rounded-[1rem] px-2 py-2.5 text-muted-foreground transition-all hover:text-foreground hover:bg-secondary/60"
          >
            <Menu className="w-4 h-4" />
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
