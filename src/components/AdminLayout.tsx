import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Users, FolderKanban, ShoppingCart, Plus,
  BarChart3, DollarSign, Headphones, UserCog, Settings,
  Menu, X, LogOut, Bell, Search, Download, CalendarDays, UserCheck,
  Sun, Moon, Puzzle, FileText, MessageSquareQuote, UtensilsCrossed,
  ChevronLeft, ChevronRight
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
import { useBranding } from "@/hooks/useBranding";

interface NavItem {
  href: string;
  label: string;
  icon: any;
  count?: number;
}

const navItems: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/clientes", label: "Clientes", icon: Users },
  { href: "/admin/leads", label: "Leads", icon: Headphones, count: 0 },
  { href: "/admin/projetos", label: "Projetos", icon: FolderKanban },
  { href: "/admin/pedidos", label: "Pedidos", icon: ShoppingCart },
  { href: "/admin/extras", label: "Extras", icon: Puzzle },
  { href: "/admin/agenda", label: "Agenda", icon: CalendarDays },
  { href: "/admin/relatorios", label: "Relatórios", icon: BarChart3 },
  { href: "/admin/financeiro", label: "Financeiro", icon: DollarSign },
  { href: "/admin/suporte", label: "Suporte", icon: Headphones },
  { href: "/admin/usuarios", label: "Usuários", icon: UserCog },
  { href: "/admin/revenda", label: "Revenda", icon: Users },
  { href: "/admin/contratos", label: "Contratos", icon: FileText },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
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
    <div className="flex h-screen bg-[#0a0a0c] text-white font-sora selection:bg-primary/30 overflow-hidden">
      {/* Sidebar Desktop */}
      <motion.aside 
        animate={{ width: isCollapsed ? 68 : 260 }}
        className="border-r border-white/5 bg-[#0a0a0c] hidden md:flex md:flex-col relative z-50 transition-all duration-300 ease-in-out shrink-0"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-accent/5 pointer-events-none" />
        
        {/* Toggle Button */}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-20 w-6 h-6 bg-[#1a1a1e] border border-white/10 rounded-full flex items-center justify-center text-white/40 hover:text-white hover:border-primary/50 transition-all z-50"
        >
          {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>

        <div className={cn("px-6 py-8 flex items-center gap-3", isCollapsed && "px-4 justify-center")}>
          <Link to="/admin" className="flex items-center gap-2 group">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
              {branding.logo ? (
                <img src={branding.logo} alt={branding.nome} className="relative w-8 h-8 rounded-lg object-cover" />
              ) : (
                <img src={nwLogo} alt="NovaesWeb" className="relative w-8 h-8 rounded-lg object-cover" />
              )}
            </div>
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="text-sm font-bold tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent italic leading-tight">NovaesWeb</span>
                <span className="text-[10px] text-primary font-bold uppercase tracking-[0.2em] -mt-0.5">Admin</span>
              </div>
            )}
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto custom-scrollbar px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const isGold = item.label === "Financeiro" || item.label === "Extras";
            
            return (
              <Link 
                key={item.href} 
                to={item.href} 
                className={cn(
                  "group flex items-center gap-3 px-3 py-2.5 text-[12px] font-medium transition-all relative rounded-xl",
                  isActive 
                    ? (isGold ? "text-[hsl(var(--gold))] bg-white/5 shadow-[0_0_20px_rgba(255,184,0,0.1)]" : "text-primary bg-primary/10") 
                    : "text-white/40 hover:text-white/80 hover:bg-white/5",
                  isGold && !isActive && "gold-item opacity-80 hover:opacity-100",
                  isCollapsed && "justify-center px-0"
                )}
              >
                {isActive && (
                  <motion.div 
                    layoutId="activeNav"
                    className={cn(
                      "absolute left-0 w-1 h-5 rounded-r-full",
                      isGold ? "sidebar-active-indicator-gold" : "sidebar-active-indicator"
                    )}
                  />
                )}
                <item.icon className={cn(
                  "w-4 h-4 transition-transform duration-300 group-hover:scale-110 shrink-0", 
                  isActive ? (isGold ? "text-[hsl(var(--gold))]" : "text-primary") : "text-white/30 group-hover:text-white/60",
                  isGold && "text-[hsl(var(--gold))/40]"
                )} />
                {!isCollapsed && <span>{item.label}</span>}
                {!isCollapsed && item.count !== undefined && item.count > 0 && (
                  <span className="ml-auto px-1.5 py-0.5 flex items-center justify-center rounded-full bg-primary text-white text-[9px] font-bold shadow-lg shadow-primary/20 animate-pulse">{leadCount}</span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className={cn("p-4 border-t border-white/5", isCollapsed && "px-2")}>
          <button 
            onClick={handleLogout} 
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 text-xs font-medium text-white/40 hover:text-destructive hover:bg-destructive/5 transition-all w-full rounded-xl",
              isCollapsed && "justify-center px-0"
            )}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span>Sair do Painel</span>}
          </button>
        </div>
      </motion.aside>

      {/* Mobile Trigger */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild className="md:hidden absolute top-4 left-4 z-50">
          <Button variant="ghost" size="icon" className="bg-[#1a1a1e] border border-white/10 rounded-xl"><Menu className="w-5 h-5" /></Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 bg-[#0a0a0c] border-r border-white/10 p-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-accent/5 pointer-events-none" />
          <div className="p-8">
             <Link to="/admin" className="flex items-center gap-3 mb-8" onClick={() => setOpen(false)}>
               <img src={branding.logo || nwLogo} className="w-8 h-8 rounded-lg" alt="" />
               <div className="flex flex-col">
                  <span className="text-sm font-bold tracking-tight italic">NovaesWeb</span>
                  <span className="text-[10px] text-primary font-bold uppercase tracking-widest">Admin</span>
                </div>
             </Link>
             <nav className="space-y-1">
               {navItems.map((item) => (
                 <Link 
                   key={item.href} 
                   to={item.href} 
                   onClick={() => setOpen(false)}
                   className={cn(
                     "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                     pathname.startsWith(item.href) ? "bg-primary/10 text-primary" : "text-white/40"
                   )}
                 >
                   <item.icon className="w-4 h-4" />
                   <span>{item.label}</span>
                 </Link>
               ))}
             </nav>
          </div>
        </SheetContent>
      </Sheet>

      {/* Main Content Area */}
      <main className="flex-1 relative flex flex-col min-w-0">
        <TopProgressBar />
        <header className="h-16 flex items-center justify-between px-6 lg:px-10 sticky top-0 z-40 bg-[#0a0a0c]/80 backdrop-blur-xl border-b border-white/5">
          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col">
              <h1 className="text-sm font-bold tracking-tight text-white/90">
                {pageInfo[pathname as keyof typeof pageInfo]?.titulo || "Painel Admin"}
              </h1>
              <p className="text-[10px] text-white/30 font-medium uppercase tracking-[0.1em]">NovaesWeb • Gestão Digital</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <GlobalSearch />
            <div className="h-4 w-px bg-white/10 mx-2 hidden sm:block" />
            <div className="flex items-center gap-1.5 bg-white/5 p-1 rounded-xl border border-white/5">
              <Button variant="ghost" size="icon" className="h-8 w-8 text-white/40 hover:text-white rounded-lg" onClick={toggle}>
                {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>
              <NotificationCenter userType="admin" userId="admin" />
              <Button variant="ghost" size="icon" className="h-8 w-8 text-white/40 hover:text-white rounded-lg" onClick={() => navigate("/admin/configuracoes")}><Settings className="w-4 h-4" /></Button>
            </div>
          </div>
        </header>

        <section className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-10">
          <div className="ambient-glow" />
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="relative z-10 max-w-7xl mx-auto"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </section>
      </main>
    </div>
  );
}
