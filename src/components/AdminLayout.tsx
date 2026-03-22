import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Users, FolderKanban, ShoppingCart, Plus,
  BarChart3, DollarSign, Headphones, UserCog, Settings,
  Menu, X, LogOut, Bell, Search, Download, CalendarDays, UserCheck,
  Sun, Moon, Puzzle, FileText, MessageSquareQuote, UtensilsCrossed
} from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { useLeadCount } from "@/hooks/useLeadCount";
import nwLogo from "@/assets/novaesweb-symbol.jpeg";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { pageInfo } from "@/lib/mock-data";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import TopProgressBar from "@/components/TopProgressBar";
import NotificationCenter from "@/components/NotificationCenter";
import GlobalSearch from "@/components/GlobalSearch";
import { ReloadPrompt } from "./ReloadPrompt";

interface NavItem {
  href: string;
  label: string;
  icon: any;
  count?: number;
}

const navItems: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/clientes", label: "Clientes", icon: Users },
  { href: "/admin/projetos", label: "Projetos", icon: FolderKanban },
  { href: "/admin/pedidos", label: "Pedidos", icon: ShoppingCart },
  { href: "/admin/extras", label: "Extras", icon: Puzzle },
  { href: "/admin/leads", label: "Leads", icon: Headphones, count: 0 },
  { href: "/admin/agenda", label: "Agenda", icon: CalendarDays },
  { href: "/admin/relatorios", label: "Relatórios", icon: BarChart3 },
  { href: "/admin/financeiro", label: "Financeiro", icon: DollarSign },
  { href: "/admin/suporte", label: "Suporte", icon: Headphones },
  { href: "/admin/usuarios", label: "Usuários", icon: UserCog },
  { href: "/admin/revenda", label: "Revenda", icon: Users },
  { href: "/admin/contratos", label: "Contratos", icon: FileText },
];

import { useBranding } from "@/hooks/useBranding";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const leadCount = useLeadCount();
  const { theme, toggle } = useTheme();
  const branding = useBranding();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login");
  };

  return (
    <div className="flex h-screen text-[hsl(var(--foreground))] admin-layout-container">
      <ReloadPrompt />
      <aside className="w-64 border-r border-[hsl(var(--border))] py-4 hidden md:flex md:flex-col">
        <div className="px-6 pb-4">
          <Link to="/admin" className="flex items-center gap-2 font-semibold">
            {branding.logo ? (
              <img src={branding.logo} alt={branding.nome} className="w-8 h-8 rounded-lg object-cover" />
            ) : (
              <img src={nwLogo} alt="NovaesWeb" className="w-8 h-8 rounded-lg object-cover" />
            )}
            <span>{branding.nome || "Painel Admin"}</span>
          </Link>
        </div>
        <nav className="space-y-0.5 flex-1">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link key={item.href} to={item.href} className={cn("group flex items-center gap-2 px-6 py-3 text-sm font-medium transition-all hover:bg-[hsl(var(--card))] hover:text-[hsl(var(--primary))]", isActive ? "bg-[hsl(var(--card))] text-[hsl(var(--primary))]" : "text-[hsl(var(--muted-foreground))]")}>
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
                {item.count !== undefined && item.count > 0 && (
                  <span className="ml-auto w-5 h-5 flex items-center justify-center rounded-full bg-[hsl(var(--primary))] text-white text-[0.6rem]">{leadCount}</span>
                )}
              </Link>
            );
          })}
        </nav>
        <div className="px-6 pt-2 border-t border-[hsl(var(--border))]">
          <button onClick={handleLogout} className="flex items-center gap-2 px-0 py-3 text-sm font-medium text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--destructive))] transition-colors w-full">
            <LogOut className="w-4 h-4" />
            <span>Sair do Painel</span>
          </button>
        </div>
      </aside>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild className="md:hidden">
          <Button variant="ghost" size="icon"><Menu className="w-5 h-5" /></Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 border-r border-[hsl(var(--border))] px-0 pt-4">
          <div className="px-6 pb-4">
            <Link to="/admin" className="flex items-center gap-2 font-semibold" onClick={() => setOpen(false)}>
              {branding.logo ? (
                <img src={branding.logo} alt={branding.nome} className="w-8 h-8 rounded-lg object-cover" />
              ) : (
                <img src={nwLogo} alt="NovaesWeb" className="w-8 h-8 rounded-lg object-cover" />
              )}
              <span>{branding.nome || "Painel Admin"}</span>
            </Link>
          </div>
          <nav className="space-y-0.5 flex-1">
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link key={item.href} to={item.href} onClick={() => setOpen(false)} className={cn("group flex items-center gap-2 px-6 py-3 text-sm font-medium transition-all hover:bg-[hsl(var(--card))] hover:text-[hsl(var(--primary))]", isActive ? "bg-[hsl(var(--card))] text-[hsl(var(--primary))]" : "text-[hsl(var(--muted-foreground))]")}>
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                  {item.count !== undefined && item.count > 0 && (
                    <span className="ml-auto w-5 h-5 flex items-center justify-center rounded-full bg-[hsl(var(--primary))] text-white text-[0.6rem]">{leadCount}</span>
                  )}
                </Link>
              );
            })}
          </nav>
          <div className="px-6 pt-2 border-t border-[hsl(var(--border))]">
            <button onClick={handleLogout} className="flex items-center gap-2 px-0 py-3 text-sm font-medium text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--destructive))] transition-colors w-full">
              <LogOut className="w-4 h-4" />
              <span>Sair do Painel</span>
            </button>
          </div>
        </SheetContent>
      </Sheet>
      <main className="flex-1 p-6 relative overflow-auto">
        <TopProgressBar />
        <header className="flex items-center justify-between mb-6 max-w-[1400px] mx-auto w-full">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-semibold">{pageInfo[pathname as keyof typeof pageInfo]?.titulo}</h1>
            {pageInfo[pathname as keyof typeof pageInfo]?.subtitulo && (
              <p className="text-sm text-[hsl(var(--muted-foreground))] hidden lg:block">{pageInfo[pathname as keyof typeof pageInfo]?.subtitulo}</p>
            )}
          </div>
          <div className="flex items-center gap-4">
            <GlobalSearch />
            <Button variant="ghost" size="icon" onClick={toggle} title={theme === "dark" ? "Modo claro" : "Modo escuro"}>
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
            <NotificationCenter userType="admin" userId="admin" />
            <Button variant="ghost" size="icon" onClick={() => navigate("/admin/configuracoes")}><Settings className="w-5 h-5" /></Button>
          </div>
        </header>
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15, ease: "easeInOut" }}
            className="max-w-[1400px] mx-auto w-full"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
