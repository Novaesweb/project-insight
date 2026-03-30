import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Users, FolderKanban, ShoppingCart, Plus,
  BarChart3, DollarSign, Headphones, UserCog, Settings, ShieldCheck,
  LogOut, CalendarDays, UserCheck,
  Sun, Moon, Puzzle, FileText, MessageSquareQuote, UtensilsCrossed,
  ChevronLeft, ChevronRight
} from "lucide-react";
import { useUI } from "@/store";
import { useLeadCount } from "@/hooks/useLeadCount";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { pageInfo } from "@/lib/constants";
import adminTopLogo from "@/assets/admin-top-logo.png";
import nwLogo from "@/assets/novaesweb-logo-admin.webp";

interface NavItem {
  href: string;
  label: string;
  icon: any;
  count?: number;
  gold?: boolean;
}

const navItems: NavItem[] = [
  { href: "/admin", label: "Inteligência", icon: LayoutDashboard },
  { href: "/admin/clientes", label: "Clientes", icon: Users },
  { href: "/admin/leads", label: "Leads", icon: Headphones, count: 0 },
  { href: "/admin/projetos", label: "Projetos", icon: FolderKanban },
  { href: "/admin/pedidos", label: "Pedidos", icon: ShoppingCart },
  { href: "/admin/calculadora", label: "Calculadora", icon: DollarSign, gold: true },
  { href: "/admin/extras", label: "Extras", icon: Puzzle, gold: true },
  { href: "/admin/agenda", label: "Agenda", icon: CalendarDays },
  { href: "/admin/relatorios", label: "Performance & ROI", icon: BarChart3 },
  { href: "/admin/financeiro", label: "Fluxo de Valor", icon: DollarSign, gold: true },
  { href: "/admin/suporte", label: "Engenharia de Evolução", icon: Headphones },
  { href: "/admin/usuarios", label: "Usuários", icon: UserCog },
  { href: "/admin/revenda", label: "Revenda", icon: Users },
  { href: "/admin/contratos", label: "Blindagem de Ativos", icon: ShieldCheck },
];

interface AdminSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  branding: {
    logo: string;
    nome: string;
  };
}

export default function AdminSidebar({ isCollapsed, onToggle, branding }: AdminSidebarProps) {
  const { pathname } = useLocation();
  const leadCount = useLeadCount();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/admin/login";
  };

  return (
    <motion.aside
      animate={{ width: isCollapsed ? 64 : 260 }}
      className="border-r border-white/[0.06] bg-[var(--admin-surface)] hidden md:flex md:flex-col relative z-50 transition-all duration-300 ease-in-out shrink-0"
    >
      {/* Gradient line on left edge */}
      <div className="absolute top-0 left-0 w-[2px] h-full bg-gradient-to-b from-[#7b1fa2] via-[#c2185b] to-[#FFB800] opacity-40" />
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#7b1fa2]/[0.04] via-transparent to-[#FFB800]/[0.03] pointer-events-none" />

      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-20 w-6 h-6 bg-[var(--admin-surface)] border border-white/10 rounded-full flex items-center justify-center text-white/40 hover:text-white hover:border-primary/50 transition-all z-50 shadow-lg"
        aria-label={isCollapsed ? "Expandir sidebar" : "Recolher sidebar"}
      >
        {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
      </button>

      <div className={cn("py-8 flex flex-col items-center justify-center", isCollapsed ? "px-0" : "px-6")}>
        <Link to="/admin" className={cn("flex flex-col items-center group", isCollapsed ? "gap-0" : "gap-5")}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative"
          >
            <div className="absolute -inset-2 bg-gradient-to-r from-[#7b1fa2] via-[#c2185b] to-[#e8334a] rounded-full blur-xl opacity-25 group-hover:opacity-50 transition duration-1000" />
            <img 
              src={adminTopLogo} 
              alt="NovaesWeb Premium" 
              className={cn(
                "relative rounded-full object-cover border border-white/10 shadow-2xl transition-transform duration-500 group-hover:scale-105",
                isCollapsed ? "w-10 h-10" : "w-28 h-28"
              )} 
            />
          </motion.div>
          
          {!isCollapsed && (
            <div className="flex flex-col items-center">
              <span className="text-lg font-black tracking-tighter bg-gradient-to-r from-white via-white to-white/40 bg-clip-text text-transparent italic leading-[0.8]">NovaesWeb</span>
              <span className="text-[8px] font-black uppercase tracking-[0.2em] mt-1.5 text-center bg-gradient-to-r from-[#7b1fa2] to-[#c2185b] text-white px-2.5 py-0.5 rounded-full shadow-[0_0_15px_rgba(194,24,91,0.3)]">Architect CEO Lucas Alencar</span>
            </div>
          )}
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto custom-scrollbar px-3 space-y-0.5" role="navigation" aria-label="Navegação principal">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
          const isGold = item.gold;

          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "group flex items-center px-3 py-2.5 text-[12px] font-medium transition-all relative rounded-xl",
                isActive
                  ? isGold
                    ? "text-[hsl(var(--gold))] bg-[hsl(var(--gold))]/10 shadow-[0_0_20px_rgba(255,184,0,0.08)]"
                    : "text-white bg-gradient-to-r from-[#7b1fa2]/80 via-[#c2185b]/80 to-[#e8334a]/80 shadow-lg shadow-[#c2185b]/20"
                  : "text-white/40 hover:text-white/80 hover:bg-white/[0.04]",
                isGold && !isActive && "text-[hsl(var(--gold))]/50 hover:text-[hsl(var(--gold))]/80",
                isCollapsed ? "justify-center gap-0" : "gap-3"
              )}
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
            >
              {isActive && (
                <motion.div
                  layoutId="activeNav"
                  className={cn(
                    "absolute left-0 w-1 h-5 rounded-r-full",
                    isGold ? "bg-gradient-to-b from-[#FFB800] to-[#FF8C00]" : "bg-gradient-to-b from-[#7b1fa2] to-[#e8334a]"
                  )}
                />
              )}
              <item.icon className={cn(
                "w-4 h-4 transition-transform duration-300 group-hover:scale-110 shrink-0",
                isActive ? (isGold ? "text-[hsl(var(--gold))]" : "text-white") : isGold ? "text-[hsl(var(--gold))]/40" : "text-white/30 group-hover:text-white/60"
              )} />
              {!isCollapsed && <span>{item.label}</span>}
              {!isCollapsed && item.count !== undefined && item.count > 0 && (
                <span className="ml-auto px-1.5 py-0.5 flex items-center justify-center rounded-full bg-primary text-white text-[9px] font-bold shadow-lg shadow-primary/20 animate-pulse" aria-label={`${leadCount} novos leads`}>{leadCount}</span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className={cn("p-4 border-t border-white/[0.06]", isCollapsed && "px-2")}>
        <button
          onClick={handleLogout}
          className={cn(
            "flex items-center px-3 py-2.5 text-xs font-medium text-white/40 hover:text-destructive hover:bg-destructive/5 transition-all w-full rounded-xl",
            isCollapsed ? "justify-center gap-0" : "gap-3"
          )}
          aria-label="Sair do painel"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span>Sair do Painel</span>}
        </button>
      </div>
    </motion.aside>
  );
}
