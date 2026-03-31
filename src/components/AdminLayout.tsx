import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import TopProgressBar from "@/components/TopProgressBar";
import { SupabaseHeartbeat } from "./SupabaseHeartbeat";
import { ReloadPrompt } from "./ReloadPrompt";
import { useBranding } from "@/hooks/useBranding";
import { useUI } from "@/store";
import { useLeadCount } from "@/hooks/useLeadCount";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import {
  Menu, LayoutDashboard, Users, FolderKanban, ShoppingCart,
  BarChart3, DollarSign, Headphones, UserCog, Settings,
  LogOut, CalendarDays, Puzzle, ShieldCheck, Sparkles, TrendingUp
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
    ],
  },
  {
    title: "Operações",
    items: [
      { href: "/admin/pedidos", label: "Pedidos", icon: ShoppingCart },
      { href: "/admin/agenda", label: "Agenda", icon: CalendarDays },
      { href: "/admin/extras", label: "Extras", icon: Puzzle },
      { href: "/admin/recurrent-billing", label: "Cobranças Recorrentes", icon: TrendingUp },
    ],
  },
  {
    title: "Gestão",
    items: [
      { href: "/admin/financeiro", label: "Financeiro", icon: DollarSign },
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

function MobileSidebar({ branding, onClose }: { branding: { logo: string; nome: string }; onClose: () => void }) {
  const { pathname } = useLocation();
  const leadCount = useLeadCount();

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
            <p className="text-sm font-extrabold tracking-tight text-foreground leading-none">NovaesWeb</p>
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
              {group.items.map((item) => {
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

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const { sidebarCollapsed, setSidebarCollapsed } = useUI();
  const branding = useBranding();

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
        <SheetTrigger asChild className="md:hidden fixed top-4 left-4 z-50">
          <Button variant="ghost" size="icon" className="rounded-xl"
            style={{ background: 'hsl(var(--secondary))', border: '1px solid hsl(var(--border))' }}>
            <Menu className="w-5 h-5" />
          </Button>
        </SheetTrigger>
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
          {children}
        </AdminMainContent>
      </main>
      
      <ReloadPrompt />
    </div>
  );
}
