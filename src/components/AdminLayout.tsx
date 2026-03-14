import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Users, FolderKanban, ShoppingCart, Plus,
  BarChart3, DollarSign, Headphones, UserCog, Settings,
  Menu, X, LogOut, Bell, Search, Download, CalendarDays, UserCheck
} from "lucide-react";
import { reunioes } from "@/lib/mock-data";
import { useLeadCount } from "@/hooks/useLeadCount";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { pageInfo } from "@/lib/mock-data";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const menuSections = [
  {
    label: "Principal",
    items: [
      { label: "Dashboard", icon: LayoutDashboard, path: "/" },
      { label: "Clientes", icon: Users, path: "/clientes" },
      { label: "Leads", icon: UserCheck, path: "/leads", badgeKey: "leads" as const },
      { label: "Projetos", icon: FolderKanban, path: "/projetos" },
      { label: "Pedidos", icon: ShoppingCart, path: "/pedidos", badge: 4 },
      { label: "Extras", icon: Plus, path: "/extras" },
    ],
  },
  {
    label: "Gestão",
    items: [
      { label: "Agenda", icon: CalendarDays, path: "/agenda", badge: reunioes.filter(r => r.data === new Date().toISOString().split("T")[0]).length || undefined },
      { label: "Relatórios", icon: BarChart3, path: "/relatorios" },
      { label: "Financeiro", icon: DollarSign, path: "/financeiro" },
      { label: "Suporte", icon: Headphones, path: "/suporte", badge: 3 },
      { label: "Usuários", icon: UserCog, path: "/usuarios" },
    ],
  },
  {
    label: "Sistema",
    items: [
      { label: "Configurações", icon: Settings, path: "/configuracoes" },
    ],
  },
];

function SidebarContent({ currentPath, onNavigate }: { currentPath: string; onNavigate?: () => void }) {
  return (
    <div className="flex flex-col h-full bg-[hsl(var(--sidebar-background))]">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-[hsl(var(--sidebar-border))]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
            <span className="text-white font-bold text-xs">NW</span>
          </div>
          <div>
            <span className="text-base font-bold">
              <span className="gradient-text">Novaes</span>
              <span className="text-white">Web</span>
            </span>
            <p className="text-[10px] text-[hsl(var(--sidebar-foreground))] tracking-widest uppercase">Painel ADM</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 space-y-5 overflow-y-auto">
        {menuSections.map((section) => (
          <div key={section.label}>
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[hsl(var(--sidebar-foreground))] px-3 mb-2">
              {section.label}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const isActive = currentPath === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={onNavigate}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-sm font-medium transition-all duration-200 relative",
                      isActive
                        ? "gradient-primary text-white shadow-lg shadow-red-500/20"
                        : "text-[hsl(var(--sidebar-foreground))] hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-accent-foreground))]"
                    )}
                  >
                    <item.icon className="w-[18px] h-[18px] shrink-0" />
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="ml-auto min-w-[20px] h-5 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold px-1.5">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div className="px-3 py-3 border-t border-[hsl(var(--sidebar-border))]">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center shrink-0">
            <span className="text-white text-xs font-bold">NV</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">Novaes</p>
            <p className="text-[11px] text-[hsl(var(--sidebar-foreground))]">Administrador</p>
          </div>
          <button className="text-[hsl(var(--sidebar-foreground))] hover:text-white transition-colors">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Brand footer */}
      <div className="gradient-primary py-2 px-4">
        <p className="text-center text-white text-[10px] tracking-[0.1em] font-medium">
          NovaesWeb © 2025
        </p>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const currentPath = location.pathname;
  const info = pageInfo[currentPath] || { titulo: "Página", subtitulo: "" };
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-[220px] shrink-0 flex-col">
        <SidebarContent currentPath={currentPath} />
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-16 shrink-0 border-b border-[hsl(var(--border))] bg-[hsl(var(--card))] flex items-center px-4 lg:px-6 gap-4">
          {/* Mobile menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <button className="lg:hidden text-[hsl(var(--muted-foreground))] hover:text-white">
                <Menu className="w-5 h-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-[260px] border-0">
              <SidebarContent currentPath={currentPath} onNavigate={() => setMobileOpen(false)} />
            </SheetContent>
          </Sheet>

          {/* Page title */}
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-bold text-white truncate">{info.titulo}</h1>
            <p className="text-xs text-[hsl(var(--muted-foreground))] truncate">{info.subtitulo}</p>
          </div>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--muted-foreground))]" />
              <Input placeholder="Buscar..." className="pl-9 w-48 h-9 glass-input text-sm rounded-lg border-0" />
            </div>
            <Button variant="outline" size="sm" className="glass-input border-0 text-[hsl(var(--muted-foreground))] hover:text-white h-9">
              <Download className="w-4 h-4 mr-1.5" /> Exportar
            </Button>
            <Button size="sm" className="gradient-primary border-0 text-white h-9 rounded-lg">
              <Plus className="w-4 h-4 mr-1.5" /> Novo
            </Button>
          </div>

          {/* Notifications & Avatar */}
          <button className="relative text-[hsl(var(--muted-foreground))] hover:text-white transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-[9px] text-white font-bold">3</span>
          </button>
          <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center">
            <span className="text-white text-xs font-bold">NV</span>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 lg:p-6 max-w-[1400px]">
            {children}
          </div>

          {/* Footer */}
          <div className="gradient-primary py-2.5 px-4 mt-6">
            <p className="text-center text-white text-xs tracking-[0.1em] font-medium">
              NovaesWeb © 2025 — Painel Administrativo
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
