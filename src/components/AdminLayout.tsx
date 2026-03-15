import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Users, FolderKanban, ShoppingCart, Plus,
  BarChart3, DollarSign, Headphones, UserCog, Settings,
  Menu, X, LogOut, Bell, Search, Download, CalendarDays, UserCheck,
  Sun, Moon, Puzzle
} from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { useLeadCount } from "@/hooks/useLeadCount";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { pageInfo } from "@/lib/mock-data";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import TopProgressBar from "@/components/TopProgressBar";

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
  { href: "/admin/leads", label: "Leads", icon: Headphones, count: 0 },
  { href: "/admin/agenda", label: "Agenda", icon: CalendarDays },
  { href: "/admin/relatorios", label: "Relatórios", icon: BarChart3 },
  { href: "/admin/financeiro", label: "Financeiro", icon: DollarSign },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const leadCount = useLeadCount();
  const { theme, toggle } = useTheme();

  return (
    <div className="flex h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))] ambient-glow">
      <aside className="w-64 border-r border-[hsl(var(--border))] py-4 hidden md:block">
        <div className="px-6 pb-4">
          <Link to="/admin" className="flex items-center gap-2 font-semibold">
            <img src="/logo.svg" alt="Logotipo" className="w-8 h-8" />
            <span>Painel Admin</span>
          </Link>
        </div>
        <nav className="space-y-0.5">
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
      </aside>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild className="md:hidden">
          <Button variant="ghost" size="icon"><Menu className="w-5 h-5" /></Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 border-r border-[hsl(var(--border))] px-0 pt-4">
          <div className="px-6 pb-4">
            <Link to="/admin" className="flex items-center gap-2 font-semibold">
              <img src="/logo.svg" alt="Logotipo" className="w-8 h-8" />
              <span>Painel Admin</span>
            </Link>
          </div>
          <nav className="space-y-0.5">
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
        </SheetContent>
      </Sheet>
      <main className="flex-1 p-6 relative overflow-auto">
        <TopProgressBar />
        <header className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-semibold">{pageInfo[pathname as keyof typeof pageInfo]?.titulo}</h1>
            {pageInfo[pathname as keyof typeof pageInfo]?.subtitulo && (
              <p className="text-sm text-[hsl(var(--muted-foreground))]">{pageInfo[pathname as keyof typeof pageInfo]?.subtitulo}</p>
            )}
          </div>
          <div className="flex items-center gap-4">
            <Input type="search" placeholder="Pesquisar..." className="max-w-xs glass-input border-0" />
            <Button variant="ghost" size="icon" onClick={toggle} title={theme === "dark" ? "Modo claro" : "Modo escuro"}>
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
            <Button variant="ghost" size="icon"><Bell className="w-5 h-5" /></Button>
            <Button variant="ghost" size="icon"><Settings className="w-5 h-5" /></Button>
          </div>
        </header>
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15, ease: "easeInOut" }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
