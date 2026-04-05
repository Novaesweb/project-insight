import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import TopProgressBar from "@/components/TopProgressBar";
import { SupabaseHeartbeat } from "./SupabaseHeartbeat";
import { ReloadPrompt } from "./ReloadPrompt";
import { useBranding } from "@/hooks/useBranding";
import { useUI } from "@/store";
import { useLeadCount } from "@/hooks/useLeadCount";
import { AdminAccessProvider, useAdminAccess } from "@/hooks/useAdminAccess";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { getFavoriteAdminRoutes, getRecentAdminRoutes, trackAdminRoute } from "@/lib/admin-navigation";
import {
  Menu, LayoutDashboard, Users, FolderKanban, ShoppingCart,
  BarChart3, DollarSign, Headphones, UserCog, Settings,
  LogOut, CalendarDays, Puzzle, ShieldCheck, Sparkles, ArrowLeft, LockKeyhole, ClipboardList, ServerCog
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
      { href: "/admin/checklist-clientes", label: "Checklist Clientes", icon: ClipboardList },
      { href: "/admin/leads", label: "Leads", icon: Headphones, showCount: true },
      { href: "/admin/projetos", label: "Projetos", icon: FolderKanban },
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

const mobileDockItems = [
  { href: "/admin", label: "Início", icon: LayoutDashboard },
  { href: "/admin/leads", label: "Leads", icon: Headphones },
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
                      isActive
                        ? "text-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                    )}
                    style={isActive ? {
                      background: 'hsl(var(--secondary))',
                      boxShadow: '0 0 0 1px hsl(var(--border))',
                    } : undefined}
                  >
                    <item.icon className={cn(
                      "w-4 h-4 shrink-0",
                      isActive ? "text-primary" : "text-muted-foreground/60"
                    )} />
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

  const renderMainContent = () => {
    if (loading) {
      return (
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center space-y-2">
            <p className="text-sm font-semibold text-foreground">Carregando permissões do painel...</p>
            <p className="text-xs text-muted-foreground">Estamos validando o acesso deste usuário para liberar os módulos corretos.</p>
          </div>
        </div>
      );
    }

    if (!canAccessPath(pathname)) {
      return (
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="max-w-lg w-full rounded-[1.75rem] border border-white/10 bg-[var(--admin-surface)] p-7 text-center shadow-2xl">
            <div className="mx-auto w-14 h-14 rounded-2xl border border-white/10 bg-white/[0.03] flex items-center justify-center">
              <LockKeyhole className="w-6 h-6 text-primary" />
            </div>
            <p className="text-[10px] uppercase tracking-[0.28em] font-black text-primary mt-5">Acesso restrito</p>
            <h2 className="text-xl font-black text-foreground mt-2">Esse módulo não está liberado para o seu perfil.</h2>
            <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
              As permissões do admin foram centralizadas. Se você precisa acessar essa área, ajuste a matriz de segurança em configurações.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mt-6 justify-center">
              <Button asChild className="h-11 rounded-xl border-0 text-white" style={{ background: "var(--gradient-primary)" }}>
                <Link to="/admin">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar ao dashboard
                </Link>
              </Button>
              <Button asChild variant="ghost" className="h-11 rounded-xl border border-white/10 text-foreground hover:bg-white/5">
                <Link to="/admin/configuracoes?tab=permissoes">Revisar permissões</Link>
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return children;
  };

  return (
    <div className="flex h-screen text-foreground font-sora selection:bg-primary/30 overflow-hidden"
      style={{ background: 'hsl(var(--background))' }}>
      
      {/* Desktop Sidebar */}
      <AdminSidebar
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        branding={branding}
      />

      {/* Mobile Sidebar */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-72 p-0 overflow-hidden"
          style={{ background: 'hsl(var(--background))', borderRight: '1px solid hsl(var(--border))' }}>
          <div className="h-full flex flex-col">
            <MobileSidebar branding={branding} onClose={() => setOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>

      {/* Main Area */}
      <main className="flex-1 relative flex flex-col min-w-0">
        <SupabaseHeartbeat />
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
            background: "hsl(var(--background) / 0.92)",
            border: "1px solid hsl(var(--border))",
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
