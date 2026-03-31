import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard, Users, FolderKanban, ShoppingCart,
  BarChart3, DollarSign, Headphones, UserCog, Settings,
  LogOut, CalendarDays, Puzzle, ShieldCheck,
  ChevronLeft, ChevronRight, Sparkles, TrendingUp
} from "lucide-react";
import { useLeadCount } from "@/hooks/useLeadCount";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface NavGroup {
  title: string;
  items: { href: string; label: string; icon: any; count?: number; accent?: boolean }[];
}

const navGroups: NavGroup[] = [
  {
    title: "Principal",
    items: [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
      { href: "/admin/clientes", label: "Clientes", icon: Users },
      { href: "/admin/leads", label: "Leads", icon: Headphones, count: 0 },
      { href: "/admin/projetos", label: "Projetos", icon: FolderKanban },
    ],
  },
  {
    title: "Operações",
    items: [
      { href: "/admin/pedidos", label: "Pedidos", icon: ShoppingCart },
      { href: "/admin/extras", label: "Extras", icon: Puzzle, accent: true },
      { href: "/admin/recurrent-billing", label: "Cobranças Recorrentes", icon: TrendingUp },
    ],
  },
  {
    title: "Gestão",
    items: [
      { href: "/admin/financeiro", label: "Financeiro", icon: DollarSign, accent: true },
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

interface AdminSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  branding: { logo: string; nome: string };
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
      animate={{ width: isCollapsed ? 72 : 264 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="hidden md:flex md:flex-col relative z-50 shrink-0 h-screen"
      style={{
        background: 'hsl(var(--background))',
        borderRight: '1px solid hsl(var(--border))',
      }}
    >
      {/* Accent line */}
      <div className="absolute top-0 left-0 w-[2px] h-full opacity-50"
        style={{ background: 'linear-gradient(180deg, hsl(var(--primary)), hsl(var(--accent)), transparent)' }} />

      {/* Toggle */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full flex items-center justify-center z-50 transition-all"
        style={{
          background: 'hsl(var(--secondary))',
          border: '1px solid hsl(var(--border))',
          color: 'hsl(var(--muted-foreground))',
        }}
        aria-label={isCollapsed ? "Expandir" : "Recolher"}
      >
        {isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>

      {/* Logo */}
      <div className={cn("py-6 flex items-center border-b", isCollapsed ? "px-0 justify-center" : "px-5 gap-3")}
        style={{ borderColor: 'hsl(var(--border))' }}>
        <Link to="/admin" className="flex items-center gap-3 group">
          <div className="relative">
            <div className="absolute -inset-1 rounded-xl blur-lg opacity-20 group-hover:opacity-40 transition-opacity"
              style={{ background: 'var(--gradient-primary)' }} />
            <div className={cn(
              "rounded-xl flex items-center justify-center relative",
              isCollapsed ? "w-10 h-10" : "w-10 h-10"
            )} style={{ background: 'var(--gradient-primary)' }}>
              <Sparkles className="w-5 h-5 text-white" />
            </div>
          </div>
          {!isCollapsed && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
              <p className="text-sm font-extrabold tracking-tight text-foreground leading-none">NovaesWeb</p>
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground mt-0.5">Admin Panel</p>
            </motion.div>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5 custom-scrollbar" role="navigation">
        {navGroups.map((group) => (
          <div key={group.title}>
            {!isCollapsed && (
              <p className="text-[9px] font-bold uppercase tracking-[0.25em] px-3 mb-2 text-muted-foreground/50">
                {group.title}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={cn(
                      "group flex items-center py-2.5 text-[12px] font-medium transition-all relative rounded-xl",
                      isCollapsed ? "justify-center px-2" : "gap-3 px-3",
                      isActive
                        ? "text-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/50",
                      item.accent && !isActive && "text-amber-400/60 hover:text-amber-400"
                    )}
                    style={isActive ? {
                      background: 'hsl(var(--secondary))',
                      boxShadow: '0 0 0 1px hsl(var(--border))',
                    } : undefined}
                    aria-current={isActive ? "page" : undefined}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="adminNav"
                        className="absolute left-0 w-[3px] h-4 rounded-r-full"
                        style={{ background: 'var(--gradient-primary)' }}
                        transition={{ type: "spring", stiffness: 350, damping: 30 }}
                      />
                    )}
                    <item.icon className={cn(
                      "w-4 h-4 shrink-0 transition-all duration-200",
                      isActive ? "text-primary" : item.accent ? "text-amber-400/50" : "text-muted-foreground/60 group-hover:text-foreground/80"
                    )} />
                    {!isCollapsed && (
                      <span className="truncate">{item.label}</span>
                    )}
                    {!isCollapsed && item.href === "/admin/leads" && leadCount > 0 && (
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
      <div className={cn("p-3 border-t", isCollapsed && "px-2")} style={{ borderColor: 'hsl(var(--border))' }}>
        <button
          onClick={handleLogout}
          className={cn(
            "flex items-center py-2.5 text-xs font-medium text-muted-foreground hover:text-destructive transition-all w-full rounded-xl hover:bg-destructive/5",
            isCollapsed ? "justify-center px-2" : "gap-3 px-3"
          )}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span>Sair</span>}
        </button>
      </div>
    </motion.aside>
  );
}
