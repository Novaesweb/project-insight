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
    <div className="flex h-screen text-[hsl(var(--foreground))] admin-layout-container font-sora selection:bg-primary/30">
      <ReloadPrompt />
      <aside className="w-64 border-r border-white/5 bg-black/20 backdrop-blur-2xl py-4 hidden md:flex md:flex-col relative z-50">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-accent/5 pointer-events-none" />
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
              <Link 
                key={item.href} 
                to={item.href} 
                className={cn(
                  "group flex items-center gap-3 px-6 py-3.5 text-sm font-medium transition-all relative overflow-hidden",
                  isActive 
                    ? "text-primary bg-primary/10" 
                    : "text-white/40 hover:text-white/80 hover:bg-white/5"
                )}
              >
                {isActive && (
                  <motion.div 
                    layoutId="activeNav"
                    className="absolute left-0 w-1 h-6 bg-primary rounded-r-full shadow-[0_0_15px_rgba(255,51,102,0.8)]"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  />
                )}
                <item.icon className={cn("w-4.5 h-4.5 transition-transform duration-300 group-hover:scale-110", isActive ? "text-primary" : "text-white/30 group-hover:text-white/60")} />
                <span>{item.label}</span>
                {item.count !== undefined && item.count > 0 && (
                  <span className="ml-auto px-2 py-0.5 flex items-center justify-center rounded-full bg-primary text-white text-[10px] font-bold shadow-lg shadow-primary/20 animate-pulse">{leadCount}</span>
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
        <header className="flex items-center justify-between mb-8 max-w-[1400px] mx-auto w-full sticky top-0 z-40 bg-transparent py-4">
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <h1 className="text-3xl font-bold tracking-tight text-white drop-shadow-md">{pageInfo[pathname as keyof typeof pageInfo]?.titulo}</h1>
              {pageInfo[pathname as keyof typeof pageInfo]?.subtitulo && (
                <p className="text-sm text-white/40 font-medium hidden lg:block">{pageInfo[pathname as keyof typeof pageInfo]?.subtitulo}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white/5 backdrop-blur-xl p-1.5 rounded-2xl border border-white/10 shadow-2xl">
            <GlobalSearch />
            <div className="h-6 w-px bg-white/10 mx-1" />
            <Button variant="ghost" size="icon" className="h-9 w-9 text-white/50 hover:text-white hover:bg-white/10 rounded-xl transition-all" onClick={toggle} title={theme === "dark" ? "Modo claro" : "Modo escuro"}>
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
            <NotificationCenter userType="admin" userId="admin" />
            <Button variant="ghost" size="icon" className="h-9 w-9 text-white/50 hover:text-white hover:bg-white/10 rounded-xl transition-all" onClick={() => navigate("/admin/configuracoes")}><Settings className="w-5 h-5" /></Button>
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
