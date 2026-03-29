import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import GlobalSearch from "@/components/GlobalSearch";
import NotificationCenter from "@/components/NotificationCenter";
import { useTheme } from "@/hooks/useTheme";
import { pageInfo } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Sun, Moon, Settings, Bell } from "lucide-react";
import { sendTestNotification } from "@/lib/push-notifications";
import { useToast } from "@/hooks/use-toast";

interface AdminHeaderProps {
  title?: string;
  subtitle?: string;
}

export default function AdminHeader({ title, subtitle }: AdminHeaderProps) {
  const navigate = useNavigate();
  const { theme, toggle } = useTheme();
  const { pathname } = useLocation();
  const { toast } = useToast();

  const pageTitle = title || pageInfo[pathname as keyof typeof pageInfo]?.titulo || "Painel Admin";
  const pageSubtitle = subtitle || "novaesweb • Gestão Digital";

  return (
    <header className="h-20 flex items-center justify-between px-6 lg:px-10 sticky top-0 z-40 bg-[var(--admin-bg)]/80 backdrop-blur-xl border-b border-white/[0.06]">
      {/* Top gold line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#FFB800]/30 to-transparent" />
      
      <div className="flex items-center gap-4">
        <div className="hidden md:flex flex-col">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold tracking-tight text-foreground/90" role="heading" aria-level={1}>
              {pageTitle}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full border border-[#7b1fa2]/30 bg-gradient-to-r from-[#7b1fa2] via-[#c2185b] to-[#e8334a] text-[9px] font-black text-white uppercase tracking-[0.2em] shadow-[0_0_15px_rgba(123,31,162,0.3)]">v10.0 ARCHITECT PREMIUM</span>
          </div>
          <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-[0.1em]">{pageSubtitle}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* System Status Indicator */}
        <div className="hidden sm:flex items-center gap-2 mr-2 px-3 py-1.5 rounded-xl bg-emerald-500/5 border border-emerald-500/10 transition-all hover:bg-emerald-500/10 group/status" role="status" aria-label="Status do sistema">
          <div className="relative flex items-center justify-center">
            <div className="absolute w-2 h-2 bg-emerald-500 rounded-full animate-ping opacity-75" />
            <div className="relative w-1.5 h-1.5 bg-emerald-500 rounded-full" />
          </div>
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-400 group-hover/status:text-emerald-300 transition-colors">Sistema: Live</span>
        </div>

        <GlobalSearch />
        <div className="h-4 w-px bg-white/10 mx-2 hidden sm:block" />
        <div className="flex items-center gap-1.5 bg-white/[0.03] p-1 rounded-xl border border-white/[0.06]">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-lg" 
            onClick={toggle}
            aria-label={`Alternar tema para ${theme === 'dark' ? 'claro' : 'escuro'}`}
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>
          <NotificationCenter userType="admin" userId="admin" />
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-lg" 
            onClick={() => navigate("/admin/configuracoes")}
            aria-label="Configurações"
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
